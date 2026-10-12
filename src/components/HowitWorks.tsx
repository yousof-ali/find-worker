import React from 'react';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from './Icons';

interface HowItWorksProps {
  onOpenApply: () => void;
}

export default function HowItWorks({ onOpenApply }: HowItWorksProps) {
  const steps = [
    {
      number: '01',
      title: 'Apply & Complete Skill Screening',
      time: '15–30 minutes',
      description: 'Fill out our lightweight sign-up form, confirm your eligibility, and take a domain-specific evaluation to demonstrate your problem-solving and critique depth.',
      details: [
        'No prior machine learning experience required',
        'Transparent assessment scoring',
        'Immediate feedback on qualification status',
      ],
    },
    {
      number: '02',
      title: 'Get Matched to Active Projects',
      time: 'Within 24–48 hours',
      description: 'Once you pass your assessment, you will be onboarded to project queues matching your exact domain. Review the task guidelines and start grading test prompts.',
      details: [
        'Clear project rubrics & examples',
        'Direct Slack/Discord community support',
        'Dedicated onboarding enablement courses',
      ],
    },
    {
      number: '03',
      title: 'Evaluate Models & Get Paid Weekly',
      time: 'On your schedule',
      description: 'Grade multi-turn model answers, generate challenging prompts, catch logic mistakes, and refine reasoning pathways. Receive direct deposits automatically every Tuesday.',
      details: [
        'Weekly payouts via PayPal or Direct Deposit',
        'Real-time task counters & earnings tracker',
        'Quality bonuses on complex reasoning tasks',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/70 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-700 mb-4 font-medium">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            From Application to Your First Payout
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Getting started on Outlier is straightforward, transparent, and structured around your verified capabilities.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl md:rounded-3xl p-8 border border-slate-200 hover:border-slate-300 transition-all duration-300 relative flex flex-col justify-between shadow-sm hover:shadow-md group"
            >
              <div>
                {/* Step Number + Time */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-extrabold font-mono text-slate-200 group-hover:text-indigo-600/40 transition-colors">
                    {step.number}
                  </span>
                  <span className="text-xs font-mono text-indigo-700 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 font-medium">
                    {step.time}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {step.description}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {step.details.map((d, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {idx === 0 && (
                <button
                  onClick={onOpenApply}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Start Step 1 Now</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
