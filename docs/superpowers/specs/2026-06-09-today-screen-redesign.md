# Spec: New Today Screen — Phase Cards + Full-Screen Detail

## Objetivo
Reemplazar las listas seleccionables de warmup/ejercicios/stretch en la pantalla Hoy con tarjetas simplificadas + botón Play que abre el detail component full-screen con GIFs animados y swipe gestures.

## Arquitectura

Componentes involucrados:
- `views/today.js` — Orquesta las 3 PhaseCards y la lógica de fase
- `components/ui.js` — Sheet (modificado para full-screen)
- `components/warmup.js` — mountWarmupDetail (modificado para full-screen + GIFs + swipe + botón X)
- `components/detail.js` — mountExerciseDetail (modificado hero + swipe)
- `data/warmup.js` — Datos (sin cambios estructurales)

## Cambios por archivo

### 1. `components/ui.js` — Sheet
- `max-height: 92%` → `98%`
- `border-radius: 28px 28px 0 0` → `16px 16px 0 0`
- Agregar botón ✕ (cerrar) en esquina superior derecha, fijo, z-index 110

### 2. `components/warmup.js` — mountWarmupDetail
- Sheet: 98% height, 16px border-radius, botón X
- Hero image: 280px → 400px
- GIF layer con EX_GIF_BASE (mismo crossfade que detail.js)
- Swipe gestures en contenedor body: threshold 50px, >70% horizontal, ignorar si toque empieza en botón
- Eliminar funciones: `makeCheckableRow()`, `makePanelContent()`, `WarmupPanelContent()`, `StretchingPanelContent()`

### 3. `components/detail.js` — mountExerciseDetail
- Hero image: 240px → 360px
- Swipe gestures en scrollEl: threshold 50px, >70% horizontal, ignorar si toque empieza en input/button/select

### 4. `views/today.js`
- PhaseCard simplificado: sin expand, sin lista checkable, solo header + Play button (o checkmark si done)
- Fase 02: Reemplazar `createExerciseRow()` + skip button por PhaseCard con Play → `openDetailSheet(primerEjercicio)`
- Eliminar `createExerciseRow()`, skip button, lógica de expand en PhaseCard
- Auto-open warmup/stretch se mantiene igual

### 5. Auto-open behavior
Se mantiene: `_phase < 2` → auto-open mountWarmupDetail. `_phase >= 3 && < 4` → auto-open stretch. Al cerrar, solo PhaseCard con Play (sin lista).

## Data Flow

```
App opens #today → mountToday()
  → Phase 1: Warmup PhaseCard + Play (auto-open detail)
  → Phase 2: Exercises PhaseCard + Play (locked hasta warmup done)
  → Phase 3: Stretch PhaseCard + Play (locked hasta exercises done)
  → Tap Play → detail component full-screen
  → Swipe/nav → navega items
  → Complete → avanza fase → siguiente se desbloquea
  → Todo completo → effort selector → coach analysis
```

## Archivos modificados (4)
- `components/ui.js` — ~5 líneas
- `components/warmup.js` — ~40 líneas
- `components/detail.js` — ~25 líneas
- `views/today.js` — ~80 líneas
