# Histórico de versões

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
