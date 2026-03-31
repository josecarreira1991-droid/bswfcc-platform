interface DirectorCardProps {
  name: string;
  role: string;
  profile: string;
  linkedin?: string;
  company?: string;
}

export default function DirectorCard({ name, role, profile, linkedin, company }: DirectorCardProps) {
  return (
    <div className="bg-white shadow-card rounded-xl p-6 border border-navy/15 hover:border-navy/30 transition-all group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold text-lg shrink-0">
          {name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-corp-text group-hover:text-navy transition-colors">{name}</h3>
          <p className="text-navy text-sm font-medium">{role}</p>
          {company && <p className="text-corp-muted text-sm mt-1">{company}</p>}
          <p className="text-slate-600 text-sm mt-2 line-clamp-3">{profile}</p>
          {linkedin && (
            <a
              href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-navy mt-2 transition-colors"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
