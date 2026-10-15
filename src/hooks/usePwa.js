import { useCallback, useEffect, useRef, useState } from 'react'

// ÂNCORA: hook que cuida de tudo do PWA em um lugar só:
// registro do service worker, botão "Instalar", aviso de versão nova e estado online/offline.
export function usePwa() {
  const [installEvent, setInstallEvent] = useState(null) // guarda o evento até a pessoa clicar em "Instalar"
  const [installed, setInstalled] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState(null) // versão nova instalada, esperando ativar
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const updateRequested = useRef(false) // só recarrega se a pessoa pediu a atualização
  const reloading = useRef(false)

  // Registra o service worker (só no site publicado; no `npm run dev` ele atrapalharia)
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

    const watch = (registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) setWaitingWorker(registration.waiting)
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          // "installed" + já existe um controlador = é uma atualização, não o primeiro acesso
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaitingWorker(worker)
        })
      })
    }

    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        watch(registration)
        registration.update().catch(() => {}) // procura versão nova a cada abertura
      })
      .catch(() => {}) // sem service worker o site continua funcionando normalmente

    // Quando a versão nova assume o controle, recarrega uma única vez.
    // No 1º acesso o controle também muda (clients.claim), por isso exige o pedido da pessoa.
    const onControllerChange = () => {
      if (!updateRequested.current || reloading.current) return
      reloading.current = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
  }, [])

  // Evento de instalação (Chrome/Edge/Android). O navegador deixa a gente escolher quando mostrar.
  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const install = useCallback(async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice.catch(() => {})
    setInstallEvent(null) // o evento só pode ser usado uma vez
  }, [installEvent])

  const update = useCallback(() => {
    if (!waitingWorker) return
    updateRequested.current = true
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
  }, [waitingWorker])

  return {
    canInstall: Boolean(installEvent) && !installed,
    install,
    hasUpdate: Boolean(waitingWorker),
    update,
    dismissUpdate: () => setWaitingWorker(null),
    online
  }
}
