import { getCurrentMember } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/utils";
import { getReferrals, getMyReferralCode, getReferralStats, getReferralTree, getMyReferrals, getMyRewards, getAllRewards, getRewardSummary } from "@/lib/actions/referrals";
import ReferralsView from "@/components/admin/ReferralsView";

export default async function ReferralsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const admin = isAdmin(member.role);

  const [referrals, myCode, myReferrals, myRewards] = await Promise.all([
    getReferrals().catch(() => []),
    getMyReferralCode(member.id).catch(() => null),
    getMyReferrals(member.id).catch(() => []),
    getMyRewards(member.id).catch(() => []),
  ]);

  let stats = undefined;
  let tree = undefined;
  let allRewards = undefined;
  let rewardSummary = undefined;

  if (admin) {
    [stats, tree, allRewards, rewardSummary] = await Promise.all([
      getReferralStats().catch(() => undefined),
      getReferralTree().catch(() => undefined),
      getAllRewards().catch(() => undefined),
      getRewardSummary().catch(() => undefined),
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
      myRewards={myRewards}
      allRewards={allRewards}
      rewardSummary={rewardSummary}
    />
  );
}
