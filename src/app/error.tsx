"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-400 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-3">Algo deu errado</h2>
        <p className="text-gray-400 text-sm mb-6">
          Ocorreu um erro inesperado. Tente novamente ou volte ao painel.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-light-gold transition-colors text-sm"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            Voltar ao painel
          </a>
        </div>
      </div>
    </div>
  );
}
