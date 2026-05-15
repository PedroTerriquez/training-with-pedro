function Sparkline({ data, width, height, color }) {
  if (!data || data.length < 2) return ''
  const vals = data.map((d) => d.weight !== undefined ? d.weight : d.top)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pad = 3
  const w = (width || 100) - pad * 2
  const h = (height || 30) - pad * 2
  const pts = data.map((d, i) => {
    const v = d.weight !== undefined ? d.weight : d.top
    const x = pad + (i / (data.length - 1)) * w
    const y = pad + h - ((v - min) / range) * h
    return [x, y]
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ')
  const last = pts[pts.length - 1]
  return `<svg width="${width || 100}" height="${height || 30}" style="display:block"><path d="${path}" fill="none" stroke="${color || '#d4ff3a'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5" fill="${color || '#d4ff3a'}"/></svg>`
}

function LineChart({ data, width, height, color, unit }) {
  if (!data || data.length === 0) return ''
  const vals = data.map((d) => d.weight !== undefined ? d.weight : d.top)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const pad = { t: 20, r: 16, b: 28, l: 36 }
  const w = (width || 340) - pad.l - pad.r
  const h = (height || 160) - pad.t - pad.b
  const range = max - min || 1
  const yMin = min - range * 0.15
  const yMax = max + range * 0.15
  const yRange = yMax - yMin
  const pts = data.map((d, i) => {
    const v = d.weight !== undefined ? d.weight : d.top
    const x = pad.l + (i / (data.length - 1)) * w
    const y = pad.t + h - ((v - yMin) / yRange) * h
    return { x, y, label: d.date || '' }
  })
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')
  const areaPath = path + ` L${pts[pts.length - 1].x} ${pad.t + h} L${pts[0].x} ${pad.t + h} Z`
  const yTicks = [yMin, (yMin + yMax) / 2, yMax]
  const c = color || '#d4ff3a'

  let svg = `<svg width="${width || 340}" height="${height || 160}" style="display:block;overflow:visible">
    <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0"/>
    </linearGradient></defs>`

  yTicks.forEach((v) => {
    const y = pad.t + h - ((v - yMin) / yRange) * h
    svg += `<line x1="${pad.l}" x2="${pad.l + w}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="2 4"/>
      <text x="${pad.l - 8}" y="${y + 3}" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="end" font-family="JetBrains Mono,monospace">${Math.round(v)}</text>`
  })

  svg += `<path d="${areaPath}" fill="url(#areaFill)"/><path d="${path}" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`

  pts.forEach((p, i) => {
    const isLast = i === pts.length - 1
    svg += `<circle cx="${p.x}" cy="${p.y}" r="${isLast ? 4 : 2.5}" fill="${isLast ? c : '#0a0a0a'}" stroke="${c}" stroke-width="1.5"/>`
    svg += `<text x="${p.x}" y="${height - 10}" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle" font-family="JetBrains Mono,monospace">${p.label}</text>`
  })

  svg += '</svg>'
  return svg
}
