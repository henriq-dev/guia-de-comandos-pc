# Histórico de versões

## 2.10.4 — Corrige o deploy na Vercel (postcss.config.js antigo)
- Causa real da falha: o repositório ainda tinha o `postcss.config.js` da versão anterior, que carrega o `autoprefixer` (removido no Tailwind 4). Ao copiar o zip por cima, arquivos que saíram do projeto não são apagados. Erro no log: "Não foi possível encontrar o módulo 'autoprefixer'".
- O zip agora traz um `postcss.config.js` vazio, que substitui o antigo ao copiar por cima.
- Se existir um `tailwind.config.js` no repositório, pode apagar: o Tailwind 4 não usa mais (o tema está em `src/index.css`).

## 2.10.3 — Node 20 declarado no projeto (deploy na Vercel)
- O Tailwind 4 só roda em Node 20 ou superior. O `package.json` agora declara `"engines": { "node": ">=20" }`, e a Vercel usa isso para escolher a versão do Node no build. Se o deploy da v2.10.2 falhou por rodar em Node 18, este ajuste resolve.
- Conferido: instalação limpa (`npm ci`) e build a partir do zip, no Node 22, sem erro.
- Se ainda falhar: Vercel → Settings → General → Node.js Version → 22.x (ou 20.x), e refaça o deploy.

## 2.10.2 — Pré-visualização do link (WhatsApp e redes)
- Ao enviar o link do site, o WhatsApp mostrava só título e texto, sem imagem. Agora há imagem de capa (`public/og-image.png`, 1200x630) e as tags Open Graph/Twitter no `index.html`.
- Os endereços das tags (`og:url`, `og:image`) usam `https://guia-de-comandos-pc.vercel.app`. Se o endereço do site mudar, troque nas duas linhas do `index.html`.
- O WhatsApp guarda a pré-visualização antiga por um tempo. Para ver a nova na hora, envie o link com um sufixo (ex.: `...vercel.app/?v=2`) ou use o Depurador de Compartilhamento do Facebook.
- Teste novo (`tests/unit/seo.test.js`) confere as tags e o tamanho da imagem.

## 2.10.1 — Fundo escuro garantido
- No preview do Claude a página aparecia com fundo branco depois do Tailwind 4: o Tailwind 4 coloca o CSS base em camadas (`@layer`), e CSS "solto" de quem hospeda a página vence as camadas. O fundo e a cor do texto do `body` agora ficam fora de `@layer`, então valem em qualquer hospedagem. Testado com uma página que força fundo branco.

## 2.10.0 — Tailwind 4 (zera os avisos de segurança)
- Tailwind 3.4 → 4.3 com o plugin oficial para Vite. `npm audit`: de 5 avisos para **0**, em produção e desenvolvimento.
- O tema (cores, fontes, brilho) foi para o bloco `@theme` em `src/index.css`. Saíram `tailwind.config.js`, `postcss.config.js` e o `autoprefixer`.
- Visual conferido tela por tela (390px e 1280px; Guia, Roteiro e Histórico) contra a versão anterior: sem diferença visível. Dois ajustes para manter o visual: o brilho neon voltou à intensidade antiga e os botões continuam com cursor de mãozinha (o Tailwind 4 mudou esse padrão).
- Requer Node 20 ou superior (antes: 18).
- Testes: `npm test` e `npm run test:e2e` passam. Os testes passaram a esperar 14 cards no Guia (CHKDSK de SSD da v2.9.6).

## 2.9.6 — CHKDSK separado para HD e SSD
- Novo card `chkdsk C: /f` para SSD. O card do HD (`/f /r`) agora indica no título e na descrição que é só para HD mecânico, para ninguém copiar o `/r` por engano num SSD.

## 2.9.5 — Correção de texto
- Winsock: removida a frase que mandava combinar com `flushdns` e contradizia a orientação de usar só depois de `flushdns` e `renew`.

## 2.9.4 — Explicações mais completas no Roteiro (só conteúdo)
- 22 itens do Roteiro ganharam contexto sem perder o texto anterior: triagem (o que observar em repouso), inicialização (o que manter ativo), DNS, testes de internet (como interpretar o ping e o cabo), tela azul (como ler o código e o Visualizador de Eventos, reverter driver) e encerramento (reiniciar em vez de desligar, comparar com a triagem, orientar o cliente).
- Roteador: aviso para não usar o botão de reset.

## 2.9.3 — Explicações mais completas no Guia (só conteúdo)
- Sete cards ganharam contexto, risco e quando usar, sem apagar o texto anterior: Temporários do Usuário e do Sistema, Fila de Reparos Pendentes, DNS, Winsock, Diagnóstico de Memória e Gerenciador de Tarefas.
- DNS deixou de ser "essencial": agora diz que é seguro, não exige reinício e não resolve falha do roteador ou do provedor.
- Winsock: só depois de `flushdns` e `renew`; avisa sobre VPN e antivírus.
- `mdsched`: explica as duas opções de reinício e onde achar o resultado.

## 2.9.2 — Textos de segurança técnica (só conteúdo)
- Ponto de restauração: deixa claro que não é backup de Documentos, Fotos e Downloads e que não resolve erro de NTFS nem defeito físico do disco.
- CrystalDiskInfo passa a ser obrigatório antes do CHKDSK. Em Alerta ou Crítico, não rodar e fazer backup. `/r` só em HD mecânico saudável; em SSD, apenas `/f`.
- DISM: aguardar 100%, rodar antes do SFC e, sem internet, usar ISO do Windows como origem (`/source`). SFC: indica onde fica o registro (CBS.log).
- Prefetch: não limpar de rotina (deixa os programas lentos até o Windows refazer o mapa). Só após malware ou falha específica.
- Cleanmgr: desmarcar "Downloads" e só remover Windows.old se não houver necessidade de rollback.
- MSConfig: alerta para nunca usar "Desativar tudo" sem ocultar serviços Microsoft e para não limitar processadores (INACCESSIBLE_BOOT_DEVICE).

## 2.9.1 — Ajuste fino do aviso no celular
- O espaço reservado no fim da página agora acompanha os avisos visíveis (só "Sem internet" usa uma faixa baixa; instalar e atualizar usam mais). Antes sempre reservava 9rem.

## 2.9.0 — Testes dentro do projeto e Roteiro dividido
- `npm test`: 14 testes unitários (Node puro, sem instalar nada) para o relatório, telefone, histórico, backup, validadores e integridade do conteúdo (ids repetidos, etapa inexistente, termo do "Ver no Guia" sem comando).
- `npm run test:e2e`: 8 scripts de navegador (226 verificações) que sobem o site sozinhos e conferem relatório, rotas, histórico, PWA offline, anotações, cronômetro, backup e as correções da auditoria.
- `RoteiroPage.jsx` caiu de 299 para 141 linhas, dividido em `RouteSelector`, `ProgressCard`, `StepCard` e `InlineText`. Nenhum comportamento mudou (todos os testes passam antes e depois).

## 2.8.1 — Dependências atualizadas
- Vite 5 → 6 (corrige o aviso do esbuild). Requer Node 18 ou superior.
- Correções compatíveis de `micromatch` e `postcss-selector-parser` (via `overrides` no package.json). O CSS gerado ficou idêntico, byte a byte.
- `npm audit`: de 9 avisos para 5, todos só de desenvolvimento. Produção continua com 0.
- Os 5 que restam vêm do `braces` dentro do Tailwind 3 e não têm versão corrigida nessa linha; só o Tailwind 4 resolve. É uma migração grande (configuração e classes), então ficou para uma etapa própria. O risco é pequeno: é um problema de padrões de arquivo muito aninhados em ferramentas de build, que aqui não recebem texto de fora.

## 2.8.0 — Correções da auditoria do v2.7.0
- Conteúdo: o DISM dizia "quando o SFC falha" mas a orientação pedia para rodá-lo antes do SFC. Agora o guia explica a ordem: DISM primeiro, porque o SFC depende da imagem do Windows estar íntegra.
- Conteúdo: a fase "Primordial" virou "Diagnóstico Inicial".
- Dados salvos: favoritos, checklist, relatório, anotações, rota e página são conferidos no carregamento. Se o formato estiver errado, só aquela chave volta ao padrão; o resto (ex.: histórico) é preservado.
- Telefone: número com "+" e código de outro país (ex.: +351...) não vira número do Brasil. Sem "+", continua assumindo Brasil com DDD.
- Aviso de instalação/offline: reserva espaço no fim da página (nada cobre o rodapé) e respeita a área segura de celulares com gestos (`viewport-fit=cover`).
- Histórico: aviso de privacidade (nome do cliente e do equipamento; não usar em perfil compartilhado; cuidado com o backup).
- Checklist entre rotas: decisão documentada. As marcações são compartilhadas de propósito (etapas iguais continuam marcadas ao trocar de rota no mesmo atendimento); "Novo atendimento" limpa tudo.
- Dependências: `npm audit` ainda aponta 9 avisos, todos só de desenvolvimento (Vite e Tailwind). 0 em produção. A correção exige atualizar o Vite para uma versão maior, o que fica para uma etapa própria com testes.

## 2.7.0 — Backup do histórico e copiar comando (Fácil)
- Histórico: botões "Exportar backup" (baixa um arquivo .json) e "Importar backup" (junta com o histórico atual, sem repetir atendimentos e respeitando o limite de 50).
- A importação só aceita os campos conhecidos, limita o tamanho dos textos e mostra mensagem clara para arquivo inválido. Na tela vazia também dá para importar (útil ao trocar de computador).
- Roteiro: clicar em qualquer comando destacado copia na hora, com o aviso "Copiado" no próprio botão. Clicar no comando não marca o item.
- Ajuste no celular: o tempo total estimado foi para a linha do cronômetro e o contador de progresso não quebra mais em duas linhas.

## 2.6.0 — Anotações por etapa e cronômetro (Médio)
- Campo "Anotação da etapa" em cada etapa do Roteiro, salvo no navegador (até 500 caracteres) e com um ponto verde quando há texto.
- No relatório, o botão "Incluir anotações das etapas" copia as notas para as Observações (só quando você pedir, já que as notas são internas).
- Cronômetro de atendimento: começa sozinho ao marcar o primeiro procedimento, tem Pausar/Retomar, continua certo ao recarregar a página e zera em "Novo atendimento".
- A duração é salva no histórico e aparece em cada atendimento (ex.: "1h 15min").
- Proteção contra dados salvos corrompidos (anotações e cronômetro).

## 2.5.0 — Melhorias do Roteiro (Fácil e Médio)
- Tempo estimado em cada etapa e total da rota ao lado do progresso (ex.: Manutenção completa ~48 min).
- Botão "Ver no Guia" nos itens que têm comando: abre o Guia de Comandos já filtrado (sfc, dism, dns, chkdsk...).
- Alvos de toque de 44px em telas de toque: linhas do checklist, abas, botões e campos.

## 2.4.1 — Ponto de restauração no Roteiro (Fácil)
- Nova etapa "Ponto de Restauração e Aviso ao Cliente" no início das rotas Manutenção completa, Computador lento e Tela azul.
- Comando pronto `Checkpoint-Computer` (PowerShell como administrador) e atalho `SystemPropertiesProtection` caso a proteção esteja desligada.
- Lembrete de perguntar ao cliente sobre arquivos sem cópia; esse item não entra no relatório do WhatsApp.

## 2.4.0 — PWA instalável e offline (Difícil)
- Manifest e ícones (192, 512, maskable e iPhone): o site pode ser instalado como aplicativo no Windows, Linux Mint, Android e iPhone.
- Service worker: depois do primeiro acesso o site abre sem internet (guia, roteiro, relatório e histórico).
- Botão "Instalar" dentro do site e aviso "Nova versão disponível — Atualizar agora".
- Aviso discreto quando estiver sem internet.
- Atalhos do app instalado: Roteiro e Histórico (`?aba=roteiro` / `?aba=historico`).
- Cada build carimba o service worker com um id novo, então o deploy sempre é percebido pelos aparelhos.
- Arquivos `vercel.json` e `public/_headers` para o `sw.js` nunca ficar preso no cache (Vercel e Netlify).

## 2.3.0 — Histórico de atendimentos (Difícil)
- Botão "Salvar no histórico" na janela do relatório (evita registro duplicado se nada mudou).
- Nova aba "Histórico" com os atendimentos salvos: cliente, data e hora, equipamento, tipo de atendimento, situação e procedimentos feitos.
- Em cada registro: ver mensagem, copiar, reabrir no WhatsApp (escolhendo o contato) e excluir com confirmação.
- Busca por cliente, equipamento, tipo ou situação; botão "Limpar histórico" com confirmação.
- Guarda os 50 atendimentos mais recentes, só no navegador. O telefone do cliente continua sem ser salvo.
- Navegação com 3 abas, contador de registros na aba e proteção contra dados salvos corrompidos.

## 2.2.0 — Roteiros por tipo de problema (Difícil)
- Seletor "Tipo de atendimento" no Roteiro: Manutenção completa, Computador lento, Internet instável e Tela azul e travamentos.
- Novas etapas (internet e tela azul) em `src/data/steps.js`; as rotas ficam em `src/data/routes.js` e escolhem as etapas por id.
- A numeração das etapas passa a vir da posição na rota; o progresso conta só os itens da rota atual.
- O relatório do WhatsApp ganha a linha "Atendimento: <tipo>" e lista só os procedimentos da rota escolhida.
- A rota escolhida fica salva no navegador.

## 2.1.0 — Gerador de relatório para o WhatsApp (Difícil)
- Botão "Gerar relatório para o cliente" no Roteiro, com janela (dialog nativo) e formulário: cliente, WhatsApp, equipamento, situação final e observações.
- Mensagem formatada para o WhatsApp (*negrito*, lista com ✅), montada a partir dos procedimentos marcados no checklist.
- Botões "Copiar mensagem" e "Abrir no WhatsApp" (link `wa.me` com o texto pronto).
- O telefone do cliente nunca é salvo no navegador; os demais campos ficam salvos até clicar em "Novo atendimento".
- Versão do site passa a aparecer no rodapé.

## 2.0.0 — Migração para React
- React + Vite, Tailwind, GSAP e Lucide.
- Favoritos fixos no topo, checklist do roteiro com progresso, 4 comandos novos.
