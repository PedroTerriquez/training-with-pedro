// detail.jsx — Exercise detail sheet (weight stepper + simplified history)

function ExerciseDetail({ exercise, accent, units, onClose, logState, setLogState }) {
  const [tab, setTab] = React.useState("workout");
  if (!exercise) return null;

  const log = logState[exercise.id] || { weight: undefined, loggedAt: null };

  const lastSession = exercise.history[exercise.history.length - 1];
  const lastTop = lastSession?.top || 0;
  const allTime = Math.max(...exercise.history.map(h => h.top));
  // PR badge: current logged weight ≥ all-time, OR if no log yet, last session was a PR
  const currentWeight = log.weight ?? lastTop;
  const isPR = currentWeight >= allTime && currentWeight > 0;

  return (
    <div style={{ color: '#fafafa', paddingBottom: 40 }}>
      {/* Hero image */}
      <div style={{ padding: '16px 16px 0' }}>
        <ExercisePlaceholder name={exercise.name} muscle={exercise.muscle} accent={accent} size="xl" />
      </div>

      {/* Header info */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <Chip color="rgba(255,255,255,0.08)">{exercise.muscle}</Chip>
          {isPR && <Chip color="rgba(212,255,58,0.18)" text={accent}>★ PR — all time</Chip>}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 26, fontWeight: 700, color: '#fafafa',
          letterSpacing: -0.8, lineHeight: 1.1,
        }}>{exercise.name}</div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 18, marginTop: 18,
          paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <StatBlock value={exercise.sets} label="Sets" size="md" />
          <StatBlock value={exercise.reps} label="Reps" size="md" />
          <StatBlock value={exercise.rest} label="Rest" unit="s" size="md" />
          <StatBlock value={lastTop || "—"} label="Last" unit={lastTop ? units : null} accent={accent} size="md" />
        </div>
      </div>

      {/* Segmented control */}
      <div style={{
        margin: '24px 20px 0',
        display: 'flex', padding: 3, borderRadius: 11,
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        {[
          { id: 'workout', label: 'Workout' },
          { id: 'history', label: 'History' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 0', border: 0, cursor: 'pointer',
            background: tab === t.id ? '#262626' : 'transparent',
            color: tab === t.id ? '#fafafa' : 'rgba(255,255,255,0.5)',
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            borderRadius: 8,
            transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'workout' ? (
        <WorkoutTab
          exercise={exercise}
          log={log}
          setLog={(next) => setLogState({ ...logState, [exercise.id]: next })}
          accent={accent}
          units={units}
          lastTop={lastTop}
        />
      ) : (
        <HistoryTab exercise={exercise} accent={accent} units={units} todayWeight={log.weight} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Workout tab — stepper card, tips, alternatives
// ─────────────────────────────────────────────────────────────
function WorkoutTab({ exercise, log, setLog, accent, units, lastTop }) {
  const STEP = 5;
  // Working value being edited; pre-fill with previous log, or last session's top
  const initial = log.weight ?? lastTop ?? 0;
  const [pending, setPending] = React.useState(initial);
  // Sync if exercise changes
  React.useEffect(() => { setPending(log.weight ?? lastTop ?? 0); }, [exercise.id]);

  const isLogged = log.weight !== undefined;
  const isDirty = pending !== log.weight;

  const dec = () => setPending(Math.max(0, +(pending - STEP).toFixed(1)));
  const inc = () => setPending(+(pending + STEP).toFixed(1));

  const save = () => setLog({ weight: pending, loggedAt: new Date().toISOString() });
  const clear = () => {
    setLog({ weight: undefined, loggedAt: null });
    setPending(lastTop ?? 0);
  };

  const onInputChange = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '');
    setPending(v === '' ? 0 : parseFloat(v));
  };

  return (
    <div>
      {/* Stepper card */}
      <div style={{ marginTop: 22, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Today's working weight</SectionLabel>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: '#141414', borderRadius: 20, padding: 20,
          border: `0.5px solid ${isLogged ? `${accent}33` : 'rgba(255,255,255,0.06)'}`,
          position: 'relative', overflow: 'hidden',
        }}>
          {isLogged && (
            <div style={{
              position: 'absolute', top: -50, right: -50,
              width: 180, height: 180, borderRadius: '50%',
              background: accent, opacity: 0.08, filter: 'blur(50px)',
            }} />
          )}

          {/* Stepper row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 14, position: 'relative', zIndex: 1,
          }}>
            <StepperButton onClick={dec} disabled={pending <= 0}>−</StepperButton>
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <input
                value={pending === 0 ? '' : String(pending)}
                onChange={onInputChange}
                placeholder="0"
                inputMode="decimal"
                style={{
                  background: 'transparent', border: 0, outline: 'none',
                  textAlign: 'center', width: '100%',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 44, fontWeight: 500, color: isLogged ? accent : '#fafafa',
                  letterSpacing: -2, lineHeight: 1,
                  padding: 0,
                }}
              />
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}>{units} · {STEP}{units} steps</div>
            </div>
            <StepperButton onClick={inc}>+</StepperButton>
          </div>

          {/* Log button */}
          <button
            onClick={save}
            disabled={!isDirty && isLogged}
            style={{
              marginTop: 18, width: '100%', padding: '13px 18px',
              borderRadius: 12, border: 0, cursor: 'pointer',
              background: isLogged && !isDirty ? `${accent}22` : accent,
              color: isLogged && !isDirty ? accent : '#0a0a0a',
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: isDirty || !isLogged ? `0 6px 20px ${accent}33` : 'none',
              position: 'relative', zIndex: 1,
            }}
          >
            {isLogged && !isDirty ? (
              <>
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5l4 4 8-8.5" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logged · {log.weight}{units}
              </>
            ) : isLogged && isDirty ? (
              <>Update · {pending}{units}</>
            ) : (
              <>Log workout · {pending}{units}</>
            )}
          </button>

          {isLogged && (
            <button onClick={clear} style={{
              marginTop: 8, width: '100%', padding: '8px',
              background: 'transparent', border: 0, cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 11, letterSpacing: 0.2,
              position: 'relative', zIndex: 1,
            }}>Clear today's log</button>
          )}
        </div>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 26, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Form cues</SectionLabel>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: '#141414', borderRadius: 18, padding: 14,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          {exercise.tips.map((tip, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '8px 4px',
              borderBottom: i < exercise.tips.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 0,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(212,255,58,0.12)', color: accent,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.45 }}>
                {tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternatives */}
      <div style={{ marginTop: 26, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Can't do it? Try one of these</SectionLabel>
      </div>
      <div style={{
        display: 'flex', gap: 10, padding: '0 20px',
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        paddingBottom: 6,
      }}>
        {exercise.alternatives.map((alt, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 200, scrollSnapAlign: 'start',
            background: '#141414', borderRadius: 18,
            border: '0.5px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: 90, position: 'relative',
              background: '#1a1a1a',
              backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 16px, rgba(255,255,255,0.045) 16px 32px)',
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, letterSpacing: 1.2,
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                position: 'absolute', top: 8, left: 10,
              }}>ALT {i + 1}</div>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(212,255,58,0.14)',
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'absolute', top: 8, right: 8,
                fontSize: 13, fontWeight: 700,
              }}>↺</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 14, fontWeight: 600, color: '#fafafa',
                letterSpacing: -0.3, lineHeight: 1.2,
              }}>{alt.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.4 }}>
                {alt.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 30 }} />
    </div>
  );
}

function StepperButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 52, height: 52, borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      color: disabled ? 'rgba(255,255,255,0.2)' : '#fafafa',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 28, fontWeight: 400, cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.15s',
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// History tab — stats, chart, simplified session list
// ─────────────────────────────────────────────────────────────
function HistoryTab({ exercise, accent, units, todayWeight }) {
  // Optionally append today's logged weight as latest session
  const baseData = exercise.history;
  const data = todayWeight !== undefined
    ? [...baseData, { date: 'Today', top: todayWeight, sets: [{ w: todayWeight, r: 0 }] }]
    : baseData;

  const allTime = Math.max(...data.map(h => h.top));
  const first = data[0].top;
  const last = data[data.length - 1].top;
  const totalGain = last - first;
  const pct = first ? ((totalGain / first) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Stats */}
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        }}>
          {[
            { label: 'All-time', val: allTime, color: accent },
            { label: 'Current', val: last, color: '#fafafa' },
            { label: '6-week Δ', val: (totalGain >= 0 ? '+' : '') + totalGain.toFixed(1), color: totalGain >= 0 ? accent : '#ff6b6b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#141414', borderRadius: 14, padding: '12px 12px',
              border: '0.5px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}>{s.label}</div>
              <div style={{
                marginTop: 6,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 20, fontWeight: 500, color: s.color, letterSpacing: -0.5,
              }}>{s.val}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{units}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: '#141414', borderRadius: 18, padding: 14,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 6,
          }}>
            <div style={{
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 14, fontWeight: 600, color: '#fafafa',
            }}>Weight per session</div>
            <Chip>{pct >= 0 ? '+' : ''}{pct}%</Chip>
          </div>
          <LineChart data={data} width={324} height={170} color={accent} unit={units} />
        </div>
      </div>

      {/* Session list */}
      <div style={{ marginTop: 22, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Past sessions</SectionLabel>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...data].reverse().map((sess, i) => {
          const idx = data.length - 1 - i;
          const prev = idx > 0 ? data[idx - 1].top : null;
          const delta = prev !== null ? +(sess.top - prev).toFixed(1) : null;
          const isPR = sess.top === allTime;
          const isToday = sess.date === 'Today';
          return (
            <div key={i} style={{
              background: '#141414', borderRadius: 14,
              padding: '12px 14px',
              border: isToday ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 14,
              position: 'relative', overflow: 'hidden',
            }}>
              {isToday && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0,
                  width: 2, background: accent,
                }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12, color: isToday ? accent : 'rgba(255,255,255,0.7)',
                  letterSpacing: 0.4,
                  textTransform: isToday ? 'uppercase' : 'none',
                  fontWeight: isToday ? 600 : 400,
                }}>{sess.date}</div>
                {delta !== null && delta !== 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, letterSpacing: 0.4,
                    color: delta > 0 ? accent : '#ff6b6b',
                    background: delta > 0 ? `${accent}14` : 'rgba(255,107,107,0.12)',
                    padding: '2px 7px', borderRadius: 6,
                  }}>
                    <span>{delta > 0 ? '▲' : '▼'}</span>
                    <span>{delta > 0 ? '+' : ''}{delta}{units}</span>
                  </div>
                )}
                {delta === 0 && (
                  <div style={{
                    display: 'inline-block', marginTop: 4,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10, letterSpacing: 0.6,
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '2px 7px', borderRadius: 6,
                  }}>— hold</div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 18, fontWeight: 500,
                  color: isPR ? accent : '#fafafa',
                  letterSpacing: -0.4,
                }}>{sess.top}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{units}</span></div>
                {isPR && (
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 8, letterSpacing: 1.4, color: accent,
                    marginTop: 2,
                  }}>★ PR</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { ExerciseDetail });
