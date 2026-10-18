# Relatório de acessibilidade — Katana Tech Hub v2.12.1

**Revisão:** 18/10/2026  
**Base:** `katana-tech-hub-v2.12.0.zip`  
**Entrega corrigida:** v2.12.1  
**Ambiente:** build local servido em Chromium 154 no sandbox; não foi feito deploy nem teste em aparelho físico.

## Resultado

Foram corrigidos os problemas encontrados na primeira avaliação automatizada e nos testes de teclado. A suíte axe final registrou **zero violações** nos 11 estados de interface avaliados. Os testes de teclado, foco e árvore de acessibilidade do Chromium também passaram: **33 verificações, zero falhas**.

Isso fecha a parte de código e testes reproduzíveis no sandbox. **Ainda não é uma certificação completa nem uma avaliação com leitor de tela real**: axe marca verificações de contraste como inconclusivas sobre os gradientes translúcidos dos cards, e não há sessão feita com NVDA, VoiceOver ou tecnologia assistiva em aparelho real.

## Achados da primeira passada e correções

| Achado | Evidência inicial | Correção aplicada |
|---|---|---|
| Hierarquia de títulos pulava do h1 para h3 | `heading-order` nas páginas Guia, Roteiro e Histórico | Inseridos títulos h2 semanticamente ocultos, preservando o visual; os cartões e registros continuam como h3. |
| Links de fontes com área clicável pequena | Altura medida de 19,5 px, abaixo do mínimo de 24 px da WCAG 2.2 AA | Links ganharam `min-height: 24px` e maior espaçamento vertical. |
| Contraste insuficiente no botão de instalação | Texto claro sobre ciano: **1,14:1** | Texto preto sobre ciano: aproximadamente **14,91:1**. Aplicada a mesma regra ao botão de atualização. |
| Contraste insuficiente na ação destrutiva | Texto branco sobre vermelho claro: **3,8:1** | Fundo alterado para vermelho mais escuro; texto branco sobre `red-700`: aproximadamente **6,47:1**. |
| Prévia do relatório rolável sem acesso por teclado | axe `scrollable-region-focusable` | Prévia e mensagens do histórico receberam nome acessível, role de região e foco por teclado. Foi acrescentado controle explícito por setas, Page Up/Down, Home/End e Espaço. |
| Foco se perdia ao abrir confirmações inline | O botão acionador era removido da tela e o foco caía no `body` | Ao abrir, o foco vai para a ação de confirmação; cancelar restaura o acionador. Confirmar a limpeza move o foco ao primeiro item do roteiro; limpar/excluir histórico move o foco para um controle útil da tela seguinte. |

As mudanças estão em `CommandsPage.jsx`, `RoteiroPage.jsx`, `HistoryPage.jsx`, `Sources.jsx`, `PwaPrompts.jsx`, `ProgressCard.jsx`, `ReportDialog.jsx` e no novo utilitário `src/utils/keyboardScroll.js`.

## Escopo avaliado

Axe-core 4.14.0 executou regras dos conjuntos **WCAG 2.0 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA** e boas práticas, com a preferência `prefers-reduced-motion` ativa para não medir textos durante a animação transitória de entrada dos cards.

Os 11 estados varridos foram: Guia desktop, Roteiro desktop, confirmação de limpeza, diálogo do relatório, Histórico vazio, Histórico com registro, Guia a 320 px, Roteiro a 320 px, Relatório a 320 px, convite de instalação PWA e aviso offline PWA.

A avaliação de teclado cobre Tab e foco visível, ativação de aba com Enter, checkbox com Espaço, entrada/cancelamento/confirmação nos fluxos destrutivos, abertura e fechamento do diálogo de relatório, restauração de foco e rolagem da mensagem longa. A árvore de acessibilidade do Chromium foi consultada para verificar o nome do h1, do alerta de confirmação, do diálogo, da prévia e do convite PWA.

## Contraste e verificações inconclusivas

Depois das correções, axe não reportou violações nos estados avaliados. Em alguns elementos sobre o estilo `glass` e os gradientes do fundo, o próprio axe retorna `incomplete`, pois não consegue determinar automaticamente a cor final composta. Como conferência complementar, as cores da paleta foram calculadas contra as superfícies escuras do tema e uma aproximação mais clara do card translúcido (`#11242f`): slate-200 **12,93:1**, muted **6,22:1**, neon **11,32:1**, jade **11,89:1** e amber **7,45:1**. Todos os pares calculados ficaram acima de 4,5:1, mas a superfície aproximada não substitui uma medição visual/pixel a pixel em todos os pontos do gradiente.

## Validação final

- `npm ci`: instalação limpa; 87 pacotes e zero vulnerabilidades reportadas.
- `npm test`: **22 testes unitários passaram**.
- `npm run build`: build de produção concluído com Vite 6.4.4.
- `CHROME_PATH=/usr/bin/chromium npm run test:a11y`: **33 verificações passaram, zero falhas**; a rotina foi repetida e permaneceu estável.
- `CHROME_PATH=/usr/bin/chromium npm run test:e2e`: **11 scripts passaram**, incluindo os 10 anteriores e `11-acessibilidade.mjs`.
- `npm audit`: **zero vulnerabilidades**.

O comando `npm run test:a11y` foi adicionado ao projeto para permitir repetir axe e os testes de teclado localmente.

## Ainda falta antes de fechar acessibilidade por completo

1. Fazer uma sessão manual em leitor de tela de verdade (por exemplo, NVDA com Chrome/Firefox e VoiceOver com Safari, conforme os dispositivos suportados), com uma pessoa usuária ou profissional de acessibilidade.
2. Conferir manualmente as superfícies com gradiente/transparência em tela real e em zoom elevado, pois alguns checks de contraste ficam inconclusivos no axe.
3. Repetir os fluxos principais no ambiente HTTPS publicado após o deploy do patch; esta auditoria foi feita na build local e não alterou o site público.

**Conclusão:** os problemas reproduzidos no código foram corrigidos e há testes automatizados para evitar regressões. Para considerar o item de acessibilidade totalmente encerrado, ainda é necessária a validação com leitor de tela e a conferência final no deploy/aparelhos-alvo.
