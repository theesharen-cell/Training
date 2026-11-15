import { useState } from 'react';
import { AppState, Session, SessionType, StrengthEntry } from '../types';
import { UpdateFn, uid } from '../store';
import { SESSION_META } from '../lib/plan';
import { formatPace, num, paceFromSession } from '../lib/pace';

interface Props {
  date: string;
  initialType?: SessionType;
  state: AppState;
  update: UpdateFn;
  onClose: () => void;
}

const RUN_TYPES: SessionType[] = ['intervall', 'langlauf', 'gehen'];
const DURATION_TYPES: SessionType[] = ['emom', 'mobility', 'kraft'];

const KB_EXERCISES = [
  'KB Swings',
  'KB Goblet Squat',
  'KB Press',
  'KB Row (einarmig)',
  'KB Clean',
  'KB Snatch',
  'KB Turkish Get-Up',
  'KB Lunges',
  'KB Farmer Carry',
  'KB Hip Thrust',
];

const emptyEntry = (): StrengthEntry => ({ exercise: '', weightKg: null, reps: null, sets: null });

export default function SessionForm({ date, initialType, update, onClose }: Props) {
  const [type, setType] = useState<SessionType>(initialType ?? 'intervall');
  const [formDate, setFormDate] = useState(date);
  const [distanceKm, setDistanceKm] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [avgHr, setAvgHr] = useState('');
  const [rpe, setRpe] = useState(6);
  const [pullUps, setPullUps] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<StrengthEntry[]>([emptyEntry()]);

  const showRun = RUN_TYPES.includes(type);
  const showDuration = showRun || DURATION_TYPES.includes(type);
  const showPullUps = type === 'klimmzuege';
  const showExercises = type === 'kraft';

  const pacePreview = paceFromSession({
    distanceKm: num(distanceKm),
    durationMin: num(durationMin),
  });

  const updateEntry = (i: number, patch: Partial<StrengthEntry>) => {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const session: Session = {
      id: uid(),
      date: formDate,
      type,
      distanceKm: num(distanceKm),
      durationMin: num(durationMin),
      avgHr: num(avgHr),
      rpe,
      pullUps: showPullUps ? num(pullUps) : null,
      exercises: showExercises ? exercises.filter((x) => x.exercise.trim()) : [],
      notes: notes.trim(),
      createdAt: Date.now(),
    };
    update((s) => ({ ...s, sessions: [...s.sessions, session] }));
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="modal-head">
          <h2>Session loggen</h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="form-grid">
          <label>
            Datum
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} required />
          </label>
          <label>
            Typ
            <select value={type} onChange={(e) => setType(e.target.value as SessionType)}>
              {Object.entries(SESSION_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>

          {showRun && (
            <label>
              Distanz (km)
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="z. B. 8"
              />
            </label>
          )}
          {showDuration && (
            <label>
              Dauer (min)
              <input
                type="number"
                step="0.5"
                min="0"
                inputMode="decimal"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="z. B. 45"
              />
            </label>
          )}
          {pacePreview && (
            <div className="pace-preview">Pace: {formatPace(pacePreview)} min/km</div>
          )}

          <label>
            Ø Herzfrequenz (bpm)
            <input
              type="number"
              min="0"
              max="220"
              inputMode="numeric"
              value={avgHr}
              onChange={(e) => setAvgHr(e.target.value)}
              placeholder="z. B. 135"
            />
          </label>
          <label className="rpe-field">
            Subjektive Belastung (RPE): <strong>{rpe}/10</strong>
            <input
              type="range"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(Number(e.target.value))}
            />
          </label>

          {showPullUps && (
            <label>
              Saubere Klimmzüge (Wdh.)
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={pullUps}
                onChange={(e) => setPullUps(e.target.value)}
                placeholder="nur saubere zählen"
              />
            </label>
          )}

          {showExercises && (
            <div className="exercises">
              <div className="exercises-head">
                <span>Übung</span>
                <span>kg</span>
                <span>Sätze</span>
                <span>Wdh.</span>
                <span />
              </div>
              {exercises.map((entry, i) => (
                <div className="exercise-row" key={i}>
                  <input
                    list="kb-exercises"
                    value={entry.exercise}
                    onChange={(e) => updateEntry(i, { exercise: e.target.value })}
                    placeholder="Übung"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={entry.weightKg ?? ''}
                    onChange={(e) => updateEntry(i, { weightKg: num(e.target.value) })}
                    placeholder="kg"
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={entry.sets ?? ''}
                    onChange={(e) => updateEntry(i, { sets: num(e.target.value) })}
                    placeholder="Sätze"
                  />
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={entry.reps ?? ''}
                    onChange={(e) => updateEntry(i, { reps: num(e.target.value) })}
                    placeholder="Wdh."
                  />
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => setExercises((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <datalist id="kb-exercises">
                {KB_EXERCISES.map((x) => (
                  <option key={x} value={x} />
                ))}
              </datalist>
              <button
                type="button"
                className="btn ghost small"
                onClick={() => setExercises((prev) => [...prev, emptyEntry()])}
              >
                + Übung hinzufügen
              </button>
            </div>
          )}

          <label className="full">
            Notizen
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. 3 statt 5 Intervalle – Anker gehalten"
            />
          </label>
        </div>

        <footer className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn primary">
            Speichern
          </button>
        </footer>
      </form>
    </div>
  );
}
