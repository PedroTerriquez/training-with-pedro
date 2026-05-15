// today.jsx — Today screen (slim hero, focused exercise rows) + Rest day

function TodayScreen({ ctx, onOpenExercise }) {
  const { day, weekObj, dayIndex, weekDayName, dateStr, accent, units, logState } = ctx;
  if (day.name === "Rest") return <RestDay ctx={ctx} />;

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

      {/* Slim hero — eyebrow + title + muscle subtitle */}
      <div style={{ padding: '8px 20px 4px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 1.6, color: accent,
          textTransform: 'uppercase', fontWeight: 600,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: accent,
            boxShadow: `0 0 8px ${accent}`,
            animation: 'pulse 2s infinite',
          }} />
          Today's session
        </div>
        <div style={{
          marginTop: 6,
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 34, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.2, lineHeight: 1.02,
        }}>{day.name} Day</div>
        <div style={{
          marginTop: 6, fontSize: 13.5, color: 'rgba(255,255,255,0.55)',
        }}>{day.subtitle}</div>
      </div>

      {/* Exercises list */}
      <div style={{ marginTop: 28, marginBottom: 12 }}>
        <SectionLabel accent={accent}>Exercises</SectionLabel>
      </div>
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
    </div>
  );
}

function ExerciseRow({ exercise, onOpen, accent, units, loggedWeight }) {
  const lastTop = exercise.history[exercise.history.length - 1]?.top;
  const isLogged = loggedWeight !== undefined && loggedWeight !== "";
  const displayWeight = isLogged ? loggedWeight : lastTop;
  const weightColor = isLogged ? accent : 'rgba(255,255,255,0.55)';
  const weightLabel = isLogged ? 'today' : 'last';

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
      {/* Thumbnail (no index number) */}
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

      {/* Body */}
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

      {/* Right column — big sets×reps + weight caption */}
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
// Rest day
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
            <Chip color="rgba(155,209,255,0.15)" text="#9bd1ff">REST DAY</Chip>
            <div style={{
              marginTop: 12,
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 30, fontWeight: 700, color: '#fafafa',
              letterSpacing: -1, lineHeight: 1.1,
            }}>Recovery is where you grow.</div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              No lifting today. Take it easy and prep your body for {weekObj.name === "Week C" ? "Week A" : "next session"}.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, marginBottom: 12 }}>
        <SectionLabel accent="#9bd1ff">Recovery checklist</SectionLabel>
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

Object.assign(window, { TodayScreen, ExerciseRow, RestDay });
