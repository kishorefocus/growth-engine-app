"use client";

import { useState } from "react";
import { useBrandProfile, useUpdateBrandProfile, useDomainHealth } from "@/lib/hooks";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  Globe,
  RefreshCw,
  ExternalLink,
  Info,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

function SectionCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full bg-blue-500" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h2>
          </div>
          {description && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xl">{description}</p>}
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all";
const TEXTAREA_CLS = INPUT_CLS + " resize-none";

export default function SettingsPage() {
  const { data: brand, isLoading } = useBrandProfile();
  const update = useUpdateBrandProfile();

  const [form, setForm] = useState({
    product_name: "",
    one_liner: "",
    tone: "",
    value_props: "",
    banned_phrases: "",
    website_url: "",
    physical_address: "",
  });

  const [checkDomain, setCheckDomain] = useState("getyourclientsb2b.com");
  const [activeDomainQuery, setActiveDomainQuery] = useState("getyourclientsb2b.com");
  const { data: domainHealth, isLoading: isCheckingDomain, refetch: refetchDomain } = useDomainHealth(activeDomainQuery);

  const [initialized, setInitialized] = useState(false);
  if (brand && !initialized) {
    setForm({
      product_name: brand.product_name || "",
      one_liner: brand.one_liner || "",
      tone: brand.tone || "",
      value_props: (brand.value_props || []).join("\n"),
      banned_phrases: (brand.banned_phrases || []).join("\n"),
      website_url: brand.website_url || "",
      physical_address: brand.physical_address || "",
    });
    if (brand.website_url) {
      try {
        const url = new URL(brand.website_url);
        setCheckDomain(url.hostname.replace(/^www\./, ""));
        setActiveDomainQuery(url.hostname.replace(/^www\./, ""));
      } catch (e) {
        // use default
      }
    }
    setInitialized(true);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({
        product_name: form.product_name,
        one_liner: form.one_liner,
        tone: form.tone,
        value_props: form.value_props.split("\n").map((s) => s.trim()).filter(Boolean),
        banned_phrases: form.banned_phrases.split("\n").map((s) => s.trim()).filter(Boolean),
        website_url: form.website_url,
        physical_address: form.physical_address,
      });
      toast.success("Brand profile saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save brand profile.");
    }
  };

  const handleDomainCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDomain.trim()) return;
    setActiveDomainQuery(checkDomain.trim().toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm p-8">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-5 md:p-8 max-w-4xl space-y-8">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
          <Settings className="w-3.5 h-3.5" />
          Account
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
          Settings & Deliverability
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
          Configure your brand profile, sending domain authentication, and outreach compliance
        </p>
      </div>

      {/* Sending Domain Health Checklist */}
      <SectionCard
        title="Sending Domain Health & DNS Authentication"
        description="Verify SPF, DKIM, and DMARC records to ensure maximum inbox deliverability and prevent spam flagging."
        badge={
          domainHealth && (
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm capitalize",
                domainHealth.overall === "pass"
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-400/40"
                  : domainHealth.overall === "warn"
                  ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 border-amber-400/40"
                  : "text-rose-700 dark:text-rose-300 bg-rose-500/15 dark:bg-rose-500/20 border-rose-400/40"
              )}
            >
              {domainHealth.overall === "pass" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {domainHealth.overall}
            </span>
          )
        }
      >
        <div className="space-y-4">
          <form onSubmit={handleDomainCheck} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={checkDomain}
                onChange={(e) => setCheckDomain(e.target.value)}
                placeholder="sendingdomain.com"
                className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isCheckingDomain}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 shrink-0"
            >
              {isCheckingDomain ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying DNS...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5" /> Check Records</>
              )}
            </button>
          </form>

          {domainHealth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SPF Check */}
              <DnsRecordCard
                name="SPF Record"
                status={domainHealth.spf.status}
                value={domainHealth.spf.record || "No TXT record"}
                hint={domainHealth.spf.hint}
              />
              {/* DKIM Check */}
              <DnsRecordCard
                name="DKIM Signature"
                status={domainHealth.dkim.status}
                value={domainHealth.dkim.selector ? `Selector: ${domainHealth.dkim.selector}` : "Key not found"}
                hint={domainHealth.dkim.hint}
              />
              {/* DMARC Check */}
              <DnsRecordCard
                name="DMARC Policy"
                status={domainHealth.dmarc.status}
                value={domainHealth.dmarc.record || "Not configured"}
                hint={domainHealth.dmarc.hint}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Warm-Up Guidance Card */}
      <SectionCard
        title="Domain Warm-Up Guidance & Ramp Schedule"
        description="To protect your sender reputation, never send at full volume immediately. Follow this progressive 6-week warm-up ramp."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-amber-500 text-white border-2 border-amber-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(120,53,15,1)]">
            <Flame className="w-3.5 h-3.5" /> Warm-up Protocol
          </span>
        }
      >
        <div className="space-y-4">
          {/* Warm-up Table */}
          <div className="border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-widest">Timeline</th>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-widest">Recommended Daily Volume</th>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-widest">Protocol & Deliverability Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(domainHealth?.warmup_schedule || [
                    { week: 1, daily_limit: 20, note: "Start conservative. High personalization only." },
                    { week: 2, daily_limit: 40, note: "Monitor bounce rate (<2%) and spam complaints (<0.1%)." },
                    { week: 3, daily_limit: 75, note: "Expand ICP segment gradually." },
                    { week: 4, daily_limit: 125, note: "Full sequence testing with A/B subject lines." },
                    { week: 5, daily_limit: 200, note: "Healthy domain reputation established." },
                    { week: 6, daily_limit: 300, note: "Scale to standard operating volume." },
                  ]).map((item) => (
                    <tr key={item.week} className="bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-3 font-black text-slate-800 dark:text-slate-200">Week {item.week}</td>
                      <td className="px-4 py-3 font-black text-blue-600 dark:text-blue-400 font-mono">
                        {item.daily_limit} emails / day
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Auto-Pause Info */}
          <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              <strong>Auto-Pause Safety Thresholds:</strong> The background worker checks campaign health every 15 minutes. Any campaign exceeding a <strong>5.0% bounce rate</strong> or <strong>0.3% complaint rate</strong> is automatically paused to safeguard your domain.
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Brand Profile */}
      <form onSubmit={handleSave}>
        <SectionCard
          title="Brand Profile"
          description="Injected into every AI prompt (email copy, social posts, reply classification) to keep voice consistent."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product Name">
                <input
                  id="brand-product-name"
                  type="text"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="GetyourclientsB2B"
                />
              </Field>
              <Field label="Website URL">
                <input
                  id="brand-website-url"
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className={INPUT_CLS}
                  placeholder="https://getyourclientsb2b.com"
                />
              </Field>
            </div>

            <Field label="One-liner">
              <input
                id="brand-one-liner"
                type="text"
                value={form.one_liner}
                onChange={(e) => setForm({ ...form, one_liner: e.target.value })}
                className={INPUT_CLS}
                placeholder="We help founders get international B2B clients"
              />
            </Field>

            <Field label="Tone">
              <input
                id="brand-tone"
                type="text"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                className={INPUT_CLS}
                placeholder="professional, direct, honest — no hype"
              />
            </Field>

            <Field label="Value Props (one per line)">
              <textarea
                id="brand-value-props"
                rows={3}
                value={form.value_props}
                onChange={(e) => setForm({ ...form, value_props: e.target.value })}
                className={TEXTAREA_CLS}
                placeholder={"Reach clients in 50+ countries\nOfficial social APIs only\nHuman in the loop on every send"}
              />
            </Field>

            <Field label="Banned Phrases (one per line)">
              <textarea
                id="brand-banned-phrases"
                rows={2}
                value={form.banned_phrases}
                onChange={(e) => setForm({ ...form, banned_phrases: e.target.value })}
                className={TEXTAREA_CLS}
                placeholder={"guaranteed ROI\n10x your leads"}
              />
            </Field>

            <Field label="Physical Address (Legal footer requirement for CAN-SPAM / GDPR)">
              <input
                id="brand-physical-address"
                type="text"
                value={form.physical_address}
                onChange={(e) => setForm({ ...form, physical_address: e.target.value })}
                className={INPUT_CLS}
                placeholder="123 Growth Way, San Francisco, CA 94107"
              />
            </Field>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={update.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {update.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Brand Profile</>
                )}
              </button>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* Suppression List Quick Link */}
      <SectionCard
        title="Suppression List Management"
        description="Addresses and domains permanently blocked from outreach. Checked automatically before every single send."
      >
        <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Manage unsubscribes, manual opt-outs, and auto-suppressed complaint addresses in the unified Leads center.
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 shrink-0"
          >
            <span>Open Suppression List</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── DNS Record Card ──────────────────────────────────────────────────────────

function DnsRecordCard({
  name,
  status,
  value,
  hint,
}: {
  name: string;
  status: "pass" | "fail" | "warn";
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{name}</span>
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm uppercase",
            status === "pass"
              ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-400/40"
              : status === "warn"
              ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-500/20 border-amber-400/40"
              : "text-rose-700 dark:text-rose-300 bg-rose-500/15 dark:bg-rose-500/20 border-rose-400/40"
          )}
        >
          {status === "pass" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {status}
        </span>
      </div>
      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
        {value}
      </p>
      {hint && (
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
          {hint}
        </p>
      )}
    </div>
  );
}
