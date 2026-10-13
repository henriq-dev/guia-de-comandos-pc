import { useState, useEffect } from 'react'

// ÂNCORA: useState que também salva no navegador.
// try/catch porque o storage pode estar bloqueado (aba anônima, por exemplo).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* sem storage: o site continua funcionando, só não lembra */
    }
  }, [key, value])

  return [value, setValue]
}
