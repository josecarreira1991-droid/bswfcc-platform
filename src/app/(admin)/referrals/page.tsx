import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { getReferrals } from "@/lib/actions/referrals";
import ReferralsView from "@/components/admin/ReferralsView";

export default async function ReferralsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const referrals = await getReferrals().catch(() => []);
  return <ReferralsView referrals={referrals} currentMember={member} isAdmin={isAdmin(member.role)} />;
}
