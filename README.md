# Hybrid Training App

Browserbasierte Trainingsplattform für hybrides Training (Laufen + Kettlebell-Kraft zu Hause).
React 18 + TypeScript + Vite, dunkles responsives Design, **kein Backend** – alle Daten in LocalStorage (Schlüssel `hybrid-training-app-v1`).

## Start

```bash
npm install
npm run dev        # Entwicklungsserver (http://localhost:5173)
npm run build      # Typecheck + Production-Build nach dist/
npm run preview    # Build lokal ausliefern
```

## Struktur

- `src/types.ts` – Datenmodell (Profile, Session, WeekPlan, AppState)
- `src/store.ts` – LocalStorage-Persistence (Load/Save/Seed) + React-Hook `useAppState`
- `src/lib/plan.ts` – Wochen-Template (Anker Mi/Do/So–Mo, Dienstag = Puffer), Session-Metadaten, 4-Säulen-Check
- `src/lib/projection.ts` – 10-km-Projektion, Klimmzug-Rekord, Kraft-Progression pro Übung
- `src/lib/dates.ts`, `src/lib/pace.ts` – Datums-/Pace-Helfer
- `src/components/` – WeekPlanView, SessionForm, LogView, ProgressView, ProfileView

## Wochenlogik (fest eingebaut)

- **Anker:** Mi = Intervalle, Do = Kraft abends (Intervall-Fallback), So/Mo = Langlauf GA1 14–16 km
- **Dienstag = Puffer** (Feuerwehr-Dienst), kein fester Anker
- Kinder-Tage pro Woche markierbar (Kontext-Flag auf dem Tag)
- Klimmzüge: 2–3 GTG-Kontakte/Woche, nur saubere Wdh. zählen
- 4 Säulen/Woche: Qualität/Intervalle, Kraft KB, Langlauf GA1, Dichte & Bewegung
