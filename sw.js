const CACHE = 'v19'
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
  if (e.data?.type === 'notify') {
    const opts = {
      body: e.data.body,
      icon: e.data.icon || 'icons/icon-192.png',
      tag: e.data.tag || 'default',
      requireInteraction: true,
      data: { url: e.data.url || './', restSeconds: e.data.restSeconds || 0, title: e.data.title, body: e.data.body },
    }
    if (e.data.restSeconds > 0) {
      opts.actions = [{ action: 'start-rest', title: `Descansar ${e.data.restSeconds}s` }]
    }
    self.registration.showNotification(e.data.title, opts)
  }
})

self.addEventListener('push', (e) => {
  const data = e.data?.json() || { title: 'Coach Pedro AI', body: '' }
  const opts = {
    body: data.body,
    icon: 'icons/icon-192.png',
    tag: data.tag || `push-${Date.now()}`,
    requireInteraction: true,
    data: { url: data.url || './', restSeconds: data.restSeconds || 0, title: data.title, body: data.body },
  }
  if (data.restSeconds > 0) {
    opts.actions = [{ action: 'start-rest', title: `Descansar ${data.restSeconds}s` }]
  }
  self.registration.showNotification(data.title, opts)
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  if (e.action === 'start-rest') {
    const restSec = e.notification.data?.restSeconds || 90
    e.waitUntil(
      (async () => {
        await new Promise(r => setTimeout(r, restSec * 1000))
        await self.registration.showNotification('⏰ Descanso terminado', {
          icon: 'icons/icon-192.png',
          tag: 'rest-done',
          requireInteraction: false,
        })
        await new Promise(r => setTimeout(r, 10000))
        const notifs = await self.registration.getNotifications({ tag: 'rest-done' })
        notifs.forEach(n => n.close())
      })()
    )
    return
  }
  // Normal tap on exercise notification — close only, no action
})
