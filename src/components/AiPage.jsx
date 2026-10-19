import { useRef, useState } from 'react'
import { AlertTriangle, Check, Copy, KeyRound, Loader2, Sparkles, WifiOff } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useCopy } from '../hooks/useCopy'
import { isString } from '../utils/validators'

const MAX = 8000 // igual ao limite do servidor (server/gemini.js)

// ÂNCORA: chama a função do servidor. A chave da IA nunca passa por aqui: ela só existe no servidor.
async function askAssistant(text, code, signal) {
  let response
  try {
    response = await fetch('/api/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(code ? { 'x-access-code': code } : {}) },
      body: JSON.stringify({ text }),
      signal
    })
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Tempo esgotado. Tente de novo.')
    throw new Error('Sem conexão com o servidor. Confira a internet.')
  }
  const data = await response.json().catch(() => null)
  // Sem JSON = a função não existe neste endereço (ex.: `npm run dev` ou hospedagem sem função)
  if (!data) throw new Error('O assistente só funciona no site publicado na Vercel ou Netlify, com a função configurada (veja o README).')
  if (!response.ok) throw Object.assign(new Error(data.error || 'Falha ao consultar a IA.'), { status: response.status })
  return data.answer
}

// ÂNCORA: tela do assistente. Estado local: texto, resposta, carregando e erro.
export default function AiPage({ online }) {
  const [text, setText] = useState('')
  const [code, setCode] = useLocalStorage('katana-ai-code', '', isString)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [needsCode, setNeedsCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const { copiedId, failedId, copy } = useCopy()
  const controller = useRef(null)

  const canSend = online && !loading && text.trim().length >= 3

  const submit = async (event) => {
    event.preventDefault()
    if (!canSend) return
    controller.current?.abort()
    controller.current = new AbortController()
    const timeout = setTimeout(() => controller.current.abort(), 30000)
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      setAnswer(await askAssistant(text.trim(), code.trim(), controller.current.signal))
    } catch (e) {
      setError(e.message)
      if (e.status === 401) setNeedsCode(true) // servidor pediu código de acesso
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <section aria-label="Assistente de IA" className="mx-auto max-w-3xl">
      <p className="mb-4 flex gap-2 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm text-[#ffca80]">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          O texto colado é enviado ao Google (Gemini) para gerar a resposta. <strong>Não cole senhas, chaves, nome ou dados do cliente.</strong>{' '}
          A IA pode errar: confira os passos antes de aplicar, principalmente os que apagam dados.
        </span>
      </p>

      <form onSubmit={submit} className="glass rounded-xl p-5 sm:p-6">
        <label htmlFor="ia-texto" className="mb-2 block text-sm font-bold text-white">
          Código de erro ou trecho do log (ex.: <span className="font-mono text-neon">0x80070005</span>, CBS.log)
        </label>
        <textarea
          id="ia-texto"
          rows={7}
          maxLength={MAX}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o erro, a tela azul ou o trecho do log..."
          className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-slate-200 placeholder:text-muted/60 focus:border-neon/60 focus:outline-none"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>{text.length} / {MAX}</span>
          <button type="button" onClick={() => setNeedsCode((v) => !v)} className="inline-flex items-center gap-1 rounded-md px-2 hover:text-white">
            <KeyRound size={12} aria-hidden="true" /> Código de acesso
          </button>
        </div>

        {needsCode && (
          <div className="mt-3">
            <label htmlFor="ia-codigo" className="mb-1 block text-xs font-semibold text-muted">Código de acesso (só se o servidor exigir)</label>
            <input
              id="ia-codigo"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 focus:border-neon/60 focus:outline-none sm:max-w-xs"
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSend}
            className="flex items-center gap-2 rounded-md bg-neon px-4 py-2 text-sm font-bold text-black shadow-neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
            {loading ? 'Analisando...' : 'Analisar com IA'}
          </button>
          {!online && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber">
              <WifiOff size={14} aria-hidden="true" /> Sem internet: o assistente precisa de conexão.
            </span>
          )}
        </div>
      </form>

      <div aria-live="polite" className="mt-5">
        {error && (
          <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>
        )}
        {answer && (
          <article className="glass rounded-xl border-l-4 border-l-jade p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white">Diagnóstico sugerido</h2>
              <button
                type="button"
                onClick={() => copy('ia', answer)}
                className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-xs text-muted transition hover:border-neon/50 hover:text-white"
              >
                {copiedId === 'ia' ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                {copiedId === 'ia' ? 'Copiado' : failedId === 'ia' ? 'Não copiou' : 'Copiar'}
              </button>
            </div>
            {/* Texto puro: o React escapa tudo, então nada vindo da IA vira HTML */}
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-200 [overflow-wrap:anywhere]">{answer}</div>
          </article>
        )}
      </div>
    </section>
  )
}
