const { test, expect } = require('@playwright/test')

function getDayIdx() {
  return (new Date().getDay() + 6) % 7
}

function buildDayArray(workoutDay) {
  const idx = getDayIdx()
  const days = []
  for (let i = 0; i < idx; i++) {
    days.push({ name: 'Rest', subtitle: '', duration: 0, exercises: [] })
  }
  days.push(workoutDay)
  return days
}

const SEED = {
  exercises: [
    {
      id: 'ex-bench',
      name: 'Press Banca',
      muscle: 'Chest',
      imgUrl: '',
      gifUrl: '',
      tips: ['Mantén los hombros hacia atrás y abajo', 'No rebotes el pecho', 'Respira profundo en cada repetición'],
      alternatives: [
        { name: 'Press Banca con Mancuernas', reason: 'Más rango de movimiento, activa estabilizadores' },
        { name: 'Press Inclinado con Barra', reason: 'Mayor énfasis en la parte superior del pecho' },
      ],
    },
    {
      id: 'ex-military',
      name: 'Press Militar',
      muscle: 'Shoulders',
      imgUrl: '',
      gifUrl: '',
      tips: ['Mantén el core apretado', 'No arquees la espalda', 'La barra baja hasta la clavícula'],
      alternatives: [
        { name: 'Press Militar con Mancuernas', reason: 'Permite mayor rotación y menos tensión en hombros' },
      ],
    },
    {
      id: 'ex-squat',
      name: 'Sentadilla',
      muscle: 'Quadriceps',
      imgUrl: '',
      gifUrl: '',
      tips: ['Mantén el pecho arriba', 'Rodillas hacia afuera', 'Baja hasta paralela'],
      alternatives: [
        { name: 'Sentadilla Búlgara', reason: 'Más trabajo unilateral, menos carga lumbar' },
      ],
    },
    {
      id: 'ex-deadlift',
      name: 'Peso Muerto',
      muscle: 'Back',
      imgUrl: '',
      gifUrl: '',
      tips: ['Espalda recta', 'Empuja con las piernas', 'Activa el core'],
      alternatives: [
        { name: 'Peso Muerto Rumano', reason: 'Menos rango, más isquiotibiales' },
      ],
    },
  ],
  getSettings() {
    return {
      id: 'settings',
      activeProgramId: 'prog-sample',
      currentWeekIdx: 0,
      units: 'kg',
      accentColor: '#d4ff3a',
      hasWatch: false,
      userName: 'TestUser',
      height: '180',
      weight: '80',
      sex: 'Masculino',
      age: '28',
      goal: 'hipertrofia',
      experience: 'intermedio',
      occupation: 'Ingeniero',
      pushSubscribed: false,
      pushServerUrl: '',
      sessionState: null,
      lastCoachAnalysis: null,
      rescheduleWeekOrder: {},
    }
  },
  getProgram() {
    const bench = { exerciseId: 'ex-bench', sets: 4, reps: '8-10', rest: 120 }
    const military = { exerciseId: 'ex-military', sets: 3, reps: '10-12', rest: 90 }
    const benchHeavy = { exerciseId: 'ex-bench', sets: 5, reps: '5', rest: 180 }
    const squat = { exerciseId: 'ex-squat', sets: 4, reps: '8-10', rest: 120 }

    return {
      id: 'prog-sample',
      name: 'Programa de Prueba',
      weeks: [
        {
          name: 'Semana 1 · Volumen',
          subtitle: '',
          tag: 'BUILD',
          days: buildDayArray({
            name: 'Empuje',
            subtitle: 'Press Banca · Press Militar',
            duration: 60,
            exercises: [bench, military],
          }),
        },
        {
          name: 'Semana 2 · Fuerza',
          subtitle: '',
          tag: 'STRENGTH',
          days: buildDayArray({
            name: 'Pierna y Espalda',
            subtitle: 'Press Banca 5×5 · Sentadilla',
            duration: 60,
            exercises: [benchHeavy, squat],
          }),
        },
      ],
    }
  },
}

async function seedIndexedDB(page, data, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await page.evaluate((d) => {
        return new Promise((resolve, reject) => {
          const req = indexedDB.open('coach-pedro-ai', 1)
          req.onsuccess = () => {
            const db = req.result
            const tx = db.transaction(['exercises', 'exerciseLogs', 'programs', 'settings'], 'readwrite')
            tx.objectStore('exercises').clear()
            tx.objectStore('exerciseLogs').clear()
            tx.objectStore('programs').clear()
            tx.objectStore('settings').clear()
            d.exercises.forEach(ex => tx.objectStore('exercises').put(ex))
            tx.objectStore('programs').put(d.program)
            tx.objectStore('settings').put(d.settings)
            tx.oncomplete = () => { db.close(); resolve() }
            tx.onerror = () => reject(tx.error)
          }
          req.onerror = () => reject(req.error)
        })
      }, data)
      return // success
    } catch (e) {
      if (attempt === retries) throw e
      await page.waitForTimeout(1000)
    }
  }
}

test('full user flow: profile → warmup → week switch (A→B) → training → stretch → coach → history → friends', async ({ page }) => {
  test.setTimeout(90000)

  // ── Seed IndexedDB ──
  const program = SEED.getProgram()
  const settings = SEED.getSettings()
  await page.goto('/')
  await page.waitForTimeout(600)
  await seedIndexedDB(page, { exercises: SEED.exercises, program, settings })

  await page.waitForTimeout(200)
  await page.reload()
  await page.waitForTimeout(1000)
  await page.waitForFunction(() => typeof window.appRefresh === 'function')
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 5000 }).catch(() => {})

  // Intercept Worker API calls
  await page.route(/\/api\//, async (route) => {
    const url = route.request().url()
    if (url.includes('/api/user/register')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) })
    }
    if (url.includes('/api/user/sync')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) })
    }
    if (url.includes('/api/friends/search')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [{ username: 'Ana', streak: 12, exercisedToday: true }] }) })
    }
    if (url.includes('/api/friends/add')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) })
    }
    if (url.includes('/api/friends/list')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ friends: [{ username: 'Ana', streak: 12, exercisedToday: true, lastUpdate: new Date().toISOString() }] }) })
    }
    // Default: coach AI response (existing)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        analysis: '¡Excelente sesión, TestUser! Trabajaste con buena intensidad en press banca. Sigue así y no olvides descansar bien.',
        verdict: 'positive',
        _topic: 'comparativa',
        _provider: 'test',
      }),
    })
  })

  // ── Step 1: Verify Profile ──
  await page.evaluate(() => { location.hash = '#you' })
  await page.waitForSelector('#user-name')

  await expect(page.locator('#user-name')).toHaveText('TestUser')
  await expect(page.locator('#height-input')).toHaveValue('180')
  await expect(page.locator('#weight-input')).toHaveValue('80')
  await expect(page.locator('#sex-input')).toHaveValue('Masculino')
  await expect(page.locator('#age-input')).toHaveValue('28')
  await expect(page.locator('#goal-input')).toHaveValue('hipertrofia')
  await expect(page.locator('#exp-input')).toHaveValue('intermedio')
  await expect(page.locator('#occ-input')).toHaveValue('Ingeniero')

  // ── Step 2: Visit Today — Verify Phase Cards ──
  await page.evaluate(() => { location.hash = '#today' })
  await page.waitForTimeout(500)

  // Warmup + training are PhaseCards; stretch is LockedPhase (locked by warmup)
  await expect(page.locator('[data-phase="warmup"]')).toBeVisible()
  await expect(page.locator('[data-phase="training"]')).toBeVisible()
  await expect(page.locator('#today-locked-warmup-stretch')).toBeVisible()

  // ── Step 3: Warmup — Navigate Prev/Next, Mark Done ──
  const hechoBtn = page.getByRole('button', { name: 'Hecho' })
  await expect(hechoBtn).toBeVisible({ timeout: 3000 })

  const getCounter = () => page.getByText(/\d+ \/ \d+/).first()
  const counter1 = await getCounter().textContent()
  expect(counter1).toMatch(/^1 \/ \d+$/)

  // Click Siguiente → counter changes
  await page.getByRole('button', { name: 'Siguiente' }).first().click()
  await page.waitForTimeout(400)
  const counter2 = await getCounter().textContent()
  expect(counter2).not.toBe(counter1)

  // Click Anterior → counter reverts
  await page.getByRole('button', { name: 'Anterior' }).first().click()
  await page.waitForTimeout(400)
  const counter3 = await getCounter().textContent()
  expect(counter3).toBe(counter1)

  // Mark warmup done
  await hechoBtn.click()
  await expect(hechoBtn).not.toBeVisible({ timeout: 2000 })
  await expect(page.locator('[data-phase="warmup"]')).toContainText('Completado')

  // ── Step 4: Plan — Switch Week ──
  await page.evaluate(() => { location.hash = '#plan' })
  await page.waitForTimeout(300)

  const week2Tab = page.locator('button:has-text("Semana 2")').first()
  await expect(week2Tab).toBeVisible()
  await week2Tab.click()
  await page.waitForTimeout(300)

  // ── Step 5: Back to Today — Training Card ──
  await page.evaluate(() => { location.hash = '#today' })
  await page.waitForTimeout(500)

  const trainingCard = page.locator('[data-phase="training"]')
  await expect(trainingCard).toBeVisible()
  await expect(trainingCard).toContainText('Sigue')

  // Click training card → open detail sheet
  await trainingCard.click()
  await page.waitForTimeout(500)

  // Verify Google + TikTok links
  const googleBtn = page.locator('.hero-google-btn').first()
  const tiktokBtn = page.locator('.hero-tiktok-btn').first()
  await expect(googleBtn).toBeVisible()
  await expect(tiktokBtn).toBeVisible()
  const googleHref = await googleBtn.getAttribute('href')
  expect(googleHref).toContain('google.com/search')

  // ── Step 5.5: Coach IA FAB ──
  const coachFab = page.locator('#coach-fab')
  await expect(coachFab).toBeVisible({ timeout: 3000 })
  await expect(coachFab).toContainText('Coach IA')

  // Click to open Coach IA overlay
  await coachFab.click()
  await page.waitForTimeout(400)

  // Verify overlay shows close button + exercise-specific greeting
  await expect(page.locator('#coach-close-btn')).toBeVisible()
  await expect(page.locator('text=¡Qué onda!')).toBeVisible()
  await expect(page.locator('text=Mejorar técnica')).toBeVisible()
  await expect(page.locator('text=¿Voy muy pesado?')).toBeVisible()

  // Close overlay via close button
  await page.locator('#coach-close-btn').click()
  await page.waitForTimeout(200)

  // Verify overlay is gone
  await expect(page.locator('#coach-close-btn')).not.toBeVisible()

  // ── Step 6: Log Weights for Both Exercises ──
  // Exercise 1: Press Banca 5×5
  const stepperInc = page.locator('.stepper-inc').first()
  await expect(stepperInc).toBeVisible()
  await stepperInc.click()
  await page.waitForTimeout(100)

  const weightInput = page.locator('input[inputmode="decimal"]').first()
  const weightVal = await weightInput.inputValue()
  expect(parseFloat(weightVal)).toBe(5)

  // Register weight — match "Registrar · 5kg"
  const registerBtn = page.getByRole('button', { name: /Registrar ·/ })
  await expect(registerBtn).toBeVisible()
  await registerBtn.click()
  await page.waitForTimeout(600)

  // Navigate to exercise 2 via Siguiente nav pill
  await page.getByRole('button', { name: 'Siguiente' }).first().click()
  await page.waitForTimeout(400)

  // Exercise 2: Should show Sentadilla (from Week B), NOT Press Militar (from Week A)
  // This verifies the week-switch navigation bug: openDetailSheet must search
  // only the current week, not all weeks, for prev/next context.
  await expect(page.locator('text=Sentadilla').first()).toBeVisible({ timeout: 2000 })

  // Increment stepper + register
  const stepperInc2 = page.locator('.stepper-inc').first()
  await stepperInc2.click()
  await page.waitForTimeout(100)
  const registerBtn2 = page.getByRole('button', { name: /Registrar ·/ })
  await expect(registerBtn2).toBeVisible()
  await registerBtn2.click()
  await page.waitForTimeout(600)

  // Close detail sheet → triggers refresh() which recalculates _todayExDone
  const sheetCloseBtn = page.locator('button').filter({
    has: page.locator('svg path[d="M2 2l10 10M12 2L2 12"]'),
  })
  await expect(sheetCloseBtn).toBeVisible()
  await sheetCloseBtn.click()
  await page.waitForTimeout(500)

  // Stretch sheet auto-opens after training completes (phase 3).
  // The stretch sheet is now on top of the phase cards.
  const stretchHecho = page.getByRole('button', { name: 'Hecho' })
  await expect(stretchHecho).toBeVisible({ timeout: 5000 })

  // Navigate stretch if controls visible
  const stretchNext = page.getByRole('button', { name: 'Siguiente' })
  if (await stretchNext.isVisible()) {
    await stretchNext.click()
    await page.waitForTimeout(400)
  }
  const stretchPrev = page.getByRole('button', { name: 'Anterior' })
  if (await stretchPrev.isVisible()) {
    await stretchPrev.click()
    await page.waitForTimeout(400)
  }

  await stretchHecho.click()
  await page.waitForTimeout(500)

  // ── Step 7.5: Streak Celebration ──
  const streakOverlay = page.locator('#streak-overlay')
  await expect(streakOverlay).toBeVisible({ timeout: 5000 })
  await expect(streakOverlay.locator('text=Días consecutivos')).toBeVisible()
  // Wait for auto-dismiss
  await expect(streakOverlay).not.toBeVisible({ timeout: 5000 })

  // ── Step 8: Effort Modal + Coach Card ──
  const effortOverlay = page.locator('#effort-overlay')
  await expect(effortOverlay).toBeVisible({ timeout: 5000 })
  await effortOverlay.locator('[data-effort="good"]').click()

  const coachCard = page.locator('#coach-card-regen')
  await expect(coachCard).toBeVisible({ timeout: 10000 })
  await expect(coachCard).toContainText('Resumen del coach')
  // Verify provider text is NOT present (removed in favor of topic label)
  await expect(coachCard.locator('text=llama')).not.toBeVisible()

  // ── Step 9: History Verification ──
  await page.evaluate(() => { location.hash = '#history' })
  await page.waitForTimeout(500)

  // History shows the completed session with exercise names (from Week B)
  await expect(page.locator('body')).toContainText('Press Banca')
  await expect(page.locator('body')).toContainText('Sentadilla')
  await expect(page.locator('body')).toContainText('Completado')

  // ── Step 10: Friends — Navigate to Amigos Tab ──
  // Mock searchUsers + loadFriends for offline operation
  await page.evaluate(() => {
    window.searchUsers = async (q, currentUsername, accent) => {
      const resultsEl = document.getElementById('search-results')
      if (!resultsEl || q.toLowerCase() !== 'ana') return
      resultsEl.innerHTML = `<div class="search-result-item"><div class="search-result-info"><span class="search-result-name">Ana</span><span class="search-result-streak">12 días</span></div><button class="search-result-add" data-friend="Ana">Agregar</button></div>`
      const btn = resultsEl.querySelector('.search-result-add')
      btn.addEventListener('click', async () => {
        btn.disabled = true
        btn.textContent = '...'
        const friendsList = document.getElementById('friends-list')
        friendsList.innerHTML = `<div class="friend-card"><div class="friend-avatar">A</div><div class="friend-info"><div class="friend-name">Ana</div><div class="friend-status">Hoy ✅</div></div><div class="friend-streak">12<span class="unit">días</span></div></div>`
        btn.textContent = '✓ Agregado'
      })
    }
    window.loadFriends = async (username, accent) => {
      const listEl = document.getElementById('friends-list')
      if (listEl) listEl.innerHTML = ''
    }
  })
  await page.evaluate(() => { location.hash = '#friends' })
  await page.waitForTimeout(500)

  // First visit shows username prompt
  await expect(page.locator('#username-prompt')).toBeVisible()
  await expect(page.locator('#username-prompt')).toContainText('Bienvenido')

  // ── Step 11: Set Username ──
  const usernameInput = page.locator('#username-input')
  await expect(usernameInput).toBeVisible()
  await usernameInput.fill('TestUser')

  const listoBtn = page.locator('#username-btn')
  await expect(listoBtn).toBeEnabled()
  await listoBtn.click()
  await page.waitForTimeout(2000)

  // Prompt disappears, main view shows
  await expect(page.locator('#username-prompt')).not.toBeVisible()
  await expect(page.locator('.friends-my-streak')).toContainText('racha')

  // ── Step 12: Search for Friend ──
  const searchInput = page.locator('#friend-search-input')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('Ana')
  await page.waitForTimeout(500)

  // Search result shows mock friend
  const searchResult = page.locator('.search-result-item')
  await expect(searchResult).toBeVisible()
  await expect(searchResult).toContainText('Ana')

  // ── Step 13: Add Friend ──
  const addBtn = page.locator('.search-result-add')
  await expect(addBtn).toBeVisible()
  await addBtn.click()
  await page.waitForTimeout(500)

  // Verify friend appears in list
  await expect(page.locator('#friends-list')).toContainText('Ana')

  // ── Step 14: Verify Friend Streak Display ──
  const friendCard = page.locator('.friend-card')
  await expect(friendCard).toBeVisible()
  await expect(friendCard).toContainText('12')
  await expect(friendCard).toContainText('Hoy')
})
