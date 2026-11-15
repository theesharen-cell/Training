import { SessionType } from '../types';

export interface SessionDetail {
  label: string;
  warmup: string;
  main: string;
  success: string;
  durationMin?: number;
  distanceKm?: number;
  hrZone?: string;
}

export const DETAILS: Record<SessionType, SessionDetail> = {
  intervall: {
    label: 'Intervalle',
    warmup: '10 min locker joggen + Hüft-/Wadenmobilisation, 4×100 m Steigerungen',
    main: '6×1000 m @ 4:50–4:55 min/km, 90 s Trabpause (kürzbar auf 3–4 Intervalle)',
    success: 'Alle Wdh. im Zielpace ±5 s/km, Ø-HF < ~175 bpm',
    durationMin: 50,
    distanceKm: 9,
    hrZone: 'Intervallzone, max ~185 bpm',
  },
  langlauf: {
    label: 'Langlauf GA1',
    warmup: '10 min Gehen/Joggen, dann direkt in GA1',
    main: '14–16 km @ 6:20–6:40 min/km',
    success: 'HF 130–140 bpm in mind. 80 % der Zeit, Distanz im Zielkorridor',
    distanceKm: 15,
    durationMin: 97,
    hrZone: 'GA1 130–140 bpm',
  },
  kraft: {
    label: 'Kraft (KB)',
    warmup: '5 min Seilspringen/KB-Joints, 2 leichte Aufwärmsätze',
    main: 'KB-Circuit: Swings 4×10 (24 kg), Goblet Squat 3×8 (20 kg), Press 3×8/Seite (16 kg), Row 3×10/Seite (20 kg), TGU 2×2/Seite (16 kg)',
    success: 'Alle Sätze technisch sauber, RPE ≤ 8',
    durationMin: 40,
  },
  emom: {
    label: '15-Min-EMOM',
    warmup: '3 min leichtes Seilspringen',
    main: 'EMOM 15 min: Min 1 – 12 KB Swings (16 kg), Min 2 – 10 Goblet Squats (20 kg), Min 3 – 30 s Plank',
    success: '15 min ohne Abbruch durchgehalten',
    durationMin: 15,
  },
  klimmzuege: {
    label: 'Klimmzüge (GTG)',
    warmup: 'Schultermobilisation, 1 leichter Satz',
    main: '2–3 saubere Klimmzüge am Reck (Spielplatz/Trimmdich-Pfad) – kurzer Kontakt, GTG',
    success: 'Nur saubere Wdh. zählen (kein Schwung); Rekord notieren',
    durationMin: 5,
  },
  gehen: {
    label: 'Gehen / Familienbewegung',
    warmup: '–',
    main: '30–45 min Gehen, Spielplatz, Familienbewegung – Pace egal',
    success: 'Bewegung ist drin, egal wie langsam',
    durationMin: 35,
  },
  mobility: {
    label: 'Mobility',
    warmup: '–',
    main: '15–20 min Mobility: Hüfte, Brustwirbelsäule, Sprunggelenke, Schultern',
    success: 'Routine durchgehalten',
    durationMin: 20,
  },
};
