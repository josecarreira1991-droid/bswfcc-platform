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
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isAdmin(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}
