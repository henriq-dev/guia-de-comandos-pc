import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react'
import { steps } from '../data/steps'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

// ÂNCORA: transforma `texto` entre crases em <code> (sem usar HTML perigoso)
function renderInline(text) {
  return text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded bg-jade/10 px-1.5 py-0.5 font-mono text-[13px] text-jade">
        {part}
      </code>
    ) : (
      part
    )
  )
}

const allItemIds = steps.flatMap((step) => step.items.map((item) => item.id))

export default function RoteiroPage({ checked, setChecked }) {
  const root = useRef(null)

  // Só conta ids que ainda existem (se um passo for removido do roteiro, o progresso não quebra)
  const done = allItemIds.filter((id) => checked.includes(id)).length
  const percent = Math.round((done / allItemIds.length) * 100)

  const toggle = (id) =>
    setChecked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  // ÂNCORA: etapas entram em cascata ao abrir o roteiro
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
  }, [])

  return (
    <section ref={root} aria-label="Roteiro de atendimento" className="mx-auto max-w-3xl">
      {/* ÂNCORA: barra de progresso do atendimento atual */}
      <div className="glass mb-6 rounded-xl p-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-white">
            <CheckCircle2 size={18} className="text-jade" aria-hidden="true" />
            Progresso do atendimento
          </span>
          <span className="font-mono text-muted">
            {done}/{allItemIds.length} · {percent}%
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
        <button
          onClick={() => setChecked([])}
          disabled={done === 0}
          className="mt-4 flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-sm text-muted transition hover:border-neon/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Novo atendimento (limpar marcações)
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {steps.map((step) => (
          <article
            key={step.id}
            className="step-card glass rounded-xl border-l-4 border-l-neon p-5 sm:p-6"
          >
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-neon">{step.kicker}</p>
            <h3 className="mb-2 text-xl font-bold text-white">{step.title}</h3>
            <p className="mb-4 text-sm text-muted">{step.intro}</p>

            <ul className="flex flex-col gap-1">
              {step.items.map((item) => {
                const isDone = checked.includes(item.id)
                return (
                  <li key={item.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-white/[0.04]">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggle(item.id)}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#00ff88]"
                      />
                      <span className={`text-[15px] leading-relaxed transition ${isDone ? 'text-muted line-through decoration-white/30' : ''}`}>
                        <strong className="text-white">{item.lead}</strong> {renderInline(item.text)}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>

            {step.tip && (
              <p className="mt-4 flex gap-2 rounded-lg border border-amber/30 bg-amber/10 p-3 text-sm text-[#ffca80]">
                <Lightbulb size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Dica do Técnico:</strong> {step.tip}
                </span>
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
