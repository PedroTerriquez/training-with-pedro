// reschedule.jsx — "Reprogramar la semana" — drag-to-swap day cards + shift-all
// Scope: the current week only. Changes are temporary (reset Monday).

const PROGRAM_DAYS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const PROGRAM_DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DEFAULT_ORDER = [0, 1, 2, 3, 4, 5, 6];

// ─────────────────────────────────────────────────────────────
// Grip handle glyph (2×3 dots)
// ─────────────────────────────────────────────────────────────
function GripDots({ color = 'rgba(255,255,255,0.4)' }) {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" style={{ display: 'block' }}>
      {[5, 10, 15].map(cy => (
        <React.Fragment key={cy}>
          <circle cx="4" cy={cy} r="1.5" fill={color} />
          <circle cx="10" cy={cy} r="1.5" fill={color} />
        </React.Fragment>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// One reschedulable day card. Drag from the grip handle to swap.
// ─────────────────────────────────────────────────────────────
function DayCard({
  calIdx, originalIdx, day, accent, isToday, isMoved,
  dragging, isOver, lift, cardRef, onPointerDown, onPointerMove, onPointerUp,
}) {
  const isRest = day.name === 'Descanso';
  return (
    <div
      ref={cardRef}
      style={{
        background: '#141414',
        borderRadius: 18,
        padding: '14px 12px 14px 16px',
        border: isOver
          ? `1px solid ${accent}`
          : isToday
            ? `1px solid ${accent}aa`
            : '0.5px solid rgba(255,255,255,0.06)',
        position: 'relative',
        display: 'flex', gap: 13, alignItems: 'center',
        transform: dragging ? `translateY(${lift}px) scale(1.025)` : 'none',
        zIndex: dragging ? 50 : 1,
        boxShadow: dragging
          ? '0 18px 40px rgba(0,0,0,0.55)'
          : isOver ? `0 0 0 4px ${accent}1f` : 'none',
        transition: dragging ? 'none' : 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        touchAction: 'pan-y',
        cursor: 'default',
      }}
    >
      {/* swap-target hint overlay */}
      {isOver && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: `${accent}10`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
          color: accent, fontWeight: 600, pointerEvents: 'none', zIndex: 3,
        }}>
          ↔ Intercambiar aquí
        </div>
      )}

      {/* Calendar-day badge (fixed — this is the real weekday) */}
      <div style={{
        width: 42, height: 46, flexShrink: 0,
        borderRadius: 12,
        background: isToday ? `${accent}18` : 'rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: isToday ? `0.5px solid ${accent}66` : '0.5px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 8, letterSpacing: 1.2,
          color: isToday ? accent : 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
        }}>{PROGRAM_DAYS_SHORT[calIdx]}</div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 16, fontWeight: 500, color: '#fafafa', lineHeight: 1.1,
        }}>{calIdx + 1}</div>
      </div>

      {/* Workout identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            fontFamily: 'Space Grotesk, system-ui',
            fontSize: 16, fontWeight: 600, color: '#fafafa', letterSpacing: -0.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{day.name}</div>
          {isToday && <div style={{
            width: 6, height: 6, borderRadius: '50%', background: accent,
            boxShadow: `0 0 6px ${accent}`, flexShrink: 0,
          }} />}
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{isToday ? 'Hoy' : ''}{isToday && (isMoved || day.subtitle) ? ' · ' : ''}{day.subtitle || (isRest ? 'Recuperación' : '')}</div>

        {/* moved-from chip */}
        {isMoved && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            marginTop: 7, padding: '3px 8px', borderRadius: 9999,
            background: `${accent}18`, border: `0.5px solid ${accent}3a`,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase',
            color: accent, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            ↔ desde {PROGRAM_DAYS_SHORT[originalIdx]}
          </div>
        )}
      </div>

      {/* count / duration */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 30 }}>
        {!isRest ? (
          <>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, color: '#fafafa', fontWeight: 500,
            }}>{day.exercises.length}</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)', marginTop: 1,
            }}>{day.duration}m</div>
          </>
        ) : (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9bd1ff',
          }}>DESC</div>
        )}
      </div>

      {/* Grip handle — the drag affordance */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          flexShrink: 0, alignSelf: 'stretch',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px 0 8px', marginRight: -2,
          touchAction: 'none', cursor: 'grab',
          position: 'relative', zIndex: 4,
        }}
        title="Arrastra para mover este día"
      >
        <GripDots color={dragging ? accent : 'rgba(255,255,255,0.38)'} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// The full reschedule editor (current week only)
// ─────────────────────────────────────────────────────────────
function ReschedulePlan({ ctx }) {
  const accent = ctx.accent;
  const week = ctx.weekObj;
  const order = ctx.order;
  const setOrder = ctx.setOrder;
  const today = ctx.dayIndex;

  const changes = order.reduce((n, v, i) => n + (v !== i ? 1 : 0), 0);

  const cardRefs = React.useRef([]);
  const rectsRef = React.useRef([]);
  const startYRef = React.useRef(0);
  const [drag, setDrag] = React.useState(null); // { idx, dy, over }

  const reset = () => setOrder(DEFAULT_ORDER.slice());
  const shiftAll = () => setOrder(order.map((_, i) => order[(i - 1 + 7) % 7]));

  const handleDown = (i) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    rectsRef.current = cardRefs.current.map(el => (el ? el.getBoundingClientRect() : null));
    startYRef.current = e.clientY;
    setDrag({ idx: i, dy: 0, over: i });
  };
  const handleMove = (i) => (e) => {
    setDrag(prev => {
      if (!prev || prev.idx !== i) return prev;
      const y = e.clientY;
      let over = i;
      rectsRef.current.forEach((r, j) => {
        if (r && y >= r.top && y <= r.bottom) over = j;
      });
      return { idx: i, dy: y - startYRef.current, over };
    });
  };
  const handleUp = (i) => (e) => {
    setDrag(prev => {
      if (!prev || prev.idx !== i) return null;
      if (prev.over != null && prev.over !== i) {
        const next = order.slice();
        const tmp = next[i]; next[i] = next[prev.over]; next[prev.over] = tmp;
        setOrder(next);
      }
      return null;
    });
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  return (
    <div>
      {/* Banner — scope notice + reset */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <div style={{
          background: `${accent}0d`,
          border: `0.5px solid ${accent}33`,
          borderRadius: 16, padding: '13px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `${accent}1c`, color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M11.5 2.5l3 3-3 3M14 5.5H5.5a3 3 0 00-3 3M5.5 14.5l-3-3 3-3M3 11.5h8.5a3 3 0 003-3"
                stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 13.5, fontWeight: 600, color: '#fafafa', letterSpacing: -0.2,
            }}>Reprogramando esta semana</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.35 }}>
              Solo afecta a {week.name}. Se reinicia el lunes.
            </div>
          </div>
          <button
            onClick={reset}
            disabled={changes === 0}
            style={{
              flexShrink: 0, padding: '7px 11px', borderRadius: 9999, border: 0,
              cursor: changes === 0 ? 'default' : 'pointer',
              background: changes === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
              color: changes === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.85)',
              fontFamily: 'Space Grotesk, system-ui', fontSize: 12, fontWeight: 600,
            }}
          >Restablecer</button>
        </div>
      </div>

      {/* "I skipped today" — shift-all action */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <button
          onClick={shiftAll}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '13px 14px',
            display: 'flex', alignItems: 'center', gap: 13, color: 'inherit',
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: accent,
          }}>→</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk, system-ui',
              fontSize: 14.5, fontWeight: 600, color: '#fafafa', letterSpacing: -0.2,
            }}>Me salté un día</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2, lineHeight: 1.35 }}>
              Corre cada entrenamiento un día hacia adelante.
            </div>
          </div>
          <div style={{
            flexShrink: 0, padding: '8px 12px', borderRadius: 10,
            background: accent, color: '#0a0a0a',
            fontFamily: 'Space Grotesk, system-ui', fontSize: 12.5, fontWeight: 700,
            whiteSpace: 'nowrap',
          }}>Desplazar</div>
        </button>
      </div>

      {/* helper line */}
      <div style={{
        padding: '0 20px', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.42)', fontWeight: 600,
      }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
        <span>Arrastra <span style={{ color: accent }}>⠿</span> para intercambiar días</span>
      </div>

      {/* Draggable day list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {order.map((originalIdx, calIdx) => (
          <DayCard
            key={calIdx}
            calIdx={calIdx}
            originalIdx={originalIdx}
            day={week.days[originalIdx]}
            accent={accent}
            isToday={calIdx === today}
            isMoved={originalIdx !== calIdx}
            dragging={drag && drag.idx === calIdx}
            isOver={drag && drag.over === calIdx && drag.idx !== calIdx}
            lift={drag && drag.idx === calIdx ? drag.dy : 0}
            cardRef={el => { cardRefs.current[calIdx] = el; }}
            onPointerDown={handleDown(calIdx)}
            onPointerMove={handleMove(calIdx)}
            onPointerUp={handleUp(calIdx)}
          />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  PROGRAM_DAYS_LONG, PROGRAM_DAYS_SHORT, DEFAULT_ORDER,
  ReschedulePlan, DayCard, GripDots,
});
