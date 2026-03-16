"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { SportData } from "@/lib/matches";

interface Props {
  sport: string;
  data: SportData;
}

const barConfig = {
  winRate: { label: "Win rate (%)", color: "var(--color-chart-1)" },
};
const lineConfig = {
  winRate: { label: "Win rate (%)", color: "var(--color-chart-2)" },
};

function topTeam(data: SportData, league: string): string {
  const seasons = Object.keys(data[league] ?? {}).map(Number).sort((a, b) => b - a);
  return data[league]?.[seasons[0]]?.[0]?.team ?? "";
}

export function SportDashboard({ sport, data }: Props) {
  const leagues = Object.keys(data).sort();

  const [activeLeague, setActiveLeague] = useState(leagues[0] ?? "");

  const leagueSeasons = useMemo(
    () =>
      Object.keys(data[activeLeague] ?? {})
        .map(Number)
        .sort((a, b) => b - a),
    [data, activeLeague]
  );

  const [activeSeason, setActiveSeason] = useState(String(leagueSeasons[0]));
  const [selectedTeam, setSelectedTeam] = useState(() =>
    leagues[0] ? topTeam(data, leagues[0]) : ""
  );

  const allTeams = useMemo(() => {
    const set = new Set<string>();
    for (const teams of Object.values(data[activeLeague] ?? {})) {
      for (const t of teams) set.add(t.team);
    }
    return Array.from(set).sort();
  }, [data, activeLeague]);

  const teamHistory = useMemo(
    () =>
      Object.entries(data[activeLeague] ?? {})
        .map(([season, teams]) => {
          const stats = teams.find((t) => t.team === selectedTeam);
          return {
            season: Number(season),
            winRate: stats?.winRate ?? 0,
            wins: stats?.wins ?? 0,
            draws: stats?.draws ?? 0,
            losses: stats?.losses ?? 0,
            played: stats?.played ?? 0,
          };
        })
        .sort((a, b) => a.season - b.season),
    [data, activeLeague, selectedTeam]
  );

  function handleLeagueChange(league: string) {
    setActiveLeague(league);
    const newSeasons = Object.keys(data[league] ?? {})
      .map(Number)
      .sort((a, b) => b - a);
    setActiveSeason(String(newSeasons[0]));
    setSelectedTeam(topTeam(data, league));
  }

  if (leagues.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold capitalize">{sport} — Win Rate</h1>
        <p className="text-muted-foreground">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold capitalize">{sport} — Win Rate</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Match win rates by team and season
        </p>
      </div>

      <Tabs value={activeLeague} onValueChange={handleLeagueChange}>
        <TabsList>
          {leagues.map((l) => (
            <TabsTrigger key={l} value={l}>
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        {leagues.map((league) => {
          const seasons = Object.keys(data[league] ?? {})
            .map(Number)
            .sort((a, b) => b - a);

          return (
            <TabsContent key={league} value={league} className="mt-4 flex flex-col gap-6">

              {/* Chart 1 — win rate by team for a given season */}
              <Card>
                <CardHeader>
                  <CardTitle>Win rate by team</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Tabs value={activeSeason} onValueChange={setActiveSeason}>
                    <TabsList>
                      {seasons.map((s) => (
                        <TabsTrigger key={s} value={String(s)}>
                          {s}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {seasons.map((season) => {
                      const seasonTeams = data[league]?.[season] ?? [];
                      return (
                        <TabsContent key={season} value={String(season)} className="mt-4">
                          <ChartContainer config={barConfig} className="h-72 w-full">
                            <BarChart
                              data={seasonTeams}
                              margin={{ top: 8, right: 16, left: 0, bottom: 80 }}
                            >
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="team"
                                tick={{ fontSize: 11 }}
                                angle={-40}
                                textAnchor="end"
                                interval={0}
                              />
                              <YAxis
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                                tick={{ fontSize: 11 }}
                              />
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    formatter={(value, _name, props) => (
                                      <div className="flex flex-col gap-0.5 text-xs">
                                        <span className="font-medium">{props.payload.team}</span>
                                        <span>Win rate: {value}%</span>
                                        <span className="text-muted-foreground">
                                          {props.payload.wins}W {props.payload.draws}D{" "}
                                          {props.payload.losses}L
                                        </span>
                                      </div>
                                    )}
                                  />
                                }
                              />
                              <Bar
                                dataKey="winRate"
                                fill="var(--color-chart-1)"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={48}
                              />
                            </BarChart>
                          </ChartContainer>
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </CardContent>
              </Card>

              {/* Chart 2 — win rate over seasons for a selected team */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Win rate over seasons</CardTitle>
                  <Select
                    value={selectedTeam}
                    onValueChange={(v) => v && setSelectedTeam(v)}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {allTeams.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={lineConfig} className="h-64 w-full">
                    <LineChart
                      data={teamHistory}
                      margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="season" tick={{ fontSize: 11 }} />
                      <YAxis
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11 }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, _name, props) => (
                              <div className="flex flex-col gap-0.5 text-xs">
                                <span className="font-medium">{props.payload.season}</span>
                                <span>Win rate: {value}%</span>
                                <span className="text-muted-foreground">
                                  {props.payload.wins}W {props.payload.draws}D{" "}
                                  {props.payload.losses}L ({props.payload.played} games)
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Line
                        dataKey="winRate"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
