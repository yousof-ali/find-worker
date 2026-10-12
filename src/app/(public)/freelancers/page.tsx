"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface Worker {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  gender: string;
  language: string;
  about: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  location: string;
  skills: string[];
  category?: {
    _id: string;
    name: string;
  };
  marketplaceBadges: [
    {
      platform: string;
      badge: string;
      url: string;
    },
  ];
}

interface Category {
  _id: string;
  name: string;
  count: number;
}

function FreelancerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 p-5 sm:p-6 bg-white animate-pulse">
      <div className="flex flex-col md:flex-row items-start justify-between gap-5">
        <div className="flex items-start gap-4 flex-1 w-full">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 shrink-0" />

          <div className="space-y-3 flex-1">
            {/* Name */}
            <div className="h-5 bg-slate-200 rounded-md w-40" />

            {/* Category */}
            <div className="h-3 bg-slate-200 rounded-md w-28" />

            {/* Meta */}
            <div className="flex gap-3">
              <div className="h-3 bg-slate-200 rounded-md w-24" />
              <div className="h-3 bg-slate-200 rounded-md w-20" />
            </div>

            {/* About */}
            <div className="space-y-2 max-w-2xl">
              <div className="h-3 bg-slate-200 rounded-md w-full" />
              <div className="h-3 bg-slate-200 rounded-md w-4/5" />
            </div>

            {/* Skills */}
            <div className="flex gap-2">
              <div className="h-7 w-16 bg-slate-200 rounded-lg" />
              <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              <div className="h-7 w-14 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Profile button */}
        <div className="w-24 h-10 bg-slate-200 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Checkbox */}
            <div className="w-4 h-4 rounded bg-slate-200" />

            {/* Category name */}
            <div
              className={`h-3 rounded bg-slate-200 ${
                index % 2 === 0 ? "w-24" : "w-32"
              }`}
            />
          </div>

          {/* Count */}
          <div className="w-6 h-3 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function FreelancersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(250);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showMoreSkills, setShowMoreSkills] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [englishLevel, setEnglishLevel] = useState<string>("any");
  const [sortBy, setSortBy] = useState<string>("default");
  const [savedFreelancers, setSavedFreelancers] = useState<
    Record<string, boolean>
  >({ "FL-002": true });

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setCategoryLoading(true);

        const res = await fetch("/api/categories", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch category");
        }

        const data = await res.json();

        setCategories(data || []);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/workers", {
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

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const toggleSave = (id: string) => {
    setSavedFreelancers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedLabels([]);
    setMaxHourlyRate(250);
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setEnglishLevel("any");
    setSortBy("default");
  };

  // Filtered & Sorted List
  const filteredFreelancers = useMemo(() => {
    const result = workers.filter((fl) => {
      const skills = fl.skills ?? [];
      const fullName = [fl.firstName, fl.lastName].filter(Boolean).join(" ");
      // Keyword search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = fullName.toLowerCase().includes(term);
        const matchHeadline = fl.category?.name?.toLowerCase().includes(term);
        const matchBio = fl.about?.toLowerCase().includes(term);
        const matchSkills = skills.some((s) => s.toLowerCase().includes(term));
        if (!matchName && !matchHeadline && !matchBio && !matchSkills)
          return false;
      }

      // Category
      if (selectedCategories.length > 0) {
        const catName = fl.category?.name;
        if (!catName || !selectedCategories.includes(catName)) return false;
      }

      // Seller Label & Badge
      if (selectedLabels.length > 0) {
        const matchesLabel = selectedLabels.some((l) =>
          l === "Top Rated" ? fl.rating >= 4.9 : fl.badge === l,
        );
        if (!matchesLabel) return false;
      }

      // Skills
      if (selectedSkills.length > 0) {
        const hasSkill = skills.some((s) =>
          selectedSkills.some((sel) => normalize(s).includes(normalize(sel))),
        );
        if (!hasSkill) return false;
      }

      // Languages
      if (selectedLanguages.length > 0) {
        const workerLang = normalize(fl.language ?? "");
        const hasLang = selectedLanguages.some(
          (sel) => normalize(sel) === workerLang,
        );
        if (!hasLang) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    workers,
    searchTerm,
    selectedCategories,
    selectedLabels,
    selectedSkills,
    selectedLanguages,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredFreelancers.length / ITEMS_PER_PAGE);

  const paginatedFreelancers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredFreelancers.slice(startIndex, endIndex);
  }, [filteredFreelancers, currentPage]);

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    selectedCategories.length +
    selectedLabels.length +
    selectedSkills.length +
    selectedLanguages.length +
    (maxHourlyRate < 250 ? 1 : 0) +
    (englishLevel !== "any" ? 1 : 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategories,
    selectedLabels,
    selectedSkills,
    selectedLanguages,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100  selection:text-emerald-900">
      {/* Hero Banner Card (Reference Design Peach/Cream Curved Styling) */}
      <section className="max-w-[1520px] w-full   mt-28 2xl:max-w-[1600px]  mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
        <div className="relative rounded-3xl  p-8 sm:p-12 bg-gradient-to-r from-[#FFF4EA] via-[#FDF1E6] to-[#FCEEE2] border border-[#FBE3D0] overflow-hidden shadow-xs">
          <div
            aria-hidden="true"
            className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-amber-200/30 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-orange-300/20 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Banner Left Content & Search Input */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-[11px] font-mono font-bold text-amber-900">
                <span>✨ VERIFIED FREELANCE TALENT DIRECTORY</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Freelancers List
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                Connect with pre-screened technical experts, AI alignment
                specialists, and full-stack developers. Secure contracts with
                guaranteed 100% milestone escrow.
              </p>

              {/* Floating Search Bar */}
              <div className="pt-3 max-w-2xl">
                <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-slate-200/80 flex items-center gap-2">
                  <div className="pl-3 text-slate-400 text-base">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by specialist name, title, or keywords..."
                    className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="px-5 sm:px-7 py-2.5 sm:py-3 cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow flex items-center gap-1.5 shrink-0"
                  >
                    <span>Search</span>
                    
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex items-center justify-end relative">
              <svg
                className="w-full max-w-md h-auto drop-shadow-sm"
                viewBox="0 0 460 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="20"
                  y="240"
                  width="420"
                  height="12"
                  rx="6"
                  fill="#0F172A"
                  opacity="0.85"
                />
                <rect
                  x="60"
                  y="140"
                  width="160"
                  height="95"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                />
                <rect
                  x="70"
                  y="150"
                  width="140"
                  height="75"
                  rx="6"
                  fill="#0F172A"
                />
                <rect
                  x="80"
                  y="162"
                  width="60"
                  height="5"
                  rx="2.5"
                  fill="#34D399"
                />
                <rect
                  x="80"
                  y="172"
                  width="100"
                  height="5"
                  rx="2.5"
                  fill="#94A3B8"
                />
                <rect
                  x="80"
                  y="182"
                  width="80"
                  height="5"
                  rx="2.5"
                  fill="#60A5FA"
                />
                <rect
                  x="80"
                  y="192"
                  width="115"
                  height="5"
                  rx="2.5"
                  fill="#F472B6"
                />
                <polygon
                  points="50,235 230,235 220,240 60,240"
                  fill="#CBD5E1"
                />
                <rect
                  x="210"
                  y="90"
                  width="140"
                  height="100"
                  rx="8"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                />
                <rect
                  x="218"
                  y="98"
                  width="124"
                  height="84"
                  rx="5"
                  fill="#F8FAFC"
                />
                <path
                  d="M228 160 L248 140 L268 152 L295 125 L325 142"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="295" cy="125" r="4" fill="#10B981" />
                <rect
                  x="270"
                  y="190"
                  width="20"
                  height="35"
                  rx="3"
                  fill="#64748B"
                />
                <rect
                  x="250"
                  y="225"
                  width="60"
                  height="6"
                  rx="3"
                  fill="#94A3B8"
                />
                <g transform="translate(320, 70)">
                  <line
                    x1="40"
                    y1="-70"
                    x2="40"
                    y2="10"
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                  <polygon points="20,25 60,25 50,10 30,10" fill="#F87171" />
                  <rect
                    x="22"
                    y="55"
                    width="36"
                    height="42"
                    rx="18"
                    fill="#FCD34D"
                  />
                  <path
                    d="M18 68 C 18 42, 62 42, 62 68 C 55 58, 45 54, 38 54 C 28 54, 20 60, 18 68 Z"
                    fill="#1E293B"
                  />
                  <rect
                    x="26"
                    y="66"
                    width="12"
                    height="10"
                    rx="3"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="42"
                    y="66"
                    width="12"
                    height="10"
                    rx="3"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.5"
                  />
                  <line
                    x1="38"
                    y1="71"
                    x2="42"
                    y2="71"
                    stroke="#0F172A"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 115 C 10 95, 70 95, 70 115 L 75 165 L 5 165 Z"
                    fill="#065F46"
                  />
                  <path d="M25 105 L 40 125 L 55 105" fill="#34D399" />
                </g>
                <rect
                  x="390"
                  y="215"
                  width="22"
                  height="25"
                  rx="4"
                  fill="#0F172A"
                />
                <path
                  d="M412 222 C 418 222, 418 232, 412 232"
                  stroke="#0F172A"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Filters + Right Talent Listings */}
      <main className="max-w-[1520px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT FILTERS SIDEBAR ================= */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
                      {activeFilterCount} Active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* 1. Category Filter */}
              <div id="categorySection" className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800 flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    ({selectedCategories.length} selected)
                  </span>
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {categoryLoading ? (
                    <CategorySkeleton />
                  ) : (
                    <>
                      {categories.slice(0, 6).map((cat) => (
                        <label
                          key={cat._id}
                          className="flex items-center justify-between cursor-pointer hover:text-slate-950"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.name)}
                              onChange={() => toggleCategory(cat.name)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />

                            <span>{cat.name}</span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400">
                            {cat.count}
                          </span>
                        </label>
                      ))}

                      {showMoreCategories && (
                        <div className="space-y-2 pt-1">
                          {categories.slice(6).map((cat) => (
                            <label
                              key={cat._id}
                              className="flex items-center justify-between cursor-pointer hover:text-slate-950"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(
                                    cat.name,
                                  )}
                                  onChange={() => toggleCategory(cat.name)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                />

                                <span>{cat.name}</span>
                              </div>

                              <span className="text-[11px] font-mono text-slate-400">
                                {cat.count}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {categories.length > 6 && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowMoreCategories(!showMoreCategories)
                          }
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1 block cursor-pointer"
                        >
                          {showMoreCategories ? "- Show Less" : "+ Show More"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 2. Seller Label & Badges Filter (User requested: Label 1, Label 2, Pro Batch) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                  Seller Label &amp; Badge
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {[
                    {
                      label: "Pro Seller",
                      text: "★ Pro Seller",
                      badge: "PRO",
                    },
                    {
                      label: "Level 3 Seller",
                      text: "Level 3 Seller",
                      badge: "L3",
                    },
                    {
                      label: "Level 2 Seller",
                      text: "Level 2 Seller",
                      badge: "L2",
                    },
                    {
                      label: "Level 1 Seller",
                      text: "Level 1 Seller",
                      badge: "L1",
                    },
                    {
                      label: "Top Rated",
                      text: "Top Rated",
                      badge: "TOP",
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex items-center justify-between cursor-pointer hover:text-slate-950"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedLabels.includes(item.label)}
                          onChange={() => toggleLabel(item.label)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-medium">{item.text}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {item.badge}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Skills Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                  Skills
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {["Figma", "Python", "Next.js", "RLHF", "Mathematics"].map(
                    (skill) => (
                      <label
                        key={skill}
                        className="flex items-center gap-2.5 cursor-pointer hover:text-slate-950"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkill(skill)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span>{skill}</span>
                      </label>
                    ),
                  )}

                  {showMoreSkills && (
                    <div className="space-y-2 pt-1">
                      {["FastAPI", "Prompt Engineering", "Kubernetes"].map(
                        (skill) => (
                          <label
                            key={skill}
                            className="flex items-center gap-2.5 cursor-pointer hover:text-slate-950"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSkills.includes(skill)}
                              onChange={() => toggleSkill(skill)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <span>{skill}</span>
                          </label>
                        ),
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowMoreSkills(!showMoreSkills)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1 block cursor-pointer"
                  >
                    {showMoreSkills ? "- Show Less" : "+ Show More"}
                  </button>
                </div>
              </div>

              {/* 5. Language Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-800">
                  Languages
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  {["English", "Chinese", "French", "German", "Spanish"].map(
                    (lang) => (
                      <label
                        key={lang}
                        className="flex items-center gap-2.5 cursor-pointer hover:text-slate-950"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span>{lang}</span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Reset CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reset All Filters</span>
                  <span>↺</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT TALENT LISTINGS ================= */}
          <section className="lg:col-span-8 xl:col-span-9 space-y-5">
            {/* Top Bar: Count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="text-xs sm:text-sm text-slate-600">
                Showing{" "}
                <strong className="text-slate-900">
                  {filteredFreelancers.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  -
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredFreelancers.length,
                  )}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-900">
                  {filteredFreelancers.length}
                </strong>{" "}
                result
                {filteredFreelancers.length === 1 ? "" : "s"}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FreelancerCardSkeleton key={index} />
                ))}
              </div>
            ) : paginatedFreelancers.length > 0 ? (
              <div className="space-y-4">
                {paginatedFreelancers.map((fl) => (
                  <div
                    key={fl._id}
                    className="rounded-2xl border border-slate-200/90 p-5 sm:p-6 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 relative group"
                  >
                    {/* Bookmark Heart Icon */}
                    <button
                      type="button"
                      onClick={() => toggleSave(fl._id)}
                      className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center text-sm transition-colors cursor-pointer z-10"
                      title={
                        savedFreelancers[fl._id]
                          ? "Remove Bookmark"
                          : "Save Freelancer"
                      }
                    >
                      <span
                        className={
                          savedFreelancers[fl._id]
                            ? "text-rose-500 font-bold"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      >
                        {savedFreelancers[fl._id] ? "♥" : "♡"}
                      </span>
                    </button>

                    <div className="flex flex-col md:flex-row items-start justify-between gap-5">
                      {/* Left: Avatar & Bio */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="relative shrink-0 mt-0.5">
                          <img
                            src={fl.avatar}
                            alt={`${fl.firstName} ${fl.lastName}`}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-2xs"
                          />
                          <span
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
                            title="Active & Ready to Hire"
                          />
                        </div>

                        <div className="space-y-2 flex-1">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 pr-10">
                              <Link
                                href={`/freelancers/${fl._id}`}
                                className="text-base sm:text-lg font-extrabold text-slate-900 hover:text-emerald-700 transition-colors"
                              >
                                {[fl.firstName, fl.lastName].filter(Boolean).join(" ")}
                              </Link>

                              {fl.badge ? (
                                fl.badge === "Pro Seller" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-slate-900 text-amber-300 border border-slate-800 shadow-2xs">
                                    <span className="text-amber-400 text-xs">
                                      ★
                                    </span>{" "}
                                    {fl.badge}
                                  </span>
                                ) : fl.badge === "Level 3 Seller" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs">
                                    <span className="text-violet-600 text-xs font-black">
                                      ✦✦✦
                                    </span>{" "}
                                    {fl.badge}
                                  </span>
                                ) : fl.badge === "Level 2 Seller" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                                    <span className="text-emerald-600 text-xs font-black">
                                      ✦✦
                                    </span>{" "}
                                    {fl.badge}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight bg-sky-50 text-sky-700 border border-sky-200/90 shadow-2xs">
                                    <span className="text-sky-600 text-xs font-black">
                                      ✦
                                    </span>{" "}
                                    {fl.badge}
                                  </span>
                                )
                              ) : (
                                <span />
                              )}

                              {fl.marketplaceBadges.length > 0 && (
                                <Link href={fl.marketplaceBadges[0].url}>
                                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {fl.marketplaceBadges[0].platform}{" "}
                                    {fl.marketplaceBadges[0].badge}
                                  </span>
                                </Link>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
                              {fl.category?.name}
                            </p>
                          </div>

                          {/* Meta detail */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-slate-700">
                              <span className="text-slate-400">📍</span>{" "}
                              {fl.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <span>★</span>
                              <span className="text-slate-900">
                                {fl.rating.toFixed(1)}
                              </span>
                              <span className="text-slate-400 font-normal">
                                ({fl.reviewsCount} reviews)
                              </span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl line-clamp-2">
                            {fl.about}
                          </p>

                          {/* Skill Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {fl.skills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-[11px] transition-colors"
                              >
                                {s}
                              </span>
                            ))}
                            {fl.skills.length > 4 && (
                              <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-[11px] font-mono">
                                +{fl.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Pricing & Booking Action */}
                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-48 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 gap-3">
                        <Link
                          href={`/freelancers/${fl._id}`}
                          className="px-5 py-2.5 rounded-xl mt-12 bg-emerald-700 border border-emerald-200 text-emerald-900 font-bold text-xs transition-all shadow-2xs hover:shadow flex items-center gap-1.5 shrink-0 group-hover:bg-emerald-700 text-white group-hover:border-emerald-600"
                        >
                          <span>Profile</span>
                         
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 text-2xl flex items-center justify-center mx-auto">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Freelancers Match Your Filter Criteria
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try resetting your price range, clearing specific skill tags,
                  or searching for broader terms like "Design", "Python", or
                  "RLHF".
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {/* Previous */}
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ←
                </button>

                {/* Page Numbers */}
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                      currentPage === page
                        ? "bg-slate-900 text-white shadow-xs"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-3.5 h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
