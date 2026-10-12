'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export type MarketplaceBadge = {
  platform: string;
  badge: string;
  url: string;
};

export type Education = {
  degree: string;
  institute: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Experience = {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type LinkedProfile = {
  platform: string;
  badge: string;
  title: string;
  subtitle: string;
  link: string;
};

export type WorkerProfile = {
  _id: string;

  gender?: string;
  status?: string;
  createdBy?: "worker" | "admin";

  language?: string;
  badge?: string;

  category?: {
    _id: string;
    name: string;
  } | null;

  rating?: number;
  reviewsCount?: number;

  location?: string;
  dateOfBirth?: string | null;

  marketplaceBadges?: MarketplaceBadge[];
  about?: string;

  education?: Education[];
  experience?: Experience[];

  skills?: string[];

  linkedProfiles?: LinkedProfile[];

  createdAt?: string;
};

export type AuthUser = {
  id: string;

  firstName: string;
  lastName: string;
  email: string;

  role: "admin" | "user" | "worker";

  avatar: string | null;

  company: string | null;
  country: string | null;
  talentDomain?: string | null;

  createdAt?: string;

  worker?: WorkerProfile | null;
} | null;

type AuthState = {
  user: AuthUser;
  loading: boolean;
  refresh: () => Promise<void>;
  authenticate: (user: Exclude<AuthUser, null>) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  authenticate: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const refreshInFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    refreshInFlight.current = (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    try {
      await refreshInFlight.current;
    } finally {
      refreshInFlight.current = null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const authenticate = useCallback((authenticatedUser: Exclude<AuthUser, null>) => {
    setUser(authenticatedUser);
    setLoading(false);
  }, []);

  // browser er back/forward button e cache kora page ashle
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) refresh();
    };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null); // age state clear
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);