# Module 8 Review: Cloudflare Worker

**File:** `push-worker/src/index.js` (241 lines)

**Complexity:** Medium. 6 POST endpoints, 2 external integrations (Web Push + Workers AI), no framework/ routing library.

---

## Architecture & Boundaries

| Aspect | Assessment |
|--------|-----------|
| **Role** | Server-side proxy for Web Push (3 endpoints) and AI processing (4 endpoints). Single-file worker with manual URL routing |
| **Integrations** | Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`), Web Push Protocol (via `web-push` npm), Cloudflare KV (subscription storage) |
| **Security model** | No auth — relies on the app being a single-user PWA. CORS wide open (`*`). VAPID keys are the only cryptographic safeguard |
| **Error handling** | Per-endpoint try/catch returning 400/500; push 410 auto-cleanup |
| **Data flow** | POST → JSON body parse → validate required fields → process → JSON response |

---

## Findings

### 🔴 High (3)

#### H1. No request body validation on any endpoint
Every endpoint calls `await req.json()` without schema validation. If the body is malformed JSON, the entire request fails with a generic error. More critically, if the body is valid JSON but has unexpected types (e.g., `text` is an object instead of string), the downstream code may throw cryptic errors:

```js
// /api/ai/import — line 118
const { text, systemPrompt } = await req.json()
// text could be null, undefined, array, object — no type check
const fullPrompt = 'RUTINA DEL USUARIO:\n' + text  // stringifies to "[object Object]"
```

All 6 endpoints are vulnerable:
- `/api/push/subscribe` (line 31) — expects `{ endpoint, keys: { p256dh, auth } }` but destructures nothing
- `/api/push/send` (line 48) — expects `{ title, body, tag }` but doesn't validate
- `/api/ai/coach` (line 83) — expects `{ sessionData, systemPrompt }`
- `/api/ai/import` (line 118) — expects `{ text, systemPrompt }`
- `/api/ai/program-coach` (line 156) — expects `{ text, currentProgram, userProfile, systemPrompt, dictionary }`
- `/api/ai/exercise-coach` (line 197) — expects `{ exercise_name, muscle, alternatives, messages }`

**Risk:** Malformed requests produce opaque 500 errors instead of helpful 400s. The Worker wraps these in `try/catch` at line 150 → `'Error de IA: ' + err.message` which leaks internal details.

**Recommendation:** Add minimal validation — check required fields exist and are the right type before processing:
```js
function requireFields(body, fields) {
  for (const f of fields) {
    if (body[f] == null) return respond({ error: `Missing field: ${f}` }, 400)
  }
}
```

#### H2. No request size limits — memory exhaustion risk
The Worker processes user-submitted text (up to textarea size) and program data (potentially hundreds of exercises). There are no size checks on request bodies. Cloudflare Workers have a 128MB memory limit, but:
- A 10MB request body would consume significant memory during `req.json()` parsing
- The `fullPrompt` construction at line 159 concatenates program + profile + dictionary — a large program could produce a prompt exceeding Llama 3.1's 8K context window

**Recommendation:** Check `req.headers.get('Content-Length')` at the handler level and reject requests over a reasonable limit (e.g., 1MB):
```js
const len = parseInt(req.headers.get('Content-Length') || '0')
if (len > 1024 * 1024) return respond('Request too large', 413)
```

#### H3. User profile data sent to AI endpoint — `push-worker:159`
The `/api/ai/program-coach` endpoint sends the full user profile to Workers AI:
```js
const fullPrompt = '...\n\nPERFIL DEL USUARIO:\n' + JSON.stringify(userProfile, null, 2)
```

The `userProfile` object sent by `app.js:programCoach()` includes: height, weight, sex, age, occupation. While Workers AI runs within Cloudflare's trust boundary, this data is sent to a third-party LLM endpoint (even if served by Cloudflare). The AGENTS.md for exercise-coach explicitly states "NO user profile data" but program-coach sends it.

**Risk:** Unnecessary exposure of personal data to the AI inference pipeline. The program-coach doesn't legitimately need the user's height, weight, or occupation to suggest program modifications.

**Recommendation:** Send only relevant fields (goal, experience level) instead of the entire settings object. Filter on the client side in `app.js:programCoach()`.

---

### 🟡 Medium (4)

#### M1. Repeated JSON extraction pattern — 3 endpoints, same code
Three endpoints (`/api/ai/coach`, `/api/ai/import`, `/api/ai/program-coach`) repeat the same 10-line pattern:

```js
let resultText = ''
if (aiRes.response) resultText = aiRes.response.trim()
const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
if (jsonMatch) resultText = jsonMatch[1].trim()
let parsed
try { parsed = JSON.parse(resultText) }
catch { return respond({ error: '...' }, 502) }
```

This is duplicated in 3 places (lines 96-108, 133-146, 171-182). The `/api/ai/program-coach` has a slightly different variant at lines 178-189 that tries JSON.parse silently and falls back to text response.

**Recommendation:** Extract to a helper function:
```js
async function extractJSON(aiRes, errorMsg) {
  const text = aiRes?.response?.trim() || ''
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const clean = match ? match[1].trim() : text
  try { return JSON.parse(clean) }
  catch { throw new Error(errorMsg || 'La IA no generó JSON válido') }
}
```

#### M2. No rate limiting
The Worker has no rate limiting on any endpoint. A malicious or buggy client could:
- Spam `/api/ai/import` — burning through the free Workers AI tier (10,000 neurons/day)
- Hit `/api/push/send` repeatedly — sending dozens of push notifications
- Saturate KV writes on `/api/push/subscribe`

This is a single-user app, so abuse is self-inflicted, but a misbehaving client (e.g., infinite loop in app.js retrying on error) could exhaust the AI quota.

**Recommendation:** Add KV-based simple rate limiting for AI endpoints (e.g., max 10 requests/minute per IP):
```js
const key = `ratelimit:${req.headers.get('CF-Connecting-IP')}:${Math.floor(Date.now() / 60000)}`
const count = parseInt(await env.PUSH_KV.get(key)) || 0
if (count > 10) return respond('Rate limited', 429)
await env.PUSH_KV.put(key, String(count + 1), { expirationTtl: 120 })
```

#### M3. `max_tokens` may truncate program output — `push-worker:129,167`
Two endpoints use `max_tokens: 1024`:
- `/api/ai/import` (line 129) — 1024 tokens for generating a full program with weeks/days/exercises
- `/api/ai/program-coach` (line 167) — 2048 tokens for generating a program or text response

For complex programs (4+ weeks, 5+ days/week, 6+ exercises/day), the JSON output can easily exceed 1024 tokens. Truncated JSON would fail `JSON.parse` and return a 502 error.

**Recommendation:** Increase `max_tokens` to 2048 for `/api/ai/import` (matching program-coach). Consider streaming to detect truncation.

#### M4. `/api/push/send` subscribes only one device — single subscription in KV
```js
await env.PUSH_KV.put('subscription', JSON.stringify(sub))
```
The key `'subscription'` is a fixed string. Every new subscribe overwrites the previous subscription. This is documented as intentional ("Single subscription — one device at a time") but means:
- If user subscribes on phone, then laptop, only laptop receives pushes
- No way to send to both
- `unsubscribe` at line 41 deletes the single key

This is acceptable for a single-user PWA but worth documenting as a known limitation.

---

### 🟢 Low (7)

#### L1. CORS headers permissive — `push-worker:3-7`
```js
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  ...
}
```
For a private single-user app behind Cloudflare, this is acceptable. But `workers.dev` subdomains are public — anyone can send POST requests. The lack of origin restriction combined with no auth (H1-H3) means:
- Anyone can call `/api/push/send` with arbitrary content (though they need the VAPID public key from `push-config.js`)
- Anyone can trigger AI inference calls

**Recommendation:** Consider restricting `Access-Control-Allow-Origin` to the app's actual domain, or at minimum validate a secret in the request body.

#### L2. `VAPID_EMAIL` hardcoded fallback — `push-worker:56`
```js
const vapidEmail = env.VAPID_EMAIL || 'mailto:pedro@example.com'
```
The fallback email `pedro@example.com` is not a real email. If `VAPID_EMAIL` isn't set via `wrangler secret`, the Worker silently uses this placeholder. The VAPID spec requires a valid contact method — push services may reject or throttle messages with invalid contact info.

#### L3. `/api/ai/coach` expects opaque `sessionData` — `push-worker:83`
```js
const { sessionData, systemPrompt } = await req.json()
```
The endpoint serializes `sessionData` as a JSON string but never validates its structure. The client sends `{ day, effort, duration, exercises, settings, swaps }` (from `app.js:runCoachAnalysis`) but the Worker treats it as a black box. If the client changes the data shape, no validation catches it.

#### L4. System prompt sent from client — `push-worker:88,125,163`
All AI endpoints accept `systemPrompt` from the client request. This means the client controls the AI's system instructions. While the client is the app itself (not a public API), an XSS vulnerability or compromised dependency could modify the system prompt sent to the AI.

#### L5. No HEAD/GET handling beyond OPTIONS — `push-worker:11-17`
Lines 11-17:
```js
if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
```
A GET request to any endpoint returns 405. This means health checks, uptime monitors, or manual browser visits produce "Method Not Allowed" instead of a helpful message.

#### L6. Exercise coach prompt built with template strings — `push-worker:201-215`
The system prompt for exercise-coach is built by interpolating request parameters:
```js
const systemContent = `...Contexto del ejercicio:
- Nombre: ${exercise_name}
- Músculo principal: ${muscle}
...`
```
This is a potential prompt injection vector — if `exercise_name` contains newlines or instruction text, it could alter the AI's behavior. While the app controls the input, custom exercise names typed by the user reach this template unchanged.

**Recommendation:** Sanitize exercise name and muscle by stripping newlines and markdown-like tokens before interpolation.

#### L7. KV namespace name hardcoded in `wrangler.toml` — cross-file
The binding `PUSH_KV` is hardcoded in bindings. If the KV namespace is recreated (deleted and recreated), the ID must be manually updated in `wrangler.toml`. This is a deployment hygiene issue, not a code bug.

---

## Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 High | 3 | No request validation; no size limits; user profile sent to AI |
| 🟡 Medium | 4 | Repeated JSON extraction; no rate limiting; low `max_tokens`; single-subscription limitation |
| 🟢 Low | 7 | Permissive CORS; placeholder email; opaque sessionData; client-controlled system prompt; no HEAD handling; prompt injection vector; KV ID hardcoded |

**Most impactful fixes:**
1. Add request body validation (H1) — prevents opaque errors on malformed requests
2. Add request size limits (H2) — prevents memory exhaustion
3. Filter user profile before sending to AI (H3) — removes unnecessary personal data exposure
