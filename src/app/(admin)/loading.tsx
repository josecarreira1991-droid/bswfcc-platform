export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}
