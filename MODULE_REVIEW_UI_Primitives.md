# Module Review: UI Primitives

**File:** `components/ui.js` (167 lines)

**Dependencies:** None (pure DOM functions, no imports).

**Depended on by:** All view files (`today.js`, `plan.js`, `history.js`, `you.js`) and components (`detail.js`, `chart.js`).

---

## 1. Architecture & Boundaries

This module is the **UI component library** — it owns:

- **6 atomic components:** `Chip`, `SectionLabel`, `StatBlock`, `ExercisePlaceholder`, `TabBar`, `Sheet`
- **1 utility:** `showCenterToast`
- **4 inline SVG icons:** `TabIconHome`, `TabIconCal`, `TabIconChart`, `TabIconUser`
- **2 asset constants:** `TOAST_SVG_WATCH`, `TOAST_IMG_TRAINER`

**Design pattern:** All components are factory functions that return DOM elements immediately. No framework, no virtual DOM, no reactive state. Components accept an options object and build DOM via `document.createElement` + `innerHTML` + inline `style.cssText`.

---

## 2. Findings

### Finding UI-1: 100% inline styles — no CSS class reuse (Info)

**File:** `components/ui.js` (throughout)

Zero CSS classes are used. Every visual property is set via `element.style.cssText` or `element.style.*`. This means:

- Styles are duplicated across every component instance (e.g., `font-family: 'JetBrains Mono', monospace` is repeated in `SectionLabel`, `StatBlock`, `ExercisePlaceholder`)
- Design changes require updating multiple inline strings instead of a single CSS rule
- No media query support (all inline)
- No pseudo-class support (:hover, :active, :focus)

**Context:** This is a deliberate choice for the project's no-build-step, single-file SPA architecture. Inline styles avoid CSS loading order issues and class name collisions. The tradeoff is accepted.

**Recommendation (optional):** Extract the most common patterns into CSS classes (e.g., `.mono-label`, `.text-accent`). Components could then set `className` instead of inline styles, reducing HTML payload.

---

### Finding UI-2: SectionLabel has no structural HTML — just inline `<span>` (Info)

**File:** `components/ui.js:15-23`

The component uses `innerHTML` to create a colored dot span, then `appendChild` for the label text. The combination of innerHTML + appendChild is a smell — both operations update the DOM independently. Prefer all `innerHTML` or all `appendChild`.

```js
el.innerHTML = `<span style="...">...</span>` // creates span
const label = document.createElement('span')   // creates span
el.appendChild(label)                          // appends second span
```

This is functionally correct but mixes DOM construction strategies.

**Recommendation:** Use `el.innerHTML` for the full structure:
```js
el.innerHTML = `<span>...</span><span>${children}</span>`
```

---

### Finding UI-3: `getComputedStyle(document.body).fontFamily` at render time (Low)

**File:** `components/ui.js:90`

```js
btn.style.cssText = `...font-family:${getComputedStyle(document.body).fontFamily}...`
```

This queries computed styles for every TabBar button on every render. The font-family never changes during the app lifecycle.

**Impact:** Negligible performance cost (~0.1ms per call), but it's a synchronous layout computation in the render path.

**Recommendation:** Cache the result:
```js
const BODY_FONT = getComputedStyle(document.body).fontFamily
```

Or use the component-level constant:
```js
const TAB_BAR_FONT = "'Space Grotesk', system-ui, -apple-system, sans-serif"
```

---

### Finding UI-4: Sheet doesn't handle Escape key (Low)

**File:** `components/ui.js:115-142`

The bottom sheet only closes via backdrop click or explicit `onClose` call. On desktop browsers, users expect `Escape` to close modal overlays.

**Impact:** Desktop users must click the backdrop. Mobile users can't use Escape.

**Recommendation:** Add a keydown listener:
```js
document.addEventListener('keydown', onKeyDown)
function onKeyDown(e) {
  if (e.key === 'Escape') { cleanup(); onClose() }
}
// In cleanup:
document.removeEventListener('keydown', onKeyDown)
```

---

### Finding UI-5: `ExercisePlaceholder` renders `actions` as innerHTML (Info)

**File:** `components/ui.js:55, 69`

```js
${actions || ''}
```

The `actions` slot is injected as raw HTML inside a template literal. If `actions` ever contains user-provided data (e.g., exercise names with special characters), it could produce broken HTML. In practice, `actions` is always a hardcoded string from view code, so the XSS risk is minimal.

**Recommendation:** Document that `actions` must be pre-sanitized HTML. Or refactor `actions` to accept a DOM element array.

---

### Finding UI-6: `TabBar` recreates all buttons on every route change (Low)

**File:** `components/ui.js:76-99`

Each `renderScreen()` call destroys and recreates the entire TabBar element. DOM creation overhead for 4 tab buttons with icons is negligible, but:
- Event listeners are re-registered
- Tab's transition animation resets
- Accessibility state (e.g., `aria-current="page"`) is not preserved

**Recommendation:** Add an `update(activeTab)` method to TabBar that toggles styles on existing buttons without destroying/recreating.

---

### Finding UI-7: `showCenterToast` does not handle rapid consecutive calls (Info)

**File:** `components/ui.js:149-167`

```js
const existing = document.querySelector('.toast-overlay')
if (existing) existing.remove()
```

If two toasts fire within the same frame, the second removes the first. This is valid behavior (last toast wins), but there's no queue. If toasts are used for important sequential notifications, the first is lost.

**Recommendation:** If queuing is needed, add a simple array:
```js
let _toastQueue = []
let _toastActive = false
```

---

## 3. Summary

| Severity | Count | Key Issues |
|---|---|---|
| High | 0 | — |
| Medium | 0 | — |
| Low | 2 | UI-3 (computed style query), UI-4 (no Escape key), UI-6 (TabBar recreation) |
| Info | 4 | UI-1 (inline styles), UI-2 (mixed DOM construction), UI-5 (innerHTML slot), UI-7 (no toast queue) |

**Overall:** The UI Primitives module is clean and well-suited to its vanilla-JS constraints. The inline style approach is a deliberate tradeoff, not a bug. The main actionable items are adding Escape key support for the Sheet and considering TabBar diff update instead of full recreation.
