const { test, expect } = require('@playwright/test')

const EXERCISES = [
  {
    id: 'ex-bench',
    name: 'Press Banca',
    dictId: '',
    muscle: '',
    imgUrl: '',
    gifUrl: '',
    tips: [],
    alternatives: [],
  },
  {
    id: 'ex-military',
    name: 'Press Militar',
    dictId: '',
    muscle: '',
    imgUrl: '',
    gifUrl: '',
    tips: [],
    alternatives: [],
  },
  {
    id: 'ex-madeup',
    name: 'Ejercicio Inventado X7',
    dictId: '',
    muscle: '',
    imgUrl: '',
    gifUrl: '',
    tips: [],
    alternatives: [],
  },
]

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
        tx.objectStore('settings').put(d.settings)
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onerror = () => reject(tx.error)
      }
      req.onerror = () => reject(req.error)
    })
  }, data)
}

test.describe('Dictionary normalization — skipped exercises', () => {
  test('shows ver mas link when exercises are skipped and opens overlay with names', async ({ page }) => {
    test.setTimeout(30000)

    const settings = {
      id: 'settings',
      activeProgramId: '',
      currentWeekIdx: 0,
      units: 'kg',
      accentColor: '#d4ff3a',
      hasWatch: false,
      userName: 'Test',
      height: '180',
      weight: '80',
      sex: 'Masculino',
      age: '28',
      goal: 'hipertrofia',
      experience: 'intermedio',
      occupation: '',
      pushSubscribed: false,
      pushServerUrl: '',
      sessionState: null,
      lastCoachAnalysis: null,
      rescheduleWeekOrder: {},
      language: 'es',
    }

    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, { exercises: EXERCISES, settings })

    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')
    await page.waitForFunction(() => typeof window.Storage !== 'undefined', { timeout: 5000 })

    // Navigate to You screen
    await page.evaluate(() => { location.hash = '#you' })
    await page.waitForTimeout(500)

    // Clear migration flag so Aplicar runs fresh
    await page.evaluate(() => localStorage.removeItem('dict_migration_v2'))

    // Click "Forzar" button
    const forceBtn = page.locator('#dict-force-btn')
    await expect(forceBtn).toBeVisible()
    await forceBtn.click()

    // Wait for status text to appear
    const statusEl = page.locator('#dict-migrate-status')
    await expect(statusEl).toBeVisible({ timeout: 10000 })

    // Verify it shows sin match 1
    await expect(statusEl).toContainText('sin match 1')

    // Verify ver más link is visible
    const verMas = page.locator('#ver-mas-link')
    await expect(verMas).toBeVisible()
    await expect(verMas).toContainText('ver más')

    // Click ver más — overlay should appear
    await verMas.click()
    await page.waitForTimeout(300)

    // Verify overlay shows the skipped exercise name
    const overlay = page.locator('#skipped-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay).toContainText('Ejercicio Inventado X7')

    // Close overlay via close button
    const closeBtn = page.locator('#skipped-close-btn')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()
    await page.waitForTimeout(200)

    // Verify overlay is gone
    await expect(overlay).not.toBeVisible()
  })
})
