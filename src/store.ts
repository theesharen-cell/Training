import { useCallback, useState } from 'react';
import { AppState, WeekPlan } from './types';

const STORAGE_KEY = 'hybrid-training-app-v1';

export type UpdateFn = (fn: (s: AppState) => AppState) => void;

function seedState(): AppState {
  return {
    version: 2,
    profile: {
      name: 'Thees',
      age: 40,
      weightKg: 88,
      city: 'Aurich',
      maxHr: 185,
      ga1Min: 130,
      ga1Max: 140,
      goal10kMin: 50,
      goalPullUpsMin: 8,
      goalPullUpsMax: 10,
      fiveKmMin: 24.5,
      tenKmMin: 52.5,
      ga1PaceSec: 6 * 60 + 30,
      intervalPaceSec: 4 * 60 + 52,
      langlaufKm: 15,
      equipment: [
        'Kettlebell 16 kg',
        'Kettlebell 20 kg',
        'Hantel 24 kg',
        'Liegematte',
        'Reck draußen (Trimmdich-Pfad, Spielplätze)',
      ],
      motto: 'Konsistenz schlägt Perfektion',
    },
    sessions: [],
    weeks: {},
    plans: {},
  };
}

function migrate(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const parsed = raw as Record<string, unknown>;
  if (parsed.version === 1 && Array.isArray(parsed.sessions)) {
    return { ...(parsed as unknown as AppState), version: 2, plans: {} };
  }
  if (parsed.version === 2 && Array.isArray(parsed.sessions)) {
    const state = parsed as unknown as AppState;
    return { ...state, plans: state.plans ?? {} };
  }
  return null;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const migrated = migrate(JSON.parse(raw));
      if (migrated) return migrated;
    }
  } catch {
    // fall through to seed
  }
  return seedState();
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable: keep app running in memory
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getWeek(state: AppState, weekStart: string): WeekPlan {
  return state.weeks[weekStart] ?? { weekStart, kidsDays: [] };
}

export function useAppState(): [AppState, UpdateFn] {
  const [state, setState] = useState<AppState>(() => loadState());
  const update = useCallback<UpdateFn>((fn) => {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);
  return [state, update];
}
