import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { ROLE_LABELS, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ProfileEditor from "@/components/admin/ProfileEditor";
import { Mail, Phone, Building2, MapPin, Linkedin, Calendar } from "lucide-react";

export default async function PerfilPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const statusVariant = member.status === "ativo" ? "success" : member.status === "pendente" ? "warning" : "danger";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-corp-text">Meu Perfil</h1>
          <p className="text-sm text-corp-muted mt-0.5">Informações da sua conta</p>
        </div>
        <ProfileEditor member={member} />
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile header */}
        <div className="bg-white shadow-card border border-corp-border rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center">
              <span className="text-navy font-bold text-xl">
                {(member.full_name || "").split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-corp-text">{member.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="gold">{ROLE_LABELS[member.role] || member.role}</Badge>
                <Badge variant={statusVariant}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          {member.bio && (
            <p className="text-sm text-corp-muted">{member.bio}</p>
          )}
        </div>

        {/* Details */}
        <div className="bg-white shadow-card border border-corp-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-slate-600 mb-4">Informações de Contato</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Mail, label: "Email", value: member.email },
              { icon: Phone, label: "Telefone", value: member.phone },
              { icon: Building2, label: "Empresa", value: member.company },
              { icon: MapPin, label: "Cidade", value: member.city },
              { icon: Linkedin, label: "LinkedIn", value: member.linkedin, isLink: true },
              { icon: Calendar, label: "Membro desde", value: formatDate(member.created_at) },
            ].map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <field.icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] text-corp-muted uppercase tracking-wider">{field.label}</p>
                  {field.isLink && field.value ? (
                    <a
                      href={field.value.startsWith("http") ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 hover:text-blue-600 hover:underline"
                    >
                      {field.value}
                    </a>
                  ) : (
                    <p className="text-sm text-corp-text">{field.value || "—"}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {member.industry && (
          <div className="bg-white shadow-card border border-corp-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">Indústria</h3>
            <p className="text-sm text-corp-text">{member.industry}</p>
          </div>
        )}
      </div>
    </div>
  );
}
