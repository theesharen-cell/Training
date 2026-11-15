import { Session } from '../types';

export function formatPace(secPerKm: number | null | undefined): string {
  if (!secPerKm || secPerKm <= 0) return '–';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parsePace(input: string): number | null {
  const m = input.trim().match(/^(\d{1,2})[:.,](\d{2})$/);
  if (!m) return null;
  const sec = Number(m[1]) * 60 + Number(m[2]);
  return sec > 0 ? sec : null;
}

export function formatDuration(totalMin: number | null | undefined): string {
  if (!totalMin || totalMin <= 0) return '–';
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`;
}

export function formatClock(totalMin: number | null | undefined): string {
  if (!totalMin || totalMin <= 0) return '–';
  const totalSec = Math.round(totalMin * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

export function paceFromSession(s: {
  distanceKm: number | null;
  durationMin: number | null;
}): number | null {
  if (s.distanceKm && s.distanceKm > 0 && s.durationMin && s.durationMin > 0) {
    return (s.durationMin * 60) / s.distanceKm;
  }
  return null;
}

export function num(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function sessionSummary(s: Session): string {
  const parts: string[] = [];
  if (s.distanceKm) parts.push(`${s.distanceKm} km`);
  if (s.durationMin) parts.push(formatDuration(s.durationMin));
  const p = paceFromSession(s);
  if (p) parts.push(`${formatPace(p)}/km`);
  if (s.avgHr) parts.push(`Ø ${s.avgHr} bpm`);
  if (s.pullUps) parts.push(`${s.pullUps} Klimmzüge`);
  if (s.exercises.length) parts.push(`${s.exercises.length} Übung(en)`);
  if (s.rpe) parts.push(`RPE ${s.rpe}`);
  return parts.join(' · ');
}
