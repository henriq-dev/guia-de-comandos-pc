import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Search, ShieldCheck } from 'lucide-react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

const subtitles = {
  comandos: 'Manual prático de comandos de CMD e Executar para manutenção, otimização e limpeza profissional do Windows.',
  roteiro: 'Passo a passo sequencial para triagem, diagnóstico e otimização em atendimentos remotos.'
}

export default function Hero({ page, search, onSearch }) {
  const root = useRef(null)

  // ÂNCORA: animação de entrada do topo (só roda uma vez, ao abrir o site)
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero="badge"]', { y: -14, opacity: 0, duration: 0.5 })
        .from('[data-hero="title"]', { y: 24, opacity: 0, duration: 0.7 }, '-=0.25')
        .from('[data-hero="blade"]', { scaleX: 0, transformOrigin: 'left center', duration: 0.6 }, '-=0.4')
        .from('[data-hero="text"]', { y: 14, opacity: 0, duration: 0.5 }, '-=0.3')
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <header ref={root} className="border-b border-white/10 px-4 pb-10 pt-12 text-center sm:px-6">
      <span
        data-hero="badge"
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/60 bg-neon/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-neon"
      >
        <ShieldCheck size={14} aria-hidden="true" />
        Suporte Técnico Remoto
      </span>

      <h1 data-hero="title" className="text-4xl font-black tracking-tight text-white sm:text-5xl">
        Técnico <span className="text-neon [text-shadow:0_0_16px_rgba(0,240,255,0.45)]">Henrique</span>
      </h1>

      <span data-hero="blade" className="blade mx-auto mt-4 w-40" aria-hidden="true" />

      <p data-hero="text" className="mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg">
        {subtitles[page]}
      </p>

      {/* ÂNCORA: a busca só aparece no Guia de Comandos */}
      {page === 'comandos' && (
        <div data-hero="text" className="relative mx-auto mt-6 max-w-lg">
          <label htmlFor="busca" className="sr-only">Pesquisar comando</label>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            id="busca"
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar: sfc, temp, dism, rede..."
            autoComplete="off"
            className="w-full rounded-lg border border-white/10 bg-ink-800 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-muted/70 focus:border-neon focus:shadow-neon"
          />
        </div>
      )}
    </header>
  )
}
