import { getCurrentMember } from "@/lib/actions/auth";
import { getMarketData } from "@/lib/actions/market";
import { redirect } from "next/navigation";
import MarketDataManager from "@/components/admin/MarketDataManager";

export default async function MercadoPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const data = await getMarketData().catch(() => []);

  return <MarketDataManager data={data} currentMember={member} />;
}
