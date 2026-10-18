import { Terminal, ClipboardList, History } from 'lucide-react'

const tabs = [
  { id: 'comandos', label: 'Guia de Comandos', short: 'Comandos', icon: Terminal },
  { id: 'roteiro', label: 'Roteiro de Atendimento', short: 'Roteiro', icon: ClipboardList },
  { id: 'historico', label: 'Histórico', short: 'Histórico', icon: History }
]

export default function Navbar({ page, onChange, historyCount = 0 }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky top-0 z-50 flex justify-center gap-1 border-b border-white/10 bg-ink-800/80 px-2 py-3 backdrop-blur-md sm:gap-2 sm:px-3"
    >
      {tabs.map(({ id, label, short, icon: Icon }) => {
        const active = page === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-bold transition sm:gap-2 sm:px-4 sm:text-base ${
              active
                ? 'bg-neon/10 text-neon nav-active-soft'
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            {/* ÂNCORA: em telas muito estreitas (<380px) o ícone some para as 3 abas caberem */}
            <Icon size={18} aria-hidden="true" className="hidden min-[380px]:block" />
            {/* nome curto no celular, nome completo a partir de sm */}
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
            {id === 'historico' && historyCount > 0 && (
              <span className="rounded-full bg-neon/20 px-1.5 text-[11px] font-bold leading-5 text-neon">
                {historyCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
