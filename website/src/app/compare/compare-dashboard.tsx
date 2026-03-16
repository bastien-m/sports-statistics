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
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import type { AllSportsData } from "@/lib/sports";
import type { TeamStats } from "@/lib/matches";
import { OBSERVABLES, type Observable } from "@/lib/observables";

interface SlotConfig {
  sport: string;
  league: string;
  team: string;
}

interface Props {
  data: AllSportsData;
}

const COLORS = {
  A: "var(--color-chart-1)",
  B: "var(--color-chart-2)",
} as const;

// Sports that have at least one season with data
function sportsWithData(data: AllSportsData): string[] {
  return Object.keys(data).filter((s) => Object.keys(data[s]).length > 0);
}

function firstLeague(data: AllSportsData, sport: string): string {
  return Object.keys(data[sport] ?? {})[0] ?? "";
}

function teamsForLeague(data: AllSportsData, sport: string, league: string): string[] {
  const seasons = data[sport]?.[league] ?? {};
  const set = new Set<string>();
  for (const teams of Object.values(seasons)) {
    for (const t of teams) set.add(t.team);
  }
  return Array.from(set).sort();
}

function firstTeam(data: AllSportsData, sport: string, league: string): string {
  const seasons = Object.keys(data[sport]?.[league] ?? {}).map(Number).sort((a, b) => b - a);
  return data[sport]?.[league]?.[seasons[0]]?.[0]?.team ?? "";
}

function buildInitialConfig(data: AllSportsData, index: number): SlotConfig {
  const sports = sportsWithData(data);
  const sport = sports[index % sports.length] ?? "";
  const league = firstLeague(data, sport);
  const team = firstTeam(data, sport, league);
  return { sport, league, team };
}

interface SportConfiguratorProps {
  label: string;
  slot: "A" | "B";
  config: SlotConfig;
  data: AllSportsData;
  onChange: (config: SlotConfig) => void;
}

function SportConfigurator({ label, slot, config, data, onChange }: SportConfiguratorProps) {
  const sports = sportsWithData(data);
  const leagues = Object.keys(data[config.sport] ?? {});
  const teams = teamsForLeague(data, config.sport, config.league);

  function handleSportChange(sport: string) {
    const league = firstLeague(data, sport);
    const team = firstTeam(data, sport, league);
    onChange({ sport, league, team });
  }

  function handleLeagueChange(league: string) {
    const team = firstTeam(data, config.sport, league);
    onChange({ ...config, league, team });
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
          <Select value={config.league} onValueChange={(v) => v && handleLeagueChange(v)}>
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

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Team</span>
          <Select
            value={config.team}
            onValueChange={(v) => v && onChange({ ...config, team: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function getTeamHistory(
  data: AllSportsData,
  config: SlotConfig,
  observable: Observable
): Map<number, number | null> {
  const leagueData = data[config.sport]?.[config.league] ?? {};
  const map = new Map<number, number | null>();
  for (const [season, teams] of Object.entries(leagueData)) {
    const stats: TeamStats | undefined = teams.find((t) => t.team === config.team);
    map.set(Number(season), stats != null ? observable.getValue(stats) : null);
  }
  return map;
}

export function CompareDashboard({ data }: Props) {
  const observables = OBSERVABLES;
  const [configA, setConfigA] = useState<SlotConfig>(() => buildInitialConfig(data, 0));
  const [configB, setConfigB] = useState<SlotConfig>(() => buildInitialConfig(data, 1));
  const [observableKey, setObservableKey] = useState(observables[0].key);

  const observable = observables.find((o) => o.key === observableKey) ?? observables[0];

  const chartData = useMemo(() => {
    const histA = getTeamHistory(data, configA, observable);
    const histB = getTeamHistory(data, configB, observable);
    const seasons = Array.from(new Set([...histA.keys(), ...histB.keys()])).sort();
    return seasons.map((season) => ({
      season,
      A: histA.get(season) ?? null,
      B: histB.get(season) ?? null,
    }));
  }, [data, configA, configB, observable]);

  const chartConfig = {
    A: { label: `${configA.team} (${configA.league})`, color: COLORS.A },
    B: { label: `${configB.team} (${configB.league})`, color: COLORS.B },
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Compare</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compare two teams across sports on the same chart
        </p>
      </div>

      {/* Observable selector */}
      {observables.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Observable</span>
          <Select value={observableKey} onValueChange={(v) => v && setObservableKey(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {observables.map((o) => (
                <SelectItem key={o.key} value={o.key}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Two configurators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SportConfigurator label="Series A" slot="A" config={configA} data={data} onChange={setConfigA} />
        <SportConfigurator label="Series B" slot="B" config={configB} data={data} onChange={setConfigB} />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {observable.label} over seasons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 11 }} />
              <YAxis
                domain={observable.domain}
                tickFormatter={observable.formatTick}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, key) => (
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-medium">
                          {key === "A"
                            ? `${configA.team} (${configA.league})`
                            : `${configB.team} (${configB.league})`}
                        </span>
                        <span>{observable.formatTooltip(value as number)}</span>
                      </div>
                    )}
                  />
                }
              />
              <Legend
                formatter={(value) =>
                  value === "A"
                    ? `${configA.team} (${configA.league})`
                    : `${configB.team} (${configB.league})`
                }
              />
              <Line
                dataKey="A"
                stroke={COLORS.A}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                dataKey="B"
                stroke={COLORS.B}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
