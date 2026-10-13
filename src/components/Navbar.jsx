import { Terminal, ClipboardList } from 'lucide-react'

const tabs = [
  { id: 'comandos', label: 'Guia de Comandos', short: 'Comandos', icon: Terminal },
  { id: 'roteiro', label: 'Roteiro de Atendimento', short: 'Roteiro', icon: ClipboardList }
]

export default function Navbar({ page, onChange }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="sticky top-0 z-50 flex justify-center gap-2 border-b border-white/10 bg-ink-800/80 px-3 py-3 backdrop-blur-md"
    >
      {tabs.map(({ id, label, short, icon: Icon }) => {
        const active = page === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition sm:px-4 sm:text-base ${
              active
                ? 'bg-neon/10 text-neon shadow-neon'
                : 'text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {/* ÂNCORA: nome curto no celular, nome completo a partir de sm */}
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
