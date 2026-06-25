# Warmup/Stretch — Secciones Normalizadas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Transform `data/warmup.js` from single `desc` field to structured `posInicial`, `ejecucion`, `respiracion`, `duracion`, `stallbar` fields and update `components/warmup.js` to render them as sectioned cards.

**Architecture:** Static data transformation via Node.js script + view update in warmup.js. No IndexedDB changes needed.

**Tech Stack:** Vanilla JS (Node.js for transform script, browser JS for view)

---

### Task 1: Write transformation script

**Files:**
- Create: `scripts/transform-warmup-desc.js`

- [ ] **Step 1: Write the transform script**

```js
const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'data', 'warmup.js')
let content = fs.readFileSync(filePath, 'utf-8')
let result = content
const replacements = []

// Match each "desc": "..." — the value is always the last field in each object
const descRegex = /"desc":\s*"([^"]*)"/g
let match

while ((match = descRegex.exec(content)) !== null) {
  const descValue = match[1]

  // Detect STALLBAR prefix
  const isStallbar = descValue.startsWith('STALLBAR - ')
  const cleanDesc = isStallbar ? descValue.slice(12) : descValue

  // Compute indentation from the line containing "desc"
  const lineStart = content.lastIndexOf('\n', match.index) + 1
  const indent = content.substring(lineStart, match.index)

  // Parse 4 sections from the desc text
  const sections = { posInicial: '', ejecucion: '', respiracion: '', duracion: '' }

  const posM = cleanDesc.match(/^Posición inicial:\s*(.*?)(?=\s+Ejecución:\s)/)
  const ejM  = cleanDesc.match(/Ejecución:\s*(.*?)(?=\s+Respiración:\s)/)
  const respM= cleanDesc.match(/Respiración:\s*(.*?)(?=\s+Duración(?:\/Reps)?:\s)/)
  const durM = cleanDesc.match(/Duración(?:\/Reps)?:\s*(.*?)$/)

  if (posM)  sections.posInicial  = posM[1]
  if (ejM)   sections.ejecucion   = ejM[1]
  if (respM) sections.respiracion = respM[1]
  if (durM)  sections.duracion    = durM[1]

  // Build replacement (desc is always the last field, so eat the trailing comma)
  const newFields = [
    `posInicial: '${sections.posInicial.replace(/'/g, "\\'")}'`,
    `ejecucion: '${sections.ejecucion.replace(/'/g, "\\'")}'`,
    `respiracion: '${sections.respiracion.replace(/'/g, "\\'")}'`,
    `duracion: '${sections.duracion.replace(/'/g, "\\'")}'`,
  ]
  if (isStallbar) newFields.push('stallbar: true')

  const replacement = newFields.join(',\n' + indent)

  // End of match: include trailing comma on the same line (if any)
  const endIdx = match.index + match[0].length
  const end = content[endIdx] === ',' ? endIdx + 1 : endIdx

  replacements.push({ start: match.index, end, replacement })
}

// Apply in reverse to preserve indices
replacements.reverse()
for (const r of replacements) {
  result = result.substring(0, r.start) + r.replacement + result.substring(r.end)
}

fs.writeFileSync(filePath, result, 'utf-8')
console.log(`Transformed ${replacements.length} entries.`)
```

- [ ] **Step 2: Run the script and verify**

Run: `node scripts/transform-warmup-desc.js`
Expected: `Transformed 80 entries.`

- [ ] **Step 3: Verify output manually**

Check that the first entry now looks like:
```js
{
  "name": "Flexiones Dinámicas Excéntricas contra Pared",
  posInicial: 'Colócate frente a una pared lisa...',
  ejecucion: 'Flexiona los codos lentamente...',
  respiracion: 'Inhala durante la fase de descenso...',
  duracion: 'Realiza de 12 a 15 repeticiones...',
},
```

And a STALLBAR entry looks like:
```js
{
  "name": "Apertura de Pecho Pasiva en Espaldera",
  posInicial: 'Colócate de espaldas a la espaldera...',
  ejecucion: 'Da un paso largo hacia adelante...',
  respiracion: 'Inhala llenando por completo el pecho...',
  duracion: 'Mantén este estiramiento estático durante 25 a 30 segundos...',
  stallbar: true,
},
```

And GENERIC_WARMUP entries are unchanged.

- [ ] **Step 4: Remove the transform script**

```bash
rm scripts/transform-warmup-desc.js
```

---

### Task 2: Update `components/warmup.js` — render sectioned cards

**Files:**
- Modify: `components/warmup.js:324-334`

- [ ] **Step 1: Replace the description rendering block**

Replace lines 324-334:
```js
    // Description
    const descWrap = document.createElement('div')
    descWrap.style.cssText = 'padding:14px 18px 0'
    const descText = item.desc && item.desc.startsWith('STALLBAR - ') ? item.desc.slice(12) : (item.desc || '')
    descWrap.innerHTML = `
      <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:10px">
        <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
        Cómo hacerlo
      </div>
      <div style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.05px">${descText}</div>`
    sw.appendChild(descWrap)
```

With:
```js
    // Description — sectioned cards or fallback to legacy desc
    const descWrap = document.createElement('div')
    descWrap.style.cssText = 'padding:14px 18px 0'

    const sections = [
      { id: 'posInicial', label: 'Posición Inicial', value: item.posInicial },
      { id: 'ejecucion', label: 'Ejecución', value: item.ejecucion },
      { id: 'respiracion', label: 'Respiración', value: item.respiracion },
      { id: 'duracion', label: 'Duración', value: item.duracion },
    ]

    const hasSections = sections.some(s => s.value)

    if (hasSections) {
      sections.forEach((s, idx) => {
        if (!s.value) return
        const card = document.createElement('div')
        card.style.cssText = `background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px 14px;margin-bottom:6px`
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:8px">
            <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
            ${s.label}
          </div>
          <div style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.05px">${s.value}</div>`
        descWrap.appendChild(card)
      })
    } else if (item.desc) {
      // Fallback for GENERIC_WARMUP or legacy data
      descWrap.innerHTML = `
        <div style="display:flex;align-items:baseline;gap:8px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:600;margin-bottom:10px">
          <div style="width:4px;height:4px;border-radius:50%;background:${accent}"></div>
          Cómo hacerlo
        </div>
        <div style="font-size:14px;line-height:1.7;color:rgba(255,255,255,0.82);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.05px">${item.desc}</div>`
    }
    sw.appendChild(descWrap)
```

- [ ] **Step 2: Update STALLBAR badge detection (line 311)**

Replace line 311:
```js
${item.desc && item.desc.startsWith('STALLBAR - ') ? '<span ...>STALLBAR</span>' : ''}`
```
With:
```js
${item.stallbar ? '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:4px;background:#f59e0b;font-family:\'JetBrains Mono\',monospace;font-size:8px;letter-spacing:1.2px;text-transform:uppercase;color:#0a0a0a;font-weight:600">STALLBAR</span>' : ''}`
```

---

### Task 3: Verify and commit

- [ ] **Step 1: Run tests**

Run: `npx playwright test` (or `npm test`)
Expected: All tests pass

- [ ] **Step 2: Commit**

```bash
git add data/warmup.js components/warmup.js scripts/transform-warmup-desc.js docs/superpowers/
git status
git commit -m "v1.71 · 2026-06-25 · Warmup/stretch con secciones normalizadas"

# Then remove transform script from tracking
git rm scripts/transform-warmup-desc.js
```
