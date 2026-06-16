const { test, expect } = require('@playwright/test')

function getDayIdx() {
  return (new Date().getDay() + 6) % 7
}

function buildDayArray(workoutDay) {
  const idx = getDayIdx()
  const days = []
  for (let i = 0; i < idx; i++) { days.push({ name: 'Rest', subtitle: '', duration: 0, exercises: [] }) }
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
      tips: ['Mantén los hombros hacia atrás y abajo'],
      alternatives: [],
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
      pushSubscribed: false,
      pushServerUrl: '',
      sessionState: null,
      lastCoachAnalysis: null,
      rescheduleWeekOrder: {},
    }
  },
  getProgram() {
    const bench = { exerciseId: 'ex-bench', sets: 4, reps: '8-10', rest: 120 }
    return {
      id: 'prog-sample',
      name: 'Programa Test',
      weeks: [{
        name: 'Semana 1',
        subtitle: '',
        tag: 'BUILD',
        days: buildDayArray({ name: 'Empuje', subtitle: 'Press Banca', duration: 60, exercises: [bench] }),
      }],
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

test.describe('Rest notification flow', () => {
  test('iniciar button stores exercise data in cache without toast', async ({ page, context }) => {
    const program = SEED.getProgram()
    const settings = SEED.getSettings()
    const today = new Date().toISOString().slice(0, 10)
    settings.sessionState = { date: today, phase: 2, todayExDone: 0 }
    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, { exercises: SEED.exercises, program, settings })
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    // Mock Notification API for headless Chromium
    await page.evaluate(() => {
      try {
        Object.defineProperty(Notification, 'permission', { get: () => 'granted', configurable: true })
      } catch (e) {
        // Fallback: override the entire Notification
        window.Notification = class {
          constructor() {}
          static permission = 'granted'
          static requestPermission = async () => 'granted'
        }
      }
      Notification.requestPermission = async () => 'granted'
    })

    await page.evaluate(() => { location.hash = '#today' })
    await page.waitForTimeout(300)
    await page.evaluate(() => { location.hash = '#detail=ex-bench' })
    await page.waitForTimeout(800)

    const iniciarBtn = page.locator('button:has-text("Iniciar")')
    await expect(iniciarBtn).toBeVisible({ timeout: 3000 })

    // Verify permission is granted so the handler doesn't bail early
    const permDebug = await page.evaluate(() => Notification.permission)
    console.log('Notification.permission:', permDebug)
    expect(permDebug).toBe('granted')

    await iniciarBtn.click()
    await page.waitForTimeout(800)

    // Verify NO toast with ✓ appears
    const toast = page.locator('#backup-toast')
    const toastText = await toast.evaluate(el => el ? el.textContent : '').catch(() => '')
    expect(toastText).not.toContain('✓')

    // Verify data stored in rest-pending cache
    const stored = await page.evaluate(async () => {
      const out = {}
      try {
        const cache = await caches.open('rest-pending')
        const res = await cache.match('/pending')
        if (!res) { out.matchNull = true; return out }
        out.data = await res.json()
      } catch (e) { out.error = e.message }
      return out
    })
    console.log('cache post-click:', JSON.stringify(stored))
    expect(stored.data).toBeDefined()
    expect(stored.data.name).toBe('Press Banca')
    expect(stored.data.restSec).toBe(120)
    expect(stored.data.sets).toBe(4)
    expect(stored.data.reps).toBe('8-10')
    expect(stored.data.exerciseId).toBe('ex-bench')
  })

  test('rest timer completion shows toast and re-stores data for next cycle', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    const testData = { name: 'Press Banca', restSec: 120, sets: 4, reps: '8-10', exerciseId: 'ex-bench' }

    await page.evaluate(async (data) => {
      try {
        const cache = await caches.open('rest-timer')
        await cache.put('/pending', new Response(JSON.stringify({
          endTime: Date.now() - 1000,
          name: data.name,
          tag: 'test-tag',
          restSec: data.restSec,
          sets: data.sets,
          reps: data.reps,
          exerciseId: data.exerciseId,
        })))
      } catch (e) { /* cache not available */ }
    }, testData)

    await page.evaluate(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await new Promise(r => setTimeout(r, 100))
    })
    await page.waitForTimeout(1500)

    const toast = page.locator('#backup-toast')
    const toastText = await toast.evaluate(el => el ? el.textContent : '').catch(() => '')
    expect(toastText).toContain('Descanso terminado')

    const stored = await page.evaluate(async () => {
      try {
        const cache = await caches.open('rest-pending')
        const res = await cache.match('/pending')
        if (!res) return null
        return await res.json()
      } catch (e) { return { error: e.message } }
    })
    expect(stored).not.toBeNull()
    expect(stored.name).toBe('Press Banca')
    expect(stored.restSec).toBe(120)
    expect(stored.sets).toBe(4)
  })

  test('notification tap triggers new rest cycle via _checkPendingRest', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    let startTimerPayload = null
    await page.route(/rest-timer\/start/, async (route) => {
      startTimerPayload = route.request().postData()
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'scheduled' }) })
    })

    await page.evaluate(async () => {
      try {
        const cache = await caches.open('rest-pending')
        await cache.put('/pending', new Response(JSON.stringify({
          name: 'Press Banca',
          restSec: 120,
          sets: 4,
          reps: '8-10',
          exerciseId: 'ex-bench',
        })))
      } catch (e) { /* cache not available */ }
    })

    await page.evaluate(async () => {
      try {
        const cache = await caches.open('rest-pending')
        await cache.put('/from-notification', new Response('1'))
      } catch (e) { /* cache not available */ }
    })

    await page.evaluate(async () => {
      window.dispatchEvent(new Event('focus'))
      await new Promise(r => setTimeout(r, 300))
    })
    await page.waitForTimeout(1000)

    const banner = page.locator('#rest-timer-banner')
    await expect(banner).toBeVisible({ timeout: 3000 })
    await expect(banner).toContainText('Press Banca')

    expect(startTimerPayload).not.toBeNull()
    if (startTimerPayload) {
      const payload = JSON.parse(startTimerPayload)
      expect(payload.exerciseId).toBe('ex-bench')
      expect(payload.restSec).toBe(120)
      expect(payload.sets).toBe(4)
      expect(payload.reps).toBe('8-10')
    }

    await page.evaluate(async () => {
      if (typeof window.cancelRestTimer === 'function') {
        await window.cancelRestTimer(window.pendingCancelTag || '')
      }
    })
  })

  test('_completeRest sends local notification and re-shows exercise notification', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    await page.evaluate(() => {
      try {
        Object.defineProperty(Notification, 'permission', { get: () => 'granted', configurable: true })
      } catch (e) {
        window.Notification = class {
          constructor() {}
          static permission = 'granted'
          static requestPermission = async () => 'granted'
        }
      }
      Notification.requestPermission = async () => 'granted'
    })

    const notifyCalls = []
    await page.evaluate(() => {
      const orig = window.notifyWatch
      window.notifyWatch = async (title, body, opts) => {
        window.__notifyCalls = window.__notifyCalls || []
        window.__notifyCalls.push({ title, body, opts: opts || {} })
      }
    })

    const testData = { name: 'Press Banca', restSec: 120, sets: 4, reps: '8-10', exerciseId: 'ex-bench' }

    await page.evaluate(async (data) => {
      try {
        const cache = await caches.open('rest-timer')
        await cache.put('/pending', new Response(JSON.stringify({
          endTime: Date.now() - 1000,
          name: data.name,
          tag: 'test-tag',
          restSec: data.restSec,
          sets: data.sets,
          reps: data.reps,
          exerciseId: data.exerciseId,
        })))
      } catch (e) { /* cache not available */ }
    }, testData)

    await page.evaluate(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await new Promise(r => setTimeout(r, 300))
    })
    await page.waitForTimeout(1500)

    const toast = page.locator('#backup-toast')
    const toastText = await toast.evaluate(el => el ? el.textContent : '').catch(() => '')
    expect(toastText).toContain('Descanso terminado')

    const calls = await page.evaluate(() => window.__notifyCalls || [])
    console.log('notifyWatch calls:', JSON.stringify(calls))

    expect(calls.length).toBeGreaterThanOrEqual(2)
    const doneCall = calls.find(c => c.body === 'Descanso terminado')
    expect(doneCall).toBeDefined()
    expect(doneCall.title).toContain('Press Banca')
    expect(doneCall.opts.requireInteraction).toBe(false)

    const exerciseCall = calls.find(c => c.title === 'Press Banca' && c.body.includes('Tap para iniciar'))
    expect(exerciseCall).toBeDefined()
    expect(exerciseCall.opts.requireInteraction).toBe(true)
  })
})
