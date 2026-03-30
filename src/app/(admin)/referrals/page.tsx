import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { getReferrals, getMyReferralCode, getReferralStats, getReferralTree, getMyReferrals } from "@/lib/actions/referrals";
import ReferralsView from "@/components/admin/ReferralsView";

export default async function ReferralsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const admin = isAdmin(member.role);

  const [referrals, myCode, myReferrals] = await Promise.all([
    getReferrals().catch(() => []),
    getMyReferralCode(member.id).catch(() => null),
    getMyReferrals(member.id).catch(() => []),
  ]);

  let stats = undefined;
  let tree = undefined;

  if (admin) {
    [stats, tree] = await Promise.all([
      getReferralStats().catch(() => undefined),
      getReferralTree().catch(() => undefined),
    ]);
  }

  return (
    <ReferralsView
      referrals={referrals}
      currentMember={member}
      isAdmin={admin}
      myCode={myCode}
      stats={stats}
      tree={tree}
      myReferrals={myReferrals}
    />
  );
}
