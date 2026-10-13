import { Star, Copy, Check } from 'lucide-react'

// ÂNCORA: etiqueta de cada tipo de comando
const TAGS = {
  cmd: { label: 'CMD Admin', style: 'bg-neon/15 text-neon', prompt: 'C:\\>' },
  run: { label: 'Win + R', style: 'bg-jade/15 text-jade', prompt: 'Win+R' }
}

export default function CommandCard({ command, isFavorite, onToggleFavorite, copied, onCopy }) {
  const { id, type, icon: Icon, title, description, code, guide } = command
  const tag = TAGS[type]

  return (
    <article className="cmd-card glass group flex flex-col justify-between rounded-xl p-5 transition duration-300 hover:-translate-y-1 hover:border-neon/60 hover:shadow-neon">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-neon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tag.style}`}>
              {tag.label}
            </span>
          </div>

          <button
            onClick={() => onToggleFavorite(id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remover ${title} dos favoritos` : `Favoritar ${title}`}
            className={`rounded-md p-1.5 transition hover:bg-white/10 ${isFavorite ? 'text-amber' : 'text-muted hover:text-white'}`}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>

        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted">{description}</p>
      </div>

      <div>
        {/* ÂNCORA: caixa do comando com cara de terminal */}
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-3 py-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber/70" />
            <span className="h-2 w-2 rounded-full bg-jade/70" />
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-3 font-mono text-sm">
            <code className="min-w-0 text-jade [overflow-wrap:anywhere]">
              <span className="mr-2 select-none text-muted">{tag.prompt}</span>
              {code}
            </code>
            <button
              onClick={() => onCopy(id, code)}
              aria-label={`Copiar comando ${code}`}
              className={`flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs transition hover:bg-white/10 ${
                copied ? 'text-jade' : 'text-muted hover:text-white'
              }`}
            >
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <p className="mt-4 border-t border-dashed border-white/10 pt-4 text-[13px] leading-relaxed text-muted">
          <strong className="text-amber">Orientação:</strong> {guide}
        </p>
      </div>
    </article>
  )
}
