// screens.jsx — Plan, History list, You/Settings screens

// ─────────────────────────────────────────────────────────────
// Plan — week selector + day grid
// ─────────────────────────────────────────────────────────────
function PlanScreen({ ctx, onOpenExercise }) {
  const { accent, units } = ctx;
  const PROGRAM = window.PROGRAM;
  const activeWeeks = ctx.activeWeeks; // number from tweak
  const weeks = PROGRAM.weeks.slice(0, activeWeeks);
  const [weekIdx, setWeekIdx] = React.useState(ctx.weekIdx);
  const week = weeks[weekIdx] || weeks[0];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>Your program</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>Plan.</div>
      </div>

      {/* Week tabs */}
      <div style={{ padding: '0 20px', display: 'flex', gap: 8, marginBottom: 18 }}>
        {weeks.map((w, i) => (
          <button key={w.id} onClick={() => setWeekIdx(i)} style={{
            flex: 1, padding: '12px 8px', border: 0, cursor: 'pointer',
            background: weekIdx === i ? '#1f1f1f' : 'transparent',
            border: weekIdx === i ? `0.5px solid ${w.accent}66` : '0.5px solid rgba(255,255,255,0.06)',
            borderRadius: 14, color: weekIdx === i ? '#fafafa' : 'rgba(255,255,255,0.5)',
            textAlign: 'left',
            position: 'relative',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, letterSpacing: 1.4, color: weekIdx === i ? w.accent : 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
            }}>{w.tag}</div>
            <div style={{
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 15, fontWeight: 700, marginTop: 2, letterSpacing: -0.3,
            }}>{w.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
              {w.subtitle}
            </div>
          </button>
        ))}
      </div>

      {/* Days */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {week.days.map((day, i) => {
          const isToday = i === ctx.dayIndex && weekIdx === ctx.weekIdx;
          const isRest = day.name === "Rest";
          return (
            <div key={i} style={{
              background: '#141414',
              borderRadius: 18, padding: 16,
              border: isToday ? `1px solid ${week.accent}` : '0.5px solid rgba(255,255,255,0.06)',
              position: 'relative',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <div style={{
                width: 42, height: 42, flexShrink: 0,
                borderRadius: 12, background: isRest ? 'rgba(155,209,255,0.1)' : 'rgba(255,255,255,0.05)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: isToday ? `0.5px solid ${week.accent}` : '0.5px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 8, letterSpacing: 1.2,
                  color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
                }}>{dayNames[i]}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 16, fontWeight: 500, color: '#fafafa', lineHeight: 1,
                }}>{i + 1}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, system-ui',
                    fontSize: 16, fontWeight: 600, color: '#fafafa',
                    letterSpacing: -0.3,
                  }}>{day.name}</div>
                  {isToday && <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: week.accent,
                    boxShadow: `0 0 6px ${week.accent}`,
                  }} />}
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{day.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {!isRest && (
                  <>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 14, color: '#fafafa', fontWeight: 500,
                    }}>{day.exercises.length}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.4)', marginTop: 1,
                    }}>{day.duration}m</div>
                  </>
                )}
                {isRest && (
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
                    color: '#9bd1ff',
                  }}>REST</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// History list — all exercises across program, with last weight + spark
// ─────────────────────────────────────────────────────────────
function HistoryScreen({ ctx, onOpenExercise }) {
  const { accent, units } = ctx;
  const PROGRAM = window.PROGRAM;
  // Unique exercises by name (first occurrence) from week A
  const exercises = [];
  const seen = new Set();
  PROGRAM.weeks[0].days.forEach(d => {
    d.exercises?.forEach(e => {
      if (!seen.has(e.name)) {
        seen.add(e.name);
        exercises.push(e);
      }
    });
  });

  const [filter, setFilter] = React.useState("All");
  const muscles = ["All", ...new Set(exercises.map(e => e.muscle.split(' ')[0]))];
  const filtered = filter === "All" ? exercises : exercises.filter(e => e.muscle.startsWith(filter));

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>Lifting history</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>Progress.</div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 20px 16px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {muscles.map(m => (
          <button key={m} onClick={() => setFilter(m)} style={{
            flexShrink: 0, padding: '6px 12px', borderRadius: 9999,
            border: 0, cursor: 'pointer',
            background: filter === m ? accent : 'rgba(255,255,255,0.05)',
            color: filter === m ? '#0a0a0a' : 'rgba(255,255,255,0.7)',
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
          }}>{m}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(e => {
          const last = e.history[e.history.length - 1]?.top || 0;
          const first = e.history[0]?.top || 0;
          const delta = last - first;
          const allTime = Math.max(...e.history.map(h => h.top));
          return (
            <button key={e.id} onClick={() => onOpenExercise(e)} style={{
              background: '#141414', borderRadius: 16, padding: 14,
              border: '0.5px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
              color: 'inherit',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Space Grotesk, system-ui',
                  fontSize: 14, fontWeight: 600, color: '#fafafa',
                  letterSpacing: -0.3, lineHeight: 1.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{e.name}</div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2,
                }}>{e.muscle}</div>
              </div>
              <Sparkline data={e.history} width={70} height={26} color={delta >= 0 ? accent : '#ff6b6b'} />
              <div style={{ textAlign: 'right', minWidth: 56 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 16, fontWeight: 500, color: '#fafafa',
                  letterSpacing: -0.3,
                }}>{last}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 1 }}>{units}</span></div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9, letterSpacing: 0.6,
                  color: delta >= 0 ? accent : '#ff6b6b', marginTop: 1,
                }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// You — stats and quick settings
// ─────────────────────────────────────────────────────────────
function YouScreen({ ctx }) {
  const { accent, units, activeWeeks } = ctx;
  const PROGRAM = window.PROGRAM;

  // Aggregate stats
  let totalSessions = 0, totalVolume = 0, prCount = 0;
  const exercisesSeen = new Set();
  PROGRAM.weeks[0].days.forEach(d => {
    d.exercises?.forEach(e => {
      if (exercisesSeen.has(e.name)) return;
      exercisesSeen.add(e.name);
      totalSessions += e.history.length;
      e.history.forEach((h, i) => {
        h.sets.forEach(s => { totalVolume += s.w * s.r; });
        const all = Math.max(...e.history.map(x => x.top));
        if (h.top === all && i === e.history.length - 1) prCount += 1;
      });
    });
  });
  totalVolume = Math.round(totalVolume);

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>Profile</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>Pedro.</div>
      </div>

      {/* Stats grid */}
      <div style={{
        padding: '0 20px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <StatCard accent={accent} label="Active program" big={`${activeWeeks}wk`} sub="rotation" />
        <StatCard accent={accent} label="Sessions / week" big="6" sub="Sun rest" />
        <StatCard accent={accent} label="Volume (last 6w)" big={(totalVolume / 1000).toFixed(1) + 'k'} sub={`${units} · sets × reps × weight`} />
        <StatCard accent={accent} label="Active PRs" big={prCount} sub="last session = best" />
      </div>

      {/* Settings */}
      <div style={{ marginTop: 26, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Quick settings</SectionLabel>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: '#141414', borderRadius: 18, padding: 4,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          <SettingsRow label="Units" value={units === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'} />
          <SettingsRow label="Rotation" value={`${activeWeeks} weeks`} />
          <SettingsRow label="Split" value="Push / Pull / Legs" />
          <SettingsRow label="Theme" value="Dark" last />
        </div>
        <div style={{
          marginTop: 14, padding: 16,
          background: 'rgba(212,255,58,0.04)',
          borderRadius: 14,
          border: `0.5px solid ${accent}22`,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 10,
            background: `${accent}22`, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>✦</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fafafa' }}>Open the Tweaks panel</strong> (top toolbar) to switch rotation length, units, accent color, and theme.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, big, sub, accent }) {
  return (
    <div style={{
      background: '#141414', borderRadius: 18, padding: 16,
      border: '0.5px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, letterSpacing: 1.4, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
      }}>{label}</div>
      <div style={{
        marginTop: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 28, fontWeight: 500, color: '#fafafa',
        letterSpacing: -1, lineHeight: 1,
      }}>{big}</div>
      <div style={{
        marginTop: 6, fontSize: 10.5,
        color: 'rgba(255,255,255,0.5)',
      }}>{sub}</div>
    </div>
  );
}

function SettingsRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      borderBottom: last ? 0 : '0.5px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        fontFamily: 'Space Grotesk, system-ui',
        fontSize: 13.5, color: '#fafafa', fontWeight: 500,
      }}>{label}</div>
      <div style={{
        fontSize: 12, color: 'rgba(255,255,255,0.55)',
        fontFamily: 'JetBrains Mono, monospace',
      }}>{value}</div>
    </div>
  );
}

Object.assign(window, { PlanScreen, HistoryScreen, YouScreen });
