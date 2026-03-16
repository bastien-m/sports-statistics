import { getAllSportsData } from "@/lib/sports";
import { CompareDashboard } from "./compare-dashboard";
import { ClientOnly } from "@/components/client-only";

export default async function ComparePage() {
  const data = await getAllSportsData();
  return <ClientOnly><CompareDashboard data={data} /></ClientOnly>;
}
