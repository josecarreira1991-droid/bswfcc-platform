import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import {
  Bot,
  Mail,
  BarChart3,
  CalendarDays,
  FileText,
  Link2,
  ExternalLink,
  Play,
  ChevronDown,
  Star,
  Globe,
  Building2,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import FerramentasFAQ from "./FerramentasFAQ";

export default async function FerramentasPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const features = [
    { icon: Bot, label: "Assistente IA por WhatsApp (responde clientes 24/7)" },
    { icon: Mail, label: "Email automatizado com templates inteligentes" },
    { icon: BarChart3, label: "Workspace com CRM e pipeline de vendas" },
    { icon: CalendarDays, label: "Agenda integrada com Google Calendar" },
    { icon: FileText, label: "Geração automática de propostas e documentos" },
    { icon: Link2, label: "Integrações com +50 ferramentas" },
  ];

  const steps = [
    { number: "01", title: "Acesse myceo.store e crie sua conta", description: "Cadastro rápido com email e senha. Sem cartão de crédito." },
    { number: "02", title: "Configure seu WhatsApp Business", description: "Conecte seu número existente em poucos cliques." },
    { number: "03", title: "Personalize seu assistente IA", description: "Defina o tom, respostas e fluxos do seu negócio." },
    { number: "04", title: "Comece a automatizar", description: "Seu assistente já está ativo e respondendo clientes." },
  ];

  const stats = [
    { icon: Globe, value: "5 países", label: "Usado por empresários" },
    { icon: Building2, value: "9 indústrias", label: "Atendidas" },
    { icon: Shield, value: "Quantrex LLC", label: "Parceira oficial BSWFCC" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#0A1628] to-[#0D1B2A] border border-slate-700/50 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-6">
            <Star size={14} className="text-gold" />
            <span className="text-xs font-semibold text-gold uppercase tracking-wider">Exclusivo para membros</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Ferramentas Exclusivas
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Benefícios exclusivos para membros da BSWFCC. Acesse plataformas e recursos que impulsionam seu negócio.
          </p>
        </div>
      </div>

      {/* MyCEO Main Card */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gold gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/40 via-gold/10 to-gold/30 p-[1px]">
          <div className="w-full h-full rounded-2xl bg-[#0D1B2A]" />
        </div>

        <div className="relative z-10 p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                  <Zap size={28} className="text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    MyCEO
                  </h2>
                  <p className="text-gold/80 text-sm font-medium">
                    Seu Assistente de Negócios com IA
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                <CheckCircle2 size={14} className="text-gold" />
                <span className="text-xs font-semibold text-gold">Parceiro Quantrex LLC</span>
              </div>
            </div>

            {/* Price highlight */}
            <div className="flex-shrink-0 bg-[#0A1628] border border-gold/20 rounded-xl p-5 text-center min-w-[220px]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Investimento</p>
              <p className="text-3xl font-bold text-gold">~US$ 10</p>
              <p className="text-slate-400 text-sm">/mês pelo uso da API</p>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <p className="text-emerald-400 text-xs font-semibold">Sem mensalidade fixa</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-3xl">
            Plataforma de automação completa para empresários. WhatsApp Business com IA, workspace inteligente, CRM, email automatizado — tudo por apenas US$ 10/mês de uso de API. Sem mensalidade fixa.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#0A1628]/80 border border-slate-700/30 hover:border-gold/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={20} className="text-gold" />
                </div>
                <span className="text-sm text-slate-300">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Exclusive badge */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gold/5 border border-gold/10 mb-8">
            <Star size={16} className="text-gold" />
            <span className="text-sm text-gold font-medium">Exclusivo para membros BSWFCC</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://myceo.store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-[#0A1628] font-semibold text-sm hover:bg-light-gold transition-colors"
            >
              Acessar MyCEO
              <ExternalLink size={16} />
            </a>
            <a
              href="https://www.instagram.com/reel/DV614ZJEb75/?igsh=MXc1dzRsYTJicTF5OQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-transparent border border-gold/30 text-gold font-semibold text-sm hover:bg-gold/10 transition-colors"
            >
              <Play size={16} />
              Ver Demonstração
            </a>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="rounded-2xl bg-[#0D1B2A] border border-slate-700/50 p-8 md:p-10">
        <h3 className="text-xl font-bold text-white mb-8">Como funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="text-5xl font-black text-gold/10 mb-3">{step.number}</div>
              <h4 className="text-base font-semibold text-white mb-2">{step.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats / Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#0D1B2A] border border-slate-700/50 p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <stat.icon size={24} className="text-gold" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Partnership banner */}
      <div className="rounded-2xl bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/15 p-8 text-center">
        <p className="text-lg font-semibold text-white mb-2">
          Desenvolvido pela Quantrex LLC, parceira oficial da BSWFCC
        </p>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          A Quantrex LLC é especializada em automação de processos com inteligência artificial para empresas tradicionais. Usado por empresários em 5 países, atendendo 9 indústrias diferentes.
        </p>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-[#0D1B2A] border border-slate-700/50 p-8 md:p-10">
        <h3 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h3>
        <FerramentasFAQ />
      </div>
    </div>
  );
}
