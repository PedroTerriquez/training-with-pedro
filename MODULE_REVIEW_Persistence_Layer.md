# Module Review: Persistence Layer

**Files**: `db.js` (89 lines), `storage.js` (451 lines)

---

## Security Review

### Finding 1: No input validation on JSON import — arbitrary data injected into all stores
- **Severity**: High
- **File**: `storage.js:436-444`
- **Description**: `importLogsAndSettings()` calls `JSON.parse(jsonStr)` without schema validation. Any JSON with `exercises`, `programs`, `exerciseLogs`, or `settings` keys is written directly to IndexedDB. A crafted JSON could set `settings.activeProgramId` to a non-existent ID, overwrite existing exercises with malformed objects (missing required fields like `id`), or inject `__proto__` pollution via nested objects. While the app is client-side only (no server), this is the import path for cross-context migration and any XSS injection into the app could use this to corrupt persistent state.
- **Fix**: Add schema validation before writing:
  ```
  for (const item of (data.exercises || [])) {
    if (!item.id || !item.name) continue
    await put('exercises', { id: item.id, name: item.name, muscle: item.muscle || '', imgUrl: item.imgUrl || '', gifUrl: item.gifUrl || '', tips: Array.isArray(item.tips) ? item.tips : [], alternatives: Array.isArray(item.alternatives) ? item.alternatives : [] })
  }
  ```

### Finding 2: Import error messages may include CSV content with PII
- **Severity**: Low
- **File**: `storage.js:259-261`, `storage.js:362-364`
- **Description**: `importProgramFromCSV` and `importExercisesFromCSV` show `err.message` directly in a toast. If the CSV contains invalid data that triggers an Error with the data in the message, the toast could display potentially sensitive information. In practice, errors from these functions are generic ("CSV must have at least: week, day, exercise_name"), so the risk is low, but `throw err` (line 261, 364) propagates the raw error to callers who might log it.
- **Fix**: Sanitize error messages, or wrap in a user-safe message before display:
  ```
  showToast('❌ Error al importar. Revisa el formato del CSV.', true)
  ```

---

## Functionality Review

### Finding 3: `saveProgram` fires `backupAll()` without await — backup errors silently swallowed
- **Severity**: Medium
- **File**: `storage.js:170-173`
- **Description**: `backupAll()` is called as a fire-and-forget promise — no `await`, no `.catch()`. If `backupAll()` fails (e.g., localStorage quota exceeded, JSON.stringify fails on circular data), the error is swallowed. The program save succeeds but the backup is silently missing. This means `restoreFromBackup()` would restore stale data on the next iOS purge.
- **Fix**: Await the backup or attach a catch handler:
  ```
  async saveProgram(program) {
    await put('programs', program)
    try { await backupAll() } catch (e) { console.warn('Backup failed:', e) }
  }
  ```
  Note: the same pattern exists implicitly in all `Storage.*` write methods since `backupAll()` is called from `refresh()` in `app.js` — those paths do have `try/catch`.

### Finding 4: `importLogsAndSettings` lacks try/catch around `JSON.parse`
- **Severity**: Medium
- **File**: `storage.js:436-437`
- **Description**: `JSON.parse(jsonStr)` is unprotected. If the caller passes invalid JSON (malformed file, encoding issue, BOM prefix missing), the function throws a `SyntaxError` that propagates up unhandled. Depending on the caller, this could leave the app in a partially updated state or show an opaque error.
- **Fix**: Wrap in try/catch:
  ```
  async importLogsAndSettings(jsonStr) {
    let data
    try { data = JSON.parse(jsonStr) }
    catch { throw new Error('El archivo JSON no es válido') }
    ...
  }
  ```

### Finding 5: `getLogsForDate` ignores date index — full table scan
- **Severity**: Low
- **File**: `storage.js:156-159`
- **Description**: `getLogsForDate` calls `getAll('exerciseLogs')` (loads ALL log entries) then filters in JS with `.filter(l => l.date === dateStr)`. The `exerciseLogs` store has a `date` index defined in `db.js:16`, but this function doesn't use it. With thousands of logs across many months, every call loads the entire table into memory.
- **Fix**: Use the existing date index:
  ```
  async getLogsForDate(dateStr) {
    return getByIndex('exerciseLogs', 'date', dateStr)
  }
  ```

### Finding 6: `findOrCreateExerciseByName` loads all exercises for a simple name lookup
- **Severity**: Low
- **File**: `storage.js:123-126`
- **Description**: Every call loads every exercise via `getAll('exercises')`, then does a linear search with `.find()`. For a typical user with <100 exercises this is negligible. During CSV import of a large program (~50 exercises), this is called once per row — 50 full scans. The `exercises` store has no name index in `db.js`.
- **Fix**: Add a `name` index to the `exercises` store in `db.js` and use `getByIndex` here, or (simpler for current schema) accept the full scan since exercise count is bounded by user effort.

### Finding 7: `deleteExercise` reads programs before transaction — stale data risk
- **Severity**: Low
- **File**: `storage.js:97-121`
- **Description**: `getAll('programs')` is called on line 99, then `openDB()` on line 100 starts a new transaction. In a multi-tab scenario, if another tab modifies programs between these two lines, the cascade deletion operates on stale program data. The exercise and log deletions are correct (they use the fetched `logs` and direct key deletion), but a program that had this exercise added in another tab won't get cleaned up.
- **Fix**: Move the program read inside the transaction, or accept for single-user app design. Low priority.

---

## Performance & Optimization Review

### Finding 8: Every DB operation opens and closes a new IndexedDB connection
- **Severity**: Medium
- **File**: `db.js:6-24`
- **Description**: Every `getAll`, `get`, `put`, `del`, `getByIndex` call opens a new connection via `openDB()` and closes it on transaction completion. During `loadState()` (called on every init and refresh), 4 sequential `getAll` calls create 4 separate connections. During CSV import with 50 rows, 50+ connections are opened and closed. IndexedDB connection opening is relatively cheap, but `openDB()` triggers `onupgradeneeded` schema checks on every open — this fires the store/index creation logic unnecessarily after the first open.
- **Fix**: Cache the DB connection:
  ```
  let _db = null
  async function openDB() {
    if (_db) return _db
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = (e) => { ... }
      req.onsuccess = () => { _db = req.result; resolve(_db) }
      req.onerror = () => reject(req.error)
    })
  }
  ```
  Then remove `db.close()` calls from all helpers, or add a `closeDB()` for explicit shutdown.

### Finding 9: `backupAll()` serializes entire dataset to localStorage every write
- **Severity**: Medium
- **File**: `storage.js:14-29`
- **Description**: Every call to `backupAll()` fetches ALL exercises, logs, programs, and settings from IndexedDB, serializes them to JSON, and writes to localStorage. This happens on every `saveProgram` (storage.js:172), and on every `refresh()` (app.js:355-358). With growth to thousands of log entries, `JSON.stringify` of the full dataset plus `localStorage.setItem` of the resulting string could hit:
  - Performance: blocking the main thread during stringify of large data
  - Storage: localStorage 5-10MB quota (BOM differs by browser)
  - Duration: `getAll('exerciseLogs')` + `JSON.stringify` per write
- **Fix**: Consider incremental backup (append-only for logs), or at minimum measure and warn when approaching localStorage quota. Add a size check before writing:
  ```
  const size = new Blob([json]).size
  if (size > 4 * 1024 * 1024) { showToast('⚠️ Backup casi lleno', true); return }
  ```

### Finding 10: `importLogsAndSettings` writes each item in separate transaction
- **Severity**: Low
- **File**: `storage.js:441-444`
- **Description**: Each exercise, program, and log is written in its own `put()` call which opens a separate connection and transaction. For a large export with 500 exercises + 2000 logs, this means 2500 sequential IndexedDB transactions. These could be batched into fewer transactions by store.
- **Fix**: Group writes by store into single transactions:
  ```
  const db = await openDB()
  const tx = db.transaction(['exercises', 'programs', 'exerciseLogs', 'settings'], 'readwrite')
  for (const item of (data.exercises || [])) tx.objectStore('exercises').put(item)
  for (const item of (data.programs || [])) tx.objectStore('programs').put(item)
  ...
  ```
  This reduces 2500 transactions to 1, at the cost of making the whole import atomic (all-or-nothing).

---

## Code Quality

### Finding 11: Broken indentation in try/catch blocks — misleading structure
- **Severity**: Low
- **File**: `storage.js:202-261`, `storage.js:298-365`
- **Description**: Both `importProgramFromCSV` and `importExercisesFromCSV` have the try body at the same indentation level as the `try {` keyword:
  ```
  async importProgramFromCSV(text) {
      try {
      const lines = text.trim().split('\n')  // ← wrong indent
  ```
  This is syntactically valid (JS uses braces, not indentation) but visually misleading. A reader might think the body is outside the try block. The `}` on line 259 correctly matches `{` on line 202, so execution is correct, but future edits risk misplacing code outside the error boundary.
- **Fix**: Re-indent:
  ```
  async importProgramFromCSV(text) {
    try {
      const lines = text.trim().split('\n')
      ...
    } catch (err) { ... }
  }
  ```

### Finding 12: UI toast logic lives in the data layer
- **Severity**: Low
- **File**: `storage.js:1-10`
- **Description**: `showToast()` is a UI function (creates DOM elements, styles them inline, manages timers) defined in `storage.js` — the data service layer. It's used across the codebase for error/success feedback. This violates separation of concerns and makes `storage.js` harder to reason about (it now depends on the DOM existing).
- **Fix**: Move `showToast()` to `components/ui.js` and import/reference it from there. Keep `storage.js` focused on data operations, throwing errors for the UI layer to catch and display.

### Finding 13: `parseCSVLine` is a general utility in the data layer
- **Severity**: Low
- **File**: `storage.js:49-79`
- **Description**: CSV parsing is a general-purpose utility with no dependency on the storage layer. It's defined in `storage.js` because that's where CSV import lives, but it could be extracted for testability and reuse.
- **Fix**: Move to a utility file (e.g., `csv.js`), or at minimum document it as a public utility.

### Finding 14: Default settings object created inline — schema drift risk
- **Severity**: Low
- **File**: `storage.js:180-183`
- **Description**: `getSettings()` returns an inline default object with all known fields. When new fields are added to the schema (e.g., `lastCoachAnalysis` was added after initial release), existing users who saved settings before the field existed will get `undefined` for that field until they trigger a `saveSettings()`. The default object provides correct defaults for new users, but existing users may have stale `sessionState` or other nested objects that become out of sync with code expectations.
- **Fix**: Consider a migration pattern in `getSettings`:
  ```
  async getSettings() {
    const s = await get('settings', 'settings')
    const defaults = { id: 'settings', activeProgramId: null, ... }
    return { ...defaults, ...s, id: 'settings' }
  }
  ```

### Finding 15: `restoreFromBackup` does individual puts instead of batched transaction
- **Severity**: Low
- **File**: `storage.js:37-41`
- **Description**: Each restored item gets its own `put()` call with its own connection. For a backup with 500 items, this opens 500 connections. While restore is rare (only on iOS purge), it could be optimized.
- **Fix**: Batch by store type into single transactions, similar to Finding 10.

---

## Summary

| # | Severity | Type | File:Line | Description |
|---|----------|------|-----------|-------------|
| 1 | High | Security | storage.js:436-444 | No schema validation on JSON import — arbitrary data written to all 4 stores |
| 3 | Medium | Functionality | storage.js:170-173 | `backupAll()` fired without await — backup errors silently swallowed |
| 4 | Medium | Functionality | storage.js:436-437 | `JSON.parse` without try/catch — will throw on malformed input |
| 8 | Medium | Performance | db.js:6-24 | Every operation opens/closes a new IndexedDB connection |
| 9 | Medium | Performance | storage.js:14-29 | Full dataset serialized to localStorage on every write — quota risk |
| 5 | Low | Functionality | storage.js:156-159 | `getLogsForDate` does full table scan instead of using date index |
| 6 | Low | Functionality | storage.js:123-126 | `findOrCreateExerciseByName` loads all exercises for name lookup |
| 7 | Low | Functionality | storage.js:97-121 | Potential stale data in cascade delete across tabs |
| 10 | Low | Performance | storage.js:441-444 | Import writes each item in separate transaction |
| 2 | Low | Security | storage.js:259-264 | Raw error messages shown in toast — possible information disclosure |
| 11 | Low | Code Quality | storage.js:202-261, 298-365 | Broken indentation in try/catch blocks |
| 12 | Low | Code Quality | storage.js:1-10 | UI toast logic in data layer |
| 13 | Low | Code Quality | storage.js:49-79 | `parseCSVLine` utility in wrong module |
| 14 | Low | Code Quality | storage.js:180-183 | Inline default settings object — schema versioning risk |
| 15 | Low | Performance | storage.js:37-41 | Restore uses individual puts instead of batched transactions |

**Critical**: 0 | **High**: 1 | **Medium**: 4 | **Low**: 10
