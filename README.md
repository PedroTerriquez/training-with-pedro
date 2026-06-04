# Coach Pedro AI

> **Your AI-powered workout tracker that lives in the browser.**
> No login. No app store. No subscription. Just you and your training.

---

## Try it now

→ **[https://pedroterriquez.github.io/training-with-pedro/](https://pedroterriquez.github.io/training-with-pedro/)**

Open it on your phone, add to home screen (it's a PWA), and you're ready to train.

---

## What problem does it solve?

Most gym apps require:
- Creating an account and handing over your email
- Monthly subscriptions for basic features
- Constant internet connection
- Complex setup before you can start training

**Coach Pedro AI** is the opposite:

| Problem | Solution |
|---|---|
| Account required | **Zero sign-up.** All data lives in your browser's IndexedDB. Close the tab and it's gone — your data stays with you. |
| Paid subscriptions | **100% free.** Hosted on GitHub Pages. AI runs on Cloudflare Workers free tier. No server costs. |
| Internet dependency | **Offline-first.** The full app works without connectivity (except AI features). |
| App store friction | **PWA.** Open the URL, add to home screen. That's it. No store, no updates, no bloat. |
| Build setup | **Zero build step.** Vanilla HTML/CSS/JS. Open `index.html` and it runs. |

---

## How it works

### 1. Create your program

Paste your routine in plain text and let AI structure it:

```
Monday: Chest
Bench press 4x6-8
Incline press 3x10
Flies 3x12

Wednesday: Back
Pull-ups 4xfailure
Barbell row 4x8
Lat pulldowns 3x12
```

The AI (Cloudflare Workers AI — Llama 3.1 8B) parses it, matches exercises against a dictionary of 300+ movements, and generates a complete program with warmups, sets, reps, and rest times.

Prefer spreadsheets? CSV import is also supported.

### 2. Train

Open the app on workout day. The **Today** screen auto-detects the day and shows:

- **Warmup** — muscle-specific warmup exercises
- **Exercises** — sets, reps, rest timer built in
- **Weight logging** — one tap to log your working weight
- **Coach AI** — post-workout analysis with suggestions
- **Push notifications** — phone + Apple Watch

### 3. Track progress

- **History** — sparkline charts per exercise showing weight progression over time
- **Plan** — weekly view with drag-free day editor
- **Coach AI** — interactive chat for technique questions, pain management, alternative exercises

---

## Screens

| Screen | What it does |
|---|---|
| **Today** | Auto-detects day of week, shows warmup → exercises → stretch with timer, weight logging, and AI post-workout analysis |
| **Plan** | Week tabs with day cards, exercise lists, and day-level reschedule editor |
| **History** | Exercise list with muscle filter, per-exercise sparklines, last weight + delta |
| **You** | Profile stats, exercise CRUD, program CRUD, AI import, CSV/JSON import/export, program coach, dictionary normalization |

---

## Tech stack & challenges

### Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no frameworks, no build step |
| Persistence | IndexedDB (4 object stores) + localStorage backup mirror |
| Hosting | GitHub Pages (static, free) |
| Serverless | Cloudflare Worker (push notifications + AI inference) |
| AI | Cloudflare Workers AI — Llama 3.1 8B (free tier, zero setup) |
| Notifications | Web Push API with VAPID |
| PWA | Manifest + Service Worker (network-first, cache fallback) |

### Challenges I ran into

| Challenge | Solution |
|---|---|
| **Push notifications without a backend** | Cloudflare Worker handles Web Push Protocol — subscribe, encrypt, deliver. No server to maintain. |
| **AI inference without API keys** | Workers AI binding provides direct Llama 3.1 access. Free tier handles thousands of imports. |
| **iOS purges IndexedDB** | Every write triggers a full backup to localStorage. On init, if data loss is detected, auto-restores from backup. |
| **No build step = no ES modules** | Scripts loaded in dependency order via `<script>` tags. Shared global namespace across all files. |
| **Apple Watch notifications** | Local `showNotification()` doesn't mirror to Watch. Switched to Web Push — notifications appear in iOS Notification Center and propagate to Watch. |
| **Single-file SPA without a router library** | Manual hash routing via `window.onhashchange`. Router, state management, and event bus all live in a single `app.js`. |

---

## How to use it (daily workout)

1. Open **[https://pedroterriquez.github.io/training-with-pedro/](https://pedroterriquez.github.io/training-with-pedro/)** on your phone
2. **Add to home screen** (Safari: Share → Add to Home Screen — it's a PWA)
3. Go to **You → Datos → Importar con IA** — paste your routine in plain text, AI structures it as a program
4. **Tap the program** to activate it
5. Open **Today** on workout day → warm up, train, log weight, stretch
6. Check **History** to see your progress charts
7. Use the **Coach IA** floating button on any exercise for technique questions or alternatives

### Notes

- No internet = no AI. The app works fully offline for training/logging, but AI features need connectivity.
- Switching phones? Export JSON from You → Datos → Exportar, transfer the file, and import on the new device.
- Push notifications need a one-time Cloudflare Worker setup (guide in `push-worker/`).

---

## Quick reference: CSV import

| Type | Format |
|---|---|
| **Program** | `week,day,exercise_name,muscle,sets,reps,rest_sec` |
| **Exercises** | `name,muscle,image_url,tips,alternatives` |

Auto-creates exercises by name if they don't exist. Pipe (`|`) separates tips. `::` separates name/reason in alternatives, `||` separates alternatives.

---

## Deploy your own

```bash
git clone git@github.com:PedroTerriquez/training-with-pedro.git
```

Then enable GitHub Pages in repo Settings → Pages → Deploy from branch `main`, root folder.

Or just use the live version — it's free and always up.

---

## License

MIT
