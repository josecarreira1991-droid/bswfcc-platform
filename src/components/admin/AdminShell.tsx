"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import type { Member } from "@/types/database";

interface AdminShellProps {
  member: Member;
  pendingCount?: number;
  children: React.ReactNode;
}

export default function AdminShell({ member, pendingCount = 0, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-corp-bg">
      <Sidebar
        member={member}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          pendingCount={pendingCount}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
