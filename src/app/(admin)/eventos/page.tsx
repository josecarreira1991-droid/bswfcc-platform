import { getCurrentMember } from "@/lib/actions/auth";
import { getEvents } from "@/lib/actions/events";
import { redirect } from "next/navigation";
import EventsManager from "@/components/admin/EventsManager";

export default async function EventosPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const events = await getEvents().catch(() => []);

  return <EventsManager events={events} currentMember={member} />;
}
