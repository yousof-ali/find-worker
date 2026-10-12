'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, SparklesIcon } from './Icons';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Outlier and how does it relate to Scale AI?',
      answer: 'Outlier is an expert contributor platform operated by Scale AI, the data infrastructure foundation for modern artificial intelligence. Outlier connects subject-matter experts—such as software engineers, mathematicians, linguists, and researchers—with leading AI labs (such as OpenAI, Meta, Google DeepMind, and Anthropic) to provide Reinforcement Learning from Human Feedback (RLHF), safety red-teaming, and model calibration.',
    },
    {
      question: 'What are the qualifications to join as a freelance contributor?',
      answer: 'Qualifications vary by subject domain. General writing and fact-checking projects typically require strong written communication skills and an undergraduate background. Specialized tracks—such as Coding, Advanced Mathematics, or Clinical Medicine—require demonstrated mastery or degree credentials (BS, MS, or PhD) in the relevant field, validated through a brief initial screening assessment.',
    },
    {
      question: 'How and when do I get paid?',
      answer: 'Outlier processes payouts on a weekly basis, typically every Tuesday. Depending on your region, you can receive funds directly via PayPal, Direct Bank Deposit (ACH), or AirTM. Earnings are calculated transparently based on approved hours and task complexity.',
    },
    {
      question: 'How many hours per week do I need to commit?',
      answer: 'There are no mandatory minimum weekly hours. You operate as an independent contractor (1099 in the United States, or local freelance equivalent). You can choose to contribute 5 hours per week as a side hustle or up to 40 hours per week depending on active project availability in your domain.',
    },
    {
      question: 'What is the skill screening assessment like?',
      answer: 'After creating your profile, you will receive an invitation to take an unproctored 20–30 minute subject assessment. It tests your problem-solving depth, your ability to catch nuanced errors or hallucinations in AI responses, and your clarity in explaining why one response is superior to another.',
    },
    {
      question: 'Do I need prior experience working with artificial intelligence?',
      answer: 'No prior machine learning or AI background is required. We evaluate you on your human subject-matter expertise—your ability to code, write mathematically sound proofs, translate idioms, or critique prose. Clear project guidelines and examples are provided for every project.',
    },
    {
      question: 'What equipment or hardware is required to work?',
      answer: 'You only need a reliable computer (laptop or desktop with Mac, Windows, or Linux), a modern web browser (Google Chrome or Brave recommended), and a stable internet connection. All evaluations happen directly inside your secure Outlier web console.',
    },
    {
      question: 'Is Outlier available in my country?',
      answer: 'Yes! Outlier accepts qualified freelance contributors in over 100 countries across North America, Europe, Asia-Pacific, Latin America, and Africa. As long as you are legally authorized to perform freelance contract work in your jurisdiction, you can apply.',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white relative border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-mono text-indigo-700 mb-4 font-medium">
            <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>COMMON QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Everything you need to know about freelancing on Outlier, from application to payouts.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm hover:border-slate-300"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-slate-900 tracking-tight">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-slate-900' : ''
                    }`}
                  >
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
