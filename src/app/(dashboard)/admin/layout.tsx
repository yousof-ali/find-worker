
import Sidebar from "@/components/dashboard/admin/Sidebar";
import Topbar from "@/components/dashboard/admin/Topbar";
import { DashboardProvider } from "@/providers/DashboardContext";

import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Right Side */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <Topbar />

          {/* Content */}
          <main className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}