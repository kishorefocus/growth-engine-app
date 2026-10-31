import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from app.core.database import AsyncSessionLocal
from app.models.social import ContentIdea, Post
from app.services.utm import utm_dict
from app.routers.posts import ensure_website_url

CAMPAIGNS = [
    {
        "topic": "Inside our automated social media studio: how we adapt 1 idea across X, LinkedIn, Instagram, Facebook & YouTube",
        "pillar": "how-to",
        "posts": [
            {
                "platform": "x",
                "link": "https://growth.getyourclientsb2b.com/admin/ideas",
                "screenshots": ["/screenshots/growth_social_ideas.png", "/screenshots/growth_calendar.png"],
                "body": (
                    "Most B2B teams waste 15+ hours weekly reformatting posts across platforms.\n\n"
                    "Here is how our Social Studio automates the entire workflow:\n"
                    "1. Input single topic or growth win\n"
                    "2. AI adapts punchy X threads, deep-dive LinkedIn commentary, IG carousels & FB summaries\n"
                    "3. Queued to visual approval calendar with 1-click publishing\n\n"
                    "Explore the live studio: https://growth.getyourclientsb2b.com/admin/ideas"
                )
            },
            {
                "platform": "linkedin",
                "link": "https://www.getyourclientsb2b.com/#product",
                "screenshots": ["/screenshots/growth_calendar.png", "/screenshots/growth_social_ideas.png"],
                "body": (
                    "Repurposing social content shouldn't require copy-pasting across 5 browser tabs.\n\n"
                    "We built a native Social Media Automation Engine inside GetyourclientsB2B to streamline multi-channel authority:\n\n"
                    "• AI adaptation calibrated for X threads, LinkedIn posts, Instagram captions, Facebook updates, and YouTube descriptions\n"
                    "• Built-in Claims Guard: automatically rejects fake ROI promises or unsubstantiated guarantees\n"
                    "• Staggered scheduling calendar with human-in-the-loop approval before anything goes live\n\n"
                    "See how growth agencies scale consistent social reach: https://www.getyourclientsb2b.com/#product\n\n"
                    "What is your biggest bottleneck when maintaining consistency across social channels?"
                )
            },
            {
                "platform": "instagram",
                "link": "https://growth.getyourclientsb2b.com/admin/calendar",
                "screenshots": ["/screenshots/growth_calendar.png", "/screenshots/growth_social_ideas.png"],
                "body": (
                    "Automating B2B social media distribution with full human approval 📈 Swipe through to see the live calendar and approval queue.\n\n"
                    "🔗 Explore the platform: https://growth.getyourclientsb2b.com/admin/calendar\n\n"
                    "#socialmediaautomation #b2bgrowth #contentmarketing #getyourclientsb2b #marketingtech #growthhacking"
                )
            },
            {
                "platform": "facebook",
                "link": "https://www.getyourclientsb2b.com/#how-it-works",
                "screenshots": ["/screenshots/growth_social_ideas.png", "/screenshots/growth_calendar.png"],
                "body": (
                    "Scaling your agency's social presence doesn't mean hiring 3 full-time copywriters. "
                    "Our automated Social Studio turns raw concepts into platform-optimized posts with built-in compliance checks and scheduled publishing. "
                    "Learn how it works on GetyourclientsB2B: https://www.getyourclientsb2b.com/#how-it-works"
                )
            },
            {
                "platform": "youtube",
                "link": "https://growth.getyourclientsb2b.com/admin/dashboard",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/growth_calendar.png"],
                "body": (
                    "How to Automate B2B Social Media Across 5 Platforms in 5 Minutes (Tutorial)\n\n"
                    "In this walkthrough, we demo our live Social Media Studio & Approval Calendar, showing how to convert a single topic into multi-platform drafts.\n\n"
                    "🚀 Launch your growth engine: https://growth.getyourclientsb2b.com/admin/dashboard\n\n"
                    "Timestamps:\n0:00 - Introduction\n1:20 - AI Topic Generation\n2:45 - Cross-Platform Adaptation\n4:10 - Approval Calendar & Publishing"
                )
            }
        ]
    },
    {
        "topic": "Scaling organic B2B search traffic: how our SEO manager generates 500+ high-intent keyword landing pages",
        "pillar": "how-to",
        "posts": [
            {
                "platform": "x",
                "link": "https://growth.getyourclientsb2b.com/admin/seo",
                "screenshots": ["/screenshots/growth_seo_manager.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Programmatic SEO is the highest ROI acquisition channel for B2B SaaS.\n\n"
                    "Inside our Programmatic SEO Manager:\n"
                    "• Auto-generates structured keyword clusters (industry x city, alternative comparisons)\n"
                    "• Submits real-time sitemaps and monitors indexing health\n"
                    "• Programmatic JSON-LD schemas for high CTR rich snippets\n\n"
                    "See the live SEO manager: https://growth.getyourclientsb2b.com/admin/seo"
                )
            },
            {
                "platform": "linkedin",
                "link": "https://www.getyourclientsb2b.com/#overview",
                "screenshots": ["/screenshots/growth_seo_manager.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Writing 500 blog posts manually takes months. Programmatic SEO solves this by engineering data-driven pages that match exact buyer search intent.\n\n"
                    "Our SEO Engine manages the entire pipeline:\n\n"
                    "1. Target keyword matrices across niches and competitors\n"
                    "2. AI content generation with zero claims-guard violations\n"
                    "3. Automated sitemap indexing and search console tracking\n\n"
                    "Read the full architectural overview on GetyourclientsB2B: https://www.getyourclientsb2b.com/#overview\n\n"
                    "How much of your qualified inbound currently comes from programmatic search queries?"
                )
            },
            {
                "platform": "instagram",
                "link": "https://growth.getyourclientsb2b.com/admin/seo",
                "screenshots": ["/screenshots/growth_seo_manager.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Scale programmatic SEO without engineering bottlenecks 🚀 Check out our SEO Manager dashboard tracking keyword clusters and page indexing.\n\n"
                    "🔗 Explore live SEO manager: https://growth.getyourclientsb2b.com/admin/seo\n\n"
                    "#programmaticseo #seomanager #b2bseo #organictraffic #inboundmarketing #getyourclientsb2b"
                )
            },
            {
                "platform": "facebook",
                "link": "https://www.getyourclientsb2b.com/pricing",
                "screenshots": ["/screenshots/growth_seo_manager.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Looking to dominate organic search in your niche? Our Programmatic SEO Manager automates keyword cluster generation, metadata injection, and search indexing without coding. "
                    "Explore pricing and live plans: https://www.getyourclientsb2b.com/pricing"
                )
            },
            {
                "platform": "youtube",
                "link": "https://growth.getyourclientsb2b.com/admin/launch",
                "screenshots": ["/screenshots/growth_seo_manager.png", "/screenshots/growth_launch.png"],
                "body": (
                    "How to Build a 500-Page Programmatic SEO Engine for B2B Client Acquisition\n\n"
                    "Full step-by-step masterclass demonstrating how our SEO Manager handles keyword matrices, content generation, and live indexing.\n\n"
                    "🚀 Try the live SEO engine: https://growth.getyourclientsb2b.com/admin/launch\n\n"
                    "Timestamps:\n0:00 - Introduction & Keyword Research\n1:40 - Programmatic Template Architecture\n3:20 - Schema & Technical SEO\n5:10 - Indexing Results"
                )
            }
        ]
    },
    {
        "topic": "From keyword to 60-second shorts script and 8-minute YouTube outline with shot lists in 2 minutes",
        "pillar": "build-in-public",
        "posts": [
            {
                "platform": "x",
                "link": "https://growth.getyourclientsb2b.com/admin/video",
                "screenshots": ["/screenshots/growth_video_studio.png", "/screenshots/growth_social_ideas.png"],
                "body": (
                    "Video production usually halts because scripting and storyboard planning take hours.\n\n"
                    "Our Video Studio automates the preparation in 2 minutes:\n"
                    "1. Input target keyword\n"
                    "2. Generates 3 title hooks, 60s Shorts script & 5-8 min YouTube outline\n"
                    "3. Formats exact shot-list cueing screen actions & voiceovers\n\n"
                    "Live Video Studio: https://growth.getyourclientsb2b.com/admin/video"
                )
            },
            {
                "platform": "linkedin",
                "link": "https://growth.getyourclientsb2b.com/admin/video",
                "screenshots": ["/screenshots/growth_video_studio.png", "/screenshots/growth_social_ideas.png"],
                "body": (
                    "Short-form video and tactical YouTube breakdowns are the fastest way to build founder credibility.\n\n"
                    "We built an AI Video Studio inside GetyourclientsB2B to take the friction out of content creation:\n\n"
                    "• Full 60-second verbatim scripts optimized for YouTube Shorts, Reels, and TikTok\n"
                    "• Structured 5-8 minute tutorial outlines with timestamps and chapters\n"
                    "• Concrete 4-step shot lists specifying exactly what screen to show and what to click\n\n"
                    "Access the Video Studio dashboard: https://growth.getyourclientsb2b.com/admin/video\n\n"
                    "Are you creating video content for your agency or SaaS this quarter?"
                )
            },
            {
                "platform": "instagram",
                "link": "https://www.getyourclientsb2b.com/#discovery",
                "screenshots": ["/screenshots/growth_video_studio.png", "/screenshots/growth_social_ideas.png"],
                "body": (
                    "Turn any B2B keyword into ready-to-record video scripts & YouTube outlines 🎬 Check out our Video Studio workflow.\n\n"
                    "🔗 Discover verified workflows: https://www.getyourclientsb2b.com/#discovery\n\n"
                    "#videostudio #contentcreator #youtubeshorts #b2bmarketing #scriptwriting #getyourclientsb2b"
                )
            },
            {
                "platform": "facebook",
                "link": "https://www.getyourclientsb2b.com/pricing",
                "screenshots": ["/screenshots/growth_video_studio.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Stop staring at blank script templates. Our Video Content Studio generates complete 60-second shorts, structured YouTube tutorials, and screen-recording shot lists in seconds. "
                    "Explore GetyourclientsB2B plans: https://www.getyourclientsb2b.com/pricing"
                )
            },
            {
                "platform": "youtube",
                "link": "https://growth.getyourclientsb2b.com/admin/video",
                "screenshots": ["/screenshots/growth_video_studio.png", "/screenshots/growth_dashboard.png"],
                "body": (
                    "Inside Our AI Video Studio: Automating Scripts, Shot Lists & YouTube Pipelines\n\n"
                    "Watch how we plan video assets that convert viewers into high-intent B2B clients with zero guesswork.\n\n"
                    "🚀 Open the Video Studio: https://growth.getyourclientsb2b.com/admin/video\n\n"
                    "Timestamps:\n0:00 - The Video Bottleneck\n1:10 - Generating Script & Outline\n2:50 - Screen Recording Shot List\n4:30 - YouTube Metadata & Tags"
                )
            }
        ]
    },
    {
        "topic": "Why cold emails bounce and how real-time MX verification protects your domains across 190+ countries",
        "pillar": "tips_and_stats",
        "posts": [
            {
                "platform": "x",
                "link": "https://growth.getyourclientsb2b.com/admin/campaigns",
                "screenshots": ["/screenshots/growth_campaigns.png", "/screenshots/growth_leads.png"],
                "body": (
                    "The #1 reason outbound campaigns fail is stale email lists that trigger spam traps.\n\n"
                    "How GetyourclientsB2B safeguards your sending reputation:\n"
                    "• Real-time MX & SMTP verification before sending\n"
                    "• Automated deliverability pause if bounce rate crosses 5%\n"
                    "• Interactive client discovery across 190+ countries\n\n"
                    "Check live campaigns: https://growth.getyourclientsb2b.com/admin/campaigns"
                )
            },
            {
                "platform": "linkedin",
                "link": "https://www.getyourclientsb2b.com/#discovery",
                "screenshots": ["/screenshots/growth_leads.png", "/screenshots/growth_campaigns.png"],
                "body": (
                    "A 7% bounce rate is enough to permanently damage your secondary domain's Google and Microsoft deliverability score.\n\n"
                    "Inside GetyourclientsB2B, outreach safety is built into the core infrastructure:\n\n"
                    "1. Every single contact is verified on-demand via live MX & mailbox handshakes\n"
                    "2. Intelligent sending ramps that throttle volume to match domain health\n"
                    "3. Automated unified inbox with sentiment categorization\n\n"
                    "Explore verified B2B lead discovery across 190+ countries: https://www.getyourclientsb2b.com/#discovery\n\n"
                    "How often do you purge unverified contacts from your outreach sequences?"
                )
            },
            {
                "platform": "instagram",
                "link": "https://growth.getyourclientsb2b.com/admin/leads",
                "screenshots": ["/screenshots/growth_leads.png", "/screenshots/growth_campaigns.png"],
                "body": (
                    "Never burn your cold outbound domains again 🛡️ Real-time MX verification, automated sequence ramps, and verified contact lists.\n\n"
                    "🔗 Discover verified leads: https://growth.getyourclientsb2b.com/admin/leads\n\n"
                    "#coldemail #emaildeliverability #b2bsales #leadgeneration #prospecting #getyourclientsb2b"
                )
            },
            {
                "platform": "facebook",
                "link": "https://www.getyourclientsb2b.com/#pipeline",
                "screenshots": ["/screenshots/growth_campaigns.png", "/screenshots/growth_leads.png"],
                "body": (
                    "Protect your outbound pipeline from bounce penalties. Our verified B2B engine checks MX records in real time and automatically pauses sequences to safeguard your domain health. "
                    "Explore our outreach CRM: https://www.getyourclientsb2b.com/#pipeline"
                )
            },
            {
                "platform": "youtube",
                "link": "https://growth.getyourclientsb2b.com/admin/inbox",
                "screenshots": ["/screenshots/growth_inbox.png", "/screenshots/growth_campaigns.png"],
                "body": (
                    "How to Maintain 98%+ Cold Email Deliverability with Automated Bounce Protection\n\n"
                    "We break down the technical safeguards required to run outbound campaigns without landing in spam.\n\n"
                    "🚀 Explore our Unified Inbox & Sequences: https://growth.getyourclientsb2b.com/admin/inbox\n\n"
                    "Timestamps:\n0:00 - The Deliverability Trap\n1:30 - Real-Time MX Checks\n3:15 - Sequence Health Ramps\n5:00 - Unified Inbox Management"
                )
            }
        ]
    },
    {
        "topic": "Replacing 5 disconnected sales and marketing subscriptions with one unified growth engine dashboard",
        "pillar": "competitor_alternatives",
        "posts": [
            {
                "platform": "x",
                "link": "https://growth.getyourclientsb2b.com/admin/dashboard",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/growth_connections.png"],
                "body": (
                    "Agency tech stacks are bloated. You don't need 5 different $99/mo tools.\n\n"
                    "GetyourclientsB2B consolidates everything in one engine:\n"
                    "1. Global B2B Lead Discovery (190+ countries)\n"
                    "2. Cold Outreach CRM & Automated Sequences\n"
                    "3. Social Media Studio & Approval Calendar\n"
                    "4. Programmatic SEO Manager & Video Studio\n\n"
                    "Live Dashboard: https://growth.getyourclientsb2b.com/admin/dashboard"
                )
            },
            {
                "platform": "linkedin",
                "link": "https://www.getyourclientsb2b.com/",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/home.png"],
                "body": (
                    "Managing prospecting in tool A, email sequences in tool B, social posting in tool C, and SEO in tool D creates massive data silos.\n\n"
                    "We built GetyourclientsB2B as the complete operating system for B2B client acquisition:\n\n"
                    "• Full-funnel intelligence from lead search to signed contracts\n"
                    "• Automated multi-channel publishing with human approval guards\n"
                    "• Complete attribution tracking so you know exactly which channel drives revenue\n\n"
                    "Experience the unified growth platform: https://www.getyourclientsb2b.com/\n\n"
                    "How many subscriptions does your sales and marketing team currently juggle?"
                )
            },
            {
                "platform": "instagram",
                "link": "https://growth.getyourclientsb2b.com/admin/dashboard",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/growth_launch.png"],
                "body": (
                    "All-in-one B2B client acquisition: verified leads, cold outreach CRM, social media automation & SEO manager in one place 📈\n\n"
                    "🔗 Tour the dashboard: https://growth.getyourclientsb2b.com/admin/dashboard\n\n"
                    "#growthengine #b2bsales #crm #socialmediaautomation #seomanager #getyourclientsb2b"
                )
            },
            {
                "platform": "facebook",
                "link": "https://www.getyourclientsb2b.com/pricing",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/growth_launch.png"],
                "body": (
                    "Cut software fatigue. GetyourclientsB2B unifies global lead discovery, cold email outreach, multi-channel social studio, and programmatic SEO into one high-efficiency platform. "
                    "Check out our pricing: https://www.getyourclientsb2b.com/pricing"
                )
            },
            {
                "platform": "youtube",
                "link": "https://growth.getyourclientsb2b.com/admin/dashboard",
                "screenshots": ["/screenshots/growth_dashboard.png", "/screenshots/growth_connections.png"],
                "body": (
                    "The Ultimate B2B Client Acquisition Engine (Full Platform Tour & Demo)\n\n"
                    "Watch a complete live demonstration of GetyourclientsB2B: lead discovery across 190+ countries, cold outreach CRM, social studio & SEO manager.\n\n"
                    "🚀 Start growing today: https://growth.getyourclientsb2b.com/admin/dashboard\n\n"
                    "Timestamps:\n0:00 - Overview & Problem\n1:15 - Global Lead Discovery\n3:00 - Cold Outreach & Safeguards\n5:20 - Social Media Studio\n7:10 - Programmatic SEO Manager"
                )
            }
        ]
    }
]

async def seed_growth_content():
    async with AsyncSessionLocal() as session:
        base_time = datetime.now(timezone.utc) + timedelta(hours=2)
        total_ideas = 0
        total_posts = 0

        for c_idx, campaign in enumerate(CAMPAIGNS):
            idea = ContentIdea(
                topic=campaign["topic"],
                pillar=campaign["pillar"],
                source="manual",
                status="approved",
            )
            session.add(idea)
            await session.flush()
            total_ideas += 1

            for p_idx, post_data in enumerate(campaign["posts"]):
                sched_time = base_time + timedelta(days=c_idx, hours=p_idx * 2)
                plat = post_data["platform"]
                target_link = ensure_website_url(post_data["link"])
                utm = utm_dict(
                    source=plat,
                    medium="social",
                    campaign=campaign["pillar"],
                    content=str(idea.id),
                )
                post = Post(
                    idea_id=idea.id,
                    platform=plat,
                    body=post_data["body"],
                    media_urls=post_data["screenshots"],
                    link_url=target_link,
                    utm=utm,
                    status="pending_approval",
                    scheduled_at=sched_time,
                )
                session.add(post)
                total_posts += 1

        await session.commit()
        print(f"Successfully created {total_ideas} Content Ideas and {total_posts} Platform Posts!")

if __name__ == "__main__":
    asyncio.run(seed_growth_content())
