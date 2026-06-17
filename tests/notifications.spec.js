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
  // 1. Click "Iniciar" only sends the start push (with exercise data). It must
  //    NOT start the timer or schedule the delayed push at click time.
  test('iniciar sends a start push with exercise data and arms nothing', async ({ page }) => {
    const program = SEED.getProgram()
    const settings = SEED.getSettings()
    settings.pushSubscribed = true
    const today = new Date().toISOString().slice(0, 10)
    settings.sessionState = { date: today, phase: 2, todayExDone: 0 }

    let startPushPayload = null
    await page.route(/\/api\/push\/start/, async (route) => {
      startPushPayload = route.request().postData()
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'sent' }) })
    })
    let restTimerCalled = false
    await page.route(/rest-timer\/start/, async (route) => {
      restTimerCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'scheduled' }) })
    })

    await page.goto('/')
    await page.waitForTimeout(600)
    await seedIndexedDB(page, { exercises: SEED.exercises, program, settings })
    await page.waitForTimeout(200)
    await page.reload()
    await page.waitForTimeout(1000)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 5000 }).catch(() => {})

    await page.evaluate(() => { location.hash = '#today' })
    await page.waitForTimeout(300)
    await page.evaluate(() => { location.hash = '#detail=ex-bench' })
    await page.waitForTimeout(800)

    const iniciarBtn = page.locator('button:has-text("Iniciar")')
    await expect(iniciarBtn).toBeVisible({ timeout: 3000 })
    await iniciarBtn.click()
    // sendStartNotification waits 2s (Apple Watch sync) before the fetch.
    await page.waitForTimeout(2800)

    expect(startPushPayload).not.toBeNull()
    const payload = JSON.parse(startPushPayload)
    expect(payload.deviceId).toBeTruthy()
    expect(payload.exerciseData).toBeDefined()
    expect(payload.exerciseData.name).toBe('Press Banca')
    expect(payload.exerciseData.restSec).toBe(120)
    expect(payload.exerciseData.sets).toBe(4)
    expect(payload.exerciseData.reps).toBe('8-10')
    expect(payload.exerciseData.exerciseId).toBe('ex-bench')

    // The click must NOT schedule the delayed push nor show the banner.
    expect(restTimerCalled).toBe(false)
    await expect(page.locator('#rest-timer-banner')).toHaveCount(0)
  })

  // 2. Tapping a "start" notification schedules the delayed push (~10s early)
  //    and shows the decorative banner.
  test('tap start notification schedules delayed push 10s early and shows banner', async ({ page }) => {
    let startTimerPayload = null
    await page.route(/rest-timer\/start/, async (route) => {
      startTimerPayload = route.request().postData()
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'scheduled' }) })
    })
    let cancelPayload = null
    await page.route(/rest-timer\/cancel/, async (route) => {
      cancelPayload = route.request().postData()
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'ok' })
    })

    await page.goto('/')
    await page.waitForTimeout(500)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    // The SW writes the exercise payload + flag when a start notification is tapped.
    await page.evaluate(async () => {
      const cache = await caches.open('rest-pending')
      await cache.put('/pending', new Response(JSON.stringify({
        name: 'Press Banca', restSec: 120, sets: 4, reps: '8-10', exerciseId: 'ex-bench',
      })))
      await cache.put('/from-notification', new Response('1'))
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
    const payload = JSON.parse(startTimerPayload)
    // endTime targets ~10s before the real rest end (latency compensation).
    expect(typeof payload.endTime).toBe('number')
    expect(payload.endTime).toBeGreaterThan(Date.now() + 100 * 1000)
    expect(payload.endTime).toBeLessThan(Date.now() + 120 * 1000)
    expect(payload.deviceId).toBeTruthy()
    expect(payload.exerciseId).toBe('ex-bench')
    expect(payload.restSec).toBe(120)
    expect(payload.sets).toBe(4)
    expect(payload.reps).toBe('8-10')
    expect(payload.title).toBe('Press Banca')
    expect(payload.tag).toBeTruthy()

    // Tapping the banner cancels the queued delayed push.
    await page.evaluate(async () => {
      const el = document.getElementById('rest-timer-banner')
      if (el) el.click()
      await new Promise(r => setTimeout(r, 500))
    })
    expect(cancelPayload).not.toBeNull()
    const cancelData = JSON.parse(cancelPayload)
    expect(cancelData.tag).toBeTruthy()
    expect(cancelData.deviceId).toBeTruthy()
  })

  // 3. The decorative banner completing shows a toast but does NOT reschedule —
  //    the delayed push is the source of truth for the next cycle.
  test('banner completion shows toast and does not reschedule', async ({ page }) => {
    let restTimerCalled = false
    await page.route(/rest-timer\/start/, async (route) => {
      restTimerCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'scheduled' }) })
    })

    await page.goto('/')
    await page.waitForTimeout(500)
    await page.waitForFunction(() => typeof window.appRefresh === 'function')

    await page.evaluate(async () => {
      const cache = await caches.open('rest-timer')
      await cache.put('/pending', new Response(JSON.stringify({
        endTime: Date.now() - 1000,
        name: 'Press Banca', tag: 'test-tag', restSec: 120, sets: 4, reps: '8-10', exerciseId: 'ex-bench',
      })))
    })

    await page.evaluate(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
      await new Promise(r => setTimeout(r, 100))
    })
    await page.waitForTimeout(1500)

    const toast = page.locator('#backup-toast')
    const toastText = await toast.evaluate(el => el ? el.textContent : '').catch(() => '')
    expect(toastText).toContain('Descanso terminado')

    await expect(page.locator('#rest-timer-banner')).toHaveCount(0)
    // Completion must not schedule a new delayed push (the push drives the cycle).
    expect(restTimerCalled).toBe(false)
  })
})
