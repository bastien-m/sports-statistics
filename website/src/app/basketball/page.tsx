import { getMatchData } from "@/lib/matches";
import { SportDashboard } from "@/components/sport-dashboard";
import { ClientOnly } from "@/components/client-only";

const LEAGUES = ["LNB"];

export default async function BasketballPage() {
  const data = await getMatchData(LEAGUES);
  return <ClientOnly><SportDashboard sport="Basketball" data={data} /></ClientOnly>;
}
