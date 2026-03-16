"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { AllSportsData } from "@/lib/sports";
import type { TeamStats } from "@/lib/matches";

interface LeagueConfig {
  sport: string;
  league: string;
}

interface Props {
  data: AllSportsData;
}

interface LeagueSeasonStats {
  season: number;
  homeWinRate: number;
  awayWinRate: number;
  drawRate: number;
}

const COLORS = {
  A: "var(--color-chart-1)",
  B: "var(--color-chart-2)",
} as const;

function sportsWithData(data: AllSportsData): string[] {
  return Object.keys(data).filter((s) => Object.keys(data[s]).length > 0);
}

function firstLeague(data: AllSportsData, sport: string): string {
  return Object.keys(data[sport] ?? {})[0] ?? "";
}

function buildInitialConfig(data: AllSportsData, index: number): LeagueConfig {
  const sports = sportsWithData(data);
  const sport = sports[index % sports.length] ?? "";
  return { sport, league: firstLeague(data, sport) };
}

function getLeagueHistory(
  data: AllSportsData,
  sport: string,
  league: string
): LeagueSeasonStats[] {
  const leagueData = data[sport]?.[league] ?? {};
  return Object.entries(leagueData)
    .map(([season, teams]: [string, TeamStats[]]) => {
      const totalMatches = teams.reduce((sum, t) => sum + t.homePlayed, 0);
      const totalHomeWins = teams.reduce((sum, t) => sum + t.homeWins, 0);
      const totalAwayWins = teams.reduce((sum, t) => sum + t.awayWins, 0);
      const totalDraws = totalMatches - totalHomeWins - totalAwayWins;
      return {
        season: Number(season),
        homeWinRate: totalMatches > 0 ? Math.round((totalHomeWins / totalMatches) * 100) : 0,
        awayWinRate: totalMatches > 0 ? Math.round((totalAwayWins / totalMatches) * 100) : 0,
        drawRate: totalMatches > 0 ? Math.round((totalDraws / totalMatches) * 100) : 0,
      };
    })
    .sort((a, b) => a.season - b.season);
}

interface LeagueConfiguratorProps {
  label: string;
  slot: "A" | "B";
  config: LeagueConfig;
  data: AllSportsData;
  onChange: (config: LeagueConfig) => void;
}

function LeagueConfigurator({ label, slot, config, data, onChange }: LeagueConfiguratorProps) {
  const sports = sportsWithData(data);
  const leagues = Object.keys(data[config.sport] ?? {});

  function handleSportChange(sport: string) {
    onChange({ sport, league: firstLeague(data, sport) });
  }

  return (
    <Card style={{ borderColor: COLORS[slot] }} className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base" style={{ color: COLORS[slot] }}>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Sport</span>
          <Select value={config.sport} onValueChange={(v) => v && handleSportChange(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sports.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">League</span>
          <Select
            value={config.league}
            onValueChange={(v) => v && onChange({ ...config, league: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeaguesDashboard({ data }: Props) {
  const [configA, setConfigA] = useState<LeagueConfig>(() => buildInitialConfig(data, 0));
  const [configB, setConfigB] = useState<LeagueConfig>(() => buildInitialConfig(data, 1));

  const chartData = useMemo(() => {
    const histA = getLeagueHistory(data, configA.sport, configA.league);
    const histB = getLeagueHistory(data, configB.sport, configB.league);
    const seasons = new Set([...histA.map((s) => s.season), ...histB.map((s) => s.season)]);
    return Array.from(seasons)
      .sort()
      .map((season) => {
        const a = histA.find((s) => s.season === season);
        const b = histB.find((s) => s.season === season);
        return {
          season,
          "Home A": a?.homeWinRate ?? null,
          "Away A": a?.awayWinRate ?? null,
          "Draw A": a?.drawRate ?? null,
          "Home B": b?.homeWinRate ?? null,
          "Away B": b?.awayWinRate ?? null,
          "Draw B": b?.drawRate ?? null,
        };
      });
  }, [data, configA, configB]);

  const labelA = configA.league;
  const labelB = configB.league;

  const chartConfig = {
    "Home A": { label: `${labelA} — Home`, color: COLORS.A },
    "Away A": { label: `${labelA} — Away`, color: COLORS.A },
    "Draw A": { label: `${labelA} — Draw`, color: COLORS.A },
    "Home B": { label: `${labelB} — Home`, color: COLORS.B },
    "Away B": { label: `${labelB} — Away`, color: COLORS.B },
    "Draw B": { label: `${labelB} — Draw`, color: COLORS.B },
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">League Comparison</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Home win rate, away win rate and draw rate over seasons
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LeagueConfigurator label="League A" slot="A" config={configA} data={data} onChange={setConfigA} />
        <LeagueConfigurator label="League B" slot="B" config={configB} data={data} onChange={setConfigB} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Home vs Away win rate over seasons</CardTitle>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
            <span>— Solid: Home win rate</span>
            <span>- - Dashed: Away win rate</span>
            <span>··· Dotted: Draw rate</span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
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
                    formatter={(value, key) => (
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium">{chartConfig[key as keyof typeof chartConfig]?.label}</span>
                        <span>{value}%</span>
                      </div>
                    )}
                  />
                }
              />
              <Legend
                formatter={(key) =>
                  chartConfig[key as keyof typeof chartConfig]?.label ?? key
                }
              />

              {/* League A — solid home, dashed away, dotted draw */}
              <Line dataKey="Home A" stroke={COLORS.A} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              <Line dataKey="Away A" stroke={COLORS.A} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              <Line dataKey="Draw A" stroke={COLORS.A} strokeWidth={2} strokeDasharray="2 3" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />

              {/* League B — solid home, dashed away, dotted draw */}
              <Line dataKey="Home B" stroke={COLORS.B} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              <Line dataKey="Away B" stroke={COLORS.B} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
              <Line dataKey="Draw B" stroke={COLORS.B} strokeWidth={2} strokeDasharray="2 3" dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
