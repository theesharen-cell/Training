import {
  GeneratedPlan,
  PlanInputs,
  PlanMove,
  PlannedDay,
  PlannedSession,
  SessionType,
} from '../types';
import { addDaysISO } from './dates';
import { DETAILS } from './content';
import { uid } from '../store';

export const DAY_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const DAY_LONG = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const I_PREF = [2, 3, 1, 4, 0, 5, 6];
const K_PREF = [3, 4, 2, 0, 5, 6, 1];
const GTG_TARGET = 3;

function makeSession(
  type: SessionType,
  opts: { label?: string; anchor?: boolean; bonus?: boolean } = {},
): PlannedSession {
  const d = DETAILS[type];
  const anchor = opts.anchor ?? false;
  const bonus = opts.bonus ?? false;
  return {
    type,
    label: opts.label ?? d.label,
    anchor,
    bonus,
    flexible: !anchor && !bonus,
    warmup: d.warmup,
    main: d.main,
    success: d.success,
    durationMin: d.durationMin,
    distanceKm: d.distanceKm,
    hrZone: d.hrZone,
  };
}

function pickByPref(cands: number[], pref: number[]): number {
  return [...cands].sort((a, b) => pref.indexOf(a) - pref.indexOf(b))[0];
}

function nearest(cands: number[], target: number): number {
  return cands.reduce((a, b) => (Math.abs(b - target) <= Math.abs(a - target) ? b : a));
}

export function generatePlan(inputs: PlanInputs, weekStart: string): GeneratedPlan {
  const kids = new Set(inputs.kidsDays.map((d) => ((d % 7) + 7) % 7));
  const fire = inputs.fireTuesday;
  const moves: PlanMove[] = [];
  const solo = ALL_DAYS.filter((d) => !kids.has(d));
  const anchorDays = solo.filter((d) => !(fire && d === 1));
  const usable = anchorDays.length > 0 ? anchorDays : solo;

  const preferL = ((inputs.longRunDay % 7) + 7) % 7;
  let L = preferL;
  if (!solo.includes(L)) {
    const after = solo.filter((d) => d > L);
    const before = solo.filter((d) => d < L);
    const pick = after.length > 0 ? after[0] : before.length > 0 ? before[before.length - 1] : -1;
    if (pick >= 0) {
      moves.push({
        kind: 'move',
        session: 'Langlauf',
        from: L,
        to: pick,
        reason: `${DAY_LONG[L]} ist Kinder-Tag – der Langlauf (GA1, 14–16 km) braucht ein Solo-Fenster. Verschoben auf ${DAY_LONG[pick]}.`,
      });
      L = pick;
    } else {
      moves.push({
        kind: 'fallback',
        session: 'Langlauf',
        reason:
          'Diese Woche nur Kinder-Tage – Langlauf als Bonus eingeplant, darf entfallen.',
      });
    }
  }
  if (solo.includes(L) && L < 3) {
    const later = usable.filter((d) => d >= 3);
    if (later.length > 0) {
      const pick = nearest(later, preferL);
      moves.push({
        kind: 'move',
        session: 'Langlauf',
        from: L,
        to: pick,
        reason: `Langlauf mind. 72 h nach der Kraft-Session → in dieser Woche frühestens ${DAY_LONG[3]}. Verschoben auf ${DAY_LONG[pick]}.`,
      });
      L = pick;
    }
  }
  if (fire && L === 1) {
    moves.push({
      kind: 'info',
      session: 'Langlauf',
      reason:
        'Dienstag ist Feuerwehr-Puffer – Langlauf nur einplanen, wenn der Dienst ausfällt, sonst auf einen anderen Solo-Tag legen.',
    });
  }
  if (fire && kids.has(1)) {
    moves.push({
      kind: 'move',
      session: 'Dienstag',
      from: 1,
      to: undefined,
      reason:
        'Konflikt Dienstag: Feuerwehr-Dienst + Kinder-Tag gleichzeitig → Dienstag bleibt Puffer, keine feste Einheit eingeplant. Kurze optionale Einheit nur bei freiem Abend.',
    });
  }

  const iCands = usable.filter((d) => d < L);
  let I = -1;
  let iAnchor = false;
  if (iCands.length > 0) {
    I = pickByPref(iCands, I_PREF);
    iAnchor = true;
  } else {
    const anySolo = solo.filter((d) => d !== L && d < L);
    if (anySolo.length > 0) {
      I = nearest(anySolo, 2);
      iAnchor = true;
      moves.push({
        kind: 'fallback',
        session: 'Intervalle',
        to: I,
        reason: `Kein Solo-Tag mit ≥24 h vor dem Langlauf frei – nächster verfügbarer Tag (${DAY_LONG[I]}) gewählt. Session kürzbar auf 3×1000 m.`,
      });
    } else {
      const beforeL = ALL_DAYS.filter((d) => d < L);
      if (beforeL.length > 0) {
        I = nearest(beforeL, 2);
        iAnchor = true;
        moves.push({
          kind: 'fallback',
          session: 'Intervalle',
          to: I,
          reason: `Konflikt: kein Solo-Fenster vor dem Langlauf (Kinder-Tage + Feuerwehr-Dienstag als Puffer) – Vorschlag: Intervalle gekürzt (3×1000 m) am ${DAY_LONG[I]}, oder Langlauf auf einen Tag mit Solo-Fenster verschieben.`,
        });
      } else {
        I = (L + 1) % 7;
        moves.push({
          kind: 'fallback',
          session: 'Intervalle',
          to: I,
          reason: `Langlauf liegt am ${DAY_LONG[L]} (Wochenanfang) – kein Tag ≥24 h davor frei. 24-h-Regel zum Langlauf verletzt; Vorschlag: Langlauf auf einen späteren Tag legen.`,
        });
      }
    }
  }
  if (I === L) I = (L + 1) % 7;

  const kBase = ALL_DAYS.filter((d) => d !== I && !(fire && d === 1));
  const kA = kBase.filter((d) => d <= I - 2 && (L >= 3 ? d <= L - 3 : true));
  const kB = kBase.filter((d) => (L >= 3 ? d <= L - 3 : d > L));
  let K = -1;
  if (kA.length > 0) {
    K = pickByPref(kA, K_PREF);
  } else if (kB.length > 0) {
    K = pickByPref(kB, K_PREF);
    moves.push({
      kind: 'info',
      session: 'Kraft',
      to: K,
      reason: `Kraft (${DAY_LONG[K]}) liegt nicht mit 48 h vor den Intervallen bzw. 72 h vor dem Langlauf – die Abstandsregeln gelten dann für die Folgewoche.`,
    });
  } else {
    K = (L + 1) % 7;
    if (K === I) K = (K + 1) % 7;
    moves.push({
      kind: 'fallback',
      session: 'Kraft',
      to: K,
      reason:
        'Kein Tag mit ausreichendem Abstand (48 h vor Intervallen / 72 h vor Langlauf) frei – Kraft auf den nächstmöglichen Tag gelegt; Abstände bitte manuell prüfen.',
    });
  }
  if (Math.abs(I - K) === 1) {
    moves.push({
      kind: 'info',
      session: 'Abstände',
      reason: `Intervalle (${DAY_SHORT[I]}) und Kraft (${DAY_SHORT[K]}) liegen benachbart – 12-h-Abstand einhalten: Intervalle spätestens bis 16 Uhr, Kraft ab 18:30 Uhr.`,
    });
  }

  const kidsList = ALL_DAYS.filter((d) => kids.has(d));
  const gtgDays: number[] = [];
  for (const d of kidsList) {
    if (gtgDays.length < 2) gtgDays.push(d);
  }
  for (const d of solo) {
    if (gtgDays.length < GTG_TARGET && d !== I && d !== L && d !== K) gtgDays.push(d);
  }

  const bonusRotation: SessionType[] = ['emom', 'gehen'];
  const days: PlannedDay[] = [];
  for (let d = 0; d < 7; d++) {
    const date = addDaysISO(weekStart, d);
    const isKids = kids.has(d);
    const isBuffer = fire && d === 1;
    const sessions: PlannedSession[] = [];
    let note: string | undefined;

    if (d === L) {
      const anchor = usable.includes(L);
      sessions.push(
        makeSession('langlauf', {
          anchor,
          bonus: !anchor,
          label: anchor ? 'Langlauf GA1 14–16 km (Anker)' : 'Langlauf GA1 (Bonus – darf entfallen)',
        }),
      );
    }
    if (d === I) {
      sessions.push(
        makeSession('intervall', {
          anchor: iAnchor,
          bonus: !iAnchor,
          label: iAnchor
            ? 'Intervalle (Anker)'
            : 'Intervalle gekürzt (Bonus – darf entfallen)',
        }),
      );
    }
    if (d === K) {
      sessions.push(makeSession('kraft', { label: 'Kraft KB (abends)' }));
    }
    if (gtgDays.includes(d)) {
      sessions.push(
        makeSession('klimmzuege', {
          bonus: isKids,
          label: isKids ? 'Spielplatz-Klimmzüge (GTG)' : 'Klimmzüge GTG',
        }),
      );
    }
    if (isKids && d !== L && d !== I && !gtgDays.includes(d)) {
      const type = bonusRotation[d % bonusRotation.length];
      sessions.push(
        makeSession(type, {
          bonus: true,
          label: type === 'emom' ? '15-Min-EMOM (Bonus)' : 'Familienbewegung / Gehen (Bonus)',
        }),
      );
    }
    if (isKids) {
      note = 'Kinder-Tag: nur kurze optionale Einheiten – Bonus, darf entfallen';
    }
    if (isBuffer) {
      note = note
        ? `${note} · Puffer: Feuerwehr-Dienst unplanbar, kein fester Anker`
        : 'Puffer: Feuerwehr-Dienst unplanbar, kein fester Anker';
    }
    if (!isKids && d !== L && d !== I && d !== K && !gtgDays.includes(d) && !isBuffer) {
      sessions.push(
        makeSession(d % 2 === 0 ? 'gehen' : 'mobility', {
          label: d % 2 === 0 ? 'Gehen / Alltagsbewegung' : 'Mobility',
        }),
      );
    }
    days.push({ weekday: d, date, kids: isKids, buffer: isBuffer, note, sessions });
  }

  return {
    id: uid(),
    weekStart,
    createdAt: Date.now(),
    inputs: { kidsDays: [...kids].sort((a, b) => a - b), fireTuesday: fire, longRunDay: preferL },
    anchors: [I, L],
    moves,
    days,
  };
}
