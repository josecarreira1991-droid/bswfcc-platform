import { getCurrentMember } from "@/lib/actions/auth";
import { getMemberStats } from "@/lib/actions/members";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const stats = await getMemberStats().catch(() => ({ total: 0, ativos: 0, pendentes: 0, byRole: {} }));

  return (
    <>
      <AdminShell member={member} pendingCount={stats.pendentes}>
        {children}
      </AdminShell>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1B2A4A",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            color: "#fff",
          },
        }}
      />
    </>
  );
}
