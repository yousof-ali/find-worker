"use client";

import { useEffect, useState } from "react";

type VisitorPage = {
  path: string;
  visitedAt: string;
  referrer: string;
};

type Visitor = {
  _id: string;
  firstSeenAt: string;
  lastSeenAt: string;
  pageViews: number;
  pages: VisitorPage[];
  browser: string;
  operatingSystem: string;
  deviceType: string;
  ipAddress: string;
  language: string;
  languages: string[];
  timezone: string;
  platform: string;
  screen?: { width?: number; height?: number; colorDepth?: number };
  viewport?: { width?: number; height?: number };
};

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [totals, setTotals] = useState({ visitors: 0, pageViews: 0 });
  const [limit, setLimit] = useState(500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetch("/api/admin/visitors", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load visitor analytics");
        setVisitors(data.visitors || []);
        setTotals(data.totals || { visitors: 0, pageViews: 0 });
        setLimit(data.limit || 500);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load visitor analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  async function deleteVisitor(visitor: Visitor) {
    if (!window.confirm("Permanently delete this visitor record and its page-view history?")) {
      return;
    }

    setDeletingId(visitor._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/visitors/${visitor._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete visitor record");
      setVisitors((current) => current.filter((item) => item._id !== visitor._id));
      setTotals((current) => ({
        visitors: Math.max(0, current.visitors - 1),
        pageViews: Math.max(0, current.pageViews - visitor.pageViews),
      }));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete visitor record");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Website Visitors</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Consent-based analytics only. IP addresses are stored as disclosed in the cookie banner. Exact location and account identities are not collected.
          This list shows the latest {limit} anonymous browser records.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 p-5 text-white shadow-md">
          <p className="text-sm text-white/85">Consented visitor browsers</p>
          <p className="mt-3 text-3xl font-bold">{new Intl.NumberFormat().format(totals.visitors)}</p>
        </article>
        <article className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white shadow-md">
          <p className="text-sm text-white/85">Recorded page views</p>
          <p className="mt-3 text-3xl font-bold">{new Intl.NumberFormat().format(totals.pageViews)}</p>
        </article>
      </section>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading visitor analytics…</p>
      ) : !error && visitors.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No visitors have opted in to analytics yet.
        </p>
      ) : (
        <section className="space-y-4">
          {visitors.map((visitor, index) => (
            <details key={visitor._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50">
                <span className="w-8 text-sm font-bold text-slate-400">#{index + 1}</span>
                <span className="min-w-48 flex-1">
                  <span className="block font-semibold text-slate-900">
                    {visitor.deviceType} · {visitor.browser} · {visitor.operatingSystem}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    First visit {new Date(visitor.firstSeenAt).toLocaleString()}
                  </span>
                </span>
                <span className="text-sm text-slate-600">{visitor.pageViews} page views</span>
                <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                  IP: {visitor.ipAddress || "Unavailable"}
                </span>
                <span className="text-xs text-slate-500">
                  Last seen {new Date(visitor.lastSeenAt).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void deleteVisitor(visitor);
                  }}
                  disabled={deletingId === visitor._id}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === visitor._id ? "Deleting…" : "Delete"}
                </button>
              </summary>
              <div className="grid gap-5 border-t border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-2">
                <div>
                  <h2 className="mb-3 text-sm font-bold text-slate-800">Browser details</h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <dt className="text-slate-500">Device</dt><dd className="text-slate-800">{visitor.deviceType || "—"}</dd>
                    <dt className="text-slate-500">IP address</dt><dd className="break-all font-mono text-slate-800">{visitor.ipAddress || "Unavailable — recorded before IP capture or the hosting proxy did not provide it"}</dd>
                    <dt className="text-slate-500">Browser</dt><dd className="text-slate-800">{visitor.browser || "—"}</dd>
                    <dt className="text-slate-500">Operating system</dt><dd className="text-slate-800">{visitor.operatingSystem || "—"}</dd>
                    <dt className="text-slate-500">Platform</dt><dd className="text-slate-800">{visitor.platform || "—"}</dd>
                    <dt className="text-slate-500">Language</dt><dd className="text-slate-800">{visitor.language || "—"}</dd>
                    <dt className="text-slate-500">Other languages</dt><dd className="break-words text-slate-800">{visitor.languages?.join(", ") || "—"}</dd>
                    <dt className="text-slate-500">Timezone</dt><dd className="text-slate-800">{visitor.timezone || "—"}</dd>
                    <dt className="text-slate-500">Screen</dt><dd className="text-slate-800">{visitor.screen?.width || "—"} × {visitor.screen?.height || "—"} ({visitor.screen?.colorDepth || "—"} bit)</dd>
                    <dt className="text-slate-500">Viewport</dt><dd className="text-slate-800">{visitor.viewport?.width || "—"} × {visitor.viewport?.height || "—"}</dd>
                  </dl>
                </div>
                <div>
                  <h2 className="mb-3 text-sm font-bold text-slate-800">Visited pages (latest 100)</h2>
                  <ol className="max-h-56 space-y-2 overflow-y-auto">
                    {[...(visitor.pages || [])].reverse().map((page, pageIndex) => (
                      <li key={`${page.visitedAt}-${pageIndex}`} className="rounded-lg bg-white p-2.5 text-xs">
                        <p className="break-all font-medium text-slate-800">{page.path}</p>
                        <p className="mt-1 text-slate-500">{new Date(page.visitedAt).toLocaleString()}</p>
                        {page.referrer && <p className="mt-1 break-all text-slate-400">Referrer: {page.referrer}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
