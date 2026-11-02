"""
Script to create high-quality Instagram and Facebook posts featuring 2 and 3 images
from frontend/public/screenshots (/screenshots/*.png).

Creates ContentIdeas and Posts in the database with status 'pending_approval' or 'scheduled',
ready to be approved and published via the live Meta Instagram and Facebook Page APIs.
Optionally supports --publish to publish immediately using the configured Meta credentials.
"""
import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.models.social import ContentIdea, Post
from app.services.utm import utm_dict
from app.routers.posts import ensure_website_url
from worker.jobs.social import publish_single_post

POST_CAMPAIGNS = [
    {
        "topic": "Inside our automated social media studio: how we adapt 1 idea across X, LinkedIn, Instagram, Facebook & YouTube",
        "pillar": "how-to",
        "dest_url": "https://www.getyourclientsb2b.com/#how-it-works",
        "screenshots": [
            "/screenshots/growth_social_ideas.png",
            "/screenshots/growth_calendar.png",
            "/screenshots/growth_dashboard.png",
        ],
        "instagram": (
            "Stop wasting 15+ hours weekly copy-pasting posts across tabs. 📈 Swipe through to see how our AI Social Studio turns 1 raw growth concept into platform-adapted posts across X, LinkedIn, Instagram, and Facebook—all held in an approval calendar before anything goes live.\n\n"
            "🔗 Explore the studio: https://www.getyourclientsb2b.com/#how-it-works\n\n"
            "#b2bgrowth #socialmediaautomation #contentmarketing #marketingtech #growthhacking #getyourclientsb2b #saasgrowth"
        ),
        "facebook": (
            "Scaling an active social presence shouldn't require hiring three copywriters.\n\n"
            "Inside our Social Media Studio:\n"
            "👉 Input 1 growth win or product update\n"
            "👉 AI calibrates punchy X threads, LinkedIn posts, Instagram carousels & Facebook updates\n"
            "👉 Built-in Claims Guard prevents unsubstantiated guarantee violations\n"
            "👉 Visual approval queue puts human approval at the center of every scheduled post\n\n"
            "Explore the platform: https://www.getyourclientsb2b.com/#how-it-works"
        ),
    },
    {
        "topic": "Global B2B Lead Discovery & Cold Outreach CRM: High deliverability prospect pipelines",
        "pillar": "case-study",
        "dest_url": "https://www.getyourclientsb2b.com/#discovery",
        "screenshots": [
            "/screenshots/growth_leads.png",
            "/screenshots/growth_campaigns.png",
            "/screenshots/growth_inbox.png",
        ],
        "instagram": (
            "Finding ideal B2B decision-makers shouldn't take days of manual scraping. 🎯 Swipe through our global lead discovery engine:\n\n"
            "1️⃣ Verified ICP filtering across 190+ countries\n"
            "2️⃣ Automated multi-stage outreach sequences with bounce protection\n"
            "3️⃣ Unified inbox with real-time sentiment detection\n\n"
            "🔗 Discover high-intent B2B leads: https://www.getyourclientsb2b.com/#discovery\n\n"
            "#leadgeneration #coldemail #b2bleads #salesprospecting #outreachautomation #b2bsaas #growthtools"
        ),
        "facebook": (
            "Tired of bounce rates killing your domain deliverability?\n\n"
            "Our native B2B Outreach CRM pairs AI lead discovery with enterprise deliverability guardrails:\n"
            "• Targeted prospect filtering across industries, company sizes, and geography\n"
            "• Automated personalization calibrated against spam filters\n"
            "• Centralized unified inbox with automated unsubscribe compliance\n\n"
            "Check out our verified B2B discovery workflows: https://www.getyourclientsb2b.com/#discovery"
        ),
    },
    {
        "topic": "Programmatic SEO Architecture: Generating 500+ high intent landing pages",
        "pillar": "how-to",
        "dest_url": "https://www.getyourclientsb2b.com/#overview",
        "screenshots": [
            "/screenshots/growth_seo_manager.png",
            "/screenshots/growth_dashboard.png",
        ],
        "instagram": (
            "Programmatic SEO is the highest ROI acquisition engine for modern B2B SaaS. 🚀 Swipe through to see our automated SEO keyword cluster manager and live sitemap indexing engine.\n\n"
            "🔗 Learn more: https://www.getyourclientsb2b.com/#overview\n\n"
            "#programmaticseo #seostrategy #organicgrowth #b2bmarketing #searchengineoptimization #growthmarketing"
        ),
        "facebook": (
            "Writing hundreds of SEO articles by hand takes months of copywriter bandwidth.\n\n"
            "Our Programmatic SEO Manager automates the pipeline:\n"
            "1. Generates structured keyword matrices across niches & competitor comparisons\n"
            "2. Deploys rich JSON-LD schema snippets for maximum CTR\n"
            "3. Submits automated sitemaps for fast search console indexing\n\n"
            "Explore how programmatic SEO scales organic traffic: https://www.getyourclientsb2b.com/#overview"
        ),
    },
    {
        "topic": "Automated Video Studio: Short-form video repurposing and multi-platform cutdown generation",
        "pillar": "product",
        "dest_url": "https://www.getyourclientsb2b.com/#product",
        "screenshots": [
            "/screenshots/growth_video_studio.png",
            "/screenshots/growth_social_ideas.png",
            "/screenshots/growth_calendar.png",
        ],
        "instagram": (
            "Turn 1 long-form video or tutorial into high-engagement short-form reels and social posts. 🎬 Swipe to see our automated Video Studio and multi-platform cutdown generator.\n\n"
            "🔗 See live demo: https://www.getyourclientsb2b.com/#product\n\n"
            "#videomarketing #reelscreation #contentcreator #b2bgrowth #contentrepurposing #marketingautomation"
        ),
        "facebook": (
            "Repurposing video content is usually the most tedious bottleneck for growth teams.\n\n"
            "Our Video Studio automatically generates platform-specific cutdown captions, hook variants, and timestamps for Instagram Reels, Facebook Reels, and YouTube:\n"
            "• Automated transcript analysis & scene detection\n"
            "• Cross-platform captions calibrated for each social algorithm\n"
            "• One-click export to approval calendar\n\n"
            "Watch the workflow in action: https://www.getyourclientsb2b.com/#product"
        ),
    },
]


async def create_and_optionally_publish_posts(do_publish: bool = False):
    print("=" * 70)
    print("Creating Instagram & Facebook posts with 2 or 3 screenshots...")
    print("=" * 70)

    async with AsyncSessionLocal() as session:
        base_time = datetime.now(timezone.utc) + timedelta(hours=1)
        created_posts: list[Post] = []

        for idx, camp in enumerate(POST_CAMPAIGNS):
            idea = ContentIdea(
                topic=camp["topic"],
                pillar=camp["pillar"],
                source="manual",
                status="approved",
            )
            session.add(idea)
            await session.flush()

            clean_dest = ensure_website_url(camp["dest_url"])
            screenshots = camp["screenshots"]

            # 1. Instagram Post (2 or 3 images -> Carousel)
            ig_post_id = uuid.uuid4()
            ig_utm = utm_dict(source="instagram", medium="social", campaign=camp["pillar"], content=str(ig_post_id))
            ig_post = Post(
                id=ig_post_id,
                idea_id=idea.id,
                platform="instagram",
                body=camp["instagram"],
                media_urls=screenshots,
                link_url=clean_dest,
                utm=ig_utm,
                status="pending_approval" if not do_publish else "scheduled",
                scheduled_at=base_time + timedelta(days=idx, hours=2),
            )
            session.add(ig_post)
            created_posts.append(ig_post)

            # 2. Facebook Post (2 or 3 images -> Multi-Photo Album)
            fb_post_id = uuid.uuid4()
            fb_utm = utm_dict(source="facebook", medium="social", campaign=camp["pillar"], content=str(fb_post_id))
            fb_post = Post(
                id=fb_post_id,
                idea_id=idea.id,
                platform="facebook",
                body=camp["facebook"],
                media_urls=screenshots,
                link_url=clean_dest,
                utm=fb_utm,
                status="pending_approval" if not do_publish else "scheduled",
                scheduled_at=base_time + timedelta(days=idx, hours=4),
            )
            session.add(fb_post)
            created_posts.append(fb_post)

            print(f"[{idx + 1}/{len(POST_CAMPAIGNS)}] Created Idea: '{camp['topic'][:50]}...'")
            print(f"   -> Instagram: {len(screenshots)} images: {screenshots}")
            print(f"   -> Facebook:  {len(screenshots)} images: {screenshots}")

        await session.commit()
        print(f"\nSuccessfully stored {len(created_posts)} posts in database across {len(POST_CAMPAIGNS)} campaigns!")

        if do_publish:
            print("\n" + "=" * 70)
            print("Publishing posts live to Meta Instagram & Facebook APIs...")
            print("=" * 70)
            for post in created_posts:
                print(f"Publishing {post.platform.upper()} post ({post.id}) with {len(post.media_urls)} images...")
                res = await publish_single_post(session, post)
                if res.success:
                    print(f"   ✓ SUCCESS! External ID: {res.external_post_id}")
                else:
                    print(f"   ✗ FAILED: {res.error}")

        print("\nDone!")


if __name__ == "__main__":
    should_publish = "--publish" in sys.argv
    asyncio.run(create_and_optionally_publish_posts(do_publish=should_publish))
