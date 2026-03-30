import { getCurrentMember } from "@/lib/actions/auth";
import { getEvents } from "@/lib/actions/events";
import AuthNavbar from "@/components/AuthNavbar";
import EventCard from "@/components/EventCard";
import { redirect } from "next/navigation";

export default async function EventosPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const events = await getEvents().catch(() => []);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);

  return (
    <div className="min-h-screen bg-navy">
      <AuthNavbar member={member} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="gold-gradient">Eventos</span> BSWFCC
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Networking, palestras, workshops e mais
            </p>
          </div>
        </div>

        {/* Próximos Eventos */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gold mb-4">Próximos Eventos</h2>
          {upcoming.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-dark-blue/60 rounded-xl p-8 border border-gold/10 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-400">Nenhum evento agendado</p>
              <p className="text-sm text-gray-500 mt-1">Novos eventos serão publicados em breve.</p>
            </div>
          )}
        </section>

        {/* Tipos de Eventos */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">Tipos de Eventos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { type: "Networking", desc: "Conexões empresariais", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
              { type: "Palestras", desc: "Conhecimento e insights", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
              { type: "Workshops", desc: "Aprendizado prático", color: "bg-green-500/10 border-green-500/20 text-green-400" },
              { type: "Gala", desc: "Eventos formais", color: "bg-gold/10 border-gold/20 text-gold" },
              { type: "Almoços", desc: "Encontros informais", color: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
              { type: "Especiais", desc: "Eventos únicos", color: "bg-pink-500/10 border-pink-500/20 text-pink-400" },
            ].map((t) => (
              <div key={t.type} className={`rounded-xl p-4 border ${t.color}`}>
                <p className="font-semibold text-sm">{t.type}</p>
                <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eventos Passados */}
        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-400 mb-4">Eventos Anteriores</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
