const CACHE = 'v49'
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
  if (e.data?.type === 'close-tag') {
    e.waitUntil((async () => {
      const notifs = await self.registration.getNotifications({ tag: e.data.tag })
      notifs.forEach(n => n.close())
    })())
    return
  }
  if (e.data?.type === 'schedule-close') {
    setTimeout(async () => {
      const notifs = await self.registration.getNotifications({ tag: e.data.tag })
      notifs.forEach(n => n.close())
    }, e.data.delay)
    return
  }
  if (e.data?.type === 'notify') {
    const opts = {
      body: e.data.body,
      icon: e.data.icon || 'icons/icon-192.png',
      tag: e.data.tag || 'default',
      requireInteraction: e.data.requireInteraction !== false,
      data: { url: e.data.url || './', restSeconds: e.data.restSeconds || 0, title: e.data.title, body: e.data.body },
    }
    if (e.data.restSeconds > 0) {
      opts.actions = [{ action: 'start-rest', title: `Descansar ${e.data.restSeconds}s` }]
    }
    self.registration.showNotification(e.data.title, opts)
  }
})

self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let data = {}
    try {
      if (e.data) data = e.data.json()
    } catch {}
    if (!data.title && !data.body) {
      try {
        const cache = await caches.open('push-pending')
        const res = await cache.match('/pending')
        if (res) {
          data = await res.json()
          await cache.delete('/pending')
        }
      } catch {}
    }
    const title = data.title || 'Coach Pedro AI'
    const body = data.body || ''
    // If this notification carries exerciseData, store it in Cache API so the app can pick it up
    if (data.exerciseData) {
      try {
        const store = await caches.open('rest-pending')
        store.put('/pending', new Response(JSON.stringify(data.exerciseData)))
      } catch {}
    }
    const opts = {
      body,
      icon: 'icons/icon-192.png',
      tag: data.tag || `push-${Date.now()}`,
      requireInteraction: true,
      data: { url: data.url || './', restSeconds: data.restSeconds || 0, title, body, exerciseData: data.exerciseData },
    }
    await self.registration.showNotification(title, opts)
  })())
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.openWindow('./'))
})
