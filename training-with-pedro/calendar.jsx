// calendar.jsx — "Tu constancia" motivational attendance calendar + streak
//
// Reconstructs which workout fell on each past date from the rotating program
// (weeks A/B/C, Mon–Sat train, Sun rest), marks it done / rest / missed, and
// computes a streak that survives rest days but breaks on a missed training day.
// All history is deterministic & demo-only (no real logging backend).

const CAL_DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const CAL_DOW_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const CAL_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ─── date helpers (local, no tz drama) ───────────────────────
function calStripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function calKey(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function calDowMon(d) { return (d.getDay() + 6) % 7; }            // 0=Mon..6=Sun
function calMonday(d) { const m = calStripTime(d); m.setDate(m.getDate() - calDowMon(m)); return m; }
function calAddDays(d, n) { const x = calStripTime(d); x.setDate(x.getDate() + n); return x; }
function calDayDiff(a, b) { return Math.round((calStripTime(a) - calStripTime(b)) / 86400000); }

function FlameGlyph({ color = '#d4ff3a', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12.5 2.5c.8 3-1.4 4.6-2.7 6.2C8.3 10.6 7 12.2 7 14.5a5 5 0 0010 0c0-1.9-.8-3.4-1.7-4.7-.3 1-.9 1.7-1.8 2 .6-2.2-.2-4.7-2-6.3-.1.9-.5 1.6-1 2.2.8-1.9.6-3.7-.2-5.2z"
        fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <path d="M10 15.5c0-1.2.8-2.1 1.7-2.9.5 1 1.4 1.3 1.4 2.6a1.8 1.8 0 01-3.1 1.2c-.1-.3 0-.6 0-.9z"
        fill="#0a0a0a" opacity="0.55" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Build a record for a given date from the rotating program.
//   status: 'done' | 'rest' | 'missed' | 'today' | 'future' | 'none'
// ─────────────────────────────────────────────────────────────
function makeRecordFn(ctx) {
  const PROGRAM = window.PROGRAM;
  const today = calStripTime(ctx.today || new Date());
  const activeWeeks = Math.max(1, ctx.activeWeeks || PROGRAM.weeks.length);
  const baseWeekIdx = ctx.weekIdx || 0;
  const todayMonday = calMonday(today);

  // History window: ~10 weeks back. Before this there is "no data".
  const startDate = calAddDays(todayMonday, -7 * 9);

  // Deterministically seed a few missed training days (keeps a strong recent streak).
  const missed = new Set();
  [20, 34, 48, 49].forEach(off => { missed.add(calKey(calAddDays(today, -off))); });

  return function recordFor(rawDate) {
    const date = calStripTime(rawDate);
    const dow = calDowMon(date);
    const weekDiff = Math.round((calMonday(date) - todayMonday) / (7 * 86400000));
    const wi = ((baseWeekIdx + weekDiff) % activeWeeks + activeWeeks) % activeWeeks;
    const day = PROGRAM.weeks[wi].days[dow];
    const isRest = !day || day.name === 'Descanso';
    // exercises: B/C mirror A — fall back to week A's same weekday for a rich list
    let exercises = (day && day.exercises && day.exercises.length) ? day.exercises : [];
    if (!isRest && !exercises.length) exercises = PROGRAM.weeks[0].days[dow].exercises || [];

    let status;
    if (date < startDate) status = 'none';
    else if (date > today) status = 'future';
    else if (calKey(date) === calKey(today)) status = isRest ? 'rest' : 'today';
    else if (isRest) status = 'rest';
    else status = missed.has(calKey(date)) ? 'missed' : 'done';

    return { date, dow, weekIdx: wi, day, isRest, exercises, status };
  };
}

// ─── streak: consecutive days w/o a missed training, rest days pass ──
function computeStreak(recordFor, today) {
  let count = 0;
  // If today is a still-pending training day, the streak is measured through yesterday.
  const startRec = recordFor(today);
  let cursor = (startRec.status === 'today') ? calAddDays(today, -1) : calStripTime(today);
  for (let i = 0; i < 800; i++) {
    const r = recordFor(cursor);
    if (r.status === 'missed' || r.status === 'none' || r.status === 'future') break;
    count++; // 'done' or 'rest' both keep the chain alive
    cursor = calAddDays(cursor, -1);
  }
  return count;
}

function computeBestStreak(recordFor, today, startDate) {
  let best = 0, cur = 0;
  let d = calStripTime(startDate);
  while (d <= today) {
    const r = recordFor(d);
    if (r.status === 'missed') cur = 0;
    else if (r.status === 'done' || r.status === 'rest' || r.status === 'today') { cur++; best = Math.max(best, cur); }
    d = calAddDays(d, 1);
  }
  return best;
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
function MotivationCalendar({ ctx }) {
  const accent = ctx.accent;
  const recordFor = React.useMemo(() => makeRecordFn(ctx), [ctx.today, ctx.weekIdx, ctx.activeWeeks]);
  const today = calStripTime(ctx.today || new Date());

  const [viewMonth, setViewMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = React.useState(today);

  const streak = React.useMemo(() => computeStreak(recordFor, today), [recordFor]);
  const startDate = calAddDays(calMonday(today), -7 * 9);
  const best = React.useMemo(() => computeBestStreak(recordFor, today, startDate), [recordFor]);

  // Month grid
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lead = calDowMon(monthStart);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));

  // Trained count in the viewed month
  let monthDone = 0;
  cells.forEach(c => { if (c && recordFor(c).status === 'done') monthDone++; });

  const canPrev = calMonday(monthStart) >= startDate;
  const canNext = (viewMonth.getFullYear() < today.getFullYear()) ||
    (viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() < today.getMonth());
  const goPrev = () => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  // last-14-days chain
  const chain = [];
  for (let i = 13; i >= 0; i--) chain.push(recordFor(calAddDays(today, -i)));

  const selRec = recordFor(selected);

  return (
    <div>
      {/* ── Streak hero ── */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(160deg, #181818 0%, #111 100%)',
          borderRadius: 20, padding: 18,
          border: `0.5px solid ${accent}2e`, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -55, right: -45, width: 180, height: 180,
            borderRadius: '50%', background: accent, opacity: 0.09, filter: 'blur(55px)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 15, flexShrink: 0,
                background: `${accent}1c`, border: `0.5px solid ${accent}3a`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><FlameGlyph color={accent} size={26} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.6,
                  textTransform: 'uppercase', color: accent, fontWeight: 600,
                }}>Racha actual</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 3 }}>
                  <span style={{
                    fontFamily: 'Space Grotesk, system-ui', fontSize: 40, fontWeight: 700,
                    color: '#fafafa', letterSpacing: -1.8, lineHeight: 0.9,
                  }}>{streak}</span>
                  <span style={{
                    fontFamily: 'Space Grotesk, system-ui', fontSize: 15, fontWeight: 600,
                    color: 'rgba(255,255,255,0.6)',
                  }}>{streak === 1 ? 'día seguido' : 'días seguidos'}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  Mejor racha: <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{best} días</span>
                </div>
              </div>
            </div>

            {/* don't-break-the-chain strip (last 14 days) */}
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'flex', gap: 4, alignItems: 'flex-end', justifyContent: 'space-between',
              }}>
                {chain.map((r, i) => {
                  const tall = r.status === 'done' || r.status === 'today';
                  let bg = 'rgba(255,255,255,0.08)';
                  if (r.status === 'done') bg = accent;
                  else if (r.status === 'today') bg = `${accent}55`;
                  else if (r.status === 'missed') bg = '#ff6b6b';
                  else if (r.status === 'rest') bg = 'rgba(255,255,255,0.14)';
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{
                        width: '100%', height: tall ? 26 : 14, borderRadius: 5, background: bg,
                        border: r.status === 'today' ? `1px solid ${accent}` : (r.status === 'missed' ? '1px solid #ff6b6b' : 0),
                        boxShadow: r.status === 'done' ? `0 0 8px ${accent}66` : 'none',
                      }} />
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
                        color: i === 13 ? accent : 'rgba(255,255,255,0.3)',
                      }}>{CAL_DOW[r.dow]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{
                marginTop: 11, fontSize: 11.5, lineHeight: 1.4,
                color: 'rgba(255,255,255,0.6)', fontFamily: 'Space Grotesk, system-ui',
              }}>
                {selRec.status === 'today' && !selRec.isRest
                  ? <>Hoy toca <span style={{ color: accent, fontWeight: 600 }}>{selRec.day.name}</span> — no rompas la cadena 🔥</>
                  : <>Llevas <span style={{ color: accent, fontWeight: 600 }}>{streak} días</span> sin fallar. ¡Sigue así!</>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div style={{ padding: '12px 20px 0' }}>
        <div style={{
          background: '#141414', borderRadius: 20, padding: 16,
          border: '0.5px solid rgba(255,255,255,0.06)',
        }}>
          {/* month header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <CalNavBtn dir="prev" enabled={canPrev} onClick={goPrev} />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Space Grotesk, system-ui', fontSize: 17, fontWeight: 700,
                color: '#fafafa', letterSpacing: -0.4,
              }}>{CAL_MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 0.6,
                color: 'rgba(255,255,255,0.45)', marginTop: 2,
              }}>{monthDone} entrenamientos</div>
            </div>
            <CalNavBtn dir="next" enabled={canNext} onClick={goNext} />
          </div>

          {/* weekday labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
            {CAL_DOW.map((d, i) => (
              <div key={i} style={{
                textAlign: 'center', fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9.5, letterSpacing: 0.5, color: 'rgba(255,255,255,0.35)',
              }}>{d}</div>
            ))}
          </div>

          {/* grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {cells.map((c, i) => {
              if (!c) return <div key={i} />;
              const r = recordFor(c);
              const isSel = calKey(c) === calKey(selected);
              return <CalCell key={i} date={c} rec={r} accent={accent} selected={isSel} onClick={() => setSelected(c)} />;
            })}
          </div>

          {/* legend */}
          <div style={{
            display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 14, paddingTop: 13,
            borderTop: '0.5px solid rgba(255,255,255,0.06)',
          }}>
            <CalLegend swatch={accent} label="Entrenado" />
            <CalLegend swatch="rgba(255,255,255,0.18)" label="Descanso" />
            <CalLegend swatch="transparent" ring="#ff6b6b" label="Faltaste" />
            <CalLegend swatch="transparent" ring={accent} label="Hoy" />
          </div>
        </div>
      </div>

      {/* ── Selected-day detail ── */}
      <div style={{ padding: '12px 20px 0' }}>
        <DayDetail rec={selRec} accent={accent} units={ctx.units} today={today} />
      </div>
    </div>
  );
}

function CalNavBtn({ dir, enabled, onClick }) {
  return (
    <button onClick={onClick} disabled={!enabled} aria-label={dir === 'prev' ? 'Mes anterior' : 'Mes siguiente'} style={{
      width: 34, height: 34, borderRadius: 10, flexShrink: 0, padding: 0,
      cursor: enabled ? 'pointer' : 'default',
      background: enabled ? 'rgba(255,255,255,0.06)' : 'transparent',
      border: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: enabled ? 1 : 0.3,
    }}>
      <svg width="9" height="14" viewBox="0 0 9 14" fill="none" style={{ transform: dir === 'next' ? 'scaleX(-1)' : 'none' }}>
        <path d="M7.5 1L1.5 7l6 6" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function CalCell({ date, rec, accent, selected, onClick }) {
  const n = date.getDate();
  let bg = 'transparent', color = 'rgba(255,255,255,0.7)', border = '0.5px solid transparent', dot = null, glow = 'none';
  if (rec.status === 'done') {
    bg = `${accent}1f`; color = accent; border = `0.5px solid ${accent}3a`;
    dot = accent;
  } else if (rec.status === 'today') {
    border = `1px solid ${accent}`; color = accent; glow = `0 0 0 3px ${accent}1f`;
  } else if (rec.status === 'rest') {
    color = 'rgba(255,255,255,0.4)'; dot = 'rgba(255,255,255,0.25)';
  } else if (rec.status === 'missed') {
    border = '0.5px solid #ff6b6b66'; color = '#ff8a7a';
  } else if (rec.status === 'future') {
    color = 'rgba(255,255,255,0.22)';
  } else {
    color = 'rgba(255,255,255,0.18)';
  }
  return (
    <button onClick={onClick} style={{
      position: 'relative', aspectRatio: '1 / 1', minHeight: 38,
      borderRadius: 11, cursor: 'pointer', padding: 0,
      background: selected ? (rec.status === 'done' ? `${accent}33` : 'rgba(255,255,255,0.08)') : bg,
      border: selected ? `1px solid ${accent}` : border,
      boxShadow: selected ? 'none' : glow,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
    }}>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500,
        color: selected && rec.status !== 'done' ? '#fafafa' : color, lineHeight: 1,
      }}>{n}</span>
      <span style={{
        width: 4, height: 4, borderRadius: '50%',
        background: dot || 'transparent',
      }} />
      {rec.status === 'missed' && (
        <span style={{
          position: 'absolute', top: 4, right: 5, width: 5, height: 5, borderRadius: '50%',
          background: '#ff6b6b',
        }} />
      )}
    </button>
  );
}

function CalLegend({ swatch, ring, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 11, height: 11, borderRadius: 4, background: swatch,
        border: ring ? `1.5px solid ${ring}` : 0, flexShrink: 0,
      }} />
      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', fontFamily: 'Space Grotesk, system-ui' }}>{label}</span>
    </div>
  );
}

// ─── selected day detail ─────────────────────────────────────
function DayDetail({ rec, accent, units, today }) {
  const meta = {
    done: { pill: 'Completado', pc: accent, pbg: `${accent}1c` },
    today: { pill: 'Hoy · pendiente', pc: accent, pbg: `${accent}1c` },
    rest: { pill: 'Descanso', pc: '#9bd1ff', pbg: 'rgba(155,209,255,0.14)' },
    missed: { pill: 'No fuiste', pc: '#ff8a7a', pbg: 'rgba(255,107,107,0.14)' },
    future: { pill: 'Programado', pc: 'rgba(255,255,255,0.6)', pbg: 'rgba(255,255,255,0.06)' },
    none: { pill: 'Sin datos', pc: 'rgba(255,255,255,0.5)', pbg: 'rgba(255,255,255,0.05)' },
  }[rec.status] || { pill: '', pc: accent, pbg: `${accent}1c` };

  const d = rec.date;
  const dateLabel = `${CAL_DOW_LONG[rec.dow]} ${d.getDate()} ${CAL_MONTHS[d.getMonth()].toLowerCase()}`;
  const showExercises = !rec.isRest && rec.status !== 'none' && rec.exercises.length > 0;
  const dim = rec.status === 'missed' || rec.status === 'future';

  return (
    <div style={{
      background: '#141414', borderRadius: 20, padding: 18,
      border: rec.status === 'missed' ? '0.5px solid rgba(255,107,107,0.25)' : '0.5px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.2,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          }}>{dateLabel}</div>
          <div style={{
            fontFamily: 'Space Grotesk, system-ui', fontSize: 22, fontWeight: 700,
            color: '#fafafa', letterSpacing: -0.6, marginTop: 4, lineHeight: 1.05,
          }}>{rec.isRest ? 'Descanso' : rec.day.name}</div>
          {!rec.isRest && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>{rec.day.subtitle}</div>
          )}
        </div>
        <div style={{
          flexShrink: 0, padding: '5px 11px', borderRadius: 9999,
          background: meta.pbg, color: meta.pc,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 0.6,
          textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
        }}>{meta.pill}</div>
      </div>

      {/* Rest day */}
      {rec.isRest && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: 'rgba(155,209,255,0.06)', border: '0.5px solid rgba(155,209,255,0.18)',
          fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
        }}>
          Día de recuperación. Descansar también es entrenar — mantiene viva tu racha.
        </div>
      )}

      {/* Missed */}
      {rec.status === 'missed' && (
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 14,
          background: 'rgba(255,107,107,0.06)', border: '0.5px solid rgba(255,107,107,0.2)',
          fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5,
        }}>
          No registraste este entrenamiento. Estaba programado <strong style={{ color: '#fafafa' }}>{rec.day.name}</strong> ({rec.day.subtitle}).
        </div>
      )}

      {/* Exercise list */}
      {showExercises && (
        <div style={{ marginTop: 14, opacity: dim ? 0.5 : 1 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.4,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{rec.status === 'done' ? 'Lo que hiciste' : rec.status === 'today' ? 'Lo que toca hoy' : 'Programado'}</span>
            <span style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
            <span>{rec.exercises.length} ejercicios</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rec.exercises.map((e, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 0' }}>
                <div style={{
                  width: 22, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10, color: accent, opacity: 0.7,
                }}>{String(j + 1).padStart(2, '0')}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, system-ui', fontSize: 13.5, fontWeight: 500,
                    color: '#fafafa', letterSpacing: -0.1, lineHeight: 1.25,
                  }}>{e.name}</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{e.muscle}</div>
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'rgba(255,255,255,0.8)',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>{e.sets}<span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 2px' }}>×</span>{e.reps}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MotivationCalendar });
