import { AppState, Session } from '../types';
import { paceFromSession } from './pace';

export interface Projection10k {
  paceSecPerKm: number;
  totalMin: number;
  intervalBasis: number | null;
  longBasis: number | null;
  sessionsUsed: number;
}

function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

function avg(arr: number[]): number | null {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
}

function pacesOf(sessions: Session[]): number[] {
  return sessions.map(paceFromSession).filter((p): p is number => p !== null);
}

export function project10k(state: AppState): Projection10k {
  const intervals = lastN(
    state.sessions.filter((s) => s.type === 'intervall'),
    4,
  );
  const longs = lastN(
    state.sessions.filter((s) => s.type === 'langlauf'),
    3,
  );
  const intervalBasis = avg(pacesOf(intervals));
  const longBasis = avg(pacesOf(longs));

  let pace: number;
  if (intervalBasis && longBasis) {
    pace = 0.6 * (intervalBasis + 22) + 0.4 * Math.max(longBasis - 75, 240);
  } else if (intervalBasis) {
    pace = intervalBasis + 22;
  } else if (longBasis) {
    pace = Math.max(longBasis - 75, 240);
  } else {
    pace = (state.profile.tenKmMin * 60) / 10;
  }

  return {
    paceSecPerKm: pace,
    totalMin: (pace * 10) / 60,
    intervalBasis,
    longBasis,
    sessionsUsed: pacesOf(intervals).length + pacesOf(longs).length,
  };
}

export interface PullUpStats {
  record: number;
  totalReps: number;
  contactsAllTime: number;
  contactsWeek: number;
  recent: { date: string; reps: number }[];
}

export function pullUpStats(state: AppState, weekStart: string): PullUpStats {
  const all = state.sessions.filter((s) => s.type === 'klimmzuege' && s.pullUps !== null);
  const sorted = [...all].sort((a, b) => a.date.localeCompare(b.date));
  const weekEnd = (() => {
    const d = new Date(Number(weekStart.slice(0, 4)), Number(weekStart.slice(5, 7)) - 1, Number(weekStart.slice(8, 10)));
    d.setDate(d.getDate() + 6);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();
  return {
    record: sorted.reduce((m, s) => Math.max(m, s.pullUps ?? 0), 0),
    totalReps: sorted.reduce((m, s) => m + (s.pullUps ?? 0), 0),
    contactsAllTime: all.length,
    contactsWeek: all.filter((s) => s.date >= weekStart && s.date <= weekEnd).length,
    recent: sorted.slice(-6).reverse().map((s) => ({ date: s.date, reps: s.pullUps ?? 0 })),
  };
}

export interface StrengthExerciseStat {
  exercise: string;
  bestVolume: number;
  maxWeight: number;
  entries: { date: string; weightKg: number | null; reps: number | null; sets: number | null }[];
}

export function strengthStats(state: AppState): StrengthExerciseStat[] {
  const map = new Map<string, StrengthExerciseStat>();
  const sorted = [...state.sessions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
  );
  for (const s of sorted) {
    for (const e of s.exercises) {
      const name = e.exercise.trim();
      if (!name) continue;
      const cur = map.get(name) ?? { exercise: name, bestVolume: 0, maxWeight: 0, entries: [] };
      const volume = (e.weightKg ?? 0) * (e.reps ?? 0) * (e.sets ?? 1);
      if (volume > cur.bestVolume) cur.bestVolume = volume;
      if ((e.weightKg ?? 0) > cur.maxWeight) cur.maxWeight = e.weightKg ?? 0;
      cur.entries.push({ date: s.date, weightKg: e.weightKg, reps: e.reps, sets: e.sets });
      map.set(name, cur);
    }
  }
  return [...map.values()]
    .map((v) => ({ ...v, entries: v.entries.slice(-5).reverse() }))
    .sort((a, b) => b.bestVolume - a.bestVolume);
}
