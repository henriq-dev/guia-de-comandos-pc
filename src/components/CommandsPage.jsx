import { useMemo, useState, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SearchX, Star } from 'lucide-react'
import { commands, categories } from '../data/commands'
import { useCopy } from '../hooks/useCopy'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import CommandCard from './CommandCard'

export default function CommandsPage({ search, favorites, onToggleFavorite }) {
  const [category, setCategory] = useState('all')
  const { copiedId, copy } = useCopy()
  const grid = useRef(null)

  // ÂNCORA: busca + categoria funcionam juntas; favoritos ficam fixos no topo
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    const filtered = commands.filter((cmd) => {
      const text = `${cmd.title} ${cmd.description} ${cmd.code}`.toLowerCase()
      const matchesTerm = text.includes(term)
      const matchesCategory =
        category === 'all' ||
        (category === 'fav' ? favorites.includes(cmd.id) : cmd.categories.includes(category))
      return matchesTerm && matchesCategory
    })

    // sort estável: favoritos (0) antes dos demais (1), mantendo a ordem original
    return [...filtered].sort(
      (a, b) => Number(!favorites.includes(a.id)) - Number(!favorites.includes(b.id))
    )
  }, [search, category, favorites])

  // ÂNCORA: GSAP faz os cards entrarem em cascata ao abrir a página ou trocar de categoria
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !grid.current) return
    const ctx = gsap.context(() => {
      gsap.from('.cmd-card', {
        y: 28,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'transform,opacity'
      })
    }, grid)
    return () => ctx.revert()
  }, [category])

  const filters = [...categories, { id: 'fav', label: `Favoritos (${favorites.length})` }]

  return (
    <section aria-label="Guia de comandos">
      <div role="group" aria-label="Filtrar por categoria" className="mb-8 flex flex-wrap justify-center gap-2.5">
        {filters.map(({ id, label }) => {
          const active = category === id
          return (
            <button
              key={id}
              onClick={() => setCategory(id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-neon bg-neon text-black shadow-neon'
                  : 'border-white/10 bg-ink-800 text-muted hover:border-neon/50 hover:text-white'
              }`}
            >
              {id === 'fav' && <Star size={14} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />}
              {label}
            </button>
          )
        })}
      </div>

      <div ref={grid} className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(330px,100%),1fr))]">
        {visible.map((cmd) => (
          <CommandCard
            key={cmd.id}
            command={cmd}
            isFavorite={favorites.includes(cmd.id)}
            onToggleFavorite={onToggleFavorite}
            copied={copiedId === cmd.id}
            onCopy={copy}
          />
        ))}
      </div>

      {/* ÂNCORA: aviso quando nenhum card passa nos filtros */}
      {visible.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
          <SearchX size={36} aria-hidden="true" />
          <p>
            {category === 'fav' && favorites.length === 0
              ? 'Você ainda não favoritou nenhum comando. Toque na estrela de um card para fixá-lo no topo.'
              : 'Nenhum comando encontrado. Tente outro termo ou categoria.'}
          </p>
        </div>
      )}
    </section>
  )
}
