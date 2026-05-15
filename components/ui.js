// ── Chip ──
function Chip({ children, color, textColor, style }) {
  const el = document.createElement('span')
  el.className = 'pill'
  el.style.background = color || 'rgba(255,255,255,0.08)'
  el.style.color = textColor || '#fafafa'
  el.style.fontSize = '10px'
  if (style) Object.assign(el.style, style)
  if (typeof children === 'string') el.textContent = children
  else el.appendChild(children)
  return el
}

// ── Section Label ──
function SectionLabel({ children, accent }) {
  const el = document.createElement('div')
  el.style.cssText = `display:flex;align-items:center;gap:8px;padding:0 20px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500`
  el.innerHTML = `<span style="width:4px;height:4px;border-radius:50%;background:${accent || '#d4ff3a'};flex-shrink:0;display:inline-block"></span>`
  const label = document.createElement('span')
  label.textContent = children
  el.appendChild(label)
  return el
}

// ── Stat Block ──
function StatBlock({ value, label, unit, accent, size }) {
  const s = size === 'md' ? { num: 22, unit: 11 } : { num: 30, unit: 14 }
  const el = document.createElement('div')
  el.style.textAlign = 'left'
  el.style.minWidth = '0'
  el.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:${s.num}px;font-weight:500;color:${accent || '#fafafa'};line-height:1;letter-spacing:-1px;white-space:nowrap">
      ${value}${unit ? `<span style="font-size:${s.unit}px;color:rgba(255,255,255,0.4);margin-left:4px">${unit}</span>` : ''}
    </div>
    <div style="margin-top:6px;font-size:10px;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace">${label}</div>
  `
  return el
}

// ── Exercise Placeholder ──
function ExercisePlaceholder({ name, muscle, accent, size, imgUrl }) {
  const h = { sm: 80, md: 140, lg: 200, xl: 240 }[size || 'lg'] || 200
  const el = document.createElement('div')
  el.style.cssText = `height:${h}px;border-radius:18px;overflow:hidden;position:relative;background:#161616;border:0.5px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;justify-content:space-between;padding:14px;box-sizing:border-box`

  if (imgUrl) {
    el.style.background = `#161616 url(${imgUrl}) center/cover no-repeat`
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(255,255,255,0.4);text-transform:uppercase;background:rgba(0,0,0,0.5);padding:2px 8px;border-radius:4px">${muscle}</div>
        <div style="width:8px;height:8px;border-radius:50%;background:${accent || '#d4ff3a'};box-shadow:0 0 10px ${accent || '#d4ff3a'}"></div>
      </div>
      <div style="position:relative;z-index:1">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:${size === 'sm' ? 14 : 22}px;font-weight:600;color:#fafafa;letter-spacing:-0.5px;line-height:1.05;text-shadow:0 2px 8px rgba(0,0,0,0.6)">${name}</div>
      </div>`
  } else {
    const stripe = 'repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 24px, rgba(255,255,255,0.04) 24px 48px)'
    el.style.background = `#161616`
    el.style.backgroundImage = stripe
    el.innerHTML = `
      <div style="position:absolute;width:220px;height:220px;border-radius:50%;background:${accent || '#d4ff3a'};opacity:0.06;filter:blur(60px);top:-60px;right:-60px;pointer-events:none"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;color:rgba(255,255,255,0.4);text-transform:uppercase">[ photo · ${muscle} ]</div>
        <div style="width:8px;height:8px;border-radius:50%;background:${accent || '#d4ff3a'};box-shadow:0 0 10px ${accent || '#d4ff3a'}"></div>
      </div>
      <div style="position:relative;z-index:1">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:${size === 'sm' ? 14 : 22}px;font-weight:600;color:#fafafa;letter-spacing:-0.5px;line-height:1.05">${name}</div>
      </div>`
  }
  return el
}

// ── Bottom Tab Bar ──
function TabBar({ active, onChange, accent }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: TabIconHome },
    { id: 'plan', label: 'Plan', icon: TabIconCal },
    { id: 'history', label: 'History', icon: TabIconChart },
    { id: 'you', label: 'You', icon: TabIconUser },
  ]
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;bottom:0;left:0;right:0;z-index:30;padding:8px 12px 28px;pointer-events:none`
  const inner = document.createElement('div')
  inner.style.cssText = `display:flex;justify-content:space-around;align-items:center;background:rgba(20,20,20,0.85);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:0.5px solid rgba(255,255,255,0.08);border-radius:9999px;padding:8px 12px;box-shadow:0 12px 32px rgba(0,0,0,0.4);pointer-events:auto`
  tabs.forEach((t) => {
    const btn = document.createElement('button')
    const on = active === t.id
    btn.style.cssText = `flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;background:none;border:0;cursor:pointer;color:${on ? accent : 'rgba(255,255,255,0.45)'};transition:color 0.2s;font-family:${getComputedStyle(document.body).fontFamily}`
    btn.innerHTML = `
      ${t.icon({ active: on })}
      <span style="font-size:9.5px;letter-spacing:0.6px;font-weight:600;font-family:'Space Grotesk',sans-serif;text-transform:uppercase">${t.label}</span>`
    btn.addEventListener('click', () => onChange(t.id))
    inner.appendChild(btn)
  })
  el.appendChild(inner)
  return el
}

function TabIconHome({ active }) {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 8.5L10 3l7 5.5V16a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1V8.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="${active ? 'currentColor' : 'none'}" fill-opacity="${active ? 0.15 : 0}"/></svg>`
}
function TabIconCal({ active }) {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" stroke-width="1.6" fill="${active ? 'currentColor' : 'none'}" fill-opacity="${active ? 0.15 : 0}"/><path d="M3 8h14M7 3v3M13 3v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
}
function TabIconChart({ active }) {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 16h14M5 13V8m4 5V5m4 8v-6m4 6v-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
}
function TabIconUser({ active }) {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.2" stroke="currentColor" stroke-width="1.6" fill="${active ? 'currentColor' : 'none'}" fill-opacity="${active ? 0.15 : 0}"/><path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
}

// ── Bottom Sheet ──
function Sheet({ open, onClose, children }) {
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:100;pointer-events:auto'
  const backdrop = document.createElement('div')
  backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.45);transition:background 0.25s'
  backdrop.addEventListener('click', () => { cleanup(); onClose() })
  overlay.appendChild(backdrop)

  const sheet = document.createElement('div')
  sheet.style.cssText = 'position:absolute;left:0;right:0;bottom:0;background:#0e0e0e;border-radius:28px 28px 0 0;max-height:92%;overflow:hidden;box-shadow:0 -20px 40px rgba(0,0,0,0.5);border:0.5px solid rgba(255,255,255,0.08);display:flex;flex-direction:column'
  const handle = document.createElement('div')
  handle.style.cssText = 'width:36px;height:5px;border-radius:3px;background:rgba(255,255,255,0.18);margin:10px auto 0;flex-shrink:0'
  sheet.appendChild(handle)
  const body = document.createElement('div')
  body.style.cssText = 'overflow:auto;flex:1'
  if (typeof children === 'string') body.innerHTML = children
  else body.appendChild(typeof children === 'function' ? children() : children)
  sheet.appendChild(body)
  overlay.appendChild(sheet)
  document.body.style.overflow = 'hidden'

  function cleanup() {
    document.body.style.overflow = ''
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }

  return overlay
}
