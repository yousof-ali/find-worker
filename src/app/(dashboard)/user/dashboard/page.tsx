'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { OutlierLogo, CheckIcon, ArrowRightIcon } from '../../../../components/Icons';
import { useAuth } from '@/providers/AuthProvider';

interface Milestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'completed' | 'in_review' | 'in_progress' | 'pending';
  deliverableLink?: string;
  deliverableNotes?: string;
}

interface Contract {
  id: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRole: string;
  sellerLevel: 'Level 1' | 'Level 2' | 'Top Rated';
  isPro: boolean;
  projectTitle: string;
  paymentType: 'milestone' | 'full';
  totalBudget: number;
  escrowLocked: number;
  status: 'active' | 'completed' | 'paused';
  progressPercent: number;
  milestones: Milestone[];
}

interface Proposal {
  id: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRole: string;
  sellerLevel: string;
  isPro: boolean;
  projectTitle: string;
  proposedPrice: number;
  clientNegotiableBudget: number;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'contracts' | 'proposals' | 'freelancers' | 'escrow'>('contracts');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [reviewMilestone, setReviewMilestone] = useState<{ contract: Contract; milestone: Milestone } | null>(null);
  const [chatFreelancer, setChatFreelancer] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'client' | 'seller'; text: string; time: string }[]>([
    { sender: 'seller', text: 'Hi Sarah! I have just uploaded the Milestone #2 Figma prototype and test suites for review.', time: '10:45 AM' },
    { sender: 'client', text: 'Thanks Thomas! Reviewing the deliverable now before releasing escrow.', time: '10:52 AM' },
  ]);
  const [newMsg, setNewMsg] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const {user,logout} = useAuth()


  const handleLogout = async () => {
     await logout();
  };

  // Sample Contracts State
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 'CNT-9041',
      freelancerName: 'Thomas Powell',
      freelancerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      freelancerRole: 'Senior UI/UX & RLHF Evaluator',
      sellerLevel: 'Level 2',
      isPro: true,
      projectTitle: 'AI Platform Design System & Milestone Escrow Workflow',
      paymentType: 'milestone',
      totalBudget: 4500,
      escrowLocked: 1500,
      status: 'active',
      progressPercent: 66,
      milestones: [
        {
          id: 'M-1',
          title: 'Milestone 1: Architectural Wireframes & Information Hierarchy',
          amount: 1500,
          dueDate: 'Sep 24, 2026',
          status: 'completed',
        },
        {
          id: 'M-2',
          title: 'Milestone 2: High-Fidelity Figma Components & Interactive Prototypes',
          amount: 1500,
          dueDate: 'Oct 04, 2026',
          status: 'in_review',
          deliverableLink: 'https://figma.com/@thomas/outlier-design-system-v2',
          deliverableNotes: 'All 48 component states, interactive booking modals, and responsive breakpoints are finalized.',
        },
        {
          id: 'M-3',
          title: 'Milestone 3: Final Asset Export, Design Token Handoff & QA Review',
          amount: 1500,
          dueDate: 'Oct 15, 2026',
          status: 'pending',
        },
      ],
    },
    {
      id: 'CNT-8820',
      freelancerName: 'Elena Rostova',
      freelancerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      freelancerRole: 'Lead AI & RLHF Alignment Specialist',
      sellerLevel: 'Level 2',
      isPro: false,
      projectTitle: 'Safety Benchmark Dataset Curation & Red-Teaming Protocols',
      paymentType: 'milestone',
      totalBudget: 3200,
      escrowLocked: 1600,
      status: 'active',
      progressPercent: 50,
      milestones: [
        {
          id: 'M-1',
          title: 'Milestone 1: 5,000 Curated Prompts with Domain Metadata',
          amount: 1600,
          dueDate: 'Oct 08, 2026',
          status: 'in_progress',
        },
        {
          id: 'M-2',
          title: 'Milestone 2: Model Red-Teaming Results & Alignment Scorecard',
          amount: 1600,
          dueDate: 'Oct 20, 2026',
          status: 'pending',
        },
      ],
    },
    {
      id: 'CNT-7714',
      freelancerName: 'Marcus Vance',
      freelancerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      freelancerRole: 'Full-Stack Next.js & Python Engineer',
      sellerLevel: 'Level 1',
      isPro: true,
      projectTitle: 'Escrow Payment Gateway API & Milestone Verification Webhook',
      paymentType: 'full',
      totalBudget: 2800,
      escrowLocked: 2800,
      status: 'active',
      progressPercent: 40,
      milestones: [
        {
          id: 'M-FULL',
          title: 'Complete Fixed-Price Deliverable: Escrow Microservice & Tests',
          amount: 2800,
          dueDate: 'Oct 18, 2026',
          status: 'in_progress',
        },
      ],
    },
  ]);

  // Sample Proposals
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 'PROP-301',
      freelancerName: 'David Chen',
      freelancerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      freelancerRole: 'STEM & Mathematical Reasoning Specialist',
      sellerLevel: 'Level 1',
      isPro: false,
      projectTitle: 'Formal Proof Validation & Symbolic Computation Benchmarking',
      proposedPrice: 2200,
      clientNegotiableBudget: 1900,
      status: 'pending',
      date: 'Today at 9:15 AM',
    },
    {
      id: 'PROP-302',
      freelancerName: 'Sophia Loren',
      freelancerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      freelancerRole: 'Technical Content & AI Documentation Lead',
      sellerLevel: 'Level 2',
      isPro: true,
      projectTitle: 'Developer Onboarding Guide & API Sandbox Walkthrough',
      proposedPrice: 1400,
      clientNegotiableBudget: 1250,
      status: 'pending',
      date: 'Yesterday',
    },
  ]);

  // Release Milestone Escrow
  const handleReleaseEscrow = (contractId: string, milestoneId: string, amount: number) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedMilestones = c.milestones.map((m) =>
          m.id === milestoneId ? { ...m, status: 'completed' as const } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.status === 'completed').length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
        return {
          ...c,
          escrowLocked: Math.max(0, c.escrowLocked - amount),
          progressPercent: newProgress,
          milestones: updatedMilestones,
        };
      })
    );
    setReviewMilestone(null);
    setActionNotice(`✓ Escrow release successful! $${amount.toLocaleString()} has been securely transferred to the freelancer. Zero VAT applied.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Accept Proposal
  const handleAcceptProposal = (propId: string, name: string, budget: number) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === propId ? { ...p, status: 'accepted' as const } : p))
    );
    setActionNotice(`✓ Proposal accepted with negotiated budget of $${budget.toLocaleString()}. Milestone escrow deposit locked.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  // Send Chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'client', text: newMsg, time: 'Just now' },
    ]);
    setNewMsg('');
  };

  const totalEscrowSecured = contracts.reduce((acc, c) => acc + c.escrowLocked, 0);
  const pendingMilestonesCount = contracts.flatMap((c) => c.milestones).filter((m) => m.status === 'in_review').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Top Client Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Portal Indicator */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <OutlierLogo className="w-8 h-8 rounded-lg shadow-xs transition-transform group-hover:scale-105 duration-200" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">FindWorkers</span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    AI
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono -mt-0.5">Enterprise Client Console</span>
              </div>
            </Link>

            <span className="hidden sm:inline-block w-px h-6 bg-slate-200" />

            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user?.company} • {user?.firstName}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/dashboard" className="text-emerald-700 font-bold hover:text-emerald-800 transition-colors">
              Console
            </Link>
            <Link href="/freelancers" className="hover:text-slate-950 transition-colors">
              Find Talent
            </Link>
            <Link href="/seller-profile" className="hover:text-slate-950 transition-colors">
              Top Profile
            </Link>
            <Link href="/#why-outlier" className="hover:text-slate-950 transition-colors">
              Why Outlier
            </Link>
          </nav>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-3">
            {/* Escrow Balance Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono">
              <span className="text-emerald-400 font-bold">🔒 Escrow Locked:</span>
              <span className="font-bold">${totalEscrowSecured.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">(0% VAT)</span>
            </div>

            {/* Link to Browse Freelancers */}
            <Link
              href="/freelancers"
              className="px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>Browse Talent</span>
              <span>↗</span>
            </Link>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out of Client Portal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 text-center shadow-sm animate-fade-in flex items-center justify-center gap-2">
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Top Header Greetings & Quick CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 mb-2">
              <span>🏢 Active Organization: {user?.company}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Client Management Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800">{user?.firstName}</strong>. Oversee your active contracts, inspect milestone deliverables, release escrow, and negotiate budgets with verified talent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/freelancers"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>+ Book New Freelancer</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Escrow Secured */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Secured in Escrow</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-sm">🔒</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ${totalEscrowSecured.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <span>✓ 100% Protected</span>
                <span>•</span>
                <span>0% VAT Applied</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Contracts */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Active Contracts</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-sm">📄</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {contracts.filter((c) => c.status === 'active').length} Active
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Across UI/UX, RLHF &amp; Python APIs
              </div>
            </div>
          </div>

          {/* Card 3: Actionable Deliverables */}
          <div className="p-5 rounded-2xl bg-white border border-amber-200 bg-amber-50/30 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-amber-800">
              <span className="font-bold">Awaiting Your Review</span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm">⚡</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-amber-900">
                {pendingMilestonesCount} Deliverable{pendingMilestonesCount === 1 ? '' : 's'}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-1">
                Ready to review and release funds
              </div>
            </div>
          </div>

          {/* Card 4: Lifetime Spend */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Completed Milestones</span>
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm">✓</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                $18,400.00
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                7 Milestones verified &amp; released
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'contracts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Active Contracts &amp; Escrow</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'contracts' ? 'bg-slate-700 text-emerald-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {contracts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proposals')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'proposals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Negotiable Budget Proposals</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'proposals' ? 'bg-slate-700 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {proposals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('freelancers')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'freelancers'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Hired Talent Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'escrow'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Escrow Ledger &amp; Invoices</span>
          </button>
        </div>

        {/* TAB 1: Active Contracts & Milestone Management */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Current Milestone Contracts</h2>
                <p className="text-xs text-slate-500">Track progress, review submitted work deliverables, and release protected escrow funds.</p>
              </div>
            </div>

            <div className="space-y-6">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6 space-y-6 hover:border-slate-300 transition-colors"
                >
                  {/* Contract Header Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={contract.freelancerAvatar}
                          alt={contract.freelancerName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{contract.freelancerName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {contract.sellerLevel}
                          </span>
                          {contract.isPro && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300">
                              ★ Pro Seller
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{contract.freelancerRole}</p>
                      </div>
                    </div>

                    {/* Financial Summary Pill */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">TOTAL FIXED BUDGET</span>
                        <span className="font-bold text-slate-900 text-sm">${contract.totalBudget.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 ml-1">(0% VAT)</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                        <span className="text-emerald-700 block text-[10px]">LOCKED IN ESCROW</span>
                        <span className="font-bold text-sm">${contract.escrowLocked.toLocaleString()}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setChatFreelancer(contract.freelancerName)}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>💬</span>
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Project Title & Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-800 text-sm">
                        Project: <span className="text-slate-900">{contract.projectTitle}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-700 font-bold">{contract.progressPercent}% Completed</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${contract.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Breakdown List */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
                      Contract Milestones ({contract.milestones.length})
                    </h4>

                    <div className="space-y-2.5">
                      {contract.milestones.map((m, idx) => (
                        <div
                          key={m.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            m.status === 'in_review'
                              ? 'bg-amber-50/60 border-amber-200 ring-1 ring-amber-300'
                              : m.status === 'completed'
                              ? 'bg-slate-50/60 border-slate-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-slate-200 text-slate-700">
                                {idx + 1}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900">{m.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-7">
                              <span>Due: {m.dueDate}</span>
                              <span>•</span>
                              <span className="font-mono font-semibold text-slate-700">${m.amount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-3 pl-7 md:pl-0">
                            {m.status === 'completed' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                <span>✓</span>
                                <span>Approved &amp; Released</span>
                              </span>
                            )}

                            {m.status === 'in_review' && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                  <span>⚡ Deliverable Ready</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setReviewMilestone({ contract, milestone: m })}
                                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>Review &amp; Release Funds</span>
                                  <span>→</span>
                                </button>
                              </div>
                            )}

                            {m.status === 'in_progress' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                <span>Work in Progress</span>
                              </span>
                            )}

                            {m.status === 'pending' && (
                              <span className="text-xs text-slate-400 font-mono">Upcoming</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Proposals & Negotiable Budget Requests */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Incoming Proposals &amp; Budget Negotiations</h2>
              <p className="text-xs text-slate-500">
                Specialists who have submitted fixed-price proposals matching your specified negotiable budgets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.freelancerAvatar}
                          alt={prop.freelancerName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{prop.freelancerName}</span>
                            {prop.isPro && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-900 text-amber-300">
                                ★ Pro
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{prop.freelancerRole}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{prop.date}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{prop.projectTitle}</h4>
                    </div>

                    {/* Price Comparison Box */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Proposed Quote</span>
                        <span className="font-bold text-slate-900 line-through text-slate-400">${prop.proposedPrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-800 block uppercase font-mono font-bold">Your Negotiable Budget</span>
                        <span className="font-black text-emerald-700 text-base">${prop.clientNegotiableBudget}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2.5">
                    {prop.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAcceptProposal(prop.id, prop.freelancerName, prop.clientNegotiableBudget)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Accept &amp; Fund Escrow (${prop.clientNegotiableBudget})
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatFreelancer(prop.freelancerName)}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Discuss
                        </button>
                      </>
                    ) : (
                      <div className="w-full py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center">
                        ✓ Accepted &amp; Escrow Activated
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Hired Talent Directory */}
        {activeTab === 'freelancers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Hired Team &amp; Verified Specialists</h2>
                <p className="text-xs text-slate-500">Quickly re-engage top talent who have delivered approved work for your organization.</p>
              </div>
              <Link
                href="/freelancers"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                + Explore More Experts
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: 'Thomas Powell',
                  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
                  role: 'UI/UX & RLHF Specialist',
                  rating: '5.0',
                  jobsCompleted: 14,
                  badges: ['Pro Seller', 'Level 2 Seller', 'Fiverr Verified', 'Upwork Top Rated'],
                },
                {
                  name: 'Elena Rostova',
                  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
                  role: 'Lead AI Evaluator & RLHF Trainer',
                  rating: '4.9',
                  jobsCompleted: 22,
                  badges: ['Level 2 Seller', 'STEM Certified'],
                },
                {
                  name: 'Marcus Vance',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                  role: 'Full-Stack Next.js & Python Engineer',
                  rating: '4.9',
                  jobsCompleted: 31,
                  badges: ['Level 1 Seller', 'Python Benchmark Elite'],
                },
              ].map((specialist, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={specialist.avatar}
                        alt={specialist.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{specialist.name}</h4>
                        <p className="text-[11px] text-slate-500">{specialist.role}</p>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mt-0.5">
                          <span>★ {specialist.rating}</span>
                          <span className="text-slate-400 font-normal">({specialist.jobsCompleted} contracts)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {specialist.badges.map((b, bi) => (
                        <span key={bi} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChatFreelancer(specialist.name)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Message
                    </button>
                    <Link
                      href="/seller-profile"
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors text-center"
                    >
                      Book Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Escrow Ledger & Invoices */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Escrow Transaction Ledger</h2>
                <p className="text-xs text-slate-500">All milestone deposits are held in 100% escrow protection until you release them. Zero VAT is charged on deposits.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5">Escrow ID</th>
                    <th className="px-4 py-3.5">Talent</th>
                    <th className="px-4 py-3.5">Milestone Description</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">VAT</th>
                    <th className="px-4 py-3.5">Escrow Status</th>
                    <th className="px-4 py-3.5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">ESC-9821</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">Thomas Powell</td>
                    <td className="px-4 py-3.5">Milestone 1: Architectural Wireframes</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">$1,500.00</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold">$0.00 (No VAT)</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Released to Talent
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <button type="button" onClick={() => alert('Downloading official PDF Escrow receipt...')} className="text-emerald-700 hover:underline">
                        PDF ↓
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50 bg-amber-50/30">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">ESC-9822</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">Thomas Powell</td>
                    <td className="px-4 py-3.5 font-bold text-amber-900">Milestone 2: High-Fidelity Figma</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">$1,500.00</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold">$0.00 (No VAT)</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        🔒 Locked in Escrow (In Review)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <button type="button" onClick={() => alert('Downloading official PDF Escrow receipt...')} className="text-emerald-700 hover:underline">
                        PDF ↓
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">ESC-8730</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">Elena Rostova</td>
                    <td className="px-4 py-3.5">Milestone 1: 5,000 Prompts Dataset</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">$1,600.00</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold">$0.00 (No VAT)</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        🔒 Secured in Escrow
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <button type="button" onClick={() => alert('Downloading official PDF Escrow receipt...')} className="text-emerald-700 hover:underline">
                        PDF ↓
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900">ESC-7641</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">Marcus Vance</td>
                    <td className="px-4 py-3.5">Fixed-Price Full Escrow: Payment Gateway</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">$2,800.00</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-bold">$0.00 (No VAT)</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        🔒 Secured in Escrow
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      <button type="button" onClick={() => alert('Downloading official PDF Escrow receipt...')} className="text-emerald-700 hover:underline">
                        PDF ↓
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Review Deliverable & Release Escrow Funds */}
      {reviewMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setReviewMilestone(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review Milestone Deliverable</h3>
                <p className="text-xs text-slate-500">Submitted by {reviewMilestone.contract.freelancerName}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-semibold text-slate-800">{reviewMilestone.milestone.title}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">${reviewMilestone.milestone.amount.toLocaleString()}</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px] pt-1 border-t border-slate-200/80">
                &ldquo;{reviewMilestone.milestone.deliverableNotes || 'Work finished as per milestone specification.'}&rdquo;
              </p>
              {reviewMilestone.milestone.deliverableLink && (
                <div className="pt-2">
                  <a
                    href={reviewMilestone.milestone.deliverableLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100 transition-colors"
                  >
                    <span>Inspect Deliverable Files &amp; Prototype</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Escrow Release Notice */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>🔒 Escrow Protection Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Releasing this milestone will instantly disburse <strong>${reviewMilestone.milestone.amount.toLocaleString()}</strong> from escrow to {reviewMilestone.contract.freelancerName}. Zero VAT is deducted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert("Revision requested! A notification has been sent to the freelancer.");
                  setReviewMilestone(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() =>
                  handleReleaseEscrow(
                    reviewMilestone.contract.id,
                    reviewMilestone.milestone.id,
                    reviewMilestone.milestone.amount
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Approve &amp; Release Escrow Funds</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLYOUT: Chat with Specialist */}
      {chatFreelancer && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-xs">Chat with {chatFreelancer}</span>
            </div>
            <button
              type="button"
              onClick={() => setChatFreelancer(null)}
              className="text-slate-400 hover:text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    msg.sender === 'client'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendChat} className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type message to freelancer..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
