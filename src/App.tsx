import { useState } from 'react';
import { useAppState } from './store';
import { SessionType } from './types';
import { toISODate } from './lib/dates';
import WeekPlanView from './components/WeekPlanView';
import GeneratorView from './components/GeneratorView';
import LogView from './components/LogView';
import ProgressView from './components/ProgressView';
import ProfileView from './components/ProfileView';
import SessionForm from './components/SessionForm';

type Tab = 'woche' | 'generator' | 'log' | 'fortschritt' | 'profil';

const TABS: { id: Tab; label: string }[] = [
  { id: 'woche', label: 'Wochenplan' },
  { id: 'generator', label: 'Generator' },
  { id: 'log', label: 'Loggen' },
  { id: 'fortschritt', label: 'Fortschritt' },
  { id: 'profil', label: 'Profil' },
];

interface LogTarget {
  date: string;
  type?: SessionType;
}

export default function App() {
  const [state, update] = useAppState();
  const [tab, setTab] = useState<Tab>('woche');
  const [log, setLog] = useState<LogTarget | null>(null);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <h1>Hybrid Training</h1>
          <p className="motto">„{state.profile.motto}“</p>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'tab active' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="main">
        {tab === 'woche' && (
          <WeekPlanView
            state={state}
            update={update}
            onLog={(date) => setLog({ date })}
          />
        )}
        {tab === 'generator' && (
          <GeneratorView
            state={state}
            update={update}
            onLog={(date, type) => setLog({ date, type })}
          />
        )}
        {tab === 'log' && (
          <LogView
            state={state}
            update={update}
            onLog={() => setLog({ date: toISODate(new Date()) })}
          />
        )}
        {tab === 'fortschritt' && <ProgressView state={state} />}
        {tab === 'profil' && <ProfileView state={state} update={update} />}
      </main>
      {log !== null && (
        <SessionForm
          date={log.date}
          initialType={log.type}
          state={state}
          update={update}
          onClose={() => setLog(null)}
        />
      )}
    </div>
  );
}
