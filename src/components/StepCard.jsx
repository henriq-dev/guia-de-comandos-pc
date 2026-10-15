import { Lightbulb, StickyNote, Terminal } from 'lucide-react'
import InlineText from './InlineText'

// ÂNCORA: um cartão de etapa do roteiro: título, checklist, anotação e dica.
// Não guarda estado: tudo chega por props e as ações voltam por callbacks.
export default function StepCard({ step, index, checked, onToggle, note, onNoteChange, copy, copiedId, onOpenGuide }) {
  const hasNote = note.trim() !== ''

  return (
    <article className="step-card glass rounded-xl border-l-4 border-l-neon p-5 sm:p-6">
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
                  onChange={() => onToggle(item.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#00ff88]"
                />
                <span className={`text-[15px] leading-relaxed transition ${isDone ? 'text-muted line-through decoration-white/30' : ''}`}>
                  <strong className="text-white">{item.lead}</strong>{' '}
                  <InlineText text={item.text} copy={copy} copiedId={copiedId} prefix={`${step.id}-${item.id}`} />
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
          {hasNote && <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-label="com anotação" />}
        </summary>
        <textarea
          rows={2}
          maxLength={500}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          aria-label={`Anotação da etapa: ${step.title}`}
          placeholder="Ex.: HD com 92% de uso, cliente avisado."
          className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 placeholder:text-muted/60 focus:border-neon/60 focus:outline-none"
        />
      </details>

      {step.tip && (
        <p className="mt-4 flex gap-2 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm text-[#ffca80]">
          <Lightbulb size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <strong>Dica do Técnico:</strong> <InlineText text={step.tip} copy={copy} copiedId={copiedId} prefix={`${step.id}-tip`} />
          </span>
        </p>
      )}
    </article>
  )
}
