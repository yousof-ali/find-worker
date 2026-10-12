"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiTrash2 } from "react-icons/fi";
import { formatDate } from "@/lib/formatDate";

interface Category {
  _id: string;
  name: string;
}

interface Worker {
  _id: string;
  name: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  category?: Category;
}

interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewUser;
}

interface RatingBreakdown {
  star: number;
  count: number;
  percentage: number;
}

export default function AdminReviewsPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);

  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/reviews", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch workers");
      }

      setWorkers(data.workers || []);

      if (data.workers?.length > 0) {
        setSelectedWorkerId(data.workers[0]._id);
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch workers",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerReviews = async (workerId: string) => {
    if (!workerId) return;

    try {
      setReviewsLoading(true);
      setError("");

      const res = await fetch(`/api/admin/reviews?workerId=${workerId}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setSelectedWorker(data.selectedWorker || null);
      setReviews(data.reviews || []);
      setRatingBreakdown(data.ratingBreakdown || []);
      return data;
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to fetch reviews",
      );
      return null;
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (selectedWorkerId) {
      fetchWorkerReviews(selectedWorkerId);
    }
  }, [selectedWorkerId]);

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(reviewId);
      setError("");

      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      const refreshedData = await fetchWorkerReviews(selectedWorkerId);

      if (refreshedData?.selectedWorker) {
        setWorkers((prev) =>
          prev.map((worker) =>
            worker._id === selectedWorkerId
              ? {
                  ...worker,
                  rating: refreshedData.selectedWorker.rating,
                  reviewsCount: refreshedData.selectedWorker.reviewsCount,
                }
              : worker,
          ),
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Failed to delete review",
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-sm">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.round(rating) ? "text-amber-400" : "text-slate-300"
            }
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        Loading workers...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 gap-5 p-5">
      {/* LEFT - Workers */}
      <div className="w-[320px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Workers</h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a worker to view reviews
          </p>
        </div>

        <div className="h-[calc(100%-85px)] overflow-y-auto">
          {workers.map((worker) => {
            const active = selectedWorkerId === worker._id;

            return (
              <button
                key={worker._id}
                type="button"
                onClick={() => setSelectedWorkerId(worker._id)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition ${
                  active ? "bg-emerald-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  {worker.avatar ? (
                    <Image
                      src={worker.avatar}
                      alt={worker.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                      {/* {worker.name.charAt(0)} */}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900">
                    {worker.name}
                  </h3>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {worker.category?.name || "No category"}
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    {renderStars(worker.rating)}

                    <span className="text-xs text-slate-500">
                      {worker.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>

                  
                </div>
                <span className="text-xs text-slate-500">
                  ({worker.reviewsCount || 0} reviews)
                </span>

                
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {selectedWorker && (
          <>
            {/* Worker Header */}
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                    {selectedWorker.avatar ? (
                      <Image
                        src={selectedWorker.avatar}
                        alt={selectedWorker.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-500">
                        {/* {selectedWorker.name.charAt(0)} */}
                      </div>
                    )}
                  </div>

                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      {selectedWorker.name}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedWorker.category?.name || "No category"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {renderStars(selectedWorker.rating)}

                      <span className="text-sm font-semibold text-slate-700">
                        {selectedWorker.rating?.toFixed(1) || "0.0"}
                      </span>

                      <span className="text-sm text-slate-500">
                        ({selectedWorker.reviewsCount || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating percentage */}
                <div className="w-[220px]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                      Rating
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {selectedWorker.rating
                        ? `${Math.round((selectedWorker.rating / 5) * 100)}%`
                        : "0%"}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          selectedWorker.rating
                            ? (selectedWorker.rating / 5) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Reviews
                </h2>

                <span className="text-sm text-slate-500">
                  {reviews.length} reviews
                </span>
              </div>

              {/* Rating Breakdown */}
              {ratingBreakdown.length > 0 && (
                <div className="mb-6 rounded-xl bg-slate-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold text-slate-800">
                    Rating Breakdown
                  </h3>

                  <div className="space-y-2">
                    {ratingBreakdown.map((item) => (
                      <div key={item.star} className="flex items-center gap-3">
                        <span className="w-10 text-xs text-slate-500">
                          {item.star} ★
                        </span>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-amber-400"
                            style={{
                              width: `${item.percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-10 text-right text-xs text-slate-500">
                          {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {reviewsLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No reviews yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    This worker has not received any reviews.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* User Avatar */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
                            {review.user?.avatar ? (
                              <Image
                                src={review.user.avatar}
                                alt={`${review.user.firstName} ${review.user.lastName}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                                {review.user?.firstName?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {[review.user?.firstName, review.user?.lastName]
                                .filter(Boolean)
                                .join(" ") || "Unknown user"}
                            </h3>

                            <div className="mt-1 flex items-center gap-2">
                              {renderStars(review.rating)}

                              <span className="text-xs text-slate-400">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={deleteLoading === review._id}
                          onClick={() => handleDeleteReview(review._id)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />

                          {deleteLoading === review._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
