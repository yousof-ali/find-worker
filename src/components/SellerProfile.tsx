"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { FreelancerDetailPlaceholder } from "./DetailLoadingPlaceholder";
import { formatDate } from "@/lib/formatDate";
import { GoArrowRight } from "react-icons/go";


interface Category {
  _id: string;
  name: string;
  count: number;
}

interface MarketplaceBadges {
  platform: string;
  badge: string;
  url: string;
}

interface Education {
  degree: string;
  description: string;
  endDate: string;
  startDate: string;
  institute: string;
}

interface Experience {
  startDate: string;
  role: string;
  endDate: string;
  description: string;
  company: string;
}

interface LinkedProfiles {
  link: string;
  subtitle: string;
  title: string;
  badge: string;
  platform: string;
}

interface WorkSample {
  preview: string;
  projectType: string;
  tools: string[];
  subTitle: string;
  title: string;
  clientName: string;
  deliveryDate: string;
}

interface Worker {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  gender: string;
  language: string;
  about: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  skills: string[];
  dateOfBirth: string;
  category?: Category;
  marketplaceBadges: MarketplaceBadges[];
  education: Education[];
  experience: Experience[];
  linkedProfiles: LinkedProfiles[];
  workSamples: WorkSample[];
}

interface SellerProfileProps {
  id: string;
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

export default function SellerProfile({ id }: SellerProfileProps) {
  const [freelancerDetails, setFreelancerDetails] = useState<Worker | null>(
    null,
  );
  const [loadData, setLoadData] = useState(true);
  const { user } = useAuth();

  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Review Form State
  const [ratingScore, setRatingScore] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  // const [reviews, setReviews] = useState(seller.reviewsList);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Work Sample State
  const [activeSampleFilter, setActiveSampleFilter] = useState<
    "all" | "video" | "design"
  >("all");
  const [selectedSample, setSelectedSample] = useState<WorkSample | null>(null);

  const workSamples = freelancerDetails?.workSamples;
  const filteredSamples =
    activeSampleFilter === "all"
      ? workSamples
      : workSamples?.filter((s) => s.projectType === activeSampleFilter);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);
      setReviewError("");

      const res = await fetch(`/api/workers/${id}/reviews`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data.reviews || []);
      setRatingBreakdown(data.ratingBreakdown || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviewError(
        error instanceof Error ? error.message : "Failed to fetch reviews",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
        setReviewError("Please log in before submitting a review.");
        return;
      }

      if (user.role === "admin") {
        setReviewError("Administrators cannot submit freelancer reviews.");
        return;
      }

      if (user.role === "worker") {
        if (freelancerDetails?.user?._id === user.id) {
          setReviewError("You cannot review your own profile.");
          return;
        }
      } else if (user.role !== "user") {
        setReviewError("Only users and freelancers can submit reviews.");
        return;
      }

      if (!reviewComment.trim()) {
        setReviewError("Please write a comment before submitting your review.");
        return;
      }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const res = await fetch(`/api/workers/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating: ratingScore,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviewComment("");
      setRatingScore(4);

      setReviews((prev) => [data.review, ...prev]);

      setReviewSubmitted(true);

      setTimeout(() => {
        setReviewSubmitted(false);
      }, 3000);

      // Refresh rating breakdown + worker rating
      await fetchReviews();

      // Refresh worker data so rating/reviewsCount update
      const workerRes = await fetch(`/api/workers/${id}`, {
        cache: "no-store",
      });

      if (workerRes.ok) {
        const workerData = await workerRes.json();
        setFreelancerDetails(workerData.worker || null);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);

      setReviewError(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        setLoadData(true);

        const res = await fetch(`/api/workers/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch freelancer details");
        }

        const data = await res.json();
        console.log(data);

        setFreelancerDetails(data.worker || null);
      } catch (error) {
        console.error("Failed to fetch freelancer details:", error);
        setFreelancerDetails(null);
      } finally {
        setLoadData(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  if (loadData) {
    return <FreelancerDetailPlaceholder />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <main className="flex-1 pt-24 pb-20">
        {/* Top Breadcrumb & Actions Bar */}
         {/* const worker = await getWorkerData(id); */}

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 transition-all">
            <span>Link copied to clipboard!</span>
          </div>
        )}

        {/* Main Content Layout: Left 8 Cols, Right 4 Cols */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column (8 Columns) */}
            <div className="lg:col-span-8">
              {/* Hero Profile Banner Card */}
              <div className="relative rounded-3xl p-6 sm:p-9 bg-gradient-to-r from-[#FFF5EC] via-[#FDF3E8] to-[#FDECE0] border border-[#FBE5D4] overflow-hidden">
                {/* Subtle Organic Curved Background Wave Accent */}
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-amber-200/25 blur-2xl pointer-events-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-orange-300/20 blur-2xl pointer-events-none"
                />
                <svg
                  className="absolute -top-4 -right-4 w-48 h-48 text-[#F9DFC9]/40 pointer-events-none"
                  viewBox="0 0 200 200"
                  fill="currentColor"
                >
                  <path
                    d="M42.7,-62.9C53.8,-52.8,60.2,-38.3,66.1,-23.4C72,-8.5,77.4,6.7,73.7,20.4C70,34.1,57.2,46.2,43.2,55.4C29.2,64.6,14.6,70.9,-0.6,71.7C-15.8,72.6,-31.6,68,-44.6,58.8C-57.6,49.6,-67.7,35.8,-71.4,20.4C-75.1,5,-72.4,-12,-64.8,-25.9C-57.2,-39.8,-44.7,-50.6,-31.5,-59.7C-18.3,-68.8,-4.4,-76.2,5,-82.9C14.4,-89.6,31.6,-73,42.7,-62.9Z"
                    transform="translate(100 100)"
                  />
                </svg>

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6">
                  {/* Circular Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md bg-slate-100">
                      <img
                        src={freelancerDetails?.user?.avatar}
                        alt={`${freelancerDetails?.user?.firstName || ""} ${freelancerDetails?.user?.lastName || ""}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online status green dot */}
                    <span
                      title="Online"
                      className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"
                    />
                  </div>

                  {/* Profile Details */}
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {[freelancerDetails?.user?.firstName, freelancerDetails?.user?.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </h1>
                      <span
                        className="w-4 h-4 rounded-full bg-[#10B981] inline-flex items-center justify-center shrink-0"
                        title="Verified Seller"
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
                      {freelancerDetails?.badge ? (
                        freelancerDetails?.badge === "Pro Seller" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-slate-900 text-amber-300 border border-slate-800 shadow-2xs">
                            <span className="text-amber-400 text-xs">★</span>{" "}
                            {freelancerDetails?.badge}
                          </span>
                        ) : freelancerDetails.badge === "Level 3 Seller" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs">
                            <span className="text-violet-600 text-xs font-black">
                              ✦✦✦
                            </span>{" "}
                            {freelancerDetails?.badge}
                          </span>
                        ) : freelancerDetails?.badge === "Level 2 Seller" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                            <span className="text-emerald-600 text-xs font-black">
                              ✦✦
                            </span>{" "}
                            {freelancerDetails?.badge}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-sky-50 text-sky-700 border border-sky-200/90 shadow-2xs">
                            <span className="text-sky-600 text-xs font-black">
                              ✦
                            </span>{" "}
                            {freelancerDetails?.badge}
                          </span>
                        )
                      ) : (
                        <span />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {freelancerDetails?.category?.name}
                    </p>

                    {/* Metadata Row: Rating, Location, Date */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-4 text-xs sm:text-[13px] text-slate-700">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500 font-bold leading-none">
                          ★
                        </span>
                        <span className="font-bold text-slate-900">
                          {freelancerDetails?.rating.toFixed(1)}
                        </span>
                        <span className="text-slate-400">
                          ({freelancerDetails?.reviewsCount}{" "}
                          {freelancerDetails?.reviewsCount === 1
                            ? "Review"
                            : "Reviews"}
                          )
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{freelancerDetails?.location}</span>
                      </div>

                      {/* Birth Date / Member Since */}
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg
                          className="w-3.5 h-3.5 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>
                          {formatDate(freelancerDetails?.dateOfBirth)}
                        </span>
                      </div>
                    </div>

                    {/* Linked External Profiles (Upwork & Fiverr Badges) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4 pt-3.5 border-t border-[#F5D8C1]/70">
                      {freelancerDetails?.marketplaceBadges?.map(
                        (item, indx) => {
                          return (
                            <a
                              key={indx}
                              href={item?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1DBF73]/10 text-[#0e8b4e] border border-[#1DBF73]/30 hover:bg-[#1DBF73]/20 transition-all group/ext shadow-2xs"
                            >
                              <span className="w-2 h-2 rounded-full bg-[#1DBF73]" />
                              <span>
                                {item?.platform} {item?.badge}
                              </span>
                              <GoArrowRight />
                            </a>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* About Freelancer Section */}
              <section className="mt-12">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4">
                  About Freelancer
                </h2>
                <div className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                  <p>{freelancerDetails?.about}</p>
                </div>
              </section>

              {/* Work Samples Section (Videos, Images, Case Studies) */}
              <section className="mt-12 pt-10 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                      <span>✦</span>
                      <span>WORK SAMPLES &amp; SHOWCASE</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Work Samples &amp; Projects
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                      Interactive video demos, high-fidelity prototypes, and
                      verified design system deliverables.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveSampleFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSampleFilter === "all"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All ({workSamples?.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSampleFilter("video")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSampleFilter === "video"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Videos (
                      {
                        workSamples?.filter(
                          (item) => item.projectType === "video",
                        ).length
                      }
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSampleFilter("design")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        activeSampleFilter === "design"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Design &amp; UI (
                      {
                        workSamples?.filter(
                          (item) => item.projectType === "design",
                        ).length
                      }
                      )
                    </button>
                  </div>
                </div>

                {/* Samples Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredSamples?.map((sample, indx) => {
                    const isVideo = sample.projectType === "video";
                    return (
                      <div
                        key={indx}
                        onClick={() => setSelectedSample(sample)}
                        className="group relative bg-white border border-slate-200/90 hover:border-slate-900 rounded-2xl overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                      >
                        {/* Media Thumbnail Container */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                          <img
                            src={sample.preview}
                            alt={sample.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          {/* Media Type Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 backdrop-blur-sm shadow-xs flex items-center gap-1">
                              {isVideo ? (
                                <>
                                  <svg
                                    className="w-3 h-3 text-rose-500 fill-current"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-3 h-3 text-indigo-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <rect
                                      x="3"
                                      y="3"
                                      width="18"
                                      height="18"
                                      rx="2"
                                      ry="2"
                                    />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                  </svg>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Center Play / View Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                              {isVideo ? (
                                <svg
                                  className="w-5 h-5 ml-0.5 fill-current text-slate-900"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-slate-900"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                >
                                  <circle cx="11" cy="11" r="8" />
                                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                  <line x1="11" y1="8" x2="11" y2="14" />
                                  <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <span className="text-[11px] font-medium text-slate-200">
                              Client: {sample.clientName} •{" "}
                              {formatDate(sample.deliveryDate)}
                            </span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 flex flex-col flex-1 justify-between">
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
                              {sample.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {sample.subTitle}
                            </p>
                          </div>

                          {/* Tools & CTA */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {sample.tools.map((tool, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1">
                              <span>
                                {isVideo ? "Watch Demo" : "View Details"}
                              </span>
                              <GoArrowRight />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Education Section */}
              <section className="mt-12 pt-10 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
                  Education
                </h2>
                <div className="space-y-8 relative">
                  {freelancerDetails?.education.map((item, idx) => {
                    const isLast =
                      idx === freelancerDetails?.education.length - 1;
                    return (
                      <div key={idx} className="relative flex gap-5">
                        {/* Timeline Node & Dashed Line */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {idx + 1}
                          </div>
                          {!isLast && (
                            <div className="w-0.5 grow border-l-2 border-dashed border-emerald-400 my-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FDF2EE] text-slate-700 mb-2">
                            {formatDate(item?.startDate)} -{" "}
                            {formatDate(item?.endDate)}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {item.degree}
                          </h3>
                          <p className="text-sm font-semibold text-emerald-600 mt-0.5 mb-2">
                            {item?.institute}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item?.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Work & Experience Section */}
              <section className="mt-12 pt-10 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
                  Work & Experience
                </h2>
                <div className="space-y-8 relative">
                  {freelancerDetails?.experience.map((item, idx) => {
                    const isLast =
                      idx === freelancerDetails?.experience.length - 1;
                    return (
                      <div key={idx} className="relative flex gap-5">
                        {/* Timeline Node & Dashed Line */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {idx + 1}
                          </div>
                          {!isLast && (
                            <div className="w-0.5 grow border-l-2 border-dashed border-emerald-400 my-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FDF2EE] text-slate-700 mb-2">
                            {formatDate(item?.startDate)} -{" "}
                            {formatDate(item?.endDate)}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">
                            {item?.role}
                          </h3>
                          <p className="text-sm font-semibold text-emerald-600 mt-0.5 mb-2">
                            {item?.company}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item?.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Reviews & Ratings Section */}
              <section className="mt-12 pt-10 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
                  {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-100 shadow-xs">
                  <div className="w-full sm:w-56 p-6 rounded-2xl bg-[#FDF2EE] flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-5xl font-black text-amber-500 leading-none">
                      {freelancerDetails?.rating?.toFixed(1) || "0.0"}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-base mt-2.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= Math.round(freelancerDetails?.rating || 0)
                              ? "text-amber-400"
                              : "text-slate-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      {freelancerDetails?.reviewsCount || 0}{" "}
                      {freelancerDetails?.reviewsCount === 1
                        ? "rating"
                        : "ratings"}
                    </span>
                  </div>

                  <div className="w-full space-y-2.5">
                    {ratingBreakdown.map((row) => (
                      <div
                        key={row.star}
                        className="flex items-center gap-3 text-xs text-slate-600 font-medium"
                      >
                        <span className="w-12 shrink-0">{row.star} Star</span>

                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>

                        <span className="w-10 text-right text-slate-400 font-normal shrink-0">
                          {row.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  {reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-6 rounded-2xl bg-white border border-slate-100 shadow-xs"
                    >
                      <div className="flex items-center gap-3.5 mb-3">
                        <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                          {rev.user?.avatar ? (
                            <img
                              src={rev.user.avatar}
                              alt={`${rev.user?.firstName || ""} ${rev.user?.lastName || ""}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg
                                className="w-6 h-6 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {[rev.user?.firstName, rev.user?.lastName]
                              .filter(Boolean)
                              .join(" ") || "User"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="text-amber-500 font-semibold">
                              ★ {rev.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span> {formatDate(rev.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 border-t border-slate-100 pt-8">
                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                      Add a review
                    </h3>
                    <p className="mb-3 text-xs font-normal text-slate-500">
                      Your Rating for this listing
                    </p>

                    <div className="mb-5 flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingScore(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Rate ${star} star`}
                          className="cursor-pointer text-xl transition-transform hover:scale-110 sm:text-2xl"
                        >
                          <span
                            className={
                              (hoverRating || ratingScore) >= star
                                ? "text-amber-400"
                                : "text-slate-300"
                            }
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleAddReview} className="space-y-4">
                      <div>
                        <label
                          htmlFor="comment"
                          className="mb-2 block text-xs font-semibold text-slate-700"
                        >
                          Your Comment
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Write your review..."
                          className="w-full rounded-xl border border-slate-200 p-4 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 sm:text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="cursor-pointer rounded-xl bg-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>

                      {reviewSubmitted && (
                        <p className="text-xs font-medium text-emerald-600">
                          ✓ Review posted successfully!
                        </p>
                      )}
                      {reviewError && (
                        <p className="mt-3 text-xs font-medium text-red-500">
                          {reviewError}
                        </p>
                      )}
                    </form>
                </div>
              </section>
            </div>

            {/* Right Column (4 Columns - Sticky Sidebar) */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                {/* Sidebar Card 1: Rate & Key Details */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                  {/* Detail Key-Value List */}
                  <div className="space-y-4 text-xs sm:text-sm">
                    {/* Location */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>Location</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {freelancerDetails?.location || "N/A"}
                      </span>
                    </div>

                    {/* English Level */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <span>Language</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {freelancerDetails?.language || "N/A"}
                      </span>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="10" cy="14" r="5"></circle>
                          <line x1="19" y1="5" x2="13.6" y2="10.4"></line>
                          <line x1="19" y1="5" x2="14" y2="5"></line>
                          <line x1="19" y1="5" x2="19" y2="10"></line>
                        </svg>
                        <span>Gender</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {freelancerDetails?.gender || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sidebar Card 2: My Skills */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    My Skills
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {freelancerDetails?.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-[#FDF2EE] text-slate-800 hover:bg-[#F9E2D8] transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sidebar Card 3: Verified Linked Profiles (Upwork & Fiverr) */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">
                      Linked Profiles
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {freelancerDetails?.linkedProfiles.map((item, indx) => {
                      return (
                        <div
                          key={indx}
                          className="p-4 rounded-xl border border-slate-200 bg-[#F8FCFA] hover:border-[#1DBF73] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#1DBF73]" />
                              <span className="text-xs font-bold text-slate-900">
                                {item?.platform}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1DBF73]/15 text-[#0d8f50]">
                                {item?.badge}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-amber-500">
                              {item?.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mb-3">
                            {item?.subtitle}
                          </div>
                          <a
                            href={item?.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-lg bg-emerald-600 border border-slate-200 hover:border-[#1DBF73] text-white  text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group/link"
                          >
                            <span>View Fiverr Profile</span>
                            <GoArrowRight />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Work Sample Lightbox & Video Player Modal */}
      {selectedSample && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedSample(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[92vh] flex flex-col relative animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedSample(null)}
              aria-label="Close sample preview"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="relative w-full bg-black shrink-0">
              {selectedSample.projectType === "video" ? (
                <div className="aspect-video w-full flex items-center justify-center bg-black">
                  <video
                    src={selectedSample.preview}
                    poster={selectedSample.title}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] max-h-[460px] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={selectedSample.preview}
                    alt={selectedSample.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="p-6 sm:p-7 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="text-xs text-slate-500 font-medium">
                  Client:{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedSample.clientName}
                  </span>{" "}
                  ({formatDate(selectedSample.deliveryDate)})
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedSample.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                  {selectedSample.subTitle}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Tools &amp; Deliverables
                </div>
                <div className="flex items-center gap-2">
                  {selectedSample.tools.map((item, indx) => {
                    return (
                      <span
                        key={indx}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSample(null)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors  shadow-sm cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      
    </div>
  );
}
