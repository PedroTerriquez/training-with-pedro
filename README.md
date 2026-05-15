# Training with Pedro

A mobile-first workout tracker — no login, no build step, no backend. All data lives in your browser's IndexedDB.

## Features

- **Today** — auto-detects day of week, shows your workout or rest day
- **Plan** — browse weekly workout schedule
- **History** — exercise log with muscle filter and sparkline charts
- **You** — stats, settings, exercise/program CRUD, CSV import

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
5. Visit `https://<your-username>.github.io/<repo-name>/`

No build step required — open `index.html` directly.

## CSV Import

Two import buttons on the **You** screen:

### Program CSV

```csv
week,day,exercise_name,muscle,sets,reps,rest_sec
Week 1,Push,Bench Press,Chest,4,6-8,180
Week 1,Push,Overhead Press,Shoulders,3,10,120
Week 1,Pull,Pull Ups,Back,4,6-8,120
```

Columns: `week`, `day`, `exercise_name` (required) — `muscle`, `sets`, `reps`, `rest_sec`, `day_subtitle`, `duration_min` (optional). Creates a program named "Imported Program".

### Exercise CSV

```csv
name,muscle,image_url,tips,alternatives
Bench Press,Chest,https://example.com/bench.gif,Keep elbows tucked|Control the negative,Dumbbell Press::Needs dumbbells||Floor Press::Less ROM
```

Columns: `name` (required) — `muscle`, `image_url`, `tips` (pipe-separated), `alternatives` (`name::reason` pairs joined by `||`). Skips existing exercises by name.

## Stack

Vanilla HTML/CSS/JS — no frameworks, no build tools, no dependencies. IndexedDB for persistence.
