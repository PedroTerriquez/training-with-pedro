import webPush from 'web-push'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
    }

    const url = new URL(req.url)

    function respond(data, status = 200) {
      const body = typeof data === 'string' ? data : JSON.stringify(data)
      const headers = { ...corsHeaders }
      if (typeof data !== 'string') headers['Content-Type'] = 'application/json'
      return new Response(body, { status, headers })
    }

    if (url.pathname === '/api/push/subscribe') {
      if (!env.PUSH_KV) return respond('Push KV not configured', 501)
      try {
        const sub = await req.json()
        await env.PUSH_KV.put('subscription', JSON.stringify(sub))
        return respond('ok')
      } catch (err) {
        return respond('Invalid subscription', 400)
      }
    }

    if (url.pathname === '/api/push/unsubscribe') {
      if (!env.PUSH_KV) return respond('Push KV not configured', 501)
      await env.PUSH_KV.delete('subscription')
      return respond('ok')
    }

    if (url.pathname === '/api/push/send') {
      if (!env.PUSH_KV) return respond('Push KV not configured', 501)
      try {
        const { title, body, tag } = await req.json()
        const raw = await env.PUSH_KV.get('subscription')
        if (!raw) {
          return respond('No subscription', 404)
        }

        const vapidPublic = env.VAPID_PUBLIC_KEY
        const vapidPrivate = env.VAPID_PRIVATE_KEY
        const vapidEmail = env.VAPID_EMAIL || 'mailto:pedro@example.com'

        if (!vapidPublic || !vapidPrivate) {
          return respond('VAPID keys not configured', 500)
        }

        webPush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate)

        const sub = JSON.parse(raw)
        await webPush.sendNotification(sub, JSON.stringify({
          title: title || 'Coach Pedro AI',
          body: body || '',
          tag: tag || 'workout',
          url: './',
        }))

        return respond('sent')
      } catch (err) {
        if (err.statusCode === 410 && env.PUSH_KV) {
          await env.PUSH_KV.delete('subscription')
        }
        return respond('Push failed: ' + (err.message || 'unknown'), 500)
      }
    }

    if (url.pathname === '/api/ai/coach') {
      try {
        const { sessionData, systemPrompt } = await req.json()
        if (!sessionData) return respond({ error: 'No session data provided' }, 400)

        const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt || '' },
            { role: 'user', content: 'DATOS DE LA SESIÓN:\n' + JSON.stringify(sessionData, null, 2) },
          ],
          stream: false,
          max_tokens: 1024,
        })

        let resultText = ''
        if (aiRes.response) {
          resultText = aiRes.response.trim()
        }

        const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) resultText = jsonMatch[1].trim()

        let parsed
        try {
          parsed = JSON.parse(resultText)
        } catch {
          return respond({ error: 'La IA no generó JSON válido', raw: resultText }, 502)
        }

        return respond(parsed)
      } catch (err) {
        return respond({ error: 'Error de IA: ' + err.message }, 500)
      }
    }

    if (url.pathname === '/api/ai/import') {
      try {
        const { text, systemPrompt } = await req.json()
        if (!text) return respond({ error: 'No text provided' }, 400)

        const fullPrompt = 'RUTINA DEL USUARIO:\n' + text

        const aiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: systemPrompt || '' },
            { role: 'user', content: fullPrompt },
          ],
          stream: false,
          max_tokens: 1024,
        })

        let resultText = ''
        if (aiRes.response) {
          resultText = aiRes.response.trim()
        }

        // Strip markdown code fences if present
        const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (jsonMatch) resultText = jsonMatch[1].trim()

        let parsed
        try {
          parsed = JSON.parse(resultText)
        } catch {
          return respond({ error: 'La IA no generó JSON válido. Intenta simplificar la rutina.', raw: resultText }, 502)
        }

        return respond(parsed)
      } catch (err) {
        return respond({ error: 'Error de IA: ' + err.message }, 500)
      }
    }

    return respond('Not Found', 404)
  },
}
