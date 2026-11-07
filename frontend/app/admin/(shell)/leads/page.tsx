"use client";

import { useState } from "react";
import {
  useCreateICP,
  useCreateLead,
  useDeleteICP,
  useDeleteLead,
  useEnrollLeads,
  useICPs,
  useImportCsv,
  useImportGlobalReach,
  useLeads,
  useSuppressionList,
  useAddSuppression,
  useRemoveSuppression,
  useVerifyLead,
  useCampaigns,
} from "@/lib/hooks";
import { ICP, Lead } from "@/lib/api-client";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Filter,
  Globe,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "icps" | "suppression">("leads");

  // Filters
  const [selectedIcp, setSelectedIcp] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedVerification, setSelectedVerification] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: icps, isLoading: loadingIcps } = useICPs();
  const { data: leads, isLoading: loadingLeads, refetch: refetchLeads } = useLeads({
    icp_id: selectedIcp || undefined,
    status: selectedStatus || undefined,
    verification_status: selectedVerification || undefined,
  });
  const { data: campaigns } = useCampaigns();

  // Mutations
  const verifyLead = useVerifyLead();
  const deleteLead = useDeleteLead();
  const enrollLeads = useEnrollLeads();

  // Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [showImportGr, setShowImportGr] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const filteredLeads = (leads || []).filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.email.toLowerCase().includes(q) ||
      (l.first_name && l.first_name.toLowerCase().includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q))
    );
  });

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleVerifyOne = async (id: string) => {
    try {
      const res = await verifyLead.mutateAsync(id);
      toast.success(`Verification: ${res.verification_status.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    }
  };

  const handleBulkVerify = async () => {
    if (!selectedLeadIds.length) return;
    toast.info(`Verifying ${selectedLeadIds.length} leads...`);
    let count = 0;
    for (const id of selectedLeadIds) {
      try {
        await verifyLead.mutateAsync(id);
        count++;
      } catch {}
    }
    toast.success(`Verified ${count} leads.`);
  };

  const handleDeleteOne = async (id: string) => {
    if (!confirm("Erase lead? Under GDPR, lead data will be removed while email is kept in suppression.")) return;
    try {
      await deleteLead.mutateAsync(id);
      toast.success("Lead erased and email suppressed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete lead");
    }
  };

  const handleEnroll = async () => {
    if (!selectedCampaignId) {
      toast.error("Please select a campaign.");
      return;
    }
    try {
      const res = await enrollLeads.mutateAsync({
        campaign_id: selectedCampaignId,
        lead_ids: selectedLeadIds,
      });
      toast.success(`Enrolled ${res.enrolled} verified leads into campaign!`);
      if (res.skipped?.length) {
        toast.info(`Skipped ${res.skipped.length} leads (not valid or already enrolled).`);
      }
      setShowEnrollModal(false);
      setSelectedLeadIds([]);
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed.");
    }
  };

  return (
    <div className="relative min-h-screen p-5 md:p-8 space-y-8">
      {/* Ambient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <Users className="w-3.5 h-3.5" />
            CRM
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Leads
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg">
            Build ICPs, import leads, verify deliverability, and enforce zero-spam suppression.
          </p>
        </div>

        {/* Tab Switcher — LAYER 8 */}
        <div className="flex gap-0 border-2 border-slate-900 dark:border-slate-700 rounded-xl overflow-hidden w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)]">
          {(["leads", "icps", "suppression"] as const).map((tab, i) => {
            const icons = { leads: <Users className="w-3.5 h-3.5" />, icps: <Layers className="w-3.5 h-3.5" />, suppression: <ShieldAlert className="w-3.5 h-3.5" /> };
            const labels = { leads: `Leads${leads ? ` (${leads.length})` : ""}`, icps: `ICPs${icps ? ` (${icps.length})` : ""}`, suppression: "Suppression" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "flex items-center gap-2 font-bold text-sm px-4 py-2",
                  i > 0 && "border-l-2 border-slate-900 dark:border-slate-700",
                  activeTab === tab
                    ? "bg-slate-900 dark:bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {icons[tab]}
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative min-w-[220px] flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search leads by name, email, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  />
                </div>

                {/* ICP filter */}
                <select
                  value={selectedIcp}
                  onChange={(e) => setSelectedIcp(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">All ICPs</option>
                  {(icps || []).map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>

                {/* Verification filter */}
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">All Verification</option>
                  <option value="valid">Valid Only</option>
                  <option value="risky">Risky</option>
                  <option value="invalid">Invalid</option>
                  <option value="pending">Pending</option>
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="queued">Queued</option>
                  <option value="contacted">Contacted</option>
                  <option value="replied">Replied</option>
                  <option value="signed_up">Signed Up</option>
                  <option value="unsubscribed">Unsubscribed</option>
                </select>

                {(selectedIcp || selectedVerification || selectedStatus || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedIcp("");
                      setSelectedVerification("");
                      setSelectedStatus("");
                      setSearchQuery("");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-rose-500 text-white border-2 border-rose-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(127,29,29,1)]"
                  >
                    <X className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportGr(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  GlobalReach API
                </button>
                <button
                  onClick={() => setShowImportCsv(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  <Upload className="w-3.5 h-3.5" />
                  CSV Import
                </button>
                <button
                  onClick={() => setShowCreateLead(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Lead
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Action Bar (when items selected) */}
          {selectedLeadIds.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30">
              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-blue-700 dark:text-blue-300">
                  {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? "s" : ""} selected
                </span>
                <span className="text-slate-400">|</span>
                <button
                  onClick={handleBulkVerify}
                  disabled={verifyLead.isPending}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Deliverability
                </button>
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Enroll in Campaign
                </button>
              </div>
              <button
                onClick={() => setSelectedLeadIds([])}
                className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          {/* Leads Table — LAYER 6 */}
          <div className="border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest w-10">
                      <input
                        type="checkbox"
                        checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                        onChange={toggleSelectAll}
                        className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Contact</th>
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Company & Title</th>
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Country</th>
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Verification</th>
                    <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-right font-black text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingLeads ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
                        <p className="text-sm font-medium text-slate-500">Loading leads...</p>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-500">No leads found</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Import leads using GlobalReach API or CSV.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors group"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(lead.id)}
                            onChange={() => toggleSelectOne(lead.id)}
                            className="rounded border-slate-300 dark:border-white/20 text-blue-500 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {lead.first_name || lead.last_name
                              ? `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
                              : "—"}
                          </div>
                          <div className="text-xs font-mono text-slate-400 dark:text-slate-500">{lead.email}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <div className="font-semibold text-slate-700 dark:text-slate-200">{lead.company || "—"}</div>
                          <div className="text-xs text-slate-500">{lead.title || "—"}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400 text-sm">
                          {lead.country || "—"}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <VerificationBadge status={lead.verification_status} />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            title="Verify deliverability"
                            onClick={() => handleVerifyOne(lead.id)}
                            disabled={verifyLead.isPending}
                            className="p-2 rounded-xl border-2 border-transparent hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          </button>
                          <button
                            title="GDPR Erasure"
                            onClick={() => handleDeleteOne(lead.id)}
                            disabled={deleteLead.isPending}
                            className="p-2 rounded-xl border-2 border-transparent hover:border-rose-200 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ICP Management Tab */}
      {activeTab === "icps" && <ICPsTab />}

      {/* Suppression Management Tab */}
      {activeTab === "suppression" && <SuppressionTab />}

      {/* Modal: Create Single Lead */}
      {showCreateLead && (
        <CreateLeadModal
          icps={icps || []}
          onClose={() => setShowCreateLead(false)}
        />
      )}

      {/* Modal: GlobalReach Import */}
      {showImportGr && (
        <GlobalReachImportModal
          icps={icps || []}
          onClose={() => setShowImportGr(false)}
        />
      )}

      {/* Modal: CSV Import */}
      {showImportCsv && (
        <CsvImportModal
          icps={icps || []}
          onClose={() => setShowImportCsv(false)}
        />
      )}

      {/* Modal: Enroll in Campaign */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Enroll in Campaign</h3>
              <button onClick={() => setShowEnrollModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Only verified leads with status <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono">valid</span> will be enrolled.
            </p>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Select Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Choose a campaign...</option>
                {(campaigns || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrollLeads.isPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {enrollLeads.isPending ? "Enrolling..." : "Enroll Leads"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Verification & Status Badges ─────────────────────────────────────────────

function VerificationBadge({ status }: { status: string }) {
  switch (status) {
    case "valid":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Valid
        </span>
      );
    case "risky":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Risky
        </span>
      );
    case "invalid":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-400/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Invalid
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-400/30 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Pending
        </span>
      );
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-500 border-blue-900",
    queued: "bg-violet-500 border-violet-900",
    contacted: "bg-amber-500 border-amber-900",
    replied: "bg-emerald-500 border-emerald-900",
    signed_up: "bg-violet-500 border-violet-900",
    bounced: "bg-rose-500 border-rose-900",
    unsubscribed: "bg-slate-500 border-slate-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]",
        styles[status] || styles.new
      )}
    >
      {status}
    </span>
  );
}

// ─── Modal: Create Single Lead ────────────────────────────────────────────────

function CreateLeadModal({ icps, onClose }: { icps: ICP[]; onClose: () => void }) {
  const createLead = useCreateLead();
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company: "",
    title: "",
    website: "",
    country: "",
    industry: "",
    icp_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync(form);
      toast.success("Lead created.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create lead.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 max-w-lg w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white">Create Lead</h3>
          <button onClick={onClose} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Email *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                placeholder="founder@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                placeholder="Acme Web Studio"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                placeholder="CEO & Co-founder"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                placeholder="US"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Assign ICP</label>
            <select
              value={form.icp_id}
              onChange={(e) => setForm({ ...form, icp_id: e.target.value })}
              className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">None</option>
              {icps.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLead.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {createLead.isPending ? "Creating..." : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: GlobalReach API Dogfooding Import ─────────────────────────────────

function GlobalReachImportModal({ icps, onClose }: { icps: ICP[]; onClose: () => void }) {
  const importGr = useImportGlobalReach();
  const [icpId, setIcpId] = useState(icps[0]?.id || "");
  const [maxResults, setMaxResults] = useState(50);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icpId) {
      toast.error("Please select an ICP to import leads for.");
      return;
    }
    try {
      const res = await importGr.mutateAsync({ icp_id: icpId, max_results: maxResults });
      toast.success(`Imported ${res.imported} new leads from GlobalReach! (Skipped ${res.duplicates_skipped} duplicates)`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "GlobalReach API import failed. Ensure GLOBALREACH_API_KEY is configured.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 border-2 border-violet-300 dark:border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Dogfooding Lead Pull</h3>
              <p className="text-xs font-medium text-slate-500">Import via GlobalReach official API</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500 border border-blue-200 dark:border-blue-500/30 rounded-xl">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            Pulls targeted B2B agency leads matching your chosen Ideal Customer Profile from the GlobalReach lead database.
          </p>
        </div>

        <form onSubmit={handleImport} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Target ICP *</label>
            <select
              required
              value={icpId}
              onChange={(e) => setIcpId(e.target.value)}
              className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              {icps.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Max Leads to Pull</label>
            <input
              type="number"
              min={5}
              max={250}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importGr.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {importGr.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Pull Leads
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: CSV Import ────────────────────────────────────────────────────────

function CsvImportModal({ icps, onClose }: { icps: ICP[]; onClose: () => void }) {
  const importCsv = useImportCsv();
  const [csvText, setCsvText] = useState("");
  const [icpId, setIcpId] = useState("");
  const [mapping, setMapping] = useState({
    email: "email",
    first_name: "first_name",
    last_name: "last_name",
    company: "company",
    title: "title",
    website: "website",
    country: "country",
  });

  const handleParseAndUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }

    const lines = csvText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || "";
      });
      rows.push(row);
    }

    try {
      const res = await importCsv.mutateAsync({
        icp_id: icpId || undefined,
        column_mapping: mapping,
        rows,
      });
      toast.success(`Imported ${res.imported} leads! (Duplicates skipped: ${res.duplicates_skipped})`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "CSV import failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 max-w-xl w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-500" />
            CSV Lead Import
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleParseAndUpload} className="space-y-3.5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Assign to ICP (Optional)</label>
            <select
              value={icpId}
              onChange={(e) => setIcpId(e.target.value)}
              className="w-full px-4 py-2.5 appearance-none cursor-pointer bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">None</option>
              {icps.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
              Paste CSV Content (with header row)
            </label>
            <textarea
              required
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={"email,first_name,company,title,country\nsarah@designagency.com,Sarah,DesignCraft,Owner,US\nmark@webflowpros.io,Mark,FlowPros,CEO,UK"}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all resize-none font-mono"
            />
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Column Mapping</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Email column:</span>
                <input
                  type="text"
                  value={mapping.email}
                  onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all mt-0.5"
                />
              </div>
              <div>
                <span className="text-slate-500 font-medium">Company column:</span>
                <input
                  type="text"
                  value={mapping.company}
                  onChange={(e) => setMapping({ ...mapping, company: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all mt-0.5"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={importCsv.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
            >
              {importCsv.isPending ? "Importing..." : "Process Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ICPs Tab Component ───────────────────────────────────────────────────────

function ICPsTab() {
  const { data: icps, isLoading } = useICPs();
  const createIcp = useCreateICP();
  const deleteIcp = useDeleteICP();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    geography: "",
    company_size: "",
    titles: "",
    keywords: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIcp.mutateAsync({
        name: form.name,
        industry: form.industry,
        geography: form.geography,
        company_size: form.company_size,
        titles: form.titles.split(",").map((s) => s.trim()).filter(Boolean),
        keywords: form.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("ICP created.");
      setShowAddModal(false);
      setForm({ name: "", industry: "", geography: "", company_size: "", titles: "", keywords: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create ICP.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ICP?")) return;
    try {
      await deleteIcp.mutateAsync(id);
      toast.success("ICP deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ICP.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-blue-500" />
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Ideal Customer Profiles</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100"
        >
          <Plus className="w-3.5 h-3.5" />
          Create ICP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
            <p className="text-sm font-medium text-slate-500">Loading ICPs...</p>
          </div>
        ) : (icps || []).length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-12 text-center">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No Ideal Customer Profiles defined yet.</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Click "Create ICP" to add your target audience.</p>
          </div>
        ) : (
          (icps || []).map((icp) => (
            <div
              key={icp.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.85)] dark:hover:shadow-[6px_6px_0px_0px_rgba(99,102,241,0.5)] transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{icp.name}</h4>
                  <button
                    onClick={() => handleDelete(icp.id)}
                    className="p-2 rounded-xl border-2 border-transparent hover:border-rose-200 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
                <div className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  {icp.industry && <div><span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Industry: </span>{icp.industry}</div>}
                  {icp.geography && <div><span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Geo: </span>{icp.geography}</div>}
                  {icp.company_size && <div><span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Size: </span>{icp.company_size}</div>}
                </div>
              </div>

              {icp.titles && icp.titles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {icp.titles.map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-blue-500 text-white border-2 border-blue-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,27,75,1)]">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">New ICP Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Profile Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. US Web Design Agencies 1-10"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Industry</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="Web Design, Marketing"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Geography</label>
                  <input
                    type="text"
                    value={form.geography}
                    onChange={(e) => setForm({ ...form, geography: e.target.value })}
                    placeholder="US, UK, CA"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Company Size</label>
                <input
                  type="text"
                  value={form.company_size}
                  onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                  placeholder="1-10 employees"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Target Titles (comma separated)</label>
                <input
                  type="text"
                  value={form.titles}
                  onChange={(e) => setForm({ ...form, titles: e.target.value })}
                  placeholder="Founder, Owner, Creative Director"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createIcp.isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-500 text-white dark:text-slate-900 font-bold text-sm border-2 border-slate-900 dark:border-blue-400 rounded-xl shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.25)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {createIcp.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suppression Tab Component ────────────────────────────────────────────────

function SuppressionTab() {
  const [search, setSearch] = useState("");
  const { data: suppression, isLoading } = useSuppressionList(search);
  const addSup = useAddSuppression();
  const removeSup = useRemoveSuppression();

  const [newEmail, setNewEmail] = useState("");
  const [reason, setReason] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      await addSup.mutateAsync({ email: newEmail.trim().toLowerCase(), reason: reason.trim() || "manual_admin" });
      toast.success("Added to suppression list.");
      setNewEmail("");
      setReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to suppress email.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove from suppression list? An audit log entry will be created.")) return;
    try {
      await removeSup.mutateAsync(id);
      toast.success("Removed from suppression list.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full bg-blue-500" />
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Suppression List</h2>
      </div>

      {/* Quick Add */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.4)] rounded-2xl p-5 md:p-6">
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Email or Domain</label>
            <input
              required
              type="text"
              placeholder="competitor.com or user@xyz.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            />
          </div>
          <div className="w-48">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Reason</label>
            <input
              type="text"
              placeholder="competitor, opt_out"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={addSup.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-bold text-sm border-2 border-red-900 rounded-xl shadow-[3px_3px_0px_0px_rgba(127,29,29,0.8)] hover:shadow-[1px_1px_0px_0px_rgba(127,29,29,0.8)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            {addSup.isPending ? "Adding..." : "Suppress"}
          </button>
        </form>
      </div>

      {/* Suppression Table — LAYER 6 */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search suppression records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-medium border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">
            Enforced before every single outbound email send.
          </span>
        </div>

        <div className="border-2 border-slate-900 dark:border-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_0px_rgba(99,102,241,0.3)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 dark:bg-slate-800 text-white">
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Email or Domain</th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Reason</th>
                  <th className="px-4 py-3 text-left font-black text-xs uppercase tracking-widest">Added Date</th>
                  <th className="px-4 py-3 text-right font-black text-xs uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 text-sm">Loading suppression list...</td>
                  </tr>
                ) : (suppression || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 text-sm">No suppression records found.</td>
                  </tr>
                ) : (
                  (suppression || []).map((s) => (
                    <tr key={s.id} className="bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{s.email_or_domain}</td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-sm">{s.reason || "unspecified"}</td>
                      <td className="px-4 py-3 font-medium text-slate-500 text-sm">{new Date(s.added_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemove(s.id)}
                          disabled={removeSup.isPending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.12)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
