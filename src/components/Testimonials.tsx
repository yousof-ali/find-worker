import React from 'react';
import { StarIcon, SparklesIcon } from './Icons';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Dr. Marcus Chen',
      role: 'PhD in Computer Science, Berkeley',
      domain: 'Python & Systems Evaluator',
      avatar: 'MC',
      earnings: '$60/hr • 18 hrs/wk',
      quote: 'Outlier funded my graduate research while giving me hands-on experience evaluating next-gen reasoning models before they were deployed to the public. The code review tasks are intellectually stimulating and pay better than traditional university TA positions.',
    },
    {
      name: 'Elena Rostova',
      role: 'Mathematics Educator & Researcher',
      domain: 'Advanced Math Specialist',
      avatar: 'ER',
      earnings: '$55/hr • 22 hrs/wk',
      quote: 'The flexibility is unmatched. As an educator and parent, I can grade multi-step calculus and proof derivations late at night or early in the morning without asking anyone for permission. Payments have hit my PayPal on Tuesday without fail.',
    },
    {
      name: 'David Miller',
      role: 'Staff Software Architect',
      domain: 'Full-Stack & Security Evaluator',
      avatar: 'DM',
      earnings: '$65/hr • 10 hrs/wk',
      quote: 'I use Outlier as a high-yield side hustle. Auditing AI-generated code for security flaws and algorithmic inefficiencies keeps my problem-solving sharp while adding an extra $2,500+ every month to my savings.',
    },
    {
      name: 'Amina Al-Mansoor',
      role: 'Linguistics Specialist & Translator',
      domain: 'Multilingual AI Localization',
      avatar: 'AA',
      earnings: '$38/hr • 25 hrs/wk',
      quote: 'Ensuring that frontier AI models understand cultural idioms and dialectal nuances across Arabic and English has been deeply rewarding work. Outlier made remote freelance work transparent and reliable.',
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-50/70 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-700 mb-4 font-medium">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>CONTRIBUTOR VOICES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Hear From Our Global Community
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Thousands of academics, researchers, engineers, and domain experts earn with Outlier on their own terms.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl md:rounded-3xl p-8 border border-slate-200 hover:border-slate-300 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-semibold">
                    {t.earnings}
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.role}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-600 mt-0.5 font-medium">
                    {t.domain}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
