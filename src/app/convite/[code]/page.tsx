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
      <div className="min-h-screen bg-[#ECF0F5] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-300 flex items-center justify-center mx-auto mb-6">
            <span className="text-red-700 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-corp-text mb-3">Convite Inválido</h1>
          <p className="text-corp-muted mb-8">
            Este convite não é mais válido. Ele pode já ter sido utilizado ou expirado. Entre em contato com a BSWFCC para solicitar um novo convite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              Ir para o Site
            </Link>
            <a
              href="https://bswfcc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-corp-border text-corp-muted rounded-lg hover:bg-gray-50 transition-colors"
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
    <div className="min-h-screen bg-[#ECF0F5]">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#ECF0F5] via-white to-[#ECF0F5]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
          <div>
            <Link href="/" className="text-3xl font-bold text-accent">
              BSWFCC
            </Link>
            <p className="text-xs text-corp-muted mt-1">Brazilian Southwest Florida Chamber of Commerce</p>
          </div>
          <Link
            href={`/register?ref=${params.code}`}
            className="px-5 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Cadastrar Agora
          </Link>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/15 rounded-full text-accent text-sm font-medium mb-8">
            <Star size={14} />
            Convite Exclusivo
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-corp-text mb-6">
            Você foi convidado para a{" "}
            <span className="text-accent">BSWFCC</span>
          </h1>

          <div className="inline-flex items-center gap-3 bg-white border border-corp-border rounded-lg px-6 py-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-sm">
                {(referrer.full_name || "").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </span>
            </div>
            <div className="text-left">
              <p className="text-corp-text font-medium text-sm">Convidado por {referrer.full_name}</p>
              {referrer.company && <p className="text-corp-muted text-xs">{referrer.company}</p>}
            </div>
          </div>

          <p className="text-xl text-corp-muted max-w-2xl mx-auto mb-10">
            Faça parte da maior rede de empresários brasileiros no Southwest Florida. Networking inteligente, eventos exclusivos e acesso ao corredor comercial FL-Brasil de US$ 25,6 bilhões.
          </p>

          <Link
            href={`/register?ref=${params.code}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 text-lg"
          >
            Cadastrar Agora
            <ArrowRight size={20} />
          </Link>
        </div>
      </header>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-corp-text mb-4">
            Por que se tornar <span className="text-accent">membro</span>?
          </h2>
          <p className="text-corp-muted max-w-2xl mx-auto">
            A BSWFCC conecta empresários brasileiros a oportunidades reais no mercado americano, com ferramentas inteligentes e uma comunidade ativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white border border-corp-border rounded-lg p-6 hover:border-accent/30 transition-colors group"
            >
              <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <b.icon size={20} className="text-accent" />
              </div>
              <h3 className="text-corp-text font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-corp-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-white/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-corp-text mb-4">
              Planos de <span className="text-accent">Membership</span>
            </h2>
            <p className="text-corp-muted max-w-2xl mx-auto">
              Escolha o plano que mais se encaixa nas necessidades da sua empresa. Todos os planos incluem acesso à rede de membros da BSWFCC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg p-6 border transition-all ${
                  tier.highlight
                    ? "border-accent/30 bg-accent/10 ring-1 ring-accent/15"
                    : "border-corp-border bg-white"
                }`}
              >
                {tier.highlight && (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-corp-text mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-accent">{tier.price}</span>
                  <span className="text-corp-muted text-sm">{tier.period}</span>
                </div>
                <p className="text-xs text-corp-muted mb-5">{tier.annual}</p>
                <ul className="space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-corp-muted">
                      <CheckCircle2 size={15} className="text-accent flex-shrink-0 mt-0.5" />
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
      <section className="bg-[#ECF0F5] border-y border-corp-border">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-corp-text mb-4">
            Pronto para fazer parte da <span className="text-accent">câmara que conecta</span>?
          </h2>
          <p className="text-corp-muted mb-8 max-w-2xl mx-auto">
            {referrer.full_name} já faz parte da rede. Cadastre-se agora e comece a acessar networking exclusivo, eventos, inteligência de mercado e a maior rede de empresários brasileiros do SWFL.
          </p>
          <Link
            href={`/register?ref=${params.code}`}
            className="inline-flex items-center gap-2 px-10 py-4 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 text-lg"
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
            <span className="text-xl font-bold text-accent">BSWFCC</span>
            <p className="text-xs text-corp-muted mt-1">Brazilian Southwest Florida Chamber of Commerce, Inc.</p>
            <p className="text-[10px] text-corp-muted/50 mt-1">EIN: 99-4852466 | SunBiz: N24000010828 | Florida Not For Profit 501(c)(6)</p>
          </div>
          <div className="flex gap-6 text-sm text-corp-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <Link href="/diretoria" className="hover:text-accent transition-colors">Diretoria</Link>
            <a href="https://bswfcc.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">bswfcc.com</a>
          </div>
          <p className="text-xs text-corp-muted/50">
            Plataforma desenvolvida por{" "}
            <a href="https://quantrexnow.io" target="_blank" rel="noopener noreferrer" className="text-accent/60 hover:text-accent">
              Quantrex LLC
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
