import { useState, useRef, useCallback } from 'react'

// ÂNCORA: copia o texto e informa qual item foi copiado (para mostrar "Copiado!")
export function useCopy() {
  const [copiedId, setCopiedId] = useState(null)
  const timer = useRef(null)

  const copy = useCallback(async (id, text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Plano B para navegadores sem Clipboard API
      const temp = document.createElement('textarea')
      temp.value = text
      document.body.appendChild(temp)
      temp.select()
      document.execCommand('copy')
      temp.remove()
    }
    setCopiedId(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopiedId(null), 2000)
  }, [])

  return { copiedId, copy }
}
