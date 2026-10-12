"use client";

import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  stats: {
    totalUsers: number;
    totalFreelancers: number;
    approvedFreelancers: number;
    pendingFreelancers: number;
    totalWorkSamples: number;
    totalCategories: number;
    totalBlogs: number;
  };
  usersByRole: { admin: number; user: number; worker: number };
  monthlySignups: { month: string; count: number }[];
  topFreelancers: {
    _id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewsCount: number;
    badge: string;
  }[];
};

const roleColors = {
  user: "#10b981",
  worker: "#6366f1",
  admin: "#f59e0b",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load dashboard");
        if (active) setData(result);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load dashboard");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const pieBackground = useMemo(() => {
    if (!data) return "#e2e8f0";
    const values = [
      { value: data.usersByRole.user, color: roleColors.user },
      { value: data.usersByRole.worker, color: roleColors.worker },
      { value: data.usersByRole.admin, color: roleColors.admin },
    ];
    const total = values.reduce((sum, entry) => sum + entry.value, 0);
    if (!total) return "#e2e8f0";
    let angle = 0;
    return `conic-gradient(${values.map(({ value, color }) => {
      const start = angle;
      angle += (value / total) * 360;
      return `${color} ${start}deg ${angle}deg`;
    }).join(", ")})`;
  }, [data]);

  const maxMonthlySignups = Math.max(1, ...(data?.monthlySignups.map((entry) => entry.count) || []));

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading dashboard…</div>;
  }

  if (error || !data) {
    return <div role="alert" className="p-6 text-sm text-rose-600">{error || "Dashboard data is unavailable."}</div>;
  }

  const statCards = [
    { label: "Total Clients", value: data.stats.totalUsers, gradient: "from-emerald-500 to-teal-700", icon: "👥" },
    { label: "Total Freelancers", value: data.stats.totalFreelancers, gradient: "from-indigo-500 to-violet-700", icon: "💼" },
    { label: "Approved Freelancers", value: data.stats.approvedFreelancers, gradient: "from-sky-500 to-blue-700", icon: "✓" },
    { label: "Pending Approval", value: data.stats.pendingFreelancers, gradient: "from-amber-400 to-orange-600", icon: "◷" },
    { label: "Work Samples", value: data.stats.totalWorkSamples, gradient: "from-violet-500 to-purple-700", icon: "▧" },
    { label: "Categories", value: data.stats.totalCategories, gradient: "from-rose-500 to-pink-700", icon: "▦" },
    { label: "Blog Posts", value: data.stats.totalBlogs, gradient: "from-cyan-500 to-sky-700", icon: "▤" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Marketplace activity and freelancer performance at a glance.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Marketplace statistics">
        {statCards.map((card) => (
          <article key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">{card.label}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl text-white" aria-hidden="true">{card.icon}</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-white">{formatNumber(card.value)}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Accounts by role</h2>
          <p className="mt-1 text-sm text-slate-500">Distribution of registered accounts</p>
          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <div
              role="img"
              aria-label={`Account roles: ${data.usersByRole.user} clients, ${data.usersByRole.worker} freelancers, ${data.usersByRole.admin} admins`}
              className="relative h-48 w-48 shrink-0 rounded-full"
              style={{ background: pieBackground }}
            >
              <div className="absolute inset-9 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-bold text-slate-900">
                  {formatNumber(data.usersByRole.user + data.usersByRole.worker + data.usersByRole.admin)}
                </span>
                <span className="text-xs text-slate-500">accounts</span>
              </div>
            </div>
            <ul className="w-full max-w-xs space-y-4">
              {([
                ["Clients", data.usersByRole.user, roleColors.user],
                ["Freelancers", data.usersByRole.worker, roleColors.worker],
                ["Admins", data.usersByRole.admin, roleColors.admin],
              ] as const).map(([label, count, color]) => (
                <li key={label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                  <span className="font-semibold text-slate-900">{formatNumber(count)}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">New client signups</h2>
          <p className="mt-1 text-sm text-slate-500">Monthly client registrations over the last six months</p>
          <div className="mt-8 flex h-52 items-end justify-around gap-3 border-b border-slate-200 px-2">
            {data.monthlySignups.map((entry, index) => (
              <div key={`${entry.month}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-600">{formatNumber(entry.count)}</span>
                <div
                  className="w-full max-w-12 rounded-t-lg bg-emerald-500 transition-all"
                  style={{ height: `${Math.max((entry.count / maxMonthlySignups) * 75, 3)}%` }}
                  role="img"
                  aria-label={`${entry.count} client signups in ${entry.month}`}
                />
                <span className="pb-2 text-xs text-slate-500">{entry.month}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top 5 Freelancers</h2>
            <p className="mt-1 text-sm text-slate-500">Approved freelancers ranked by rating and review count</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {data.topFreelancers.length} listed
          </span>
        </div>
        {data.topFreelancers.length ? (
          <div className="divide-y divide-slate-100">
            {data.topFreelancers.map((freelancer, index) => (
              <article key={freelancer._id} className="flex items-center gap-4 px-6 py-4">
                <span className="w-7 text-sm font-bold text-slate-400">#{index + 1}</span>
                {freelancer.avatar ? (
                  <img src={freelancer.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                    {freelancer.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{freelancer.name}</p>
                  <p className="text-xs text-slate-500">
                    {freelancer.badge || "Approved freelancer"} · {freelancer.reviewsCount} {freelancer.reviewsCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600">★ {freelancer.rating.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">Rating</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-slate-500">No approved freelancers yet.</p>
        )}
      </section>
    </div>
  );
}
