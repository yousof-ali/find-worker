import React from 'react';
import { ClockIcon, DollarIcon, SparklesIcon, ShieldIcon, BrainIcon } from './Icons';

export default function WhyOutlier() {
  const bentoItems = [
    {
      title: 'Complete Schedule Autonomy',
      tag: '100% Asynchronous',
      description: 'Log in whenever you want, day or night. There are no mandatory standups, weekly hour quotas, or fixed shifts. Freelance around your life, studies, or full-time career.',
      icon: ClockIcon,
      colSpan: 'md:col-span-2',
      highlight: 'Set your own hours',
    },
    {
      title: 'Reliable Weekly Payouts',
      tag: 'Every Tuesday',
      description: 'Your earnings are automatically calculated and deposited every week via PayPal, Direct Deposit, or AirTM. No waiting 30 days for invoices to clear.',
      icon: DollarIcon,
      colSpan: 'md:col-span-1',
      highlight: 'Zero payment delays',
    },
    {
      title: 'Shape Frontier AI Intelligence',
      tag: 'Direct RLHF Impact',
      description: 'Your critique and corrections directly optimize weights, reasoning pathways, and safety filters for the world’s most advanced foundational models.',
      icon: BrainIcon,
      colSpan: 'md:col-span-1',
      highlight: 'Pre-release access',
    },
    {
      title: 'Quality-Based Tier Progression',
      tag: 'Higher Earnings',
      description: 'High-accuracy evaluators unlock senior reviewer tiers, specialized high-rate projects ($50-$80+/hr), and reviewer auditing assignments.',
      icon: ShieldIcon,
      colSpan: 'md:col-span-2',
      highlight: 'Merit-based advancement',
    },
  ];

  return (
    <section className="py-24 bg-white relative border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-700 mb-4 font-medium">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>THE OUTLIER ADVANTAGE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Built for Knowledge Experts & Freelancers
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            The platform is designed from the ground up to respect your time, reward your deep expertise, and provide a frictionless freelance experience.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bentoItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`${item.colSpan} rounded-2xl md:rounded-3xl p-8 border border-slate-200 hover:border-slate-300 transition-all duration-300 relative group bg-white shadow-sm hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-105 group-hover:border-indigo-300 transition-all">
                      <IconComponent className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xs font-mono text-slate-600 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-medium">
                      {item.tag}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-emerald-600 font-semibold mb-2 uppercase tracking-wider">
                    {item.highlight}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Learn more</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
