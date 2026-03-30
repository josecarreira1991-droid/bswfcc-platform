import Link from "next/link";
import { validateReferralCode } from "@/lib/actions/referrals";
import {
  Users,
  Sparkles,
  Calendar,
  BarChart3,
  MessageCircle,
  Handshake,
  Globe,
  Scale,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Diretório de Negócios BR-FL",
    desc: "Acesso ao maior diretório de empresas brasileiras no Southwest Florida, com 500+ empresas catalogadas e perfis detalhados.",
  },
  {
    icon: Sparkles,
    title: "Networking Inteligente com Match Score",
    desc: "Algoritmo proprietário que conecta empresários com maior potencial de sinergia, baseado em serviços, indústria e necessidades.",
  },
  {
    icon: Calendar,
    title: "Eventos Exclusivos",
    desc: "Mixers mensais, palestras com especialistas, workshops práticos e galas anuais para networking presencial de alto nível.",
  },
  {
    icon: BarChart3,
    title: "Relatórios de Inteligência de Mercado",
    desc: "Dados atualizados sobre o corredor comercial FL-Brasil, tendências de mercado, oportunidades e análises setoriais.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Business Direto",
    desc: "Canal direto com a câmara via WhatsApp para suporte, dúvidas e comunicação rápida com a diretoria.",
  },
  {
    icon: Handshake,
    title: "Indicações entre Membros",
    desc: "Seus serviços recomendados automaticamente a outros membros da rede que precisam exatamente do que você oferece.",
  },
  {
    icon: Globe,
    title: "Corredor Comercial FL-Brasil",
    desc: "Acesso facilitado ao corredor bilateral de US$ 25,6 bilhões entre Florida e Brasil, com suporte para importação e exportação.",
  },
  {
    icon: Scale,
    title: "Suporte Jurídico e Fiscal",
    desc: "Seminários de compliance, orientação tributária e acesso a advogados especializados em negócios internacionais.",
  },
];

const tiers = [
  {
    name: "Community",
    price: "$50",
    period: "/mês",
    annual: "$600/ano",
    highlight: false,
    features: [
      "Mixers mensais de networking",
      "Diretório de membros",
      "Newsletter semanal",
      "Introduções básicas entre membros",
    ],
  },
  {
    name: "Business",
    price: "$150",
    period: "/mês",
    annual: "$1.800/ano",
    highlight: true,
    features: [
      "Tudo do Community",
      "Workshops trimestrais",
      "Tours SeaPort Manatee",
      "Seminários jurídicos e fiscais",
      "Diretório completo BR-FL (500+ empresas)",
      "Match Score inteligente",
    ],
  },
  {
    name: "Executive",
    price: "$500",
    period: "/mês",
    annual: "$6.000/ano",
    highlight: false,
    features: [
      "Tudo do Business",
      "Consultoria 1:1 personalizada",
      "Suporte para entrada no mercado brasileiro",
      "Relatórios de inteligência exclusivos",
      "Prioridade em eventos e workshops",
    ],
  },
  {
    name: "Trustee",
    price: "$1.500",
    period: "/mês",
    annual: "$18.000/ano",
    highlight: false,
    features: [
      "Tudo do Executive",
      "Acesso ao conselho consultivo",
      "Missões comerciais internacionais",
      "Gerente de conta dedicado",
      "Voto em decisões estratégicas",
      "Logo em materiais oficiais",
    ],
  },
];

export default async function ConvitePage({ params }: { params: { code: string } }) {
  const result = await validateReferralCode(params.code);

  if (!result.valid || !result.referrer) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Convite Inválido</h1>
          <p className="text-slate-400 mb-8">
            Este convite não é mais válido. Ele pode já ter sido utilizado ou expirado. Entre em contato com a BSWFCC para solicitar um novo convite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-gold text-[#0A1628] font-semibold rounded-xl hover:bg-[#E8D5A0] transition-colors"
            >
              Ir para o Site
            </Link>
            <a
              href="https://bswfcc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-white/5 transition-colors"
            >
              bswfcc.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  const referrer = result.referrer;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#1B2A4A] to-[#0A1628]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9A84C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C9A84C]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div>
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] bg-clip-text text-transparent">
              BSWFCC
            </Link>
            <p className="text-xs text-slate-500 mt-1">Brazilian Southwest Florida Chamber of Commerce</p>
          </div>
          <Link
            href={`/register?ref=${params.code}`}
            className="px-5 py-2.5 text-sm font-medium bg-[#C9A84C] text-[#0A1628] rounded-lg hover:bg-[#E8D5A0] transition-colors"
          >
            Cadastrar Agora
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full text-[#C9A84C] text-sm font-medium mb-8">
            <Star size={14} />
            Convite Exclusivo
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-white mb-6">
            Você foi convidado para a{" "}
            <span className="bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] bg-clip-text text-transparent">BSWFCC</span>
          </h1>

          <div className="inline-flex items-center gap-3 bg-[#1B2A4A]/60 border border-slate-700/50 rounded-xl px-6 py-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#C9A84C] font-bold text-sm">
                {(referrer.full_name || "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </span>
            </div>
            <div className="text-left">
              <p className="text-white font-medium text-sm">Convidado por {referrer.full_name}</p>
              {referrer.company && <p className="text-slate-400 text-xs">{referrer.company}</p>}
            </div>
          </div>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Faça parte da maior rede de empresários brasileiros no Southwest Florida. Networking inteligente, eventos exclusivos e acesso ao corredor comercial FL-Brasil de US$ 25,6 bilhões.
          </p>

          <Link
            href={`/register?ref=${params.code}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold rounded-xl hover:bg-[#E8D5A0] transition-all shadow-lg shadow-[#C9A84C]/20 text-lg"
          >
            Cadastrar Agora
            <ArrowRight size={20} />
          </Link>
        </div>
      </header>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Por que se tornar <span className="text-[#C9A84C]">membro</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A BSWFCC conecta empresários brasileiros a oportunidades reais no mercado americano, com ferramentas inteligentes e uma comunidade ativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-[#0D1B2A] border border-slate-700/50 rounded-xl p-6 hover:border-[#C9A84C]/30 transition-colors group"
            >
              <div className="w-11 h-11 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C9A84C]/20 transition-colors">
                <b.icon size={20} className="text-[#C9A84C]" />
              </div>
              <h3 className="text-white font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-gradient-to-b from-[#0A1628] to-[#0D1B2A] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Planos de <span className="text-[#C9A84C]">Membership</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Escolha o plano que mais se encaixa nas necessidades da sua empresa. Todos os planos incluem acesso à rede de membros da BSWFCC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-6 border transition-all ${
                  tier.highlight
                    ? "border-[#C9A84C]/50 bg-[#C9A84C]/5 ring-1 ring-[#C9A84C]/20"
                    : "border-slate-700/50 bg-[#0D1B2A]"
                }`}
              >
                {tier.highlight && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-3">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#C9A84C]">{tier.price}</span>
                  <span className="text-slate-400 text-sm">{tier.period}</span>
                </div>
                <p className="text-xs text-slate-500 mb-5">{tier.annual}</p>
                <ul className="space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={15} className="text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1B2A4A] to-[#0A1628] border-y border-[#C9A84C]/10">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para fazer parte da <span className="text-[#C9A84C]">câmara que conecta</span>?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            {referrer.full_name} já faz parte da rede. Cadastre-se agora e comece a acessar networking exclusivo, eventos, inteligência de mercado e a maior rede de empresários brasileiros do SWFL.
          </p>
          <Link
            href={`/register?ref=${params.code}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold rounded-xl hover:bg-[#E8D5A0] transition-all shadow-lg shadow-[#C9A84C]/20 text-lg"
          >
            Cadastrar Agora
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#C9A84C] to-[#E8D5A0] bg-clip-text text-transparent">BSWFCC</span>
            <p className="text-xs text-slate-500 mt-1">Brazilian Southwest Florida Chamber of Commerce, Inc.</p>
            <p className="text-[10px] text-slate-600 mt-1">EIN: 99-4852466 | SunBiz: N24000010828 | Florida Not For Profit 501(c)(6)</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
            <Link href="/diretoria" className="hover:text-[#C9A84C] transition-colors">Diretoria</Link>
            <a href="https://bswfcc.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A84C] transition-colors">bswfcc.com</a>
          </div>
          <p className="text-xs text-slate-600">
            Plataforma desenvolvida por{" "}
            <a href="https://quantrexnow.io" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C]/60 hover:text-[#C9A84C]">
              Quantrex LLC
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
