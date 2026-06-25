const CACHE = 'v87'
const ASSETS = [
  './index.html',
  './styles.css',
  './manifest.json',
  './data.js',
  './data/warmup.js',
  './data/exercise-dictionary.js',
  './data/ai-prompt.js',
  './data/Gemini_Generated_Image_skjbz4skjbz4skjb.png',
  './db.js',
  './storage.js',
  './exercise-images.js',
  './components/ui.js',
  './components/chart.js',
  './components/warmup.js',
  './components/detail.js',
  './views/today.js',
  './views/plan.js',
  './views/history.js',
  './views/you.js',
  './app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
    ])
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

})

// ── Rest-timer notification helpers ──

const START_TAG = 'rest-start'
const DONE_TAG = 'rest-done'

function _repsLabel(ex) {
  return ex && ex.sets && ex.reps ? `${ex.sets}×${ex.reps} · ` : ''
}

// "Tap para iniciar descanso" — always one visible (stable tag, replaces previous).
function showStartNotification(ex) {
  return self.registration.showNotification(ex.name || 'Coach Pedro AI', {
    body: `${_repsLabel(ex)}Tap para iniciar descanso ▸`,
    icon: 'icons/icon-192.png',
    tag: START_TAG,
    renotify: true,
    requireInteraction: true,
    data: { kind: 'start', url: './', exerciseData: ex },
  })
}

// "Descanso terminado" — stable tag so it never stacks.
function showDoneNotification(ex) {
  return self.registration.showNotification(`⏰ ${ex.name || 'Descanso'}`, {
    body: 'Descanso terminado',
    icon: 'icons/icon-192.png',
    tag: DONE_TAG,
    renotify: true,
    requireInteraction: false,
    data: { kind: 'done', url: './' },
  })
}

// Best-effort auto-dismiss of the "terminado" notification (reliable on desktop,
// not guaranteed on iOS where the SW may be killed first).
async function closeDoneAfter(ms) {
  await new Promise((r) => setTimeout(r, ms))
  const ns = await self.registration.getNotifications({ tag: DONE_TAG })
  ns.forEach((n) => n.close())
}

self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let data = {}
    try {
      if (e.data) data = e.data.json()
    } catch {}
    // Pushes are payload-less (iOS doesn't reliably show encrypted payloads):
    // the client staged the notification spec in the cache before waking us.
    if (!data.kind) {
      try {
        const cache = await caches.open('push-pending')
        const res = await cache.match('/pending')
        if (res) data = await res.json()
      } catch {}
    }
    const ex = data.exerciseData
    if (data.kind === 'start' && ex) {
      await showStartNotification(ex)
      return
    }
    if (data.kind === 'done' && ex) {
      await showDoneNotification(ex)
      await showStartNotification(ex)
      await closeDoneAfter(20000)
      return
    }
    // Generic fallback notification.
    await self.registration.showNotification(data.title || 'Coach Pedro AI', {
      body: data.body || '',
      icon: 'icons/icon-192.png',
      tag: data.tag || `push-${Date.now()}`,
      requireInteraction: true,
      data: { url: data.url || './' },
    })
  })())
})

self.addEventListener('notificationclick', (e) => {
  const data = e.notification.data || {}
  e.notification.close()
  e.waitUntil((async () => {
    // Only the "start" notification arms the next rest cycle.
    if (data.kind === 'start' && data.exerciseData) {
      const cache = await caches.open('rest-pending')
      await cache.put('/pending', new Response(JSON.stringify(data.exerciseData)))
      await cache.put('/from-notification', new Response('1'))
    }
    // Focus an existing window if open, otherwise open one. Tell the page
    // directly (postMessage) so it starts the timer without relying on the
    // page's focus/visibilitychange events, which don't fire reliably on iOS.
    const all = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = all.find((c) => 'focus' in c)
    if (existing) {
      await existing.focus()
      if (data.kind === 'start') existing.postMessage({ type: 'rest-start' })
    } else {
      await clients.openWindow('./')
    }
  })())
})
