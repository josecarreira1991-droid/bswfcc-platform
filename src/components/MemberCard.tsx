type MemberCardData = {
  id: string;
  full_name: string;
  role: string;
  status: string;
  company?: string | null;
  industry?: string | null;
  city?: string | null;
  linkedin?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

const roleLabels: Record<string, string> = {
  presidente: "Presidente",
  vice_presidente: "Vice-Presidente",
  secretario: "Secretário(a)",
  tesoureiro: "Tesoureiro(a)",
  diretor_marketing: "Diretor de Marketing",
  diretor_tecnologia: "Diretor de Tecnologia",
  diretor_inovacao: "Diretor de Inovação",
  diretor: "Diretor(a)",
  membro: "Membro",
  parceiro_estrategico: "Parceiro Estratégico",
  voluntario: "Voluntário(a)",
};

const statusColors: Record<string, string> = {
  ativo: "bg-green-500/20 text-green-400",
  pendente: "bg-yellow-500/20 text-yellow-400",
  inativo: "bg-red-500/20 text-red-400",
};

export default function MemberCard({ member }: { member: MemberCardData }) {
  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-dark-blue/60 rounded-xl p-5 border border-gold/10 hover:border-gold/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-lg shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white truncate">{member.full_name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[member.status]}`}>
              {member.status}
            </span>
          </div>
          <p className="text-gold text-sm font-medium">{roleLabels[member.role] || member.role}</p>
          {member.company && (
            <p className="text-gray-400 text-sm mt-1">{member.company}</p>
          )}
          {member.industry && (
            <p className="text-xs text-gray-500 mt-0.5">{member.industry}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {member.city && (
              <span className="text-xs text-gray-500">{member.city}</span>
            )}
            {member.linkedin && (
              <a
                href={member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-gold transition-colors"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
