"use client";

import { useAuth } from "@/providers/AuthProvider";
import {

  FiMail,
  FiUser,
} from "react-icons/fi";



export default function PersonalInformation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-52 animate-pulse bg-slate-100" />

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="mb-3 h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  const accountStatus =
    user.role === "worker"
      ? user.worker?.status || "pending"
      : "active";

  const formattedStatus =
    accountStatus.charAt(0).toUpperCase() +
    accountStatus.slice(1);

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const avatar =
    user.avatar && user.avatar.trim()
      ? user.avatar
      : null;

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-7 sm:px-8 lg:px-10">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* User */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-2xl font-bold text-emerald-700 shadow-md sm:h-28 sm:w-28 sm:text-3xl">
                  {user.firstName?.charAt(0).toUpperCase()}
                  {user.lastName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name */}
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <FiUser size={13} />
                Personal Information
              </div>

              <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {fullName}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FiMail className="shrink-0" size={16} />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Account status */}
          <div className="shrink-0 sm:text-right">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                accountStatus === "approved" ||
                accountStatus === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : accountStatus === "rejected" ||
                      accountStatus === "suspended"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  accountStatus === "approved" ||
                  accountStatus === "active"
                    ? "bg-emerald-500"
                    : accountStatus === "rejected" ||
                        accountStatus === "suspended"
                      ? "bg-red-500"
                      : "bg-amber-500"
                }`}
              />

              {formattedStatus}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Account status
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

