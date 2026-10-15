import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

const EMPTY = { elapsed: 0, startedAt: null }

// Dado salvo corrompido volta para o estado zerado
const normalize = (t) => ({
  elapsed: Number.isFinite(t?.elapsed) && t.elapsed > 0 ? t.elapsed : 0,
  startedAt: Number.isFinite(t?.startedAt) ? t.startedAt : null
})

// ÂNCORA: cronômetro que sobrevive a recarregar a página.
// Guardamos só "quanto já acumulou" e "quando recomeçou"; o tempo atual é calculado na hora.
export function useStopwatch() {
  const [saved, setSaved] = useLocalStorage('katana-timer', EMPTY)
  const timer = normalize(saved)
  const [now, setNow] = useState(() => Date.now())
  const running = timer.startedAt !== null

  // Só roda o "tic" de 1 segundo enquanto estiver contando
  useEffect(() => {
    if (!running) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const elapsedMs = timer.elapsed + (running ? Math.max(0, now - timer.startedAt) : 0)

  const start = () =>
    setSaved((c) => {
      const t = normalize(c)
      return t.startedAt === null ? { elapsed: t.elapsed, startedAt: Date.now() } : t
    })
  const pause = () =>
    setSaved((c) => {
      const t = normalize(c)
      return t.startedAt === null ? t : { elapsed: t.elapsed + (Date.now() - t.startedAt), startedAt: null }
    })
  const reset = () => setSaved(EMPTY)

  return { elapsedMs, running, start, pause, reset }
}
