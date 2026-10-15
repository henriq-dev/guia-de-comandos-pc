import { routes } from '../data/routes'

// ÂNCORA: seletor do tipo de atendimento (radios nativos: teclado e leitor de tela de graça)
export default function RouteSelector({ routeId, onChange }) {
  return (
    <fieldset className="mb-6">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tipo de atendimento</legend>
      <div className="grid grid-cols-2 gap-3">
        {routes.map(({ id, label, description, icon: Icon }) => (
          <label key={id} className="relative block cursor-pointer">
            <input
              type="radio"
              name="rota"
              value={id}
              checked={routeId === id}
              onChange={() => onChange(id)}
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
  )
}
