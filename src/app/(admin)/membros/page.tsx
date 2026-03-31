import { getCurrentMember } from "@/lib/actions/auth";
import { getAllMembers, getMemberStats } from "@/lib/actions/members";
import { redirect } from "next/navigation";
import { Users, UserCheck, Clock, UserX } from "lucide-react";
import MembersTable from "@/components/admin/MembersTable";
import AddMemberForm from "@/components/admin/AddMemberForm";
import { isAdmin } from "@/lib/utils";

export default async function MembrosPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const [members, stats] = await Promise.all([
    getAllMembers().catch(() => []),
    getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, inativos: 0, byRole: {}, byIndustry: {} })),
  ]);

  const admin = isAdmin(currentMember.role);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-corp-text">Gestão de Membros</h1>
          <p className="text-sm text-corp-muted mt-0.5">{stats.total} membros registrados</p>
        </div>
        {admin && <AddMemberForm />}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-accent" },
          { label: "Ativos", value: stats.ativos, icon: UserCheck, color: "text-emerald-700" },
          { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "text-amber-700" },
          { label: "Inativos", value: stats.inativos, icon: UserX, color: "text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-corp-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-corp-muted uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={14} className="text-corp-muted" strokeWidth={1.5} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <MembersTable members={members} currentMember={currentMember} />
    </div>
  );
}
