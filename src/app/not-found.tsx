import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-corp-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-accent mb-4">404</p>
        <h2 className="text-xl font-bold text-corp-text mb-3">Pagina nao encontrada</h2>
        <p className="text-corp-muted text-sm mb-6">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors text-sm"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
