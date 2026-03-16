import { getMongoClient } from "./mongodb";

export interface TeamStats {
  team: string;
  wins: number;
  draws: number;
  losses: number;
  played: number;
  winRate: number;
  homeWins: number;
  homePlayed: number;
  homeWinRate: number;
  awayWins: number;
  awayPlayed: number;
  awayWinRate: number;
}

// Record<leagueName, Record<season, TeamStats[]>>
export type SportData = Record<string, Record<number, TeamStats[]>>;

function emptyStats(team: string): TeamStats {
  return {
    team,
    wins: 0, draws: 0, losses: 0, played: 0, winRate: 0,
    homeWins: 0, homePlayed: 0, homeWinRate: 0,
    awayWins: 0, awayPlayed: 0, awayWinRate: 0,
  };
}

export async function getMatchData(leagues: string[]): Promise<SportData> {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB!);

  const matches = await db
    .collection("matches")
    .find({ "league.name": { $in: leagues } })
    .toArray();

  const temp: Record<string, Record<number, Record<string, TeamStats>>> = {};

  for (const match of matches) {
    const league: string = match.league.name;
    const season: number = match.league.season;
    const home: string = match.teams.home.name;
    const away: string = match.teams.away.name;
    const homeScore: number = match.scores.home;
    const awayScore: number = match.scores.away;

    if (!temp[league]) temp[league] = {};
    if (!temp[league][season]) temp[league][season] = {};

    if (!temp[league][season][home]) temp[league][season][home] = emptyStats(home);
    if (!temp[league][season][away]) temp[league][season][away] = emptyStats(away);

    const h = temp[league][season][home];
    const a = temp[league][season][away];

    h.played++;
    h.homePlayed++;
    a.played++;
    a.awayPlayed++;

    if (homeScore > awayScore) {
      h.wins++;
      h.homeWins++;
      a.losses++;
    } else if (awayScore > homeScore) {
      a.wins++;
      a.awayWins++;
      h.losses++;
    } else {
      h.draws++;
      a.draws++;
    }
  }

  const result: SportData = {};
  for (const [league, seasons] of Object.entries(temp)) {
    result[league] = {};
    for (const [season, teams] of Object.entries(seasons)) {
      result[league][Number(season)] = Object.values(teams)
        .map((t) => ({
          ...t,
          winRate: t.played > 0 ? Math.round((t.wins / t.played) * 100) : 0,
          homeWinRate: t.homePlayed > 0 ? Math.round((t.homeWins / t.homePlayed) * 100) : 0,
          awayWinRate: t.awayPlayed > 0 ? Math.round((t.awayWins / t.awayPlayed) * 100) : 0,
        }))
        .sort((a, b) => b.winRate - a.winRate);
    }
  }

  return result;
}
