"use client"

import React from "react";
import Link from "next/link";
import { OutlierLogo } from "./Icons";
import { useAuth } from "@/providers/AuthProvider";



export default function Footer() {
  const {user} = useAuth()
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <OutlierLogo className="w-8 h-8 rounded-lg shadow-sm" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    Outlier
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  by Scale AI
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mb-6">
              Outlier is a premier freelance platform operated by Scale AI that
              recruits subject matter experts to evaluate, train, and align
              next-generation artificial intelligence models.
            </p>
            {!user && (
              <div className="flex items-center gap-3">
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 shadow-sm transition-colors"
                >
                  Client Sign Up
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-xs hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Client Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Column: Platform */}
          <div>
            <h4 className="font-mono text-slate-900 text-xs uppercase tracking-wider font-semibold mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-slate-950 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Explore Roles
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-slate-950 transition-colors"
                >
                  Insights &amp; Blog
                </a>
              </li>
              <li>
                <a
                  href="#status"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "All Outlier AI services are operational (99.98% uptime).",
                    );
                  }}
                  className="hover:text-slate-950 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>System Status</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Domains */}
          <div>
            <h4 className="font-mono text-slate-900 text-xs uppercase tracking-wider font-semibold mb-4">
              Specializations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Coding & Software Engineering
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Mathematics & Proofs
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Physics & Natural Sciences
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Writing & Editorial Critique
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Multilingual AI (50+ Languages)
                </a>
              </li>
              <li>
                <a
                  href="#roles"
                  className="hover:text-slate-950 transition-colors"
                >
                  Biomedical & Clinical Reasoning
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Legal & Policies */}
          <div>
            <h4 className="font-mono text-slate-900 text-xs uppercase tracking-wider font-semibold mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Outlier Independent Contractor Agreement & Terms of Use.",
                    );
                  }}
                  className="hover:text-slate-950 transition-colors"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Outlier AI Privacy Policy & Data Protection Standards.",
                    );
                  }}
                  className="hover:text-slate-950 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Contributor Code of Conduct & Academic Honesty Guidelines.",
                    );
                  }}
                  className="hover:text-slate-950 transition-colors"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Cookie Preferences Manager.");
                  }}
                  className="hover:text-slate-950 transition-colors"
                >
                  Cookie Settings
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-slate-950 transition-colors"
                >
                  Help Center / FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 Outlier AI. An enterprise service of Scale AI, Inc. All
            rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Discord
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
