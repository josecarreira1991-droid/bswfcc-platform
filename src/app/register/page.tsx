"use client";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import { useState } from "react";

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
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold gold-gradient">BSWFCC</Link>
          <p className="text-gray-400 mt-2">Torne-se membro da câmara</p>
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
                <label className="block text-sm text-gray-400 mb-1.5">Nome Completo *</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Telefone</label>
                <input
                  name="phone"
                  type="tel"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="(239) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Senha *</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tipo de Membro</label>
                <select
                  name="role"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Empresa</label>
                <input
                  name="company"
                  type="text"
                  className="w-full px-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Indústria</label>
                <select
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
                <label className="block text-sm text-gray-400 mb-1.5">Cidade</label>
                <input
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
            Seu cadastro será revisado pela diretoria. Status inicial: pendente.
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
