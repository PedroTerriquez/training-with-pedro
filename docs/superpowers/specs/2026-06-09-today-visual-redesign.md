# Spec: Today Screen — Visual Redesign (Reference-Aligned)

## Objetivo
Actualizar el estilo visual de `views/today.js` para alinearlo con las referencias de diseño en `training-with-pedro/today.jsx`, manteniendo toda la funcionalidad actual (timer, coach analysis, warmup/stretch sheets, effort selector, locked phases).

## Cambios (resumen)

| Elemento | Antes | Después |
|---|---|---|
| Header | `dateStr` + `weekDayName.` + pill | `● Hoy en el gimnasio` + day name 42px + week chip + subtitle |
| ProgressRing + TimerRing | Ambos en header | Solo TimerRing (ProgressRing eliminado) |
| today-watch-btn | En rings container | Eliminado |
| PhaseCard | Tarjeta compacta, icono cuadrado, botón "Iniciar" texto | `flex: 1` proporcional, watermark phase, glifo SVG, badge "Sigue"/"Completado", botón circular ▶ |
| Training card | Sin progreso visible | Barra `done/total` + contador |
| LockedPhase | Candado gris | Mismo (se mantiene) |
| Rest day / CoachCard | Headers actuales | Headers alineados con referencia |

## Archivo modificado
- `views/today.js`

## Detalle de cambios

### 1. Header (líneas 154-162)

Reemplazar con:
```
● Hoy en el gimnasio (pulse dot, accent)
[Day Name] 42px bold
[weekObj.name · tag] chip
[day.subtitle] 13px muted
```

TimerRing se mantiene a la derecha, ProgressRing + watch-btn se eliminan.

### 2. PhaseCard (función, ~línea 514)

Rediseñar para que coincida con `SectionCard` de la referencia:

- **Layout**: `flex: 1` en lugar de altura fija, para que las 3 cards llenen la pantalla proporcionalmente
- **Background**: `#141414` base, gradiente `accent1f → #131313` cuando done
- **Border**: `0.5px solid rgba(255,255,255,0.07)` normal, `1px solid accent` cuando done, `1px solid accent66` cuando es la siguiente
- **Box-shadow**: glow cuando done/isNext
- **Watermark glyph**: glifo SVG grande (fuego/dumbbell/hoja) semi-transparente en bottom-right
- **Glow blob**: círculo blur 60px en top-left cuando done/isNext
- **Phase eyebrow**: "Fase 01/02/03" + status badge:
  - "Completado" (accent bg, checkmark) si done
  - "Sigue" (accent outline, pulse dot) si isNext
  - Nada si locked/future
- **Title**: 27px bold
- **Subtitle**: 12.5px muted
- **Meta**: "X movimientos · Y min" o "X ejercicios · Y min"
- **Progress (solo training)**: barra `done/total` + contador `done/total` en accent
- **Start button**: círculo 56px con ▶ (accent bg, #0a0a0a play) o checkmark (accent border) si done
- **Locked state**: igual que ahora, con candado

### 3. Estructura del layout

El contenedor de las 3 secciones debe usar `flex: 1; display: flex; flex-direction: column; gap: 11px` para que las cards se estiren proporcionalmente ocupando el espacio vertical disponible (como la referencia).

### 4. Rest day

Header actualizado al formato referencia: "● Hoy en el gimnasio" + day name 42px.

### 5. SessionSummary (CoachCard) — `renderCoachCard()` ~línea 581

Rediseñar `renderCoachCard()` para alinearse con `SessionSummary` de `session.jsx`:

**Header (reemplazar dateStr + weekDayName):**
```
[24px check badge, accent bg, white checkmark] [day.name] · completado
[ai.titulo o "Cerrando tu sesión…" o "¡Buen trabajo!"] 34px bold
```

**Stats grid (nuevo, entre header y AI card):**
```
3-column grid: [Ejercicios] [Volumen (units)] [PRs]
Cada stat: big number + muted label, en card #141414
PRs en accent si > 0
```

**AI recap card (reemplazar card actual con imagen de Pedro):**
- Background: `linear-gradient(165deg, #181818 0%, #111 100%)`
- Border: `0.5px solid accent2e`
- Glow: círculo blur 55px en top-right
- Eyebrow: "Resumen del coach" con coach icon (SVG chat bubble, 22px sq, accent1f bg)
- Loading state: spinner + "Analizando tu entrenamiento…"
- Loaded:
  - `ai.resumen` — 14.5px texto
  - `ai.destacados` — chips accent outline con bullet dot
  - `ai.consejos` — lista numerada 01/02/03 con accent numbering
  - `errored` — "Resumen sin conexión · valores locales" muted
- Provider tag se elimina (reference no lo tiene)

**Se mantiene:**
- Regeneration al click (misma lógica existente)
- Toda la lógica de coach analysis, effort selector

### 6. Rest day

Header actualizado: "● Hoy en el gimnasio" + day name 42px.

## No cambia
- TimerRing (se mantiene en header)
- LockedPhase (misma funcionalidad y estilo)
- Warmup/stretch sheets (no se tocan)
- Coach analysis flow / effort selector (no se tocan)
- Lógica de fases, auto-open, persistencia
