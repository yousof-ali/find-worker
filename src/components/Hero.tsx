"use client";

import React from "react";
import { ArrowRightIcon } from "./Icons";

interface HeroProps {
  onOpenApply: () => void;
}

export default function Hero({ onOpenApply }: HeroProps) {
  return (
    <section className="relative pt-24 pb-0 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
      {/* Subtle ambient light gradient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-100/60 blur-[120px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-blue-100/50 blur-[100px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[250px] bg-purple-100/40 blur-[100px] -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Centered Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 mb-8 shadow-sm hover:border-slate-300 transition-colors">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-900">
              Live Contributor Openings
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">100+ countries accepted</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            Train the Next Generation of AI as a Freelancer
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
            Join a global community of experts training the world’s most
            advanced AI models. Set your own hours, work from anywhere, and get
            paid weekly for your domain expertise.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenApply}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 group"
            >
              <span>Apply as a Contributor</span>
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#roles"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200"
            >
              Explore 50+ Specialized Roles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
