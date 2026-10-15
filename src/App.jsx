import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePwa } from './hooks/usePwa'
import PwaPrompts from './components/PwaPrompts'
import { addRecord, removeRecord, mergeRecords } from './utils/history'
import { isString, isStringArray } from './utils/validators'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CommandsPage from './components/CommandsPage'
import RoteiroPage from './components/RoteiroPage'
import HistoryPage from './components/HistoryPage'
import Footer from './components/Footer'

const PAGES = ['comandos', 'roteiro', 'historico']

export default function App() {
  // ÂNCORA: estados globais. Página, favoritos, checklist e histórico ficam salvos no navegador.
  const [search, setSearch] = useState('')
  const [savedPage, setPage] = useLocalStorage('katana-page', 'comandos', isString)
  const [favorites, setFavorites] = useLocalStorage('katana-favs', [], isStringArray)
  const [checked, setChecked] = useLocalStorage('katana-checked', [], isStringArray)
  const [savedHistory, setHistory] = useLocalStorage('katana-history', [])

  // Proteção: se o dado salvo estiver corrompido (não é lista / página desconhecida), usa o padrão
  const page = PAGES.includes(savedPage) ? savedPage : 'comandos'
  const history = Array.isArray(savedHistory) ? savedHistory : []

  // PWA: instalar, atualizar e estado offline
  const pwa = usePwa()

  // Atalhos do app instalado abrem direto na aba pedida (ex.: ./?aba=roteiro)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const aba = params.get('aba')
    if (aba && PAGES.includes(aba)) setPage(aba)
    if (aba) {
      params.delete('aba')
      const query = params.toString()
      window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Adiciona ou remove um id da lista de favoritos
  const toggleFavorite = (id) =>
    setFavorites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const saveToHistory = (record) =>
    setHistory((list) => addRecord(Array.isArray(list) ? list : [], record))
  const importHistory = (records) => setHistory((list) => mergeRecords(Array.isArray(list) ? list : [], records))
  const deleteFromHistory = (id) => setHistory((list) => removeRecord(Array.isArray(list) ? list : [], id))

  return (
    <>
      <Navbar page={page} onChange={setPage} historyCount={history.length} />
      <Hero page={page} search={search} onSearch={setSearch} />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {page === 'comandos' && (
          <CommandsPage search={search} favorites={favorites} onToggleFavorite={toggleFavorite} />
        )}
        {page === 'roteiro' && (
          <RoteiroPage
            checked={checked}
            setChecked={setChecked}
            onSaveHistory={saveToHistory}
            onOpenHistory={() => setPage('historico')}
            onOpenGuide={(term) => {
              setSearch(term)
              setPage('comandos')
              window.scrollTo({ top: 0 })
            }}
          />
        )}
        {page === 'historico' && (
          <HistoryPage
            history={history}
            onDelete={deleteFromHistory}
            onClear={() => setHistory([])}
            onImport={importHistory}
            onGoRoteiro={() => setPage('roteiro')}
          />
        )}
      </main>

      <Footer />
      <PwaPrompts pwa={pwa} />
    </>
  )
}
