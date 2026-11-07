AI Content & Trend Engine: Product Blueprint for GetYourClients
What I found in your current app
Stack: Next.js 14 and React 18 on the frontend, Python FastAPI on the backend, PostgreSQL 16 with asyncpg, and background workers for publishing. This is a good base for the engine.
Already built or listed: an AI hook, caption and hashtag generator, a Brand Voice & ICP Guardrails module (tone, banned phrases, personas), a Video Script Studio, scheduling and auto-publish for Meta, LinkedIn, X and YouTube, and shortlink attribution.
Gaps this engine fills: your hooks and hashtags are generated from the brand profile alone. They have no live trend input, no performance feedback loop, no hashtag intelligence, and no account audit.
Positioning tension: the site speaks to agencies, but your goal is “any niche.” I’d add a Niche Profile layer (industry, sub-niche, audience, content pillars) on top of the Brand Profile.
Trust risks on the landing page: the stat counters show “0+” and the status badges show “Offline.” Also, the meta description says “Internal admin.” Fix these before you market the engine.
1. Core Features & Architecture
Four modules

Module A: Trend Radar (daily ideas)

Ingest from several sources, cluster the signals into topics, and score each topic against the user’s niche.
Output a daily Idea Feed of 5–10 cards. Each card has the trend, why it matters to this niche, a suggested angle, a format recommendation, and a “freshness window” (for example, “act within 48h”).

Module B: Content Studio (multi-niche generation)

One idea becomes a content pack: a LinkedIn text post, an Instagram carousel, a Reel script, and a Facebook post.
Every pack runs through generation, a platform-rules linter, a brand-guardrail check, and a quality score before the user sees it.

Module C: Reach Optimizer (hashtags and keywords)

Builds hashtag clusters and keyword sets per platform, and flags risky tags.

Module D: AI Account Manager

Profile audit, best-time-to-post model, engagement tasks, and a weekly strategy memo.
Trend data sources
Source	Use	Notes
Google Trends (official API is in alpha; SerpApi or DataForSEO as a fallback)	Rising search queries by category and region	The best general signal for “what people want now”
News APIs (NewsAPI, GDELT, Bing News, Google News RSS)	Industry news by keyword	RSS is free and covers niche trade publications
Reddit (official API) and Hacker News (free API)	Pain points, questions, emerging debates	Great for B2B and SaaS niches
YouTube Data API v3 (mostPopular, search by category)	Viral formats and title patterns	You already have YouTube connected
Competitor and peer tracking	Top posts from accounts the user follows	Use Meta’s Business Discovery endpoint on IG Business accounts and LinkedIn pages the user owns or has access to
Seasonal and event calendar	Holidays, industry events, awareness days	A static table you maintain, plus an LLM for niche-specific events
Format trends (audio, templates, hook styles)	Viral formats	No clean official API. Start with a curated, manually updated “format library” and add a third-party data vendor later. Avoid scraping TikTok or Instagram, which risks ToS violations and breakage.

Be honest in the product about data limits: Instagram’s hashtag search API caps you at 30 unique hashtags per user per 7 days and returns no volume numbers. LinkedIn has no public trends API. So your own aggregated data becomes the moat. Every post published through your platform feeds a performance dataset.

Pipeline
[Ingest workers, hourly/daily]
   Google Trends | News | Reddit | HN | YouTube | Event calendar
        ↓
[Normalize + dedupe]  → trend_signals table
        ↓
[Cluster]  embeddings (pgvector) → topic clusters
        ↓
[Niche matching]
   cosine similarity(topic, niche_profile embedding)
   + LLM relevance judge (0–10 + "angle")
        ↓
[Score]  = relevance × freshness × velocity × format-fit × (1 − saturation)
        ↓
[Daily Idea Feed per user]  (cron at user's local 6 AM)
        ↓
[Content Studio]  generate → lint → brand check → score → user review
        ↓
[Publish worker]  (existing) → [Performance ingest] → feedback loop
Suggested data model (Postgres)
niche_profiles (user_id, industry, sub_niche, audience, pillars[], competitors[], embedding vector)
trend_signals (source, title, url, region, velocity, first_seen, embedding)
trend_clusters (label, signal_ids[], peak_estimate, embedding)
idea_cards (user_id, cluster_id, angle, format, relevance, freshness_expires, status)
content_packs (idea_id, platform, body, assets, lint_report, quality_score, status)
hashtag_sets (pack_id, platform, tiers {broad, mid, niche, branded}, risk_flags)
post_metrics (post_id, reach, impressions, saves, shares, comments, watch_time, collected_at)
account_audits (user_id, platform, score, findings[], created_at)

Use pgvector, since you’re already on Postgres, so you don’t need a separate vector DB. Use Celery or Arq with Redis for the workers.

Hashtag system
Candidate generation: the LLM proposes tags from the post’s topic and niche. Add tags from the user’s own top-performing posts and from competitor posts (via Business Discovery).
Tiering: classify each tag as broad, mid or niche. Use proxies: Instagram’s hashtag media counts where accessible, Google Trends interest, and your own cross-user performance data.
Clustering: embed the tags and cluster them into 3–4 themes. Pick one cluster from each tier, so the set isn’t five variants of the same word.
Safety filter: keep a blocklist of banned and “broken” hashtags (hashtags Instagram restricts or hides). Re-check periodically through hashtag search where possible.
Platform counts: Instagram 3–5 tags (Meta’s guidance leans toward fewer tags plus keywords, so verify current limits before hard-coding), LinkedIn 3–5, Facebook 1–3 at most.
Learning loop: track reach per tag set and rotate underperformers.
Account Manager features
Profile Audit Score (0–100) per platform:
Instagram: keyword-rich name field, bio clarity, CTA link, highlights, pinned posts.
LinkedIn: headline, About section, Featured section, banner.
Facebook: Page category, intro, CTA button.
Each finding comes with a one-click AI rewrite.
Best-time model: start with each platform’s Insights data (via Graph API) for the user’s followers’ active times. Fall back to niche benchmarks at first, then personalize from post_metrics. Recompute weekly.
Daily engagement tasks (5–15 minutes): “Comment on these 5 posts from your target accounts,” “Reply to these 3 comments,” “Send DMs to people who saved your post.” Generate suggested comment drafts that add real substance.
Weekly strategy memo: what worked, what flopped, why, and next week’s plan. Include a Content Mix Planner (for example, 40% educational, 25% story, 20% trend-jacking, 15% promotional).
Authority tracker: follower quality, share-to-reach ratio and save rate over time, not just follower count.
Phased roadmap
Phase	Weeks	Ship
1	1–4	Niche Profile, Google Trends and RSS ingest, daily Idea Feed, LLM relevance scoring
2	4–8	Content Studio (LinkedIn text, IG carousel, Reel script), platform linter, one-click schedule
3	8–12	Hashtag Optimizer, performance ingest, best-time model
4	12–16	Account Audit, engagement task list, weekly memo, A/B variants
5	16+	Learning loop (per-user and cross-user), format library, competitor benchmarking
2. The User Journey
Onboarding (5 min): the user picks an industry from a taxonomy and adds a sub-niche in free text (for example, “Real estate → luxury condos in Dubai”). They paste their website or LinkedIn URL so the app can auto-fill audience, tone and pillars, and they connect IG, FB and LinkedIn. Reuse your existing Brand Voice & ICP Guardrails screens so users aren’t entering data twice.
Daily Idea Feed: each morning the user sees cards labeled “Trending now,” “Evergreen with a twist,” or “Event-driven.” Each card shows a relevance score, a freshness timer, and the platforms it fits best. Actions are Generate, Save for later and Not relevant. Not-relevant clicks train the relevance model.
Generate: the user picks the platforms, and the Studio produces a content pack in about 20 seconds. The user sees a variant selector (3 hooks, 2 CTAs), a Reach Score with a checklist of what passed and failed, and a hashtag panel showing each tag’s tier.
Refine: inline AI edit commands such as “shorter,” “more contrarian,” “add a stat,” and “match my last top post’s style.” Brand guardrails run automatically and flag banned phrases.
Schedule: the app suggests a time slot per platform from the best-time model, and the user can accept it in one click. This goes into your existing scheduler.
Post-publish: after 24 hours and again after 7 days, the app shows results in plain language: “This beat your average reach by 2.1×, mostly from shares. Your carousel format outperforms single images 3:1.”
Weekly review: the AI Account Manager memo, the audit score change, and a task list for the coming week.
3. Backend Prompt Engineering

Design principles for all three prompts: pass structured context in, force JSON output so it can be validated, and keep the brand profile and the platform rules as separate, reusable blocks. Use a cheaper model for scoring and a stronger one for generation, and validate outputs with Pydantic.

Prompt 1: Trend-to-Niche Relevance and Angle Engine
SYSTEM:
You are a senior content strategist who turns news and trends into
audience-relevant content angles. You only recommend a trend when a
credible, honest connection to the niche exists. Never force a link.

USER:
<niche_profile>
Industry: {{industry}}
Sub-niche: {{sub_niche}}
Audience: {{audience_description}}
Content pillars: {{pillars}}
Brand voice: {{tone_rules}}
Banned topics/phrases: {{banned}}
</niche_profile>

<trend_cluster>
Topic: {{cluster_label}}
Source signals (title, source, date): {{top_signals}}
Velocity: {{velocity_note}}
</trend_cluster>

TASK:
1. Score relevance to this niche from 0-10. If below 5, return
   {"relevant": false, "reason": "..."} and stop.
2. Identify the audience's underlying question or pain point this
   trend touches.
3. Propose up to 3 angles, each of a different type:
   (a) educational explainer, (b) contrarian/opinion,
   (c) practical how-to or checklist.
4. For each angle, recommend the best format and platform.
5. State a freshness window in hours.
6. Flag any risk (sensitive topic, unverified claim, legal/medical/
   financial sensitivity).

Rules: Do not invent statistics, quotes or events. Only use facts
present in the source signals. Mark any claim that needs
verification with "needs_verification": true.

Return ONLY valid JSON matching:
{"relevant": bool, "relevance_score": int, "audience_pain_point": str,
 "angles": [{"type": str, "headline": str, "core_insight": str,
 "format": "carousel|reel|text|image", "best_platform": str}],
 "freshness_hours": int, "risk_flags": [str]}
Prompt 2: Multi-Format, Platform-Native Content Generator
SYSTEM:
You are an expert social copywriter for {{industry}}. You write
content that gives real, specific value: concrete steps, examples,
numbers the user supplied, and original insight. You never write
generic filler, engagement bait ("comment YES"), or unverifiable
claims. Match the brand voice exactly.

USER:
<brand>{{brand_profile_and_voice_samples}}</brand>
<idea>
Angle: {{angle}}
Core insight: {{core_insight}}
Verified facts you may use: {{verified_facts}}
</idea>
<platform_rules>{{platform_rule_block_for_target}}</platform_rules>
<past_top_posts>{{2-3_examples_of_this_user's_best_posts}}</past_top_posts>

TASK: Produce a content pack for {{platform}}.

If LINKEDIN TEXT POST:
- First 2 lines (under ~210 characters) must be a hook that earns the
  "see more" click: a specific claim, a surprising number, or a
  tension. No greetings.
- Short paragraphs of 1-2 lines. 900-1,500 characters.
- Include one concrete example or mini-story.
- End with one specific, open question that invites expertise
  (not "Thoughts?").
- No links in body. Provide link text separately for the first comment.

If INSTAGRAM CAROUSEL:
- 7-10 slides. Slide 1: hook (max 12 words), promise a payoff.
  Slides 2-8: one idea per slide, max 30 words, specific.
  Final slide: recap plus a single CTA (save or send to someone).
- Provide caption (keyword-rich first sentence), alt text per slide.

If SHORT VIDEO SCRIPT:
- Return a timed script: Hook (0-3s) with 3 alternatives, Body beats
  with on-screen text and visual cues, Payoff, CTA. 20-45s total.
- The first 3 seconds must state the viewer benefit or open a loop.

If FACEBOOK POST:
- Conversational, 40-150 words, one clear idea, optional question
  rooted in the audience's real experience.

Provide 3 hook variants for A/B testing and a one-line rationale each.

Return ONLY JSON:
{"platform": str, "hooks": [{"text": str, "rationale": str}],
 "body": str | "slides": [...] | "script": [...],
 "caption": str, "cta": str, "alt_text": [str],
 "first_comment": str, "claims_to_verify": [str]}
Prompt 3: Hashtag/Keyword Clustering and Algorithm Linter
SYSTEM:
You are a social search-optimization analyst. Recommend tags that
fit the content honestly. Never recommend banned, spammy or
irrelevant tags, and never use unrelated trending tags to chase reach.

USER:
<post>{{final_post_text}}</post>
<platform>{{platform}}</platform>
<niche>{{niche_profile_summary}}</niche>
<candidates>{{candidate_tags_with_tier_and_stats}}</candidates>
<blocklist>{{banned_or_restricted_tags}}</blocklist>
<user_history>{{best_performing_tag_sets}}</user_history>

TASK:
A) From the candidates, build a set for {{platform}} with this mix:
   - 1 broad tag, 2 mid-tier tags, 1-2 hyper-niche tags, and
     optionally 1 branded tag. Respect the platform's count limit of
     {{max_tags}}.
   - Every tag must directly relate to the post's topic.
   - No two tags may be near-duplicates.
B) Extract 5-8 natural-language search keywords to work into the
   caption and first line, plus alt text.
C) Lint the post against these rules and list each pass/fail with a
   concrete fix: {{rule_checklist_for_platform}}
D) Give a Reach Score 0-100 with a breakdown (hook strength,
   retention structure, shareability, keyword coverage, rule compliance).

Return ONLY JSON:
{"hashtags": [{"tag": str, "tier": str, "reason": str}],
 "keywords": [str],
 "lint": [{"rule": str, "pass": bool, "fix": str}],
 "reach_score": {"total": int, "breakdown": {...}}}

Implementation notes: separate deterministic checks (character counts, link detection, blocklist matching, tag count) from LLM judgment, because code is cheaper and more reliable for rules. Add a fact-check step: any item in claims_to_verify is surfaced to the user with a warning before publishing. For regulated niches (healthcare, finance, legal), add a compliance prompt layer and require human approval.

4. Virality Playbook (rules to encode in the linter)

First, a framing for your users and your marketing: no tool can guarantee virality, and there is no way to “bypass suppression.” What you can do is avoid known demotion triggers and structure content around the signals each platform has publicly said it values. Platform guidance changes often, so store these as versioned, editable rules in a database table rather than hard-coding them, and A/B test each one against your own data.

Instagram
Optimize for watch time, sends (DM shares), and saves. Meta has described watch time, likes per reach and sends per reach as top ranking signals.
Hook in the first 3 seconds, with on-screen text from frame one. Keep Reels tight, because completion rate matters.
Carousels: strong slide 1, one idea per slide, and a closing slide designed to be saved or sent.
Use original content. Reposts with other platforms’ watermarks get deprioritized.
Put keywords in the caption, alt text, name field and bio, since Instagram search leans on text.
Use 3–5 relevant hashtags instead of 30.
Don’t use engagement bait and don’t repeatedly post identical content.
Check recommendation eligibility regularly. Accounts that violate community guidelines get excluded from recommendations.
Facebook
Meaningful interactions beat raw reactions: prompt real conversation and stories, not “tag 3 friends.”
Prioritize Reels and native video. Facebook has been favoring original short video in recommendations.
Never post engagement bait (“like to win,” “share if you agree”), which Meta explicitly demotes.
Avoid clickbait headlines and low-quality, link-heavy posts. Native text, images and video generally travel further than link posts.
Reply to comments quickly, since the early conversation shapes distribution.
Use only 1–3 hashtags. They matter little on Facebook.
LinkedIn
Dwell time and substantive comments drive reach. Longer posts with a strong hook, plus a question that invites real expertise, tend to do well.
Keep the first ~210 characters as a standalone hook, since the “see more” cutoff is where the decision happens.
Format for skimming: one- to two-line paragraphs, no walls of text.
Native documents (PDF carousels) and native video usually get more reach than external links. Many creators put links in the first comment, though LinkedIn disputes that links are penalized, so test it.
The first 60–90 minutes of engagement matter. The scheduler should post when the user can reply promptly, and the Account Manager should prompt them to.
Avoid engagement pods and automated or generic comments, which LinkedIn has been cracking down on. Your engagement-task feature should suggest thoughtful drafts the user edits, never auto-posted comments.
Use 3–5 relevant hashtags. Post 3–5 times a week, and be consistent.
Universal rules
A specific hook beats a generic one. Require a number, a contrarian claim, or a clear payoff.
One idea per post.
Give a reason to save or send (checklists, templates, frameworks).
Include genuine insight or a first-hand example. Generic AI-sounding content is increasingly deprioritized by audiences, if not by the algorithm.
Be consistent in frequency, and don’t over-post to the point of cannibalizing your own posts.
Reply to comments within the first hour.
Never fabricate stats, testimonials or news. This is the biggest brand-safety risk of an AI content tool, so build the verification step into the core product.
Guardrails to build in
Platform compliance: rate limits, API scopes and Meta app review requirements for instagram_content_publish and insights permissions. Plan app review time into your roadmap, because it’s often the longest pole.
Disclosure: add an option for AI-assisted content labeling where platforms require it.
Human-in-the-loop by default, with auto-publish as an opt-in per post type.
Suggested next steps
Build the Niche Profile and a Google Trends plus RSS ingest, and ship a basic Idea Feed. This is the smallest slice that proves the core value.
Pick 3 pilot niches (for example SaaS, real estate, healthcare) and manually review the first 100 generated ideas for relevance before scaling.
Instrument everything from day one (post_metrics), because your performance dataset will become the real differentiator.