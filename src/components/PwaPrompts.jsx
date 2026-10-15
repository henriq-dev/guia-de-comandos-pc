import { useState } from 'react'
import { Download, RefreshCw, WifiOff, X } from 'lucide-react'

// ÂNCORA: avisos flutuantes do PWA (instalar, atualizar, offline). Ficam no canto inferior, sem cobrir o conteúdo.
export default function PwaPrompts({ pwa }) {
  const { canInstall, install, hasUpdate, update, dismissUpdate, online } = pwa
  const [hideInstall, setHideInstall] = useState(false)

  const showInstall = canInstall && !hideInstall

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 px-4 pb-4"
      aria-live="polite"
    >
      {!online && (
        <div
          role="status"
          className="glass pointer-events-auto flex items-center gap-2 rounded-full border border-amber/40 px-4 py-2 text-xs font-semibold text-amber"
        >
          <WifiOff size={14} aria-hidden="true" />
          Sem internet — tudo continua funcionando offline
        </div>
      )}

      {hasUpdate && (
        <div
          role="alert"
          className="glass pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-jade/40 p-3 text-sm shadow-jade"
        >
          <RefreshCw size={18} className="shrink-0 text-jade" aria-hidden="true" />
          <p className="flex-1 text-slate-200">Nova versão disponível.</p>
          <button
            type="button"
            onClick={update}
            className="rounded-lg bg-jade px-3 py-1.5 text-xs font-bold text-ink hover:brightness-110"
          >
            Atualizar agora
          </button>
          <button
            type="button"
            onClick={dismissUpdate}
            aria-label="Dispensar aviso de atualização"
            className="rounded-md p-1 text-muted hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {showInstall && (
        <div
          role="region"
          aria-label="Instalar aplicativo"
          className="glass pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border border-neon/40 p-3 text-sm shadow-neon"
        >
          <Download size={18} className="shrink-0 text-neon" aria-hidden="true" />
          <p className="flex-1 text-slate-200">Instale o app e use mesmo sem internet.</p>
          <button
            type="button"
            onClick={install}
            className="rounded-lg bg-neon px-3 py-1.5 text-xs font-bold text-ink hover:brightness-110"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={() => setHideInstall(true)}
            aria-label="Dispensar convite de instalação"
            className="rounded-md p-1 text-muted hover:text-white"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
