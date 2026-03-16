import { getMatchData } from "@/lib/matches";
import { SportDashboard } from "@/components/sport-dashboard";
import { ClientOnly } from "@/components/client-only";

const LEAGUES = ["Ligue 1"];

export default async function FootballPage() {
  const data = await getMatchData(LEAGUES);
  return <ClientOnly><SportDashboard sport="Football" data={data} /></ClientOnly>;
}
