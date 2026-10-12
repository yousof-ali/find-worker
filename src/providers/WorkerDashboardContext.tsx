"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type DashboardContextType = {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const WorkerDashboardContext = createContext<DashboardContextType | null>(null);

export function WorkerDashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Mobile / Tablet
        setIsSidebarOpen(false);
        setIsSidebarCollapsed(false);
      } else {
        // Desktop
        setIsSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      // Desktop → collapse / expand
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      // Mobile / Tablet → open / close
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <WorkerDashboardContext.Provider
      value={{
        isSidebarOpen,
        isSidebarCollapsed,
        toggleSidebar,
        closeSidebar,
      }}
    >
      {children}
    </WorkerDashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(WorkerDashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used inside WorkerDashboardProvider");
  }

  return context;
}