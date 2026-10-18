# Relatório de fechamento — revisão técnica e itens 5→1

**Projeto:** Katana Tech Hub  
**Versão do patch:** 2.12.2  
**Data:** 18/10/2026  
**Base:** pacote v2.12.0, relatório de revisão técnica v2.12.2 e itens priorizados pelo solicitante.  
**Ambiente de validação:** sandbox Linux com Chromium; nenhuma alteração foi publicada em produção e nenhum comando foi executado em um computador Windows real.

## Resumo executivo

Foram trabalhados na ordem combinada os itens **5, 4, 3, 2 e 1**. A revisão técnica do Guia/Roteiro foi incorporada ao código; o Histórico agora explica os limites do armazenamento local e dos backups, com política operacional documentada; e o brilho da aba ativa foi reduzido. O patch compila, os testes unitários, E2E e de acessibilidade passaram, os 37 links cadastrados responderam e `npm audit` reportou zero vulnerabilidades.

A conclusão não equivale a homologação completa: o patch **não está publicado**; o PWA precisa ser testado em dispositivos físicos depois do deploy; ainda falta validação com leitor de tela real; os tempos continuam estimativas nominais sem medição de trabalho ativo/espera; e a operação ainda precisa determinar um prazo de retenção de dados.

## Acompanhamento dos itens na ordem solicitada

| Item | Status | O que foi feito | O que ainda falta |
|---|---|---|---|
| **5 — Acessibilidade formal** | **Código e automação corrigidos; validação assistiva pendente** | Corrigidos os achados da auditoria anterior em títulos, contraste, alvos, foco/diálogos e conteúdo rolável; suíte axe/teclado mantida no projeto. No patch final: 33 verificações passaram, sem violações detectadas nos estados cobertos. | Sessão humana com NVDA/Chrome ou Firefox e VoiceOver/Safari nos dispositivos suportados; conferência manual de contrastes sobre gradientes e zoom; repetir no deploy HTTPS. O teste automatizado não é certificação WCAG nem substitui usuário/leitor de tela. |
| **4 — PWA em produção/aparelhos reais** | **Pendente para o patch** | A verificação anterior desta sessão encontrou o PWA de produção em v2.10.4: resposta HTTPS 200, service worker controlando a página e shell básico carregando offline em Chromium com viewport móvel emulado. | Publicar v2.12.2 e repetir instalação, atualização do service worker, abertura offline, retorno à rede e safe areas em Android/Chrome e iPhone/Safari reais. O teste anterior não foi feito em aparelho físico nem valida este patch. |
| **3 — Procedimentos técnicos e tempos** | **Revisão incorporada; validação em Windows e medição pendentes** | Reescritas orientações dos 14 comandos e das 14 etapas, corrigindo condições de uso, riscos de dados/disco/rede, limitações de DISM/SFC, CHKDSK, Winsock, `mdsched`, serviços, DNS, Kernel-Power 41, drivers e Windows 10. Foram associados links oficiais e adicionados testes de regressão. | Técnico responsável deve validar comandos/privilégios em versões representativas do Windows 10/11, especialmente recuperação offline, origens DISM, limpeza e CHKDSK. Registrar tempos reais por rota antes de publicar novos números. Nenhum comando foi executado em Windows real nesta tarefa. |
| **2 — Dados e backups de clientes** | **Política e aviso implementados; decisão operacional pendente** | O Histórico agora informa que os dados ficam no perfil local, sem criptografia/sincronização próprias; explica que o JSON é legível; orienta minimização e proteção. Criado `POLITICA-DADOS-CLIENTES.md` e ampliada a documentação. | O responsável pela operação ainda precisa definir o prazo de retenção e o local/canal autorizado para backups. O aplicativo continua sem criptografia própria, autenticação, sincronização ou expiração automática; seu limite de 50 registros não é um prazo de retenção. Se forem necessários controles centralizados, será preciso outro projeto de arquitetura. |
| **1 — Suavizar brilho da aba ativa** | **Concluído** | A sombra foi reduzida de 18 px de neon sólido para 8 px com opacidade baixa. Fundo, texto, foco visível e contraste foram preservados; há uma checagem E2E do estilo ativo. | Nenhuma pendência técnica identificada; a preferência estética pode ser revista após uso prolongado. |

## Alterações técnicas em mais detalhe

### Guia e Roteiro

- DISM agora distingue Windows Update da origem local/de rede e instrui a confirmar arquivo, índice e compatibilidade da imagem. `/revertpendingactions` ficou restrito ao uso de recuperação em uma instalação offline que não inicializa, com marcador de unidade para evitar execução direta no Windows ativo.
- SFC é descrito como verificação de arquivos protegidos do Windows, sem afirmar que corrige apenas DLLs. A sequência DISM → SFC e a consulta ao resultado/log são explicadas.
- Limpeza de `%temp%`, `%windir%\\Temp`, `cleanmgr`, Downloads, Lixeira e `Windows.old` exige revisão, consentimento e cautela com conteúdo pessoal/reversão. Prefetch não é recomendado como rotina de limpeza ou correção não comprovada.
- MSConfig/serviços, aplicativos de inicialização, DNS, ping, DHCP e Winsock foram tornados condicionais. Os avisos agora explicam que ICMP não prova disponibilidade da Internet, que `/release` pode derrubar interfaces e que a redefinição Winsock pode afetar componentes personalizados, com reinicialização única quando aplicável.
- CHKDSK exige backup verificado antes da execução. SMART normal é tratado como triagem, e `/r` não é proibido genericamente em SSD; sua finalidade, demora potencial e limites físicos são explicitados.
- Teste de memória, Kernel-Power 41, drivers, atualizações e validação de tela azul são apresentados como pistas/hipóteses, não diagnósticos conclusivos. Incluiu-se o contexto de fim do suporte geral de Windows 10 Home/Pro, ressalvando ESU/LTSC.
- A busca “Ver no Guia” da etapa de temporários foi ajustada para encontrar especificamente o comando via termo `windir`.

### Tempos das rotas

As somas cadastradas foram mantidas sem criar minutos artificiais nem afirmar que são trabalho ativo:

| Rota | Soma nominal mantida | Nova comunicação |
|---|---:|---|
| Manutenção completa | **48 min** | DISM/SFC, limpeza e reinicialização podem acrescentar espera variável; não é prazo. |
| Computador lento | **23 min** | Criação do ponto, limpeza e boot variam; tempo real pode ser maior. |
| Internet instável | **18 min** | Modem/roteador, DHCP, recuperação da conexão e reinicialização podem variar. |
| Tela azul e travamentos | **78 min** | Testes, CHKDSK, DISM/SFC, atualizações e reboots podem estender o atendimento ou exigir acompanhamento posterior. |

A interface chama esses números de **soma nominal das etapas** e explica que não separam trabalho ativo de espera. O próximo passo responsável é coletar `active_minutes` e `wait_minutes` em atendimentos reais antes de alterar os valores.

### Dados e backups

O aviso na tela e `POLITICA-DADOS-CLIENTES.md` cobrem minimização, perfil individual protegido, JSON legível, importação apenas de fonte confiável, local privado para cópias, retenção/descarte e resposta operacional a incidentes. O patch não adiciona criptografia, login nem exclusão automática; não afirma que apagar um registro elimina cópias externas ou garante apagamento forense.

## Validações executadas no patch 2.12.2

| Verificação | Resultado |
|---|---|
| `npm test` | **23 passaram, 0 falharam.** |
| `npm run build` | **Passou** com Vite 6.4.4. |
| `CHROME_PATH=/usr/bin/chromium npm run test:e2e` | **11 scripts passaram**, incluindo fluxos de backup/privacidade, tempos, links, responsividade móvel e brilho da aba ativa. |
| `CHROME_PATH=/usr/bin/chromium npm run test:a11y` | **33 verificações passaram, 0 falharam** nos estados cobertos. |
| `npm run check:links` | **37/37 fontes responderam HTTP 200**; o link do WinRE redirecionou e chegou a 200. |
| `npm audit` | **0 vulnerabilidades.** |
| Totais das rotas | Recalculados por código: **48, 23, 18 e 78 min nominais**. |

## Pendências finais, em ordem prática

1. **Aprovação em Windows real:** um técnico deve conferir comandos, versões, privilégios, condições e recuperação/retorno antes de usar os procedimentos com clientes.
2. **Tempo medido:** registrar trabalho ativo e espera por etapa/rota em amostra de atendimentos; manter os atuais como nominais até ter dados.
3. **PWA e acessibilidade em produção:** publicar v2.12.2 e executar os cenários HTTPS em aparelhos reais; fazer sessão manual com leitor de tela e revisar contraste/zoom.
4. **Política de retenção:** definir prazo, responsável e local/canal aprovado para backup de acordo com a operação. Se os controles locais forem insuficientes, decidir se o produto precisa de autenticação/criptografia/sincronização e planejar a arquitetura.

**Conclusão:** os itens 5, 3, 2 e 1 receberam correções/documentação no código conforme o escopo possível no sandbox; o item 4 e as validações humanas/operacionais permanecem abertos porque dependem de deploy, dispositivos reais, técnico responsável e decisões da operação. A lista acima separa o que foi implementado do que ainda precisa de aprovação ou validação externa.
