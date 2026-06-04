# Calendar + Streak Implementation Plan

**Goal:** Port MotivationCalendar prototype to production as vanilla DOM, integrated into History as "Constancia" tab.

**Architecture:** New `components/calendar.js` with date helpers, day status from exerciseLogs, streak computation, DOM rendering. Modify `views/history.js` with 2-tab layout. Modify `storage.js` to support custom date in logWeight and expose getAllLogs. No schema changes.

**Tech Stack:** Vanilla JS, IndexedDB, DOM manipulation.

---

### Task 1: Add helpers to `storage.js`

- Modify: `storage.js` — add `Storage.getAllLogs()`, add `dateStr` param to `logWeight`

### Task 2: Create `components/calendar.js`

- Create: `components/calendar.js` — date helpers, dayStatus, streak, all visual sections, renderCalendarView

### Task 3: Modify `views/history.js`

- Modify: `views/history.js` — add in-page tab bar (Constancia + Ejercicios), renderConstanciaTab, wrap Ejercicios content

### Task 4: Update `index.html`

- Modify: `index.html` — add `<script src="components/calendar.js">`
