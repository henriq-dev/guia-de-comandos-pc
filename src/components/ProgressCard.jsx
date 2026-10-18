import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, MessageCircle, Pause, Play, RefreshCw, Timer } from 'lucide-react'
import { formatClock } from '../utils/history'

// ÂNCORA: barra de progresso, cronômetro e ações do atendimento atual
export default function ProgressCard({ done, total, totalMinutes, timeNote, timer, hasData, onGenerate, onReset }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  // Confirmação em 2 toques: limpar apaga marcações, dados do cliente, anotações e cronômetro
  const [confirming, setConfirming] = useState(false)
  const resetButtonRef = useRef(null)
  const confirmButtonRef = useRef(null)
  const restoreResetFocus = useRef(false)
  useEffect(() => {
    if (!hasData) setConfirming(false)
  }, [hasData])

  useEffect(() => {
    if (confirming) confirmButtonRef.current?.focus()
    else if (restoreResetFocus.current) {
      restoreResetFocus.current = false
      resetButtonRef.current?.focus()
    }
  }, [confirming])

  return (
    <div className="glass mb-6 rounded-xl p-5">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-white">
          <CheckCircle2 size={18} className="text-jade" aria-hidden="true" />
          Progresso do atendimento
        </span>
        <span className="whitespace-nowrap font-mono text-muted">
          {done}/{total} · {percent}%
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
        <span className="text-xs text-muted">de atendimento · soma nominal ~{totalMinutes} min</span>
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

      <p className="mt-2 text-xs leading-relaxed text-muted">
        {timeNote} Os minutos das etapas não separam trabalho ativo de espera.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onGenerate}
          disabled={done === 0}
          title={done === 0 ? 'Marque ao menos um procedimento para gerar o relatório' : undefined}
          className="flex items-center gap-2 rounded-md bg-jade px-3.5 py-2 text-sm font-bold text-black shadow-jade transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Gerar relatório para o cliente
        </button>
        {confirming ? (
          <div role="alertdialog" aria-label="Confirmar limpeza do atendimento" className="flex flex-wrap items-center gap-2 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm">
            <span id="reset-confirm-description" className="text-red-200">Apagar marcações, anotações, cronômetro e dados do cliente?</span>
            <button
              type="button"
              ref={confirmButtonRef}
              aria-describedby="reset-confirm-description"
              onClick={() => {
                restoreResetFocus.current = false
                setConfirming(false)
                onReset()
              }}
              className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800"
            >
              Sim, limpar tudo
            </button>
            <button
              type="button"
              onClick={() => {
                restoreResetFocus.current = true
                setConfirming(false)
              }}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            ref={resetButtonRef}
            onClick={() => setConfirming(true)}
            disabled={!hasData}
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-muted transition hover:border-neon/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Novo atendimento (limpar tudo)
          </button>
        )}
      </div>
    </div>
  )
}
