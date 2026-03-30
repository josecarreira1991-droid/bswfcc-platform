import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getBusinessProfile } from "@/lib/actions/matchmaking";
import { getMySuggestions } from "@/lib/actions/networking";
import NetworkingView from "@/components/admin/NetworkingView";

export default async function NetworkingPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const [profile, suggestions] = await Promise.all([
    getBusinessProfile(member.id).catch(() => null),
    getMySuggestions(member.id).catch(() => []),
  ]);
  return <NetworkingView suggestions={suggestions} currentMember={member} hasProfile={!!profile} />;
}
