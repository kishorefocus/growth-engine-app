"""
Generates an executive, beautifully styled PDF for the 60-Day GrowthEngine & GetYourClients Acquisition Blueprint.
Uses Playwright to render high-fidelity print CSS into a multi-page PDF.
"""

import os
from playwright.sync_api import sync_playwright

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>60-Day GrowthEngine & GetYourClients Acquisition Blueprint</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  @page {
    size: A4 portrait;
    margin: 14mm 12mm 16mm 12mm;
    @bottom-right {
      content: "Page " counter(page) " of " counter(pages);
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }
    @bottom-left {
      content: "GetYourClients.com & GrowthEngine — 60-Day Acquisition Plan";
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    font-size: 9.5pt;
    line-height: 1.45;
    margin: 0;
    padding: 0;
  }

  .header-tag {
    display: inline-block;
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2563eb;
    background: #eff6ff;
    padding: 3px 8px;
    border-radius: 4px;
    margin-bottom: 6px;
    border: 1px solid #dbeafe;
  }

  h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 9pt;
    color: #64748b;
    margin-bottom: 14px;
    line-height: 1.35;
  }

  /* Metric cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 12px;
    text-align: center;
  }

  .metric-value {
    font-size: 15pt;
    font-weight: 800;
    color: #2563eb;
    line-height: 1.1;
  }

  .metric-label {
    font-size: 6.8pt;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
    margin-top: 3px;
  }

  /* Section headers */
  .section-title {
    font-size: 11pt;
    font-weight: 800;
    color: #0f172a;
    border-left: 3.5px solid #2563eb;
    padding-left: 8px;
    margin: 16px 0 8px 0;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
  }

  .section-subtitle {
    font-size: 8.5pt;
    color: #64748b;
    margin-top: -4px;
    margin-bottom: 10px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin-bottom: 12px;
    border-radius: 6px;
    overflow: hidden;
  }

  th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: 700;
    text-align: left;
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  td {
    padding: 6px 8px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    color: #334155;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7pt;
    font-weight: 600;
  }

  .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .badge-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .badge-purple { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }
  .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }

  /* 3-Column Ecosystem / Pillars */
  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 12px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 11px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .card-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .card-body {
    font-size: 7.8pt;
    color: #475569;
    line-height: 1.35;
  }

  /* Alert / Warning Box */
  .alert-box {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    border-right: 1px solid #fef3c7;
    border-top: 1px solid #fef3c7;
    border-bottom: 1px solid #fef3c7;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 14px;
  }

  .alert-title {
    font-size: 8pt;
    font-weight: 700;
    color: #b45309;
    margin-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .alert-text {
    font-size: 7.8pt;
    color: #92400e;
    line-height: 1.35;
  }

  /* Routine box */
  .routine-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 14px;
  }

  .routine-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #166534;
    margin-bottom: 6px;
  }

  .routine-step {
    font-size: 7.8pt;
    color: #14532d;
    margin-bottom: 4px;
    display: flex;
    align-items: baseline;
  }

  .routine-time {
    font-weight: 700;
    min-width: 90px;
    color: #15803d;
  }

  /* Content matrix */
  .matrix-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    margin-bottom: 14px;
  }

  .matrix-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px;
  }

  .matrix-day {
    font-size: 6.8pt;
    font-weight: 800;
    color: #2563eb;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .matrix-theme {
    font-size: 8pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .matrix-desc {
    font-size: 7.2pt;
    color: #64748b;
    line-height: 1.3;
  }

  /* Script boxes */
  .script-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    margin-bottom: 8px;
  }

  .script-tag {
    font-size: 6.8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #2563eb;
    margin-bottom: 2px;
  }

  .script-rule {
    font-size: 7pt;
    color: #64748b;
    margin-bottom: 4px;
    font-style: italic;
  }

  .script-content {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-left: 3px solid #2563eb;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 7.5pt;
    color: #1e293b;
    line-height: 1.35;
    font-style: italic;
  }

  /* Page break utilities */
  .page-break {
    page-break-before: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Calendar styles */
  .phase-header {
    background: #0f172a;
    color: #ffffff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 8.5pt;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 6px;
  }

  .phase-quota {
    font-size: 7pt;
    font-weight: 500;
    color: #93c5fd;
  }

  .day-row {
    display: flex;
    font-size: 7.2pt;
    padding: 3px 6px;
    border-bottom: 1px solid #f1f5f9;
    align-items: baseline;
  }

  .day-row:nth-child(even) {
    background-color: #f8fafc;
  }

  .day-num {
    font-weight: 800;
    color: #2563eb;
    width: 72px;
    flex-shrink: 0;
  }

  .day-sprints {
    flex-grow: 1;
  }

  .sprint-block {
    margin-bottom: 1.5px;
    color: #334155;
    line-height: 1.35;
  }

  .sprint-label {
    font-weight: 700;
    color: #0f172a;
    margin-right: 4px;
  }

  .sprint-time {
    color: #64748b;
    font-size: 7pt;
    margin-right: 4px;
  }

  .milestone-badge {
    background: #fef08a;
    color: #854d0e;
    font-weight: 700;
    font-size: 6.8pt;
    padding: 1px 4px;
    border-radius: 3px;
    margin-left: 4px;
  }

  .footer-meta {
    font-size: 7pt;
    color: #94a3b8;
    text-align: right;
    margin-top: 14px;
  }
</style>
</head>
<body>

<!-- PAGE 1: BLUEPRINT & INFRASTRUCTURE -->
<div class="header-tag">60-DAY GROWTH ENGINE</div>
<h1>GetYourClients & GrowthEngine Acquisition Blueprint</h1>
<div class="subtitle">
  Daily operational follow-limits, profile targeting matrices, programmatic SEO expansion, and organic outreach cadence for LinkedIn, X, Instagram & Facebook.
</div>

<div class="metrics-grid">
  <div class="metric-card">
    <div class="metric-value">2,500+</div>
    <div class="metric-label">60-Day Target Connections</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">1,200+</div>
    <div class="metric-label">Personalized Direct Touches</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">200–300</div>
    <div class="metric-label">Platform Trials & Retainers</div>
  </div>
  <div class="metric-card">
    <div class="metric-value">45–50 min</div>
    <div class="metric-label">Daily Operational Time</div>
  </div>
</div>

<div class="section-title">1. Ideal Customer Profile (ICP) Target Directory</div>
<div class="section-subtitle">Follow and engage specifically with verified account titles who suffer from recurring B2B lead generation dry spells and need automated prospecting.</div>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">Target Segment</th>
      <th style="width: 32%;">Bios / Exact Title Queries</th>
      <th style="width: 16%;">Platform Focus</th>
      <th style="width: 30%;">Bottleneck Addressed</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>B2B Growth & Marketing Agencies</strong></td>
      <td>SMMA Founder, Digital Agency Owner, Growth Agency CEO, B2B Marketing Dir</td>
      <td><span class="badge badge-purple">LinkedIn / Instagram</span></td>
      <td>Manual prospecting consumes 20+ hrs/wk; high labor cost creating multi-platform content.</td>
    </tr>
    <tr>
      <td><strong>Bootstrapped SaaS & AI Founders</strong></td>
      <td>Building in Public, SaaS Founder, Indie Hacker, AI Startup CEO</td>
      <td><span class="badge badge-blue">X (Twitter) / LinkedIn</span></td>
      <td>Zero organic Google footprint; no time to reformat posts across 5 channels; expensive paid ads.</td>
    </tr>
    <tr>
      <td><strong>Cold Outbound & Sales Specialists</strong></td>
      <td>Cold Email Specialist, Lead Gen Consultant, SDR Lead, Head of Sales</td>
      <td><span class="badge badge-green">Facebook / LinkedIn</span></td>
      <td>High bounce rates (>5%), burned domain reputations, low open rates on unverified lists.</td>
    </tr>
    <tr>
      <td><strong>B2B Service Providers & Consultants</strong></td>
      <td>Web Dev Agency, Fractional CMO, B2B Copywriter, GTM Advisor</td>
      <td><span class="badge badge-amber">All Channels</span></td>
      <td>Inconsistent monthly retainer pipeline; erratic inbound presence without scheduled calendar.</td>
    </tr>
  </tbody>
</table>

<div class="section-title">2. The 3 GrowthEngine Automation Pillars</div>

<div class="grid-3">
  <div class="card">
    <div class="card-title">Pillar 1: Cold Outreach Engine</div>
    <div class="card-body">
      <strong>GetYourClients Lead Discovery:</strong><br>
      • High-precision filters by industry, size & title<br>
      • Zero-bounce 99.6% email deliverability shield<br>
      • Multi-step sequences with Claude 3.5 inbox triage
    </div>
  </div>
  <div class="card">
    <div class="card-title">Pillar 2: Social Media Studio</div>
    <div class="card-body">
      <strong>GrowthEngine Omnichannel Repurposing:</strong><br>
      • Input 1 core insight or win<br>
      • AI adapts hooks for X, LinkedIn, IG, FB & YT<br>
      • Unified visual calendar with 1-click publishing
    </div>
  </div>
  <div class="card">
    <div class="card-title">Pillar 3: Programmatic SEO</div>
    <div class="card-body">
      <strong>Automated Organic Search Traffic:</strong><br>
      • 1,500+ long-tail comparison & local pages<br>
      • 95/100 avg content quality & schema rating<br>
      • Free tools (Email Verifier, ROI Grader)
    </div>
  </div>
</div>

<div class="section-title">3. High-Yield Target Ecosystems (Where to Find Them)</div>

<div class="grid-2">
  <div class="card">
    <div class="card-title">Instagram & X Competitor Comment Stripping</div>
    <div class="card-body">
      Monitor active commenters on pages like <em>@instantly.ai</em>, <em>@lemlist</em>, <em>@apollo.io</em>, and cold outreach influencers. Users asking technical questions in their comments are warm, active buyers with active tool budgets.
    </div>
  </div>
  <div class="card">
    <div class="card-title">Facebook Group Prospecting Hubs</div>
    <div class="card-body">
      Join: <em>"Cold Email Masters"</em>, <em>"Agency Growth Secrets"</em>, <em>"SaaS Growth Hacks"</em>, <em>"Digital Agency Owners"</em>. Search group queries daily for: <code>"leads"</code>, <code>"scrape"</code>, <code>"email list"</code>, <code>"prospecting"</code>.
    </div>
  </div>
</div>

<div class="alert-box avoid-break">
  <div class="alert-title">Account Safety & Anti-Shadowban Rules (CRITICAL)</div>
  <div class="alert-text">
    <strong>Strict Operating Limits:</strong> Never exceed 20 follows or 10 new outbound DMs per hour. Keep Month 1 daily actions conservative to thoroughly warm accounts. Always space activities across two distinct 25-minute sprints (Morning & Afternoon). <strong>Rule: Never drop a link in Message #1.</strong> Always provide value first and get consent before delivering tool links.
  </div>
</div>

<!-- PAGE 2: OPERATIONAL CADENCE, THEMES & SCRIPTS -->
<div class="page-break"></div>

<div class="header-tag">DAILY OPERATIONAL SYSTEM</div>
<h1>Engagement Cadence, Content Matrix & Scripts</h1>
<div class="subtitle">Structured daily quotas, 5-day multi-channel theme matrix, and non-salesy conversational DM frameworks.</div>

<div class="section-title">4. Daily 50-Minute Timed Routine (Morning & Afternoon Sprints)</div>

<div class="routine-box avoid-break">
  <div class="routine-title">Structured Daily Routine Checklist (Execute 5 Days / Week)</div>
  <div class="routine-step">
    <span class="routine-time">09:00 – 09:10 (10m)</span>
    <span><strong>Target ICP Follows:</strong> Follow target titles & leave 5 thoughtful comments on competitor & peer posts.</span>
  </div>
  <div class="routine-step">
    <span class="routine-time">09:10 – 09:20 (10m)</span>
    <span><strong>Social Listening:</strong> Check FB group / X keyword searches ("leads", "cold email", "SEO") & drop actionable solutions.</span>
  </div>
  <div class="routine-step">
    <span class="routine-time">09:20 – 09:25 (05m)</span>
    <span><strong>Calendar Check:</strong> Review and approve today's automated multi-network posts in GrowthEngine.</span>
  </div>
  <div class="routine-step">
    <span class="routine-time">15:00 – 15:10 (10m)</span>
    <span><strong>Conversational DMs:</strong> Send 5–10 personalized opening DMs using Scripts 1–3 (Zero-Spam Value Framework).</span>
  </div>
  <div class="routine-step">
    <span class="routine-time">15:10 – 15:20 (10m)</span>
    <span><strong>Inbox Triage:</strong> Reply to active inbound messages and comments using AI categorizer in GrowthEngine Inbox.</span>
  </div>
  <div class="routine-step">
    <span class="routine-time">15:20 – 15:25 (05m)</span>
    <span><strong>SEO / Growth Trigger:</strong> Review indexation status or trigger new programmatic SEO batch in SEO Manager.</span>
  </div>
</div>

<div class="section-title">5. Weekly 5-Day Multi-Platform Content Theme Matrix</div>
<div class="section-subtitle">Your feed content validates your profile authority before prospects reply to your direct messages.</div>

<div class="matrix-grid avoid-break">
  <div class="matrix-card">
    <div class="matrix-day">MON • STRATEGY</div>
    <div class="matrix-theme">Cold Outreach Teardown</div>
    <div class="matrix-desc">Break down a winning cold email copy framework and deliverability math.</div>
  </div>
  <div class="matrix-card">
    <div class="matrix-day">TUE • WORKFLOW</div>
    <div class="matrix-theme">Screen Demo Video</div>
    <div class="matrix-desc">Show 0 to 50 verified leads filtered in 90s, or 1 idea repurposed into 5 posts.</div>
  </div>
  <div class="matrix-card">
    <div class="matrix-day">WED • PROBLEM</div>
    <div class="matrix-theme">Data Quality & SEO Myth</div>
    <div class="matrix-desc">Explain why bounced emails burn domains and why manual posting kills agency margins.</div>
  </div>
  <div class="matrix-card">
    <div class="matrix-day">THU • CASE STUDY</div>
    <div class="matrix-theme">Pipeline Playbook</div>
    <div class="matrix-desc">How a B2B SaaS booked 14 calls in 10 days using programmatic SEO + warm DMs.</div>
  </div>
  <div class="matrix-card">
    <div class="matrix-day">FRI • FREE VALUE</div>
    <div class="matrix-theme">Resource Giveaway</div>
    <div class="matrix-desc">"Comment 'GROWTH' to get our 2026 ICP filter checklist & SEO template pack."</div>
  </div>
</div>

<div class="section-title">6. Conversational DM Scripts (Zero-Spam Value Framework)</div>

<div class="script-card avoid-break">
  <div class="script-tag">SCRIPT 1 — THE SOCIAL MEDIA AUTOMATION TEARDOWN (CREATORS & FOUNDERS)</div>
  <div class="script-rule">Use when someone posts on X or LinkedIn about content creation bottlenecks:</div>
  <div class="script-content">
    "Hey [First Name], saw your thoughts on [topic/post]. Loved your take on scaling outbound. Quick question—are you guys finding B2B prospects mostly through manual LinkedIn search right now or do you use an automated database?"
  </div>
</div>

<div class="script-card avoid-break">
  <div class="script-tag">SCRIPT 2 — THE FACEBOOK GROUP / COMMUNITY VALUE CONNECTION (GROUP MEMBERS)</div>
  <div class="script-rule">Use after leaving a helpful answer on their post inside a B2B or agency community:</div>
  <div class="script-content">
    "Hey [First Name], dropped a reply on your post in [Group Name] regarding list building. Didn't want to clutter the thread with tool recommendations, but we built a clean search workflow for that exact filter at getyourclientsb2b.com. Happy to send over a quick 2-minute walkthrough if you're exploring tools?"
  </div>
</div>

<div class="script-card avoid-break">
  <div class="script-tag">SCRIPT 3 — THE FREE SAMPLE LEAD MAGNET (DIRECT OUTBOUND TO AGENCIES)</div>
  <div class="script-rule">Use for proactive outreach to digital marketing agency founders:</div>
  <div class="script-content">
    "Hey [First Name], great work on the recent case studies at [Agency Name]. I'm testing our new verified B2B prospecting tool (GetYourClients) and pulling 25 customized, verified leads for a few founders in your niche on the house. What industry or title are you looking to close this month?"
  </div>
</div>

<div class="script-card avoid-break">
  <div class="script-tag">SCRIPT 4 — THE PROGRAMMATIC SEO & KEYWORD TEARDOWN (SAAS FOUNDERS)</div>
  <div class="script-rule">Use when founders discuss customer acquisition or scaling organic search:</div>
  <div class="script-content">
    "Hey [First Name], loved your product launch for [Product]. We recently built an engine that programmatically creates 500+ comparison and alternative landing pages targeting high-intent long-tail searches on Google. Happy to share our schema blueprint if you’re looking to scale organic acquisition without ad spend?"
  </div>
</div>

<!-- PAGE 3: 60-DAY MASTER EXECUTION CALENDAR (DAYS 1-30) -->
<div class="page-break"></div>

<div class="header-tag">OPERATIONAL TRACKER</div>
<h1>60-Day Master Execution Calendar (Month 1)</h1>
<div class="subtitle">Timed day-by-day task checklist across Morning (09:00) and Afternoon (15:00) execution sprints.</div>

<div class="phase-header">
  <span>PHASE 1: INFRASTRUCTURE & ACCOUNT WARMUP (DAYS 1–15)</span>
  <span class="phase-quota">DAILY QUOTA: 15 FOLLOWS | 5 COMMENTS | 5 SOFT-INTRO DMS</span>
</div>

<div class="day-row">
  <div class="day-num">Day 1 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Optimize profile headlines across LI, X, IG with link <code>getyourclientsb2b.com</code>; follow 15 agency CEOs.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Leave 5 thoughtful comments on competitor posts; queue Week 1 posts in GrowthEngine Calendar.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 2 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Follow 15 SMMA founders; like recent case studies; post Tue demo video (0 to 50 verified leads in 90s).</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 Script 3 DMs offering 25 free custom leads; review responses in Inbox.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 3 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Search FB groups ("Cold Email Masters") for <code>"bounce"</code>, <code>"scrape"</code>; provide 3 high-value answers.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 Script 2 connection DMs to post authors; deploy first 25 programmatic SEO pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 4 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Connect with 15 Fractional CMOs on LinkedIn; post Thu case study: <em>14 discovery calls in 10 days</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 DMs to engagers from yesterday; check AI response suggestions in GrowthEngine Inbox.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 5 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Friday Resource Giveaway (<em>"Comment LEADS for 2026 checklist"</em>); follow 15 competitor commenters.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Deliver checklist + <a href="https://www.getyourclientsb2b.com/tools/email-verifier">Email Verifier</a> link to hand-raisers; log Week 1 stats.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 6–7</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Light conversational inbox check-in to sustain momentum on pending conversations.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 8 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Follow 15 tech recruiters & sales consultants; publish Mon Strategy: <em>Why 90% of subject lines fail</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 Script 1 DMs to inbound commenters; deploy 50 localized search pages (<code>/find-leads/...</code>).</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 9 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Engage on 5 active X threads under #buildinpublic; post Tue workflow demo of Social Studio.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 Script 1 DMs to SaaS builders spending hours manually repurposing content.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 10 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Add 10 active contributors in agency groups; post teardown on domain warm-up & SPF/DKIM hygiene.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 Script 2 value DMs offering domain health checklist; review campaign delivery stats.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 11 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Connect with 15 LinkedIn creators; post Thu case study: <em>From 0 to 45 qualified sales calls</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 5 conversational follow-up DMs to Week 1 leads; configure sequence testing in Campaigns.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 12 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Friday Resource Giveaway: <em>Subject line grader tool</em>; follow 15 webinar attendees.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send direct access links to commenters; deploy 50 comparison landing pages (<code>/alternatives/...</code>).</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 13–14</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Check-in on trial users; review conversion metrics.</div>
  </div>
</div>

<div class="day-row" style="background: #eff6ff;">
  <div class="day-num">Day 15 (Mon) <span class="milestone-badge">M1</span></div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Full Audit (50m):</span> Review Phase 1 targets: <strong>200+ follows, 75 DMs, 25+ conversations, 15+ trial signups</strong>. Queue Phase 2 content and scale daily quotas.</div>
  </div>
</div>

<div class="page-break"></div>

<div class="header-tag">OPERATIONAL TRACKER</div>
<h1>Phase 2: Community Immersion & SEO Scaling</h1>
<div class="subtitle">Days 16–30: Scale daily outreach cadence, establish community authority, and deploy 500+ SEO pages.</div>

<div class="phase-header">
  <span>PHASE 2: COMMUNITY IMMERSION & SEO SCALING (DAYS 16–30)</span>
  <span class="phase-quota">DAILY QUOTA: 20 FOLLOWS | 8 COMMENTS | 8 TARGETED DMS</span>
</div>

<div class="day-row">
  <div class="day-num">Day 16 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Connect with 20 Seed SaaS founders; publish visual carousel on <em>The Modern B2B Growth Stack</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 Script 1 & 4 DMs; submit sitemap with 250 new programmatic pages to Google Search Console.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 17 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Scrape active commenters on 3 leading influencer posts; leave 8 thoughtful counter-perspectives.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 warm outreach DMs referencing comments; optimize internal linking across programmatic pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 18 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Search FB groups for <em>"agency scaling dry spell"</em>; drop step-by-step breakdown of automated list building.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 personalized walkthrough offers to interested group members; record 90s Loom demo.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 19 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Friday Resource Drop: <em>Free 50 verified B2B leads giveaway</em>; follow 20 marketing directors.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send custom sample lists to top 10 hand-raisers; invite them to test <a href="https://www.getyourclientsb2b.com/">GetYourClients</a>.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 20–21</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Light weekend follow-ups with qualified trials.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 22 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post strategy: <em>How 1 customer interview turns into 5 platform assets</em>; connect with 20 operators.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 conversational DMs; deploy 100 niche landing pages targeting agency sub-specialties.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 23 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post screen clip of GrowthEngine Social Studio; follow 20 B2B consultants.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 Script 1 messages to agencies struggling with social output; audit domain reputations.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 24 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Follow 20 SDR managers; publish data: <em>What subject lines get 70%+ opens across 100k sends</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 value DMs with formula sheet; verify delivery rates in Campaigns dashboard.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 25 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Attend/listen to LinkedIn audio room or X Space; post case study: <em>Outbound agency scales to $35k MRR</em>.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Reach out to 8 event attendees with contextual intro DMs; update automated email templates.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 26 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Friday Resource Drop: <em>The 2026 Programmatic SEO Architecture Map</em>; follow 20 SaaS founders.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Deliver map + trial links to commenters; deploy 150 programmatic comparison pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 27–28</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Light conversational inbox maintenance.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 29 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post breakdown on outbound deliverability benchmarks; connect with 20 growth agency owners.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 8 follow-up DMs to Day 15–20 trial users; inspect Search Console impressions.</div>
  </div>
</div>

<div class="day-row" style="background: #eff6ff;">
  <div class="day-num">Day 30 (Tue) <span class="milestone-badge">M2</span></div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Month 1 Review (50m):</span> <strong>500+ total follows, 200+ DMs sent, 50+ trial users onboarded, 600+ SEO pages live</strong>. Transition accounts to Phase 3 full-scale volume.</div>
  </div>
</div>

<!-- PAGE 4: 60-DAY MASTER EXECUTION CALENDAR (DAYS 31-60) -->
<div class="page-break"></div>

<div class="header-tag">OPERATIONAL TRACKER</div>
<h1>60-Day Master Execution Calendar (Month 2)</h1>
<div class="subtitle">Scaled volume, multi-platform repurposing, conversion sprint, and automated hands-off loop.</div>

<div class="phase-header">
  <span>PHASE 3: SCALED OUTBOUND & FUNNEL CONVERSION (DAYS 31–45)</span>
  <span class="phase-quota">DAILY QUOTA: 25 FOLLOWS | 10 COMMENTS | 10–12 PIPELINE DMS</span>
</div>

<div class="day-row">
  <div class="day-num">Day 31 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Follow 25 verified B2B marketing founders; leave 10 tactical comments on trending posts.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 solution DMs focusing on lead prospecting pain points; deploy 150 localized pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 32 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post case study: <em>How 1 agency saved 18 hrs weekly with automated scheduling</em>; follow 25 SaaS founders.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 DMs offering customized pipeline consultations; monitor inbox triages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 33 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Friday Resource Drop: <em>Free cold email copy audit for 5 founders</em>; follow 25 specialists.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Record 2-minute Loom audits for hand-raisers; guide audited founders into free trial onboarding.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 34–35</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Conversational replies and active trial support.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 36 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Mon Strategy: <em>The 3 pillars of zero-dollar CAC</em>; connect with 25 agency CEOs on LinkedIn.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 conversational DMs targeting outbound bottlenecks; deploy 100 new programmatic SEO pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 37 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Tue Workflow clip: <em>Filtering 500 decision-makers in 60s</em>; leave 10 comments on competitor complaints.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Reach out to users complaining about Apollo/Instantly pricing and deliverability; check campaign reply rates.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 38 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Search FB groups for <code>"lead list cleaning"</code>; post comprehensive cleaning tutorial.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 DMs with link to <a href="https://www.getyourclientsb2b.com/tools/email-verifier">Email Verifier</a>; log inbound demo requests.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 39 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post case study: <em>From 0 to 2,500 monthly search clicks in 45 days</em>; connect with 25 fractional marketing leads.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 Script 4 DMs explaining programmatic architecture; review Google Search Console keyword queries.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 40 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Deploy Friday Giveaway: <em>60-Day Social Calendar & Content Template</em>; follow 25 founders building in public.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Deliver templates to hand-raisers and invite to test platform; deploy 200 comparison landing pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 41–42</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Light conversational maintenance.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 43 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Mon Strategy: <em>Why multi-channel outreach crushes single-channel cold email</em>; connect with 25 agency owners.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 personalized DMs sharing multi-touch playbook; audit live email deliverability scores.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 44 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Tue Workflow clip showing Claude 3.5 Sonnet auto-drafting replies; follow 25 growth consultants.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 10 conversational DMs to engaged commenters; check trial-to-paid conversion pipeline.</div>
  </div>
</div>

<div class="day-row" style="background: #eff6ff;">
  <div class="day-num">Day 45 (Wed) <span class="milestone-badge">M3</span></div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">45-Day Audit (50m):</span> <strong>1,000+ total follows, 350+ DMs sent, 100+ trials generated, 1,000+ SEO pages live</strong>. Prepare final conversion push for Days 46–60.</div>
  </div>
</div>

<div class="page-break"></div>

<div class="header-tag">OPERATIONAL TRACKER</div>
<h1>Phase 4: Retainer Scaling & Hands-Off Autopilot</h1>
<div class="subtitle">Days 46–60: Convert active trial users into recurring retainers, finalize 1,500+ SEO pages, and lock in daily autopilot.</div>

<div class="phase-header">
  <span>PHASE 4: RETAINER SCALING & HANDS-OFF AUTOPILOT (DAYS 46–60)</span>
  <span class="phase-quota">DAILY QUOTA: 25 FOLLOWS | 10 COMMENTS | 12 CONVERSION DMS</span>
</div>

<div class="day-row">
  <div class="day-num">Day 46 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post case study breakdown: <em>Agency books 8 calls in 14 days</em>; follow 25 high-ticket service providers.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 12 direct conversion DMs offering dedicated onboarding sessions; check Search Console indexing.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 47 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Deploy Friday Giveaway: <em>Exclusive 1-on-1 Pipeline Architecture Review</em>; follow 25 enterprise directors.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Book strategy reviews with qualified respondents; deploy final batch of 250 programmatic landing pages.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 48–49</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Check-in on pending strategy call bookings.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 50 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post breakdown on scaling agency retainers without hiring SDRs; connect with 25 marketing CEOs.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 12 conversion DMs focusing on ROI and saved labor; review organic inbound search queries.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 51 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post workflow clip showing unified scheduled calendar across 5 networks; follow 25 SaaS founders.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 12 solution DMs offering full-suite access; send upgrade prompts to active trial users.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 52 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Search FB groups for <em>"best cold outreach tools 2026"</em>; post comprehensive comparison chart.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 12 personalized walkthrough invitations; review pending prospect deals in pipeline.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 53 (Thu)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post case study: <em>From manual prospecting hell to 15 hours saved every week</em>; follow 25 consultants.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Reach out to free users with founding member pricing; monitor automated campaign metrics.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 54 (Fri)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Deploy Friday Giveaway: <em>Complete 2026 B2B Outbound & SEO Playbook</em>; follow 25 startup advisors.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Deliver playbook and trial registration links; audit total programmatic SEO pages (Target: 1,500+ live).</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Days 55–56</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Weekend (10m):</span> Conversational inbox maintenance.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 57 (Mon)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post Mon Strategy: <em>How we built a self-sustaining client acquisition engine</em>; connect with 25 agency founders.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send 12 warm follow-ups to unclosed conversations; review top-performing SEO landing pages for CRO.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 58 (Tue)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Post video of end-to-end workflow (Scrape -> Clean -> Sequence -> Social); follow 25 marketing leaders.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Close pending monthly retainer agreements; check server and background job queue health.</div>
  </div>
</div>

<div class="day-row">
  <div class="day-num">Day 59 (Wed)</div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label">Morning (25m):</span><span class="sprint-time">[09:00-09:25]</span> Engage with community members who commented throughout the 60 days; share milestone gratitude post.</div>
    <div class="sprint-block"><span class="sprint-label">Afternoon (25m):</span><span class="sprint-time">[15:00-15:25]</span> Send thank-you DMs with client referral incentives; finalize 60-day performance report.</div>
  </div>
</div>

<div class="day-row" style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; margin-top: 4px;">
  <div class="day-num" style="color: #166534;">Day 60 (Thu) <span class="milestone-badge" style="background: #bbf7d0; color: #14532d;">FINAL</span></div>
  <div class="day-sprints">
    <div class="sprint-block"><span class="sprint-label" style="color: #166534;">Comprehensive 60-Day Audit (60m):</span><br>
    • <strong>Network Adds:</strong> 1,250–1,500+ targeted connections<br>
    • <strong>Direct Touches:</strong> 600–750+ personalized conversational DMs<br>
    • <strong>Platform Trials:</strong> 150–250+ registrations across GetYourClients & GrowthEngine<br>
    • <strong>Paid Retainers:</strong> 20–40+ recurring client accounts<br>
    • <strong>SEO Assets:</strong> 1,500+ programmatic landing pages indexed and driving permanent organic traffic<br>
    • <strong>Autopilot Routine:</strong> Establish permanent 30-min/day maintenance rhythm for inbound flywheels.</div>
  </div>
</div>

<div class="page-break"></div>

<div class="header-tag">GROWTH GOALS & AUDIT</div>
<h1>Milestone Tracking & 60-Day KPI Scorecard</h1>
<div class="subtitle">Progressive phase benchmarks, target volume quotas, and expected conversion metrics.</div>

<div class="section-title avoid-break" style="margin-top: 14px;">8. Milestone Tracking & KPI Scorecard</div>

<table class="avoid-break">
  <thead>
    <tr>
      <th>Phase</th>
      <th>Timeframe</th>
      <th>Follows & Adds</th>
      <th>Conversational DMs</th>
      <th>Platform Trials</th>
      <th>Programmatic SEO</th>
      <th>Target Outcome</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Phase 1: Foundation</strong></td>
      <td>Days 1–15</td>
      <td>225+</td>
      <td>75+</td>
      <td>15–25</td>
      <td>100+ pages</td>
      <td>Profile authority, zero shadowbans, initial trial loop.</td>
    </tr>
    <tr>
      <td><strong>Phase 2: Immersion</strong></td>
      <td>Days 16–30</td>
      <td>525+</td>
      <td>195+</td>
      <td>50–70</td>
      <td>600+ pages</td>
      <td>Authority in 4 groups; initial Google indexation.</td>
    </tr>
    <tr>
      <td><strong>Phase 3: Scaled Outbound</strong></td>
      <td>Days 31–45</td>
      <td>900+</td>
      <td>360+</td>
      <td>110–150</td>
      <td>1,100+ pages</td>
      <td>Predictable daily replies; organic search signups.</td>
    </tr>
    <tr>
      <td><strong>Phase 4: Autopilot</strong></td>
      <td>Days 46–60</td>
      <td><strong>1,250–1,500+</strong></td>
      <td><strong>600–750+</strong></td>
      <td><strong>200–250+</strong></td>
      <td><strong>1,500+ pages</strong></td>
      <td><strong>Self-sustaining acquisition flywheel achieved.</strong></td>
    </tr>
  </tbody>
</table>

<div class="footer-meta">
  Generated for GetYourClients (getyourclientsb2b.com) & GrowthEngine (growth.getyourclientsb2b.com). Confidential.
</div>

</body>
</html>
"""

def generate_pdf():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "docs")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, "60_Day_GrowthEngine_Acquisition_Blueprint.pdf")
    temp_html = os.path.join(output_dir, "temp_blueprint.html")

    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    exec_path = chrome_path if os.path.exists(chrome_path) else edge_path

    print(f"Generating PDF via Playwright Chromium ({exec_path})...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=exec_path,
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
        )
        page = browser.new_page()
        page.goto(f"file:///{os.path.abspath(temp_html).replace(os.sep, '/')}", wait_until="networkidle")
        
        page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            margin={
                "top": "12mm",
                "bottom": "14mm",
                "left": "12mm",
                "right": "12mm"
            },
            display_header_footer=False
        )
        browser.close()

    # Clean up temp html
    if os.path.exists(temp_html):
        os.remove(temp_html)

    print(f"Successfully generated: {pdf_path}")
    print(f"File size: {os.path.getsize(pdf_path)} bytes")

if __name__ == "__main__":
    generate_pdf()
