// ÂNCORA: função da Netlify (o netlify.toml aponta /api/diagnostico para cá). Só traduz entre a Netlify e o núcleo.
import { handleRequest } from '../../server/gemini.js'

export default async (request, context) => {
  let body = null
  try { body = await request.json() } catch { /* corpo vazio ou inválido: o núcleo responde 400 */ }
  const result = await handleRequest({
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body,
    ip: context?.ip || request.headers.get('x-nf-client-connection-ip') || 'desconhecido',
    env: process.env
  })
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  })
}
