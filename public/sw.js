/* Service worker do Técnico Henrique.
   - No primeiro acesso guarda o "esqueleto" do site, para abrir sem internet.
   - Páginas: rede primeiro (traz a versão nova); se estiver offline, usa o cache.
   - Arquivos do site (JS, CSS, ícones): cache primeiro, porque o nome muda a cada build.
   - Fontes do Google: entrega do cache e atualiza em segundo plano. */

// O vite.config.js troca este texto por um id novo a cada build.
// Assim o navegador percebe que o sw.js mudou e instala a versão nova.
const BUILD_ID = '__BUILD_ID__'
const SHELL_CACHE = `katana-shell-${BUILD_ID}`
const FONT_CACHE = 'katana-fonts'
const NAV_TIMEOUT_MS = 4000 // internet muito lenta conta como offline

self.addEventListener('install', (event) => {
  event.waitUntil(precache())
})

async function precache() {
  const cache = await caches.open(SHELL_CACHE)
  const response = await fetch('./index.html', { cache: 'reload' })
  if (!response.ok) throw new Error('index.html indisponível')

  // Descobre os arquivos que o index.html usa (JS e CSS têm hash no nome)
  const html = await response.clone().text()
  const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1])

  await cache.put('./index.html', response.clone())
  await cache.put('./', response)
  // Essencial: o JS e o CSS do site. Se faltar algum, a instalação falha de propósito (tenta de novo na próxima visita).
  await cache.addAll(assets)
  // Opcional: manifest e ícones. Um arquivo que faltar no deploy NÃO pode derrubar o modo offline.
  await Promise.allSettled(
    ['./manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'].map((url) => cache.add(url))
  )
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Apaga os caches de versões antigas
      const names = await caches.keys()
      await Promise.all(
        names.filter((name) => name.startsWith('katana-shell-') && name !== SHELL_CACHE).map((name) => caches.delete(name))
      )
      await self.clients.claim()
    })()
  )
})

// A página pede para ativar a versão nova quando a pessoa toca em "Atualizar agora"
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request))
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(request))
  }
})

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => { clearTimeout(timer); resolve(value) },
      (error) => { clearTimeout(timer); reject(error) }
    )
  })
}

async function handleNavigation(request) {
  try {
    return await withTimeout(fetch(request), NAV_TIMEOUT_MS)
  } catch {
    // ignoreSearch: "/?aba=roteiro" (atalho do app instalado) também abre offline
    const cached = await caches.match('./index.html', { ignoreSearch: true })
    return cached || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok && response.type === 'basic') {
    const cache = await caches.open(SHELL_CACHE)
    cache.put(request, response.clone())
  }
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(FONT_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone())
      return response
    })
    .catch(() => null)
  return cached || (await network) || Response.error()
}
