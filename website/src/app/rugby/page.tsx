import { getMatchData } from "@/lib/matches";
import { SportDashboard } from "@/components/sport-dashboard";
import { ClientOnly } from "@/components/client-only";

const LEAGUES = ["Top 14", "Premiership Rugby"];

export default async function RugbyPage() {
  const data = await getMatchData(LEAGUES);
  return <ClientOnly><SportDashboard sport="Rugby" data={data} /></ClientOnly>;
}
