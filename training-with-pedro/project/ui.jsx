// ui.jsx — Shared UI primitives for the gym app

// ─────────────────────────────────────────────────────────────
// Striped placeholder used for exercise imagery (no real photos)
// ─────────────────────────────────────────────────────────────
function ExercisePlaceholder({ name, muscle, accent = "#d4ff3a", size = "lg", style }) {
  const heights = { sm: 80, md: 140, lg: 200, xl: 240 };
  const h = heights[size] || 200;
  const stripe = `repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 24px, rgba(255,255,255,0.04) 24px 48px)`;
  return (
    <div style={{
      height: h, borderRadius: 18, overflow: 'hidden', position: 'relative',
      background: '#161616',
      backgroundImage: stripe,
      border: '0.5px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: 14, boxSizing: 'border-box',
      ...style,
    }}>
      {/* Soft glow blob */}
      <div style={{
        position: 'absolute', width: 220, height: 220, borderRadius: '50%',
        background: accent, opacity: 0.06, filter: 'blur(60px)',
        top: -60, right: -60, pointerEvents: 'none',
      }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}>[ photo · {muscle} ]</div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: accent,
          boxShadow: `0 0 10px ${accent}`,
        }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: size === 'sm' ? 14 : 22, fontWeight: 600,
          color: '#fafafa', letterSpacing: -0.5, lineHeight: 1.05,
        }}>{name}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill / chip
// ─────────────────────────────────────────────────────────────
function Chip({ children, color = "rgba(255,255,255,0.08)", text = "#fafafa", style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 9999,
      background: color, color: text,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 10, fontWeight: 500, letterSpacing: 1,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...style,
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// Stat block (big number + label)
// ─────────────────────────────────────────────────────────────
function StatBlock({ value, label, unit, accent = "#fafafa", align = "left", size = "lg" }) {
  const sizes = { lg: { num: 30, unit: 14 }, md: { num: 22, unit: 11 } };
  const s = sizes[size];
  return (
    <div style={{ textAlign: align, minWidth: 0 }}>
      <div style={{
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: s.num, fontWeight: 500, color: accent,
        lineHeight: 1, letterSpacing: -1,
        whiteSpace: 'nowrap',
      }}>
        {value}
        {unit && <span style={{ fontSize: s.unit, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{
        marginTop: 6, fontSize: 10, letterSpacing: 1.4,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      }}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar (bottom)
// ─────────────────────────────────────────────────────────────
function TabBar({ active, onChange, accent }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: TabIconHome },
    { id: 'plan', label: 'Plan', icon: TabIconCal },
    { id: 'history', label: 'History', icon: TabIconChart },
    { id: 'me', label: 'You', icon: TabIconUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      padding: '8px 12px 28px', pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 9999, padding: '8px 12px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
        pointerEvents: 'auto',
      }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 4px', background: 'none', border: 0, cursor: 'pointer',
              color: on ? accent : 'rgba(255,255,255,0.45)',
              transition: 'color 0.2s',
            }}>
              <Icon active={on} />
              <span style={{
                fontSize: 9.5, letterSpacing: 0.6, fontWeight: 600,
                fontFamily: 'Space Grotesk, system-ui',
                textTransform: 'uppercase',
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TabIconHome({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 8.5L10 3l7 5.5V16a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1V8.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
    </svg>
  );
}
function TabIconCal({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.6"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M3 8h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function TabIconChart({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 16h14M5 13V8m4 5V5m4 8v-6m4 6v-3"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function TabIconUser({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6"
        fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Sheet modal (slides up from bottom)
// ─────────────────────────────────────────────────────────────
function Sheet({ open, onClose, children }) {
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      pointerEvents: open ? 'auto' : 'none',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: open ? 'rgba(0,0,0,0.45)' : 'transparent',
        transition: 'background 0.25s',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#0e0e0e',
        borderRadius: '28px 28px 0 0',
        maxHeight: '92%', overflow: 'hidden',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        boxShadow: '0 -20px 40px rgba(0,0,0,0.5)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          width: 36, height: 5, borderRadius: 3,
          background: 'rgba(255,255,255,0.18)',
          margin: '10px auto 0', flexShrink: 0,
        }} />
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini SVG sparkline for history
// ─────────────────────────────────────────────────────────────
function Sparkline({ data, width = 100, height = 30, color = "#d4ff3a" }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.top);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pad = 3;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((d.top - min) / range) * h;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Full chart with grid for history detail
// ─────────────────────────────────────────────────────────────
function LineChart({ data, width = 340, height = 160, color = "#d4ff3a", unit = "kg" }) {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d.top);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = { t: 20, r: 16, b: 28, l: 36 };
  const w = width - pad.l - pad.r;
  const h = height - pad.t - pad.b;
  const range = max - min || 1;
  const yMin = min - range * 0.15;
  const yMax = max + range * 0.15;
  const yRange = yMax - yMin;
  const pts = data.map((d, i) => {
    const x = pad.l + (i / (data.length - 1)) * w;
    const y = pad.t + h - ((d.top - yMin) / yRange) * h;
    return { x, y, d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = path + ` L ${pts[pts.length - 1].x} ${pad.t + h} L ${pts[0].x} ${pad.t + h} Z`;
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {yTicks.map((v, i) => {
        const y = pad.t + h - ((v - yMin) / yRange) * h;
        return (
          <g key={i}>
            <line x1={pad.l} x2={pad.l + w} y1={y} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={y + 3} fill="rgba(255,255,255,0.4)"
              fontSize="9" textAnchor="end"
              fontFamily="JetBrains Mono, monospace">{Math.round(v)}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#areaFill)" />
      <path d={path} stroke={color} strokeWidth="2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4 : 2.5}
          fill={i === pts.length - 1 ? color : '#0a0a0a'}
          stroke={color} strokeWidth="1.5" />
      ))}
      {/* x labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={height - 10} fill="rgba(255,255,255,0.4)"
          fontSize="9" textAnchor="middle"
          fontFamily="JetBrains Mono, monospace">{p.d.date}</text>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.5)', fontWeight: 500,
      padding: '0 20px',
    }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent || '#d4ff3a' }} />
      {children}
    </div>
  );
}

Object.assign(window, {
  ExercisePlaceholder, Chip, StatBlock, TabBar, Sheet, Sparkline, LineChart, SectionLabel,
});
