import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { routes, getRouteSteps } from '../data/routes'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStopwatch } from '../hooks/useStopwatch'
import { useCopy } from '../hooks/useCopy'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import { isPlainObject, isString, isStringRecord } from '../utils/validators'
import RouteSelector from './RouteSelector'
import ProgressCard from './ProgressCard'
import StepCard from './StepCard'
import ReportDialog from './ReportDialog'

const EMPTY_REPORT = { client: '', machine: '', status: '', notes: '' }

// ÂNCORA: esta página guarda o ESTADO (rota, marcações, anotações, cronômetro, relatório)
// e entrega pronto para as peças visuais: RouteSelector, ProgressCard, StepCard e ReportDialog.
export default function RoteiroPage({ checked, setChecked, onSaveHistory, onOpenHistory, onOpenGuide }) {
  const root = useRef(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [phone, setPhone] = useState('') // o telefone do cliente nunca é salvo
  const [savedReport, setReport] = useLocalStorage('katana-report', EMPTY_REPORT, isStringRecord)
  const report = { ...EMPTY_REPORT, ...savedReport } // garante todos os campos

  // Anotações por etapa (salvas no navegador) e cronômetro do atendimento
  const [savedNotes, setNotes] = useLocalStorage('katana-notes', {}, isStringRecord)
  const notes = isPlainObject(savedNotes) ? savedNotes : {}
  const setNote = (stepId, text) => setNotes((c) => ({ ...(isPlainObject(c) ? c : {}), [stepId]: text }))
  const timer = useStopwatch()
  const { copiedId, copy } = useCopy()

  // Rota escolhida (salva no navegador). Se o id salvo não existir mais, cai na primeira.
  const [routeId, setRouteId] = useLocalStorage('katana-route', routes[0].id, isString)
  const route = routes.find((r) => r.id === routeId) ?? routes[0]
  const steps = useMemo(() => getRouteSteps(route), [route])
  const itemIds = useMemo(() => steps.flatMap((step) => step.items.map((item) => item.id)), [steps])
  const totalMinutes = steps.reduce((sum, step) => sum + (step.minutes || 0), 0) // tempo estimado da rota

  // O progresso conta só os itens da rota atual. As marcações são compartilhadas de propósito:
  // etapas iguais em rotas diferentes (ex.: Ponto de Restauração) continuam marcadas ao trocar de rota,
  // porque a troca acontece no meio do mesmo atendimento. "Novo atendimento" limpa tudo.
  const done = itemIds.filter((id) => checked.includes(id)).length
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

  // Começa um atendimento do zero: limpa marcações, dados do cliente, telefone, anotações e cronômetro
  const newAttendance = () => {
    setChecked([])
    setReport(EMPTY_REPORT)
    setPhone('')
    setNotes({})
    timer.reset()
  }

  // Etapas entram em cascata ao abrir o roteiro e ao trocar de rota
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
      <RouteSelector routeId={route.id} onChange={setRouteId} />

      <ProgressCard
        done={done}
        total={itemIds.length}
        totalMinutes={totalMinutes}
        timer={timer}
        hasData={hasData}
        onGenerate={() => setDialogOpen(true)}
        onReset={newAttendance}
      />

      <div className="flex flex-col gap-5">
        {steps.map((step, index) => (
          <StepCard
            key={`${route.id}-${step.id}`}
            step={step}
            index={index}
            checked={checked}
            onToggle={toggle}
            note={String(notes[step.id] ?? '')}
            onNoteChange={(text) => setNote(step.id, text)}
            copy={copy}
            copiedId={copiedId}
            onOpenGuide={onOpenGuide}
          />
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
