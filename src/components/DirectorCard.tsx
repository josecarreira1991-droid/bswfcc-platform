interface DirectorCardProps {
  name: string;
  role: string;
  profile: string;
  linkedin?: string;
  company?: string;
}

export default function DirectorCard({ name, role, profile, linkedin, company }: DirectorCardProps) {
  return (
    <div className="bg-dark-blue/60 rounded-xl p-6 border border-gold/10 hover:border-gold/30 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-lg shrink-0">
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">{name}</h3>
          <p className="text-gold text-sm font-medium">{role}</p>
          {company && <p className="text-gray-400 text-sm mt-1">{company}</p>}
          <p className="text-gray-300 text-sm mt-2 line-clamp-3">{profile}</p>
          {linkedin && (
            <a
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-gold mt-2 transition-colors"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
