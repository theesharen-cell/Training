export type SessionType =
  | 'intervall'
  | 'kraft'
  | 'langlauf'
  | 'emom'
  | 'mobility'
  | 'klimmzuege'
  | 'gehen';

export interface StrengthEntry {
  exercise: string;
  weightKg: number | null;
  reps: number | null;
  sets: number | null;
}

export interface Session {
  id: string;
  date: string;
  type: SessionType;
  distanceKm: number | null;
  durationMin: number | null;
  avgHr: number | null;
  rpe: number | null;
  pullUps: number | null;
  exercises: StrengthEntry[];
  notes: string;
  createdAt: number;
}

export interface DayTemplate {
  weekday: number;
  short: string;
  anchors: SessionType[];
  suggestions: SessionType[];
  buffer?: boolean;
  note?: string;
}

export interface WeekPlan {
  weekStart: string;
  kidsDays: number[];
}

export interface Profile {
  name: string;
  age: number;
  weightKg: number;
  city: string;
  maxHr: number;
  ga1Min: number;
  ga1Max: number;
  goal10kMin: number;
  goalPullUpsMin: number;
  goalPullUpsMax: number;
  fiveKmMin: number;
  tenKmMin: number;
  ga1PaceSec: number;
  intervalPaceSec: number;
  langlaufKm: number;
  equipment: string[];
  motto: string;
}

export interface PlanInputs {
  kidsDays: number[];
  fireTuesday: boolean;
  longRunDay: number;
}

export interface PlanMove {
  kind: 'move' | 'fallback' | 'info';
  session: string;
  from?: number;
  to?: number;
  reason: string;
}

export interface PlannedSession {
  type: SessionType;
  label: string;
  anchor: boolean;
  bonus: boolean;
  flexible: boolean;
  warmup: string;
  main: string;
  success: string;
  durationMin?: number;
  distanceKm?: number;
  hrZone?: string;
}

export interface PlannedDay {
  weekday: number;
  date: string;
  kids: boolean;
  buffer: boolean;
  note?: string;
  sessions: PlannedSession[];
}

export interface GeneratedPlan {
  id: string;
  weekStart: string;
  createdAt: number;
  inputs: PlanInputs;
  anchors: number[];
  moves: PlanMove[];
  days: PlannedDay[];
}

export interface AppState {
  version: 2;
  profile: Profile;
  sessions: Session[];
  weeks: Record<string, WeekPlan>;
  plans: Record<string, GeneratedPlan>;
}
