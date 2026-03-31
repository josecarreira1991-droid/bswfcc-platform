"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { useState, Suspense } from "react";

const INPUT_CLASS =
  "w-full px-4 py-3 bg-slate-50 border border-corp-border rounded-lg text-corp-text placeholder-slate-400 focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20 transition-colors";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("redirect", redirectTo);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-navy">BSWFCC</Link>
          <p className="text-corp-muted mt-2">Acesse a plataforma</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-corp-border shadow-card">
          <h2 className="text-2xl font-bold text-corp-text mb-6">Entrar</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-corp-muted mb-1.5">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={INPUT_CLASS}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-corp-muted mb-1.5">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className={INPUT_CLASS}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-light-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-corp-muted">
            Não tem conta?{" "}
            <Link href="/register" className="text-navy hover:text-light-navy font-medium transition-colors">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-navy">Carregando...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
