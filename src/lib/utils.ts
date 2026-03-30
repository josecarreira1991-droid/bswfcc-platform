import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ADMIN_ROLES = [
  "presidente",
  "vice_presidente",
  "secretario",
  "tesoureiro",
  "diretor_tecnologia",
  "diretor_marketing",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  presidente: "Presidente",
  vice_presidente: "Vice-Presidente",
  secretario: "Secretário",
  tesoureiro: "Tesoureiro",
  diretor_marketing: "Dir. Marketing",
  diretor_tecnologia: "Dir. Tecnologia",
  diretor_inovacao: "Dir. Inovação",
  diretor: "Diretor",
  membro: "Membro",
  parceiro_estrategico: "Parceiro Estratégico",
  voluntario: "Voluntário",
};

export const STATUS_STYLES: Record<string, string> = {
  ativo: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  pendente: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  inativo: "bg-red-500/15 text-red-400 border border-red-500/20",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  networking: "Networking",
  palestra: "Palestra",
  workshop: "Workshop",
  gala: "Gala",
  almoco: "Almoço",
  outro: "Outro",
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isAdmin(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function calculateMatchScore(
  profileA: { services_offered: string[]; services_needed: string[]; target_industries: string[]; languages: string[]; tags: string[] },
  profileB: { services_offered: string[]; services_needed: string[]; target_industries: string[]; languages: string[]; tags: string[] }
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const aOffersForB = profileA.services_offered.filter((s) => profileB.services_needed.includes(s));
  if (aOffersForB.length > 0) {
    score += 30;
    reasons.push(`Oferece: ${aOffersForB.join(", ")}`);
  }

  const bOffersForA = profileB.services_offered.filter((s) => profileA.services_needed.includes(s));
  if (bOffersForA.length > 0) {
    score += 30;
    reasons.push(`Precisa de: ${bOffersForA.join(", ")}`);
  }

  const industryMatch = profileA.target_industries.filter((i) => profileB.target_industries.includes(i));
  if (industryMatch.length > 0) {
    score += 20;
    reasons.push(`Indústrias: ${industryMatch.join(", ")}`);
  }

  const langMatch = profileA.languages.filter((l) => profileB.languages.includes(l));
  if (langMatch.length > 0) score += 10;

  const tagMatch = profileA.tags.filter((t) => profileB.tags.includes(t));
  if (tagMatch.length > 0) {
    score += 10;
    reasons.push(`Tags: ${tagMatch.join(", ")}`);
  }

  return { score: Math.min(score, 100), reasons };
}
