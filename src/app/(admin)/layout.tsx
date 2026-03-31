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
    <div className="bg-amber-500/10 border border-amber-500/15 rounded-xl p-4 mb-4">
      <p className="text-sm text-amber-400 font-medium">Sua conta está pendente de aprovação</p>
      <p className="text-xs text-corp-muted mt-1">Um administrador precisa aprovar seu cadastro para acesso completo.</p>
    </div>
  ) : member.status === "inativo" ? (
    <div className="bg-red-500/10 border border-red-500/15 rounded-xl p-4 mb-4">
      <p className="text-sm text-red-400 font-medium">Sua conta está inativa</p>
      <p className="text-xs text-corp-muted mt-1">Entre em contato com a diretoria da BSWFCC para reativar.</p>
    </div>
  ) : null;

  return (
    <>
      <AdminShell member={member} pendingCount={stats.pendentes}>
        {pendingBanner}
        {children}
      </AdminShell>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1C28",
            border: "1px solid rgba(139,92,246,0.1)",
            color: "#E8ECF2",
          },
        }}
      />
    </>
  );
}
