"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SparklesIcon } from "./Icons";

interface SpecializationsProps {
  onSelectRole: (roleTitle: string) => void;
}

interface Worker {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  skills: string[];
  category?: {
    _id: string;
    name: string;
  };
}

export default function Specializations({
  onSelectRole,
}: SpecializationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Exactly 12 freelancers so with 4 visible on desktop, there are 12 - 4 + 1 = 9 single-item positions (9 dots)!

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/workers?query=top-rated", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch workers");
        }

        const data = await response.json();

        setWorkers(data.workers || []);
      } catch (error) {
        console.error("Failed to fetch workers:", error);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Dynamically calculate visible count based on responsive viewport
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, workers.length - visibleCount);

  // Advance by ONE ITEM at a time
  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Move back by ONE ITEM at a time
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play advances 1 item at a time, pauses on cursor hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Mobile touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      id="specializations"
      className="py-16 sm:py-24 bg-white border-t border-slate-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-700 mb-3 font-medium">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>OPEN OPPORTUNITIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-sans">
              Highest Rated Freelancers
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1.5 font-normal">
              Lorem ipsum dolor sit amet, consectetur.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Header Arrow Controls: Change one item at a time */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous freelancer"
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next freelancer"
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <Link
              href="/freelancers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors group shrink-0"
            >
              <span>All Freelancers</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Carousel Slider: Sliding one item by one item */}
        <div
          className="relative group/freelancer-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Floating Left Arrow (one by one) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous item"
            className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/freelancer-carousel:opacity-100 focus:opacity-100 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Floating Right Arrow (one by one) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next item"
            className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/freelancer-carousel:opacity-100 focus:opacity-100 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200/80 rounded-[26px] p-5 sm:p-6 min-h-[440px] animate-pulse"
                >
                  {/* Top Header */}
                  <div className="flex items-center justify-between w-full mb-5">
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    <div className="w-9 h-9 bg-slate-200 rounded-full" />
                  </div>

                  {/* Avatar */}
                  <div className="flex justify-center pt-1">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-200 ring-4 ring-slate-100" />
                  </div>

                  {/* Name & Category */}
                  <div className="flex flex-col items-center mt-4">
                    <div className="h-5 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-200 rounded mt-2" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="h-3 w-10 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>

                  {/* Skills */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-7 w-20 bg-slate-200 rounded-full" />
                    <div className="h-7 w-20 bg-slate-200 rounded-full" />
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="h-3 w-14 bg-slate-200 rounded" />
                        <div className="h-4 w-20 bg-slate-200 rounded mt-2" />
                      </div>

                      <div>
                        <div className="h-3 w-10 bg-slate-200 rounded" />
                        <div className="h-4 w-20 bg-slate-200 rounded mt-2" />
                      </div>
                    </div>

                    {/* Button */}
                    <div className="h-10 w-full bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Carousel Track with smooth step-by-step 1-card translation */}
              <div className="overflow-hidden -mx-2.5 sm:-mx-3">
                <div
                  className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                  }}
                >
                  {workers.map((f) => (
                    <div
                      key={f._id}
                      style={{ width: `${100 / visibleCount}%` }}
                      className="shrink-0 p-2.5 sm:p-3"
                    >
                      <div className="group relative bg-white border border-[#E2E8F0] hover:border-slate-900 rounded-[26px] p-5 sm:p-6 flex flex-col justify-between min-h-[440px] h-full transition-all duration-200 select-none shadow-none hover:shadow-none">
                        {/* Top Header: Badge on Left, Favorite Heart on Right */}
                        <div className="flex items-center justify-between w-full mb-1">
                          {/* Seller Tier Badge (Level 1, Level 2, Pro Batch) */}
                          {f.badge ? (
                            f.badge === "Pro Seller" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-slate-900 text-amber-300 border border-slate-800 shadow-2xs">
                                <span className="text-amber-400 text-xs">
                                  ★
                                </span>{" "}
                                {f.badge}
                              </span>
                            ) : f.badge === "Level 3 Seller" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs">
                                <span className="text-violet-600 text-xs font-black">
                                  ✦✦✦
                                </span>{" "}
                                {f.badge}
                              </span>
                            ) : f.badge === "Level 2 Seller" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                                <span className="text-emerald-600 text-xs font-black">
                                  ✦✦
                                </span>{" "}
                                {f.badge}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-sky-50 text-sky-700 border border-sky-200/90 shadow-2xs">
                                <span className="text-sky-600 text-xs font-black">
                                  ✦
                                </span>{" "}
                                {f.badge}
                              </span>
                            )
                          ) : (
                            <span />
                          )}

                          {/* Top-Right Favorite Heart Icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(f._id);
                            }}
                            aria-label={`Save ${f.firstName} ${f.lastName} to favorites`}
                            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors bg-white cursor-pointer ${
                              favorites.includes(f._id)
                                ? "border-rose-200 text-rose-500 bg-rose-50/50"
                                : "border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-slate-300"
                            }`}
                          >
                            <svg
                              className="w-4 h-4 fill-current"
                              viewBox="0 0 24 24"
                            >
                              {favorites.includes(f._id) ? (
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              ) : (
                                <path
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                />
                              )}
                            </svg>
                          </button>
                        </div>

                        <div>
                          {/* Centered Circular Profile Avatar with Status Badge */}
                          <div className="flex justify-center pt-1">
                            <div className="relative">
                              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-4 ring-slate-100 bg-slate-100 shrink-0">
                                <img
                                  src={f.avatar}
                                  alt={`${f.firstName} ${f.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Online status indicator */}
                              <span
                                title="Online now"
                                className="absolute bottom-0 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                              />
                            </div>
                          </div>

                          {/* Name & Title */}
                          <div className="text-center mt-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              <h3 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {[f.firstName, f.lastName]
                                  .filter(Boolean)
                                  .join(" ")}
                              </h3>
                              {/* Verified check badge */}
                              <span
                                className="w-4 h-4 rounded-full bg-[#10B981] inline-flex items-center justify-center shrink-0"
                                title="Verified"
                              >
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="2.5 6 4.8 8.5 9.5 3.5" />
                                </svg>
                              </span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5 font-normal">
                              {f.category?.name}
                            </p>
                          </div>

                          {/* Rating with Stars */}
                          <div className="flex items-center justify-center gap-1.5 mt-2">
                            <span className="text-amber-500 text-sm leading-none">
                              ★
                            </span>
                            <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                              {f.rating.toFixed(1)}
                            </span>
                            <span className="text-xs sm:text-[13px] text-slate-400 font-normal">
                              ({f.reviewsCount}{" "}
                              {f.reviewsCount === 1 ? "Review" : "Reviews"})
                            </span>
                          </div>

                          {/* Skills Tags */}
                          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5">
                            {f.skills.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF2EE] text-[#E05638]"
                              >
                                {tag}
                              </span>
                            ))}

                            {f.skills.length > 2 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF2EE] text-[#E05638]">
                                +{f.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Location & Rate + View Profile Button */}
                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="grid grid-cols-2 text-left mb-3.5">
                            <div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                Location:
                              </div>
                              <div className="text-xs sm:text-[13px] font-bold text-slate-900 mt-0.5 truncate">
                                {f.location}
                              </div>
                            </div>
                            {/* <div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                Rate:
                              </div>
                              <div className="text-xs sm:text-[13px] font-bold text-slate-900 mt-0.5">
                                $450 - 550$
                              </div>
                            </div> */}
                          </div>

                          {/* View Profile Action Button */}
                          <Link
                            href={`/freelancers/${f._id}`}
                            className="w-full py-2.5 rounded-xl border border-slate-900 text-slate-900 font-semibold text-xs sm:text-sm hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-1.5 group/btn cursor-pointer"
                          >
                            <span>View Profile</span>
                            <svg
                              className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="7" y1="17" x2="17" y2="7" />
                              <polyline points="7 7 17 7 17 17" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 9 Pagination Dots: Exactly matches the 9 discrete 1-item positions (12 items - 4 visible + 1 = 9) */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
                  const isActive = currentIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-200 rounded-full cursor-pointer ${
                        isActive
                          ? "w-6 h-1.5 bg-slate-900"
                          : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
