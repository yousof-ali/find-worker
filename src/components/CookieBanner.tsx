'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const CONSENT_KEY = "outlier_cookie_consent_v3";
const SESSION_KEY = "outlier_analytics_session";

function setConsentCookie(value: "accepted" | "declined") {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `analytics_consent=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    setConsent(storedConsent);
    if (!storedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (consent !== "accepted" || !pathname) return;

    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    const referrer = document.referrer
      ? (() => {
          const url = new URL(document.referrer);
          return `${url.origin}${url.pathname}`.slice(0, 500);
        })()
      : "";

    fetch("/api/visitor-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        path: pathname,
        referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
        },
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }),
    }).then((response) => {
      if (!response.ok) throw new Error("Visitor analytics could not be recorded.");
      setTrackingError("");
    }).catch((error: unknown) => {
      setTrackingError(error instanceof Error ? error.message : "Visitor analytics could not be recorded.");
    });
  }, [consent, pathname]);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsentCookie("accepted");
    setConsent("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsentCookie("declined");
    setConsent("declined");
    setIsVisible(false);
  };

  if (!isVisible) {
    return trackingError ? (
      <p role="status" className="fixed bottom-4 right-4 z-50 rounded-lg bg-rose-50 px-4 py-2 text-xs text-rose-700 shadow">
        {trackingError}
      </p>
    ) : null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 p-4 rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur-lg text-slate-800">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            By clicking <strong className="text-slate-900">“Accept All Cookies”</strong>, you consent to analytics storage of your IP address, pages visited, timestamps, browser/device details, language, timezone, and screen size. We do not use your IP address to determine exact location or link the analytics to your account identity. Read our{' '}
            <a href="#privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
          >
            Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
