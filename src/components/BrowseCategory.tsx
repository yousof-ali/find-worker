"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import CategoryIcon from "./ui/CategoryIcon";


interface BrowseCategoryProps {
  onSelectCategory?: (category: string) => void;
}

type Category = { _id: string; name: string; icon: string; count: number };

const PER_PAGE = 7;

export default function BrowseCategory({
  onSelectCategory,
}: BrowseCategoryProps) {
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  

  // Fetch categories from the API
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error();
        const data: Category[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 7 categories per slide
  const pages = useMemo(() => {
    const result: Category[][] = [];
    for (let i = 0; i < categories.length; i += PER_PAGE) {
      result.push(categories.slice(i, i + PER_PAGE));
    }
    return result;
  }, [categories]);

  const hasMultiplePages = pages.length > 1;

  const handleNext = () => {
    if (!hasMultiplePages) return;
    setActivePage((prev) => (prev + 1) % pages.length);
  };

  const handlePrev = () => {
    if (!hasMultiplePages) return;
    setActivePage((prev) => (prev === 0 ? pages.length - 1 : prev - 1));
  };

  // Auto-play Carousel Animation (cycles every 4.5s, pauses on hover)
  useEffect(() => {
    if (isPaused || pages.length < 2) return;
    const interval = setInterval(() => {
      setActivePage((prev) => (prev + 1) % pages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, pages.length]);

  // Touch swipe support for mobile/tablet devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      id="roles"
      className="py-12 sm:py-16 bg-white border-b border-slate-100 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-sans">
              Browse talent by category
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1 sm:mt-1.5 font-normal">
              Get some Inspirations from 1800+ skills
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Header Arrow Controls */}
            {hasMultiplePages && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all"
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
                  aria-label="Next slide"
                  className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all"
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
            )}

            <a
              href="#top-freelancers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors group shrink-0"
            >
              <span>All Categories</span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5 lg:gap-4 px-0.5">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="min-h-[220px] sm:min-h-[245px] rounded-xl border border-slate-200/80 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-10 text-center text-sm text-slate-500">
            Failed to load categories. Please try again later.
          </div>
        )}

        {/* Empty */}
        {!loading && !error && categories.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            No categories available yet.
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
            {/* Carousel Container with Slider Animation & Hover Pause */}
            <div
              className="relative group/carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {hasMultiplePages && (
                <>
                  {/* Floating Left Arrow Button (visible on hover) */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous slide"
                    className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer"
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

                  {/* Floating Right Arrow Button (visible on hover) */}
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next slide"
                    className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100 cursor-pointer"
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
                </>
              )}

              {/* Animated Carousel Track */}
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{ transform: `translateX(-${activePage * 100}%)` }}
                >
                  {pages.map((pageItems, pageIdx) => (
                    <div key={pageIdx} className="w-full shrink-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-3.5 lg:gap-4 px-0.5">
                        {pageItems.map((cat) => (
                          <div
                            key={cat._id}
                            onClick={() => onSelectCategory?.(cat.name)}
                            className="group relative bg-white border border-slate-200/80 hover:border-slate-900 rounded-xl p-5 sm:p-6 flex flex-col justify-between min-h-[220px] sm:min-h-[245px] transition-colors duration-200 cursor-pointer select-none"
                          >
                            {/* Icon Container with Warm Tinted Circle Badge Behind */}
                            <div className="relative w-12 h-12 flex items-center justify-start">
                              <div
                                aria-hidden="true"
                                className="absolute left-3 top-1 w-9 h-9 rounded-full bg-[#FAF3E7] group-hover:bg-[#F5ECD9] group-hover:scale-105 transition-all duration-200"
                              />
                              <div className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                                <CategoryIcon
                                  svg={cat.icon}
                                  className="w-8 h-8 text-[#1b3e34]"
                                />
                              </div>
                            </div>

                            {/* Text Info */}
                            <div className="mt-auto pt-6 sm:pt-8">
                              <span className="block text-xs text-slate-500 font-normal mb-1.5">
                                {cat.count}{" "}
                                {cat.count === 1 ? "Service" : "Services"}
                              </span>
                              <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                                {cat.name}
                              </h3>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carousel Pagination Dots with Smooth Animated Active Pill */}
            {hasMultiplePages && (
              <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
                {pages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePage(idx)}
                    aria-label={`View category slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      activePage === idx
                        ? "w-6 h-2 bg-slate-900"
                        : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
