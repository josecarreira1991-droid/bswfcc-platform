import type { Event } from "@/types/database";

const typeLabels: Record<Event["type"], string> = {
  networking: "Networking",
  palestra: "Palestra",
  workshop: "Workshop",
  gala: "Gala",
  almoco: "Almoço",
  outro: "Outro",
};

const typeColors: Record<Event["type"], string> = {
  networking: "bg-blue-500/20 text-blue-400",
  palestra: "bg-purple-500/20 text-purple-400",
  workshop: "bg-green-500/20 text-green-400",
  gala: "bg-gold/20 text-gold",
  almoco: "bg-orange-500/20 text-orange-400",
  outro: "bg-gray-500/20 text-gray-400",
};

export default function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date + "T00:00:00");
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase();

  return (
    <div className="bg-dark-blue/60 rounded-xl p-5 border border-gold/10 hover:border-gold/30 transition-all group">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-navy rounded-lg flex flex-col items-center justify-center border border-gold/20">
          <span className="text-2xl font-bold text-gold">{day}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{month}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[event.type]}`}>
              {typeLabels[event.type]}
            </span>
            {event.is_public && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                Público
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-gold transition-colors truncate">
            {event.title}
          </h3>
          {event.time && (
            <p className="text-xs text-gray-400 mt-1">{event.time}</p>
          )}
          {event.location && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{event.location}</p>
          )}
        </div>
      </div>
    </div>
  );
}
