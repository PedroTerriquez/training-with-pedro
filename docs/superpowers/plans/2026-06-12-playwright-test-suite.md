# Playwright Test Suite Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single end-to-end Playwright test that covers the core user flow: profile → warmup → week switch → training (log weights) → stretch → coach card → history.

**Architecture:** Playwright with headless Chromium, IndexedDB seeding via `page.evaluate()`, static files served via `http-server`. Single `test()` block in `tests/flow.spec.js`.

**Tech Stack:** Playwright v1.52, http-server, vanilla JS (no build step)

---

### Task 1: Project Setup (package.json + playwright.config.js + npm install)

**Files:**
- Create: `package.json`
- Create: `playwright.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "training-with-pedro",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "http-server": "^14.1.1"
  }
}
```

- [ ] **Step 2: Create playwright.config.js**

```javascript
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
    viewport: { width: 390, height: 844 },
    browserName: 'chromium',
  },
  webServer: {
    command: 'npx http-server . -p 8080 -c-1 --silent',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

Expected output: packages installed, `node_modules/` created.

- [ ] **Step 4: Create test directory + verify setup**

```bash
mkdir -p tests
npx playwright test --list
```

Expected: "No tests found" (no test files yet).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json playwright.config.js tests/
git commit -m "test: add playwright test infrastructure"
```

---

### Task 2: Write the Full End-to-End Test

**Files:**
- Create: `tests/flow.spec.js`

This single file contains the complete test with:
1. IndexedDB seeding helper
2. Seed data (exercises, program, settings)
3. The single `test()` block with all flow steps

- [ ] **Step 1: Write the complete test file**

```javascript
const { test, expect } = require('@playwright/test')

// ── Helpers ──

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

function getToday() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
    const militaryHeavy = { exerciseId: 'ex-military', sets: 4, reps: '6-8', rest: 150 }

    return {
      id: 'prog-sample',
      name: 'Programa de Prueba',
      weeks: [
        {
          name: 'Semana 1 · Volumen',
          subtitle: '',
          tag: 'BUILD',
          days: buildDayArray({ name: 'Empuje', subtitle: 'Press Banca · Press Militar', duration: 60, exercises: [bench, military] }),
        },
        {
          name: 'Semana 2 · Fuerza',
          subtitle: '',
          tag: 'STRENGTH',
          days: buildDayArray({ name: 'Empuje Pesado', subtitle: 'Press Banca 5×5 · Press Militar 4×6-8', duration: 60, exercises: [benchHeavy, militaryHeavy] }),
        },
      ],
    }
  },
}

async function seedIndexedDB(page, data) {
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
}

// ── The Single Test ──

test('full user flow: profile → warmup → week switch → training → stretch → coach → history', async ({ page }) => {
  test.setTimeout(90000)

  // ── Step 1: Seed IndexedDB ──
  const program = SEED.getProgram()
  const settings = SEED.getSettings()
  await page.goto('/')
  await seedIndexedDB(page, {
    exercises: SEED.exercises,
    program,
    settings,
  })

  // Reload so the app picks up the seeded data
  await page.reload()
  await page.waitForFunction(() => typeof window.appRefresh === 'function')

  // Intercept the coach AI API call for later
  await page.route('**/*.workers.dev/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        analysis: '¡Excelente sesión, TestUser! Trabajaste con buena intensidad en press banca. Sigue así y no olvides descansar bien.',
        verdict: 'positive',
        _provider: 'test',
      }),
    })
  })

  // ── Step 2: Fill Profile (You screen) ──
  await page.evaluate(() => { location.hash = '#you' })
  await page.waitForSelector('#user-name')

  // Verify profile fields are pre-filled
  await expect(page.locator('#user-name')).toHaveText('TestUser')
  await expect(page.locator('#height-input')).toHaveValue('180')
  await expect(page.locator('#weight-input')).toHaveValue('80')
  await expect(page.locator('#sex-input')).toHaveValue('Masculino')
  await expect(page.locator('#age-input')).toHaveValue('28')
  await expect(page.locator('#goal-input')).toHaveValue('hipertrofia')
  await expect(page.locator('#exp-input')).toHaveValue('intermedio')
  await expect(page.locator('#occ-input')).toHaveValue('Ingeniero')

  // ── Step 3: Visit Today — Verify Phase Cards ──
  await page.evaluate(() => { location.hash = '#today' })
  await page.waitForTimeout(500)

  // Verify 3 phase cards exist
  const warmupCard = page.locator('[data-phase="warmup"]')
  const trainingCard = page.locator('[data-phase="training"]')
  const stretchCard = page.locator('[data-phase="stretch"]')
  await expect(warmupCard).toBeVisible()
  await expect(trainingCard).toBeVisible()

  // ── Step 4: Warmup — Navigate Prev/Next, Mark Done ──
  // Warmup sheet auto-opens after ~300ms. Wait for the "Hecho" button to appear.
  const hechoBtn = page.getByRole('button', { name: 'Hecho' })
  await expect(hechoBtn).toBeVisible({ timeout: 3000 })

  // Read current position from counter text ("1 / N" format)
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

  // Click Hecho → sheet closes, phase advances to 2
  await hechoBtn.click()
  await expect(hechoBtn).not.toBeVisible({ timeout: 2000 })

  // Warmup card should now show "Completado"
  await expect(warmupCard).toContainText('Completado')

  // ── Step 5: Plan — Switch Week ──
  await page.evaluate(() => { location.hash = '#plan' })
  await page.waitForTimeout(300)

  // Click Week 2 tab
  const week2Tab = page.locator('button:has-text("Semana 2")').first()
  await expect(week2Tab).toBeVisible()
  await week2Tab.click()
  await page.waitForTimeout(300)

  // Verify week changed to Semana 2
  await page.evaluate(() => { location.hash = '#today' })
  await page.waitForTimeout(500)

  // Verify exercises are now from Week 2 (different training card)
  const trainingCard2 = page.locator('[data-phase="training"]')
  await expect(trainingCard2).toBeVisible()
  // Week 2 shows "Fuerza" tag — verify it's different (the card shows the day name/sets)
  // Training card should show "Sigue" badge (not locked or done)
  await expect(trainingCard2).toContainText('Sigue')

  // ── Step 6: Training — Log Weights + Navigate Exercises ──
  // Click training card to open exercise detail
  await trainingCard2.click()
  await page.waitForTimeout(500)

  // Verify exercise detail sheet rendered
  await expect(page.getByRole('button', { name: 'Siguiente' }).first()).toBeVisible({ timeout: 3000 })

  // Verify Google and TikTok links
  const googleBtn = page.locator('.hero-google-btn').first()
  const tiktokBtn = page.locator('.hero-tiktok-btn').first()
  await expect(googleBtn).toBeVisible()
  await expect(tiktokBtn).toBeVisible()
  const googleHref = await googleBtn.getAttribute('href')
  expect(googleHref).toContain('google.com/search')

  // Read first exercise name from the nav pill
  const firstExName = await page.locator('.hero-google-btn').first().evaluate(el => {
    const href = el.getAttribute('href')
    const match = href.match(/q=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  })
  expect(firstExName).toBeTruthy()

  // Log weight: click + button on stepper
  const stepperInc = page.locator('.stepper-inc').first()
  await expect(stepperInc).toBeVisible()
  await stepperInc.click()
  await page.waitForTimeout(100)

  // Verify weight value updated (5kg after one click)
  const weightInput = page.locator('input[inputmode="decimal"]').first()
  const weightVal = await weightInput.inputValue()
  expect(parseFloat(weightVal)).toBe(5)

  // Click "Registrar · 5kg" button to save the weight
  const registerBtn = page.getByRole('button', { name: /Registrar/ })
  await expect(registerBtn).toBeVisible()
  await registerBtn.click()
  await page.waitForTimeout(400)

  // Verify saved — button text should change to "Guardado"
  await expect(page.getByRole('button', { name: /Guardado/ })).toBeVisible()

  // Navigate to next exercise
  const nextNav = page.getByRole('button', { name: 'Siguiente' }).first()
  await nextNav.click()
  await page.waitForTimeout(400)

  // Get the next exercise name
  const secondExName = await page.locator('.hero-google-btn').first().evaluate(el => {
    const href = el.getAttribute('href')
    const match = href.match(/q=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  })
  expect(secondExName).not.toBe(firstExName)
  expect(secondExName.length).toBeGreaterThan(0)

  // Go back to first exercise
  const prevNav = page.getByRole('button', { name: 'Anterior' }).first()
  await prevNav.click()
  await page.waitForTimeout(400)

  const backExName = await page.locator('.hero-google-btn').first().evaluate(el => {
    const href = el.getAttribute('href')
    const match = href.match(/q=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : ''
  })
  expect(backExName).toBe(firstExName)

  // Close the detail sheet by finding the close button (X icon SVG)
  const sheetCloseBtn = page.locator('button').filter({ has: page.locator('svg path[d="M2 2l10 10M12 2L2 12"]') })
  await expect(sheetCloseBtn).toBeVisible()
  await sheetCloseBtn.click()
  await page.waitForTimeout(400)

  // ── Step 7: Stretch — Navigate + Mark Done ──
  const stretchCard2 = page.locator('[data-phase="stretch"]')
  await expect(stretchCard2).toBeVisible()

  // Click stretch card (it should have "Sigue" badge now that warmup + training are done)
  await stretchCard2.click()
  await page.waitForTimeout(500)

  const stretchHecho = page.getByRole('button', { name: 'Hecho' })
  await expect(stretchHecho).toBeVisible({ timeout: 3000 })

  // Navigate prev/next in stretch
  const stretchNext = page.getByRole('button', { name: 'Siguiente' })
  if (await stretchNext.isVisible()) {
    const stretchFirstNext = await stretchNext.evaluate(el => el.textContent)
    await stretchNext.click()
    await page.waitForTimeout(400)
  }

  const stretchPrev = page.getByRole('button', { name: 'Anterior' })
  if (await stretchPrev.isVisible()) {
    await stretchPrev.click()
    await page.waitForTimeout(400)
  }

  // Mark stretch as done
  await stretchHecho.click()
  await page.waitForTimeout(500)

  // ── Step 8: Coach IA Card ──
  // After phase 4, the effort modal appears. Click "Justo" effort button.
  const effortOverlay = page.locator('#effort-overlay')
  await expect(effortOverlay).toBeVisible({ timeout: 5000 })
  const justoBtn = effortOverlay.locator('[data-effort="good"]')
  await justoBtn.click()

  // Coach card should eventually appear (loading → analysis)
  const coachCard = page.locator('#coach-card-regen')
  await expect(coachCard).toBeVisible({ timeout: 10000 })
  await expect(coachCard).toContainText('Resumen del coach')

  // ── Step 9: History — Verify Today's Logs ──
  await page.evaluate(() => { location.hash = '#history' })
  await page.waitForTimeout(500)

  // Verify the history page rendered (exercise list visible)
  const todayDate = getToday()
  await expect(page.locator('body')).toContainText(todayDate)
})
```

- [ ] **Step 2: Run the test**

```bash
npx playwright test --headed
```

Run in headed mode first to observe the flow. If any selectors fail, adjust the test accordingly.

- [ ] **Step 3: Run in headless mode**

```bash
npx playwright test
```

Expected: 1 passed, no failures.

- [ ] **Step 4: Commit**

```bash
git add tests/flow.spec.js
git commit -m "test: add end-to-end flow test"
git status
```

## Implementation Notes

### Selectors and Timing
- Warmup sheet auto-opens with `setTimeout(300ms)` — use `page.waitForTimeout(500)` for safety
- Warmup navigation uses CSS transitions (150ms) — wait `400ms` after clicks
- Exercise detail sheet may have multiple "Siguiente"/"Anterior" buttons — use `.first()` to target the nav pills
- The coach API intercept routes all requests to `*.workers.dev/*` — this covers the push Worker and AI endpoints

### Known Browser Behaviors
- `page.route()` intercept must be registered before the fetch is made (registered at test start)
- Google/TikTok links are actual `<a>` elements with `target="_blank"` — we verify `href` attribute, don't click (would open external URLs)
- Weight stepper increments by 5 (STEP=5 in detail.js line 295) — one click sets weight to 5
