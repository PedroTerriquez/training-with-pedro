// ── You screen ──
// Stats, settings, exercise + program CRUD, JSON import

let _youTab = 'stats'

function mountYou(container, { accent, units, settings, onRefresh }) {
  container.innerHTML = ''
  const page = document.createElement('div')
  page.className = 'page'
  container.appendChild(page)

  const header = document.createElement('div')
  header.style.padding = '56px 20px 16px'
  header.innerHTML = `
    <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.45);text-transform:uppercase">Perfil</div>
    <div style="font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;color:#fafafa;letter-spacing:-1.5px;line-height:1;margin-top:4px"><span id="user-name" contenteditable style="outline:none;border:0;caret-color:${accent};display:inline-block;min-width:50px">${settings.userName || 'Pedro'}</span>.</div>`
  page.appendChild(header)

  // Section tabs
  const tabs = document.createElement('div')
  tabs.style.cssText = 'margin:0 20px;display:flex;padding:3px;border-radius:11px;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.06)'
  const tabOptions = [
    { id: 'stats', label: 'Datos' },
    { id: 'exercises', label: 'Ejercicios' },
    { id: 'programs', label: 'Programas' },
  ]
  tabOptions.forEach((t) => {
    const btn = document.createElement('button')
    btn.id = 'you-tab-' + t.id
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
  const secLabel = (label) => {
    const el = document.createElement('div')
    el.style.cssText = 'margin-bottom:10px'
    el.appendChild(SectionLabel({ children: label, accent }))
    container.appendChild(el)
  }

  const cardWrap = (id) => {
    const card = document.createElement('div')
    if (id) card.id = id
    card.style.cssText = 'margin:0 20px;background:#141414;border-radius:18px;padding:4px;border:0.5px solid rgba(255,255,255,0.06)'
    return card
  }

  const row = (id, label, control) => {
    const isLast = !id
    const r = document.createElement('div')
    r.style.cssText = `display:flex;align-items:center;justify-content:space-between;padding:12px 14px${isLast ? '' : ';border-bottom:0.5px solid rgba(255,255,255,0.04)'}`
    r.innerHTML = `<div style="font-family:'Space Grotesk',sans-serif;font-size:13.5px;color:#fafafa;font-weight:500">${label}</div>${control}`
    return r
  }

  // ── Mis datos ──
  secLabel('Mis datos')
  const profileCard = cardWrap('you-profile-card')
  profileCard.appendChild(row('height', 'Estatura', `<div style="display:flex;align-items:center;gap:4px"><input id="height-input" type="number" value="${settings.height || ''}" style="width:72px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'JetBrains Mono',monospace"><span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace">cm</span></div>`))
  profileCard.appendChild(row('weight', 'Peso', `<div style="display:flex;align-items:center;gap:4px"><input id="weight-input" type="number" value="${settings.weight || ''}" style="width:72px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'JetBrains Mono',monospace"><span style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace">kg</span></div>`))
  profileCard.appendChild(row('sex', 'Sexo', `<select id="sex-input" style="padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box;font-family:'Space Grotesk',sans-serif;cursor:pointer"><option value="" ${!settings.sex ? 'selected' : ''}>Seleccionar</option><option value="Masculino" ${settings.sex === 'Masculino' ? 'selected' : ''}>Masculino</option><option value="Femenino" ${settings.sex === 'Femenino' ? 'selected' : ''}>Femenino</option><option value="Otro" ${settings.sex === 'Otro' ? 'selected' : ''}>Otro</option></select>`))
  profileCard.appendChild(row('age', 'Edad', `<input id="age-input" type="number" value="${settings.age || ''}" style="width:72px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'JetBrains Mono',monospace">`))
  profileCard.appendChild(row('goal', 'Objetivo', `<select id="goal-input" style="padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box;font-family:'Space Grotesk',sans-serif;cursor:pointer"><option value="" ${!settings.goal ? 'selected' : ''}>Seleccionar</option><option value="hipertrofia" ${settings.goal === 'hipertrofia' ? 'selected' : ''}>Hipertrofia</option><option value="fuerza" ${settings.goal === 'fuerza' ? 'selected' : ''}>Fuerza</option><option value="perdida de grasa" ${settings.goal === 'perdida de grasa' ? 'selected' : ''}>Pérdida de grasa</option><option value="recomposicion" ${settings.goal === 'recomposicion' ? 'selected' : ''}>Recomposición</option><option value="rendimiento" ${settings.goal === 'rendimiento' ? 'selected' : ''}>Rendimiento</option></select>`))
  profileCard.appendChild(row('experience', 'Experiencia', `<select id="exp-input" style="padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box;font-family:'Space Grotesk',sans-serif;cursor:pointer"><option value="" ${!settings.experience ? 'selected' : ''}>Seleccionar</option><option value="principiante" ${settings.experience === 'principiante' ? 'selected' : ''}>Principiante</option><option value="intermedio" ${settings.experience === 'intermedio' ? 'selected' : ''}>Intermedio</option><option value="avanzado" ${settings.experience === 'avanzado' ? 'selected' : ''}>Avanzado</option></select>`))
  profileCard.appendChild(row(null, 'Profesión', `<input id="occ-input" type="text" value="${settings.occupation || ''}" placeholder="Ej: Ingeniero, oficinista, repartidor…" style="width:160px;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:right;outline:none;box-sizing:border-box;font-family:'Space Grotesk',sans-serif">`))
  container.appendChild(profileCard)

  // ── Ajustes rápidos ──
  secLabel('Ajustes rápidos')
  const quickCard = cardWrap('you-quick-card')
  quickCard.appendChild(row('units', 'Unidades', `<button id="units-btn" style="font-size:12px;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace;background:none;border:0;cursor:pointer">${units === 'kg' ? 'Kilogramos (kg)' : 'Libras (lb)'}</button>`))
  quickCard.appendChild(row('accent', 'Color de acento', `<div style="display:flex;gap:6px;align-items:center"><input type="color" id="accent-input" value="${accent}" style="width:40px;height:28px;border:0.5px solid rgba(255,255,255,0.1);border-radius:6px;padding:0;background:transparent;cursor:pointer"></div>`))
  quickCard.appendChild(row('watch', 'Smartwatch', `<button id="watch-toggle-btn" style="padding:6px 12px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:${settings.hasWatch ? `${accent}22` : 'transparent'};color:${settings.hasWatch ? accent : 'rgba(255,255,255,0.55)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;touch-action:manipulation">${settings.hasWatch ? 'Sí' : 'No'}</button>`))
  const permLabel = Notification.permission === 'granted' ? 'Activadas' : Notification.permission === 'denied' ? 'Denegadas' : 'Preguntar'
  quickCard.appendChild(row(null, 'Notificaciones', `<button id="notif-perm-btn" style="padding:6px 12px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:${Notification.permission === 'granted' ? `${accent}22` : 'transparent'};color:${Notification.permission === 'granted' ? accent : 'rgba(255,255,255,0.55)'};font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;touch-action:manipulation">${permLabel}</button>`))
  quickCard.appendChild(row(null, 'Instalar app', `<button id="install-btn" style="padding:6px 12px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:transparent;color:rgba(255,255,255,0.55);font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;touch-action:manipulation">Añadir</button>`))
  container.appendChild(quickCard)

  // ── Data Management ──
  const card = (content) => `<div style="margin:0 20px;background:#141414;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden">${content}</div>`
  const dataRow = (inner) => `<div style="padding:14px 16px;display:flex;align-items:center;gap:12px">${inner}</div>`
  const btn = (id, label, style = '') => `<button id="${id}" style="padding:7px 14px;border-radius:8px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;white-space:nowrap;flex-shrink:0;touch-action:manipulation${style}">${label}</button>`
  const statusEl = (id) => `<div id="${id}" style="margin-top:4px;font-size:10px;font-family:'JetBrains Mono',monospace;color:rgba(255,255,255,0.35);letter-spacing:0.2px"></div>`

  const section = (label) => {
    const el = document.createElement('div')
    el.style.cssText = 'margin-top:24px;margin-bottom:10px'
    el.appendChild(SectionLabel({ children: label, accent }))
    container.appendChild(el)
  }

  // ── Importar con IA ──
  section('Importar con IA')
  const aiCard = document.createElement('div')
  aiCard.style.cssText = 'margin:0 20px;background:#141414;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden'
  aiCard.innerHTML = `
    <div style="padding:14px 16px">
      <div style="font-size:12px;color:#fafafa;font-weight:600;font-family:'Space Grotesk',sans-serif">Pega tu rutina en texto</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;line-height:1.4">Describe tu rutina como se la dirías a un entrenador. La IA creará el programa y los ejercicios automáticamente.</div>
      <textarea id="ai-input" rows="8" placeholder="Ejemplo:&#10;Lunes - Pecho y Triceps&#10;Press banca 4x8-10&#10;Press inclinado 3x10&#10;Aperturas 3x12&#10;Fondos 3x10&#10;Patada triceps 3x12&#10;&#10;Martes - Espalda y Biceps&#10;Dominadas 4x8&#10;Remo con barra 4x10&#10;Jalón al pecho 3x12&#10;Curl biceps 3x12&#10;Curl martillo 3x12" style="width:100%;margin-top:10px;padding:12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;font-family:'Space Grotesk',sans-serif;outline:none;resize:vertical;box-sizing:border-box;line-height:1.6"></textarea>
      ${statusEl('ai-status')}
    </div>
    ${btn('ai-import-btn', 'Importar con IA', ';width:100%;margin:0 16px 14px;width:calc(100% - 32px)')}`
  container.appendChild(aiCard)

  // ── Importar ──
  section('Importar')
  const impCard = document.createElement('div')
  impCard.innerHTML = card(
    dataRow(`<div style="flex:1;min-width:0">
      <div style="font-size:12px;color:#fafafa;font-weight:600;font-family:'Space Grotesk',sans-serif">Todo (ejercicios, programas, logs)</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;line-height:1.4">Restaura toda la base de datos desde un JSON</div>
      ${statusEl('json-import-status')}
    </div>
    <input type="file" id="json-import-input" accept=".json" style="display:none">
    ${btn('json-import-btn', 'Importar')}`)
  )
  container.appendChild(impCard)

  // ── Exportar ──
  section('Exportar')
  const expCard = document.createElement('div')
  expCard.innerHTML = card(
    dataRow(`<div style="flex:1;min-width:0">
      <div style="font-size:12px;color:#fafafa;font-weight:600;font-family:'Space Grotesk',sans-serif">Todo (ejercicios, programas, logs)</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;line-height:1.4">Descarga toda la base de datos como JSON</div>
      ${statusEl('json-export-status')}
    </div>
    ${btn('json-export-btn', 'Exportar')}`)
  )
  container.appendChild(expCard)

  // ── Mantenimiento ──
  section('Mantenimiento')
  const maintCard = document.createElement('div')
  maintCard.innerHTML = card(
    dataRow(`<div style="flex:1;min-width:0">
      <div style="font-size:12px;color:#fafafa;font-weight:600;font-family:'Space Grotesk',sans-serif">Normalizar ejercicios</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px;line-height:1.4">Renombra al canónico en español, rellena imágenes y músculo desde el diccionario</div>
      ${statusEl('dict-migrate-status')}
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
      ${btn('dict-migrate-btn', 'Aplicar', ';background:transparent;color:' + accent + ';border:0.5px solid ' + accent + '55')}
      ${btn('dict-force-btn', 'Forzar', ';background:transparent;color:rgba(255,255,255,0.5);border:0.5px solid rgba(255,255,255,0.1)')}
    </div>`)
  )
  container.appendChild(maintCard)

  // ── Version + Refresh ──
  const footerRow = document.createElement('div')
  const ver = typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''
  footerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin:16px 20px 0'
  footerRow.innerHTML = `
    <div style="font-size:10px;color:rgba(255,255,255,0.3);font-family:'JetBrains Mono',monospace">${ver}</div>
    <button id="refresh-btn" style="padding:5px 10px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);cursor:pointer;background:transparent;color:rgba(255,255,255,0.4);font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:500;touch-action:manipulation">↻</button>`
  container.appendChild(footerRow)

  // Bottom spacer
  const spacer = document.createElement('div')
  spacer.style.height = '20px'
  container.appendChild(spacer)

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
    const ageInput = document.getElementById('age-input')
    if (ageInput) {
      ageInput.addEventListener('blur', async () => {
        const s = await Storage.getSettings()
        s.age = ageInput.value
        await Storage.saveSettings(s)
      })
    }
    const goalInput = document.getElementById('goal-input')
    if (goalInput) {
      goalInput.addEventListener('change', async () => {
        const s = await Storage.getSettings()
        s.goal = goalInput.value
        await Storage.saveSettings(s)
      })
    }
    const expInput = document.getElementById('exp-input')
    if (expInput) {
      expInput.addEventListener('change', async () => {
        const s = await Storage.getSettings()
        s.experience = expInput.value
        await Storage.saveSettings(s)
      })
    }
    const occInput = document.getElementById('occ-input')
    if (occInput) {
      occInput.addEventListener('blur', async () => {
        const s = await Storage.getSettings()
        s.occupation = occInput.value
        await Storage.saveSettings(s)
      })
    }
    const watchToggleBtn = document.getElementById('watch-toggle-btn')
    if (watchToggleBtn) {
      watchToggleBtn.addEventListener('click', async () => {
        const s = await Storage.getSettings()
        s.hasWatch = !s.hasWatch
        await Storage.saveSettings(s)
        watchToggleBtn.textContent = s.hasWatch ? 'Sí' : 'No'
        watchToggleBtn.style.background = s.hasWatch ? `${accent}22` : 'transparent'
        watchToggleBtn.style.color = s.hasWatch ? accent : 'rgba(255,255,255,0.55)'
      })
    }
    const notifBtn = document.getElementById('notif-perm-btn')
    if (notifBtn) {
      notifBtn.addEventListener('click', async () => {
        if (Notification.permission === 'granted') return
        if (Notification.permission === 'denied') {
          showToast('Permiso denegado. Actívalo en Ajustes del sistema.', true)
          return
        }
        const result = await Notification.requestPermission()
        if (result === 'granted') {
          notifBtn.textContent = 'Activadas'
          notifBtn.style.background = `${accent}22`
          notifBtn.style.color = accent
        } else {
          notifBtn.textContent = 'Denegadas'
        }
      })
    }
    const installBtn = document.getElementById('install-btn')
    if (installBtn) {
      installBtn.addEventListener('click', () => installPWA())
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
    const refreshBtn = document.getElementById('refresh-btn')
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (onRefresh) onRefresh()
      })
    }
    const aiImportBtn = document.getElementById('ai-import-btn')
    const aiInput = document.getElementById('ai-input')
    const aiStatus = document.getElementById('ai-status')
    if (aiImportBtn && aiInput && aiStatus) {
      aiImportBtn.addEventListener('click', async () => {
        const text = aiInput.value.trim()
        if (!text) {
          aiStatus.textContent = '⚠️ Pega tu rutina primero'
          aiStatus.style.color = '#ff6b6b'
          return
        }
        if (typeof importWithAI !== 'function') {
          aiStatus.textContent = '❌ importWithAI no está definido'
          aiStatus.style.color = '#ff6b6b'
          return
        }
        aiImportBtn.disabled = true
        const origText = aiImportBtn.textContent
        aiImportBtn.textContent = '⏳ Procesando…'
        aiStatus.textContent = 'Enviando a la IA…'
        aiStatus.style.color = 'rgba(255,255,255,0.45)'
        try {
          const program = await importWithAI(text, (current, total, name) => {
            aiStatus.textContent = `⏳ Ejercicio ${current}/${total} (${name})…`
          })
          aiStatus.textContent = `✅ Importado "${program.name}" con ${program.weeks.length} semana(s)`
          aiStatus.style.color = accent
          aiImportBtn.textContent = '✅ Listo'
          aiImportBtn.style.background = '#0a0a0a'
          aiImportBtn.style.color = accent
          aiImportBtn.style.border = `0.5px solid ${accent}55`
          setTimeout(() => {
            aiImportBtn.textContent = origText
            aiImportBtn.style.background = accent
            aiImportBtn.style.color = '#0a0a0a'
            aiImportBtn.style.border = '0'
          }, 2500)
        } catch (err) {
          aiStatus.textContent = `❌ ${err.message}`
          aiStatus.style.color = '#ff6b6b'
          aiImportBtn.textContent = '❌ Error'
          setTimeout(() => { aiImportBtn.textContent = origText }, 2000)
        } finally {
          aiImportBtn.disabled = false
        }
      })
    }

    const dictMigrateBtn = document.getElementById('dict-migrate-btn')
    const dictForceBtn = document.getElementById('dict-force-btn')
    const dictMigrateStatus = document.getElementById('dict-migrate-status')

    async function runMigration(force) {
      dictMigrateBtn.disabled = true
      if (dictForceBtn) dictForceBtn.disabled = true
      const originalText = dictMigrateBtn.textContent
      dictMigrateBtn.textContent = '⏳ Aplicando…'
      try {
        const result = await Storage.migrateExercisesToDictionary({ force })
        if (result.dictMissing) {
          dictMigrateStatus.textContent = '❌ Diccionario no cargado'
          dictMigrateStatus.style.color = '#ff6b6b'
        } else {
          dictMigrateStatus.textContent = `✅ Actualizados ${result.migrated} · sin match ${result.skipped} · total ${result.total}`
          dictMigrateStatus.style.color = accent
          if (window.silentRefresh) await window.silentRefresh()
        }
      } catch (err) {
        dictMigrateStatus.textContent = `❌ ${err.message}`
        dictMigrateStatus.style.color = '#ff6b6b'
      } finally {
        dictMigrateBtn.disabled = false
        if (dictForceBtn) dictForceBtn.disabled = false
        dictMigrateBtn.textContent = originalText
      }
    }

    if (dictMigrateBtn && dictMigrateStatus) {
      dictMigrateBtn.addEventListener('click', () => runMigration(false))
    }
    if (dictForceBtn && dictMigrateStatus) {
      dictForceBtn.addEventListener('click', () => runMigration(true))
    }

    // JSON Export
    const jsonExportBtn = document.getElementById('json-export-btn')
    const jsonExportStatus = document.getElementById('json-export-status')
    if (jsonExportBtn) {
      jsonExportBtn.addEventListener('click', async () => {
        try {
          const json = await Storage.exportLogsAndSettings()
          const parsed = JSON.parse(json)
          const parts = []
          if (parsed.exercises?.length) parts.push(`${parsed.exercises.length} ejercicios`)
          if (parsed.programs?.length) parts.push(`${parsed.programs.length} programas`)
          if (parsed.exerciseLogs?.length) parts.push(`${parsed.exerciseLogs.length} logs`)
          const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `training-backup-${getToday()}.json`
          a.click()
          URL.revokeObjectURL(url)
          jsonExportStatus.textContent = `✅ Exportado (${parts.join(', ')})`
          jsonExportStatus.style.color = accent
        } catch (err) {
          jsonExportStatus.textContent = `❌ ${err.message}`
          jsonExportStatus.style.color = '#ff6b6b'
        }
      })
    }

    // JSON Import
    const jsonImportInput = document.getElementById('json-import-input')
    const jsonImportBtn = document.getElementById('json-import-btn')
    const jsonImportStatus = document.getElementById('json-import-status')
    if (jsonImportBtn && jsonImportInput) {
      jsonImportBtn.addEventListener('click', () => jsonImportInput.click())
      jsonImportInput.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
          const text = await file.text()
          const result = await Storage.importLogsAndSettings(text)
          const parts = []
          if (result.exercises) parts.push(`${result.exercises} ejercicios`)
          if (result.programs) parts.push(`${result.programs} programas`)
          if (result.logs) parts.push(`${result.logs} logs`)
          jsonImportStatus.textContent = `✅ Importados ${parts.join(', ')}`
          jsonImportStatus.style.color = accent
          if (window.silentRefresh) await window.silentRefresh()
        } catch (err) {
          jsonImportStatus.textContent = `❌ ${err.message}`
          jsonImportStatus.style.color = '#ff6b6b'
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
    toolbar.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500" class="ex-count">${exercises.length} ejercicios</div>`
    const addBtn = document.createElement('button')
    addBtn.style.cssText = `padding:8px 16px;border-radius:8px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;touch-action:manipulation`
    addBtn.textContent = '+ Nuevo'
    addBtn.addEventListener('click', () => showExerciseEdit(null, accent, onRefresh))
    toolbar.appendChild(addBtn)
    container.appendChild(toolbar)

    // Search bar
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = 'Buscar ejercicio…'
    searchInput.style.cssText = `margin:0 20px 10px;padding:10px 14px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#fafafa;font-family:'Space Grotesk',sans-serif;font-size:14px;outline:none;width:calc(100% - 40px);box-sizing:border-box`
    container.appendChild(searchInput)

    const listWrap = document.createElement('div')
    listWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px'
    container.appendChild(listWrap)

    function renderList(filtered) {
      listWrap.innerHTML = ''
      if (exercises.length === 0) {
        listWrap.innerHTML = `<div style="padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No hay ejercicios todavía. Crea tu primero.</div>`
        return
      }
      if (filtered.length === 0) {
        listWrap.innerHTML = `<div style="padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">Ningún ejercicio coincide con la búsqueda.</div>`
        return
      }
      filtered.forEach((e) => {
        const card = document.createElement('div')
        card.dataset.exerciseId = e.id
        card.style.cssText = `background:#141414;border-radius:14px;padding:14px;border:0.5px solid rgba(255,255,255,0.06);cursor:pointer;display:flex;align-items:center;gap:12px`
        card.innerHTML = `
          <div style="flex:1;min-width:0">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${e.name}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">${e.muscle}</div>
          </div>
          <button class="edit-ex-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;touch-action:manipulation">Editar</button>
          <button class="del-ex-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,107,107,0.12);color:#ff6b6b;font-size:13px;touch-action:manipulation">Eliminar</button>`
        card.addEventListener('click', (ev) => {
          if (ev.target.closest('.edit-ex-btn')) showExerciseEdit(e, accent, onRefresh)
          else if (ev.target.closest('.del-ex-btn')) deleteExercise(e, accent, onRefresh)
        })
        listWrap.appendChild(card)
      })
    }

    let currentQuery = ''
    searchInput.addEventListener('input', (e) => {
      currentQuery = e.target.value.toLowerCase().trim()
      const filtered = exercises.filter((ex) =>
        !currentQuery ||
        ex.name.toLowerCase().includes(currentQuery) ||
        (ex.muscle || '').toLowerCase().includes(currentQuery)
      )
      renderList(filtered)
    })

    renderList(exercises)
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
    <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;margin-bottom:16px">${isNew ? 'Nuevo ejercicio' : 'Editar ejercicio'}</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Nombre</label>
        <input id="ex-name" value="${ex.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Músculo</label>
        <input id="ex-muscle" value="${ex.muscle}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Series</label>
          <input id="ex-sets" type="number" value="${ex.sets}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Repeticiones</label>
          <input id="ex-reps" value="${ex.reps}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Descanso (s)</label>
          <input id="ex-rest" type="number" value="${ex.rest || 60}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
        </div>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">URL de imagen (opcional)</label>
        <div style="display:flex;gap:6px">
          <input id="ex-img" value="${ex.imgUrl || ''}" style="flex:1;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;box-sizing:border-box">
          <button id="ex-img-search" title="Buscar imagen de free-exercise-db" style="padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);cursor:pointer;background:#0a0a0a;color:rgba(255,255,255,0.5);font-size:14px;line-height:1;touch-action:manipulation">🔍</button>
        </div>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Consejos (uno por línea)</label>
        <textarea id="ex-tips" rows="3" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box">${(ex.tips || []).join('\n')}</textarea>
      </div>
      <div>
        <label style="font-size:11px;color:rgba(255,255,255,0.5);display:block;margin-bottom:4px">Alternativas</label>
        <div id="alts-container">${altsHtml}</div>
        <button id="add-alt-btn" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.15);cursor:pointer;background:transparent;color:rgba(255,255,255,0.5);font-size:12px">+ Añadir alternativa</button>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button id="ex-save-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">${isNew ? 'Crear' : 'Guardar'}</button>
      <button id="ex-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancelar</button>
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
        <input class="alt-name" list="ex-list" placeholder="Nombre del ejercicio (escribe para buscar)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box">
        <input class="alt-reason" placeholder="¿Por qué esta alternativa? (opcional)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:rgba(255,255,255,0.6);font-size:12px;outline:none;box-sizing:border-box">
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
    if (!name) { showToast('⚠️ Ingresa un nombre de ejercicio primero'); return }
    const btn = document.getElementById('ex-img-search')
    btn.textContent = '⏳'
    const url = await findExerciseImageUrl(name)
    btn.textContent = '🔍'
    if (url && imgInput) {
      imgInput.value = url
      imgInput.dispatchEvent(new Event('input'))
      showToast('✅ Imagen encontrada para "' + name + '"')
    } else {
      window.open('https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(name + ' exercise'), '_blank')
      showToast('🔍 Sin coincidencia en la BD, se abrió Google Imágenes')
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
      <input class="alt-name" list="ex-list" value="${(name || '').replace(/"/g, '&quot;')}" placeholder="Nombre del ejercicio (escribe para buscar)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;outline:none;box-sizing:border-box">
      <input class="alt-reason" value="${(reason || '').replace(/"/g, '&quot;')}" placeholder="¿Por qué esta alternativa? (opcional)" style="width:100%;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:rgba(255,255,255,0.6);font-size:12px;outline:none;box-sizing:border-box">
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
    <div style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:#fafafa">¿Eliminar "${exercise.name}"?</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.55);margin-top:8px">Esto eliminará todos los registros y lo desvinculará de los programas.</div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button id="del-confirm" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:#ff6b6b;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">Eliminar</button>
      <button id="del-cancel" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancelar</button>
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
    toolbar.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,0.5);font-weight:500">${programs.length} programas</div>`
    const addBtn = document.createElement('button')
    addBtn.style.cssText = `padding:8px 16px;border-radius:8px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;touch-action:manipulation`
    addBtn.textContent = '+ Nuevo'
    addBtn.addEventListener('click', () => showProgramEdit(null, accent, onRefresh))
    toolbar.appendChild(addBtn)
    container.appendChild(toolbar)

    // ── Program Coach ──
    const coachSection = document.createElement('div')
    coachSection.style.cssText = 'margin:0 20px 20px'
    coachSection.innerHTML = `
      <div style="background:#141414;border-radius:16px;border:0.5px solid rgba(255,255,255,0.06);overflow:hidden">
        <div style="padding:14px 16px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="width:28px;height:28px;border-radius:8px;background:${accent}1f;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M2.5 8.2c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5-2.9 5-6.5 5c-.7 0-1.4-.08-2-.23L3.2 14.7l.5-2.4C2.95 11.4 2.5 9.9 2.5 8.2z" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round" fill="none"/><circle cx="9" cy="8.2" r="0.95" fill="${accent}"/><circle cx="6" cy="8.2" r="0.95" fill="${accent}"/><circle cx="12" cy="8.2" r="0.95" fill="${accent}"/></svg>
            </span>
            <div>
              <div style="font-size:13px;color:#fafafa;font-weight:600;font-family:'Space Grotesk',sans-serif">Coach IA de programas</div>
              <div style="font-size:10px;color:rgba(255,255,255,0.45);margin-top:1px;line-height:1.4">Pregunta o pide cambios en tu rutina. Si la IA genera un programa nuevo, se activa automáticamente.</div>
            </div>
          </div>
          <textarea id="prog-coach-input" rows="4" placeholder='Ej: "Cambia press banca por press inclinado", "Aumenta series del remo a 5", "¿Está balanceada mi rutina?", "Agrega un día de pierna"' style="width:100%;margin-top:10px;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:13px;font-family:'Space Grotesk',sans-serif;outline:none;resize:vertical;box-sizing:border-box;line-height:1.5"></textarea>
          <div id="prog-coach-status" style="margin-top:4px;font-size:10px;font-family:'JetBrains Mono',monospace;color:rgba(255,255,255,0.35);letter-spacing:0.2px;min-height:14px"></div>
        </div>
        <button id="prog-coach-btn" style="margin:0 16px 14px;width:calc(100% - 32px);padding:10px;border-radius:10px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;touch-action:manipulation">Enviar al coach</button>
        <div id="prog-coach-response" style="padding:0 16px 14px;display:none">
          <div style="padding:12px 14px;background:rgba(255,255,255,0.03);border-radius:10px;border-left:3px solid ${accent}">
            <div style="font-size:10px;font-family:'JetBrains Mono',monospace;color:${accent};letter-spacing:1.2px;text-transform:uppercase;font-weight:600;margin-bottom:6px">Coach IA</div>
            <div id="prog-coach-response-text" style="font-size:13px;color:rgba(255,255,255,0.85);line-height:1.5;font-family:'Space Grotesk',sans-serif;white-space:pre-wrap"></div>
            <div style="margin-top:6px;display:flex;gap:6px;align-items:center">
              <span id="prog-coach-provider" style="font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:0.6px;color:rgba(255,255,255,0.3);text-transform:uppercase"></span>
            </div>
        </div>
      </div>`
    container.appendChild(coachSection)

    if (programs.length === 0) {
      container.innerHTML += `<div style="padding:40px 20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.4)">No hay programas todavía. Crea o importa uno.</div>`
      return
    }

    const list = document.createElement('div')
    list.style.cssText = 'padding:0 20px;display:flex;flex-direction:column;gap:8px'
    programs.forEach((p) => {
      const isActive = settings.activeProgramId === p.id
      const card = document.createElement('div')
      card.dataset.programId = p.id
      card.style.cssText = `background:#141414;border-radius:14px;padding:14px;border:${isActive ? `0.5px solid ${accent}55` : '0.5px solid rgba(255,255,255,0.06)'};display:flex;flex-wrap:wrap;align-items:center;gap:8px`
      card.innerHTML = `
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:#fafafa;letter-spacing:-0.3px">${p.name}</div>
            ${isActive ? `<span class="pill" style="background:${accent}22;color:${accent};font-size:8px">ACTIVO</span>` : ''}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:2px">${p.weeks.length} semana(s) · ${p.weeks.reduce((s, w) => s + w.days.reduce((sd, d) => sd + d.exercises.length, 0), 0)} ejercicios totales</div>
        </div>
        ${!isActive ? `<button class="activate-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:${accent}22;color:${accent};font-size:13px;touch-action:manipulation">Activar</button>` : ''}
        <button class="edit-prog-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-size:13px;touch-action:manipulation">Editar</button>
        <button class="del-prog-btn" style="padding:8px 14px;border-radius:8px;border:0;cursor:pointer;background:rgba(255,107,107,0.12);color:#ff6b6b;font-size:13px;touch-action:manipulation">Eliminar</button>`
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('.activate-btn')) activateProgram(p.id)
        else if (ev.target.closest('.edit-prog-btn')) showProgramEdit(p, accent, onRefresh)
        else if (ev.target.closest('.del-prog-btn')) deleteProgram(p, onRefresh)
      })
      list.appendChild(card)
    })
    container.appendChild(list)

    // Program Coach events
    setTimeout(() => {
      const coachBtn = document.getElementById('prog-coach-btn')
      const coachInput = document.getElementById('prog-coach-input')
      const coachStatus = document.getElementById('prog-coach-status')
      const coachResponse = document.getElementById('prog-coach-response')
      const coachResponseText = document.getElementById('prog-coach-response-text')
      const coachProvider = document.getElementById('prog-coach-provider')

      if (coachBtn && coachInput && coachStatus) {
        coachBtn.addEventListener('click', async () => {
          const text = coachInput.value.trim()
          if (!text) {
            coachStatus.textContent = '⚠️ Escribe tu pregunta o petición'
            coachStatus.style.color = '#ff6b6b'
            return
          }

          const program = _state.activeProgram
          if (!program) {
            coachStatus.textContent = '⚠️ No hay un programa activo'
            coachStatus.style.color = '#ff6b6b'
            return
          }

          if (typeof programCoach !== 'function') {
            coachStatus.textContent = '❌ programCoach no está disponible'
            coachStatus.style.color = '#ff6b6b'
            return
          }

          coachBtn.disabled = true
          const origText = coachBtn.textContent
          coachBtn.textContent = '⏳ Consultando al coach…'
          coachStatus.textContent = ''
          if (coachResponse) coachResponse.style.display = 'none'

          try {
            const result = await programCoach(text, program, _state.settings || settings)

            if (result && result.name && result.weeks) {
              coachStatus.textContent = `✅ Nuevo programa "${result.name}" creado y activado`
              coachStatus.style.color = accent
              coachBtn.textContent = '✅ Listo'
              coachBtn.style.background = '#0a0a0a'
              coachBtn.style.color = accent
              if (coachResponse) coachResponse.style.display = 'none'
              if (window.appRefresh) window.appRefresh()
            } else {
              const msg = result?.message || 'Listo.'
              coachStatus.textContent = ''
              if (coachResponse && coachResponseText) {
                coachResponseText.textContent = msg
                coachResponse.style.display = 'block'
                if (coachProvider) coachProvider.textContent = result?._provider || 'llama'
              }
              coachBtn.textContent = '✅ Respondido'
              setTimeout(() => { coachBtn.textContent = origText }, 2000)
            }
          } catch (err) {
            coachStatus.textContent = `❌ ${err.message}`
            coachStatus.style.color = '#ff6b6b'
            coachBtn.textContent = '❌ Error'
            setTimeout(() => { coachBtn.textContent = origText }, 2000)
          } finally {
            coachBtn.disabled = false
            coachBtn.style.background = accent
            coachBtn.style.color = '#0a0a0a'
          }
        })
      }
    }, 0)
  })
}

async function activateProgram(id) {
  const s = await Storage.getSettings()
  s.activeProgramId = id
  await Storage.saveSettings(s)
  window.appRefresh()
}

async function showProgramEdit(program, accent, onRefresh) {
  const isNew = !program
  const p = program || { id: null, name: '', weeks: [{ name: 'Semana 1', subtitle: '', tag: '', days: [] }] }

  // Load exercises upfront to build ID→name map and datalist
  const allExercises = await Storage.getExercises()
  const idToName = {}
  for (const e of allExercises) {
    idToName[e.id] = e.name
  }

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end;justify-content:center;padding:0'
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })

  const modal = document.createElement('div')
  modal.style.cssText = `background:#141414;border-radius:20px 20px 0 0;padding:20px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;border:0.5px solid rgba(255,255,255,0.08);box-sizing:border-box`

  // Build weeks HTML (resolve exerciseId → name for display)
  let weeksHTML = ''
  for (const w of p.weeks) {
    let daysHTML = ''
    for (const d of w.days) {
      daysHTML += buildProgramDayHTML(d, idToName)
    }
    weeksHTML += `<div class="prog-week-block" style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.03);border-radius:14px">
      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center">
        <input class="prog-week-name" value="${w.name}" style="flex:1;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Nombre semana">
        <input class="prog-week-tag" value="${w.tag || ''}" style="width:60px;padding:8px 6px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:10px;outline:none;text-transform:uppercase;box-sizing:border-box" placeholder="ETIQUETA">
      </div>
      <div class="prog-days-in-week">${daysHTML}</div>
      <button class="add-day-in-week" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.12);cursor:pointer;background:transparent;color:rgba(255,255,255,0.4);font-size:12px;touch-action:manipulation">+ Añadir día</button>
    </div>`
  }

  modal.innerHTML = `
    <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#fafafa;margin-bottom:14px">${isNew ? 'Nuevo programa' : 'Editar programa'}</div>
    <input id="prog-name" value="${p.name}" style="width:100%;padding:10px 12px;border-radius:10px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:16px;outline:none;font-weight:600;margin-bottom:14px;box-sizing:border-box" placeholder="Nombre del programa">
    <div id="prog-weeks-container">${weeksHTML}</div>
    <button id="add-week-btn" style="margin-bottom:14px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.15);cursor:pointer;background:transparent;color:rgba(255,255,255,0.5);font-size:12px;font-weight:600">+ Añadir semana</button>
    <div style="display:flex;gap:10px">
      <button id="prog-save-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:${accent};color:#0a0a0a;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700">${isNew ? 'Crear' : 'Guardar'}</button>
      <button id="prog-cancel-btn" style="flex:1;padding:12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600">Cancelar</button>
    </div>`

  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  // Add datalist for exercise names
  const datalist = document.createElement('datalist')
  datalist.id = 'prog-ex-list'
  for (const e of allExercises) {
    const opt = document.createElement('option')
    opt.value = e.name
    datalist.appendChild(opt)
  }
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
        <input class="prog-week-name" value="Semana ${wi + 1}" style="flex:1;padding:8px 10px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:14px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Nombre semana">
        <input class="prog-week-tag" value="" style="width:60px;padding:8px 6px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.1);background:#0a0a0a;color:#fafafa;font-size:10px;outline:none;text-transform:uppercase;box-sizing:border-box" placeholder="ETIQUETA">
      </div>
      <div class="prog-days-in-week"></div>
      <button class="add-day-in-week" style="margin-top:6px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.12);cursor:pointer;background:transparent;color:rgba(255,255,255,0.4);font-size:12px;touch-action:manipulation">+ Añadir día</button>`
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
    const name = document.getElementById('prog-name').value.trim() || 'Programa sin nombre'

    // Fetch fresh in case exercises were created during editing
    const freshExercises = await Storage.getExercises()
    const exNameToId = {}
    for (const e of freshExercises) {
      exNameToId[e.name.toLowerCase()] = e.id
    }

    const weeks = []
    for (const wDiv of modal.querySelectorAll('.prog-week-block')) {
      const wName = wDiv.querySelector('.prog-week-name')?.value || 'Semana'
      const wTag = wDiv.querySelector('.prog-week-tag')?.value || ''
      const days = []
      for (const dDiv of wDiv.querySelectorAll('.prog-day-block')) {
        const dayName = dDiv.querySelector('.prog-day-name')?.value || 'Día'
        const sub = dDiv.querySelector('.prog-day-sub')?.value || ''
        const dur = parseInt(dDiv.querySelector('.prog-day-dur')?.value) || 0
        const exercises = []
        for (const exRow of dDiv.querySelectorAll('.prog-ex-row')) {
          const exName = exRow.querySelector('.prog-ex-name')?.value.trim()
          if (!exName) continue
          const sets = parseInt(exRow.querySelector('.prog-ex-sets')?.value) || 3
          const reps = exRow.querySelector('.prog-ex-reps')?.value || '10'
          const rest = parseInt(exRow.querySelector('.prog-ex-rest')?.value) || 60
          let exId = exNameToId[exName.toLowerCase()]
          if (!exId) {
            const ex = await Storage.findOrCreateExerciseByName(exName, '')
            exId = ex.id
            exNameToId[exName.toLowerCase()] = exId
          }
          exercises.push({ exerciseId: exId, sets, reps, rest })
        }
        days.push({ name: dayName, subtitle: sub, duration: dur, exercises })
      }
      weeks.push({ name: wName, subtitle: '', tag: wTag, days })
    }

    const prog = { id: isNew ? await generateId() : p.id, name, weeks }
    await Storage.saveProgram(prog)
    overlay.remove()
    if (onRefresh) onRefresh()
  })
}

function buildProgramDayHTML(day, idToName) {
  const d = day || { name: 'Día', subtitle: '', duration: 60, exercises: [] }
  let exHTML = ''
  for (const e of (d.exercises || [])) {
    const displayName = idToName[e.exerciseId] || e.exerciseId || ''
    exHTML += createProgExerciseRowHtml(displayName, e.sets || 3, e.reps || '10', e.rest || 60)
  }
  return `<div class="prog-day-block" style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.02);border-radius:10px">
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <input class="prog-day-name" value="${d.name}" style="flex:1;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:12px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Nombre día">
      <input class="prog-day-dur" type="number" value="${d.duration || 60}" style="width:44px;padding:6px 4px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;text-align:center;outline:none;box-sizing:border-box" placeholder="min">
      <button class="del-day-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:14px;padding:4px;flex-shrink:0">✕</button>
    </div>
    ${exHTML}
    <button class="add-ex-prog" style="margin-top:4px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.1);cursor:pointer;background:transparent;color:rgba(255,255,255,0.35);font-size:12px;touch-action:manipulation">+ Añadir ejercicio</button>
  </div>`
}

function buildProgramDayElement(idx) {
  const div = document.createElement('div')
  div.className = 'prog-day-block'
  div.style.cssText = 'margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.02);border-radius:10px'
  div.innerHTML = `
    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
      <span style="font-size:10px;color:rgba(255,255,255,0.3);width:16px;flex-shrink:0;text-align:center">${idx + 1}</span>
      <input class="prog-day-name" value="Día" style="flex:1;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:12px;outline:none;font-weight:600;box-sizing:border-box" placeholder="Nombre día">
      <input class="prog-day-dur" type="number" value="60" style="width:44px;padding:6px 4px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;text-align:center;outline:none;box-sizing:border-box" placeholder="min">
      <button class="del-day-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:14px;padding:4px;flex-shrink:0">✕</button>
    </div>
    <button class="add-ex-prog" style="margin-top:4px;width:100%;padding:8px;border-radius:8px;border:0.5px dashed rgba(255,255,255,0.1);cursor:pointer;background:transparent;color:rgba(255,255,255,0.35);font-size:12px;touch-action:manipulation">+ Añadir ejercicio</button>`
  return div
}

function createProgExerciseRowHtml(exerciseId, sets, reps, rest) {
  return `<div class="prog-ex-row" style="display:flex;gap:4px;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)">
    <input class="prog-ex-name" list="prog-ex-list" value="${exerciseId || ''}" placeholder="Nombre ej." style="flex:1;min-width:0;padding:6px 8px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;outline:none;box-sizing:border-box">
    <input class="prog-ex-sets" type="number" value="${sets}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="S">
    <input class="prog-ex-reps" value="${reps}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="R">
    <input class="prog-ex-rest" type="number" value="${rest}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="Desc">
    <button class="del-ex-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0;touch-action:manipulation">✕</button>
  </div>`
}

function createProgExerciseRow(exerciseId, sets, reps, rest) {
  const div = document.createElement('div')
  div.className = 'prog-ex-row'
  div.style.cssText = 'display:flex;gap:4px;align-items:center;padding:5px 0;border-bottom:0.5px solid rgba(255,255,255,0.04)'
  div.innerHTML = `
    <input class="prog-ex-name" list="prog-ex-list" placeholder="Nombre ej." style="flex:1;min-width:0;padding:6px 8px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:11px;outline:none;box-sizing:border-box">
    <input class="prog-ex-sets" type="number" value="${sets}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="S">
    <input class="prog-ex-reps" value="${reps}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="R">
    <input class="prog-ex-rest" type="number" value="${rest}" style="width:48px;padding:8px 4px;border-radius:8px;border:0.5px solid rgba(255,255,255,0.08);background:#0a0a0a;color:#fafafa;font-size:13px;text-align:center;outline:none;box-sizing:border-box" placeholder="Desc">
    <button class="del-ex-prog" style="background:none;border:0;color:#ff6b6b;cursor:pointer;font-size:16px;padding:8px 4px;flex-shrink:0;touch-action:manipulation">✕</button>`
  return div
}

function deleteProgram(program, onRefresh) {
  if (!confirm(`¿Eliminar "${program.name}"?`)) return
  Storage.deleteProgram(program.id).then(() => {
    if (onRefresh) onRefresh()
  })
}
