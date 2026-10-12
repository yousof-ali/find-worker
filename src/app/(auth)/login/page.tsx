'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginForm() {
  const router = useRouter();
  const { authenticate } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Login failed. Please try again.');
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
      router.replace(data.redirectTo);
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* Main Split-Screen Container */}
      <main className="flex-1 flex flex-col  lg:flex-row">
        {/* Left Side: Brand Value Showcase & Social Proof for Clients */}
        <section className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-[#0B0F19] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono text-emerald-400 font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CLIENT &amp; ENTERPRISE PORTAL</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight max-w-lg">
              Hire the world&apos;s elite AI engineers, researchers &amp; specialists.
            </h1>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-md">
              Manage milestones, fund secure escrow contracts, and collaborate with pre-vetted top 1% talent across 85+ countries.
            </p>

            {/* Key Value Cards */}
            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <div className="text-emerald-400 font-bold text-lg font-mono">100% Escrow</div>
                <div className="text-xs text-slate-400 mt-1">Funds release only after deliverable verification.</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xs">
                <div className="text-indigo-400 font-bold text-lg font-mono">0% Client VAT</div>
                <div className="text-xs text-slate-400 mt-1">Direct milestones with complete transparent ledger.</div>
              </div>
            </div>
          </div>

          {/* Client Testimonial */}
          <div className="relative z-10 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md max-w-md">
            <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span className="text-slate-400 text-[11px] font-mono ml-1.5 font-bold">5.0 Enterprise Client</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
              &ldquo;FindWorkers made scaling our technical and model evaluation team effortless. Milestone escrow ensures every deliverable is verified before funds are released.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-indigo-500/30">
                SC
              </div>
              <div>
                <div className="text-xs font-bold text-white">Sarah Connor</div>
                <div className="text-[11px] text-slate-400">VP of Engineering &amp; AI Operations, Cyberdyne Systems</div>
              </div>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="relative z-10 pt-8 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-4">
              <span>🔒 SOC-2 TYPE II</span>
              <span>•</span>
              <span>256-BIT ENCRYPTION</span>
              <span>•</span>
              <span>ISO 27001</span>
            </div>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Home
            </Link>
          </div>
        </section>

        {/* Right Side: Interactive Client Login Form */}
        <section className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            {/* Form Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-3">
                <span>🏢</span>
                <span>Client &amp; Enterprise Access</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Log In to Client Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sign in to manage verified talent, milestone approvals, and secure escrow contracts.
              </p>
            </div>

       

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                // onClick={() => handleSocialLogin('Google')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                // onClick={() => handleSocialLogin('GitHub')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0 fill-slate-900" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-3 text-slate-400 font-mono text-[10px] font-semibold">
                  Or sign in with work email
                </span>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {authError}
              </div>
            )}

            {/* {!isSuccess ? ( */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Work Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
                    Client Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah.connor@cyberdyne.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-2xs"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Password
                    </label>
                    <button
                      type="button"
                      // onClick={() => setForgotPasswordModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-2xs pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600">Remember this device for 30 days</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating Client Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Client Console</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            {/* ) : ( */}
    

            {/* Bottom Links */}
            <div className="pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500 space-y-2">
              <p>
                Don&apos;t have a client account yet?{' '}
                <Link href="/signup" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
                  Register as a Client
                </Link>
              </p>
              <p>
               Register as a freelancer?{' '}
                <Link href="/signup-freelancer" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
                  Register as a freelancer?
                </Link>
              </p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link href="/" className="hover:text-slate-600 transition-colors">← Back to Marketplace</Link>
                <span>•</span>
                <Link href="/seller-profile" className="hover:text-slate-600 transition-colors">Browse Talent</Link>
                <span>•</span>
                <Link href="/freelancers" className="hover:text-slate-600 transition-colors">Freelancer Directory</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

