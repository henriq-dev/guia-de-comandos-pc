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
- 4 roteiros por tipo de problema (manutenção completa, computador lento, internet instável, tela azul), cada um começando pelo ponto de restauração quando faz sentido
- Gerador de relatório para o cliente, com mensagem pronta para WhatsApp (o telefone do cliente nunca é salvo)
- Histórico dos últimos 50 atendimentos, com busca, copiar, reabrir no WhatsApp e excluir
- Backup do histórico (exportar e importar .json) e comandos do Roteiro que copiam com um clique
- Anotação por etapa, cronômetro de atendimento e tempo estimado por rota
- PWA: instalável como aplicativo e funciona sem internet depois do primeiro acesso

## PWA (instalar e usar offline)

- `public/manifest.webmanifest` e `public/icons/`: nome, cores e ícones do app.
- `public/sw.js`: guarda o site no aparelho. O `vite.config.js` carimba esse arquivo a cada build, então o deploy novo é sempre percebido e aparece o aviso "Nova versão disponível".
- `vercel.json` e `public/_headers`: impedem que o `sw.js` fique preso no cache.
- O service worker só roda no site publicado (HTTPS). No `npm run dev` ele fica desligado.
- Para testar: `npm run build`, depois `npx vite preview`, e abra no Chrome (Menu → Instalar).

## Como adicionar uma etapa ou rota no Roteiro

1. Crie a etapa em `src/data/steps.js` (id único; `report` é a frase para o cliente, ou `null` para não aparecer no relatório).
2. Inclua o id da etapa na rota desejada em `src/data/routes.js`.
