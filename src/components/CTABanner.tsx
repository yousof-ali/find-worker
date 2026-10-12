import React from 'react';
import { ArrowRightIcon, CheckIcon } from './Icons';

interface CTABannerProps {
  onOpenApply: () => void;
  onOpenSignIn: () => void;
}

export default function CTABanner({ onOpenApply, onOpenSignIn }: CTABannerProps) {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 md:p-16 border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-center overflow-hidden shadow-2xl">
          {/* Subtle glowing ambient lights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-purple-500/15 blur-[90px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-semibold mb-3 inline-block">
              Start Today • 100% Remote
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Ready to Shape the Next Generation of AI?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
              Join over 250,000+ researchers, developers, educators, and domain specialists training the models that will define tomorrow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                onClick={onOpenApply}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group shadow-md"
              >
                <span>Apply as a Contributor</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={onOpenSignIn}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/15 transition-colors"
              >
                Log In to Workspace
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Takes less than 5 minutes to start</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly direct deposits</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Freelance independent contract</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
