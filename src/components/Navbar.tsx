"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";
import ProfileMenu from "@/components/ProfileMenu";
import { ArrowRightIcon, CloseIcon, MenuIcon, OutlierLogo } from "./Icons";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Freelancers", href: "/freelancers" },
    { label: "Blog", href: "/blog" },
    // { label: "Top Profile", href: "/seller-profile" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Roles", href: "/#roles" },
    { label: "Why Outlier", href: "/#why-outlier" },
    { label: "Stories", href: "/#testimonials" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <OutlierLogo className="w-8 h-8 transition-transform group-hover:scale-105 duration-200 shadow-sm rounded-lg" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Outlier
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-tight -mt-0.5">
                by Scale AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {(user.role === "worker" || user.role === "admin") && (
                  <Link
                    href={user.role === "worker" ? "/worker/dashboard" : "/admin/dashboard"}
                    className="rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100"
                  >
                    Dashboard
                  </Link>
                )}
                <ProfileMenu menuEnabled={user.role === "user"} />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors duration-150"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-xs tracking-wide hover:bg-slate-800 shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 group"
                >
                  <span>Client Sign Up</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 duration-150" />
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <>
                {(user.role === "worker" || user.role === "admin") && (
                  <Link
                    href={user.role === "worker" ? "/worker/dashboard" : "/admin/dashboard"}
                    className="rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-800"
                  >
                    Dashboard
                  </Link>
                )}
                <ProfileMenu menuEnabled={user.role === "user"} />
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-950 p-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-30 bg-white/95 backdrop-blur-xl md:hidden border-b border-slate-200 p-6 flex flex-col justify-between animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-5 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-slate-800 hover:text-slate-950 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!user && (
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-slate-200 transition-colors text-center"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <span>Client Sign Up</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </>
            </div>
          )}
        </div>
      )}
    </>
  );
}
