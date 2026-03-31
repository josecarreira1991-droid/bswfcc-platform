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
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <p className="text-sm text-amber-800 font-medium">Sua conta está pendente de aprovação</p>
      <p className="text-xs text-amber-600 mt-1">Um administrador precisa aprovar seu cadastro para que você tenha acesso completo à plataforma. Enquanto isso, você pode visualizar seu perfil.</p>
    </div>
  ) : member.status === "inativo" ? (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <p className="text-sm text-red-800 font-medium">Sua conta está inativa</p>
      <p className="text-xs text-red-600 mt-1">Entre em contato com a diretoria da BSWFCC para reativar sua conta.</p>
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
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#1E293B",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
        }}
      />
    </>
  );
}
