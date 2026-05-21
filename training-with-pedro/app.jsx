// app.jsx — Main app shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "rotationWeeks": 3,
  "units": "kg",
  "accent": "#d4ff3a",
  "currentWeekIdx": 0,
  "dayOverride": -1,
  "theme": "dark"
}/*EDITMODE-END*/;

const DAY_NAMES_LONG = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState("today");
  const [sheetExercise, setSheetExercise] = React.useState(null);
  const [logState, setLogState] = React.useState({});
  const [dayState, setDayState] = React.useState({});

  // Date detection — May 14, 2026 = Thursday
  const now = new Date(2026, 4, 14); // override for demo: May 14 2026
  // const now = new Date();
  // JS Date.getDay(): 0 = Sun. Our program: 0=Mon..6=Sun. Convert.
  const jsDay = now.getDay();
  const detectedDayIdx = (jsDay + 6) % 7;
  const dayIdx = t.dayOverride >= 0 ? t.dayOverride : detectedDayIdx;
  const weekIdx = Math.min(t.currentWeekIdx, t.rotationWeeks - 1);

  const weekObj = window.PROGRAM.weeks[weekIdx];
  const day = weekObj.days[dayIdx];
  const weekDayName = DAY_NAMES_LONG[jsDay];
  const dateStr = `${MONTH_NAMES[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`;

  const ctx = {
    day, weekObj, dayIndex: dayIdx, weekIdx,
    weekDayName, dateStr,
    accent: t.accent, units: t.units,
    activeWeeks: t.rotationWeeks,
    logState, dayState, setDayState,
  };

  // Compute prev/next exercise in the day's flow
  const computeNeighbors = (current) => {
    if (!current || !day.exercises) return { prev: null, next: null };
    const idx = day.exercises.findIndex(e => e.id === current.id);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: idx > 0 ? day.exercises[idx - 1] : null,
      next: idx < day.exercises.length - 1 ? day.exercises[idx + 1] : null,
    };
  };
  const { prev: prevExercise, next: nextExercise } = computeNeighbors(sheetExercise);

  const openExercise = (e) => setSheetExercise(e);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', overflow: 'hidden' }}>
        {tab === 'today' && <TodayScreen ctx={ctx} onOpenExercise={openExercise} />}
        {tab === 'plan' && <PlanScreen ctx={ctx} onOpenExercise={openExercise} />}
        {tab === 'history' && <HistoryScreen ctx={ctx} onOpenExercise={openExercise} />}
        {tab === 'me' && <YouScreen ctx={ctx} />}

        <TabBar active={tab} onChange={setTab} accent={t.accent} />

        <Sheet open={!!sheetExercise} onClose={() => setSheetExercise(null)}>
          <ExerciseDetail
            exercise={sheetExercise}
            accent={t.accent}
            units={t.units}
            onClose={() => setSheetExercise(null)}
            logState={logState}
            setLogState={setLogState}
            prevExercise={prevExercise}
            nextExercise={nextExercise}
            onNavigate={(ex) => setSheetExercise(ex)}
          />
        </Sheet>
      </div>

      <TweaksPanel title="Ajustes">
        <TweakSection label="Programa" />
        <TweakRadio
          label="Rotación"
          value={t.rotationWeeks}
          options={[{ value: 2, label: '2 semanas' }, { value: 3, label: '3 semanas' }]}
          onChange={(v) => setTweak('rotationWeeks', v)}
        />
        <TweakSelect
          label="Semana actual"
          value={t.currentWeekIdx}
          options={Array.from({ length: t.rotationWeeks }).map((_, i) => ({
            value: i,
            label: `${window.PROGRAM.weeks[i].name} · ${window.PROGRAM.weeks[i].subtitle}`,
          }))}
          onChange={(v) => setTweak('currentWeekIdx', Number(v))}
        />
        <TweakSelect
          label="Hoy (demo)"
          value={t.dayOverride}
          options={[
            { value: -1, label: 'Detección automática' },
            { value: 0, label: 'Lun · Empuje' },
            { value: 1, label: 'Mar · Tirón' },
            { value: 2, label: 'Mié · Piernas' },
            { value: 3, label: 'Jue · Empuje' },
            { value: 4, label: 'Vie · Tirón' },
            { value: 5, label: 'Sáb · Piernas' },
            { value: 6, label: 'Dom · Descanso' },
          ]}
          onChange={(v) => setTweak('dayOverride', Number(v))}
        />
        <TweakSection label="Visualización" />
        <TweakRadio
          label="Unidades"
          value={t.units}
          options={['kg', 'lb']}
          onChange={(v) => setTweak('units', v)}
        />
        <TweakColor
          label="Color"
          value={t.accent}
          options={['#d4ff3a', '#ff5a36', '#9bd1ff', '#c2f970', '#ff6b9d']}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweaksPanel>
    </>
  );
}

// Mount inside the iOS frame
function Root() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box',
      backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(212,255,58,0.04), transparent 50%), radial-gradient(circle at 70% 80%, rgba(155,209,255,0.03), transparent 50%)',
    }}>
      <IOSDevice dark width={402} height={874}>
        <App />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
