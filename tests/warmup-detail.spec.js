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

function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
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

const BASE_SETTINGS = {
  id: 'settings',
  activeProgramId: 'prog-test',
  currentWeekIdx: 0,
  units: 'kg',
  accentColor: '#d4ff3a',
  hasWatch: false,
  pushSubscribed: false,
  pushServerUrl: '',
  sessionState: null,
  lastCoachAnalysis: null,
  rescheduleWeekOrder: {},
}

test.describe('Warmup detail sheet rendering', () => {

  test('renders sectioned cards when item has posInicial/ejecucion/respiracion/duracion', async ({ page }) => {
    const program = {
      id: 'prog-test',
      name: 'Test Program',
      weeks: [{
        name: 'Semana 1',
        subtitle: '',
        tag: 'BUILD',
        days: buildDayArray({
          name: 'Empuje',
          subtitle: 'Press Banca',
          duration: 60,
          exercises: [{ exerciseId: 'ex-bench', sets: 4, reps: '8-10', rest: 120 }],
        }),
      }],
    }

    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, {
      exercises: [{ id: 'ex-bench', name: 'Press Banca', muscle: 'Chest', imgUrl: '', tips: [], alternatives: [] }],
      program,
      settings: { ...BASE_SETTINGS },
    })
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    // Navigate to Today -> warmup sheet auto-opens with chest warmup items
    await page.evaluate(() => { location.hash = '#today' })
    await page.waitForTimeout(1000)

    // Chest warmup items from WARMUP_DATA have all 4 sections
    await expect(page.getByText('Posición Inicial').first()).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('Ejecución').first()).toBeVisible()
    await expect(page.getByText('Respiración').first()).toBeVisible()
    await expect(page.getByText('Duración').first()).toBeVisible()
  })

  test('falls back to desc for GENERIC_WARMUP items without section fields', async ({ page }) => {
    // Quadriceps does not resolve to any WARMUP_DATA key -> GENERIC_WARMUP_ONLY fallback
    const program = {
      id: 'prog-test',
      name: 'Test Program',
      weeks: [{
        name: 'Semana 1',
        subtitle: '',
        tag: 'BUILD',
        days: buildDayArray({
          name: 'Piernas',
          subtitle: 'Sentadilla',
          duration: 60,
          exercises: [{ exerciseId: 'ex-squat', sets: 4, reps: '8-10', rest: 120 }],
        }),
      }],
    }

    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, {
      exercises: [{ id: 'ex-squat', name: 'Sentadilla', muscle: 'Quadriceps', imgUrl: '', tips: [], alternatives: [] }],
      program,
      settings: { ...BASE_SETTINGS },
    })
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    // Navigate to Today -> warmup sheet auto-opens with GENERIC_WARMUP items
    await page.evaluate(() => { location.hash = '#today' })
    await page.waitForTimeout(1000)

    // GENERIC_WARMUP items have desc field, not sections
    // "Cómo hacerlo" label shows in the fallback path
    await expect(page.getByText('Cómo hacerlo').first()).toBeVisible({ timeout: 3000 })

    // Section labels should NOT appear
    await expect(page.getByText('Posición Inicial')).toHaveCount(0)
  })

  test('shows STALLBAR badge when item has stallbar: true', async ({ page }) => {
    // Use Chest exercise, set phase to 3 to skip warmup/training and open stretch
    const program = {
      id: 'prog-test',
      name: 'Test Program',
      weeks: [{
        name: 'Semana 1',
        subtitle: '',
        tag: 'BUILD',
        days: buildDayArray({
          name: 'Empuje',
          subtitle: 'Press Banca',
          duration: 60,
          exercises: [{ exerciseId: 'ex-bench', sets: 4, reps: '8-10', rest: 120 }],
        }),
      }],
    }
    const today = getTodayStr()

    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, {
      exercises: [{ id: 'ex-bench', name: 'Press Banca', muscle: 'Chest', imgUrl: '', tips: [], alternatives: [] }],
      program,
      settings: { ...BASE_SETTINGS, sessionState: { date: today, phase: 3, todayExDone: 0 } },
    })
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    // Navigate to Today -> stretch sheet auto-opens (phase 3)
    await page.evaluate(() => { location.hash = '#today' })
    await page.waitForTimeout(1000)

    // Chest stretch: 3rd item "Apertura de Pecho Pasiva en Espaldera" has stallbar: true
    // Navigate Siguiente twice
    const nextBtn = page.getByRole('button', { name: 'Siguiente' }).first()
    await expect(nextBtn).toBeVisible({ timeout: 2000 })
    await nextBtn.click()
    await page.waitForTimeout(400)
    await nextBtn.click()
    await page.waitForTimeout(400)

    // STALLBAR badge should now be visible
    await expect(page.getByText('STALLBAR').first()).toBeVisible({ timeout: 2000 })
  })
})
