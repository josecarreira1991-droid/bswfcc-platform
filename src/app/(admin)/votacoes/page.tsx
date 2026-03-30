import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { getPolls } from "@/lib/actions/polls";
import PollsView from "@/components/admin/PollsView";

export default async function VotacoesPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const polls = await getPolls().catch(() => []);
  return <PollsView polls={polls} currentMember={member} isAdmin={isAdmin(member.role)} />;
}
