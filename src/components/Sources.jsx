import { BookOpen, ExternalLink } from 'lucide-react'

// ÂNCORA: linha "Fontes" com links oficiais. Abre em aba nova; "noreferrer" não envia o endereço do site para quem recebe o clique.
// sources = undefined: não mostra nada (item sem cadastro); lista vazia: avisa que não há fonte oficial verificada.
export default function Sources({ sources }) {
  if (!sources) return null
  return (
    <div className="sources mt-3 text-xs leading-relaxed text-muted">
      <p className="mb-1 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
        <BookOpen size={13} aria-hidden="true" /> Fontes
      </p>
      {sources.length === 0 ? (
        <p>Sem fonte oficial verificada para este item: orientação baseada em prática de campo.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center gap-1 rounded text-neon/90 underline decoration-neon/30 underline-offset-2 hover:text-neon hover:decoration-neon"
              >
                <span>{s.label}</span>
                <ExternalLink size={11} className="mt-1 shrink-0" aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
