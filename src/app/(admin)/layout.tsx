import { getCurrentMember } from "@/lib/actions/auth";
import { getMemberStats } from "@/lib/actions/members";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const stats = await getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, inativos: 0, byRole: {}, byIndustry: {} }));

  const pendingBanner = member.status === "pendente" ? (
    <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4">
      <p className="text-sm text-amber-800 font-semibold">Sua conta está pendente de aprovação</p>
      <p className="text-xs text-amber-700 mt-0.5">Um administrador precisa aprovar seu cadastro.</p>
    </div>
  ) : member.status === "inativo" ? (
    <div className="bg-red-50 border border-red-300 rounded p-3 mb-4">
      <p className="text-sm text-red-800 font-semibold">Sua conta está inativa</p>
      <p className="text-xs text-red-700 mt-0.5">Entre em contato com a diretoria da BSWFCC.</p>
    </div>
  ) : null;

  return (
    <>
      <AdminShell member={member} pendingCount={stats.pendentes}>
        {pendingBanner}
        {children}
      </AdminShell>
      <Toaster position="top-right" toastOptions={{ style: { background: "#FFFFFF", border: "1px solid #B8C4CE", color: "#1A1A2E", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }} />
    </>
  );
}
