import { useMemo, useState } from 'react';
import { AppState } from '../types';
import { UpdateFn, getWeek } from '../store';
import {
  PILLARS,
  SESSION_META,
  WEEK_TEMPLATE,
  pillarCheck,
  pullUpContacts,
  sessionsForWeek,
} from '../lib/plan';
import {
  addDaysISO,
  formatDE,
  toISODate,
  weekLabel,
  weekStartISO,
} from '../lib/dates';
import { sessionSummary } from '../lib/pace';

interface Props {
  state: AppState;
  update: UpdateFn;
  onLog: (date: string) => void;
}

export default function WeekPlanView({ state, update, onLog }: Props) {
  const [ws, setWs] = useState(() => weekStartISO(new Date()));
  const week = getWeek(state, ws);
  const today = toISODate(new Date());
  const isCurrentWeek = ws === weekStartISO(new Date());

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, typeof state.sessions>();
    for (const s of sessionsForWeek(state.sessions, ws)) {
      const list = map.get(s.date) ?? [];
      list.push(s);
      map.set(s.date, list);
    }
    return map;
  }, [state.sessions, ws]);

  const pillars = pillarCheck(state.sessions, ws);
  const gtg = pullUpContacts(state.sessions, ws);

  const toggleKids = (weekday: number) => {
    update((s) => {
      const current = getWeek(s, ws);
      const kidsDays = current.kidsDays.includes(weekday)
        ? current.kidsDays.filter((d) => d !== weekday)
        : [...current.kidsDays, weekday].sort();
      return {
        ...s,
        weeks: { ...s.weeks, [ws]: { weekStart: ws, kidsDays } },
      };
    });
  };

  return (
    <section>
      <div className="week-header">
        <div className="week-nav">
          <button className="btn ghost" onClick={() => setWs(addDaysISO(ws, -7))}>
            ‹ Vorherige
          </button>
          <div className="week-title">
            <strong>{weekLabel(ws)}</strong>
            {!isCurrentWeek && (
              <button className="btn ghost small" onClick={() => setWs(weekStartISO(new Date()))}>
                Heute
              </button>
            )}
          </div>
          <button className="btn ghost" onClick={() => setWs(addDaysISO(ws, 7))}>
            Nächste ›
          </button>
        </div>
        <div className="kids-row">
          <span className="kids-label">Kinder-Tage:</span>
          {WEEK_TEMPLATE.map((t) => (
            <button
              key={t.weekday}
              className={week.kidsDays.includes(t.weekday) ? 'chip kids active' : 'chip kids'}
              onClick={() => toggleKids(t.weekday)}
              title="Kinder bei dir – kurze Sessions"
            >
              {t.short}
            </button>
          ))}
        </div>
      </div>

      <div className="pillars">
        {PILLARS.map((p, i) => (
          <div key={p.n} className={pillars[i] ? 'pillar done' : 'pillar'}>
            <span className="pillar-check">{pillars[i] ? '✓' : '–'}</span>
            <span className="pillar-name">{p.name}</span>
          </div>
        ))}
        <div className={gtg >= 2 ? 'pillar done' : 'pillar'}>
          <span className="pillar-check">{gtg >= 2 ? '✓' : '–'}</span>
          <span className="pillar-name">Klimmzüge GTG {gtg}/2–3</span>
        </div>
      </div>

      <div className="week-grid">
        {WEEK_TEMPLATE.map((t, i) => {
          const date = addDaysISO(ws, i);
          const daySessions = (sessionsByDate.get(date) ?? []).slice().reverse();
          const isToday = date === today;
          const isKids = week.kidsDays.includes(t.weekday);
          return (
            <article
              key={t.weekday}
              className={
                'day-card' +
                (isToday ? ' today' : '') +
                (t.buffer ? ' buffer' : '') +
                (isKids ? ' kids' : '')
              }
            >
              <header className="day-head">
                <div>
                  <span className="day-name">{t.short}</span>
                  <span className="day-date">{formatDE(date).split(', ')[1] ?? formatDE(date)}</span>
                </div>
                <div className="badges">
                  {t.anchors.map((a) => (
                    <span key={a} className="badge anchor" style={{ borderColor: SESSION_META[a].color }}>
                      ★ Anker
                    </span>
                  ))}
                  {t.buffer && <span className="badge buffer">Puffer</span>}
                  {isKids && <span className="badge kids">Kinder</span>}
                  {isToday && <span className="badge today">Heute</span>}
                </div>
              </header>
              {t.note && <p className="day-note">{t.note}</p>}
              <div className="day-suggest">
                {t.suggestions.map((sType) => (
                  <span
                    key={sType}
                    className="chip"
                    style={{ borderColor: SESSION_META[sType].color, color: SESSION_META[sType].color }}
                  >
                    {SESSION_META[sType].label}
                  </span>
                ))}
              </div>
              <ul className="day-sessions">
                {daySessions.map((s) => (
                  <li key={s.id} className="session-row">
                    <span
                      className="dot"
                      style={{ background: SESSION_META[s.type].color }}
                      title={SESSION_META[s.type].label}
                    />
                    <div>
                      <div className="session-type">{SESSION_META[s.type].label}</div>
                      <div className="session-stats">{sessionSummary(s)}</div>
                      {s.notes && <div className="session-notes">{s.notes}</div>}
                    </div>
                  </li>
                ))}
              </ul>
              <button className="btn small full" onClick={() => onLog(date)}>
                + Loggen
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
