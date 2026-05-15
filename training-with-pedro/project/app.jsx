// app.jsx — Main app shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "rotationWeeks": 3,
  "units": "kg",
  "accent": "#d4ff3a",
  "currentWeekIdx": 0,
  "dayOverride": -1,
  "theme": "dark"
}/*EDITMODE-END*/;

const DAY_NAMES_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState("today");
  const [sheetExercise, setSheetExercise] = React.useState(null);
  const [logState, setLogState] = React.useState({});

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
    logState,
  };

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
          />
        </Sheet>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Program" />
        <TweakRadio
          label="Rotation"
          value={t.rotationWeeks}
          options={[{ value: 2, label: '2-week' }, { value: 3, label: '3-week' }]}
          onChange={(v) => setTweak('rotationWeeks', v)}
        />
        <TweakSelect
          label="Current week"
          value={t.currentWeekIdx}
          options={Array.from({ length: t.rotationWeeks }).map((_, i) => ({
            value: i,
            label: `${window.PROGRAM.weeks[i].name} · ${window.PROGRAM.weeks[i].subtitle}`,
          }))}
          onChange={(v) => setTweak('currentWeekIdx', Number(v))}
        />
        <TweakSelect
          label="Today (demo)"
          value={t.dayOverride}
          options={[
            { value: -1, label: 'Auto-detect' },
            { value: 0, label: 'Mon · Push' },
            { value: 1, label: 'Tue · Pull' },
            { value: 2, label: 'Wed · Legs' },
            { value: 3, label: 'Thu · Push' },
            { value: 4, label: 'Fri · Pull' },
            { value: 5, label: 'Sat · Legs' },
            { value: 6, label: 'Sun · Rest' },
          ]}
          onChange={(v) => setTweak('dayOverride', Number(v))}
        />
        <TweakSection label="Display" />
        <TweakRadio
          label="Units"
          value={t.units}
          options={['kg', 'lb']}
          onChange={(v) => setTweak('units', v)}
        />
        <TweakColor
          label="Accent"
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
