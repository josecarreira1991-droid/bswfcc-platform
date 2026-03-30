import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getBusinessProfile, getVisibleProfiles } from "@/lib/actions/matchmaking";
import MatchmakingView from "@/components/admin/MatchmakingView";

export default async function MatchmakingPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const [myProfile, profiles] = await Promise.all([
    getBusinessProfile(member.id).catch(() => null),
    getVisibleProfiles().catch(() => []),
  ]);

  return <MatchmakingView currentMember={member} myProfile={myProfile} profiles={profiles} />;
}
