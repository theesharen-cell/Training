import { AppState } from '../types';
import { PILLARS, pillarCheck, pullUpContacts, sessionsForWeek } from '../lib/plan';
import { project10k, pullUpStats, strengthStats } from '../lib/projection';
import { formatClock, formatPace } from '../lib/pace';
import { weekStartISO } from '../lib/dates';

interface Props {
  state: AppState;
}

export default function ProgressView({ state }: Props) {
  const p = state.profile;
  const ws = weekStartISO(new Date());
  const proj = project10k(state);
  const pull = pullUpStats(state, ws);
  const strength = strengthStats(state);
  const pillars = pillarCheck(state.sessions, ws);
  const gtg = pullUpContacts(state.sessions, ws);

  const goalMin = p.goal10kMin;
  const startMin = p.tenKmMin;
  const progress = Math.min(
    1,
    Math.max(0, (startMin - proj.totalMin) / Math.max(startMin - goalMin, 0.01)),
  );

  return (
    <section className="progress">
      <div className="section-head">
        <h2>Fortschritt</h2>
      </div>

      <div className="cards">
        <article className="card">
          <h3>10-km-Projektion</h3>
          <p className="big-value">{formatClock(proj.totalMin)}</p>
          <p className="dim">
            Ziel: unter {formatClock(goalMin)} · aktueller Stand: {formatClock(startMin)} · Pace{' '}
            {formatPace(proj.paceSecPerKm)}/km
          </p>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="dim small">
            Basis:{' '}
            {proj.sessionsUsed === 0
              ? 'Profilwerte (noch keine Lauf-Sessions geloggt)'
              : `${proj.sessionsUsed} Session(s)`}
            {proj.intervalBasis && ` · Intervall-Pace ${formatPace(proj.intervalBasis)}/km`}
            {proj.longBasis && ` · Langlauf-Pace ${formatPace(proj.longBasis)}/km`}
          </p>
        </article>

        <article className="card">
          <h3>Klimmzüge (sauber)</h3>
          <p className="big-value">
            {pull.record > 0 ? pull.record : '–'} <span className="dim">Wdh. Rekord</span>
          </p>
          <p className="dim">
            Ziel: {p.goalPullUpsMin}–{p.goalPullUpsMax} saubere Wdh. · GTG-Kontakte diese Woche:{' '}
            {gtg}/2–3 · gesamt {pull.totalReps} Wdh. in {pull.contactsAllTime} Kontakten
          </p>
          {pull.recent.length > 0 && (
            <ul className="mini-list">
              {pull.recent.map((r, i) => (
                <li key={i}>
                  {r.date}: {r.reps} Wdh.
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h3>4 Säulen diese Woche</h3>
          <ul className="mini-list pillars-list">
            {PILLARS.map((pl, i) => (
              <li key={pl.n} className={pillars[i] ? 'done' : ''}>
                <span>{pillars[i] ? '✓' : '–'}</span> Säule {pl.n}: {pl.name}
              </li>
            ))}
            <li className={gtg >= 2 ? 'done' : ''}>
              <span>{gtg >= 2 ? '✓' : '–'}</span> Klimmzüge GTG {gtg}/2–3 Kontakte
            </li>
          </ul>
          <p className="dim small">
            {sessionsForWeek(state.sessions, ws).length} Sessions diese Woche geloggt.
          </p>
        </article>
      </div>

      <article className="card">
        <h3>Kraft-Progression (Kettlebell)</h3>
        {strength.length === 0 && <p className="dim">Noch keine Kraft-Sessions geloggt.</p>}
        <div className="strength-grid">
          {strength.map((s) => (
            <div key={s.exercise} className="strength-item">
              <div className="strength-name">{s.exercise}</div>
              <div className="dim small">
                Bestes Volumen: {s.bestVolume.toFixed(0)} kg·Wdh. · max. Gewicht: {s.maxWeight} kg
              </div>
              <ul className="mini-list">
                {s.entries.map((e, i) => (
                  <li key={i}>
                    {e.date}: {e.weightKg ?? '–'} kg{e.sets ? ` ×${e.sets}` : ''}
                    {e.reps ? ` ×${e.reps}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
