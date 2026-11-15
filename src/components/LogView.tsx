import { AppState } from '../types';
import { UpdateFn } from '../store';
import { SESSION_META } from '../lib/plan';
import { formatDE } from '../lib/dates';
import { sessionSummary } from '../lib/pace';

interface Props {
  state: AppState;
  update: UpdateFn;
  onLog: () => void;
}

export default function LogView({ state, update, onLog }: Props) {
  const sorted = [...state.sessions].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );

  const remove = (id: string) => {
    update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
  };

  return (
    <section>
      <div className="section-head">
        <h2>Session-Log</h2>
        <button className="btn primary" onClick={onLog}>
          + Neue Session
        </button>
      </div>
      {sorted.length === 0 && (
        <p className="empty">Noch keine Sessions geloggt. Starte mit dem heutigen Tag – auch gekürzt zählt.</p>
      )}
      <ul className="log-list">
        {sorted.map((s) => (
          <li key={s.id} className="log-item">
            <span className="dot" style={{ background: SESSION_META[s.type].color }} />
            <div className="log-main">
              <div className="log-top">
                <strong>{formatDE(s.date)}</strong>
                <span className="session-type" style={{ color: SESSION_META[s.type].color }}>
                  {SESSION_META[s.type].label}
                </span>
              </div>
              <div className="session-stats">{sessionSummary(s)}</div>
              {s.exercises.length > 0 && (
                <div className="session-stats">
                  {s.exercises
                    .map(
                      (e) =>
                        `${e.exercise}` +
                        (e.weightKg ? ` ${e.weightKg} kg` : '') +
                        (e.sets ? ` ×${e.sets}` : '') +
                        (e.reps ? ` ×${e.reps}` : ''),
                    )
                    .join(' · ')}
                </div>
              )}
              {s.notes && <div className="session-notes">{s.notes}</div>}
            </div>
            <button className="btn ghost small" onClick={() => remove(s.id)} title="Löschen">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
