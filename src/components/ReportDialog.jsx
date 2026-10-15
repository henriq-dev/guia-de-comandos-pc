import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { X, Copy, Check, Send, Save } from 'lucide-react'
import { STATUS_OPTIONS, buildMessage, buildWhatsAppLink, getReportItems, normalizePhone } from '../utils/report'
import { useCopy } from '../hooks/useCopy'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

const inputCls =
  'w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-muted/60 focus:border-neon focus:shadow-neon'
const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-muted'

export default function ReportDialog({ open, onClose, steps, routeLabel, checked, onToggle, report, setReport, phone, setPhone, onSave, onOpenHistory, stepNoteLines = [], durationMs = 0 }) {
  const dialog = useRef(null)
  const { copiedId, copy } = useCopy()
  const [savedMessage, setSavedMessage] = useState('') // texto já salvo: evita registro duplicado

  // ÂNCORA: usamos o <dialog> nativo — ele já cuida do foco, do Esc e do fundo escurecido
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      if (!prefersReducedMotion()) {
        gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' })
      }
    }
    if (!open && el.open) el.close()
  }, [open])

  // A mensagem é recalculada sempre que algo muda (derivada do estado, nunca guardada)
  const procedures = useMemo(() => getReportItems(steps, checked), [steps, checked])
  const message = useMemo(() => buildMessage(report, procedures, { routeLabel }), [report, procedures, routeLabel])
  const total = useMemo(() => steps.flatMap((step) => step.items).filter((item) => item.report).length, [steps])
  const saved = savedMessage === message // se qualquer campo mudar, a mensagem muda e o botão volta a valer
  const link = buildWhatsAppLink(phone, message)

  // ÂNCORA: salva um "retrato" do atendimento. O telefone fica de fora de propósito.
  const handleSave = () => {
    onSave({
      client: report.client.trim(),
      machine: report.machine.trim(),
      status: report.status,
      routeLabel,
      done: procedures.length,
      durationMs,
      total,
      message
    })
    setSavedMessage(message)
  }
  const phoneFilled = phone.trim() !== ''
  const phoneValid = normalizePhone(phone) !== ''

  const setField = (key) => (e) => setReport((r) => ({ ...r, [key]: e.target.value }))

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose() // clique no fundo escuro fecha
      }}
      aria-labelledby="report-title"
      className="m-auto w-[min(780px,calc(100%-1.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-0 text-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.7)] ring-1 ring-neon/20 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[92vh] flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 id="report-title" className="text-lg font-bold text-white">Relatório para o cliente</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-muted transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-6 overflow-y-auto px-5 py-5 md:grid-cols-2">
          {/* COLUNA 1: dados do atendimento */}
          <form onSubmit={(e) => e.preventDefault()} className="flex min-w-0 flex-col gap-4">
            <div>
              <label htmlFor="rep-client" className={labelCls}>Nome do cliente</label>
              <input id="rep-client" value={report.client} onChange={setField('client')} placeholder="Ex.: Maria Souza" autoComplete="off" className={inputCls} />
            </div>

            <div>
              <label htmlFor="rep-phone" className={labelCls}>WhatsApp do cliente (opcional)</label>
              <input id="rep-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(69) 99999-9999" autoComplete="off" className={inputCls} />
              <p className={`mt-1 text-xs ${phoneFilled && !phoneValid ? 'text-amber' : 'text-muted'}`}>
                {phoneFilled && !phoneValid
                  ? 'Número incompleto: o WhatsApp vai abrir para você escolher o contato.'
                  : 'Não fica salvo no navegador. Número do Brasil com DDD; de outro país, comece com + e o código. Sem número, você escolhe o contato.'}
              </p>
            </div>

            <div>
              <label htmlFor="rep-machine" className={labelCls}>Equipamento</label>
              <input id="rep-machine" value={report.machine} onChange={setField('machine')} placeholder="Ex.: Notebook Dell Inspiron" autoComplete="off" className={inputCls} />
            </div>

            <div>
              <label htmlFor="rep-status" className={labelCls}>Situação final</label>
              <select id="rep-status" value={report.status} onChange={setField('status')} className={inputCls}>
                <option value="">Não informar</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rep-notes" className={labelCls}>Observações</label>
              <textarea id="rep-notes" rows={3} value={report.notes} onChange={setField('notes')} placeholder="Ex.: Recomendado trocar o HD por SSD." className={`${inputCls} resize-y`} />
              {stepNoteLines.length > 0 && (
                <button
                  type="button"
                  disabled={stepNoteLines.every((line) => report.notes.includes(line))}
                  onClick={() =>
                    setReport({ ...report, notes: [report.notes.trim(), ...stepNoteLines.filter((l) => !report.notes.includes(l))].filter(Boolean).join('\n') })
                  }
                  className="mt-2 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-muted transition hover:border-neon/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Incluir anotações das etapas ({stepNoteLines.length})
                </button>
              )}
            </div>

            <fieldset>
              <legend className={labelCls}>Procedimentos no relatório ({procedures.length})</legend>
              {steps.map((step) => {
                const items = step.items.filter((item) => item.report)
                if (items.length === 0) return null
                return (
                  <div key={step.id} className="mb-3">
                    <p className="mb-0.5 text-xs text-muted">{step.title}</p>
                    {items.map((item) => (
                      <label key={item.id} className="flex cursor-pointer items-start gap-2.5 rounded-md py-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={checked.includes(item.id)}
                          onChange={() => onToggle(item.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#00ff88]"
                        />
                        <span>{item.report}</span>
                      </label>
                    ))}
                  </div>
                )
              })}
            </fieldset>
          </form>

          {/* COLUNA 2: pré-visualização e envio */}
          <div className="flex min-w-0 flex-col gap-3">
            <p className={labelCls}>Pré-visualização da mensagem</p>
            <pre className="max-h-[62vh] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black p-4 font-mono text-[13px] leading-relaxed text-jade">
              {message}
            </pre>
            <p className="text-xs text-muted" aria-live="polite">
              {saved ? (
                <>
                  Salvo no histórico.{' '}
                  <button type="button" onClick={onOpenHistory} className="font-semibold text-neon underline underline-offset-2">
                    Ver histórico
                  </button>
                </>
              ) : (
                'O WhatsApp abre com o texto pronto. Confira e toque em enviar.'
              )}
            </p>
          </div>
        </div>

        {/* ÂNCORA: rodapé fixo — os botões ficam sempre à vista, mesmo com o formulário rolando no celular */}
        {/* No celular: WhatsApp em cima (largura total) e Salvar + Copiar lado a lado. A partir de sm: tudo em linha. */}
        <footer className="grid grid-cols-2 gap-2 border-t border-white/10 bg-ink-800 px-5 py-3 sm:flex sm:justify-end">
          <button
            onClick={handleSave}
            disabled={saved || procedures.length === 0}
            title={procedures.length === 0 ? 'Marque ao menos um procedimento para salvar' : undefined}
            className="order-2 flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-neon/60 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:px-4"
          >
            {saved ? <Check size={16} className="text-jade" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
            {saved ? 'Salvo' : (<>Salvar<span className="hidden sm:inline">&nbsp;no histórico</span></>)}
          </button>

          <button
            onClick={() => copy('relatorio', message)}
            aria-live="polite"
            className="order-3 flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-neon/60 hover:bg-white/5 sm:order-2 sm:px-4"
          >
            {copiedId === 'relatorio' ? <Check size={16} className="text-jade" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copiedId === 'relatorio' ? 'Copiado!' : (<>Copiar<span className="hidden sm:inline">&nbsp;mensagem</span></>)}
          </button>

          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="order-1 col-span-2 flex items-center justify-center gap-2 rounded-lg bg-jade px-4 py-2.5 text-sm font-bold text-black shadow-jade transition hover:brightness-110 sm:order-3 sm:col-span-1"
          >
            <Send size={16} aria-hidden="true" />
            Abrir no WhatsApp
          </a>
        </footer>
      </div>
    </dialog>
  )
}
