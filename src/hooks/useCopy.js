import { useState, useRef, useCallback, useEffect } from 'react'

// ÂNCORA: copia o texto e informa o resultado de verdade: copiedId (deu certo) ou failedId (não copiou).
// Antes o plano B (execCommand) nunca era conferido, e "Copiado!" aparecia mesmo se falhasse.
export function useCopy() {
  const [copiedId, setCopiedId] = useState(null)
  const [failedId, setFailedId] = useState(null)
  const timer = useRef(null)

  // Ao sair da tela, cancela o temporizador (não atualiza algo que já não existe)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async (id, text) => {
    let ok = false
    try {
      await navigator.clipboard.writeText(text)
      ok = true
    } catch {
      // Plano B para navegadores sem Clipboard API; execCommand devolve true/false
      const temp = document.createElement('textarea')
      temp.value = text
      temp.setAttribute('readonly', '')
      temp.style.position = 'fixed'
      temp.style.opacity = '0'
      document.body.appendChild(temp)
      temp.select()
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      temp.remove()
    }
    setCopiedId(ok ? id : null)
    setFailedId(ok ? null : id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopiedId(null)
      setFailedId(null)
    }, 2000)
    return ok
  }, [])

  return { copiedId, failedId, copy }
}
