import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Lightbulb, RefreshCw, CheckCircle2, MessageCircle, Terminal, Timer, Pause, Play, StickyNote, Check } from 'lucide-react'
import { routes, getRouteSteps } from '../data/routes'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStopwatch } from '../hooks/useStopwatch'
import { useCopy } from '../hooks/useCopy'
import { formatClock } from '../utils/history'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import ReportDialog from './ReportDialog'

const EMPTY_REPORT = { client: '', machine: '', status: '', notes: '' }

// ÂNCORA: transforma `texto` entre crases em um botão-código que copia ao clicar (sem usar HTML perigoso).
// "prefix" identifica de qual item veio o trecho, para mostrar "copiado" só no botão clicado.
function renderInline(text, copy, copiedId, prefix) {
  return text.split('`').map((part, i) => {
    if (i % 2 === 0) return part
    const id = `${prefix}-${i}`
    const copied = copiedId === id
    return (
      <button
        key={i}
        type="button"
        onClick={() => copy(id, part)}
        title="Clique para copiar"
        aria-label={copied ? `Copiado: ${part}` : `Copiar: ${part}`}
        className={`inline-code align-baseline rounded px-1.5 py-0.5 text-left font-mono text-[13px] transition [overflow-wrap:anywhere] ${
          copied ? 'bg-jade/30 text-white' : 'bg-jade/10 text-jade hover:bg-jade/20'
        }`}
      >
        {part}
        {copied && <Check size={12} className="ml-1 inline" aria-hidden="true" />}
      </button>
    )
  })
}

export default function RoteiroPage({ checked, setChecked, onSaveHistory, onOpenHistory, onOpenGuide }) {
  const root = useRef(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [phone, setPhone] = useState('') // o telefone do cliente nunca é salvo
  const [savedReport, setReport] = useLocalStorage('katana-report', EMPTY_REPORT)
  const report = { ...EMPTY_REPORT, ...savedReport } // garante todos os campos

  // ÂNCORA: anotações por etapa (salvas no navegador) e cronômetro do atendimento
  const [savedNotes, setNotes] = useLocalStorage('katana-notes', {})
  const notes = savedNotes && typeof savedNotes === 'object' && !Array.isArray(savedNotes) ? savedNotes : {}
  const timer = useStopwatch()
  const { copiedId, copy } = useCopy()
  const setNote = (stepId, text) => setNotes((c) => ({ ...(c && typeof c === 'object' && !Array.isArray(c) ? c : {}), [stepId]: text }))

  // ÂNCORA: rota escolhida (salva no navegador). Se o id salvo não existir mais, cai na primeira.
  const [routeId, setRouteId] = useLocalStorage('katana-route', routes[0].id)
  const route = routes.find((r) => r.id === routeId) ?? routes[0]
  const steps = useMemo(() => getRouteSteps(route), [route])
  const itemIds = useMemo(() => steps.flatMap((step) => step.items.map((item) => item.id)), [steps])
  const totalMinutes = steps.reduce((sum, step) => sum + (step.minutes || 0), 0) // tempo estimado da rota

  // O progresso conta só os itens da rota atual (marcações de outras rotas não interferem)
  const done = itemIds.filter((id) => checked.includes(id)).length
  const percent = Math.round((done / itemIds.length) * 100)
  const hasData =
    done > 0 ||
    phone !== '' ||
    Object.values(report).some((v) => v.trim() !== '') ||
    Object.values(notes).some((v) => String(v).trim() !== '') ||
    timer.elapsedMs > 0

  // O cronômetro começa sozinho quando o primeiro procedimento é marcado
  useEffect(() => {
    if (done > 0 && !timer.running && timer.elapsedMs === 0) timer.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  // Anotações das etapas desta rota, prontas para entrar nas observações do relatório
  const stepNoteLines = steps
    .filter((step) => String(notes[step.id] ?? '').trim() !== '')
    .map((step) => `• ${step.title}: ${String(notes[step.id]).trim()}`)

  const toggle = (id) =>
    setChecked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  // Começa um atendimento do zero: limpa marcações, dados do cliente e telefone
  const newAttendance = () => {
    setChecked([])
    setReport(EMPTY_REPORT)
    setPhone('')
    setNotes({})
    timer.reset()
  }

  // ÂNCORA: etapas entram em cascata ao abrir o roteiro e ao trocar de rota
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.step-card', {
        x: -24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.09,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      })
    }, root)
    return () => ctx.revert()
  }, [route.id])

  return (
    <section ref={root} aria-label="Roteiro de atendimento" className="mx-auto max-w-3xl">
      {/* ÂNCORA: seletor do tipo de atendimento (radios nativos: teclado e leitor de tela de graça) */}
      <fieldset className="mb-6">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tipo de atendimento</legend>
        <div className="grid grid-cols-2 gap-3">
          {routes.map(({ id, label, description, icon: Icon }) => (
            <label key={id} className="relative block cursor-pointer">
              <input
                type="radio"
                name="rota"
                value={id}
                checked={route.id === id}
                onChange={() => setRouteId(id)}
                className="peer sr-only"
              />
              <div className="glass flex h-full flex-col items-start gap-2 rounded-xl p-3 transition sm:flex-row sm:gap-3 sm:p-4 hover:border-neon/40 peer-checked:border-neon peer-checked:bg-neon/10 peer-checked:shadow-neon peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neon">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-neon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white">{label}</span>
                  {/* ÂNCORA: no celular só o nome aparece, para o seletor não empurrar o checklist */}
                  <span className="mt-0.5 hidden text-xs leading-relaxed text-muted sm:block">{description}</span>
                </span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ÂNCORA: barra de progresso do atendimento atual */}
      <div className="glass mb-6 rounded-xl p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-white">
            <CheckCircle2 size={18} className="text-jade" aria-hidden="true" />
            Progresso do atendimento
          </span>
          <span className="whitespace-nowrap font-mono text-muted">
            {done}/{itemIds.length} · {percent}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Progresso do atendimento"
          className="h-2 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-neon to-jade transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm" role="timer" aria-label="Tempo de atendimento">
          <Timer size={16} className="text-neon" aria-hidden="true" />
          <span className="font-mono text-white" id="cronometro">{formatClock(timer.elapsedMs)}</span>
          <span className="text-xs text-muted">de atendimento · ~{totalMinutes} min no total</span>
          {timer.elapsedMs > 0 && (
            <button
              type="button"
              onClick={timer.running ? timer.pause : timer.start}
              className="ml-1 flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-muted transition hover:border-neon/50 hover:text-white"
            >
              {timer.running ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
              {timer.running ? 'Pausar' : 'Retomar'}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setDialogOpen(true)}
            disabled={done === 0}
            title={done === 0 ? 'Marque ao menos um procedimento para gerar o relatório' : undefined}
            className="flex items-center gap-2 rounded-md bg-jade px-3.5 py-2 text-sm font-bold text-black shadow-jade transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Gerar relatório para o cliente
          </button>
          <button
            onClick={newAttendance}
            disabled={!hasData}
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-neon/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Novo atendimento (limpar tudo)
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {steps.map((step, index) => (
          <article
            key={`${route.id}-${step.id}`}
            className="step-card glass rounded-xl border-l-4 border-l-neon p-5 sm:p-6"
          >
            {/* O número da etapa vem da posição na rota, não do dado */}
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-neon">
              Etapa {String(index + 1).padStart(2, '0')} — {step.phase}
              {step.minutes && <span className="ml-2 font-semibold normal-case tracking-normal text-muted">· ~{step.minutes} min</span>}
            </p>
            <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
            <p className="mb-4 text-sm text-muted">{step.intro}</p>

            <ul className="flex flex-col gap-1">
              {step.items.map((item) => {
                const isDone = checked.includes(item.id)
                return (
                  <li key={item.id}>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-white/[0.04]">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#00ff88]"
                      />
                      <span className={`text-[15px] leading-relaxed transition ${isDone ? 'text-muted line-through decoration-white/30' : ''}`}>
                        <strong className="text-white">{item.lead}</strong> {renderInline(item.text, copy, copiedId, `${step.id}-${item.id}`)}
                      </span>
                    </label>
                    {item.guide && (
                      <button
                        type="button"
                        onClick={() => onOpenGuide(item.guide)}
                        className="ml-10 mt-1 inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 text-xs font-semibold text-neon hover:bg-neon/10"
                      >
                        <Terminal size={12} aria-hidden="true" /> Ver no Guia
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            <details className="group mt-3">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted transition hover:text-white">
                <StickyNote size={13} aria-hidden="true" />
                Anotação da etapa
                {String(notes[step.id] ?? '').trim() !== '' && <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-label="com anotação" />}
              </summary>
              <textarea
                rows={2}
                maxLength={500}
                value={notes[step.id] ?? ''}
                onChange={(e) => setNote(step.id, e.target.value)}
                aria-label={`Anotação da etapa: ${step.title}`}
                placeholder="Ex.: HD com 92% de uso, cliente avisado."
                className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-muted/60 focus:border-neon/60 focus:outline-none"
              />
            </details>

            {step.tip && (
              <p className="mt-4 flex gap-2 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm text-[#ffca80]">
                <Lightbulb size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Dica do Técnico:</strong> {renderInline(step.tip, copy, copiedId, `${step.id}-tip`)}
                </span>
              </p>
            )}
          </article>
        ))}
      </div>

      <ReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        steps={steps}
        routeLabel={route.label}
        checked={checked}
        onToggle={toggle}
        report={report}
        setReport={setReport}
        phone={phone}
        setPhone={setPhone}
        onSave={onSaveHistory}
        stepNoteLines={stepNoteLines}
        durationMs={timer.elapsedMs}
        onOpenHistory={() => {
          setDialogOpen(false)
          onOpenHistory()
        }}
      />
    </section>
  )
}
