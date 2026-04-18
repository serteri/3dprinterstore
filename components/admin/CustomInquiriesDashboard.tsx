"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Loader2, Save } from "lucide-react";

import { updateCustomInquiryStatus } from "@/app/actions/admin";

type AdminCustomInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  projectType: string;
  material: string | null;
  quantity: string | null;
  budget: string | null;
  timeline: string | null;
  details: string;
  referenceImages: string[];
  status: "NEW" | "IN_REVIEW" | "QUOTED" | "CLOSED";
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type CustomInquiriesDashboardProps = {
  initialInquiries: AdminCustomInquiry[];
};

const STATUS_OPTIONS = ["NEW", "IN_REVIEW", "QUOTED", "CLOSED"] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadgeClass(status: StatusOption) {
  if (status === "NEW") return "border-cyan-700 bg-cyan-950/50 text-cyan-300";
  if (status === "IN_REVIEW") return "border-amber-700 bg-amber-950/50 text-amber-300";
  if (status === "QUOTED") return "border-violet-700 bg-violet-950/50 text-violet-300";
  return "border-emerald-700 bg-emerald-950/50 text-emerald-300";
}

export default function CustomInquiriesDashboard({ initialInquiries }: CustomInquiriesDashboardProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(
    initialInquiries[0]?.id ?? null,
  );
  const [draftStatus, setDraftStatus] = useState<StatusOption>(
    initialInquiries[0]?.status ?? "NEW",
  );
  const [draftNotes, setDraftNotes] = useState(initialInquiries[0]?.adminNotes ?? "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeInquiry = useMemo(
    () => inquiries.find((item) => item.id === activeInquiryId) ?? null,
    [inquiries, activeInquiryId],
  );

  function openInquiry(inquiryId: string) {
    const selected = inquiries.find((item) => item.id === inquiryId);
    if (!selected) return;

    setActiveInquiryId(inquiryId);
    setDraftStatus(selected.status);
    setDraftNotes(selected.adminNotes ?? "");
    setFeedback(null);
    setError(null);
  }

  function saveChanges() {
    if (!activeInquiry) return;

    startTransition(async () => {
      try {
        const updated = await updateCustomInquiryStatus(activeInquiry.id, draftStatus, draftNotes);

        setInquiries((prev) =>
          prev.map((item) =>
            item.id === activeInquiry.id
              ? {
                  ...item,
                  status: updated.status,
                  adminNotes: updated.adminNotes,
                  updatedAt: updated.updatedAt,
                }
              : item,
          ),
        );

        setFeedback("Inquiry updated.");
        setError(null);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to update inquiry.");
        setFeedback(null);
      }
    });
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0B0E13] px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(74,132,200,0.22),transparent_36%),radial-gradient(circle_at_84%_12%,rgba(194,125,45,0.16),transparent_38%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pera Dynamics</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-100">Custom Requests</h1>
          <p className="mt-2 text-sm text-zinc-400">All custom briefs are saved here. Review files, update status, and keep notes.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center rounded-full border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
            >
              Orders
            </Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
          <aside className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
            <div className="border-b border-zinc-800 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Saved Inquiries</p>
            </div>
            <div className="max-h-[68vh] overflow-y-auto">
              {inquiries.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">No custom inquiries yet.</p>
              ) : (
                inquiries.map((inquiry) => {
                  const active = inquiry.id === activeInquiryId;

                  return (
                    <button
                      key={inquiry.id}
                      type="button"
                      onClick={() => openInquiry(inquiry.id)}
                      className={`w-full border-b border-zinc-800 px-4 py-3 text-left transition-colors ${
                        active ? "bg-zinc-900/85" : "hover:bg-zinc-900/55"
                      }`}
                    >
                      <p className="truncate text-sm font-medium text-zinc-100">{inquiry.name}</p>
                      <p className="truncate text-xs text-zinc-400">{inquiry.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusBadgeClass(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        <span className="text-[11px] text-zinc-500">{formatDate(inquiry.createdAt)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
            {!activeInquiry ? (
              <p className="text-sm text-zinc-500">Select an inquiry to view details.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoCard label="Client" value={activeInquiry.name} />
                  <InfoCard label="Email" value={activeInquiry.email} />
                  <InfoCard label="Phone" value={activeInquiry.phone || "-"} />
                  <InfoCard label="Project Type" value={activeInquiry.projectType} />
                  <InfoCard label="Material" value={activeInquiry.material || "-"} />
                  <InfoCard label="Quantity" value={activeInquiry.quantity || "-"} />
                  <InfoCard label="Budget" value={activeInquiry.budget || "-"} />
                  <InfoCard label="Timeline" value={activeInquiry.timeline || "-"} />
                  <InfoCard label="Updated" value={formatDate(activeInquiry.updatedAt)} />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Project Brief</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-200">{activeInquiry.details}</p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Reference Images</p>
                  {activeInquiry.referenceImages.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">No images attached.</p>
                  ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {activeInquiry.referenceImages.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-200 hover:border-zinc-500"
                        >
                          <span className="truncate">{url}</span>
                          <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-[220px_1fr]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-200">Status</label>
                    <select
                      value={draftStatus}
                      onChange={(event) => {
                        setDraftStatus(event.target.value as StatusOption);
                        setFeedback(null);
                        setError(null);
                      }}
                      className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none focus:border-[#0EA5B7]"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-200">Admin Notes</label>
                    <textarea
                      rows={4}
                      value={draftNotes}
                      onChange={(event) => {
                        setDraftNotes(event.target.value);
                        setFeedback(null);
                        setError(null);
                      }}
                      placeholder="Add quote details, follow-up notes, or delivery constraints..."
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-[#0EA5B7]"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>
                ) : null}

                {feedback ? (
                  <p className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200">{feedback}</p>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveChanges}
                    disabled={isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0EA5B7] px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-[#20BFD2] disabled:opacity-60"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-100">{value}</p>
    </div>
  );
}
