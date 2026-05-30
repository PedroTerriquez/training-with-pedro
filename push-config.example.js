// ── Push Notification Config ──
// Copy this file to push-config.js and fill in your values.
// push-config.js is gitignored — never commit it.
//
// How to get these values:
//   1. Deploy the Cloudflare Worker: cd push-worker && wrangler deploy
//   2. Copy the worker URL from the output → PUSH_SERVER_URL
//   3. Generate VAPID keys: npx web-push generate-vapid-keys
//   4. Copy the PUBLIC key → VAPID_PUBLIC_KEY (the private key goes to wrangler secret)

const PUSH_SERVER_URL = 'https://pedro-push.<your-subdomain>.workers.dev'
const VAPID_PUBLIC_KEY = 'BGs...<paste your public key here>'
