# Técnico Henrique — Guia de Comandos & Roteiro de Atendimento

Site de suporte técnico remoto (marca Katana Tech) feito com **React + Vite**, **Tailwind CSS**, **GSAP** e **Lucide Icons**.

## Como rodar

```bash
npm install      # baixa as dependências (só na primeira vez)
npm run dev      # servidor local com recarga automática
npm run build    # gera a pasta dist/ para publicar
npm run preview  # testa o build localmente
```

## Como publicar (Vercel ou Netlify)

1. Suba esta pasta para um repositório no GitHub (a pasta `node_modules` e a `dist` já estão no `.gitignore`).
2. Na Vercel ou no Netlify, importe o repositório.
3. Configuração (a Vercel detecta sozinha): **Build command** `npm run build` e **Output directory** `dist`.

## Estrutura

```
src/
├── data/
│   ├── commands.js      ← lista de comandos (adicione novos aqui)
│   └── steps.js         ← etapas do roteiro de atendimento
├── components/          ← Navbar, Hero, CommandsPage, CommandCard, RoteiroPage, Footer
├── hooks/               ← useLocalStorage, useCopy, useReducedMotion
├── App.jsx              ← estados globais (busca, página, favoritos, checklist)
├── main.jsx             ← ponto de entrada
└── index.css            ← Tailwind + estilos base
tailwind.config.js       ← cores e fontes do tema (dark + neon)
```

## Como adicionar um comando novo

Abra `src/data/commands.js` e inclua um objeto na lista:

```js
{
  id: 'meu-comando',          // único, sem espaços
  type: 'cmd',                // 'cmd' (Prompt) ou 'run' (Win + R)
  icon: Wifi,                 // ícone do Lucide (importe no topo do arquivo)
  title: 'Título do comando',
  description: 'O que ele faz.',
  code: 'comando aqui',
  guide: 'Orientação para o atendimento.',
  categories: ['cmd', 'otimizacao']   // cmd/run + limpeza e/ou otimizacao
}
```

## Recursos

- Busca e filtros por categoria funcionando juntos
- Favoritos fixos no topo (salvos no navegador)
- Roteiro com checklist e barra de progresso (salvos no navegador)
- Animações com GSAP, desligadas para quem usa `prefers-reduced-motion`
