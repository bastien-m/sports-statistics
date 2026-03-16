import { getAllSportsData } from "@/lib/sports";
import { LeaguesDashboard } from "./leagues-dashboard";
import { ClientOnly } from "@/components/client-only";

export default async function LeaguesPage() {
  const data = await getAllSportsData();
  return <ClientOnly><LeaguesDashboard data={data} /></ClientOnly>;
}
