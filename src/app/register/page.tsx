"use client";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import { useState } from "react";

const tiers = [
  { value: "membro", label: "Community", price: "$50/mês ($600/ano)", desc: "Mixers mensais, diretório de membros, newsletter, introduções básicas" },
  { value: "membro", label: "Business", price: "$150/mês ($1.800/ano)", desc: "Tudo do Community + workshops trimestrais, tours SeaPort, seminários jurídicos/fiscais" },
  { value: "membro", label: "Executive", price: "$500/mês ($6.000/ano)", desc: "Tudo do Business + consultoria 1:1, suporte para entrada no mercado brasileiro" },
  { value: "membro", label: "Trustee", price: "$1.500/mês ($18.000/ano)", desc: "Tudo do Executive + acesso ao conselho, missões comerciais, gerente dedicado" },
];

const roles = [
  { value: "membro", label: "Membro" },
  { value: "parceiro_estrategico", label: "Parceiro Estratégico" },
  { value: "voluntario", label: "Voluntário" },
];

const industries = [
  "Construção", "Real Estate", "Restaurante / Food", "Saúde",
  "Tecnologia", "Comércio", "Serviços Profissionais", "Educação",
  "Beleza / Estética", "Automotivo", "Turismo / Hospitality",
  "Advocacia / Legal", "Contabilidade / Finance", "Outro",
];

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold gold-gradient">BSWFCC</Link>
          <p className="text-gray-400 mt-2">Torne-se membro da câmara</p>
        </div>

        {/* Membership Tiers */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider mb-4 text-center">Planos de Membership</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiers.map((tier, i) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => setSelectedTier(i)}
                className={`rounded-xl p-4 border text-left transition-all ${
                  selectedTier === i
                    ? "border-gold bg-gold/10"
                    : "border-white/10 bg-dark-blue/40 hover:border-gold/30"
                }`}
              >
                <p className={`font-semibold text-sm ${selectedTier === i ? "text-gold" : "text-white"}`}>
                  {tier.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">{tier.price}</p>
                <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">{tier.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 bg-dark-blue/40 rounded-lg p-3 border border-gold/10">
            <p className="text-xs text-gray-400">
              <span className="text-gold font-medium">Valor adicional (Business+):</span> Diretório de Negócios BR-FL (500+ empresas), Guia de Compliance Comercial, Programa SeaPort Fast-Track, Toolkit de Imigração Empresarial, Relatórios Trimestrais de Mercado.
            </p>
          </div>
        </div>

        <div className="bg-dark-blue/80 rounded-2xl p-8 border border-gold/10">
          <h2 className="text-2xl font-bold mb-6">Cadastro</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className="block text-sm text-gray-400 mb-1.5">Nome Completo *</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label htmlFor="reg_email" className="block text-sm text-gray-400 mb-1.5">Email *</label>
                <input
                  id="reg_email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-gray-400 mb-1.5">Telefone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="(239) 000-0000"
                />
              </div>
              <div>
                <label htmlFor="reg_password" className="block text-sm text-gray-400 mb-1.5">Senha *</label>
                <input
                  id="reg_password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm text-gray-400 mb-1.5">Tipo de Cadastro</label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm text-gray-400 mb-1.5">Empresa</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm text-gray-400 mb-1.5">Indústria</label>
                <select
                  id="industry"
                  name="industry"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  <option value="">Selecione...</option>
                  {industries.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm text-gray-400 mb-1.5">Cidade</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Fort Myers, Cape Coral..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold text-navy font-semibold rounded-lg hover:bg-light-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Seu cadastro será revisado pela diretoria. Status inicial: pendente. A seleção de tier será confirmada após aprovação.
          </p>

          <div className="mt-6 text-center text-sm text-gray-400">
            Já tem conta?{" "}
            <Link href="/login" className="text-gold hover:text-light-gold transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
