"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <span className="text-red-400 text-xl font-bold">!</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Erro ao carregar</h2>
        <p className="text-gray-400 text-sm mb-5">
          Ocorreu um erro nesta pagina. Tente recarregar.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-light-gold transition-colors text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
