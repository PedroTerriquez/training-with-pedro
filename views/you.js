// ── You screen ──
// Stats, settings, exercise + program CRUD, CSV import

let _youTab = 'stats'

function mountYou(container, { accent, units, settings, onRefresh }) {
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const header = document.createElement('div')
  header.style.padding = '56px 20px 16px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.45);text-transform:uppercase">Profile</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px"><span id="user-name" contenteditable style="outline:none;border:0;caret-color:${accent};display:inline-block;min-width:50px">${settings.userName || 'Pedro'}</span>.</div>`
  page.appendChild(header)

  // Section tabs
  const tabs = document.createElement('div')
  tabs.style.cssText = 'margin:0 20px;display:flex;padding:3px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06)'
  const tabOptions = [
    { id: 'stats', label: 'Data' },
    { id: 'exercises', label: 'Exercises' },
    { id: 'programs', label: 'Programs' },
  ]
  tabOptions.forEach((t) => {
    const btn = document.createElement('button')
    const on = _youTab === t.id
    btn.style.cssText = `flex:1;padding:8px 0;border:0;cursor:pointer;background:${on ? '#262626' : 'transparent'};color:${on ? '#fafafa' : 'rgba(255,255,255,0.5)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;letter-spacing:-0.1px;border-radius:8px`
    btn.textContent = t.label
    btn.addEventListener('click', () => { _youTab = t.id; mountYou(container, { accent, units, settings, onRefresh }) })
    tabs.appendChild(btn)
  })
  page.appendChild(tabs)

  const body = document.createElement('div')
  body.style.cssText = 'margin-top:20px'
  page.appendChild(body)

  if (_youTab === 'stats') renderStats(body, { accent, units, settings, onRefresh })
  else if (_youTab === 'exercises') renderExercises(body, { accent, units, onRefresh })
  else if (_youTab === 'programs') renderPrograms(body, { accent, settings, onRefresh })
}

function renderStats(container, { accent, units, settings, onRefresh }) {
  // Settings
  const settingsLabel = document.createElement('div')
  settingsLabel.style.cssText = 'margin-bottom:10px'
  settingsLabel.appendChild(SectionLabel({ children: 'Quick settings', accent }))
  container.appendChild(settingsLabel)

  const settingsCard = document.createElement('div')
  settingsCard.style.cssText = 'margin:0 20px;background:#141414;border-radius:18px;padding:4px;border:0.5px solid rgba(255,255,255,0.06)'
  settingsCard.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">Units</div>
      <button id="units-btn" style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace;background:none;border:0;cursor:pointer">${units === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}</button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">Accent color</div>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="color" id="accent-input" value="${accent}" style="width:40px;height:28px;border:0.5px solid rgba(255,255,255,0.1);border-radius:6px;padding:0;background:transparent;cursor:pointer">
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">Estatura</div>
      <div style="display:flex;align-items:center;gap:4px">
        <input id="height-input" type="number" value="${settings.height || ''}" style="width:72px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'JetBrains Mono',monospace">
        <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace">cm</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:0.5px solid rgba(255,255,255,0.04)">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">Peso</div>
      <div style="display:flex;align-items:center;gap:4px">
        <input id="weight-input" type="number" value="${settings.weight || ''}" style="width:72px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'JetBrains Mono',monospace">
        <span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace">kg</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px">
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">Sexo</div>
      <select id="sex-input" style="padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box;font-family:'Space Grotesk',sans-serif;cursor:pointer">
        <option value="" ${!settings.sex ? 'selected' : ''}>Seleccionar</option>
        <option value="Masculino" ${settings.sex === 'Masculino' ? 'selected' : ''}>Masculino</option>
        <option value="Femenino" ${settings.sex === 'Femenino' ? 'selected' : ''}>Femenino</option>
        <option value="Otro" ${settings.sex === 'Otro' ? 'selected' : ''}>Otro</option>
      </select>
    </div>`
  container.appendChild(settingsCard)

  // Data Import
  const importLabel = document.createElement('div')
  importLabel.style.cssText = 'margin-top:26px;margin-bottom:10px'
  importLabel.appendChild(SectionLabel({ children: 'Data Import', accent }))
  container.appendChild(importLabel)

  // CSV import (program)
  const csvSection = document.createElement('div')
  csvSection.style.cssText = 'margin:0 20px 12px'
  csvSection.innerHTML = `
    <div style="padding:16px;background:rgba(212,255,58,0.04);border-radius:14px;border:0.5px solid ${accent}22">
      <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:10px">
        <strong style="color:#fafafa">Import program from CSV</strong> — format: week, day, exercise_name, muscle, sets, reps, rest_sec
      </div>
      <input type="file" id="csv-input" accept=".csv" style="display:none">
      <button id="csv-btn" class="btn btn-primary" style="padding:8px 16px;font-size:12px">Choose CSV file</button>
      <div id="csv-status" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)"></div>
    </div>`
  container.appendChild(csvSection)

  // CSV import (exercises)
  const csvExSection = document.createElement('div')
  csvExSection.style.cssText = 'margin:0 20px 0'
  csvExSection.innerHTML = `
    <div style="padding:16px;background:rgba(212,255,58,0.04);border-radius:14px;border:0.5px solid ${accent}22">
      <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:10px">
        <strong style="color:#fafafa">Import exercises from CSV</strong> — format: name, muscle, image_url, tips, alternatives (skips existing)
      </div>
      <input type="file" id="csv-ex-input" accept=".csv" style="display:none">
      <button id="csv-ex-btn" class="btn btn-primary" style="padding:8px 16px;font-size:12px">Choose CSV file</button>
      <div id="csv-ex-status" style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)"></div>
    </div>`
  container.appendChild(csvExSection)

  // Events
  setTimeout(() => {
    const unitsBtn = document.getElementById('units-btn')
    if (unitsBtn) {
      unitsBtn.addEventListener('click', async () => {
        const s = await Storage.getSettings()
        s.units = s.units === 'kg' ? 'lb' : 'kg'
        await Storage.saveSettings(s)
        if (onRefresh) onRefresh()
      })
    }
    const accentInput = document.getElementById('accent-input')
    if (accentInput) {
      accentInput.addEventListener('input', async (e) => {
        const s = await Storage.getSettings()
        s.accentColor = e.target.value
        await Storage.saveSettings(s)
        document.documentElement.style.setProperty('--accent', e.target.value)
        if (onRefresh) onRefresh()
      })
    }
    const heightInput = document.getElementById('height-input')
    if (heightInput) {
      heightInput.addEventListener('blur', async () => {
        const s = await Storage.getSettings()
        s.height = heightInput.value
        await Storage.saveSettings(s)
      })
    }
    const weightInput = document.getElementById('weight-input')
    if (weightInput) {
      weightInput.addEventListener('blur', async () => {
        const s = await Storage.getSettings()
        s.weight = weightInput.value
        await Storage.saveSettings(s)
      })
    }
    const sexInput = document.getElementById('sex-input')
    if (sexInput) {
      sexInput.addEventListener('change', async () => {
        const s = await Storage.getSettings()
        s.sex = sexInput.value
        await Storage.saveSettings(s)
      })
    }
    const userNameEl = document.getElementById('user-name')
    if (userNameEl) {
      userNameEl.addEventListener('blur', async () => {
        const s = await Storage.getSettings()
        s.userName = userNameEl.textContent.trim() || 'Pedro'
        await Storage.saveSettings(s)
        if (onRefresh) onRefresh()
      })
      userNameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          userNameEl.blur()
        }
      })
    }
    const csvBtn = document.getElementById('csv-btn')
    const csvInput = document.getElementById('csv-input')
    const csvStatus = document.getElementById('csv-status')
    if (csvBtn && csvInput) {
      csvBtn.addEventListener('click', () => csvInput.click())
      csvInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
          const text = await file.text()
          const prog = await Storage.importProgramFromCSV(text)
          csvStatus.textContent = `✅ Imported "${prog.name}" with ${prog.weeks.length} week(s)`
          csvStatus.style.color = accent
          setTimeout(async () => {
            _youTab = 'programs'
            if (onRefresh) await onRefresh()
          }, 2000)
        } catch (err) {
          csvStatus.textContent = `❌ ${err.message}`
          csvStatus.style.color = '#ff6b6b'
        }
      })
    }

    const csvExBtn = document.getElementById('csv-ex-btn')
    const csvExInput = document.getElementById('csv-ex-input')
    const csvExStatus = document.getElementById('csv-ex-status')
    if (csvExBtn && csvExInput) {
      csvExBtn.addEventListener('click', () => csvExInput.click())
      csvExInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
          const text = await file.text()
          const result = await Storage.importExercisesFromCSV(text)
          csvExStatus.textContent = `✅ Created ${result.created}, updated ${result.updated}`
          csvExStatus.style.color = accent
          setTimeout(async () => {
            _youTab = 'exercises'
            if (onRefresh) await onRefresh()
          }, 2000)
        } catch (err) {
          csvExStatus.textContent = `❌ ${err.message}`
          csvExStatus.style.color = '#ff6b6b'
        }
      })
    }
  }, 0)
}

// ── Exercise CRUD ──
function renderExercises(container, { accent, units, onRefresh }) {
  Storage.getExercises().then((exercises) => {
    // Header + add btn
    const toolbar = document.createElement('div')
    toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0 20px 12px'
    toolbar.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500">${exercises.length} exercises</div>`
    const addBtn = document.createElement('button')
    addBtn.style.cssText = `padding:8px 16px;border-radius:8px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;touch-action:manipulation`
    addBtn.textContent = '+ New'
    addBtn.addEventListener('click', () => showExerciseEdit(null, accent, onRefresh))
    toolbar.appendChild(addBtn)
    container.appendChild(toolbar)

    if (exercises.length === 0) {
      container.innerHTML += `<div style="padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No exercises yet. Create your first one.</div>`
      return
    }

    const list = document.createElement('div')
    list.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:8px'
    exercises.forEach((e) => {
      const card = document.createElement('div')
      card.style.cssText = `background:#141414;border-radius:14px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;gap:12px`
      card.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${e.name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">${e.muscle}</div>
        </div>
        <button class="edit-ex-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;touch-action:manipulation">Edit</button>
        <button class="del-ex-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,107,107,0.12);color:#ff6b6b;font-size:13px;touch-action:manipulation">Del</button>`
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.edit-ex-btn')) showExerciseEdit(e, accent, onRefresh)
        else if (ev.target.closest('.del-ex-btn')) deleteExercise(e, accent, onRefresh)
      })
      list.appendChild(card)
    })
    container.appendChild(list)
  })
}

function showExerciseEdit(exercise, accent, onRefresh) {
  const isNew = !exercise
  const ex = { sets: 3, reps: '10', rest: 60, tips: [], alternatives: [], ...(exercise || { name: '', muscle: '', imgUrl: '' }) }

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;justify-content:center;padding:0'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })

  const modal = document.createElement('div')
  modal.style.cssText = `background:#141414;border-radius:20px 20px 0 0;padding:24px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;border:0.5px solid rgba(255,255,255,0.08);box-sizing:border-box`

  const alts = ex.alternatives || []
  let altsHtml = ''
  alts.forEach((a, i) => {
    altsHtml += createAltRowHtml(i, a.name, a.reason)
  })

  modal.innerHTML = `
    <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;margin-bottom:16px">${isNew ? 'New Exercise' : 'Edit Exercise'}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Name</label>
        <input id="ex-name" value="${ex.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Muscle</label>
        <input id="ex-muscle" value="${ex.muscle}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Sets</label>
          <input id="ex-sets" type="number" value="${ex.sets}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Reps</label>
          <input id="ex-reps" value="${ex.reps}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Rest (s)</label>
          <input id="ex-rest" type="number" value="${ex.rest || 60}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Image URL (optional)</label>
        <div style="display:flex;gap:6px">
          <input id="ex-img" value="${ex.imgUrl || ''}" style="flex:1;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
          <button id="ex-img-search" title="Search image from free-exercise-db" style="padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:#0a0a0a;color:rgba(255,255,255,0.5);font-size:14px;line-height:1;touch-action:manipulation">🔍</button>
        </div>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Tips (one per line)</label>
        <textarea id="ex-tips" rows="3" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box">${(ex.tips || []).join('\n')}</textarea>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Alternatives</label>
        <div id="alts-container">${altsHtml}</div>
        <button id="add-alt-btn" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.15);cursor:pointer;background:transparent;color:rgba(255,255,255,0.5);font-size:12px">+ Add alternative</button>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button id="ex-save-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">${isNew ? 'Create' : 'Save'}</button>
      <button id="ex-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancel</button>
    </div>`

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  function collectAlternatives() {
    const rows = modal.querySelectorAll('.alt-row')
    const result = []
    rows.forEach((row) => {
      const name = row.querySelector('.alt-name').value.trim()
      const reason = row.querySelector('.alt-reason').value.trim()
      if (name) result.push({ name, reason })
    })
    return result
  }

  function refreshAltCounters() {
    const rows = modal.querySelectorAll('.alt-row')
    rows.forEach((row, i) => {
      const label = row.querySelector('.alt-num')
      if (label) label.textContent = `${i + 1}`
    })
  }

  // Add alternative row
  document.getElementById('add-alt-btn').addEventListener('click', () => {
    const container = document.getElementById('alts-container')
    const idx = container.children.length
    const row = document.createElement('div')
    row.className = 'alt-row'
    row.style.cssText = 'display:flex;gap:6px;align-items:flex-start;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)'
    row.innerHTML = `
      <span class="alt-num" style="font-size:10px;color:rgba(255,255,255,0.3);width:16px;padding-top:10px;text-align:center;flex-shrink:0">${idx + 1}</span>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px">
        <input class="alt-name" list="ex-list" placeholder="Exercise name (type to search)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box">
        <input class="alt-reason" placeholder="Why this alternative? (optional)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:rgba(255,255,255,0.6);font-size:12px;outline:none;box-sizing:border-box">
      </div>
      <button class="del-alt" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0">✕</button>`
    container.appendChild(row)
    row.querySelector('.del-alt').addEventListener('click', () => { row.remove(); refreshAltCounters() })
    row.querySelector('.alt-name').addEventListener('input', () => {
      row.querySelector('.alt-reason').focus()
    })
  })

  // Set up existing alt row delete buttons
  modal.querySelectorAll('.del-alt').forEach((btn) => {
    btn.addEventListener('click', () => { btn.closest('.alt-row')?.remove(); refreshAltCounters() })
  })

  // Build datalist from existing exercises
  const datalist = document.createElement('datalist')
  datalist.id = 'ex-list'
  Storage.getExercises().then((exercises) => {
    exercises.forEach((e) => {
      const opt = document.createElement('option')
      opt.value = e.name
      datalist.appendChild(opt)
    })
  })
  modal.appendChild(datalist)

  document.getElementById('ex-cancel-btn').addEventListener('click', () => overlay.remove())

  document.getElementById('ex-img-search')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('ex-name')
    const imgInput = document.getElementById('ex-img')
    const name = nameInput?.value.trim()
    if (!name) { showToast('⚠️ Enter an exercise name first'); return }
    const btn = document.getElementById('ex-img-search')
    btn.textContent = '⏳'
    const url = await findExerciseImageUrl(name)
    btn.textContent = '🔍'
    if (url && imgInput) {
      imgInput.value = url
      imgInput.dispatchEvent(new Event('input'))
      showToast('✅ Image found for "' + name + '"')
    } else {
      window.open('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(name + ' exercise'), '_blank')
      showToast('🔍 No match in DB, opened Google Images')
    }
  })

  document.getElementById('ex-save-btn').addEventListener('click', async () => {
    const data = {
      name: document.getElementById('ex-name').value.trim(),
      muscle: document.getElementById('ex-muscle').value.trim(),
      sets: parseInt(document.getElementById('ex-sets').value) || 3,
      reps: document.getElementById('ex-reps').value.trim() || '10',
      rest: parseInt(document.getElementById('ex-rest').value) || 60,
      imgUrl: document.getElementById('ex-img').value.trim(),
      tips: document.getElementById('ex-tips').value.split('\n').map((l) => l.trim()).filter(Boolean),
      alternatives: collectAlternatives(),
    }
    if (!data.name) return
    if (isNew) {
      data.id = await generateId()
    } else {
      data.id = ex.id
    }
    await Storage.saveExercise(data)
    overlay.remove()
    if (onRefresh) onRefresh()
  })
}

function createAltRowHtml(idx, name, reason) {
  return `<div class="alt-row" style="display:flex;gap:6px;align-items:flex-start;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)">
    <span class="alt-num" style="font-size:10px;color:rgba(255,255,255,0.3);width:16px;padding-top:10px;text-align:center;flex-shrink:0">${idx + 1}</span>
    <div style="flex:1;display:flex;flex-direction:column;gap:4px">
      <input class="alt-name" list="ex-list" value="${(name || '').replace(/"/g, '&quot;')}" placeholder="Exercise name (type to search)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box">
      <input class="alt-reason" value="${(reason || '').replace(/"/g, '&quot;')}" placeholder="Why this alternative? (optional)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:rgba(255,255,255,0.6);font-size:12px;outline:none;box-sizing:border-box">
    </div>
    <button class="del-alt" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0">✕</button>
  </div>`
}

function deleteExercise(exercise, accent, onRefresh) {
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })

  const modal = document.createElement('div')
  modal.style.cssText = `background:#141414;border-radius:20px;padding:24px;max-width:360px;width:100%;border:0.5px solid rgba(255,255,255,0.08)`
  modal.innerHTML = `
    <div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:#fafafa">Delete "${exercise.name}"?</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:8px">This will also remove all logs and unlink it from any programs.</div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button id="del-confirm" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:#ff6b6b;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">Delete</button>
      <button id="del-cancel" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancel</button>
    </div>`
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  document.getElementById('del-cancel').addEventListener('click', () => overlay.remove())
  document.getElementById('del-confirm').addEventListener('click', async () => {
    await Storage.deleteExercise(exercise.id)
    overlay.remove()
    if (onRefresh) onRefresh()
  })
}

// ── Program CRUD ──
function renderPrograms(container, { accent, settings, onRefresh }) {
  Storage.getPrograms().then((programs) => {
    const toolbar = document.createElement('div')
    toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:0 20px 12px'
    toolbar.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500">${programs.length} programs</div>`
    const addBtn = document.createElement('button')
    addBtn.style.cssText = `padding:8px 16px;border-radius:8px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;touch-action:manipulation`
    addBtn.textContent = '+ New'
    addBtn.addEventListener('click', () => showProgramEdit(null, accent, onRefresh))
    toolbar.appendChild(addBtn)
    container.appendChild(toolbar)

    if (programs.length === 0) {
      container.innerHTML += `<div style="padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No programs yet. Create or import one.</div>`
      return
    }

    const list = document.createElement('div')
    list.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:8px'
    programs.forEach((p) => {
      const isActive = settings.activeProgramId === p.id
      const card = document.createElement('div')
      card.style.cssText = `background:#141414;border-radius:14px;padding:14px;border:${isActive ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)'};display:flex;align-items:center;gap:12px`
      card.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${p.name}</div>
            ${isActive ? `<span class="pill" style="background:${accent}22;color:${accent};font-size:8px">ACTIVE</span>` : ''}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">${p.weeks.length} week(s) · ${p.weeks.reduce((s, w) => s + w.days.reduce((sd, d) => sd + d.exercises.length, 0), 0)} total exercises</div>
        </div>
        ${!isActive ? `<button class="activate-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:${accent}22;color:${accent};font-size:13px;touch-action:manipulation">Activate</button>` : ''}
        <button class="edit-prog-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;touch-action:manipulation">Edit</button>
        <button class="del-prog-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,107,107,0.12);color:#ff6b6b;font-size:13px;touch-action:manipulation">Del</button>`
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.activate-btn')) activateProgram(p.id)
        else if (ev.target.closest('.edit-prog-btn')) showProgramEdit(p, accent, onRefresh)
        else if (ev.target.closest('.del-prog-btn')) deleteProgram(p, onRefresh)
      })
      list.appendChild(card)
    })
    container.appendChild(list)
  })
}

async function activateProgram(id) {
  const s = await Storage.getSettings()
  s.activeProgramId = id
  await Storage.saveSettings(s)
  window.appRefresh()
}

function showProgramEdit(program, accent, onRefresh) {
  const isNew = !program
  const p = program || { id: null, name: '', weeks: [{ name: 'Week 1', subtitle: '', tag: '', days: [] }] }

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;justify-content:center;padding:0'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })

  const modal = document.createElement('div')
  modal.style.cssText = `background:#141414;border-radius:20px 20px 0 0;padding:20px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;border:0.5px solid rgba(255,255,255,0.08);box-sizing:border-box`

  // Build weeks HTML
  let weeksHTML = ''
  p.weeks.forEach((w, wi) => {
    weeksHTML += `<div class="prog-week-block" style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.03);border-radius:14px">
      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
        <input class="prog-week-name" value="${w.name}" style="flex:1;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Week name">
        <input class="prog-week-tag" value="${w.tag || ''}" style="width:60px;padding:8px 6px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:10px;outline:none;text-transform:uppercase;box-sizing:border-box" placeholder="TAG">
      </div>
      <div class="prog-days-in-week">`
    w.days.forEach((d, di) => {
      weeksHTML += buildProgramDayHTML(di, d)
    })
    weeksHTML += `</div>
      <button class="add-day-in-week" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.12);cursor:pointer;background:transparent;color:rgba(255,255,255,0.4);font-size:12px;touch-action:manipulation">+ Add day</button>
    </div>`
  })

  modal.innerHTML = `
    <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;margin-bottom:14px">${isNew ? 'New Program' : 'Edit Program'}</div>
    <input id="prog-name" value="${p.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:16px;outline:none;font-weight:600;margin-bottom:14px;box-sizing:border-box" placeholder="Program name">
    <div id="prog-weeks-container">${weeksHTML}</div>
    <button id="add-week-btn" style="margin-bottom:14px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.15);cursor:pointer;background:transparent;color:rgba(255,255,255,0.5);font-size:12px;font-weight:600">+ Add week</button>
    <div style="display:flex;gap:10px">
      <button id="prog-save-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">${isNew ? 'Create' : 'Save'}</button>
      <button id="prog-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancel</button>
    </div>`

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  // Add datalist for exercise names
  const datalist = document.createElement('datalist')
  datalist.id = 'prog-ex-list'
  Storage.getExercises().then((exercises) => {
    exercises.forEach((e) => {
      const opt = document.createElement('option')
      opt.value = e.name
      datalist.appendChild(opt)
    })
  })
  modal.appendChild(datalist)

  // ---- Event handlers ----

  document.getElementById('prog-cancel-btn').addEventListener('click', () => overlay.remove())

  document.getElementById('add-week-btn').addEventListener('click', () => {
    const container = document.getElementById('prog-weeks-container')
    const wi = container.querySelectorAll('.prog-week-block').length
    const block = document.createElement('div')
    block.className = 'prog-week-block'
    block.style.cssText = 'margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.03);border-radius:14px'
    block.innerHTML = `
      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
        <input class="prog-week-name" value="Week ${wi + 1}" style="flex:1;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Week name">
        <input class="prog-week-tag" value="" style="width:60px;padding:8px 6px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:10px;outline:none;text-transform:uppercase;box-sizing:border-box" placeholder="TAG">
      </div>
      <div class="prog-days-in-week"></div>
      <button class="add-day-in-week" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.12);cursor:pointer;background:transparent;color:rgba(255,255,255,0.4);font-size:12px;touch-action:manipulation">+ Add day</button>`
    container.appendChild(block)
  })

  // Delegate events for add day / add exercise / delete
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-day-in-week')) {
      const daysContainer = e.target.parentElement.querySelector('.prog-days-in-week')
      const idx = daysContainer.children.length
      const dayDiv = buildProgramDayElement(idx)
      daysContainer.appendChild(dayDiv)
    }
    if (e.target.classList.contains('add-ex-prog')) {
      const dayDiv = e.target.closest('.prog-day-block')
      const exDiv = createProgExerciseRow('', 3, '10', 60)
      dayDiv.insertBefore(exDiv, e.target)
    }
    if (e.target.classList.contains('del-ex-prog')) {
      e.target.closest('.prog-ex-row')?.remove()
    }
    if (e.target.classList.contains('del-day-prog')) {
      e.target.closest('.prog-day-block')?.remove()
    }
  })

  document.getElementById('prog-save-btn').addEventListener('click', async () => {
    const name = document.getElementById('prog-name').value.trim() || 'Unnamed Program'

    const exerciseNameToId = {}
    const allExercises = await Storage.getExercises()
    allExercises.forEach((e) => { exerciseNameToId[e.name.toLowerCase()] = e.id })

    const weeks = []
    modal.querySelectorAll('.prog-week-block').forEach((wDiv) => {
      const wName = wDiv.querySelector('.prog-week-name')?.value || 'Week'
      const wTag = wDiv.querySelector('.prog-week-tag')?.value || ''
      const days = []
      wDiv.querySelectorAll('.prog-day-block').forEach((dDiv) => {
        const name = dDiv.querySelector('.prog-day-name')?.value || 'Day'
        const sub = dDiv.querySelector('.prog-day-sub')?.value || ''
        const dur = parseInt(dDiv.querySelector('.prog-day-dur')?.value) || 0
        const exercises = []
        dDiv.querySelectorAll('.prog-ex-row').forEach((exRow) => {
          const exName = exRow.querySelector('.prog-ex-name')?.value.trim()
          if (!exName) return
          const sets = parseInt(exRow.querySelector('.prog-ex-sets')?.value) || 3
          const reps = exRow.querySelector('.prog-ex-reps')?.value || '10'
          const rest = parseInt(exRow.querySelector('.prog-ex-rest')?.value) || 60
          // Resolve exercise name to ID
          let exId = exerciseNameToId[exName.toLowerCase()]
          if (!exId) {
            // Create exercise on the fly
            exId = await (async () => { const ex = await Storage.findOrCreateExerciseByName(exName, ''); return ex.id })()
            exerciseNameToId[exName.toLowerCase()] = exId
          }
          exercises.push({ exerciseId: exId, sets, reps, rest })
        })
        days.push({ name, subtitle: sub, duration: dur, exercises })
      })
      weeks.push({ name: wName, subtitle: '', tag: wTag, days })
    })

    const prog = { id: isNew ? await generateId() : p.id, name, weeks }
    await Storage.saveProgram(prog)
    overlay.remove()
    if (onRefresh) onRefresh()
  })
}

function buildProgramDayHTML(idx, day) {
  const d = day || { name: 'Day', subtitle: '', duration: 60, exercises: [] }
  let exHTML = ''
  ;(d.exercises || []).forEach((e) => {
    exHTML += createProgExerciseRowHtml(e.exerciseId || '', e.sets || 3, e.reps || '10', e.rest || 60)
  })
  return `<div class="prog-day-block" style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.02);border-radius:10px">
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <span style="font-size:10px;color:rgba(255,255,255,0.3);width:16px;flex-shrink:0;text-align:center">${idx + 1}</span>
      <input class="prog-day-name" value="${d.name}" style="flex:1;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:12px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Day name">
      <input class="prog-day-dur" type="number" value="${d.duration || 60}" style="width:44px;padding:6px 4px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;text-align:center;outline:none;box-sizing:border-box" placeholder="min">
      <button class="del-day-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:14px;padding:4px;flex-shrink:0">✕</button>
    </div>
    ${exHTML}
    <button class="add-ex-prog" style="margin-top:4px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.1);cursor:pointer;background:transparent;color:rgba(255,255,255,0.35);font-size:12px;touch-action:manipulation">+ Add exercise</button>
  </div>`
}

function buildProgramDayElement(idx) {
  const div = document.createElement('div')
  div.className = 'prog-day-block'
  div.style.cssText = 'margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.02);border-radius:10px'
  div.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <span style="font-size:10px;color:rgba(255,255,255,0.3);width:16px;flex-shrink:0;text-align:center">${idx + 1}</span>
      <input class="prog-day-name" value="Day" style="flex:1;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:12px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Day name">
      <input class="prog-day-dur" type="number" value="60" style="width:44px;padding:6px 4px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;text-align:center;outline:none;box-sizing:border-box" placeholder="min">
      <button class="del-day-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:14px;padding:4px;flex-shrink:0">✕</button>
    </div>
    <button class="add-ex-prog" style="margin-top:4px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.1);cursor:pointer;background:transparent;color:rgba(255,255,255,0.35);font-size:12px;touch-action:manipulation">+ Add exercise</button>`
  return div
}

function createProgExerciseRowHtml(exerciseId, sets, reps, rest) {
  return `<div class="prog-ex-row" style="display:flex;gap:4px;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)">
    <input class="prog-ex-name" list="prog-ex-list" value="${exerciseId || ''}" placeholder="Ex. name" style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;outline:none;box-sizing:border-box">
    <input class="prog-ex-sets" type="number" value="${sets}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="S">
    <input class="prog-ex-reps" value="${reps}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="R">
    <input class="prog-ex-rest" type="number" value="${rest}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="Rt">
    <button class="del-ex-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0;touch-action:manipulation">✕</button>
  </div>`
}

function createProgExerciseRow(exerciseId, sets, reps, rest) {
  const div = document.createElement('div')
  div.className = 'prog-ex-row'
  div.style.cssText = 'display:flex;gap:4px;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)'
  div.innerHTML = `
    <input class="prog-ex-name" list="prog-ex-list" placeholder="Ex. name" style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;outline:none;box-sizing:border-box">
    <input class="prog-ex-sets" type="number" value="${sets}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="S">
    <input class="prog-ex-reps" value="${reps}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="R">
    <input class="prog-ex-rest" type="number" value="${rest}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="Rt">
    <button class="del-ex-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0;touch-action:manipulation">✕</button>`
  return div
}

function deleteProgram(program, onRefresh) {
  if (!confirm(`Delete "${program.name}"?`)) return
  Storage.deleteProgram(program.id).then(() => {
    if (onRefresh) onRefresh()
  })
}
