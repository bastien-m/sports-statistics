import { getMatchData } from "@/lib/matches";
import { SportDashboard } from "@/components/sport-dashboard";
import { ClientOnly } from "@/components/client-only";

const LEAGUES = ["Starligue"];

export default async function HandballPage() {
  const data = await getMatchData(LEAGUES);
  return <ClientOnly><SportDashboard sport="Handball" data={data} /></ClientOnly>;
}
