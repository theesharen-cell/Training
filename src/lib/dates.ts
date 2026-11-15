export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function weekStartISO(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISODate(d);
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function weekdayOf(iso: string): number {
  return (parseISODate(iso).getDay() + 6) % 7;
}

export function formatDE(iso: string): string {
  return parseISODate(iso).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

export function isoWeek(iso: string): number {
  const date = parseISODate(iso);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  );
}

export function weekLabel(weekStart: string): string {
  const start = parseISODate(weekStart);
  const end = parseISODate(addDaysISO(weekStart, 6));
  const fmt = (d: Date) =>
    d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  return `KW ${isoWeek(weekStart)} · ${fmt(start)} – ${fmt(end)}`;
}
