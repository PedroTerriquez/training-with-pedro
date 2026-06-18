// ── Friends Screen ──

function mountFriends(container, { accent, settings, refresh, computeStreak, allLogs, syncStreak }) {
  container.innerHTML = ''
  const username = settings.username || ''

  if (!username) {
    renderUsernamePrompt(container, { accent, refresh })
    return
  }

  const streak = computeStreak(allLogs)
  const today = new Date().toISOString().slice(0, 10)
  const exercisedToday = allLogs.some(l => l.date === today && l.weight > 0)

  const view = document.createElement('div')
  view.className = 'friends-view'

  view.innerHTML = `
    <div class="friends-header">👥 Amigos</div>
    <div class="friends-my-streak">🔥 Tu racha: <strong>${streak}</strong> ${streak === 1 ? 'día' : 'días'} ${exercisedToday ? '· Hoy ✅' : ''}</div>
    <div class="friends-list" id="friends-list"></div>
    <div class="friend-search">
      <input type="text" id="friend-search-input" placeholder="🔍 Buscar usuario..." autocomplete="off">
    </div>
    <div class="search-results" id="search-results"></div>
  `

  container.appendChild(view)

  loadFriends(username, accent)

  document.getElementById('friend-search-input').addEventListener('input', (e) => {
    const q = e.target.value.trim()
    if (q.length < 1) {
      document.getElementById('search-results').innerHTML = ''
      return
    }
    searchUsers(q, username, accent)
  })
}

function renderUsernamePrompt(container, { accent, refresh }) {
  const prompt = document.createElement('div')
  prompt.className = 'username-prompt'
  prompt.id = 'username-prompt'

  prompt.innerHTML = `
    <h2>👋 Bienvenido a Amigos</h2>
    <p>Elige un nombre de usuario para compartir tu racha con amigos.</p>
    <input type="text" id="username-input" placeholder="tu_usuario" maxlength="20" autocomplete="off">
    <div class="error-msg" id="username-error" style="display:none"></div>
    <button class="btn-primary" id="username-btn" disabled>Listo</button>
  `

  container.appendChild(prompt)

  const input = document.getElementById('username-input')
  const btn = document.getElementById('username-btn')
  const errorEl = document.getElementById('username-error')

  input.addEventListener('input', () => {
    btn.disabled = input.value.trim().length < 2
    errorEl.style.display = 'none'
  })

  btn.addEventListener('click', async () => {
    const username = input.value.trim()
    if (username.length < 2) return
    btn.disabled = true
    btn.textContent = 'Registrando...'
    errorEl.style.display = 'none'

    try {
      if (!PUSH_SERVER_URL) {
        errorEl.textContent = 'PUSH_SERVER_URL no configurado'
        errorEl.style.display = 'block'
        btn.disabled = false
        btn.textContent = 'Listo'
        return
      }
      const res = await fetch(`${PUSH_SERVER_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (!res.ok) {
        errorEl.textContent = data.error || 'Error al registrar'
        errorEl.style.display = 'block'
        btn.disabled = false
        btn.textContent = 'Listo'
        return
      }
      const s = await Storage.getSettings()
      s.username = username
      await Storage.saveSettings(s)
      if (typeof refresh === 'function') refresh()
    } catch (e) {
      errorEl.textContent = 'Error de red: ' + e.message
      errorEl.style.display = 'block'
      btn.disabled = false
      btn.textContent = 'Listo'
    }
  })
}

async function loadFriends(username, accent) {
  const listEl = document.getElementById('friends-list')
  if (!listEl) return

  listEl.innerHTML = '<div class="friends-empty">Cargando amigos...</div>'

  try {
    if (!PUSH_SERVER_URL) {
      listEl.innerHTML = '<div class="friends-empty">Configura PUSH_SERVER_URL</div>'
      return
    }
    const res = await fetch(`${PUSH_SERVER_URL}/api/friends/list?username=${encodeURIComponent(username)}`)
    const data = await res.json()
    const friends = data.friends || []

    if (friends.length === 0) {
      listEl.innerHTML = '<div class="friends-empty">Aún no tienes amigos. Busca y agrega amigos arriba. 👆</div>'
      return
    }

    listEl.innerHTML = ''
    for (const f of friends) {
      const card = document.createElement('div')
      card.className = 'friend-card'
      const initial = f.username.charAt(0).toUpperCase()
      const today = new Date().toISOString().slice(0, 10)
      const status = f.exercisedToday ? 'Hoy ✅' : (f.lastUpdate ? 'Inactivo' : '—')
      card.innerHTML = `
        <div class="friend-avatar">${initial}</div>
        <div class="friend-info">
          <div class="friend-name">${f.username}</div>
          <div class="friend-status">${status}</div>
        </div>
        <div class="friend-streak">${f.streak}<span class="unit">${f.streak === 1 ? 'día' : 'días'}</span></div>
      `
      listEl.appendChild(card)
    }
  } catch (e) {
    listEl.innerHTML = '<div class="friends-empty">Error al cargar amigos. Verifica tu conexión.</div>'
  }
}

async function searchUsers(q, currentUsername, accent) {
  const resultsEl = document.getElementById('search-results')
  if (!resultsEl) return

  resultsEl.innerHTML = '<div class="friends-empty">Buscando...</div>'

  try {
    if (!PUSH_SERVER_URL) return
    const res = await fetch(`${PUSH_SERVER_URL}/api/friends/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    const results = (data.results || []).filter(r => r.username !== currentUsername)

    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="friends-empty">No se encontraron usuarios</div>'
      return
    }

    resultsEl.innerHTML = ''
    for (const r of results) {
      const item = document.createElement('div')
      item.className = 'search-result-item'
      item.innerHTML = `
        <div class="search-result-info">
          <span class="search-result-name">${r.username}</span>
          <span class="search-result-streak">${r.streak} ${r.streak === 1 ? 'día' : 'días'}</span>
        </div>
        <button class="search-result-add" data-friend="${r.username}">Agregar</button>
      `
      const btn = item.querySelector('.search-result-add')
      btn.addEventListener('click', async () => {
        btn.disabled = true
        btn.textContent = '...'
        try {
          const res = await fetch(`${PUSH_SERVER_URL}/api/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUsername, friendUsername: r.username }),
          })
          if (res.ok) {
            btn.textContent = '✓ Agregado'
            document.getElementById('friend-search-input').value = ''
            resultsEl.innerHTML = ''
            loadFriends(currentUsername, accent)
          } else {
            const data = await res.json()
            btn.textContent = data.error || 'Error'
            setTimeout(() => { btn.disabled = false; btn.textContent = 'Agregar' }, 2000)
          }
        } catch {
          btn.textContent = 'Error'
          setTimeout(() => { btn.disabled = false; btn.textContent = 'Agregar' }, 2000)
        }
      })
      resultsEl.appendChild(item)
    }
  } catch {
    resultsEl.innerHTML = '<div class="friends-empty">Error al buscar</div>'
  }
}
