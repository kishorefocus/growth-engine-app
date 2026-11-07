"use client";

import React, { useState } from "react";
import {
  useSEOTemplates,
  useCreateSEOTemplate,
  useDeleteSEOTemplate,
  useSEOPages,
  useGenerateSEOPages,
  useBatchPublishSEOPages,
} from "@/lib/hooks";
import { SEOPageItem, SEOTemplate } from "@/lib/api-client";
import { clsx } from "clsx";
import { Search, Zap, FileText, Globe, BarChart3, X } from "lucide-react";

function QualityScore({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) return <span className="font-black text-slate-400">—</span>;
  const cls =
    score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 60
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";
  return <span className={clsx("font-black text-sm", cls)}>{score}</span>;
}

function StatusPill({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Published
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-400/40 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 backdrop-blur-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Draft
    </span>
  );
}

export default function SEOAdminPage() {
  const { data: templates, isLoading: loadingTemplates } = useSEOTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minQuality, setMinQuality] = useState<number | undefined>(undefined);

  const { data: pages, isLoading: loadingPages } = useSEOPages({
    template_id: selectedTemplateId || undefined,
    status: statusFilter || undefined,
    min_quality_score: minQuality,
  });

  const generateMutation = useGenerateSEOPages();
  const batchPublishMutation = useBatchPublishSEOPages();
  const createTemplateMutation = useCreateSEOTemplate();
  const deleteTemplateMutation = useDeleteSEOTemplate();

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewPage, setPreviewPage] = useState<SEOPageItem | null>(null);

  // Selected pages for batch publishing
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);

  // Generation form
  const [genTemplateId, setGenTemplateId] = useState<string>("");
  const [csvContent, setCsvContent] = useState<string>("");
  const [manualVarsText, setManualVarsText] = useState<string>(
    JSON.stringify(
      [
        { industry: "FinTech", city: "Chicago" },
        { industry: "Healthcare", city: "Boston" },
        { industry: "E-Commerce", city: "Seattle" },
      ],
      null,
      2
    )
  );

  // Template creation form
  const [newTemplateType, setNewTemplateType] = useState("industry_city");
  const [newUrlPattern, setNewUrlPattern] = useState("/find-leads/{industry}/{city}");
  const [newTitlePattern, setNewTitlePattern] = useState("Find {industry} Leads in {city} | GlobalReach");
  const [newH1Pattern, setNewH1Pattern] = useState("Find Verified {industry} Leads in {city}");
  const [newBodyPrompt, setNewBodyPrompt] = useState("Write actionable lead gen strategies for {industry} in {city}.");

  const totalPages = pages?.length || 0;
  const publishedPages = pages?.filter((p) => p.status === "published").length || 0;
  const draftPages = pages?.filter((p) => p.status === "draft").length || 0;
  const avgQuality =
    totalPages > 0
      ? Math.round((pages?.reduce((acc, p) => acc + (p.quality_score || 0), 0) || 0) / totalPages)
      : 0;

  const handleToggleSelectPage = (id: string) => {
    setSelectedPageIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDrafts = () => {
    const drafts = (pages || []).filter((p) => p.status === "draft").map((p) => p.id);
    setSelectedPageIds(drafts.slice(0, 50));
  };

  const handleBatchPublish = async () => {
    if (selectedPageIds.length === 0) return;
    await batchPublishMutation.mutateAsync(selectedPageIds);
    setSelectedPageIds([]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = genTemplateId || templates?.[0]?.id;
    if (!tId) return;

    let varsList = [];
    try {
      if (manualVarsText.trim()) {
        varsList = JSON.parse(manualVarsText);
      }
    } catch {
      alert("Invalid JSON format in manual variables.");
      return;
    }

    await generateMutation.mutateAsync({
      templateId: tId,
      variablesList: varsList,
      csvContent: csvContent.trim() || undefined,
    });
    setShowGenerateModal(false);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTemplateMutation.mutateAsync({
      type: newTemplateType,
      url_pattern: newUrlPattern,
      title_pattern: newTitlePattern,
      h1_pattern: newH1Pattern,
      body_prompt: newBodyPrompt,
    });
    setShowTemplateModal(false);
  };

  const STATUS_TABS = [
    { value: "", label: "All" },
    { value: "draft", label: "Drafts" },
    { value: "published", label: "Published" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Search className="w-3.5 h-3.5" />
            Growth
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            SEO Manager
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Generate and publish thousands of high-converting programmatic SEO pages from templates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
          >
            <FileText className="w-4 h-4" />
            New Template
          </button>
          <button
            onClick={() => {
              setGenTemplateId(templates?.[0]?.id || "");
              setShowGenerateModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
          >
            <Zap className="w-4 h-4" />
            Generate Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Pages */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.8)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-blue-500/8 dark:bg-blue-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Pages</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{totalPages}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">Across all templates</div>
        </div>

        {/* Published */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-emerald-500/8 dark:bg-emerald-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Published</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">{publishedPages}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">Live in sitemap &amp; indexing</div>
        </div>

        {/* Drafts */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(245,158,11,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-amber-500/8 dark:bg-amber-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Drafts</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1">{draftPages}</div>
          <div className="font-medium text-xs text-slate-400 mt-1">Quality checked &amp; ready</div>
        </div>

        {/* Avg Quality */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(99,102,241,0.6)] rounded-2xl p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-violet-500/8 dark:bg-violet-500/10" />
          <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg Quality</div>
          <div className={clsx("text-3xl font-black tracking-tight mt-1", avgQuality >= 80 ? "text-emerald-600 dark:text-emerald-400" : avgQuality >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
            {avgQuality}<span className="text-lg font-bold text-slate-400">/100</span>
          </div>
          <div className="font-medium text-xs text-slate-400 mt-1">Enforced &gt; 65 threshold</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter tabs */}
            <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
              {STATUS_TABS.map((tab, i) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={clsx(
                    "font-bold text-sm px-4 py-2",
                    i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                    statusFilter === tab.value
                      ? "bg-slate-900 dark:bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Template filter */}
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">All Templates</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type} ({t.url_pattern})
                </option>
              ))}
            </select>

            {/* Quality filter */}
            <select
              value={minQuality === undefined ? "" : String(minQuality)}
              onChange={(e) => setMinQuality(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">All Quality Scores</option>
              <option value="80">Score ≥ 80 (High Quality)</option>
              <option value="70">Score ≥ 70 (Approved)</option>
            </select>
          </div>

          {/* Batch publish */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllDrafts}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            >
              Select Batch
            </button>
            <button
              onClick={handleBatchPublish}
              disabled={selectedPageIds.length === 0 || batchPublishMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {batchPublishMutation.isPending
                ? "Publishing..."
                : `Approve & Publish (${selectedPageIds.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)] rounded-2xl overflow-hidden">
        {loadingPages ? (
          <div className="p-8 space-y-3">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        ) : pages && pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest w-10">
                    <input
                      type="checkbox"
                      className="accent-blue-500 w-4 h-4"
                      checked={selectedPageIds.length > 0 && selectedPageIds.length === pages.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPageIds(pages.map((p) => p.id));
                        } else {
                          setSelectedPageIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Slug &amp; Title</th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Variables</th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Quality</th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-right font-black text-xs uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pages.map((p) => {
                  const isSelected = selectedPageIds.includes(p.id);
                  const qualityScore = p.quality_score || 0;
                  return (
                    <tr key={p.id} className="bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="accent-blue-500 w-4 h-4"
                          checked={isSelected}
                          onChange={() => handleToggleSelectPage(p.id)}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                          {p.title || p.slug}
                        </div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono">
                          /{p.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {p.variables ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(p.variables).map(([k, v]) => (
                              <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <QualityScore score={p.quality_score} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setPreviewPage(p)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                        >
                          Preview
                        </button>
                        {p.status === "draft" && (
                          <button
                            onClick={() => batchPublishMutation.mutateAsync([p.id])}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
                          >
                            Approve
                          </button>
                        )}
                        {p.status === "published" && (
                          <a
                            href={`/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                          >
                            Live ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-medium text-sm text-slate-500 dark:text-slate-400">
              No programmatic pages generated yet. Click &quot;Generate Batch&quot; to create pages from variable combinations.
            </p>
          </div>
        )}
      </div>

      {/* Generate Batch Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  <Zap className="w-3.5 h-3.5" />
                  Generate
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Programmatic SEO Pages</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Enter variable combinations (JSON or CSV). Each page will be drafted, evaluated for quality, and claims-checked.
                </p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Choose Template
                </label>
                <select
                  value={genTemplateId}
                  onChange={(e) => setGenTemplateId(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                  required
                >
                  {templates?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.type} — {t.url_pattern}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Variable Combinations (JSON Array)
                </label>
                <textarea
                  value={manualVarsText}
                  onChange={(e) => setManualVarsText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none font-mono"
                  placeholder='[{"industry": "SaaS", "city": "Austin"}]'
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Or Upload / Paste CSV Content
                </label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none font-mono"
                  placeholder={"industry,city\nLogistics,Dallas\nReal Estate,Miami"}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {generateMutation.isPending ? "Generating Pages..." : "Generate Pages"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  <FileText className="w-3.5 h-3.5" />
                  Templates
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create New SEO Template</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Define URL and title patterns with variable placeholders like {"{industry}"} and {"{city}"}.
                </p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Type Slug</label>
                <input
                  type="text"
                  value={newTemplateType}
                  onChange={(e) => setNewTemplateType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">URL Pattern</label>
                <input
                  type="text"
                  value={newUrlPattern}
                  onChange={(e) => setNewUrlPattern(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Title Pattern</label>
                <input
                  type="text"
                  value={newTitlePattern}
                  onChange={(e) => setNewTitlePattern(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">H1 Pattern</label>
                <input
                  type="text"
                  value={newH1Pattern}
                  onChange={(e) => setNewH1Pattern(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Body Prompt</label>
                <textarea
                  value={newBodyPrompt}
                  onChange={(e) => setNewBodyPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplateMutation.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{previewPage.title}</h3>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono mt-0.5">/{previewPage.slug}</div>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <strong className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">Meta Description</strong>
                <p className="font-medium text-slate-600 dark:text-slate-300 italic">{previewPage.meta_description}</p>
              </div>

              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <strong className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">Introduction</strong>
                <p className="font-medium text-slate-600 dark:text-slate-300">{previewPage.content_json?.intro}</p>
              </div>

              <div>
                <strong className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3">
                  Sections ({previewPage.content_json?.sections?.length || 0})
                </strong>
                <div className="space-y-3">
                  {previewPage.content_json?.sections?.map((s, idx) => (
                    <div key={idx} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="font-black text-sm text-blue-600 dark:text-blue-400 mb-1">{s.heading}</div>
                      <div className="font-medium text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{s.content}</div>
                    </div>
                  ))}
                </div>
              </div>

              {previewPage.content_json?.faq && (
                <div>
                  <strong className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-3">
                    FAQs ({previewPage.content_json.faq.length})
                  </strong>
                  <div className="space-y-2">
                    {previewPage.content_json.faq.map((f, idx) => (
                      <div key={idx} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-200">Q: {f.question}</div>
                        <div className="font-medium text-sm text-slate-500 dark:text-slate-400 mt-1">A: {f.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-slate-100 dark:border-slate-800 mt-6">
              <button
                onClick={() => setPreviewPage(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              >
                Close Preview
              </button>
              {previewPage.status === "draft" && (
                <button
                  onClick={async () => {
                    await batchPublishMutation.mutateAsync([previewPage.id]);
                    setPreviewPage(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
                >
                  Approve &amp; Publish Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
