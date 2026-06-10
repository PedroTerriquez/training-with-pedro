// session.jsx — Today-flow detail views
//   • PhaseDetail     — warm-up / stretch shown as a rich detail (parity with strength)
//   • WorkSessionBar  — strength-session progress + finish control (inside ExerciseDetail)
//   • SessionSummary  — full-screen AI recap once all three phases are done
//
// Relies on globals from ai.jsx (completeRetry, extractJSON, TypingDots, CoachGlyph)
// and ui.jsx (Chip). All Spanish, app vocabulary.

const PHASE_CONF = {
  warmup:  { label: 'Calentamiento', accent: '#9bd1ff', type: 'Dinámico',  phase: '01',
             blurb: 'Sube la temperatura y prepara las articulaciones antes de cargar peso.' },
  stretch: { label: 'Estiramiento',  accent: '#c89bff', type: 'Estático',   phase: '03',
             blurb: 'Baja pulsaciones y devuelve longitud a los músculos que trabajaste.' },
};

// ─────────────────────────────────────────────────────────────
// Phase detail (warm-up / stretch)
// ─────────────────────────────────────────────────────────────
function PhaseDetail({ kind, data, dayName, accent, onFinish }) {
  const conf = PHASE_CONF[kind] || PHASE_CONF.warmup;
  const a = conf.accent;
  const movements = data?.movements || [];
  const last = movements.length - 1;

  // ── Swipeable single-movement viewer ───────────────────────
  const [idx, setIdx] = React.useState(0);
  const [dragX, setDragX] = React.useState(0);
  const [active, setActive] = React.useState(false); // pointer down → kill CSS transition
  const [hint, setHint] = React.useState(true);
  const draggingRef = React.useRef(false);
  const startRef = React.useRef({ x: 0, y: 0 });
  const lockRef = React.useRef(null); // 'h' | 'v' | null
  const dragXRef = React.useRef(0);   // live offset (avoids stale-state on release)
  const vpRef = React.useRef(null);

  // Reset when switching phase (warmup ↔ stretch reuse the same instance)
  React.useEffect(() => { setIdx(0); setDragX(0); setActive(false); setHint(true); }, [kind]);

  const go = (n) => setIdx(Math.max(0, Math.min(last, n)));

  const onDown = (e) => {
    draggingRef.current = true;
    lockRef.current = null;
    setActive(true);
    startRef.current = { x: e.clientX, y: e.clientY };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const onMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (lockRef.current === null && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      lockRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }
    if (lockRef.current !== 'h') return;
    let d = dx;
    if ((idx === 0 && d > 0) || (idx === last && d < 0)) d *= 0.32; // edge resistance
    dragXRef.current = d;
    setDragX(d);
    if (hint) setHint(false);
  };
  const onUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setActive(false);
    const w = vpRef.current ? vpRef.current.offsetWidth : 320;
    const threshold = Math.min(88, w * 0.22);
    const d = dragXRef.current;
    if (lockRef.current === 'h') {
      if (d <= -threshold && idx < last) setIdx(idx + 1);
      else if (d >= threshold && idx > 0) setIdx(idx - 1);
    }
    dragXRef.current = 0;
    setDragX(0);
    lockRef.current = null;
  };

  return (
    <div style={{ color: '#fafafa', paddingBottom: 46 }}>
      {/* HERO */}
      <div style={{ padding: '12px 14px 0' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 18, padding: 18, minHeight: 132, boxSizing: 'border-box',
          background: '#161616',
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 24px, rgba(255,255,255,0.04) 24px 48px)',
          border: `0.5px solid ${a}33`,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            position: 'absolute', width: 240, height: 240, borderRadius: '50%',
            background: a, opacity: 0.1, filter: 'blur(70px)', top: -80, right: -60,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: -14, bottom: -18, opacity: 0.1, color: a,
          }}>
            <KindGlyph kind={kind} color={a} size={130} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 6 }}>
            <Chip color="rgba(0,0,0,0.45)" text="rgba(255,255,255,0.85)">{conf.type}</Chip>
            <Chip color={`${a}22`} text={a}>{dayName}</Chip>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.6,
              textTransform: 'uppercase', color: a, fontWeight: 600,
            }}>Fase {conf.phase}</div>
            <div style={{
              marginTop: 4, fontFamily: 'Space Grotesk, system-ui',
              fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: -0.8, lineHeight: 1,
            }}>{conf.label}</div>
          </div>
        </div>
      </div>

      {/* PRESCRIPTION STRIP */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          background: '#141414', borderRadius: 14,
          border: '0.5px solid rgba(255,255,255,0.06)', overflow: 'hidden',
        }}>
          {[
            { label: 'duración', val: `${data?.duration || '—'}m` },
            { label: 'movim.', val: movements.length },
            { label: 'tipo', val: conf.type },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '11px 6px', textAlign: 'center',
              borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.05)' : 0,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5, letterSpacing: 1.4,
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 600,
              }}>{c.label}</div>
              <div style={{
                marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 500,
                color: '#fafafa', letterSpacing: -0.4, lineHeight: 1, whiteSpace: 'nowrap',
              }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MOVEMENT VIEWER — one at a time, swipe to navigate */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.6,
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: a }} />
          Movimiento
          <span style={{
            marginLeft: 'auto', color: a, letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums',
          }}>{String(idx + 1).padStart(2, '0')} / {String(movements.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Swipe viewport */}
      <div
        ref={vpRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          margin: '0 20px', overflow: 'hidden', borderRadius: 18,
          touchAction: 'pan-y', userSelect: 'none',
          cursor: active ? 'grabbing' : 'grab', position: 'relative',
        }}
      >
        <div style={{
          display: 'flex',
          transform: `translateX(calc(${-idx * 100}% + ${dragX}px))`,
          transition: active ? 'none' : 'transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)',
        }}>
          {movements.map((m, i) => (
            <div key={i} style={{ flex: '0 0 100%', minWidth: '100%', boxSizing: 'border-box' }}>
              <MovementCard m={m} i={i} total={movements.length} kind={kind} a={a} dim={i !== idx} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots + arrows */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        marginTop: 14, padding: '0 20px',
      }}>
        <ArrowBtn dir="prev" disabled={idx === 0} a={a} onClick={() => { setHint(false); go(idx - 1); }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {movements.map((_, i) => (
            <button key={i} onClick={() => { setHint(false); go(i); }} aria-label={`Movimiento ${i + 1}`} style={{
              width: i === idx ? 20 : 6, height: 6, padding: 0, borderRadius: 3, border: 0,
              cursor: 'pointer', background: i === idx ? a : 'rgba(255,255,255,0.18)',
              transition: 'all 0.25s',
            }} />
          ))}
        </div>
        <ArrowBtn dir="next" disabled={idx === last} a={a} onClick={() => { setHint(false); go(idx + 1); }} />
      </div>

      {/* Swipe hint — fades after first navigation */}
      <div style={{
        textAlign: 'center', marginTop: 11, height: 12,
        opacity: hint ? 1 : 0, transition: 'opacity 0.4s',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.6,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ color: a }}>‹</span> Desliza para navegar <span style={{ color: a }}>›</span>
      </div>

      {/* FINISH */}
      <div style={{ padding: '20px 20px 0', position: 'sticky', bottom: 0 }}>
        <button onClick={onFinish} style={{
          width: '100%', padding: '15px', borderRadius: 13, border: 0, cursor: 'pointer',
          background: a, color: '#0a0a0a',
          fontFamily: 'Space Grotesk, system-ui', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 8px 24px ${a}44`,
        }}>
          <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
            <path d="M1 6l4.5 4.5L14 1" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Terminar {conf.label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

// Single movement card shown inside the swipe viewport
function MovementCard({ m, i, total, kind, a, dim }) {
  return (
    <div style={{
      background: '#141414', borderRadius: 18, overflow: 'hidden',
      border: '0.5px solid rgba(255,255,255,0.06)',
      opacity: dim ? 0.55 : 1, transition: 'opacity 0.34s',
    }}>
      {/* Media placeholder */}
      <div style={{
        position: 'relative', height: 152, overflow: 'hidden',
        background: '#1a1a1a',
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 18px, rgba(255,255,255,0.045) 18px 36px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: a, opacity: 0.08, filter: 'blur(60px)', top: -70, right: -50,
        }} />
        <div style={{
          position: 'absolute', top: 12, left: 14,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.4,
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>Movim · {String(i + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</div>
        <div style={{ opacity: 0.5, color: a }}>
          <KindGlyph kind={kind} color={a} size={56} />
        </div>
        <div style={{
          position: 'absolute', right: 16, bottom: 4,
          fontFamily: 'Space Grotesk, system-ui', fontSize: 70, fontWeight: 700,
          color: 'rgba(255,255,255,0.05)', lineHeight: 1, letterSpacing: -3,
        }}>{String(i + 1).padStart(2, '0')}</div>
      </div>
      {/* Text area */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui', fontSize: 21, fontWeight: 700,
          color: '#fafafa', letterSpacing: -0.5, lineHeight: 1.12, textWrap: 'pretty',
        }}>{m.name}</div>
        <div style={{
          marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 13px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'rgba(255,255,255,0.72)',
          letterSpacing: 0.2,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: a, flexShrink: 0 }} />
          {m.detail}
        </div>
      </div>
    </div>
  );
}

// Prev / next arrow used under the swipe viewport
function ArrowBtn({ dir, disabled, a, onClick }) {
  const isPrev = dir === 'prev';
  return (
    <button onClick={onClick} disabled={disabled} aria-label={isPrev ? 'Anterior' : 'Siguiente'} style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0, padding: 0,
      cursor: disabled ? 'default' : 'pointer',
      background: disabled ? 'rgba(255,255,255,0.03)' : '#1b1b1b',
      border: `0.5px solid ${disabled ? 'rgba(255,255,255,0.06)' : a + '44'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1, transition: 'all 0.15s',
    }}>
      <svg width="13" height="12" viewBox="0 0 13 12" fill="none" style={{ transform: isPrev ? 'none' : 'scaleX(-1)' }}>
        <path d="M8 1L3 6l5 5" stroke={disabled ? 'rgba(255,255,255,0.4)' : a} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Work-session bar — sits at the top of the strength detail flow
// ─────────────────────────────────────────────────────────────
function WorkSessionBar({ exercises, logState, accent, onFinish }) {
  const total = exercises.length;
  const done = exercises.filter(e => logState[e.id]?.weight !== undefined).length;
  return (
    <div style={{
      margin: '10px 14px 0', padding: '12px 14px',
      background: `linear-gradient(150deg, ${accent}14 0%, #141414 70%)`,
      border: `0.5px solid ${accent}33`, borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.4,
          textTransform: 'uppercase', color: accent, fontWeight: 600,
        }}>Fase 02 · Fuerza</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
          {exercises.map((e, i) => {
            const on = logState[e.id]?.weight !== undefined;
            return (
              <div key={e.id} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: on ? accent : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s',
              }} />
            );
          })}
        </div>
        <div style={{
          marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3,
        }}>{done} de {total} registrados</div>
      </div>
      <button onClick={onFinish} style={{
        flexShrink: 0, padding: '10px 16px', borderRadius: 11, border: 0, cursor: 'pointer',
        background: accent, color: '#0a0a0a',
        fontFamily: 'Space Grotesk, system-ui', fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
        display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: `0 6px 18px ${accent}44`,
      }}>
        <svg width="13" height="10" viewBox="0 0 14 11" fill="none">
          <path d="M1 5.5l4 4 8-8.5" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Terminar
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Session summary — full-screen AI recap
// ─────────────────────────────────────────────────────────────
function parseRepsNum(rep) {
  if (typeof rep === 'number') return rep;
  const m = String(rep).match(/(\d+)/g);
  if (!m) return 8;
  return parseInt(m[m.length - 1], 10);
}

function SessionSummary({ ctx, dayKey }) {
  const { day, logState, units, accent } = ctx;

  const items = React.useMemo(() => (
    day.exercises.map(e => {
      const l = logState[e.id];
      if (!l || l.weight === undefined) return null;
      const sets = l.sets ?? e.sets;
      const reps = l.reps ?? parseRepsNum(e.reps);
      const allTime = Math.max(...e.history.map(h => h.top));
      return { name: e.name, muscle: e.muscle, weight: l.weight, sets, reps,
               isPR: l.weight >= allTime && l.weight > 0 };
    }).filter(Boolean)
  ), [day, logState]);

  const volume = Math.round(items.reduce((a, x) => a + x.weight * x.sets * x.reps, 0));
  const prCount = items.filter(x => x.isPR).length;

  const [ai, setAi] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const fallback = {
        titulo: '¡Sesión completada!',
        resumen: `Cerraste tu día de ${day.name} con calentamiento, fuerza y estiramiento. Constancia que se nota.`,
        destacados: [
          `${items.length} ejercicios registrados`,
          prCount > 0 ? `${prCount} récord${prCount > 1 ? 's' : ''} personal${prCount > 1 ? 'es' : ''}` : 'Calentamiento y enfriamiento hechos',
          `${(volume / 1000).toFixed(1)}k ${units} de volumen`,
        ],
        consejos: [
          'Hidrátate y apunta a 30-40 g de proteína en la próxima comida.',
          'Duerme 7-9 h: ahí ocurre la recuperación real.',
          'Mañana toca movilidad ligera para tu siguiente sesión.',
        ],
      };
      if (!(window.claude && window.claude.complete)) {
        if (alive) { setAi(fallback); setLoading(false); }
        return;
      }
      const lifts = items.map(x => `${x.name}: ${x.weight}${units} ${x.sets}×${x.reps}${x.isPR ? ' (PR)' : ''}`).join('; ') || 'sin registros de peso';
      const instr =
`Eres "Coach", un entrenador personal cercano y conciso. Respondes en español, en segunda persona.
El usuario acaba de TERMINAR su sesión de "${day.name}" (${day.subtitle}), incluyendo calentamiento y estiramiento.
Pesos levantados hoy: ${lifts}.
Volumen total aprox: ${volume} ${units}. Récords personales hoy: ${prCount}.
Devuelve SOLO JSON válido y COMPACTO (sin markdown, sin texto extra) con ESTA forma exacta:
{"titulo":"frase corta y motivadora (max 6 palabras)","resumen":"1-2 frases sobre cómo estuvo la sesión","destacados":["2-3 logros muy cortos, max 5 palabras c/u"],"consejos":["2-3 consejos breves de recuperación o de cara a la próxima sesión"]}`;
      try {
        const txt = await completeRetry(instr);
        const parsed = extractJSON(txt);
        if (!parsed || !parsed.resumen) throw new Error('parse');
        if (alive) { setAi(parsed); setLoading(false); }
      } catch (e) {
        if (alive) { setAi(fallback); setErrored(true); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, []);

  const stats = [
    { label: 'Ejercicios', val: items.length },
    { label: `Volumen (${units})`, val: volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume },
    { label: 'PRs', val: prCount },
  ];

  return (
    <div style={{
      height: '100%', boxSizing: 'border-box', overflowY: 'auto',
      padding: '58px 16px 104px',
    }}>
      {/* Celebration header */}
      <div style={{ padding: '0 4px', position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.8,
          textTransform: 'uppercase', color: accent, fontWeight: 600,
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 8, background: accent,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${accent}66`,
          }}>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1 5l3.5 3.5L12 1" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {day.name} · completado
        </div>
        <div style={{
          marginTop: 12, fontFamily: 'Space Grotesk, system-ui',
          fontSize: 34, fontWeight: 700, color: '#fafafa', letterSpacing: -1.3, lineHeight: 1.02,
        }}>
          {loading ? 'Cerrando tu sesión…' : (ai?.titulo || '¡Buen trabajo, Pedro!')}
        </div>
      </div>

      {/* Stat row */}
      <div style={{
        marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#141414', borderRadius: 16, padding: '14px 12px',
            border: '0.5px solid rgba(255,255,255,0.06)', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 500,
              color: i === 2 && prCount > 0 ? accent : '#fafafa', letterSpacing: -1, lineHeight: 1,
            }}>{s.val}</div>
            <div style={{
              marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 8.5,
              letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI recap card */}
      <div style={{
        marginTop: 14, borderRadius: 20, padding: 18,
        background: 'linear-gradient(165deg, #181818 0%, #111 100%)',
        border: `0.5px solid ${accent}2e`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(55px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.6,
            textTransform: 'uppercase', color: accent, fontWeight: 600,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 7, background: `${accent}1f`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><CoachGlyph color={accent} size={13} /></span>
            Resumen del coach
          </div>

          {loading ? (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <TypingDots color={accent} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Analizando tu entrenamiento…</span>
            </div>
          ) : (
            <>
              <div style={{
                marginTop: 12, fontSize: 14.5, lineHeight: 1.55,
                color: 'rgba(255,255,255,0.9)', fontFamily: 'Space Grotesk, system-ui',
                letterSpacing: -0.1,
              }}>{ai?.resumen}</div>

              {Array.isArray(ai?.destacados) && ai.destacados.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
                  {ai.destacados.map((d, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 11px', borderRadius: 9999,
                      background: `${accent}16`, border: `0.5px solid ${accent}3a`,
                      fontFamily: 'Space Grotesk, system-ui', fontSize: 11.5, fontWeight: 600,
                      color: accent,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
                      {d}
                    </span>
                  ))}
                </div>
              )}

              {Array.isArray(ai?.consejos) && ai.consejos.length > 0 && (
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 1.4,
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 600,
                    marginBottom: 10,
                  }}>Consejos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {ai.consejos.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: accent,
                          opacity: 0.7, width: 16, flexShrink: 0, paddingTop: 1,
                        }}>{String(i + 1).padStart(2, '0')}</div>
                        <div style={{
                          flex: 1, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.82)',
                          fontFamily: 'Space Grotesk, system-ui', letterSpacing: -0.1,
                        }}>{c}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errored && (
                <div style={{
                  marginTop: 12, fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.3,
                }}>Resumen sin conexión · valores locales</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reset */}
      <button onClick={() => ctx.resetDay && ctx.resetDay(dayKey)} style={{
        marginTop: 16, width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
        background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)',
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Space Grotesk, system-ui', fontSize: 13, fontWeight: 600, letterSpacing: -0.1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M13 8a5 5 0 11-1.5-3.6M13 2v3h-3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Reiniciar día
      </button>
    </div>
  );
}

Object.assign(window, { PhaseDetail, WorkSessionBar, SessionSummary });
