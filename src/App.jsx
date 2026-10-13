import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CommandsPage from './components/CommandsPage'
import RoteiroPage from './components/RoteiroPage'
import Footer from './components/Footer'

export default function App() {
  // ÂNCORA: estados globais. Os três últimos ficam salvos no navegador.
  const [search, setSearch] = useState('')
  const [page, setPage] = useLocalStorage('katana-page', 'comandos')
  const [favorites, setFavorites] = useLocalStorage('katana-favs', [])
  const [checked, setChecked] = useLocalStorage('katana-checked', [])

  // Adiciona ou remove um id da lista de favoritos
  const toggleFavorite = (id) =>
    setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  return (
    <>
      <Navbar page={page} onChange={setPage} />
      <Hero page={page} search={search} onSearch={setSearch} />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {page === 'comandos' ? (
          <CommandsPage search={search} favorites={favorites} onToggleFavorite={toggleFavorite} />
        ) : (
          <RoteiroPage checked={checked} setChecked={setChecked} />
        )}
      </main>

      <Footer />
    </>
  )
}
