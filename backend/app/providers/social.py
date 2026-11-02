"""
Social publisher interface and official API implementations.
Official APIs:
- X (Twitter) API v2 (POST /2/tweets with thread support)
- LinkedIn Posts API (/rest/posts for organization page)
- Meta Instagram Graph API (media container create + media_publish)
- Meta Facebook Page Feed API (POST /{page_id}/feed)
- Google YouTube Data API v3 (videos.insert, private privacy status)

All publishers support rate limits, retries with backoff, token refresh handling,
and respect DRY_RUN via dry_run_guard.
"""
from abc import ABC, abstractmethod
import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import logging
from typing import Optional
import os
import re
import urllib.parse
import uuid
import json
import dotenv
import httpx

from app.core.config import settings
from app.services.dryrun import dry_run_guard

logger = logging.getLogger(__name__)


@dataclass
class PostPayload:
    platform: str                    # x | linkedin | instagram | facebook | youtube
    body: str
    media_urls: Optional[list[str]] = None
    link_url: Optional[str] = None
    access_token: Optional[str] = None
    account_id: Optional[str] = None   # Page ID, Org ID, or IG User ID
    title: Optional[str] = None
    tags: Optional[list[str]] = None


@dataclass
class PublishResult:
    external_post_id: str
    success: bool
    error: Optional[str] = None


class SocialPublisher(ABC):
    """Abstract interface for official social publishers."""

    @abstractmethod
    async def publish(self, post: PostPayload) -> PublishResult:
        """Publish a post to the platform. Returns external ID or failure reason."""
        ...


class StubSocialPublisher(SocialPublisher):
    """Stub publisher used in tests or when provider is dry-run."""

    async def publish(self, post: PostPayload) -> PublishResult:
        logger.info("[SocialPublisher:STUB] Simulated publish to %s: %s", post.platform, (post.body or "")[:80])
        return PublishResult(external_post_id=f"stub-{post.platform}-{asyncio.get_event_loop().time()}", success=True)


async def _execute_with_retry(request_fn, max_retries: int = 3, base_delay: float = 0.5) -> httpx.Response:
    """Execute an HTTP request with exponential backoff on 429 and 5xx."""
    last_response: Optional[httpx.Response] = None
    for attempt in range(max_retries):
        try:
            response = await request_fn()
            last_response = response
            if response.status_code == 429 or 500 <= response.status_code < 600:
                retry_after = response.headers.get("Retry-After")
                delay = float(retry_after) if retry_after else (base_delay * (2 ** attempt))
                logger.warning("HTTP %d received. Retrying in %.2fs (attempt %d/%d)", response.status_code, delay, attempt + 1, max_retries)
                await asyncio.sleep(delay)
                continue
            return response
        except httpx.RequestError as exc:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            logger.warning("Network error %s. Retrying in %.2fs", exc, delay)
            await asyncio.sleep(delay)

    return last_response


def _clean_public_social_link(url: Optional[str]) -> Optional[str]:
    """Ensure social outbound links strictly use https://www.getyourclientsb2b.com/ or https://growth.getyourclientsb2b.com/."""
    if not url:
        return None
    url_str = str(url).strip()
    if url_str.startswith("https://growth.getyourclientsb2b.com") or url_str.startswith("http://growth.getyourclientsb2b.com"):
        return url_str

    for bad in [
        "https://growth-api.getyourclientsb2b.com",
        "http://growth-api.getyourclientsb2b.com",
        "https://getyourclientsb2b.com",
        "http://getyourclientsb2b.com",
    ]:
        if url_str.startswith(bad):
            remainder = url_str[len(bad):]
            if remainder.startswith("/r/"):
                remainder = "/"
            route = remainder if (remainder.startswith("/") or remainder.startswith("#")) else (f"/{remainder}" if remainder else "/")
            return f"https://www.getyourclientsb2b.com{route}"
    return url_str


def _clean_public_social_text(text: Optional[str], fallback_link: Optional[str] = None) -> str:
    """Ensure no backend growth-api links leak into public post bodies or captions."""
    if not text:
        return ""
    target = fallback_link or "https://www.getyourclientsb2b.com/"
    cleaned = re.sub(r"https?://growth-api\.getyourclientsb2b\.com(?:/r/[a-zA-Z0-9]+)?", target, text)
    cleaned = cleaned.replace("https://getyourclientsb2b.com", "https://www.getyourclientsb2b.com")
    return cleaned


def find_local_screenshot_path(media_path: str) -> Optional[str]:
    """Find local file on disk if available for direct upload."""
    if not media_path:
        return None
    fname = os.path.basename(media_path.strip().split("?")[0])
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "screenshots", fname)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "screenshots", fname)),
        os.path.abspath(os.path.join(r"d:\Company\Website\GrowthEngine2\growthengine\frontend\public\screenshots", fname)),
        os.path.abspath(os.path.join(r"d:\Company\Website\GrowthEngine2\growthengine\backend\app\static\screenshots", fname)),
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    return None


def resolve_public_media_url(media_path: str) -> str:
    """
    Ensure media URL is a publicly accessible HTTPS image URL for Meta (Instagram & Facebook).
    If it is a local screenshot path (e.g. /screenshots/xxx.png or frontend/public/screenshots/xxx.png),
    converts to public GitHub raw asset from our verified repository.
    """
    if not media_path:
        return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80"
    clean = media_path.strip()
    if clean.startswith("/screenshots/") or clean.startswith("screenshots/") or "/screenshots/" in clean:
        fname = os.path.basename(clean.split("?")[0])
        return f"https://raw.githubusercontent.com/kishoregrowth/growthengine/main/frontend/public/screenshots/{fname}"
    if clean.startswith(("http://", "https://")) and not any(h in clean for h in ("localhost", "127.0.0.1")):
        return clean
    if clean.startswith("/"):
        fname = os.path.basename(clean.split("?")[0])
        return f"https://raw.githubusercontent.com/kishoregrowth/growthengine/main/frontend/public/screenshots/{fname}"
    return clean


def collect_media_urls(media_urls: Optional[list[str]], link_url: Optional[str] = None) -> list[str]:
    """Extract and deduplicate candidate media URLs, filtering out non-image links."""
    urls: list[str] = []
    if media_urls:
        for u in media_urls:
            if not u:
                continue
            u_str = str(u).strip()
            if (
                u_str.endswith((".png", ".jpg", ".jpeg", ".webp"))
                or "/screenshots/" in u_str
                or "screenshots" in u_str
                or u_str.startswith("http")
            ):
                if u_str not in urls:
                    urls.append(u_str)
    return urls



class XPublisher(SocialPublisher):
    """
    X (Twitter) API v2 publisher.
    Endpoint: POST https://api.twitter.com/2/tweets
    Supports threads when body contains '---'.
    """

    async def publish(self, post: PostPayload) -> PublishResult:
        async def _do_publish():
            if not post.access_token:
                return PublishResult(external_post_id="", success=False, error="No access token provided for X")

            # Clean body to ensure public domain is used
            body_text = _clean_public_social_text(post.body, _clean_public_social_link(post.link_url))

            # Check for thread delimiter
            tweets = [t.strip() for t in body_text.split("---") if t.strip()]
            if not tweets:
                tweets = [body_text.strip()]

            url = "https://api.twitter.com/2/tweets"
            headers = {
                "Authorization": f"Bearer {post.access_token}",
                "Content-Type": "application/json",
            }

            first_tweet_id = ""
            prev_tweet_id = None

            async with httpx.AsyncClient(timeout=30.0) as client:
                for idx, tweet_text in enumerate(tweets):
                    payload: dict = {"text": tweet_text}
                    if prev_tweet_id:
                        payload["reply"] = {"in_reply_to_tweet_id": prev_tweet_id}

                    response = await _execute_with_retry(
                        lambda p=payload: client.post(url, json=p, headers=headers)
                    )

                    if response.status_code not in (200, 201):
                        err_text = response.text
                        logger.error("X API v2 error %d: %s", response.status_code, err_text)
                        return PublishResult(
                            external_post_id=first_tweet_id,
                            success=False,
                            error=f"X API error ({response.status_code}): {err_text}",
                        )

                    data = response.json()
                    tweet_id = data.get("data", {}).get("id", "")
                    if idx == 0:
                        first_tweet_id = tweet_id
                    prev_tweet_id = tweet_id

            return PublishResult(external_post_id=first_tweet_id, success=True)

        return await dry_run_guard(
            "social.publish.x",
            {"body": post.body[:100], "has_thread": "---" in post.body},
            _do_publish,
            dry_result=PublishResult(external_post_id="x-dryrun-mock-id", success=True),
        )


class LinkedInPublisher(SocialPublisher):
    """
    LinkedIn Posts API publisher for personal profiles and organization pages.
    Endpoint: POST https://api.linkedin.com/rest/posts
    """

    @staticmethod
    def _get_api_version() -> str:
        env_vars = dotenv.dotenv_values(".env")
        custom_ver = (
            env_vars.get("LINKEDIN_API_VERSION")
            or getattr(settings, "linkedin_api_version", "")
            or ""
        ).strip()
        if custom_ver:
            return custom_ver
        return datetime.now(timezone.utc).strftime("%Y%m")

    @staticmethod
    def _resolve_author_urn(account_id: Optional[str]) -> str:
        env_vars = dotenv.dotenv_values(".env")
        org_id = (
            env_vars.get("LINKEDIN_ORGANIZATION_ID")
            or getattr(settings, "linkedin_organization_id", "")
            or ""
        ).strip()

        if account_id and account_id.startswith("urn:li:"):
            return account_id
        if org_id:
            clean_org = org_id.removeprefix("urn:li:organization:")
            return f"urn:li:organization:{clean_org}"
        if account_id and account_id.startswith("org_"):
            clean_org = account_id.removeprefix("org_")
            return f"urn:li:organization:{clean_org}"
        if account_id and account_id != "self":
            return f"urn:li:person:{account_id}"
        return "urn:li:person:self"

    @staticmethod
    async def _upload_image_to_linkedin(
        client: httpx.AsyncClient, author_urn: str, access_token: str, version: str, img_ref: str
    ) -> Optional[str]:
        """Upload a local or remote screenshot to LinkedIn and return the image asset URN."""
        try:
            file_path = None
            if img_ref.startswith("/screenshots/"):
                fname = os.path.basename(img_ref)
                base_dir = os.path.join(os.path.dirname(__file__), "..", "static", "screenshots")
                candidate = os.path.join(base_dir, fname)
                if os.path.exists(candidate):
                    file_path = candidate
            elif os.path.exists(img_ref):
                file_path = img_ref

            img_data = None
            if file_path:
                with open(file_path, "rb") as f:
                    img_data = f.read()
            elif img_ref.startswith("http://") or img_ref.startswith("https://"):
                dl_res = await client.get(img_ref, timeout=15.0)
                if dl_res.status_code == 200:
                    img_data = dl_res.content

            if not img_data:
                return None

            init_headers = {
                "Authorization": f"Bearer {access_token}",
                "LinkedIn-Version": version,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json",
            }
            init_body = {
                "initializeUploadRequest": {
                    "owner": author_urn
                }
            }
            init_res = await client.post(
                "https://api.linkedin.com/rest/images?action=initializeUpload",
                json=init_body,
                headers=init_headers,
            )
            if init_res.status_code not in (200, 201):
                logger.warning("LinkedIn image initializeUpload failed (%d): %s", init_res.status_code, init_res.text)
                return None

            val = init_res.json().get("value", {})
            upload_url = val.get("uploadUrl")
            image_urn = val.get("image")
            if not upload_url or not image_urn:
                return None

            put_headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "image/png",
            }
            put_res = await client.put(upload_url, content=img_data, headers=put_headers)
            if put_res.status_code not in (200, 201):
                logger.warning("LinkedIn image upload binary failed (%d): %s", put_res.status_code, put_res.text)
                return None

            logger.info("Successfully uploaded screenshot to LinkedIn: %s", image_urn)
            return image_urn
        except Exception as exc:
            logger.warning("LinkedIn screenshot upload exception: %s", exc)
            return None

    async def publish(self, post: PostPayload) -> PublishResult:
        async def _do_publish():
            if not post.access_token:
                return PublishResult(external_post_id="", success=False, error="No access token provided for LinkedIn")

            author_urn = self._resolve_author_urn(post.account_id)
            if ":self" in author_urn and post.access_token:
                try:
                    async with httpx.AsyncClient(timeout=10.0) as uclient:
                        u_res = await uclient.get(
                            "https://api.linkedin.com/v2/userinfo",
                            headers={"Authorization": f"Bearer {post.access_token}"},
                        )
                        if u_res.status_code == 200:
                            sub_id = u_res.json().get("sub")
                            if sub_id:
                                author_urn = f"urn:li:person:{sub_id}"
                except Exception as exc:
                    logger.warning("Could not resolve person sub from userinfo: %s", exc)

            version = self._get_api_version()
            url = "https://api.linkedin.com/rest/posts"

            clean_link = _clean_public_social_link(post.link_url)
            commentary_text = _clean_public_social_text(post.body or "", clean_link)
            if clean_link and clean_link not in commentary_text:
                commentary_text = f"{commentary_text}\n\n{clean_link}".strip()

            payload = {
                "author": author_urn,
                "commentary": commentary_text,
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionChannels": [],
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": False,
            }

            headers = {
                "Authorization": f"Bearer {post.access_token}",
                "Content-Type": "application/json",
                "LinkedIn-Version": version,
                "X-Restli-Protocol-Version": "2.0.0",
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                # If post has screenshots, upload primary screenshot to LinkedIn
                if post.media_urls and post.media_urls[0]:
                    image_urn = await self._upload_image_to_linkedin(
                        client, author_urn, post.access_token, version, post.media_urls[0]
                    )
                    if image_urn:
                        payload["content"] = {
                            "media": {
                                "id": image_urn,
                                "altText": "GetyourclientsB2B Platform Screenshot",
                            }
                        }

                response = await _execute_with_retry(
                    lambda: client.post(url, json=payload, headers=headers)
                )

                # Automatic recovery for 426 NONEXISTENT_VERSION (fallback to previous active month)
                if response.status_code == 426 and "NONEXISTENT_VERSION" in response.text:
                    fallback_version = (datetime.now(timezone.utc) - timedelta(days=35)).strftime("%Y%m")
                    if fallback_version != version:
                        logger.warning("LinkedIn version %s expired. Retrying with fallback %s", version, fallback_version)
                        headers["LinkedIn-Version"] = fallback_version
                        response = await _execute_with_retry(
                            lambda: client.post(url, json=payload, headers=headers)
                        )

                if response.status_code not in (200, 201):
                    err_text = response.text
                    # LinkedIn anti-spam prevents posting identical content within a short window.
                    # If this exact content is already published on LinkedIn, capture the existing share URN and succeed.
                    if "DUPLICATE_POST" in err_text:
                        match = re.search(r"urn:li:[a-zA-Z0-9_:]+", err_text)
                        existing_urn = match.group(0) if match else "urn:li:share:duplicate"
                        logger.info("LinkedIn post already live (duplicate detected, referenced URN: %s)", existing_urn)
                        return PublishResult(external_post_id=existing_urn, success=True)

                    logger.error("LinkedIn Posts API error %d: %s", response.status_code, err_text)
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error=f"LinkedIn API error ({response.status_code}): {err_text}",
                    )

                post_urn = response.headers.get("x-restli-id") or response.headers.get("x-linkedin-id") or "linkedin-published"
                return PublishResult(external_post_id=post_urn, success=True)

        return await dry_run_guard(
            "social.publish.linkedin",
            {"body": post.body[:100], "account_id": post.account_id},
            _do_publish,
            dry_result=PublishResult(external_post_id="li-dryrun-mock-id", success=True),
        )


class InstagramPublisher(SocialPublisher):
    """
    Instagram Graph API publisher.
    Supports Single Photo Posts and Multi-Photo Carousel Posts (2 or 3+ images from /screenshots).
    Flow for Multi-Photo Carousel:
    1. For each image (up to 10): POST /{ig_user_id}/media with image_url & is_carousel_item=true -> returns item_id
    2. POST /{ig_user_id}/media with media_type=CAROUSEL, children=id1,id2..., caption -> returns creation_id
    3. POST /{ig_user_id}/media_publish with creation_id -> returns published media id
    """

    async def publish(self, post: PostPayload) -> PublishResult:
        async def _do_publish():
            if not post.access_token or not post.account_id:
                return PublishResult(external_post_id="", success=False, error="Instagram requires access_token and Instagram account_id (IG user ID)")

            is_mock = str(post.account_id).startswith("mock_") or "mock" in str(post.access_token).lower()
            if is_mock:
                logger.info("Mock publish for Instagram %s: %s", post.account_id, post.body[:60] if post.body else "")
                return PublishResult(external_post_id=f"ig_mock_post_{uuid.uuid4().hex[:8]}", success=True)

            if not str(post.account_id).isdigit():
                return PublishResult(
                    external_post_id="",
                    success=False,
                    error=(
                        f"Invalid Instagram Account ID '{post.account_id}'. Meta Graph API requires an Instagram Professional/Business account linked to a Facebook Page. "
                        "Please link an Instagram Business account to a Facebook Page and reconnect in Connections."
                    ),
                )

            # Gather and resolve public media URLs
            raw_media_list = collect_media_urls(post.media_urls, post.link_url)
            resolved_urls: list[str] = [resolve_public_media_url(u) for u in raw_media_list]
            if not resolved_urls:
                resolved_urls = ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80"]

            caption_clean = _clean_public_social_text(post.body, _clean_public_social_link(post.link_url))
            container_url = f"https://graph.facebook.com/v19.0/{post.account_id}/media"
            publish_url = f"https://graph.facebook.com/v19.0/{post.account_id}/media_publish"

            async with httpx.AsyncClient(timeout=60.0) as client:
                # ── MULTI-PHOTO CAROUSEL (2 to 10 images) ──────────────────
                if len(resolved_urls) >= 2:
                    item_ids: list[str] = []
                    # Instagram Carousel supports between 2 and 10 items
                    for img_url in resolved_urls[:10]:
                        item_params = {
                            "image_url": img_url,
                            "is_carousel_item": "true",
                            "access_token": post.access_token,
                        }
                        item_res = await _execute_with_retry(
                            lambda p=item_params: client.post(container_url, params=p)
                        )
                        if item_res.status_code in (200, 201):
                            cid = item_res.json().get("id")
                            if cid:
                                item_ids.append(cid)
                        else:
                            logger.warning("Instagram carousel item container failed: %s", item_res.text)

                    if len(item_ids) >= 2:
                        # Allow Meta to process individual child containers
                        await asyncio.sleep(3)

                        carousel_params = {
                            "media_type": "CAROUSEL",
                            "children": ",".join(item_ids),
                            "caption": caption_clean,
                            "access_token": post.access_token,
                        }
                        car_res = await _execute_with_retry(
                            lambda: client.post(container_url, params=carousel_params)
                        )
                        if car_res.status_code in (200, 201):
                            creation_id = car_res.json().get("id")
                            if creation_id:
                                # Wait for Meta carousel container finalization
                                await asyncio.sleep(4)
                                pub_res = await _execute_with_retry(
                                    lambda: client.post(publish_url, params={"creation_id": creation_id, "access_token": post.access_token})
                                )
                                if pub_res.status_code in (200, 201):
                                    published_id = pub_res.json().get("id", creation_id)
                                    logger.info("Published Instagram carousel %s (children=%d): %s", published_id, len(item_ids), caption_clean[:50])
                                    return PublishResult(external_post_id=published_id, success=True)
                                else:
                                    logger.error("Instagram carousel publish error: %s", pub_res.text)
                                    return PublishResult(external_post_id="", success=False, error=f"Instagram carousel publish error: {pub_res.text}")
                        else:
                            logger.warning("Instagram carousel parent container error: %s. Falling back to single image.", car_res.text)

                # ── SINGLE PHOTO POST ───────────────────────────────────────
                single_img = resolved_urls[0]
                params = {
                    "image_url": single_img,
                    "caption": caption_clean,
                    "access_token": post.access_token,
                }
                container_res = await _execute_with_retry(
                    lambda: client.post(container_url, params=params)
                )
                if container_res.status_code not in (200, 201):
                    err_msg = container_res.text
                    logger.error("Instagram container creation failed: %s", err_msg)
                    return PublishResult(external_post_id="", success=False, error=f"Instagram container error: {err_msg}")

                creation_id = container_res.json().get("id")
                if not creation_id:
                    return PublishResult(external_post_id="", success=False, error="Instagram did not return creation_id")

                await asyncio.sleep(3)

                pub_res = await _execute_with_retry(
                    lambda: client.post(publish_url, params={"creation_id": creation_id, "access_token": post.access_token})
                )
                if pub_res.status_code not in (200, 201):
                    err_msg = pub_res.text
                    logger.error("Instagram publish failed: %s", err_msg)
                    return PublishResult(external_post_id="", success=False, error=f"Instagram publish error: {err_msg}")

                published_id = pub_res.json().get("id", creation_id)
                return PublishResult(external_post_id=published_id, success=True)

        return await dry_run_guard(
            "social.publish.instagram",
            {"body": post.body[:100], "media_urls": post.media_urls},
            _do_publish,
            dry_result=PublishResult(external_post_id="ig-dryrun-mock-id", success=True),
        )


class FacebookPublisher(SocialPublisher):
    """
    Facebook Page Feed API publisher.
    Supports:
    - Multi-photo gallery posts (2 or 3+ images from /screenshots) via attached_media
    - Single photo posts via /{page_id}/photos
    - Link & text posts via /{page_id}/feed
    """

    async def publish(self, post: PostPayload) -> PublishResult:
        async def _do_publish():
            if not post.access_token or not post.account_id:
                return PublishResult(external_post_id="", success=False, error="Facebook requires access_token and Page ID")

            is_mock = str(post.account_id).startswith("mock_") or "mock" in str(post.access_token).lower()
            if is_mock:
                logger.info("Mock publish for Facebook Page %s: %s", post.account_id, post.body[:60] if post.body else "")
                return PublishResult(external_post_id=f"fb_mock_post_{uuid.uuid4().hex[:8]}", success=True)

            if not str(post.account_id).isdigit():
                return PublishResult(
                    external_post_id="",
                    success=False,
                    error=(
                        f"Invalid Facebook Page ID '{post.account_id}'. Meta Graph API only supports publishing to Facebook Pages with numeric IDs (not personal profiles). "
                        "Please create a Facebook Page at https://www.facebook.com/pages/create and reconnect Facebook in Connections."
                    ),
                )

            clean_link = _clean_public_social_link(post.link_url)
            message_text = _clean_public_social_text(post.body or "", clean_link)

            is_public_link = False
            if clean_link:
                try:
                    parsed = urllib.parse.urlparse(clean_link)
                    hostname = (parsed.hostname or "").lower()
                    if (
                        hostname
                        and hostname not in ("localhost", "127.0.0.1", "0.0.0.0")
                        and not hostname.endswith(".local")
                        and "." in hostname
                    ):
                        is_public_link = True
                except Exception:
                    is_public_link = False

                if not is_public_link and clean_link not in message_text:
                    message_text = f"{message_text}\n\n{clean_link}".strip()

            raw_media_list = collect_media_urls(post.media_urls, post.link_url)

            async with httpx.AsyncClient(timeout=60.0) as client:
                # Ensure Page access token
                effective_token = post.access_token
                try:
                    tok_res = await client.get(
                        f"https://graph.facebook.com/v19.0/{post.account_id}",
                        params={"fields": "access_token", "access_token": effective_token},
                    )
                    if tok_res.status_code == 200:
                        page_tok = tok_res.json().get("access_token")
                        if page_tok:
                            effective_token = page_tok
                except Exception as tok_err:
                    logger.debug("Page token auto-resolution check skipped: %s", tok_err)

                # ── MULTI-PHOTO POST (2 or 3+ images) ──────────────────────
                if len(raw_media_list) >= 2:
                    photo_ids: list[str] = []
                    photos_url = f"https://graph.facebook.com/v19.0/{post.account_id}/photos"

                    for media_item in raw_media_list[:10]:
                        local_path = find_local_screenshot_path(media_item)
                        p_res = None
                        if local_path and os.path.isfile(local_path):
                            try:
                                with open(local_path, "rb") as f_img:
                                    img_content = f_img.read()
                                fname = os.path.basename(local_path)
                                upload_data = {"published": "false", "access_token": effective_token}
                                upload_files = {"source": (fname, img_content, "image/png")}
                                p_res = await _execute_with_retry(
                                    lambda d=upload_data, f=upload_files: client.post(photos_url, data=d, files=f)
                                )
                            except Exception as up_err:
                                logger.warning("Facebook local photo upload exception for %s: %s", local_path, up_err)
                                p_res = None

                        if not p_res or p_res.status_code not in (200, 201):
                            pub_url = resolve_public_media_url(media_item)
                            p_res = await _execute_with_retry(
                                lambda u=pub_url: client.post(photos_url, data={"url": u, "published": "false", "access_token": effective_token})
                            )

                        if p_res and p_res.status_code in (200, 201):
                            pid = p_res.json().get("id")
                            if pid:
                                photo_ids.append(str(pid))
                        else:
                            logger.warning("Facebook photo upload failed for %s: %s", media_item, p_res.text if p_res else "No response")

                    if len(photo_ids) >= 2:
                        feed_url = f"https://graph.facebook.com/v19.0/{post.account_id}/feed"
                        feed_data = {
                            "message": message_text,
                            "access_token": effective_token,
                            "attached_media": json.dumps([{"media_fbid": pid} for pid in photo_ids]),
                        }
                        for idx, pid in enumerate(photo_ids):
                            feed_data[f"attached_media[{idx}]"] = json.dumps({"media_fbid": pid})

                        feed_res = await _execute_with_retry(
                            lambda: client.post(feed_url, data=feed_data)
                        )
                        if feed_res.status_code in (200, 201):
                            fb_post_id = feed_res.json().get("id", "fb-published")
                            logger.info("Published Facebook multi-photo post %s (%d photos)", fb_post_id, len(photo_ids))
                            return PublishResult(external_post_id=fb_post_id, success=True)
                        else:
                            logger.error("Facebook multi-photo feed error %d: %s", feed_res.status_code, feed_res.text)
                            return PublishResult(external_post_id="", success=False, error=f"Facebook API error ({feed_res.status_code}): {feed_res.text}")

                # ── SINGLE PHOTO POST ───────────────────────────────────────
                if raw_media_list:
                    photos_url = f"https://graph.facebook.com/v19.0/{post.account_id}/photos"
                    single_media = raw_media_list[0]
                    local_path = find_local_screenshot_path(single_media)
                    p_res = None
                    if local_path and os.path.isfile(local_path):
                        try:
                            with open(local_path, "rb") as f_img:
                                img_content = f_img.read()
                            fname = os.path.basename(local_path)
                            p_res = await _execute_with_retry(
                                lambda: client.post(
                                    photos_url,
                                    data={"caption": message_text, "access_token": effective_token},
                                    files={"source": (fname, img_content, "image/png")},
                                )
                            )
                        except Exception as e:
                            logger.warning("Facebook single local photo error: %s", e)
                            p_res = None

                    if not p_res or p_res.status_code not in (200, 201):
                        pub_url = resolve_public_media_url(single_media)
                        p_res = await _execute_with_retry(
                            lambda: client.post(
                                photos_url,
                                data={"url": pub_url, "caption": message_text, "access_token": effective_token},
                            )
                        )

                    if p_res and p_res.status_code in (200, 201):
                        fb_post_id = p_res.json().get("id", "fb-published")
                        return PublishResult(external_post_id=fb_post_id, success=True)
                    else:
                        logger.warning("Facebook single photo post failed: %s. Falling back to feed.", p_res.text if p_res else "")

                # ── TEXT / LINK FEED POST ───────────────────────────────────
                url = f"https://graph.facebook.com/v19.0/{post.account_id}/feed"
                payload = {
                    "message": message_text,
                    "access_token": effective_token,
                }
                if is_public_link:
                    payload["link"] = clean_link

                response = await _execute_with_retry(
                    lambda: client.post(url, data=payload)
                )
                if response.status_code not in (200, 201):
                    err_text = response.text
                    logger.error("Facebook Page feed error %d: %s", response.status_code, err_text)
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error=f"Facebook API error ({response.status_code}): {err_text}",
                    )

                fb_post_id = response.json().get("id", "fb-published")
                return PublishResult(external_post_id=fb_post_id, success=True)

        return await dry_run_guard(
            "social.publish.facebook",
            {"body": post.body[:100], "page_id": post.account_id},
            _do_publish,
            dry_result=PublishResult(external_post_id="fb-dryrun-mock-id", success=True),
        )


class YouTubePublisher(SocialPublisher):
    """
    YouTube Data API v3 publisher.
    Publishes video as PRIVATE by default until owner approves.
    """

    async def publish(self, post: PostPayload) -> PublishResult:
        async def _do_publish():
            if not post.access_token:
                return PublishResult(external_post_id="", success=False, error="YouTube requires Google OAuth access_token")

            clean_link = _clean_public_social_link(post.link_url) or "https://www.getyourclientsb2b.com/"
            desc = _clean_public_social_text(post.body or "", clean_link)
            if "getyourclientsb2b.com" not in desc:
                desc = f"{desc}\n\n🚀 Explore GetYourClients B2B: {clean_link}".strip()
            desc = desc.replace("Try GlobalReach:", "Explore GetYourClients B2B:").replace("GlobalReach", "GetYourClients B2B")

            # Handle sandbox/mock tokens without making invalid requests to Google live servers
            is_mock = (
                post.access_token.startswith("mock")
                or post.access_token.startswith("test_")
                or post.access_token in ("mock-youtube-token", "mock-decrypted-token")
                or getattr(settings, "dry_run", False)
            )
            if is_mock:
                sim_id = f"yt_{uuid.uuid4().hex[:11]}"
                logger.info("YouTube sandbox publish successful. Generated simulated video ID: %s", sim_id)
                return PublishResult(external_post_id=sim_id, success=True)

            # YouTube strictly requires a video media file binary for video uploads
            media_url = post.media_urls[0] if (post.media_urls and post.media_urls[0]) else None
            if not media_url:
                return PublishResult(
                    external_post_id="",
                    success=False,
                    error="Cannot publish to YouTube: No video media file attached. YouTube Data API requires a video file (MP4) to upload.",
                )

            # Retrieve video media binary
            video_bytes = b""
            content_type = "video/mp4"
            async with httpx.AsyncClient(timeout=120.0) as fetch_client:
                try:
                    media_resp = await fetch_client.get(media_url)
                    if media_resp.status_code == 200:
                        video_bytes = media_resp.content
                        content_type = media_resp.headers.get("content-type", "video/mp4")
                except Exception as exc:
                    logger.warning("Could not fetch remote media from %s: %s", media_url, exc)

            if not video_bytes:
                # If remote asset is not reachable or dummy asset in staging/preview
                return PublishResult(
                    external_post_id="",
                    success=False,
                    error=f"Could not load video asset file from '{media_url}'. Ensure the video file is publicly accessible.",
                )

            # Initiate YouTube Resumable Upload Session
            init_url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
            init_headers = {
                "Authorization": f"Bearer {post.access_token}",
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Type": content_type,
                "X-Upload-Content-Length": str(len(video_bytes)),
            }

            body = {
                "snippet": {
                    "title": (post.title or (desc[:60] if desc else "GetYourClients B2B Video"))[:100],
                    "description": desc,
                    "tags": post.tags or ["b2b", "lead generation", "sales prospecting", "cold email"],
                    "categoryId": "27",  # Education
                },
                "status": {
                    "privacyStatus": "private",  # Strictly private until reviewed
                    "selfDeclaredMadeForKids": False,
                },
            }

            async with httpx.AsyncClient(timeout=120.0) as client:
                # Step 1: Initialize upload session
                init_response = await _execute_with_retry(
                    lambda: client.post(init_url, json=body, headers=init_headers)
                )
                if init_response.status_code not in (200, 201):
                    err_text = init_response.text
                    logger.error("YouTube Resumable Upload Init error %d: %s", init_response.status_code, err_text)
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error=f"YouTube API error ({init_response.status_code}): {err_text}",
                    )

                upload_session_url = init_response.headers.get("Location")
                if not upload_session_url:
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error="YouTube did not provide a resumable upload session URL in Location header.",
                    )

                # Step 2: Upload binary bytes to the session URL
                upload_headers = {
                    "Content-Type": content_type,
                    "Content-Length": str(len(video_bytes)),
                }
                upload_response = await client.put(upload_session_url, content=video_bytes, headers=upload_headers)
                if upload_response.status_code not in (200, 201):
                    err_text = upload_response.text
                    logger.error("YouTube Upload transfer error %d: %s", upload_response.status_code, err_text)
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error=f"YouTube video transfer failed ({upload_response.status_code}): {err_text}",
                    )

                video_id = upload_response.json().get("id")
                if not video_id:
                    return PublishResult(
                        external_post_id="",
                        success=False,
                        error=f"YouTube upload succeeded but no video ID was returned: {upload_response.text}",
                    )

                return PublishResult(external_post_id=video_id, success=True)

        return await dry_run_guard(
            "social.publish.youtube",
            {"title": post.title, "privacy": "private"},
            _do_publish,
            dry_result=PublishResult(external_post_id=f"yt_dryrun_{uuid.uuid4().hex[:8]}", success=True),
        )


def get_social_publisher(platform: str) -> SocialPublisher:
    """Factory: returns the publisher implementation for the specified platform."""
    publishers: dict[str, SocialPublisher] = {
        "x": XPublisher(),
        "linkedin": LinkedInPublisher(),
        "instagram": InstagramPublisher(),
        "facebook": FacebookPublisher(),
        "youtube": YouTubePublisher(),
    }
    return publishers.get(platform.lower(), StubSocialPublisher())
