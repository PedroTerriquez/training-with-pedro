const CACHE = 'v1'
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
  if (e.data?.type === 'notify') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: e.data.icon,
      tag: e.data.tag || 'default',
      requireInteraction: true,
    })
  }
})

self.addEventListener('push', (e) => {
  const data = e.data?.json() || { title: 'Coach Pedro AI', body: '' }
  // Each notification gets a unique tag so it persists until manually dismissed
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icons/icon-192.png',
    tag: data.tag || `push-${Date.now()}`,
    requireInteraction: true,
    data: { url: data.url || './' },
  })
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url || './'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cls) => {
      if (cls.length > 0) { cls[0].focus(); return }
      clients.openWindow(url)
    })
  )
})
