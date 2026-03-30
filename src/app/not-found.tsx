import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-gold mb-4">404</p>
        <h2 className="text-xl font-bold text-white mb-3">Pagina nao encontrada</h2>
        <p className="text-gray-400 text-sm mb-6">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-gold text-navy font-semibold rounded-lg hover:bg-light-gold transition-colors text-sm"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
