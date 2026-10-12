'use client';


import BlogSection from "@/components/BlogSection";
import BrowseCategory from "@/components/BrowseCategory";
import ContributorMarquee from "@/components/ContributorMarquee";
import CTABanner from "@/components/CTABanner";


import FAQ from "@/components/FAQ";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowitWorks";
import Specializations from "@/components/Specializations";
import Testimonials from "@/components/Testimonials";
import TopFreelancers from "@/components/TopFreelancers";
import WhyOutlier from "@/components/WhyOutlier";
import { useState } from "react";


export default function Home() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('Software & Coding');

  const handleOpenApply = (domain?: string) => {
    if (domain) {
      setSelectedDomain(domain);
    }
    setIsApplyModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setIsSignInModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">


      

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* Hero Section with Interactive RLHF Preview */}
        <Hero onOpenApply={() => handleOpenApply()} />

        {/* Live Contributor Video & Stats Marquee */}
        <ContributorMarquee />

        {/* Browse Talent by Category (Recreated from Reference) */}
        <BrowseCategory onSelectCategory={(cat) => handleOpenApply(cat)} />

        {/* Top Freelancers Showcase (Placed Before THE OUTLIER ADVANTAGE) */}
        <TopFreelancers onSelectRole={(role) => handleOpenApply(role)} />

        {/* Why Outlier / Core Value Bento Grid (THE OUTLIER ADVANTAGE) */}
        <WhyOutlier />

        {/* Highest Rated Freelancers (OPEN OPPORTUNITIES) */}
        <Specializations onSelectRole={(role) => handleOpenApply(role)} />

        {/* 3-Step Process: How It Works */}
        <HowItWorks onOpenApply={() => handleOpenApply()} />

        {/* Contributor Testimonials & Reviews */}
        <Testimonials />

        {/* Recent News & Articles (Blog Post Section) */}
        <BlogSection />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Final CTA Banner */}
        <CTABanner
          onOpenApply={() => handleOpenApply()}
          onOpenSignIn={handleOpenSignIn}
        />
      </main>
    </div>
  );
}
