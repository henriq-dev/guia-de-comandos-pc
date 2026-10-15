// __APP_VERSION__ vem do package.json (definido no vite.config.js)
export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-muted">
      <p>&copy; 2026 Técnico Henrique — Suporte Técnico e Manutenção Remota de Computadores.</p>
      <p className="mt-1 font-mono text-xs text-muted/60">v{__APP_VERSION__}</p>
    </footer>
  )
}
