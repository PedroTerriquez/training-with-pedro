// today.jsx — Today screen with warm-up + workout + stretch as a single flow

function TodayScreen({ ctx, onOpenExercise }) {
  const { day, weekObj, dayIndex, weekDayName, dateStr, accent, units, logState, dayState, setDayState } = ctx;
  if (day.name === "Descanso") return <RestDay ctx={ctx} />;

  // Did today's workout get rescheduled from another weekday?
  const movedFrom = ctx.order && ctx.order[dayIndex] !== dayIndex ? ctx.order[dayIndex] : null;
  const DAYS_LONG = window.PROGRAM_DAYS_LONG || [];

  // Day-level state for warmup/stretch (keyed by week+day)
  const dayKey = `${weekObj.id}-${dayIndex}`;
  const state = dayState[dayKey] || { warmupDone: false, stretchDone: false, startedAt: null, endedAt: null };
  const setState = (next) => setDayState({ ...dayState, [dayKey]: { ...state, ...next } });

  const warmup = window.WARMUPS[day.name];
  const stretch = window.STRETCHES[day.name];

  // Progress accounting: warmup + exercises + stretch
  const exDone = day.exercises.filter(e => logState[e.id]?.weight !== undefined).length;
  const totalSteps = (warmup ? 1 : 0) + day.exercises.length + (stretch ? 1 : 0);
  const doneSteps = (state.warmupDone ? 1 : 0) + exDone + (state.stretchDone ? 1 : 0);
  const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  // ── Session timer ────────────────────────────────────────────
  // Auto-start when the first step gets done; auto-stop when all done.
  React.useEffect(() => {
    if (doneSteps > 0 && !state.startedAt) {
      setState({ startedAt: Date.now() });
    }
  }, [doneSteps, state.startedAt]);

  React.useEffect(() => {
    if (totalSteps > 0 && doneSteps === totalSteps && state.startedAt && !state.endedAt) {
      setState({ endedAt: Date.now() });
    }
    // If user un-does a step after finishing, clear endedAt to resume tracking
    if (state.endedAt && doneSteps < totalSteps) {
      setState({ endedAt: null });
    }
  }, [doneSteps, totalSteps, state.startedAt, state.endedAt]);

  const resetTimer = () => setState({ startedAt: null, endedAt: null });

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 12px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>{dateStr}</div>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginTop: 4,
        }}>
          <div style={{
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 38, fontWeight: 700, color: '#fafafa',
            letterSpacing: -1.5, lineHeight: 1,
          }}>{weekDayName}.</div>
          <Chip color="rgba(212,255,58,0.12)" text={accent}>
            {weekObj.name} · {weekObj.tag}
          </Chip>
        </div>
      </div>

      {/* Hero — title + progress ring */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: 1.6, color: accent,
              textTransform: 'uppercase', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: accent,
                boxShadow: `0 0 8px ${accent}`,
                animation: 'pulse 2s infinite',
              }} />
              Sesión de hoy
            </div>
            <div style={{
              marginTop: 6,
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 34, fontWeight: 700, color: '#fafafa',
              letterSpacing: -1.2, lineHeight: 1.02,
            }}>{day.name}</div>
            <div style={{
              marginTop: 6, fontSize: 13.5, color: 'rgba(255,255,255,0.55)',
            }}>{day.subtitle}</div>
            {movedFrom !== null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 9, padding: '4px 10px', borderRadius: 9999,
                background: `${accent}18`, border: `0.5px solid ${accent}3a`,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase',
                color: accent, fontWeight: 600,
              }}>↔ Reprogramado · lo de {DAYS_LONG[movedFrom]}</div>
            )}
          </div>

          {/* Progress ring + Timer ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <ProgressRing pct={pct} done={doneSteps} total={totalSteps} accent={accent} />
            <TimerRing
              startedAt={state.startedAt}
              endedAt={state.endedAt}
              accent={accent}
              complete={totalSteps > 0 && doneSteps === totalSteps}
              onReset={resetTimer}
            />
          </div>
        </div>
      </div>

      {/* WARM-UP — first card in the flow */}
      {warmup && (
        <FlowSection accent={accent} kind="warmup">
          <PhaseCard
            kind="warmup"
            phase="01"
            title="Calentamiento"
            subtitle={`${warmup.duration} min · dinámico`}
            accent="#9bd1ff"
            movements={warmup.movements}
            done={state.warmupDone}
            onToggle={() => setState({ warmupDone: !state.warmupDone })}
          />
        </FlowSection>
      )}

      {/* MAIN WORKOUT — gated behind warmup */}
      <FlowSection accent={accent} kind="work">
        <div style={{
          padding: '0 20px', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
          <span>Fase 02 · Entrenamiento</span>
          <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.4 }}>
            {exDone} / {day.exercises.length}
          </span>
        </div>
        {warmup && !state.warmupDone ? (
          <LockedPhase
            onUnlock={() => {/* user must complete warmup */}}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
            {day.exercises.map((e, i) => (
              <ExerciseRow
                key={e.id}
                exercise={e}
                onOpen={() => onOpenExercise(e)}
                accent={accent}
                units={units}
                loggedWeight={logState[e.id]?.weight}
              />
            ))}
          </div>
        )}
      </FlowSection>

      {/* COOL-DOWN STRETCH — gated behind workout */}
      {stretch && (
        <FlowSection accent={accent} kind="stretch">
          {exDone < day.exercises.length ? (
            <>
              <div style={{
                padding: '0 20px', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)', fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c89bff' }} />
                <span>Fase 03 · Estiramiento</span>
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.4 }}>
                  {exDone} / {day.exercises.length}
                </span>
              </div>
              <LockedPhase
                title="Termina el entrenamiento primero"
                detail="Tus estiramientos aparecerán cuando completes todos los ejercicios."
              />
            </>
          ) : (
            <PhaseCard
              kind="stretch"
              phase="03"
              title="Estiramiento"
              subtitle={`${stretch.duration} min · estático`}
              accent="#c89bff"
              movements={stretch.movements}
              done={state.stretchDone}
              onToggle={() => setState({ stretchDone: !state.stretchDone })}
            />
          )}
        </FlowSection>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Timer ring — compact circular timer that sits next to ProgressRing
// Idle: subtle clock glyph. Running: live MM:SS with pulse. Complete: accent.
// Long-press (or alt-click) to reset.
// ─────────────────────────────────────────────────────────────
function TimerRing({ startedAt, endedAt, accent, complete, onReset, size = 64 }) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Idle ring
  if (!startedAt) {
    return (
      <div style={{
        width: size, height: size, position: 'relative', flexShrink: 0,
        borderRadius: '50%',
        border: '0.5px dashed rgba(255,255,255,0.12)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7.6" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <path d="M7 5.2V7.6l1.7 1.1" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5.5 1.5h3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div style={{
          marginTop: 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}>Listo</div>
      </div>
    );
  }

  const endTs = endedAt || now;
  const elapsedMs = Math.max(0, endTs - startedAt);
  const totalSec = Math.floor(elapsedMs / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const display = hh > 0 ? `${hh}:${pad(mm)}` : `${pad(mm)}:${pad(ss)}`;

  // Ring fill — sweeps every 60 minutes for a subtle visual rhythm
  const sweepPct = (totalSec % 3600) / 3600;
  const dash = sweepPct * c;

  const ringColor = complete && endedAt ? accent : `${accent}cc`;
  const labelColor = complete && endedAt ? accent : 'rgba(255,255,255,0.45)';
  const labelText = complete && endedAt ? 'Total' : 'Tiempo';

  return (
    <button
      onClick={(e) => { if (e.altKey || (complete && endedAt)) onReset(); }}
      title={complete && endedAt ? 'Clic para reiniciar' : 'Alt+clic para reiniciar'}
      style={{
        width: size, height: size, position: 'relative', flexShrink: 0,
        background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
        color: 'inherit',
      }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={complete && endedAt ? `${accent}33` : 'rgba(255,255,255,0.08)'}
          strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={ringColor} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={complete && endedAt ? `${c} 0` : `${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.6s linear' }}
        />
      </svg>

      {/* Pulsing dot when running */}
      {!endedAt && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          width: 6, height: 6, borderRadius: '50%', background: accent,
          boxShadow: `0 0 6px ${accent}`,
          animation: 'pulse 1.4s infinite',
        }} />
      )}

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13, fontWeight: 500, color: '#fafafa',
          letterSpacing: -0.4, lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>{display}</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase',
          color: labelColor, marginTop: 3,
        }}>{labelText}</div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Progress ring — circular indicator
// ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, done, total, accent, size = 64 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div style={{
      width: size, height: size, position: 'relative', flexShrink: 0,
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={accent} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: 'stroke-dasharray 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14, fontWeight: 500, color: '#fafafa',
          letterSpacing: -0.4, lineHeight: 1,
        }}>{done}<span style={{ color: 'rgba(255,255,255,0.35)' }}>/{total}</span></div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)', marginTop: 2,
        }}>{pct}%</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Flow section wrapper — just adds top padding between phases
// ─────────────────────────────────────────────────────────────
function FlowSection({ children }) {
  return <div style={{ paddingTop: 22 }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
// Locked phase — shown when prerequisites aren't done
// ─────────────────────────────────────────────────────────────
function LockedPhase({ title, detail }) {
  return (
    <div style={{
      margin: '0 20px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: 18, padding: '18px 16px',
      border: '0.5px dashed rgba(255,255,255,0.12)',
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
          <path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.45)" strokeWidth="1.4" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
          letterSpacing: -0.2, lineHeight: 1.3,
        }}>{title || 'Termina el calentamiento primero'}</div>
        <div style={{
          fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 3,
          lineHeight: 1.4,
        }}>{detail || 'Tus ejercicios aparecerán aquí cuando marques la Fase 01 como hecha.'}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phase card — used for warm-up and cool-down
// ─────────────────────────────────────────────────────────────
function PhaseCard({ kind, phase, title, subtitle, accent, movements, done, onToggle }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{
      margin: '0 20px',
      background: '#141414',
      borderRadius: 18,
      border: done ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'border-color 0.2s',
    }}>
      {/* Accent stripe on left when done */}
      {done && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0,
          width: 2, background: accent,
        }} />
      )}

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 16px',
          background: 'transparent', border: 0, cursor: 'pointer',
          color: 'inherit', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        {/* Phase glyph */}
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: done ? `${accent}22` : 'rgba(255,255,255,0.04)',
          border: done ? `0.5px solid ${accent}44` : '0.5px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}>
          {done ? (
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path d="M1 7l5.5 5.5L17 1.5" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <KindGlyph kind={kind} color={accent} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
            color: done ? accent : 'rgba(255,255,255,0.45)',
            fontWeight: 600,
          }}>
            <span>Fase {phase}</span>
            {done && <span style={{ color: accent }}>· Completa</span>}
          </div>
          <div style={{
            marginTop: 3,
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 16, fontWeight: 600, color: '#fafafa',
            letterSpacing: -0.3, lineHeight: 1.2,
          }}>{title}</div>
          <div style={{
            fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2,
            whiteSpace: 'nowrap',
          }}>{subtitle} · {movements.length} movimientos</div>
        </div>

        {/* Chevron — direction reflects open state */}
        <div style={{
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Movement list — collapsible */}
      {open && (
        <div style={{
          padding: '0 16px 14px',
          animation: 'fadeUp 0.2s ease-out',
        }}>
          <div style={{
            borderTop: '0.5px solid rgba(255,255,255,0.05)',
            paddingTop: 8,
          }}>
            {movements.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '8px 0',
                borderBottom: i < movements.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 0,
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10, color: accent, opacity: 0.7,
                  fontWeight: 500, paddingTop: 2,
                  width: 18, flexShrink: 0,
                }}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, system-ui',
                    fontSize: 13.5, fontWeight: 500, color: '#fafafa',
                    letterSpacing: -0.1, lineHeight: 1.25,
                  }}>{m.name}</div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2,
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: 0.2,
                  }}>{m.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Mark done button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            style={{
              marginTop: 12, width: '100%', padding: '10px',
              borderRadius: 10, border: 0, cursor: 'pointer',
              background: done ? 'transparent' : accent,
              color: done ? accent : '#0a0a0a',
              border: done ? `0.5px solid ${accent}55` : 0,
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.2s',
            }}
          >
            {done ? (
              <>↺ Deshacer</>
            ) : (
              <>✓ Marcar {kind === 'warmup' ? 'calentamiento' : 'estiramiento'} como hecho</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function KindGlyph({ kind, color }) {
  if (kind === 'warmup') {
    // Flame-ish
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 17.5c3.31 0 6-2.69 6-6 0-2.5-1.5-4.5-3-6-1 1.5-2 2-2 2s-1-2.5-1-5c-2 1.5-6 4-6 9 0 3.31 2.69 6 6 6z"
          stroke={color} strokeWidth="1.6" strokeLinejoin="round"
          fill={color} fillOpacity="0.12" />
      </svg>
    );
  }
  // stretch: leaf-ish / yoga
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 17c3.5-2 7-5 7-9 0-1-.5-2-1.5-3-3 2-7 4-7 9 0 1 .5 2 1.5 3z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"
        fill={color} fillOpacity="0.12" />
      <path d="M10 17c-3.5-2-7-5-7-9 0-1 .5-2 1.5-3 3 2 7 4 7 9 0 1-.5 2-1.5 3z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"
        fill={color} fillOpacity="0.05" />
    </svg>
  );
}

function ExerciseRow({ exercise, onOpen, accent, units, loggedWeight }) {
  const lastTop = exercise.history[exercise.history.length - 1]?.top;
  const isLogged = loggedWeight !== undefined && loggedWeight !== "";
  const displayWeight = isLogged ? loggedWeight : lastTop;
  const weightColor = isLogged ? accent : 'rgba(255,255,255,0.55)';
  const weightLabel = isLogged ? 'hoy' : 'última';

  return (
    <button onClick={onOpen} style={{
      background: '#141414',
      borderRadius: 18, padding: 14, border: '0.5px solid rgba(255,255,255,0.06)',
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', alignItems: 'stretch', gap: 14,
      color: 'inherit',
      position: 'relative',
      transition: 'border-color 0.2s',
      borderColor: isLogged ? `${accent}33` : 'rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 64, height: 64, flexShrink: 0,
        borderRadius: 12, position: 'relative', overflow: 'hidden',
        background: '#1c1c1c',
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 12px, rgba(255,255,255,0.05) 12px 24px)',
        border: '0.5px solid rgba(255,255,255,0.04)',
      }}>
        {isLogged && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 16, height: 16, borderRadius: '50%',
            background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 12px ${accent}66`,
          }}>
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5l2.5 2.5L8 1" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 16, fontWeight: 600, color: '#fafafa',
          letterSpacing: -0.3, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{exercise.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
          {exercise.muscle}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', justifyContent: 'center', gap: 4,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22, fontWeight: 500, color: '#fafafa',
          letterSpacing: -0.8, lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          {exercise.sets}<span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 3px' }}>×</span>{exercise.reps}
        </div>
        {displayWeight !== undefined && displayWeight !== 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, color: weightColor,
            letterSpacing: 0.2, whiteSpace: 'nowrap',
            fontWeight: isLogged ? 500 : 400,
          }}>
            <span>{displayWeight}{units}</span>
            <span style={{
              fontSize: 8, letterSpacing: 1.2, textTransform: 'uppercase',
              color: isLogged ? weightColor : 'rgba(255,255,255,0.35)',
              opacity: 0.8,
            }}>{weightLabel}</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Rest day — unchanged
// ─────────────────────────────────────────────────────────────
function RestDay({ ctx }) {
  const { weekObj, weekDayName, dateStr, accent } = ctx;
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 0' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>{dateStr}</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>{weekDayName}.</div>
      </div>

      <div style={{ padding: 20, marginTop: 8 }}>
        <div style={{
          padding: 28, borderRadius: 24,
          background: 'linear-gradient(155deg, #1a1a1a 0%, #0e0e0e 100%)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: '#9bd1ff', opacity: 0.1, filter: 'blur(60px)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Chip color="rgba(155,209,255,0.15)" text="#9bd1ff">DESCANSO</Chip>
            <div style={{
              marginTop: 12,
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 30, fontWeight: 700, color: '#fafafa',
              letterSpacing: -1, lineHeight: 1.1,
            }}>La recuperación es donde creces.</div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              Sin pesas hoy. Tómalo con calma y prepara tu cuerpo para {weekObj.name === "Semana C" ? "la Semana A" : "la próxima sesión"}.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, marginBottom: 12 }}>
        <SectionLabel accent="#9bd1ff">Lista de recuperación</SectionLabel>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
        {window.RECOVERY_TIPS.map((tip, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, padding: 14,
            background: '#141414', borderRadius: 16,
            border: '0.5px solid rgba(255,255,255,0.06)',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: 26 }}>{tip.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 15, fontWeight: 600, color: '#fafafa',
              }}>{tip.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                {tip.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TodayScreen, ExerciseRow, RestDay, ProgressRing, PhaseCard, TimerRing });
