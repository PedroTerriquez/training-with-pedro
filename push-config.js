// ── Push Notification Config ──
// Fill in your real values after deploying the Cloudflare Worker.
//
// How to get these values:
//   1. Deploy the Cloudflare Worker: cd push-worker && wrangler deploy
//   2. Copy the worker URL from the output → PUSH_SERVER_URL
//   3. Generate VAPID keys: npx web-push generate-vapid-keys
//   4. Copy the PUBLIC key → VAPID_PUBLIC_KEY (private key goes to wrangler secret)
//
// Security: Both values are designed to be public.
//   - PUSH_SERVER_URL is visible in the JS source to every user
//   - VAPID_PUBLIC_KEY is a cryptographic public key (like SSH public key)
//   The only real secret is VAPID_PRIVATE_KEY, which never leaves Cloudflare.

const PUSH_SERVER_URL = 'https://coach-pedro-ai.pollothe.workers.dev'
const VAPID_PUBLIC_KEY = 'BGhGlnaldC9WNSWHVnpsrZB6KLlbWYhkT-epDlvkF476gy4pG6TxzPxXB0iabEg3PqSqULeUOUYZCx2t-CcFbGka'
