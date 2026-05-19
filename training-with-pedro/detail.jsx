// detail.jsx — Exercise detail (redesigned: one-viewport flow, carousels)
//
// Layout principles:
//   • One-viewport-first: primary action (log) + supporting content all fit
//     without scrolling on a standard mobile screen.
//   • Horizontal patterns for browse-able content: form cues and alternatives
//     become swipeable card decks instead of long vertical lists.
//   • Dense prescription strip below the hero replaces the orphan stats row
//     with a 4-cell dashboard (sets / reps / rest / last).

function ExerciseDetail({ exercise, accent, units, onClose, logState, setLogState, nextExercise, onNext }) {
  const [tab, setTab] = React.useState("workout");
  if (!exercise) return null;

  const log = logState[exercise.id] || { weight: undefined, sets: undefined, reps: undefined, loggedAt: null };
  const lastSession = exercise.history[exercise.history.length - 1];
  const lastTop = lastSession?.top || 0;
  const allTime = Math.max(...exercise.history.map(h => h.top));
  const currentWeight = log.weight ?? lastTop;
  const isPR = currentWeight >= allTime && currentWeight > 0;

  return (
    <div style={{ color: '#fafafa', paddingBottom: 40 }}>
      {/* HERO — compact identity card */}
      <div style={{ padding: '12px 14px 0' }}>
        <ExercisePlaceholder
          name={exercise.name}
          muscle={exercise.muscle}
          accent={accent}
          size="lg"
          isPR={isPR}
          showActions
        />
      </div>

      {/* PRESCRIPTION STRIP — 4-cell dashboard */}
      <PrescriptionStrip
        exercise={exercise}
        lastTop={lastTop}
        units={units}
        accent={accent}
      />

      {/* TAB CONTROL */}
      <div style={{
        margin: '14px 20px 0',
        display: 'flex', padding: 3, borderRadius: 11,
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        {[
          { id: 'workout', label: 'Registrar' },
          { id: 'cues', label: 'Consejos', badge: exercise.tips.length },
          { id: 'swap', label: 'Alternativas', badge: exercise.alternatives.length },
          { id: 'history', label: 'Historial' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 0', border: 0, cursor: 'pointer',
            background: tab === t.id ? '#262626' : 'transparent',
            color: tab === t.id ? '#fafafa' : 'rgba(255,255,255,0.5)',
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
            borderRadius: 8,
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>
            {t.label}
            {t.badge !== undefined && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, fontWeight: 600,
                color: tab === t.id ? accent : 'rgba(255,255,255,0.35)',
                background: tab === t.id ? `${accent}1a` : 'rgba(255,255,255,0.05)',
                padding: '1px 5px', borderRadius: 9999,
                letterSpacing: 0,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'workout' && (
        <WorkoutTab
          exercise={exercise}
          log={log}
          setLog={(next) => setLogState({ ...logState, [exercise.id]: next })}
          accent={accent}
          units={units}
          lastTop={lastTop}
          nextExercise={nextExercise}
          onNext={onNext}
        />
      )}
      {tab === 'cues' && <CuesTab exercise={exercise} accent={accent} />}
      {tab === 'swap' && <SwapTab exercise={exercise} accent={accent} />}
      {tab === 'history' && <HistoryTab exercise={exercise} accent={accent} units={units} todayLog={log} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Prescription strip — 4-cell dashboard
// ─────────────────────────────────────────────────────────────
function PrescriptionStrip({ exercise, lastTop, units, accent }) {
  const cells = [
    { label: 'series', val: exercise.sets },
    { label: 'reps', val: exercise.reps },
    { label: 'desc.', val: exercise.rest + 's' },
    { label: 'última', val: lastTop > 0 ? `${lastTop}${units}` : '—', accent: lastTop > 0 },
  ];
  return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#141414',
        borderRadius: 14,
        border: '0.5px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            padding: '11px 6px',
            borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.05)' : 0,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 8.5, letterSpacing: 1.4, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', fontWeight: 600,
            }}>{c.label}</div>
            <div style={{
              marginTop: 4,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 17, fontWeight: 500,
              color: c.accent ? accent : '#fafafa',
              letterSpacing: -0.5, lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>{c.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Workout tab — log card + cue carousel + alternatives carousel
// ─────────────────────────────────────────────────────────────
function parseRepsDefault(rep) {
  if (typeof rep === 'number') return rep;
  const m = String(rep).match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!m) return 8;
  return parseInt(m[2] || m[1], 10);
}

function WorkoutTab({ exercise, log, setLog, accent, units, lastTop, nextExercise, onNext }) {
  const WEIGHT_STEP = 5;
  const defaultReps = parseRepsDefault(exercise.reps);
  const defaultSets = exercise.sets;

  const [pendingWeight, setPendingWeight] = React.useState(log.weight ?? lastTop ?? 0);
  const [pendingSets, setPendingSets] = React.useState(log.sets ?? defaultSets);
  const [pendingReps, setPendingReps] = React.useState(log.reps ?? defaultReps);
  const [trackSR, setTrackSR] = React.useState(log.sets !== undefined && log.reps !== undefined);

  React.useEffect(() => {
    setPendingWeight(log.weight ?? lastTop ?? 0);
    setPendingSets(log.sets ?? defaultSets);
    setPendingReps(log.reps ?? defaultReps);
    setTrackSR(log.sets !== undefined && log.reps !== undefined);
  }, [exercise.id]);

  const isLogged = log.weight !== undefined;
  const srInLog = log.sets !== undefined && log.reps !== undefined;
  const isDirty =
    pendingWeight !== log.weight ||
    (trackSR && (pendingSets !== log.sets || pendingReps !== log.reps)) ||
    (trackSR !== srInLog && isLogged);

  const decW = () => setPendingWeight(Math.max(0, +(pendingWeight - WEIGHT_STEP).toFixed(1)));
  const incW = () => setPendingWeight(+(pendingWeight + WEIGHT_STEP).toFixed(1));

  const save = () => setLog({
    weight: pendingWeight,
    sets: trackSR ? pendingSets : undefined,
    reps: trackSR ? pendingReps : undefined,
    loggedAt: new Date().toISOString(),
  });
  const clear = () => {
    setLog({ weight: undefined, sets: undefined, reps: undefined, loggedAt: null });
    setPendingWeight(lastTop ?? 0);
    setPendingSets(defaultSets);
    setPendingReps(defaultReps);
    setTrackSR(false);
  };

  const onWeightInput = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '');
    setPendingWeight(v === '' ? 0 : parseFloat(v));
  };

  return (
    <div>
      {/* LOG CARD — primary action */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          background: '#141414', borderRadius: 20, padding: '18px 18px 16px',
          border: `0.5px solid ${isLogged ? `${accent}33` : 'rgba(255,255,255,0.06)'}`,
          position: 'relative', overflow: 'hidden',
          boxShadow: isLogged ? `0 8px 32px ${accent}11` : '0 6px 20px rgba(0,0,0,0.2)',
        }}>
          {isLogged && (
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: accent, opacity: 0.09, filter: 'blur(60px)',
            }} />
          )}

          {/* Eyebrow */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', zIndex: 1, marginBottom: 10,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>Peso de hoy</div>
            {isLogged && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase',
                color: accent, fontWeight: 600,
                background: `${accent}1a`,
                padding: '3px 8px', borderRadius: 9999,
                whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
                Guardado
              </div>
            )}
          </div>

          {/* Weight stepper */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, position: 'relative', zIndex: 1,
          }}>
            <StepperButton onClick={decW} disabled={pendingWeight <= 0}>−</StepperButton>
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <input
                value={pendingWeight === 0 ? '' : String(pendingWeight)}
                onChange={onWeightInput}
                placeholder="0"
                inputMode="decimal"
                style={{
                  background: 'transparent', border: 0, outline: 'none',
                  textAlign: 'center', width: '100%',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 48, fontWeight: 500, color: isLogged ? accent : '#fafafa',
                  letterSpacing: -2.2, lineHeight: 1,
                  padding: 0,
                }}
              />
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9.5, letterSpacing: 1.6, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                whiteSpace: 'nowrap',
              }}>{units} <span style={{ opacity: 0.5, margin: '0 4px' }}>·</span> incrementos de {WEIGHT_STEP}{units}</div>
            </div>
            <StepperButton onClick={incW}>+</StepperButton>
          </div>

          {/* Sets & reps opt-in */}
          {!trackSR ? (
            <button
              onClick={() => setTrackSR(true)}
              style={{
                marginTop: 12, width: '100%', padding: '8px 10px',
                borderRadius: 9, cursor: 'pointer',
                background: 'transparent',
                border: '0.5px dashed rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.55)',
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 11.5, fontWeight: 500, letterSpacing: 0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                position: 'relative', zIndex: 1,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, fontWeight: 400 }}>＋</span>
              Registrar series y repeticiones
            </button>
          ) : (
            <div style={{
              marginTop: 12, position: 'relative', zIndex: 1,
              animation: 'fadeUp 0.2s ease-out',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)', fontWeight: 600,
                }}>Series y repeticiones</div>
                <button
                  onClick={() => setTrackSR(false)}
                  style={{
                    background: 'transparent', border: 0, cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'Space Grotesk, system-ui',
                    fontSize: 10.5, padding: '2px 4px',
                  }}
                >× quitar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <MiniStepper label="Series" value={pendingSets} prescribed={defaultSets}
                  min={1} max={20} onChange={setPendingSets} />
                <MiniStepper label="Reps" value={pendingReps} prescribed={exercise.reps}
                  min={1} max={50} onChange={setPendingReps} />
              </div>
            </div>
          )}

          {/* Log button — shifts to "Siguiente ejercicio" once saved cleanly */}
          {isLogged && !isDirty && nextExercise ? (
            <button
              onClick={() => onNext(nextExercise)}
              style={{
                marginTop: 14, width: '100%', padding: '14px 18px',
                borderRadius: 11, border: 0,
                cursor: 'pointer',
                background: accent,
                color: '#0a0a0a',
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: `0 8px 24px ${accent}44`,
                position: 'relative', zIndex: 1,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}>
                Siguiente · {nextExercise.name}
              </span>
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ flexShrink: 0 }}>
                <path d="M1 6h11M8 1l5 5-5 5" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : isLogged && !isDirty && !nextExercise ? (
            <button
              disabled
              style={{
                marginTop: 14, width: '100%', padding: '14px 18px',
                borderRadius: 11, border: 0,
                cursor: 'default',
                background: `${accent}22`,
                color: accent,
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                position: 'relative', zIndex: 1,
              }}
            >
              <svg width="13" height="10" viewBox="0 0 14 11" fill="none">
                <path d="M1 5.5l4 4 8-8.5" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ¡Último ejercicio! · {srInLog ? `${log.sets}×${log.reps} @ ` : ''}{log.weight}{units}
            </button>
          ) : (
            <button
              onClick={save}
              style={{
                marginTop: 14, width: '100%', padding: '14px 18px',
                borderRadius: 11, border: 0,
                cursor: 'pointer',
                background: accent,
                color: '#0a0a0a',
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: `0 6px 20px ${accent}33`,
                position: 'relative', zIndex: 1,
              }}
            >
              {isLogged && isDirty ? (
                <>Actualizar · {trackSR ? `${pendingSets}×${pendingReps} @ ` : ''}{pendingWeight}{units}</>
              ) : (
                <>Registrar · {trackSR ? `${pendingSets}×${pendingReps} @ ` : ''}{pendingWeight}{units}</>
              )}
            </button>
          )}

          {isLogged && (
            <button onClick={clear} style={{
              marginTop: 4, width: '100%', padding: '5px',
              background: 'transparent', border: 0, cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 10.5, letterSpacing: 0.2,
              position: 'relative', zIndex: 1,
            }}>Borrar registro de hoy</button>
          )}
        </div>
      </div>

      {/* FORM CUES + ALTERNATIVES now live in their own tabs — see CuesTab/SwapTab. */}
      <div style={{ height: 20 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cues tab — full vertical numbered list (no scroll-juggling)
// ─────────────────────────────────────────────────────────────
function CuesTab({ exercise, accent }) {
  return (
    <div style={{ padding: '18px 20px 30px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)', fontWeight: 600,
        marginBottom: 14,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
        Consejos de técnica
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.4 }}>
          {exercise.tips.length} consejos
        </span>
      </div>
      <ol style={{
        margin: 0, padding: 0, listStyle: 'none',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        {exercise.tips.map((tip, i) => (
          <li key={i} style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            padding: '14px 0',
            borderTop: i === 0 ? 0 : '0.5px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 22, fontWeight: 500,
              color: accent, opacity: 0.6,
              minWidth: 32, flexShrink: 0, lineHeight: 1,
              letterSpacing: -1,
              fontVariantNumeric: 'tabular-nums',
            }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{
              flex: 1, fontSize: 15, lineHeight: 1.5,
              color: 'rgba(255,255,255,0.88)',
              fontFamily: 'Space Grotesk, system-ui',
              letterSpacing: -0.1,
            }}>{tip}</div>
          </li>
        ))}
      </ol>

      <div style={{
        marginTop: 18, padding: 14,
        background: 'rgba(255,255,255,0.025)',
        borderRadius: 12,
        border: '0.5px dashed rgba(255,255,255,0.1)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{ fontSize: 18 }}>💡</div>
        <div style={{
          flex: 1, fontSize: 11.5, lineHeight: 1.45,
          color: 'rgba(255,255,255,0.55)',
        }}>
          ¿Necesitas verlo? Toca el botón <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Google</strong> o <strong style={{ color: 'rgba(255,255,255,0.85)' }}>TikTok</strong> en la foto del ejercicio arriba.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Swap tab — full-width alternative cards stacked vertically
// ─────────────────────────────────────────────────────────────
function SwapTab({ exercise, accent }) {
  return (
    <div style={{ padding: '18px 20px 30px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)', fontWeight: 600,
        marginBottom: 14,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
        ¿No puedes hacerlo? Cambia por
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.4 }}>
          {exercise.alternatives.length} opciones
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {exercise.alternatives.map((alt, i) => (
          <div key={i} style={{
            background: '#141414', borderRadius: 16,
            border: '0.5px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            display: 'flex', gap: 0,
          }}>
            <div style={{
              width: 90, flexShrink: 0,
              background: '#1a1a1a',
              backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 14px, rgba(255,255,255,0.045) 14px 28px)',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 500,
                border: `0.5px solid ${accent}33`,
              }}>↺</div>
              <div style={{
                position: 'absolute', bottom: 6, left: 6,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 8.5, letterSpacing: 1.2, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
              }}>ALT · {String(i + 1).padStart(2, '0')}</div>
            </div>
            <div style={{
              flex: 1, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 15, fontWeight: 600, color: '#fafafa',
                letterSpacing: -0.3, lineHeight: 1.2,
              }}>{alt.name}</div>
              <div style={{
                fontSize: 12, color: 'rgba(255,255,255,0.55)',
                marginTop: 5, lineHeight: 1.45,
              }}>{alt.reason}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Carousel with title + scroll-snap + page dots
// ─────────────────────────────────────────────────────────────
function CardCarousel({ title, count, accent, children, topPadding = 24 }) {
  const ref = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const total = React.Children.count(children);

  const onScroll = () => {
    if (!ref.current) return;
    const el = ref.current;
    const child = el.firstElementChild;
    if (!child) return;
    const w = child.getBoundingClientRect().width + 10; // card + gap
    setActive(Math.round(el.scrollLeft / w));
  };

  const scrollTo = (i) => {
    if (!ref.current) return;
    const el = ref.current;
    const child = el.firstElementChild;
    if (!child) return;
    const w = child.getBoundingClientRect().width + 10;
    el.scrollTo({ left: i * w, behavior: 'smooth' });
  };

  return (
    <div style={{ paddingTop: topPadding }}>
      <div style={{
        padding: '0 20px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)', fontWeight: 600,
        marginBottom: 10,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
        <span>{title}</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.4 }}>
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display: 'flex', gap: 10, padding: '0 20px',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          paddingBottom: 4,
        }}
      >
        {children}
      </div>
      {total > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10,
        }}>
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} style={{
              width: i === active ? 18 : 5, height: 5, padding: 0,
              borderRadius: 3, border: 0, cursor: 'pointer',
              background: i === active ? accent : 'rgba(255,255,255,0.18)',
              transition: 'all 0.25s',
            }} aria-label={`Go to ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Form cue card
// ─────────────────────────────────────────────────────────────
function CueCard({ index, total, text, accent }) {
  return (
    <div style={{
      flexShrink: 0, width: 260, scrollSnapAlign: 'start',
      background: '#141414', borderRadius: 16, padding: 16,
      border: '0.5px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 10,
      minHeight: 110, boxSizing: 'border-box',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: 1.4,
      }}>
        <span style={{
          color: accent, fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}>CUE {String(index).padStart(2, '0')}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>/ {String(total).padStart(2, '0')}</span>
      </div>
      <div style={{
        flex: 1, fontSize: 13.5, lineHeight: 1.5,
        color: 'rgba(255,255,255,0.85)',
        fontFamily: 'Space Grotesk, system-ui',
      }}>{text}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Alternative exercise card
// ─────────────────────────────────────────────────────────────
function AltCard({ index, alt, accent }) {
  return (
    <div style={{
      flexShrink: 0, width: 240, scrollSnapAlign: 'start',
      background: '#141414', borderRadius: 16,
      border: '0.5px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: 84, position: 'relative',
        background: '#1a1a1a',
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 16px, rgba(255,255,255,0.045) 16px 32px)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, letterSpacing: 1.2,
          color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
          position: 'absolute', top: 10, left: 12,
        }}>ALT · {String(index).padStart(2, '0')}</div>
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
          color: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'absolute', top: 10, right: 10,
          fontSize: 14, fontWeight: 500,
          border: `0.5px solid ${accent}33`,
        }}>↺</div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 14, fontWeight: 600, color: '#fafafa',
          letterSpacing: -0.3, lineHeight: 1.2,
        }}>{alt.name}</div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.5)',
          marginTop: 5, lineHeight: 1.4,
        }}>{alt.reason}</div>
      </div>
    </div>
  );
}

function StepperButton({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 54, height: 54, borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      color: disabled ? 'rgba(255,255,255,0.2)' : '#fafafa',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 28, fontWeight: 400, cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, padding: 0, lineHeight: 1,
      transition: 'all 0.15s, transform 0.08s',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.92)'; }}
    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >{children}</button>
  );
}

function MiniStepper({ label, value, prescribed, min = 0, max = 99, onChange }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '0.5px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: '8px 8px 8px 11px',
      display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}>{label}</div>
        <div style={{
          marginTop: 2,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 20, fontWeight: 500, color: '#fafafa',
          lineHeight: 1, letterSpacing: -0.5,
        }}>{value}</div>
        {prescribed !== undefined && (
          <div style={{
            marginTop: 2,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>plan · {prescribed}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <MiniBtn onClick={inc} disabled={value >= max}>+</MiniBtn>
        <MiniBtn onClick={dec} disabled={value <= min}>−</MiniBtn>
      </div>
    </div>
  );
}

function MiniBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 24, borderRadius: 6,
      background: 'rgba(255,255,255,0.06)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      color: disabled ? 'rgba(255,255,255,0.2)' : '#fafafa',
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14, fontWeight: 400, cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 0, lineHeight: 1,
      transition: 'all 0.15s',
      opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// History tab — stats, chart, sessions
// ─────────────────────────────────────────────────────────────
function HistoryTab({ exercise, accent, units, todayLog }) {
  const baseData = exercise.history;
  const todayWeight = todayLog?.weight;
  const data = todayWeight !== undefined
    ? [...baseData, {
        date: 'Hoy',
        top: todayWeight,
        loggedSets: todayLog.sets,
        loggedReps: todayLog.reps,
      }]
    : baseData;

  const allTime = Math.max(...data.map(h => h.top));
  const first = data[0].top;
  const last = data[data.length - 1].top;
  const totalGain = last - first;
  const pct = first ? ((totalGain / first) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
        }}>
          {[
            { label: 'Máx total', val: allTime, color: accent },
            { label: 'Actual', val: last, color: '#fafafa' },
            { label: 'Δ 6 sem.', val: (totalGain >= 0 ? '+' : '') + totalGain.toFixed(1), color: totalGain >= 0 ? accent : '#ff6b6b' },
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

      <div style={{ padding: '14px 20px 0' }}>
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
            }}>Peso por sesión</div>
            <Chip>{pct >= 0 ? '+' : ''}{pct}%</Chip>
          </div>
          <LineChart data={data} width={324} height={170} color={accent} unit={units} />
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)', fontWeight: 600,
          marginBottom: 10,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
          Sesiones anteriores
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...data].reverse().map((sess, i) => {
            const idx = data.length - 1 - i;
            const prev = idx > 0 ? data[idx - 1].top : null;
            const delta = prev !== null ? +(sess.top - prev).toFixed(1) : null;
            const isPR = sess.top === allTime;
            const isToday = sess.date === 'Hoy';
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
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12, color: isToday ? accent : 'rgba(255,255,255,0.7)',
                      letterSpacing: 0.4,
                      textTransform: isToday ? 'uppercase' : 'none',
                      fontWeight: isToday ? 600 : 400,
                    }}>{sess.date}</div>
                    {isToday && sess.loggedSets && sess.loggedReps && (
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4,
                      }}>{sess.loggedSets}×{sess.loggedReps}</div>
                    )}
                  </div>
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
                    }}>— mantén</div>
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
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { ExerciseDetail });
