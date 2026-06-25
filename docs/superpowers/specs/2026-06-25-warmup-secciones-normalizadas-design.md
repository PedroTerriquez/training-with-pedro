# Warmup/Stretch — Secciones Normalizadas

## Objetivo
Separar la información de cada ejercicio de calentamiento/estiramiento en 4 campos estructurados (Posición Inicial, Ejecución, Respiración, Duración) en lugar de un solo texto `desc`, y renderizar cada sección como una tarjeta independiente en la vista.

## Alcance
- Solo ejercicios de `WARMUP_DATA` en `data/warmup.js` (~230 ejercicios en ~16 grupos musculares)
- `GENERIC_WARMUP` en `components/warmup.js` mantiene su estructura plana (`desc` simple)
- No afecta `EXERCISE_DICTIONARY`, `exerciseLogs`, programs, ni el editor de ejercicios en You

## Cambios en Data (`data/warmup.js`)

### Schema actual
```js
{
  name: 'Flexiones Dinámicas Excéntricas contra Pared',
  desc: 'Posición inicial: ... Ejecución: ... Respiración: ... Duración/Reps: ...'
}
```

### Schema nuevo
```js
{
  name: 'Flexiones Dinámicas Excéntricas contra Pared',
  posInicial: 'Colócate frente a una pared...',
  ejecucion: 'Flexiona los codos lentamente...',
  respiracion: 'Inhala durante la fase de descenso...',
  duracion: 'Realiza de 12 a 15 repeticiones...',
  stallbar: false     // true si el ejercicio usa Stallbar
}
```

### Reglas de parseo
Cada `desc` se divide por los separadores `Posición inicial:`, `Ejecución:`, `Respiración:`, `Duración/Reps:` (o `Duración:`).
- El prefijo `STALLBAR - ` al inicio del `desc` se elimina y se convierte en `stallbar: true`
- El texto sobrante antes del primer separador se ignora (solo aparece cuando hay `STALLBAR - `)
- Campos resultantes se limpian (trim) y se eliminan saltos de línea múltiples

### GENERIC_WARMUP
Se mantienen con `desc` plano (no tienen secciones etiquetadas). Son 14 ejercicios genéricos de respaldo.

## Cambios en Vista (`components/warmup.js`)

### Renderizado de secciones (líneas 324-334 actuales)
Reemplazar el bloque único "Cómo hacerlo" con 4 tarjetas apiladas:

```
┌─────────────────────────────┐
│ ● POSICIÓN INICIAL         │
│                             │
│ Colócate frente a una pared │
│ lisa a una distancia...     │
├─────────────────────────────┤
│ ● EJECUCIÓN                │
│                             │
│ Flexiona los codos lentamente tardando de 3 a 4 segundos...
├─────────────────────────────┤
│ ● RESPIRACIÓN               │
│                             │
│ Inhala durante la fase de descenso...
├─────────────────────────────┤
│ ● DURACIÓN                  │
│                             │
│ Realiza de 12 a 15 repeticiones...
└─────────────────────────────┘
```

### Fallback
Si el item no tiene `posInicial` (GENERIC_WARMUP o dato legacy), renderiza el `desc` completo como hoy bajo "Cómo hacerlo".

### STALLBAR badge
Se lee del campo `stallbar` en lugar de detectar prefijo en `desc`. El badge se muestra igual que ahora (esquina superior izquierda del hero).

### Detalles visuales
- Cada sección: label en JetBrains Mono 10px uppercase con bolita decorativa del color accent
- Contenido: Space Grotesk 14px, color rgba(255,255,255,0.82), line-height 1.7
- Separación entre tarjetas: 6px
- Mismo padding (14px 18px) que el bloque actual

## Archivos modificados
| Archivo | Cambio |
|---|---|
| `data/warmup.js` | Reemplazar `desc` por `posInicial`, `ejecucion`, `respiracion`, `duracion`, `stallbar` en los ~230 ejercicios |
| `components/warmup.js` | Renderizar 4 tarjetas de secciones; fallback a `desc`; stallbar desde campo booleano |

## Archivos no modificados
- `app.js`, `storage.js`, `db.js`, `views/today.js`, `views/you.js`, `views/plan.js`, `views/history.js`
- `data/exercise-dictionary.js`, `data/ai-prompt.js`
- `styles.css`, `index.html`, `sw.js`
