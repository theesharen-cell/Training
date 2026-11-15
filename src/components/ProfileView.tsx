import { useState } from 'react';
import { AppState, Profile } from '../types';
import { UpdateFn } from '../store';
import { formatPace, parsePace } from '../lib/pace';

interface Props {
  state: AppState;
  update: UpdateFn;
}

function paceStr(sec: number): string {
  return formatPace(sec);
}

export default function ProfileView({ state, update }: Props) {
  const [p, setP] = useState<Profile>({ ...state.profile });
  const [equipmentText, setEquipmentText] = useState(state.profile.equipment.join('\n'));
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setP((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    update((s) => ({
      ...s,
      profile: { ...p, equipment: equipmentText.split('\n').map((x) => x.trim()).filter(Boolean) },
    }));
    setSaved(true);
  };

  return (
    <section>
      <div className="section-head">
        <h2>Profil & Regeln</h2>
      </div>
      <form className="card profile-form" onSubmit={save}>
        <div className="form-grid">
          <label>
            Name
            <input value={p.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            Alter
            <input
              type="number"
              min="0"
              value={p.age}
              onChange={(e) => set('age', Number(e.target.value))}
            />
          </label>
          <label>
            Gewicht (kg)
            <input
              type="number"
              step="0.1"
              value={p.weightKg}
              onChange={(e) => set('weightKg', Number(e.target.value))}
            />
          </label>
          <label>
            Ort
            <input value={p.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label>
            Max. HF (bpm)
            <input
              type="number"
              min="0"
              value={p.maxHr}
              onChange={(e) => set('maxHr', Number(e.target.value))}
            />
          </label>
          <label>
            GA1-Zone (bpm)
            <div className="inline-pair">
              <input
                type="number"
                min="0"
                value={p.ga1Min}
                onChange={(e) => set('ga1Min', Number(e.target.value))}
              />
              <span>–</span>
              <input
                type="number"
                min="0"
                value={p.ga1Max}
                onChange={(e) => set('ga1Max', Number(e.target.value))}
              />
            </div>
          </label>
          <label>
            Ziel 10 km (min, z. B. 50 = unter 50:00)
            <input
              type="number"
              step="0.5"
              value={p.goal10kMin}
              onChange={(e) => set('goal10kMin', Number(e.target.value))}
            />
          </label>
          <label>
            Ziel Klimmzüge (sauber, min–max)
            <div className="inline-pair">
              <input
                type="number"
                min="0"
                value={p.goalPullUpsMin}
                onChange={(e) => set('goalPullUpsMin', Number(e.target.value))}
              />
              <span>–</span>
              <input
                type="number"
                min="0"
                value={p.goalPullUpsMax}
                onChange={(e) => set('goalPullUpsMax', Number(e.target.value))}
              />
            </div>
          </label>
          <label>
            Aktuell 5 km (min)
            <input
              type="number"
              step="0.1"
              value={p.fiveKmMin}
              onChange={(e) => set('fiveKmMin', Number(e.target.value))}
            />
          </label>
          <label>
            Aktuell 10 km (min)
            <input
              type="number"
              step="0.1"
              value={p.tenKmMin}
              onChange={(e) => set('tenKmMin', Number(e.target.value))}
            />
          </label>
          <label>
            GA1-Pace (min/km)
            <input
              value={paceStr(p.ga1PaceSec)}
              onChange={(e) => {
                const v = parsePace(e.target.value);
                if (v !== null) set('ga1PaceSec', v);
                else set('ga1PaceSec', p.ga1PaceSec);
              }}
              onBlur={(e) => set('ga1PaceSec', parsePace(e.target.value) ?? p.ga1PaceSec)}
              placeholder="6:30"
            />
          </label>
          <label>
            Intervall-Pace (min/km)
            <input
              value={paceStr(p.intervalPaceSec)}
              onChange={(e) => {
                const v = parsePace(e.target.value);
                set('intervalPaceSec', v ?? p.intervalPaceSec);
              }}
              onBlur={(e) => set('intervalPaceSec', parsePace(e.target.value) ?? p.intervalPaceSec)}
              placeholder="4:52"
            />
          </label>
          <label>
            Langlauf (km)
            <input
              type="number"
              step="0.5"
              value={p.langlaufKm}
              onChange={(e) => set('langlaufKm', Number(e.target.value))}
            />
          </label>
          <label>
            Motto
            <input value={p.motto} onChange={(e) => set('motto', e.target.value)} />
          </label>
          <label className="full">
            Ausstattung (eine pro Zeile)
            <textarea
              rows={5}
              value={equipmentText}
              onChange={(e) => {
                setEquipmentText(e.target.value);
                setSaved(false);
              }}
            />
          </label>
        </div>
        <footer className="modal-foot">
          {saved && <span className="saved-hint">Gespeichert ✓</span>}
          <button type="submit" className="btn primary">
            Profil speichern
          </button>
        </footer>
      </form>
      <p className="dim small">
        Alle Daten liegen ausschließlich in deinem Browser (LocalStorage, Schlüssel:{' '}
        <code>hybrid-training-app-v1</code>). Kein Backend, kein Account.
      </p>
      <p className="dim small">Regeln: Anker Mi (Intervalle), Do (Kraft abends), So/Mo (Langlauf). Dienstag = Puffer (Feuerwehr). Klimmzüge 2–3×/Woche GTG.</p>
    </section>
  );
}
