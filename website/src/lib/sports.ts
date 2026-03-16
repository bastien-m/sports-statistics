import { getMatchData, type SportData } from "./matches";

export const SPORTS_CONFIG: Record<string, string[]> = {
  Football: ["Ligue 1"],
  Rugby: ["Top 14", "Premiership Rugby"],
  Handball: ["Starligue"],
  Basketball: ["LNB"],
};

export type AllSportsData = Record<string, SportData>;

export async function getAllSportsData(): Promise<AllSportsData> {
  const entries = await Promise.all(
    Object.entries(SPORTS_CONFIG).map(async ([sport, leagues]) => [
      sport,
      await getMatchData(leagues),
    ])
  );
  return Object.fromEntries(entries);
}
