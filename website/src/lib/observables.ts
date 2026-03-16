import type { TeamStats } from "./matches";

export interface Observable {
  key: string;
  label: string;
  getValue: (stats: TeamStats) => number;
  formatTick: (v: number) => string;
  formatTooltip: (v: number) => string;
  domain: [number, number];
}

export const OBSERVABLES: Observable[] = [
  {
    key: "winRate",
    label: "Win Rate",
    getValue: (s) => s.winRate,
    formatTick: (v) => `${v}%`,
    formatTooltip: (v) => `${v}%`,
    domain: [0, 100],
  },
  {
    key: "homeWinRate",
    label: "Home Win Rate",
    getValue: (s) => s.homeWinRate,
    formatTick: (v) => `${v}%`,
    formatTooltip: (v) => `${v}%`,
    domain: [0, 100],
  },
  {
    key: "awayWinRate",
    label: "Away Win Rate",
    getValue: (s) => s.awayWinRate,
    formatTick: (v) => `${v}%`,
    formatTooltip: (v) => `${v}%`,
    domain: [0, 100],
  },
];

export const DEFAULT_OBSERVABLE = OBSERVABLES[0];
