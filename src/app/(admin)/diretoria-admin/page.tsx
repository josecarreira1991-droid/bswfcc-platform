import { getCurrentMember } from "@/lib/actions/auth";
import { getDirectors } from "@/lib/actions/market";
import { redirect } from "next/navigation";
import { Shield, Linkedin, Building2 } from "lucide-react";

export default async function DiretoriaAdminPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const directors = await getDirectors().catch(() => []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Diretoria BSWFCC</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Conselho executivo e diretores
        </p>
      </div>

      {directors.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {directors.map((d) => (
            <div
              key={d.id}
              className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-semibold text-sm">
                    {(d.name || "").split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{d.name}</p>
                  <p className="text-[11px] text-gold">{d.role}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-3">{d.profile}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                {d.company && (
                  <span className="flex items-center gap-1"><Building2 size={11} /> {d.company}</span>
                )}
                {d.linkedin && (
                  <a
                    href={d.linkedin.startsWith("http") ? d.linkedin : `https://${d.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                  >
                    <Linkedin size={11} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-12 text-center">
          <Shield size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhum diretor cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
}
