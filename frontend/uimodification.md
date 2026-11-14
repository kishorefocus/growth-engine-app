You are a senior product designer and front-end engineer. Build with Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion, and optional GSAP. Reference style: a premium dark agency site (dsquaredmedia-style).

BRAND: GetYourClientsB2B Growth Engine, "Autonomous Social & SEO Infrastructure".

DESIGN TOKENS
- Background: #05060D to #0A0B1A with a subtle radial vignette.
- Gradients: violet #7C5CFF to blue #3B82F6 to cyan #22D3EE; accent pink #FF3D8B for glows.
- Pastel card colors: lavender #C9B8FF, teal #7FE0D3, deep navy #1B1F4B, midnight blue #101A3F.
- Text: white #FFFFFF, muted #A1A6C0. Font: "Plus Jakarta Sans" or "Inter" for body, "Space Grotesk" for headings.
- Radius: 28px for cards, 999px for pills. Glass effect: bg-white/5, backdrop-blur-xl, border border-white/10.

BACKGROUND ANIMATIONS (global)
- Animated mesh gradient with 3 blurred orbs (violet, pink, cyan) drifting slowly (20-30s loop).
- Dotted grid layer with a soft parallax on mouse move.
- Faint particle or star field with twinkling dots, plus thin arcs and orbit lines like a radar.
- Noise overlay at 3% opacity. Respect prefers-reduced-motion.

SIGNATURE COMPONENT: "Tilted Card Rail"
- A row of 4-5 rounded cards, each rotated (-14deg, -4deg, 4deg, 14deg) and vertically staggered in an arc.
- Each card has a pastel gradient background, a device mockup (phone or laptop) inside, and a title plus subtitle at the bottom with a dark gradient fade-out.
- Hover: card straightens to 0deg, scales to 1.05, lifts, and the glow intensifies.
- Idle: each card floats (translateY ±12px, 6s ease-in-out, staggered delays).
- Scroll: cards fan out with parallax using Framer Motion useScroll.

UI DETAILS
- Sticky glass navbar with a gradient "Get Started" pill and an outlined phone/login pill. A green pulsing "Live" status dot.
- Social proof strip: star rating, "Trusted by 100+ agencies", platform logos.
- Gradient text on key words. Buttons have a shimmer sweep on hover.
- Cards have a gradient border that rotates on hover (conic-gradient).
- Smooth section reveals (fade up 24px, stagger 0.08s). Fully responsive, 60fps, lazy-loaded.

Build the landing page for GetYourClientsB2B Growth Engine using the master design system.

HERO
- Eyebrow pill: "Omnichannel B2B Growth Operating System" with a pulsing dot.
- H1: "Automate All Social & SEO in One Unified Engine" (gradient on "Social & SEO").
- Subtext: "Autonomous social publishing, programmatic SEO, CAN-SPAM cold outreach and video planning, from one dashboard."
- CTAs: [Access Growth Dashboard] (gradient, glow) and [Verify Live Backend & DB SLA] (glass outline).
- Rating strip under the CTAs: stars, "5.0 from 100+ agency clients", then Facebook, Instagram, LinkedIn, YouTube, X logos.

PHONE SHOWCASE (centerpiece, full-width under the hero)
- 5 tilted phone mockups in an arc: Instagram, Facebook, LinkedIn, X (Twitter), YouTube. Each sits on a pastel rounded card in the "Tilted Card Rail" style.
- Each phone screen shows a native-looking UI of that platform with an auto-generated, meaningful B2B post:
  * Instagram: carousel post "5 ways agencies land clients on autopilot", with a caption and #B2BGrowth hashtags, plus likes ticking up.
  * Facebook: page post "How top B2B agencies automate client acquisition with zero manual ad spend", with reactions.
  * LinkedIn: founder post "The playbook we used to scale 15 client accounts past $50k MRR", with 'Like, Comment, Repost'.
  * X: thread "3 AI automation tools every agency owner must deploy in 2026 🧵" with retweet and like counters.
  * YouTube: Shorts player with the title "Cold email in 30 seconds", progress bar and a subscribe button.
- ANIMATION: phones float, and every 4s a "typing / auto-generating" effect writes the post text with a blinking cursor, then a green "Published ✓" toast pops above the phone. Likes and comments count up. Small floating notification chips ("+1 lead", "Scheduled 4:00 PM") orbit the phones.
- Hovering a phone straightens it and brings it to the front.

BELOW THE HERO
- Animated stat counters: 142,800+ Monthly Social Reach, 1,200+ Keywords in Top 10, 9,500+ Verified B2B Leads, 3,000+ SEO Pages.
- Then sections 2 to 5 below (dashboard preview, pipeline, features, comparison) and the final CTA and footer.
Use the mesh-gradient and dotted-grid background throughout, with a glow between sections.

Create a "live dashboard preview" section as a browser-window mockup (glass, with traffic-light dots and the URL growth.getyourclientsb2b.com/admin/dashboard).
- Tabs: Social | SEO | Outreach, with an animated sliding underline.
- 3 stat cards: "Meta Connected (FB & IG)", "Scheduled Posts: 48 Due Today, Auto-publish active", "Cross-Network: 5 Channels". Add a "Monthly Reach 142,800+ ↑34%" card with a sparkline that draws itself.
- Below it, the "Autonomous Content Distribution Pipeline" with a "Worker Active" pulsing badge. Rows for Facebook + Instagram, LinkedIn, and YouTube Shorts, each with a platform icon, post title, schedule time ("Today 4:00 PM", "Tomorrow 9:00 AM", "Draft Ready") and a status chip. A new row slides in every 5 seconds, and a progress line animates from Scheduled to Publishing to Published.
- The window tilts slightly in 3D (perspective) and responds to mouse movement.

Create "Live Backend Engine & Database Telemetry" with three glass cards: Frontend (Next.js 14, Edge CDN, TLS 1.3, 0ms), Backend (FastAPI, port 8000, async), Database (PostgreSQL 16, asyncpg, 18ms ping, 10 connections).
- Each card has a status dot (green pulse, or red when offline), a latency number that updates live, and a small animated heartbeat line.
- A "Verify" button fetches the real health endpoint and shows a Healthy or Offline state with a smooth transition. Include a link to the API Docs.

Create a 3x2 bento grid of 6 glass feature cards with an icon in a gradient square, a title, a short description and 3 check-list bullets: Multi-Platform Social Auto-Publishing, Autonomous SEO Page Generator, CAN-SPAM Cold Outreach Engine, Viral Video & Shorts Script Studio, Brand Voice & ICP Guardrails, Multi-Channel Growth Attribution.
- Hover: spotlight gradient follows the cursor, the card lifts, and the border glows.
- Each card has a tiny looping animation (a post being scheduled, a sitemap being pinged, an email flying out, a script timeline, a shield check, a rising chart).

Create a comparison table, "Traditional Stack (6 Tools)" vs "Growth Engine Platform". The Growth Engine column is highlighted with a gradient border and a "Best Value" badge. Rows: Social Media Scheduling, Programmatic SEO Engine, Cold Email Outreach, Video Script Planning, Backend Engine. Use red-muted cross icons on the left and animated green checks on the right. Rows reveal one by one on scroll. Add a "Save $2,000+" counter above the table.

Full-width CTA band with a big animated gradient orb behind it. Heading: "Ready to Put Your Social & SEO Growth on Autopilot?" Buttons: [Client Portal Sign In] and [New Client Setup]. Mini phone cards drift in the background. Footer: logo, tagline "Autonomous Social & SEO Infrastructure", links Client Login, Free Tools, Comparisons, API Docs, and "© 2026 GetYourClientsB2B Inc."

Split-screen layout. Left: a glass login card (email, password with show/hide, "Remember me", gradient [Sign In] button with a loading spinner, and Google/SSO buttons). Right: animated mesh-gradient panel with 3 floating tilted phone cards and rotating testimonials. Inputs have a glowing focus ring and inline validation with shake on error. Link to "New Client Setup".

A 3-step wizard with an animated progress bar: 1) Account, 2) Agency details (name, website, ICP), 3) Connect channels (Facebook/Instagram, LinkedIn, YouTube, X as toggle cards with "Connect" buttons). Step transitions slide horizontally. Finish with a confetti and checkmark success screen, then redirect to the dashboard. Same dark gradient background and glass cards.

Dark sidebar (Overview, Social, SEO, Outreach, Video Studio, Brand Voice, Analytics, Engine Health, Settings) with a glowing active item. Top bar: search, a "Worker Active" status, notifications, avatar. Overview: KPI cards with count-up numbers and sparklines, a gradient area chart for reach and leads, a "Today's scheduled posts" timeline, and an activity feed. Use recharts. Skeleton loaders, a command palette (Ctrl+K), and a mobile bottom nav.

Left: a post composer with a platform selector (FB, IG, LinkedIn, YouTube, X), an "AI Generate Hook, Caption & Hashtags" button with a streaming text effect, an image/video upload, and a schedule picker. Right: live phone preview that switches between each platform's native UI as you type. Bottom: a drag-and-drop calendar and a queue table with status chips (Scheduled / Publishing / Published / Failed) and retry actions.

Show a keyword table (rank, volume, trend sparkline), a "Generate Pages" wizard (template, locations, keywords) with a progress bar, a page quality score ring (0-100) and an indexing status list with a "Ping Google Search Console" button. Add a sitemap preview tree and a JSON-LD schema viewer.

Campaign list with mini funnel bars (Sent, Opened, Replied, Booked). Sequence builder with draggable email steps and a live preview. A mailbox health panel (warmup progress rings, daily cap meters, MX validation badges). Reply inbox with sentiment tags (Positive/Neutral/Negative) and a "Route to CRM" action. An unsubscribe compliance indicator.

Centered tool page with a large glowing input "Paste your email subject line". The [Grade It] button triggers an animated score dial (0-100) with a gradient stroke, then shows suggestions (length, spam words, personalization, power words) as colored chips and 3 improved rewrites with a copy button. Add an email-gate CTA for the full report.

SEO-optimised "Growth Engine vs Apollo for Agencies" page. Hero with two logos and a "VS" badge, a feature comparison table with winner highlights, a pricing comparison bar chart, an FAQ accordion (with FAQ JSON-LD), and a sticky CTA bar. Reuse the glass cards and gradient styling.