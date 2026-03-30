import { getCurrentMember } from "@/lib/actions/auth";
import { getMembers } from "@/lib/actions/members";
import AuthNavbar from "@/components/AuthNavbar";
import MemberCard from "@/components/MemberCard";
import { redirect } from "next/navigation";

export default async function MembrosPage() {
  const currentMember = await getCurrentMember();
  if (!currentMember) redirect("/login");

  const members = await getMembers().catch(() => []);

  const grouped = {
    diretoria: members.filter((m) =>
      ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor", "diretor_marketing", "diretor_tecnologia", "diretor_inovacao"].includes(m.role)
    ),
    membros: members.filter((m) => m.role === "membro"),
    parceiros: members.filter((m) => m.role === "parceiro_estrategico"),
    voluntarios: members.filter((m) => m.role === "voluntario"),
  };

  return (
    <div className="min-h-screen bg-navy">
      <AuthNavbar member={currentMember} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-gradient">Membros</span> da Câmara
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {members.length} membros registrados
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Diretoria", count: grouped.diretoria.length, color: "text-gold" },
            { label: "Membros", count: grouped.membros.length, color: "text-accent" },
            { label: "Parceiros", count: grouped.parceiros.length, color: "text-purple-400" },
            { label: "Voluntários", count: grouped.voluntarios.length, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-dark-blue/60 rounded-lg p-4 border border-gold/10 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Diretoria */}
        {grouped.diretoria.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gold mb-4">Diretoria</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.diretoria.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        )}

        {/* Membros */}
        {grouped.membros.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Membros</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.membros.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        )}

        {/* Parceiros */}
        {grouped.parceiros.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-purple-400 mb-4">Parceiros Estratégicos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.parceiros.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        )}

        {/* Voluntários */}
        {grouped.voluntarios.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-green-400 mb-4">Voluntários</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.voluntarios.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </section>
        )}

        {members.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">Nenhum membro registrado ainda.</p>
            <p className="text-sm text-gray-500 mt-2">Membros aparecem aqui após cadastro e aprovação.</p>
          </div>
        )}
      </main>
    </div>
  );
}
