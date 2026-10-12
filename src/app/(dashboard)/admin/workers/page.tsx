"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API = "/api/admin/workers";

type Status = "pending" | "approved" | "reject";
type GenderFilter = "all" | "male" | "female";
type RatingFilter = "all" | "top-rated";
type StatusFilter = "all" | Status;

const ITEMS_PER_PAGE = 7;

interface WorkerRow {
  _id: string;

  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  } | null;

  badge: string;

  category?: {
    _id: string;
    name: string;
  } | null;

  gender?: string;
  language?: string;

  status: Status;

  rating: number;
  reviewsCount: number;
}

export default function AdminWorkersPage() {
  const [items, setItems] = useState<WorkerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");

  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Delete
  const [toDelete, setToDelete] = useState<WorkerRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action dropdown
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Change status
  const [statusWorker, setStatusWorker] = useState<WorkerRow | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<Status>("pending");

  const [changingStatus, setChangingStatus] = useState(false);

  // Load workers
  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API, {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to load sellers");
      }

      setItems(json.workers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Worker name
  const getWorkerName = (worker: WorkerRow) => {
    return (
      `${worker.user?.firstName || ""} ${worker.user?.lastName || ""}`.trim() ||
      "Unnamed Seller"
    );
  };

  // Status color
  const getStatusClass = (status: Status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "reject":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // -----------------------------------------
  // FILTER
  // -----------------------------------------

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Gender
    if (genderFilter !== "all") {
      result = result.filter(
        (worker) => worker.gender?.toLowerCase() === genderFilter,
      );
    }

    // Top Rated
    if (ratingFilter === "top-rated") {
      result = result
        .filter((worker) => (worker.rating || 0) > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((worker) => worker.status === statusFilter);
    }

    return result;
  }, [items, genderFilter, ratingFilter, statusFilter]);

  // -----------------------------------------
  // PAGINATION
  // -----------------------------------------

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    const end = start + ITEMS_PER_PAGE;

    return filteredItems.slice(start, end);
  }, [filteredItems, currentPage]);

  // Keep page valid after filtering/deleting
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, ratingFilter, statusFilter]);

  // -----------------------------------------
  // DELETE
  // -----------------------------------------

  const confirmDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(`${API}/${toDelete._id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to delete seller");
      }

      setToDelete(null);
      await load();
    } catch (err: any) {
      alert(err.message || "Failed to delete seller");
    } finally {
      setDeleting(false);
    }
  };

  // -----------------------------------------
  // STATUS MODAL
  // -----------------------------------------

  const openStatusModal = (worker: WorkerRow) => {
    setOpenMenu(null);
    setStatusWorker(worker);
    setSelectedStatus(worker.status || "pending");
  };

  const changeStatus = async () => {
    if (!statusWorker) return;

    setChangingStatus(true);

    try {
      /*
       * NOTE:
       * This request assumes your backend supports
       * JSON status update.
       */
      const res = await fetch(`${API}/${statusWorker._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to change status");
      }

      setStatusWorker(null);

      await load();
    } catch (err: any) {
      alert(err.message || "Failed to change status");
    } finally {
      setChangingStatus(false);
    }
  };

  // -----------------------------------------
  // CLEAR FILTERS
  // -----------------------------------------

  const clearFilters = () => {
    setGenderFilter("all");
    setRatingFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    genderFilter !== "all" || ratingFilter !== "all" || statusFilter !== "all";

  // -----------------------------------------
  // PAGINATION BUTTONS
  // -----------------------------------------

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="">
      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sellers</h1>

          <p className="text-sm text-slate-500">
            Manage seller / freelancer profiles.
          </p>
        </div>

        <Link
          href="/admin/workers/new"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
        >
          + Add Seller
        </Link>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-4 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* ================= FILTERS ================= */}

      <div className="flex flex-col md:flex-row-reverse md:items-center py-6 justify-between w-full  gap-4">
        {/* Result count */}

        <div className="flex gap-4 flex-wrap">
          {/* Gender */}

          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Gender
            </label>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as GenderFilter)}
              className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Rating */}

          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Rating
            </label>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
              className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>

          {/* Status */}

          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full sm:w-40 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="reject">Reject</option>
            </select>
          </div>

          {/* Clear */}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className=" text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredItems.length}
          </span>{" "}
          seller
          {filteredItems.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No sellers yet.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No sellers found for the selected filters.
          </div>
        ) : (
          /*
           * This wrapper controls BOTH:
           * - vertical scroll
           * - horizontal scroll
           *
           * Table header stays at the top during vertical scrolling.
           */
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[1100px] text-sm">
              {/* TABLE HEADER */}

              <thead className="sticky top-0 z-20 bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">#</th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Seller
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Email
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Category
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Gender
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Language
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Status
                  </th>

                  <th className="text-left px-4 py-3 whitespace-nowrap">
                    Rating
                  </th>

                  <th className="text-right px-4 py-3 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {paginatedItems.map((w, i) => {
                  const name = getWorkerName(w);

                  const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;

                  return (
                    <tr
                      key={w._id}
                      className="border-t border-slate-100 hover:bg-slate-50/50"
                    >
                      {/* # */}

                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {rowNumber}
                      </td>

                      {/* Seller */}

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {w.user?.avatar ? (
                            <img
                              src={w.user.avatar}
                              alt={name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center shrink-0">
                              {name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 whitespace-nowrap">
                              {name}
                            </div>

                            {w.badge && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-300 whitespace-nowrap">
                                ★ {w.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {w.user?.email || "—"}
                      </td>

                      {/* Category */}

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {w.category?.name || "—"}
                      </td>

                      {/* Gender */}

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {w.gender || "—"}
                      </td>

                      {/* Language */}

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {w.language || "—"}
                      </td>

                      {/* Status */}

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold capitalize whitespace-nowrap ${getStatusClass(
                            w.status,
                          )}`}
                        >
                          {w.status}
                        </span>
                      </td>

                      {/* Rating */}

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-amber-500 font-bold">★</span>{" "}
                        <span className="font-semibold text-slate-900">
                          {(w.rating || 0).toFixed(1)}
                        </span>{" "}
                        <span className="text-slate-400 text-xs">
                          ({w.reviewsCount || 0})
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(openMenu === w._id ? null : w._id)
                              }
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                            >
                              Actions ▾
                            </button>

                            {openMenu === w._id && (
                              <div className="absolute right-0 top-full mt-2 z-30 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
<Link
  href={`/admin/workers/${w._id}`}
  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100"
>
  View
</Link>

                                {/* Edit */}

                                <Link
                                  href={`/admin/workers/${w._id}/edit`}
                                  onClick={() => setOpenMenu(null)}
                                  className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Edit
                                </Link>

                                {/* Change Status */}

                                <button
                                  type="button"
                                  onClick={() => openStatusModal(w)}
                                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  Change Status
                                </button>

                                {/* Delete */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    setToDelete(w);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}

      {!loading && filteredItems.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Pagination info */}

          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredItems.length}
            </span>
          </p>

          {/* Pagination buttons */}

          <div className="flex items-center gap-1">
            {/* Previous */}

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            {/* Pages */}

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-9 h-9 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                  currentPage === page
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next */}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= CHANGE STATUS MODAL ================= */}

      {statusWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Change Seller Status
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Update status for{" "}
              <span className="font-semibold text-slate-700">
                {getWorkerName(statusWorker)}
              </span>
            </p>

            <div className="mt-5">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as Status)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="pending">Pending</option>

                <option value="approved">Approved</option>

                <option value="reject">Reject</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStatusWorker(null)}
                disabled={changingStatus}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={changeStatus}
                disabled={changingStatus}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {changingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Delete seller?</h3>

            <p className="text-sm text-slate-500 mt-1">
              &quot;
              {getWorkerName(toDelete)}
              &quot; will be permanently deleted. Their work samples will become
              available again.
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
