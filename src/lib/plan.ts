import { DayTemplate, Session, SessionType } from '../types';
import { addDaysISO } from './dates';

export interface SessionMeta {
  label: string;
  short: string;
  color: string;
}

export const SESSION_META: Record<SessionType, SessionMeta> = {
  intervall: { label: 'Intervall', short: 'INT', color: '#f472b6' },
  kraft: { label: 'Kraft (KB)', short: 'KRA', color: '#fbbf24' },
  langlauf: { label: 'Langlauf GA1', short: 'LL', color: '#38bdf8' },
  emom: { label: 'EMOM / Dichte', short: 'EMOM', color: '#4ade80' },
  gehen: { label: 'Gehen', short: 'GEH', color: '#34d399' },
  mobility: { label: 'Mobility', short: 'MOB', color: '#a78bfa' },
  klimmzuege: { label: 'Klimmzüge', short: 'KLM', color: '#fb923c' },
};

export const WEEK_TEMPLATE: DayTemplate[] = [
  {
    weekday: 0,
    short: 'Mo',
    anchors: ['langlauf'],
    suggestions: ['gehen', 'emom'],
    note: 'Langlauf nur als Ersatz für So; sonst Dichte / Gehen',
  },
  {
    weekday: 1,
    short: 'Di',
    anchors: [],
    suggestions: ['emom', 'mobility', 'klimmzuege'],
    buffer: true,
    note: 'Puffer: Feuerwehr-Dienst – kein fester Anker',
  },
  {
    weekday: 2,
    short: 'Mi',
    anchors: ['intervall'],
    suggestions: ['intervall'],
    note: 'Anker: Intervalle',
  },
  {
    weekday: 3,
    short: 'Do',
    anchors: ['kraft'],
    suggestions: ['kraft', 'intervall'],
    note: 'Anker: Kraft abends; Intervall-Fallback',
  },
  {
    weekday: 4,
    short: 'Fr',
    anchors: [],
    suggestions: ['emom', 'mobility', 'gehen'],
    note: 'Dichte oder Mobility',
  },
  {
    weekday: 5,
    short: 'Sa',
    anchors: [],
    suggestions: ['emom', 'gehen', 'klimmzuege'],
    note: 'Spielplatz-Bewegung, GTG-Kontakte',
  },
  {
    weekday: 6,
    short: 'So',
    anchors: ['langlauf'],
    suggestions: ['langlauf'],
    note: 'Anker: Langlauf GA1 14–16 km',
  },
];

export interface Pillar {
  n: number;
  name: string;
  types: SessionType[];
}

export const PILLARS: Pillar[] = [
  { n: 1, name: 'Qualität / Intervalle', types: ['intervall'] },
  { n: 2, name: 'Kraft (KB)', types: ['kraft'] },
  { n: 3, name: 'Langlauf GA1', types: ['langlauf'] },
  { n: 4, name: 'Dichte & Bewegung', types: ['emom', 'gehen', 'mobility', 'klimmzuege'] },
];

export function sessionsForWeek(sessions: Session[], weekStart: string): Session[] {
  const end = addDaysISO(weekStart, 6);
  return sessions.filter((s) => s.date >= weekStart && s.date <= end);
}

export function pillarCheck(sessions: Session[], weekStart: string): boolean[] {
  const week = sessionsForWeek(sessions, weekStart);
  return PILLARS.map((p) => week.some((s) => p.types.includes(s.type)));
}

export function pullUpContacts(sessions: Session[], weekStart: string): number {
  return sessionsForWeek(sessions, weekStart).filter((s) => s.type === 'klimmzuege').length;
}
