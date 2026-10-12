"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { authenticate } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    [],
  );

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    if (!agreeTerms) {
      return setError("Please agree to the Terms of Service.");
    }
    if(!category){
        return setError("Please select your role")
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          category,
          role: "worker",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      authenticate({
        ...data.user,
        avatar: data.user.avatar || null,
        company: data.user.company || null,
        country: data.user.country || null,
        talentDomain: data.user.talentDomain || null,
        worker: data.user.worker || null,
      });
      router.replace(data.redirectTo || "/worker/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await res.json();

        setCategories(data || []);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Main Split-Screen Container */}
      <main className="flex-1 flex flex-col  lg:flex-row">
        {/* Left Side: Brand Perks & Live Social Proof for Clients */}
        <section className="hidden lg:flex lg:w-5/12 xl:w-5/12 bg-[#0B0F19] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Hero Text */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-emerald-400 font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ENTERPRISE TALENT ACQUISITION</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Hire vetted technical talent with guaranteed escrow security.
            </h1>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Accelerate your engineering and AI development by hiring
              pre-screened specialists across software, STEM, and LLM
              evaluation.
            </p>

            {/* Checklist of Client Perks */}
            <div className="space-y-3.5 mt-8">
              {[
                {
                  title: "Pre-Screened Top 1% Talent",
                  desc: "Rigorously vetted technical assessments, work samples, and code reviews.",
                },
                {
                  title: "100% Milestone Escrow",
                  desc: "Deposits locked securely before work begins; funds release only upon your approval.",
                },
                {
                  title: "Zero Markup or Surprise Fees",
                  desc: "Straightforward contract pricing, milestone structures, and negotiable budgets.",
                },
                {
                  title: "Rapid 24-Hour Matching",
                  desc: "Book verified talent immediately or review curated candidates without waiting weeks.",
                },
              ].map((perk, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {perk.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {perk.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Escrow Contracts Ticker */}
          <div className="relative z-10 mt-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              <span>Active Client Escrows Funded</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                Live
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>✦ Cyberdyne Systems (RLHF Milestone #1)</span>
                <span className="font-bold text-emerald-400">$3,500.00</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>✦ Anthropic Research Lab (STEM Eval)</span>
                <span className="font-bold text-emerald-400">$5,200.00</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>✦ NeuroScale AI (Full-Stack Next.js)</span>
                <span className="font-bold text-emerald-400">$2,800.00</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Info */}
          <div className="relative z-10 pt-6 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>🔒 SOC-2 COMPLIANT • 256-BIT SSL</span>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Return Home
            </Link>
          </div>
        </section>

        {/* Right Side: Interactive Client Signup Form */}
        <section className="flex-1  flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-xl space-y-6">
            {/* Header Titles */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-3">
                <span>🏢</span>
                <span>Freelancer Account</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Create your freelancer account and start showcasing your skills,
                experience, and work samples.
              </p>
            </div>

            {/* Social Signup Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled
                title="Coming soon"
                // onClick={() => {
                //   setIsLoading(true);
                //   setTimeout(() => {
                //     setIsLoading(false);
                //     setIsSuccess(true);
                //   }, 800);
                // }}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                disabled
                title="Coming soon"
                // onClick={() => {
                //   setIsLoading(true);
                //   setTimeout(() => {
                //     setIsLoading(false);
                //     setIsSuccess(true);
                //   }, 800);
                // }}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg
                  className="w-4 h-4 shrink-0 fill-slate-900"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Sign up with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-400 font-mono text-[10px] font-semibold">
                  Or register with company email
                </span>
              </div>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Eleanor"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Rigby"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {/* Company Name & Work Email (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="eleanor@company.com"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Role
                    </label>

                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={categoryLoading}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white cursor-pointer disabled:opacity-60"
                    >
                      <option value="">
                        {categoryLoading
                          ? "Loading Roles..."
                          : "Select a Your role"}
                      </option>

                      {categories.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password Field with Live Strength Indicator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      Strength:{" "}
                      <strong
                        className={
                          strength <= 1
                            ? "text-rose-600"
                            : strength <= 3
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }
                      >
                        {strength <= 1
                          ? "Weak"
                          : strength <= 3
                            ? "Medium"
                            : "Strong"}
                      </strong>
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters with numbers & symbols"
                      className="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>

                  {/* Password Strength Meter Bar */}
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          strength >= bar
                            ? strength <= 1
                              ? "bg-rose-500"
                              : strength <= 3
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500 font-mono">
                    <span
                      className={
                        password.length >= 8 ? "text-emerald-700 font-bold" : ""
                      }
                    >
                      {password.length >= 8 ? "✓" : "○"} 8+ characters
                    </span>
                    <span
                      className={
                        /[0-9]/.test(password)
                          ? "text-emerald-700 font-bold"
                          : ""
                      }
                    >
                      {/[0-9]/.test(password) ? "✓" : "○"} Number
                    </span>
                    <span
                      className={
                        /[^A-Za-z0-9]/.test(password)
                          ? "text-emerald-700 font-bold"
                          : ""
                      }
                    >
                      {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Symbol
                    </span>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-slate-600 leading-snug">
                      I agree to the{" "}
                      <a
                        href="#terms"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            "Client Terms: Milestone escrow terms, intellectual property assignment, and enterprise SLA.",
                          );
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Terms of Service
                      </a>
                      ,{" "}
                      <a
                        href="#escrow"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            "Escrow Agreement: All contract deposits are held in 100% secure escrow prior to deliverable release.",
                          );
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Escrow Agreement
                      </a>
                      , and{" "}
                      <a
                        href="#privacy"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            "Privacy Policy: Enterprise-grade data protection with SOC-2 Type II standards.",
                          );
                        }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 mt-0.5 shrink-0"
                    />
                    <span className="text-xs text-slate-500 leading-snug">
                      Notify me with candidate matches and milestone deliverable
                      reviews (recommended).
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Creating Freelancer Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Freelancer Account</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Success View */
              <div className="p-8 rounded-2xl bg-white border border-emerald-300 text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-3xl font-bold flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                  🎉
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Freelancer Account Created
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    Welcome to FindWorkers, {firstName}!
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Next steps for hiring:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    1. Check your work email for your account activation link.
                    <br />
                    2. Browse verified specialists or book talent directly via
                    milestones.
                    <br />
                    3. Deposit funds safely into escrow — released only upon
                    deliverable approval.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/user/dashboard"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open Client Dashboard →</span>
                  </Link>
                  <Link
                    href="/seller-profile"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Browse Verified Talent
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Links */}
            <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
              <p>
                Already have a account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  Log in
                </Link>
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link
                  href="/"
                  className="hover:text-slate-600 transition-colors"
                >
                  ← Back to Marketplace
                </Link>
                <span>•</span>
                <Link
                  href="/seller-profile"
                  className="hover:text-slate-600 transition-colors"
                >
                  Top Freelancers
                </Link>
                <span>•</span>
                <Link
                  href="/blog"
                  className="hover:text-slate-600 transition-colors"
                >
                  Enterprise Guides
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
