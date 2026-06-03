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
  const [editing, setEditing] = React.useState(false);
  const week = weeks[weekIdx] || weeks[0];

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Reschedule is current-week-only.
  const order = ctx.order;
  const changes = order.reduce((n, v, i) => n + (v !== i ? 1 : 0), 0);
  const enterEdit = () => { setWeekIdx(ctx.weekIdx); setEditing(true); };

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{
        padding: '56px 20px 16px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
          }}>{editing ? 'Reprogramar' : 'Tu programa'}</div>
          <div style={{
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 38, fontWeight: 700, color: '#fafafa',
            letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
          }}>{editing ? 'Mover.' : 'Plan.'}</div>
        </div>
        <button
          onClick={() => (editing ? setEditing(false) : enterEdit())}
          style={{
            flexShrink: 0, padding: '9px 15px', borderRadius: 9999, cursor: 'pointer',
            border: editing ? 0 : `0.5px solid ${accent}55`,
            background: editing ? accent : 'transparent',
            color: editing ? '#0a0a0a' : accent,
            fontFamily: 'Space Grotesk, system-ui', fontSize: 13, fontWeight: 700,
            letterSpacing: -0.1, display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 2,
          }}
        >
          {editing ? 'Listo' : (
            <>
              <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
                <path d="M11.5 2.5l3 3-3 3M14 5.5H5.5a3 3 0 00-3 3M5.5 14.5l-3-3 3-3M3 11.5h8.5a3 3 0 003-3"
                  stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reprogramar
            </>
          )}
        </button>
      </div>

      {editing && <ReschedulePlan ctx={ctx} />}

      {!editing && (<>

      {changes > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 14 }}>
          <button onClick={enterEdit} style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: `${accent}0d`, border: `0.5px solid ${accent}33`,
            borderRadius: 14, padding: '11px 14px',
            display: 'flex', alignItems: 'center', gap: 10, color: 'inherit',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: accent,
              boxShadow: `0 0 7px ${accent}`, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk, system-ui',
                fontSize: 13, fontWeight: 600, color: '#fafafa', letterSpacing: -0.2,
              }}>Semana reprogramada · {changes} {changes === 1 ? 'cambio' : 'cambios'}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>
                Temporal · se reinicia el lunes
              </div>
            </div>
            <span style={{
              fontFamily: 'Space Grotesk, system-ui', fontSize: 12, fontWeight: 700,
              color: accent, flexShrink: 0,
            }}>Editar</span>
          </button>
        </div>
      )}

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
        {week.days.map((_, i) => {
          const isCurrentWeek = weekIdx === ctx.weekIdx;
          const originalIdx = isCurrentWeek ? order[i] : i;
          const day = week.days[originalIdx];
          const isMoved = isCurrentWeek && originalIdx !== i;
          const isToday = i === ctx.dayIndex && isCurrentWeek;
          const isRest = day.name === "Descanso";
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
                {isMoved && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    marginTop: 6, padding: '3px 8px', borderRadius: 9999,
                    background: `${week.accent}18`, border: `0.5px solid ${week.accent}3a`,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase',
                    color: week.accent, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>↔ desde {dayNames[originalIdx]}</div>
                )}
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
                  }}>DESC</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>)}
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

  const [filter, setFilter] = React.useState("Todos");
  const muscles = ["Todos", ...new Set(exercises.map(e => e.muscle.split(' ')[0]))];
  const filtered = filter === "Todos" ? exercises : exercises.filter(e => e.muscle.startsWith(filter));

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '56px 20px 16px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.6, color: 'rgba(255,255,255,0.45)',
          textTransform: 'uppercase',
        }}>Historial de pesas</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>Progreso.</div>
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
        }}>Perfil</div>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 38, fontWeight: 700, color: '#fafafa',
          letterSpacing: -1.5, lineHeight: 1, marginTop: 4,
        }}>Pedro.</div>
      </div>

      {/* AI program generator */}
      <div style={{ padding: '0 20px 4px' }}>
        <ProgramGenerator accent={accent} onResult={ctx.openProgramResult} />
      </div>

      <div style={{ margin: '24px 0 10px' }}>
        <SectionLabel accent={accent}>Tu resumen</SectionLabel>
      </div>

      {/* Stats grid */}
      <div style={{
        padding: '0 20px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <StatCard accent={accent} label="Programa activo" big={`${activeWeeks}sem`} sub="rotación" />
        <StatCard accent={accent} label="Sesiones / semana" big="6" sub="Descanso dom" />
        <StatCard accent={accent} label="Volumen (últ. 6 sem.)" big={(totalVolume / 1000).toFixed(1) + 'k'} sub={`${units} · series × reps × peso`} />
        <StatCard accent={accent} label="PRs activos" big={prCount} sub="última sesión = mejor" />
      </div>

      {/* Settings */}
      <div style={{ marginTop: 26, marginBottom: 10 }}>
        <SectionLabel accent={accent}>Ajustes rápidos</SectionLabel>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: '#141414', borderRadius: 18, padding: 4,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          <SettingsRow label="Unidades" value={units === 'kg' ? 'Kilogramos (kg)' : 'Libras (lb)'} />
          <SettingsRow label="Rotación" value={`${activeWeeks} semanas`} />
          <SettingsRow label="División" value="Empuje / Tirón / Piernas" />
          <SettingsRow label="Tema" value="Oscuro" last />
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
            <strong style={{ color: '#fafafa' }}>Abre el panel de Ajustes</strong> (barra superior) para cambiar la rotación, unidades, color y tema.
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
