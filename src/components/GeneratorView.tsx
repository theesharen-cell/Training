import { useState } from 'react';
import { AppState, PlanInputs, SessionType } from '../types';
import { UpdateFn } from '../store';
import { DAY_LONG, DAY_SHORT, generatePlan } from '../lib/generator';
import { SESSION_META } from '../lib/plan';
import { addDaysISO, formatDE, weekLabel, weekStartISO } from '../lib/dates';
import { formatDuration } from '../lib/pace';

interface Props {
  state: AppState;
  update: UpdateFn;
  onLog: (date: string, type?: SessionType) => void;
}

const KIDS_PRESETS: { label: string; days: number[] }[] = [
  { label: 'Mi bis Mo-Morgen', days: [0, 2, 3, 4, 5, 6] },
  { label: 'Nur Wochenende', days: [5, 6] },
  { label: 'Nur werktags', days: [0, 1, 2, 3, 4] },
  { label: 'Keine', days: [] },
];

export default function GeneratorView({ state, update, onLog }: Props) {
  const [ws, setWs] = useState(() => weekStartISO(new Date()));
  const existing = state.plans[ws];
  const [kidsDays, setKidsDays] = useState<number[]>(existing?.inputs.kidsDays ?? []);
  const [fireTuesday, setFireTuesday] = useState(existing?.inputs.fireTuesday ?? true);
  const [longRunDay, setLongRunDay] = useState(existing?.inputs.longRunDay ?? 6);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const plan = existing;

  const toggleKids = (d: number) => {
    setKidsDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    );
    setSelectedDay(null);
  };

  const applyPreset = (days: number[]) => {
    setKidsDays([...days].sort((a, b) => a - b));
    setSelectedDay(null);
  };

  const generate = () => {
    const inputs: PlanInputs = { kidsDays, fireTuesday, longRunDay };
    const generated = generatePlan(inputs, ws);
    update((s) => ({ ...s, plans: { ...s.plans, [ws]: generated } }));
    setSelectedDay(null);
  };

  const adoptKidsDays = () => {
    update((s) => ({
      ...s,
      weeks: { ...s.weeks, [ws]: { weekStart: ws, kidsDays: [...kidsDays].sort((a, b) => a - b) } },
    }));
  };

  const today = formatDE(addDaysISO(ws, 0)).length > 0 ? new Date() : new Date();
  const todayISO = weekStartISO(today) === ws ? addDaysISO(ws, (today.getDay() + 6) % 7) : null;

  return (
    <section>
      <div className="section-head">
        <h2>Wochenplan-Generator</h2>
        <div className="week-nav">
          <button className="btn ghost small" onClick={() => setWs(addDaysISO(ws, -7))}>
            ‹
          </button>
          <strong>{weekLabel(ws)}</strong>
          <button className="btn ghost small" onClick={() => setWs(addDaysISO(ws, 7))}>
            ›
          </button>
          <button className="btn ghost small" onClick={() => setWs(weekStartISO(new Date()))}>
            Aktuelle Woche
          </button>
        </div>
      </div>

      <div className="card gen-form">
        <h3>Eingaben</h3>
        <div className="gen-row">
          <span className="gen-label">Kinder-Zeitraum:</span>
          <div className="chips">
            {DAY_SHORT.map((s, d) => (
              <button
                key={d}
                className={kidsDays.includes(d) ? 'chip kids active' : 'chip kids'}
                onClick={() => toggleKids(d)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="chips">
            {KIDS_PRESETS.map((p) => (
              <button key={p.label} className="chip preset" onClick={() => applyPreset(p.days)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="gen-row">
          <span className="gen-label">Feuerwehr-Dienst Dienstag:</span>
          <div className="chips">
            <button
              className={fireTuesday ? 'chip active-danger' : 'chip'}
              onClick={() => setFireTuesday(true)}
            >
              Ja (Puffer)
            </button>
            <button
              className={!fireTuesday ? 'chip active-ok' : 'chip'}
              onClick={() => setFireTuesday(false)}
            >
              Nein
            </button>
          </div>
        </div>
        <div className="gen-row">
          <label className="gen-label" htmlFor="long-run-day">
            Wunsch-Langlauf-Tag:
          </label>
          <select
            id="long-run-day"
            value={longRunDay}
            onChange={(e) => setLongRunDay(Number(e.target.value))}
          >
            {DAY_LONG.map((name, d) => (
              <option key={d} value={d}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="gen-actions">
          <button className="btn primary" onClick={generate}>
            Plan generieren
          </button>
          <button className="btn ghost" onClick={adoptKidsDays} title="Kinder-Tage in den Wochenplan übernehmen">
            Kinder-Tage in Wochenplan übernehmen
          </button>
        </div>
      </div>

      {plan && (
        <>
          {plan.moves.length > 0 && (
            <div className="moves">
              <h3>Verschiebevorschläge & Hinweise</h3>
              <ul>
                {plan.moves.map((m, i) => (
                  <li key={i} className={`move move-${m.kind}`}>
                    <strong>{m.session}</strong>
                    {m.from !== undefined && m.to !== undefined && (
                      <> {DAY_SHORT[m.from]} → {DAY_SHORT[m.to]}</>
                    )}
                    <span> – {m.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="anchor-summary">
            <strong>Nicht verhandelbar (2 Anker):</strong>{' '}
            {plan.anchors.map((d) => {
              const s = plan.days[d].sessions.find((x) => x.anchor);
              return (
                <span key={d} className="badge anchor big">
                  ★ {DAY_LONG[d]} – {s ? s.label.replace(' (Anker)', '') : ''}
                </span>
              );
            })}
          </div>

          <div className="week-grid plan-grid">
            {plan.days.map((day) => (
              <button
                key={day.weekday}
                className={
                  'day-card plan-card' +
                  (selectedDay === day.weekday ? ' selected' : '') +
                  (day.buffer ? ' buffer' : '') +
                  (day.kids ? ' kids' : '') +
                  (day.date === todayISO ? ' today' : '')
                }
                onClick={() =>
                  setSelectedDay(selectedDay === day.weekday ? null : day.weekday)
                }
              >
                <header className="day-head">
                  <div>
                    <span className="day-name">{DAY_SHORT[day.weekday]}</span>
                    <span className="day-date">{formatDE(day.date).split(', ')[1]}</span>
                  </div>
                  <div className="badges">
                    {day.sessions.some((s) => s.anchor) && (
                      <span className="badge anchor">★ Anker</span>
                    )}
                    {day.buffer && <span className="badge buffer">Puffer</span>}
                    {day.kids && <span className="badge kids">Kinder</span>}
                    {day.date === todayISO && <span className="badge today">Heute</span>}
                  </div>
                </header>
                <ul className="day-sessions">
                  {day.sessions.map((s, i) => (
                    <li key={i} className="session-row">
                      <span
                        className="dot"
                        style={{ background: SESSION_META[s.type].color }}
                      />
                      <div>
                        <div className="session-type">
                          {s.label}
                          {s.bonus && <em className="bonus-tag"> Bonus – darf entfallen</em>}
                        </div>
                        <div className="session-stats">
                          {[
                            s.distanceKm ? `${s.distanceKm} km` : null,
                            s.durationMin ? formatDuration(s.durationMin) : null,
                            s.hrZone ?? null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {day.note && <p className="day-note">{day.note}</p>}
              </button>
            ))}
          </div>

          {selectedDay !== null && (
            <div className="card detail-panel">
              <h3>
                {DAY_LONG[selectedDay]} · {formatDE(plan.days[selectedDay].date)}
              </h3>
              {plan.days[selectedDay].sessions.length === 0 && (
                <p className="dim">Keine Einheit geplant – Puffer-/Ruhetag.</p>
              )}
              {plan.days[selectedDay].sessions.map((s, i) => (
                <div key={i} className="detail-item">
                  <div className="detail-head">
                    <span className="dot" style={{ background: SESSION_META[s.type].color }} />
                    <strong>{s.label}</strong>
                    {s.anchor && <span className="badge anchor">★ nicht verhandelbar</span>}
                    {s.bonus && <span className="badge bonus">Bonus – darf entfallen</span>}
                    {!s.anchor && !s.bonus && <span className="badge flexible">flexibel</span>}
                    <button
                      className="btn small"
                      onClick={() => onLog(plan.days[selectedDay].date, s.type)}
                    >
                      + Loggen
                    </button>
                  </div>
                  <dl className="detail-grid">
                    <dt>Warm-up</dt>
                    <dd>{s.warmup}</dd>
                    <dt>Hauptteil</dt>
                    <dd>{s.main}</dd>
                    <dt>Erfolgskriterium</dt>
                    <dd>{s.success}</dd>
                  </dl>
                </div>
              ))}
              {plan.days[selectedDay].note && (
                <p className="day-note">{plan.days[selectedDay].note}</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
