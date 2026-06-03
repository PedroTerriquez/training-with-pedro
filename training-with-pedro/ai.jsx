// ai.jsx — AI features
//   1. ProgramGenerator   — textarea in the "Tú" tab → generates a weekly program
//   2. ProgramResultOverlay — full-screen presentation of the generated program
//   3. CoachFab + CoachOverlay — per-exercise AI coach chat (tips / pain triage)
//
// Uses window.claude.complete (haiku, 1024-token cap). All Spanish, app vocabulary.

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function extractJSON(text) {
  if (!text) return null;
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  const s = t.indexOf('{');
  if (s < 0) { try { return JSON.parse(t); } catch (_) { return null; } }
  // Try the full object, then progressively trim from the last '}' (repairs truncation).
  for (let k = t.lastIndexOf('}'); k > s; k = t.lastIndexOf('}', k - 1)) {
    let candidate = t.slice(s, k + 1);
    try { return JSON.parse(candidate); } catch (_) {}
    // attempt to close a dangling "days" array
    try { return JSON.parse(candidate.replace(/,\s*$/, '') + ']}'); } catch (_) {}
  }
  return null;
}

// Retries transient errors (e.g. "Overloaded") with a short backoff.
async function completeRetry(arg, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await window.claude.complete(arg); }
    catch (e) { lastErr = e; if (i < tries - 1) await new Promise(r => setTimeout(r, 1400 * (i + 1))); }
  }
  throw lastErr;
}

function TypingDots({ color = '#d4ff3a' }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: color,
          animation: `coachBlink 1.2s ${i * 0.18}s infinite ease-in-out`,
        }} />
      ))}
    </div>
  );
}

function CoachGlyph({ color = '#0a0a0a', size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z"
        stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <circle cx="9" cy="8.2" r="0.95" fill={color} />
      <circle cx="6" cy="8.2" r="0.95" fill={color} />
      <circle cx="12" cy="8.2" r="0.95" fill={color} />
    </svg>
  );
}

const AI_KEYFRAMES = `
@keyframes coachBlink { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
@keyframes overlayUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes bubbleIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes genShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
`;

// ─────────────────────────────────────────────────────────────
// 1. Program generator card (lives in the "Tú" tab)
// ─────────────────────────────────────────────────────────────
function ProgramGenerator({ accent, onResult }) {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const taRef = React.useRef(null);

  const goals = ['Fuerza', 'Hipertrofia', 'Perder grasa', '3 días', '4 días', '5 días', 'Cuido hombro', 'En casa'];
  const addGoal = (g) => {
    setError(null);
    setPrompt(p => {
      if (p.toLowerCase().includes(g.toLowerCase())) return p;
      return p.trim() ? `${p.replace(/[,\s]+$/, '')}, ${g}` : g;
    });
    if (taRef.current) taRef.current.focus();
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    if (!(window.claude && window.claude.complete)) {
      setError('El coach IA no está disponible en este momento.');
      return;
    }
    setLoading(true); setError(null);
    const instr =
`Eres un entrenador personal profesional. Diseña un programa de entrenamiento semanal a partir de la petición del usuario.
Devuelve SOLO JSON válido y COMPACTO (sin texto antes ni después, sin markdown), con ESTA forma exacta:
{"name":"nombre corto","focus":"objetivo en 2-4 palabras","split":"tipo de división","daysPerWeek":number,"days":[{"day":"Lunes","title":"Empuje","focus":"Pecho · Hombros","duration":60,"exercises":[{"name":"Press de banca","muscle":"Pecho","sets":4,"reps":"6-8"}]}],"notes":"1 frase de consejo"}
Reglas estrictas: incluye SOLO los días de entrenamiento (NO incluyas días de descanso); MÁXIMO 4 ejercicios por día; nombres cortos en español; sé muy conciso para NO exceder el límite de longitud.
Petición del usuario: "${prompt.trim()}"`;
    try {
      const txt = await completeRetry(instr);
      const parsed = extractJSON(txt);
      if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) throw new Error('parse');
      onResult({ ...parsed, _prompt: prompt.trim() });
    } catch (e) {
      const busy = /overload|rate|429|503|busy/i.test(String(e && (e.message || e)));
      setError(busy
        ? 'El coach está muy solicitado ahora mismo. Espera unos segundos e inténtalo de nuevo.'
        : 'No pude generar el programa. Intenta describir tu objetivo de otra forma.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(165deg, #181818 0%, #111 100%)',
      borderRadius: 20, padding: 18,
      border: `0.5px solid ${accent}2e`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -50, right: -40, width: 180, height: 180,
        borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(55px)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
          color: accent, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: 7, background: `${accent}1f`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><CoachGlyph color={accent} size={13} /></span>
          Generador IA
        </div>
        <div style={{
          marginTop: 10,
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 22, fontWeight: 700, color: '#fafafa', letterSpacing: -0.6, lineHeight: 1.1,
        }}>Arma tu programa</div>
        <div style={{ marginTop: 5, fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>
          Describe tu objetivo, días disponibles y molestias. El coach diseña la rutina.
        </div>

        {/* Goal chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
          {goals.map(g => (
            <button key={g} onClick={() => addGoal(g)} style={{
              padding: '6px 11px', borderRadius: 9999, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.78)',
              fontFamily: 'Space Grotesk, system-ui', fontSize: 11.5, fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>+ {g}</button>
          ))}
        </div>

        {/* Textarea */}
        <div style={{
          marginTop: 12, borderRadius: 14, padding: 2,
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.1)',
        }}>
          <textarea
            ref={taRef}
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setError(null); }}
            placeholder="Ej: Quiero ganar músculo, puedo entrenar 4 días, tengo molestias en el hombro derecho y no tengo barra en casa."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'none',
              background: 'transparent', border: 0, outline: 'none',
              color: '#fafafa', padding: '12px 13px',
              fontFamily: 'Space Grotesk, system-ui', fontSize: 14, lineHeight: 1.5,
              letterSpacing: -0.1,
            }}
          />
        </div>

        {error && (
          <div style={{
            marginTop: 10, fontSize: 12, color: '#ff8a7a',
            fontFamily: 'Space Grotesk, system-ui', lineHeight: 1.4,
          }}>{error}</div>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={!prompt.trim() || loading}
          style={{
            marginTop: 12, width: '100%', padding: '14px',
            borderRadius: 12, border: 0,
            cursor: (!prompt.trim() || loading) ? 'default' : 'pointer',
            background: (!prompt.trim() || loading) ? 'rgba(255,255,255,0.08)' : accent,
            color: (!prompt.trim() || loading) ? 'rgba(255,255,255,0.4)' : '#0a0a0a',
            fontFamily: 'Space Grotesk, system-ui', fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            boxShadow: (!prompt.trim() || loading) ? 'none' : `0 8px 24px ${accent}3a`,
            transition: 'all 0.2s',
          }}
        >
          {loading ? (
            <>
              <TypingDots color={'rgba(255,255,255,0.55)'} />
              Diseñando tu rutina…
            </>
          ) : (
            <>
              <CoachGlyph color={(!prompt.trim()) ? 'rgba(255,255,255,0.4)' : '#0a0a0a'} size={16} />
              Generar programa
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Program result — full-screen presentation
// ─────────────────────────────────────────────────────────────
function ProgramResultOverlay({ program, open, accent, onClose }) {
  const days = Array.isArray(program?.days) ? program.days : [];
  const shortDay = (d) => (d || '').slice(0, 3);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 140,
      pointerEvents: open ? 'auto' : 'none',
      opacity: open ? 1 : 0,
      visibility: open ? 'visible' : 'hidden',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: '#0b0b0c',
        display: 'flex', flexDirection: 'column',
      }}>
        {program && (<>
      {/* Header */}
      <div style={{ padding: '54px 20px 14px', flexShrink: 0, position: 'relative' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 50, right: 18,
          width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
          background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)',
          color: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 1l11 11M12 1L1 12" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
          color: accent, fontWeight: 600,
        }}>
          <CoachGlyph color={accent} size={14} /> Programa generado
        </div>
        <div style={{
          marginTop: 8,
          fontFamily: 'Space Grotesk, system-ui',
          fontSize: 27, fontWeight: 700, color: '#fafafa', letterSpacing: -1, lineHeight: 1.05,
          paddingRight: 40,
        }}>{program.name || 'Tu programa'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
          {program.focus && <Chip color={`${accent}1c`} text={accent}>{program.focus}</Chip>}
          {program.split && <Chip>{program.split}</Chip>}
          {program.daysPerWeek != null && <Chip>{program.daysPerWeek} días/sem</Chip>}
        </div>
      </div>

      {/* Scrollable day list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {days.map((d, i) => {
            const exs = Array.isArray(d.exercises) ? d.exercises : [];
            const isRest = exs.length === 0;
            return (
              <div key={i} style={{
                background: '#141414', borderRadius: 18,
                border: '0.5px solid rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: isRest ? 0 : '0.5px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    width: 40, height: 40, flexShrink: 0, borderRadius: 11,
                    background: isRest ? 'rgba(155,209,255,0.1)' : `${accent}16`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1,
                    textTransform: 'uppercase', fontWeight: 600,
                    color: isRest ? '#9bd1ff' : accent,
                    border: `0.5px solid ${isRest ? 'rgba(155,209,255,0.25)' : accent + '33'}`,
                  }}>{shortDay(d.day) || (i + 1)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Space Grotesk, system-ui',
                      fontSize: 16, fontWeight: 600, color: '#fafafa', letterSpacing: -0.3,
                    }}>{d.title || d.day}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      {d.focus || (isRest ? 'Recuperación' : '')}
                    </div>
                  </div>
                  {!isRest && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#fafafa', fontWeight: 500,
                      }}>{exs.length}</div>
                      {d.duration ? <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1,
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: 1,
                      }}>{d.duration}m</div> : null}
                    </div>
                  )}
                </div>
                {!isRest && (
                  <div style={{ padding: '4px 16px 10px' }}>
                    {exs.map((ex, j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 0',
                        borderTop: j === 0 ? 0 : '0.5px solid rgba(255,255,255,0.04)',
                      }}>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: accent,
                          opacity: 0.7, width: 18, flexShrink: 0,
                        }}>{String(j + 1).padStart(2, '0')}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'Space Grotesk, system-ui', fontSize: 14, fontWeight: 500,
                            color: '#fafafa', letterSpacing: -0.1, lineHeight: 1.25,
                          }}>{ex.name}</div>
                          {ex.muscle && <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{ex.muscle}</div>}
                        </div>
                        <div style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.8)',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>{ex.sets}<span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 2px' }}>×</span>{ex.reps}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {program.notes && (
            <div style={{
              padding: 14, borderRadius: 14,
              background: `${accent}0d`, border: `0.5px solid ${accent}26`,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 15, lineHeight: 1.2 }}>💡</div>
              <div style={{ flex: 1, fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                {program.notes}
              </div>
            </div>
          )}

          <div style={{
            textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.3, padding: '4px 10px',
          }}>
            Borrador generado por IA · revísalo antes de empezar
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div style={{ flexShrink: 0, padding: '10px 20px 30px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onClose} style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 0, cursor: 'pointer',
          background: accent, color: '#0a0a0a',
          fontFamily: 'Space Grotesk, system-ui', fontSize: 14, fontWeight: 700, letterSpacing: -0.1,
        }}>Cerrar</button>
      </div>
        </>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3a. Coach FAB — floating launch over the exercise detail
// ─────────────────────────────────────────────────────────────
function CoachFab({ visible, onClick, accent }) {
  return (
    <button onClick={onClick} aria-label="Abrir coach IA" style={{
      position: 'absolute', right: 16, bottom: 26, zIndex: 112,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 17px 12px 14px', borderRadius: 9999, border: 0,
      cursor: 'pointer', background: accent, color: '#0a0a0a',
      fontFamily: 'Space Grotesk, system-ui', fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2,
      boxShadow: `0 12px 30px ${accent}55, 0 3px 10px rgba(0,0,0,0.35)`,
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      <CoachGlyph color="#0a0a0a" size={17} />
      Coach IA
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 3b. Coach Overlay — per-exercise chat with tip / pain-triage flows
// ─────────────────────────────────────────────────────────────
function bodyPartsFor(muscle) {
  const m = (muscle || '').toLowerCase();
  const lower = ['Rodilla', 'Cadera', 'Espalda baja', 'Tobillo', 'Isquios'];
  const upperPush = ['Hombro', 'Codo', 'Muñeca', 'Pecho', 'Cuello'];
  const upperPull = ['Hombro', 'Codo', 'Espalda baja', 'Muñeca', 'Cuello'];
  if (/(pierna|cuád|cuad|femoral|glúteo|gluteo|pantorrilla|sóleo|soleo|isquio)/.test(m)) return lower.concat(['Hombro']);
  if (/(espalda|dorsal|trapecio|bíceps|biceps|remo)/.test(m)) return upperPull.concat(['Antebrazo']);
  return upperPush.concat(['Espalda baja']);
}

function CoachOverlay({ open, exercise, accent, units, onClose }) {
  const [thread, setThread] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [painMode, setPainMode] = React.useState(false);
  const scrollRef = React.useRef(null);
  const exId = exercise?.id;

  // Reset the conversation whenever the exercise changes or overlay reopens.
  React.useEffect(() => {
    if (open) { setThread([]); setInput(''); setPainMode(false); setLoading(false); }
  }, [exId, open]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading, painMode]);

  if (!exercise) return null;

  const greeting = `Hola 👋 Soy tu coach para «${exercise.name}». Pregúntame por la técnica, el peso, o cuéntame si algo te molesta y lo ajustamos.`;

  const send = async (rawText) => {
    const text = (rawText != null ? rawText : input).trim();
    if (!text || loading) return;
    setPainMode(false);
    const next = [...thread, { role: 'user', text }];
    setThread(next);
    setInput('');

    if (!(window.claude && window.claude.complete)) {
      setThread(t => [...t, { role: 'assistant', text: 'El coach IA no está disponible ahora mismo.' }]);
      return;
    }
    setLoading(true);
    const alts = (exercise.alternatives || []).map(a => a.name).join('; ');
    const preamble =
`Eres "Coach", un entrenador personal experto, cercano y conciso. Respondes SIEMPRE en español.
Contexto: el usuario está haciendo "${exercise.name}" (músculo principal: ${exercise.muscle}), prescrito ${exercise.sets}×${exercise.reps}, descanso ${exercise.rest}s.
Alternativas que puedes recomendar por su nombre si conviene: ${alts || '—'}.
Reglas de respuesta: máximo ~85 palabras, tono motivador y práctico, usa 2-3 viñetas cortas con "•" cuando ayude.
Si el usuario reporta dolor o molestia: prioriza la seguridad — da 1-2 ajustes de técnica y, si encaja, sugiere UNA alternativa de la lista por su nombre. No diagnostiques ni indiques tratamiento médico; si el dolor es agudo, fuerte o persistente, dile que pare y consulte a un profesional.`;
    const apiMessages = next.map((m, i) => ({
      role: m.role,
      content: i === 0 ? `${preamble}\n\nMensaje del usuario: ${m.text}` : m.text,
    }));
    try {
      const reply = await completeRetry({ messages: apiMessages });
      setThread(t => [...t, { role: 'assistant', text: (reply || '').trim() || 'No tengo una respuesta ahora mismo.' }]);
    } catch (e) {
      const busy = /overload|rate|429|503|busy/i.test(String(e && (e.message || e)));
      setThread(t => [...t, { role: 'assistant', text: busy
        ? 'Estoy recibiendo muchas consultas ahora mismo 😅 Espera unos segundos y vuelve a intentarlo.'
        : 'Ups, no pude responder. Inténtalo de nuevo en un momento.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    { label: 'Mejorar mi técnica', msg: '¿Cómo mejoro mi técnica en este ejercicio?' },
    { label: 'Me duele algo', pain: true },
    { label: '¿Voy muy pesado?', msg: '¿Cómo sé si estoy usando demasiado peso?' },
    { label: 'Variante más fácil', msg: 'Dame una variante más fácil de este ejercicio.' },
  ];
  const parts = bodyPartsFor(exercise.muscle);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 130,
      pointerEvents: open ? 'auto' : 'none',
      opacity: open ? 1 : 0,
      visibility: open ? 'visible' : 'hidden',
    }}>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
      }} />

      {/* panel */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
        background: '#0c0c0d',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          flexShrink: 0, padding: '52px 16px 12px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: `${accent}1c`, border: `0.5px solid ${accent}3a`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><CoachGlyph color={accent} size={19} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk, system-ui', fontSize: 16, fontWeight: 700,
              color: '#fafafa', letterSpacing: -0.3,
            }}>Coach IA</div>
            <div style={{
              fontSize: 11.5, color: 'rgba(255,255,255,0.5)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{exercise.name}</div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
            background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)',
            color: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13"><path d="M1 1l11 11M12 1L1 12" stroke="#fafafa" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 16px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bubble role="assistant" accent={accent}>{greeting}</Bubble>
            {thread.map((m, i) => (
              <Bubble key={i} role={m.role} accent={accent}>{m.text}</Bubble>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <CoachAvatar accent={accent} />
                <div style={{
                  background: '#17171a', borderRadius: '4px 16px 16px 16px',
                  border: '0.5px solid rgba(255,255,255,0.07)', padding: '12px 14px',
                }}><TypingDots color={accent} /></div>
              </div>
            )}
          </div>
        </div>

        {/* Pain body-part picker */}
        {painMode && (
          <div style={{
            flexShrink: 0, padding: '12px 16px',
            borderTop: '0.5px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.015)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1.4,
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontWeight: 600,
              }}>¿Dónde lo sientes?</div>
              <button onClick={() => setPainMode(false)} style={{
                background: 'transparent', border: 0, cursor: 'pointer', padding: 2,
                color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk', fontSize: 11,
              }}>× cancelar</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {parts.map(p => (
                <button key={p} onClick={() => send(`Siento molestia en ${p.toLowerCase()} al hacer este ejercicio. ¿Qué ajusto?`)} style={{
                  padding: '8px 13px', borderRadius: 9999, cursor: 'pointer',
                  background: `${accent}14`, border: `0.5px solid ${accent}3a`, color: accent,
                  fontFamily: 'Space Grotesk, system-ui', fontSize: 12.5, fontWeight: 600,
                }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Quick chips (hidden during pain picker) */}
        {!painMode && (
          <div style={{
            flexShrink: 0, padding: '10px 16px 8px',
            display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none',
          }}>
            {quickChips.map((c, i) => (
              <button key={i}
                onClick={() => (c.pain ? setPainMode(true) : send(c.msg))}
                disabled={loading}
                style={{
                  flexShrink: 0, padding: '8px 13px', borderRadius: 9999,
                  cursor: loading ? 'default' : 'pointer',
                  background: c.pain ? `${accent}16` : 'rgba(255,255,255,0.05)',
                  border: c.pain ? `0.5px solid ${accent}3a` : '0.5px solid rgba(255,255,255,0.1)',
                  color: c.pain ? accent : 'rgba(255,255,255,0.8)',
                  fontFamily: 'Space Grotesk, system-ui', fontSize: 12.5, fontWeight: 600,
                  whiteSpace: 'nowrap', opacity: loading ? 0.5 : 1,
                }}>
                {c.pain && '⚠ '}{c.label}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          flexShrink: 0, padding: '6px 16px 28px',
          display: 'flex', alignItems: 'flex-end', gap: 9,
        }}>
          <div style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 22,
            padding: '4px 6px 4px 16px', display: 'flex', alignItems: 'center',
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
              placeholder="Escribe tu pregunta…"
              style={{
                flex: 1, background: 'transparent', border: 0, outline: 'none', color: '#fafafa',
                fontFamily: 'Space Grotesk, system-ui', fontSize: 14, padding: '8px 0', minWidth: 0,
              }}
            />
          </div>
          <button onClick={() => send()} disabled={!input.trim() || loading} aria-label="Enviar" style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0, padding: 0,
            cursor: (!input.trim() || loading) ? 'default' : 'pointer',
            background: (!input.trim() || loading) ? 'rgba(255,255,255,0.08)' : accent,
            border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 15V3M9 3l-5 5M9 3l5 5"
                stroke={(!input.trim() || loading) ? 'rgba(255,255,255,0.35)' : '#0a0a0a'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CoachAvatar({ accent }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
      background: `${accent}1c`, border: `0.5px solid ${accent}3a`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><CoachGlyph color={accent} size={13} /></div>
  );
}

function Bubble({ role, accent, children }) {
  const isUser = role === 'user';
  // light bullet formatting: turn "• " lines into spaced lines
  const text = String(children);
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '86%',
    }}>
      {!isUser && <CoachAvatar accent={accent} />}
      <div style={{
        background: isUser ? accent : '#17171a',
        color: isUser ? '#0a0a0a' : 'rgba(255,255,255,0.92)',
        border: isUser ? 0 : '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        padding: '11px 14px',
        fontFamily: 'Space Grotesk, system-ui', fontSize: 14, lineHeight: 1.5,
        letterSpacing: -0.1, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontWeight: isUser ? 600 : 400,
      }}>{text}</div>
    </div>
  );
}

Object.assign(window, {
  ProgramGenerator, ProgramResultOverlay, CoachFab, CoachOverlay,
  TypingDots, CoachGlyph, AI_KEYFRAMES,
});
