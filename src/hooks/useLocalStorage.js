import { useState, useEffect } from 'react'

// ÂNCORA: useState que também salva no navegador.
// try/catch porque o storage pode estar bloqueado (aba anônima, por exemplo).
// "validate" (opcional): função que confere o formato do valor salvo; se falhar, usa o valor inicial.
export function useLocalStorage(key, initialValue, validate) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved === null) return initialValue
      const parsed = JSON.parse(saved)
      return !validate || validate(parsed) ? parsed : initialValue
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
