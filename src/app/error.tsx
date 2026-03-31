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
    <div className="min-h-screen bg-[#ECF0F5] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-300 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-700 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-corp-text mb-3">Algo deu errado</h2>
        <p className="text-corp-muted text-sm mb-6">
          Ocorreu um erro inesperado. Tente novamente ou volte ao painel.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors text-sm"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="px-5 py-2.5 border border-corp-border text-corp-muted rounded-lg hover:bg-gray-50 hover:text-corp-text transition-colors text-sm"
          >
            Voltar ao painel
          </a>
        </div>
      </div>
    </div>
  );
}
