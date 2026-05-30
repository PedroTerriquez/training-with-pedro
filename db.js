const DB_NAME = 'coach-pedro-ai'
const DB_VERSION = 1

const STORES = ['exercises', 'exerciseLogs', 'programs', 'settings']

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      STORES.forEach((s) => {
        if (!db.objectStoreNames.contains(s)) {
          const store = db.createObjectStore(s, { keyPath: 'id' })
          if (s === 'exerciseLogs') {
            store.createIndex('exerciseId', 'exerciseId', { unique: false })
            store.createIndex('date', 'date', { unique: false })
          }
        }
      })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAll(storeName) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { reject(tx.error); db.close() }
  })
}

async function get(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(id)
    req.onsuccess = () => resolve(req.result)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { reject(tx.error); db.close() }
  })
}

async function put(storeName, data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(data)
    req.onsuccess = () => resolve(req.result)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { reject(tx.error); db.close() }
  })
}

async function del(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    tx.oncomplete = () => { resolve(); db.close() }
    tx.onerror = () => { reject(tx.error); db.close() }
  })
}

async function getByIndex(storeName, indexName, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).index(indexName).getAll(value)
    req.onsuccess = () => resolve(req.result)
    tx.oncomplete = () => db.close()
    tx.onerror = () => { reject(tx.error); db.close() }
  })
}

async function generateId() {
  const arr = new Uint8Array(12)
  crypto.getRandomValues(arr)
  return 'id-' + Array.from(arr, (b) => b.toString(36).padStart(2, '0')).join('')
}

