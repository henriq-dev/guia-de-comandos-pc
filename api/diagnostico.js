// ÂNCORA: função da Vercel (vira o endereço /api/diagnostico). Só traduz entre a Vercel e o núcleo em server/gemini.js.
import { handleRequest } from '../server/gemini.js'

export default async function handler(req, res) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
  const result = await handleRequest({
    method: req.method,
    headers: req.headers,
    body: req.body,
    ip,
    env: process.env
  })
  res.setHeader('Cache-Control', 'no-store')
  res.status(result.status).json(result.body)
}
