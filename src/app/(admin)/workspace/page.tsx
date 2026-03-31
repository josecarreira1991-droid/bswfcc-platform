import { getCurrentMember } from "@/lib/actions/auth";
import { getAllMembers, getMemberStats } from "@/lib/actions/members";
import { getEvents, getUpcomingEvents } from "@/lib/actions/events";
import { getMarketData } from "@/lib/actions/market";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { Lock } from "lucide-react";
import WorkspaceView from "@/components/admin/WorkspaceView";

export default async function WorkspacePage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  if (!isAdmin(member.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock size={32} className="text-slate-600 mb-3" />
        <h2 className="text-lg font-medium text-corp-text mb-1">Acesso Restrito</h2>
        <p className="text-sm text-corp-muted">Workspace disponível para administradores.</p>
      </div>
    );
  }

  const [members, stats, events, upcomingEvents, marketData] = await Promise.all([
    getAllMembers().catch(() => []),
    getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, inativos: 0, byRole: {}, byIndustry: {} })),
    getEvents().catch(() => []),
    getUpcomingEvents(5).catch(() => []),
    getMarketData().catch(() => []),
  ]);

  return (
    <WorkspaceView
      members={members}
      stats={stats}
      events={events}
      upcomingEvents={upcomingEvents}
      marketData={marketData}
    />
  );
}
