# Relatório de revisão técnica — Katana Tech Hub v2.12.2

**Escopo:** revisão documental dos comandos, etapas e rotas do site a partir de 17 revisões independentes.

**Arquivos analisados:** `src/data/commands.js`, `src/data/steps.js` e `src/data/routes.js`.

**Resultado da coleta:** 17 itens revisados; **0 falhas de coleta**. Nenhum arquivo do projeto foi alterado e nenhum comando foi executado em um Windows real.

> **Nota de atualização (18/10/2026):** a frase “nenhum arquivo do projeto foi alterado” descreve a fase de pesquisa deste relatório. As correções posteriores no código, os testes e as pendências finais estão documentados em [RELATORIO-FECHAMENTO-REVISAO-TECNICA-v2.12.2.md](./RELATORIO-FECHAMENTO-REVISAO-TECNICA-v2.12.2.md).

## 1. Resumo executivo

A revisão encontrou **14 itens que requerem correção** e **3 itens corretos com ressalvas**. Não há item que possa ser classificado como integralmente correto sem ajuste editorial ou de segurança.

Os problemas de maior prioridade são:

1. **`revert` está operacionalmente incorreto no estado atual.** `/RevertPendingActions` não deve ser executado com `/online` em um Windows que está inicializando normalmente. Deve ficar restrito à recuperação de uma instalação Windows offline que não inicializa, com `/image:<unidade>:\` e execução a partir do ambiente de recuperação. [9][11]
2. **CHKDSK não deve depender de um SMART “normal” como autorização.** Backup verificado deve preceder `/f` ou `/r`, sobretudo quando há sintomas de falha, erros de I/O, ruídos ou alertas de saúde. `/r` não é reparo físico, não deve ser proibido genericamente em SSD e pode alongar muito a indisponibilidade. [33][34][35][36][37]
3. **Exclusões manuais precisam de revisão e consentimento.** `%temp%`, `%windir%\Temp`, `cleanmgr`, Lixeira e `Windows.old` podem envolver dados de trabalho ou capacidade de recuperação. `Shift+Delete` pula a Lixeira, mas não equivale a apagamento seguro e irreversível. [12][13][14][16][17][22][23]
4. **DISM precisa de linguagem condicional.** Windows Update é a origem padrão quando permitido pela política, mas uma origem local ou de rede também pode ser usada. O índice em `install.wim:<índice>` não é universalmente o número da edição; deve ser conferido com `/Get-ImageInfo`. [4][5][6][7]
5. **O roteiro de tela azul atribui causas com excesso de certeza.** Kernel-Power 41 registra um encerramento não limpo; sozinho não identifica fonte, temperatura ou outro componente. O diagnóstico deve correlacionar bugcheck, eventos adjacentes, cronologia e testes. [42][51]
6. **Os minutos atuais são envelopes nominais, não prazos.** DISM/SFC, CHKDSK, Diagnóstico de Memória, atualizações, limpeza e reinicializações têm esperas variáveis e podem exceder substancialmente as somas cadastradas.

Não foi encontrada evidência nas fontes consultadas de que as limpezas, `flushdns`, Winsock ou reparos normais causem dano físico ao hardware. Os riscos demonstráveis são principalmente **perda ou indisponibilidade de dados**, **alteração do estado de servicing**, **perda temporária de conectividade**, **desativação de funções** e **tempo de máquina parada**.

## 2. Classificação consolidada

| ID | Item | Veredicto | Prioridade | Conclusão principal |
|---|---|---|---|---|
| `sfc` | Reparação de Arquivos de Sistema | correto com ressalvas | Média | Comando, prompt elevado, CBS.log e ordem após DISM estão corretos; remover a afirmação categórica sobre WinSxS e sobre impossibilidade de reparo. |
| `dism` | Reparo de Imagem do Windows | requer correção | Alta | Corrigir a exigência absoluta de Internet e explicar que o índice WIM deve ser identificado; manter DISM antes de SFC. |
| `revert` | `/revertpendingactions` | requer correção | **Crítica** | Trocar `/online` por reparo de imagem offline em recuperação; não usar como manutenção geral nem para um Windows que inicializa normalmente. |
| `temp-user` | Temporários do usuário | requer correção | Alta | Não apagar tudo por padrão; remover garantia de que não há dados de trabalho e explicar o efeito de `Shift+Delete`. |
| `temp-sys` | Temporários do sistema | requer correção | Alta | `type: 'run'` é coerente, mas `code: 'temp'` não identifica de forma sustentada `%windir%\Temp`; revisar o destino e evitar exclusão periódica indiscriminada. |
| `prefetch` | Cache de pré-carregamento | requer correção | Média | Abrir a pasta não limpa nada; não há suporte oficial suficiente para recomendar apagar Prefetch como correção de malware ou falha de aplicativo. |
| `cleanmgr` | Limpeza de Disco | requer correção | Alta | Categorias são variáveis; revisar Downloads, Lixeira e Windows.old antes de confirmar, pois a remoção pode ser permanente ou retirar a reversão. |
| `dns` | `ipconfig /flushdns` | correto com ressalvas | Baixa | O comando está correto, mas o título deve dizer “limpar/esvaziar” e o benefício deve ficar restrito a cache/resolução DNS. |
| `msconfig` | Serviços/inicialização | requer correção | Alta | Diferenciar diagnóstico de boot limpo de otimização; registrar mudanças, reiniciar para testar e restaurar a inicialização normal. |
| `chkdsk` | HD mecânico | requer correção | **Alta** | Fazer backup antes do CHKDSK, independentemente do SMART; `/r` procura setores e recupera dados legíveis, não repara a mídia física. |
| `chkdsk-ssd` | SSD | requer correção | Alta | Manter `/f`; retirar a proibição absoluta de `/r` e a alegação de desgaste sem benefício; usar diagnóstico compatível com fabricante/modelo. |
| `winsock` | Redefinição Winsock | requer correção | Média | Efeito é no catálogo Winsock/LSP; não prometer correção genérica nem afirmar que toda VPN/antivírus será removida. |
| `mdsched` | Diagnóstico de Memória | requer correção | Média | Salvar trabalho antes do reboot, descrever a tela corretamente e indicar duração variável; o teste não exclui toda falha intermitente. |
| `taskmgr` | Gerenciador de Tarefas | correto com ressalvas | Baixa | Uso observacional e atalho estão adequados; percentuais são heurísticas, não limites de diagnóstico, e `taskmgr` via Win+R não foi confirmado nas fontes consultadas. |
| `route-maintenance` | `completo` e `lentidao` | requer correção | Alta | Totais somam 48 e 23 min, mas misturam atividade e espera; há excesso de certeza em limiares, limpeza, boot limpo, DISM e DNS. |
| `route-internet` | `internet` | requer correção | Alta | Total de 18 min; testes não isolam a causa sozinhos, `ping` não prova ausência de Internet e reinicializações podem derrubar usuários/sessões. |
| `route-bsod` | `tela-azul` | requer correção | **Alta** | Total de 78 min; Kernel-Power, CHKDSK, DISM, updates e validação precisam de linguagem probabilística e janelas de espera explícitas. |

## 3. Conclusões e alterações recomendadas por comando

### 3.1 `sfc` — Reparação de Arquivos de Sistema

**Conclusão:** `sfc /scannow`, execução em Prompt de Comando elevado, espera até 100%, registro em `%WinDir%\Logs\CBS\CBS.log` e precedência do DISM estão alinhados à documentação Microsoft. [1][2]

**Alterações de texto recomendadas:**

- Substituir “compara ... com a cópia local (pasta WinSxS)” por: “verifica arquivos protegidos do Windows e tenta substituir arquivos corrompidos usando uma cópia em cache”. A documentação consultada não sustenta fixar uma única pasta como fonte invariável. [1][2][3]
- Trocar “se a cópia local estiver danificada, o SFC não consegue reparar” por formulação condicional: “se alguns arquivos não forem reparados, consulte o resultado e o CBS.log; siga a orientação de reparo da imagem, mantendo DISM antes de SFC”.
- Manter a dica de reparo pendente apenas como orientação operacional condicional ou remover se o site exigir que cada instrução esteja diretamente validada por fonte primária específica.
- Manter `id: 'sfc'` e `type: 'cmd'`; não trocar para `command` sem verificar o contrato do consumidor.

### 3.2 `dism` — `dism /online /cleanup-image /restorehealth`

**Conclusão:** o comando, o prompt elevado e a ordem DISM → SFC estão corretos. `/RestoreHealth` verifica e tenta reparar o repositório de componentes. [1][4][5]

**Alterações de texto recomendadas:**

- Trocar “requer conexão com a Internet” por: “usa Windows Update como origem padrão quando permitido pela política; também pode usar uma origem compatível local ou de rede”. [5][6]
- Manter o exemplo WIM somente como exemplo. Orientar a confirmar se existe `install.wim`, executar `DISM /Get-ImageInfo /ImageFile:<caminho>\install.wim` e escolher o índice/nome correspondente à instalação. O número final é um **índice da imagem**, não uma edição universal. [7]
- Avisar que a origem deve corresponder à versão/build/idioma e estar suficientemente atualizada; uma origem incompatível ou mais antiga pode impedir o reparo. [6][8]
- Pedir que o operador aguarde a conclusão; “vários minutos” é uma descrição oficial, não um prazo máximo. [1][4]

### 3.3 `revert` — `/revertpendingactions`

**Conclusão:** este é o problema técnico mais grave do conjunto. O código atual usa `/online`, mas a opção não é suportada para o sistema operacional em execução. Ela é documentada para recuperar uma imagem Windows offline que não inicializa por causa de ações de servicing pendentes. [9]

**Alterações de texto recomendadas:**

- Usar, como forma orientativa, `dism /image:<unidade-da-instalação-Windows>:\ /cleanup-image /revertpendingactions`.
- Instruir o operador a iniciar em ambiente de recuperação, abrir um Prompt administrativo, confirmar a letra correta da instalação offline e desbloquear a partição se BitLocker solicitar a chave de recuperação. [11]
- Dizer explicitamente: não usar `/online`, não apontar para a imagem do WinRE/WinPE e não executar se o Windows estiver inicializando normalmente.
- Restringir o objetivo a uma falha de inicialização possivelmente causada por servicing pendente. Não descrever como cancelamento genérico de atualizações nem prometer que o Windows Update refará a atualização.
- Quando a atualização problemática for identificável, apresentar como alternativa preferencial o histórico do Windows e **Desinstalar atualizações**, ou Windows RE → Solução de problemas → Opções avançadas → Desinstalar atualizações. [10][11]
- Manter `id: 'revert'` e `type: 'cmd'`; não associar a uma rota sem criar deliberadamente essa referência.

### 3.4 `temp-user` — `%temp%`

**Conclusão:** `%temp%` abre a pasta temporária associada à variável TEMP da conta atual; `%USERPROFILE%\AppData\Local\Temp` é um caminho típico, não uma garantia universal. [12]

**Alterações de texto recomendadas:**

- Remover “não contém Documentos nem Fotos”. Aplicativos podem manter dados de trabalho, caches ou cópias temporárias que o cliente ainda precise; salvar o trabalho e fechar os aplicativos relevantes antes de revisar.
- Substituir `Ctrl+A` + `Shift+Delete` como procedimento padrão por Configurações → Sistema → Armazenamento → Arquivos temporários/Recomendações de limpeza, revisando categorias e itens. [13][14][18]
- Se a exclusão manual permanecer, explicar que `Shift+Delete` ignora a Lixeira, não forçar itens bloqueados, não alterar permissões e parar diante de dúvida. Arquivos excluídos podem ainda ser recuperáveis até o espaço ser sobrescrito; portanto, “apagamento permanente” é uma formulação imprecisa. [16][17]
- Enquadrar a limpeza como ação sob demanda para liberar espaço ou tratar um caso específico, não como rotina garantida de desempenho.

### 3.5 `temp-sys` — temporários do Windows

**Conclusão:** `type: 'run'` é coerente com Win+R, mas `code: 'temp'` não foi validado como atalho confiável para `C:\Windows\Temp`. `%WINDIR%`/`%SYSTEMROOT%` são as variáveis documentadas para a pasta Windows; um caminho mais robusto é `%windir%\Temp`. [12]

**Alterações de texto recomendadas:**

- Alterar o código para `%windir%\Temp` se o consumidor permitir esse literal e descrever o destino como caminho típico sob a instalação atual do Windows.
- Diferenciar explicitamente `%temp%` (temporário da conta atual) de `%windir%\Temp` (temporário do Windows), inclusive em `s3-pastas`.
- Remover “apague o conteúdo periodicamente”. Preferir Storage Sense/Arquivos temporários/Recomendações de limpeza, revisando categorias. [13][14][18]
- Trocar “pode pedir permissão ... ao abrir: confirme” por nota condicional: a elevação pode aparecer ao executar uma operação que a exija; só aprovar uma solicitação esperada e legítima. UAC não implica que abrir a pasta sempre exija administrador. [19]
- Fechar aplicativos e instalações/atualizações, ignorar arquivos bloqueados, não forçar remoção nem assumir propriedade. Não prometer ganho de velocidade ou volume de espaço.

### 3.6 `prefetch`

**Conclusão:** o código abre a pasta e não executa limpeza. A descrição de mecanismo como “mapa” e a recomendação de apagar após malware ou falha de aplicativo não foram validadas por documentação Microsoft atual específica de Windows 10/11. A fonte localizada sobre SysMain é de Windows 7; a resposta de Q&A é comunitária, não normativa. [13][20][21]

**Alterações de texto recomendadas:**

- Manter `type: 'run'` e esclarecer: abrir a pasta não apaga arquivos.
- Remover a recomendação de apagar Prefetch como correção presumida de malware ou de falha de inicialização de aplicativo. Para malware, executar verificação antimalware; para falha de aplicativo, investigar/reparar o aplicativo.
- Se houver instrução excepcional, limitar a itens dentro da pasta, sem apagar a pasta nem itens desconhecidos; informar que benefício de espaço não foi estabelecido por fonte oficial consultada.
- Tornar a exigência de administrador condicional à operação de exclusão e às permissões; abrir a pasta normalmente não é a mesma coisa que apagar conteúdo.
- Preferir Storage Sense, Recomendações de limpeza e Limpeza de Disco para liberar espaço. [13][20]

### 3.7 `cleanmgr`

**Conclusão:** `cleanmgr` é válido, mas categorias e caixas variam por sistema/volume. O risco principal está em marcar itens pessoais ou de recuperação sem revisão; não há risco especial de desgaste físico do disco documentado. [22][23][24]

**Alterações de texto recomendadas:**

- Abrir a ferramenta, conferir volume e categorias disponíveis e marcar apenas itens revisados e autorizados.
- Manter cautela com Downloads e acrescentar cautela explícita com Lixeira: revisar o conteúdo antes, pois a limpeza remove a possibilidade simples de restauração. [13][14]
- Para `Windows.old`, confirmar que os arquivos pessoais foram recuperados/copiados e que não será necessária a reversão; a exclusão é irreversível e retira a possibilidade de voltar à versão anterior. A estabilidade do sistema, isoladamente, não basta. [22][23]
- Elevar somente quando solicitado para “Limpar arquivos do sistema” ou itens protegidos, em vez de exigir execução administrativa para toda abertura.
- Citar Storage Sense/Recomendações de limpeza como alternativa atual, sem remover necessariamente o comando solicitado. [24]

### 3.8 `dns` — `ipconfig /flushdns`

**Conclusão:** comando tecnicamente correto e de baixo risco; ele esvazia o cache local do resolvedor DNS, que é repopulado conforme novas consultas. Não limpa cache de roteador, provedor, navegador ou outros dispositivos. [25][27]

**Alterações de texto recomendadas:**

- Trocar o título “Renovar Cache DNS” por “Limpar cache DNS” ou “Esvaziar cache do resolvedor DNS”.
- Manter a execução em Prompt elevado no fluxo do site, seguindo a orientação de troubleshooting da Microsoft, mas sem sugerir que todo comando isolado necessariamente exige todos os privilégios. [26]
- Limitar o benefício a suspeita de resolução DNS desatualizada/negativa; não prometer corrigir lentidão genérica.
- Manter que não há reinicialização, nem renovação de IP, e que o cache volta a ser preenchido.
- Em `s4-dns`, tornar a ação opcional e condicionada a sintomas DNS, não uma etapa universal de integridade do sistema.

### 3.9 `msconfig`

**Conclusão:** `msconfig` é adequado para diagnóstico, especialmente boot limpo, mas o texto atual exagera consequências e não fecha o ciclo de registrar, testar e restaurar. [28][29]

**Alterações de texto recomendadas:**

- Substituir a alegação de que desmarcar “Ocultar todos os serviços Microsoft” derruba especificamente teclado, rede, login ou causa `INACCESSIBLE_BOOT_DEVICE` por: ocultar serviços Microsoft reduz o risco de desativá-los por engano; serviços de terceiros também podem ser necessários e configuração incorreta pode causar instabilidade ou impedir a inicialização.
- Separar diagnóstico de otimização: para aplicativos de inicialização, preferir Gerenciador de Tarefas → Aplicativos de inicialização; usar MSConfig para isolamento temporário de conflitos. [31][32]
- Exigir sessão administrativa, anotar tudo o que foi alterado, reiniciar para testar e restaurar a inicialização normal ao concluir. [28]
- Avaliar Adobe, Google Update e outros serviços caso a caso; desativar atualizadores pode deixar aplicativos sem atualizações.
- Manter a recomendação de não limitar “Número de processadores”, mas explicar apenas que a opção limita recursos e exige reinicialização; não afirmar risco específico de `INACCESSIBLE_BOOT_DEVICE` sem fonte. [30]

### 3.10 `chkdsk` e `chkdsk-ssd`

**Conclusão conjunta:** `chkdsk C: /f` e `chkdsk C: /f /r` são comandos válidos em Prompt elevado. `/f` corrige erros lógicos; `/r` procura setores defeituosos e tenta recuperar informação legível, incluindo a função de `/f`. Se o volume estiver em uso, o Windows pode oferecer agendamento para o próximo reinício. [33]

**Alterações de texto recomendadas:**

- Acrescentar backup verificado antes de qualquer CHKDSK, mesmo quando o SMART não exibe alerta. A fabricante alerta que dados antes acessíveis podem ficar inacessíveis após realocação de setores. [34][35]
- Se houver alerta SMART, erros de I/O, desaparecimento do disco, travamentos de leitura ou ruídos anormais, priorizar preservação/recuperação e diagnóstico ou substituição; não prometer que CHKDSK recuperará dados. [34][35][36][37]
- Remover “Só para HD mecânico” como restrição técnica absoluta. Para `chkdsk-ssd`, retirar “`/r` gasta o SSD sem nenhum benefício” e “não use `/r` em SSD”. Formulação segura: `/r` é uma busca de setores/recuperação mais longa; para corrigir apenas erros lógicos, `/f` pode ser suficiente; selecionar conforme o objetivo e o estado do volume.
- Manter confirmação de C: como volume correto, Prompt como Administrador, salvamento do trabalho, alimentação estável e aviso de indisponibilidade. O agendamento ocorre se o Windows o oferecer, não necessariamente sempre.
- Tratar CrystalDiskInfo como triagem de terceiro. Sem marca/modelo, encaminhar à ferramenta oficial compatível do fabricante; SMART normal não prova saúde perfeita. [37][54][55]

### 3.11 `winsock`

**Conclusão:** `netsh winsock reset` redefine o catálogo Winsock e remove LSPs personalizados; é uma ação de escalonamento para suspeita de corrupção do catálogo, não correção genérica de toda instabilidade. [38][39]

**Alterações de texto recomendadas:**

- Trocar “resolvendo falhas causadas por softwares ou malwares” por “pode ajudar quando a falha decorre de corrupção do catálogo Winsock ou de componentes Winsock personalizados”.
- Manter Prompt elevado e uma reinicialização após a sequência, mas evitar duas reinicializações (`i2-winsock` e `i3-reboot`). Fazer a reinicialização uma única vez no passo final, quando o reset tiver sido executado. [26][40]
- Avisar apenas que softwares que instalem LSP/provedores Winsock personalizados podem precisar de reparo ou reconfiguração. Não afirmar que toda VPN ou antivírus será removido; isso é diferente de “Network reset” completo do Windows. [26][38]
- Tornar o comando condicional a uma falha persistente e localizada no PC após testes/ações menos invasivos.

### 3.12 `mdsched`

**Conclusão:** `mdsched` e as opções de reiniciar agora ou na próxima inicialização estão corretos. O teste torna o computador indisponível e reinicia automaticamente; seu resultado investiga uma hipótese, mas não elimina toda falha intermitente. [41][42]

**Alterações de texto recomendadas:**

- Antes do reinício, pedir para salvar o trabalho e fechar os aplicativos; alterações não salvas podem ser perdidas.
- Trocar “a tela fica azul” por “o computador reinicia e mostra a interface do Diagnóstico de Memória do Windows”.
- Dizer que a duração varia, que o modo Extended demora mais e que não se deve desligar/interromper o teste.
- Após o teste, instruir a entrar no Windows e procurar a notificação; se necessário, buscar `MemoryDiagnostics-Results` no Visualizador de Eventos, aceitando que o caminho/canal pode variar entre instalações. A fonte consultada apresenta também `Application and Services Logs > Microsoft > Windows > MemoryDiagnostics-Results > Debug`. [41]
- Não tratar resultado sem erro como prova definitiva de que a RAM está perfeita.

### 3.13 `taskmgr`

**Conclusão:** Gerenciador de Tarefas, Ctrl+Shift+Esc e observação de CPU, memória, disco, rede e inicialização estão adequados. O uso de “80%” e “100%” é heurístico, não limiar oficial. A documentação consultada não confirmou explicitamente `taskmgr` digitado em Win+R, embora confirme o atalho e o recurso. [29][31][32]

**Alterações de texto recomendadas:**

- Definir repouso: aguardar o fim da inicialização e tarefas visíveis, observar por intervalo consistente e comparar condições equivalentes.
- Trocar “desconfie” com percentuais fixos por “investigue consumo sustentado e o processo responsável; picos transitórios e tarefas legítimas de fundo não provam falha”.
- Não finalizar processos indiscriminadamente.
- Usar “Inicialização”/“Aplicativos de inicialização” conforme a versão/localização.
- Validar `taskmgr` em Windows 10/11 de referência ou manter a ressalva de que essa invocação específica não foi confirmada na documentação citada.

## 4. Conclusões por rota e etapas

### 4.1 Manutenção completa (`completo`) e Computador lento (`lentidao`)

**Ordem atual:**

- `completo`: `p0 → s1 → s2 → s3 → s4 → s5`.
- `lentidao`: `p0 → s1 → s2 → s3 → s5`.

**Somas atuais:**

- `completo`: `3 + 5 + 5 + 5 + 25 + 5 = 48 min`.
- `lentidao`: `3 + 5 + 5 + 5 + 5 = 23 min`.

Essas somas são os minutos declarados por etapa, não tempos medidos nem limites. A rota lenta evita corretamente `s4` (DISM/SFC/DNS), mas ainda contém limpeza e reinicialização variáveis.

**Alterações recomendadas:**

- `p0`: chamar explicitamente de **Ponto de Restauração (System Restore)**, confirmar Proteção do Sistema ativa e manter a distinção de que não é backup. O Windows não ativa necessariamente essa proteção por padrão; o cmdlet também limita a criação a um ponto por 24 horas no cenário documentado. [44][45][46]
- `s1`: remover “menos de 10% causa lentidão extrema”. Pouco espaço pode prejudicar desempenho/atualizações, mas não há limiar universal validado. Tratar CPU/RAM/disco e SMART como sinais de triagem contextual, não diagnóstico. [13][31][37]
- `s2`: renomear para “Revisão de aplicativos de inicialização e serviços” se não for seguir o procedimento completo de clean boot. Se a intenção for clean boot, ocultar serviços Microsoft, desabilitar temporariamente, reiniciar, testar, registrar e restaurar o estado normal. Remover “softwares em segundo plano são a causa nº 1”. [28][32]
- `s3`: trocar “remova gigabytes de lixo que sobrecarregam o índice” por “revise itens para liberar espaço”. Corrigir `guide: 'temp'` para `temp-sys` ou ajustar deliberadamente o vínculo ao ID existente; hoje a referência não distingue o temporário do usuário do temporário do Windows.
- `s4`: corrigir DISM, SFC e DNS conforme as seções anteriores. DISM não exige necessariamente Internet; SFC não corrige apenas DLLs; DNS deve ser condicional a sintoma de resolução. [1][5][25]
- `s5`: manter a preferência por **Reiniciar** para um ciclo de boot completo, pois Fast Startup não se aplica a Restart, mas dizer “quando solicitado ou necessário para aplicar mudanças pendentes e validar”. [47] A comparação de CPU/RAM/disco é verificação, não prova de causalidade.
- Em toda a rota, solicitar consentimento antes de desativar serviços, excluir conteúdo ou reiniciar; indicar como desfazer mudanças.
- Acrescentar nota de suporte: o suporte geral do Windows 10 terminou em 14/10/2025; ESU/LTSC têm condições próprias. Isso é contexto de suporte, não promessa de reparo. [48][53]

### 4.2 Internet instável (`internet`)

**Ordem atual e soma:** `i1 → i2 → i3`; `5 + 8 + 5 = 18 min`.

**Alterações recomendadas:**

- `i1-escopo`: tornar as conclusões probabilísticas. Falha em um aparelho ou em vários delimita a investigação, mas não prova sozinho PC, roteador, provedor, DNS, VPN, conta ou serviço. Testar o mesmo serviço em mais de um dispositivo e mais de um site. [26]
- `i1-fisico`: cabo versus Wi-Fi separa caminhos de conexão, mas não prova que a causa seja apenas sinal ou placa; também considerar ponto de acesso, interferência, configuração e driver.
- `i1-roteador`: avisar que todos os usuários serão desconectados, considerar perda de sessão remota e seguir a sequência: desligar, esperar pelo menos 30 segundos, ligar modem, aguardar estabilização, depois ligar roteador e aguardar alguns minutos. Não usar o botão Reset. [26]
- `i2-ping`: substituir a árvore definitiva. `ping` testa alcance ICMP; resposta a `8.8.8.8` e falha a `google.com` **pode sugerir** DNS, mas não prova a causa; um destino pode bloquear ICMP. Timeout não prova ausência de Internet. Verificar também gateway padrão e navegação/serviço real. [49][50]
- `i2-dns`: restringir a suspeita de cache/resolução DNS.
- `i2-renew`: explicar que `/release` e `/renew` atuam em interfaces DHCP; sem adaptador, `/release` pode interromper várias interfaces elegíveis. Colocar o aviso de acesso remoto antes da execução. [25][26]
- `i2-winsock`: manter como escalonamento condicionado e explicar LSP; a reinicialização deve ocorrer uma vez, no passo `i3-reboot`, apenas se o reset foi executado.
- `i3`: tornar reboot condicional ao reset Winsock ou a outra alteração que o requeira; salvar trabalho e combinar a janela de indisponibilidade.

### 4.3 Tela azul e travamentos (`tela-azul`)

**Ordem atual e soma:** `p0 → b1 → b2 → b3 → b4 → b5`; `3 + 5 + 30 + 25 + 10 + 5 = 78 min`.

**Alterações recomendadas:**

- `b1`: Kernel-Power 41 só registra encerramento/reinício sem encerramento limpo; não aponta sozinho para fonte ou superaquecimento. Correlacionar bugcheck, eventos adjacentes, horário, driver e contexto. [42][51]
- `b2`: salvar trabalho antes de `mdsched`; explicar que o teste é uma hipótese diagnóstica. Remover a proibição absoluta de `/r` em SSD e a dependência de SMART normal; backup precede reparo/varredura de disco. [33][34][41]
- `b2-temp`: HWMonitor e limites térmicos são dependentes do modelo. Usar ferramenta/especificação do fabricante quando possível; diferenciar inspeção externa segura de abertura/limpeza interna.
- `b3`: corrigir Internet/origem WIM e esperar DISM/SFC sem prazo fixo. [1][5][6][7]
- `b4`: respeitar cronologia. Se começou após driver, avaliar rollback; se após Windows Update, consultar histórico e avaliar desinstalação antes de instalar atualizações novas. “Desinstalar programa ou driver” não é uma instrução universal para driver. [10][52]
- `b5`: cinco minutos sem nova falha não confirmam estabilidade quando a falha é rara; registrar conclusão como provisória e orientar acompanhamento.
- Transformar o aviso de backup de `p0` em pré-condição efetiva antes de CHKDSK, remoção de driver/atualização e mudanças de recuperação.
- Informar que, em Windows 10 Home/Pro, o suporte geral terminou; verificar edição, ESU/LTSC e ciclo aplicável antes de prometer atualizações. [48][53]

## 5. Tempos: somas atuais e proposta mais honesta

### 5.1 Somas cadastradas

| Rota | Etapas | Soma nominal atual | Limitação |
|---|---|---:|---|
| Manutenção completa | `p0 + s1 + s2 + s3 + s4 + s5` | **48 min** | `s4` inclui DISM/SFC/DNS; limpeza e reboot também variam. |
| Computador lento | `p0 + s1 + s2 + s3 + s5` | **23 min** | `s3` mistura duas pastas, Prefetch/Cleanmgr e `s5` inclui reboot/validação. |
| Internet instável | `i1 + i2 + i3` | **18 min** | Modem/roteador, DHCP, reboot e recuperação de conexão variam. |
| Tela azul e travamentos | `p0 + b1 + b2 + b3 + b4 + b5` | **78 min** | `b2` inclui mdsched/CHKDSK; `b3` DISM/SFC; `b4` updates/drivers. |

Os dados fornecidos **não permitem decompor honestamente os minutos atuais em trabalho ativo e espera** para as três primeiras rotas. A soma de 78 minutos também não é limite para a rota de tela azul: CHKDSK `/r` pode levar horas em discos grandes, e o próprio material oficial descreve DISM, SFC, mdsched e atualizações como operações de duração variável. [1][4][33][41]

### 5.2 Proposta de apresentação

A interface deve deixar de mostrar somente um total fechado e usar dois campos conceituais:

- **Trabalho ativo estimado:** triagem, explicação/consentimento, seleção de itens, execução de comandos, leitura de resultados, decisões, registro e validação.
- **Espera de máquina/rede:** progresso de DISM/SFC, varredura CHKDSK, Diagnóstico de Memória, download/Windows Update, boot, DHCP, modem/roteador, limpeza de muitos arquivos e reprodução de falha.

Proposta editorial sem inventar uma duração fixa:

| Rota | Trabalho ativo | Espera | Texto recomendado |
|---|---|---|---|
| `completo` | **Não quantificar com os dados atuais**; medir em atendimentos reais. | Variável e possivelmente dominante em `s4` e `s5`; DISM/SFC não têm limite publicado. | “Estimativa nominal cadastrada: 48 min; execução e reinicialização podem acrescentar tempo variável.” |
| `lentidao` | **Não quantificar com os dados atuais**; inspeção e seleção são ativas. | Limpeza, criação de ponto e reboot variam. | “Estimativa nominal: 23 min; o tempo real depende da quantidade de arquivos e do boot.” |
| `internet` | **Não quantificar por comando com os dados atuais**. | Modem/roteador exige pelo menos 30 s desligado, estabilização; DHCP e boot variam. | “Estimativa nominal: 18 min; a rede pode ficar indisponível durante a recuperação.” |
| `tela-azul` | A revisão admite apenas uma referência editorial aproximada de **30–45 min de trabalho ativo**, não medida. | Potencialmente horas: mdsched, CHKDSK `/r`, DISM/SFC, updates, reboots e reprodução. | “78 min são o orçamento nominal das etapas, não prazo; pode exigir acompanhamento posterior.” |

A referência de 30–45 minutos ativos para `tela-azul` deve ser marcada como **estimativa editorial provisória**, não como medição. Para todas as rotas, a solução mais defensável é registrar separadamente, durante os atendimentos, `active_minutes` e `wait_minutes`, além de marcar esperas bloqueantes por etapa. Até haver amostra real, publicar intervalos qualitativos (“variável”, “pode exceder”) é mais honesto que subtrair minutos arbitrários.

Para comandos isolados, não criar duração própria quando ela não existe no cadastro. As únicas referências fornecidas são que `dns` pode ocupar aproximadamente 1–2 minutos de trabalho ativo em um atendimento completo, enquanto `mdsched`, CHKDSK, DISM/SFC e reinicializações devem permanecer sem ETA fixo. Esses valores não devem ser somados novamente às rotas.

## 6. Riscos graves versus ressalvas editoriais

### Riscos graves ou que exigem bloqueio/consentimento

- **`revert` no modo online:** risco de aplicar a opção no contexto errado e alterar o servicing de forma inadequada. Bloquear execução em Windows normal. [9]
- **Reparos de disco sem backup:** CHKDSK pode alterar o estado do sistema de arquivos e, em disco com setores problemáticos, dados antes acessíveis podem ficar inacessíveis. Backup/recuperação vem antes de reparo quando há suspeita de falha. [34][35]
- **Exclusão de dados pessoais ou de recuperação:** `Shift+Delete`, Lixeira, Downloads e `Windows.old` devem exigir revisão/autorização; Windows.old pode conter arquivos pessoais e sua remoção retira a reversão. [13][16][22][23]
- **Alteração de serviços/inicialização:** desativar itens sem registro, teste e plano de retorno pode retirar funções de segurança, VPN, atualização, fabricante ou instalador. [28]
- **Indisponibilidade e perda de sessão:** reboot do PC, teste de memória, CHKDSK agendado, modem/roteador e `ipconfig /release` podem interromper o cliente ou um atendimento remoto. [25][26][41]
- **Alteração de servicing por DISM:** é manutenção privilegiada; confirmar origem compatível, versão e consentimento, sem prometer segurança absoluta. [5][6]

### Ressalvas editoriais ou de evidência

- `sfc` usar “cópia em cache” em vez de WinSxS como fonte invariável.
- `dns` limpar/esvaziar, não “renovar”; não prometer resolver lentidão genérica.
- Percentuais de RAM/disco e limite de 10% livre são heurísticas, não limiares oficiais.
- `taskmgr` via Win+R não foi explicitamente confirmado nas fontes consultadas.
- Prefetch não tem base oficial atual suficiente para limpeza excepcional no Windows 10/11.
- `temp` sem `%` não foi confirmado como atalho universal para `C:\Windows\Temp`.
- A previsão específica de `INACCESSIBLE_BOOT_DEVICE` por limitar processadores não foi sustentada.
- HWMonitor, CrystalDiskInfo, exemplos Adobe/Google Update e efeitos em VPN/antivírus dependem de modelo/produto e não devem ser tratados como regras universais.
- Q&A comunitário e a fonte legada de SysMain/Windows 7 são evidência limitada; não devem ser apresentados como documentação normativa atual.

## 7. Itens sem fonte específica ou com incerteza preservada

- Não foi localizada fonte Microsoft atual que confirme o uso de `temp` sem sinais de porcentagem como atalho confiável para `%windir%\Temp`.
- Não foi localizada documentação Microsoft atual específica de Windows 10/11 que sustente a descrição detalhada de Prefetch ou recomende apagá-lo nos casos indicados.
- Não foi localizada fonte oficial que confirme a invocação `taskmgr` pelo Win+R; o atalho Ctrl+Shift+Esc e as funções do Gerenciador foram confirmados.
- Não foi localizada fonte oficial que sustente `INACCESSIBLE_BOOT_DEVICE` como consequência específica de marcar “Número de processadores” ou desmarcar a ocultação de serviços Microsoft.
- Não há ferramenta SMART universal validada para qualquer fabricante; CrystalDiskInfo foi tratado como triagem de terceiro, com encaminhamento ao fabricante conforme modelo.
- Não há limiar oficial universal de 10% de espaço livre, RAM acima de 80% ou disco próximo de 100% como diagnóstico de falha.
- Não há duração oficial fixa para SFC, DISM, CHKDSK, Diagnóstico de Memória, limpeza ou reinicialização. A descrição “vários minutos” não é uma garantia.
- A orientação de reiniciar após “reparo pendente” no SFC foi considerada plausível operacionalmente, mas não foi validada por uma instrução primária atual específica nas fontes consultadas.

## 8. Status final

- **Itens revisados:** 17.
- **Itens com `correto_com_ressalvas`:** 3 — `sfc`, `dns`, `taskmgr`.
- **Itens com `requer_correcao`:** 14 — `dism`, `revert`, `temp-user`, `temp-sys`, `prefetch`, `cleanmgr`, `msconfig`, `chkdsk`, `chkdsk-ssd`, `winsock`, `mdsched`, `route-maintenance`, `route-internet`, `route-bsod`.
- **Falhas de coleta:** nenhuma.
- **Código do projeto alterado:** não.
- **Comandos executados em Windows:** não.

## References

[1] Microsoft Support, “Use the System File Checker tool to repair missing or corrupted system files”. https://support.microsoft.com/en-us/windows/experience/backup-recovery/use-the-system-file-checker-tool-to-repair-missing-or-corrupted-system-files

[2] Microsoft Learn, “sfc”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sfc

[3] Microsoft Learn, “Description of System File Checker (Sfc.exe)”. https://learn.microsoft.com/en-us/troubleshoot/windows-server/installing-updates-features-roles/system-file-checker

[4] Microsoft Learn, “DISM Operating System Package Servicing Command-Line Options”. https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/dism-operating-system-package-servicing-command-line-options?view=windows-11

[5] Microsoft Learn, “Repair a Windows Image”. https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/repair-a-windows-image?view=windows-11

[6] Microsoft Learn, “Configure a Windows Repair Source”. https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/configure-a-windows-repair-source?view=windows-11

[7] Microsoft Learn, “Take Inventory of an Image or Component Using DISM”. https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/take-inventory-of-an-image-or-component-using-dism?view=windows-11

[8] Microsoft Learn, “Fix Windows Update corruption and installation failures”. https://learn.microsoft.com/en-us/troubleshoot/windows-server/installing-updates-features-roles/fix-windows-update-errors

[9] Microsoft Learn, “DISM Operating System Package Servicing Command-Line Options” — `/RevertPendingActions`. https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/dism-operating-system-package-servicing-command-line-options?view=windows-11

[10] Microsoft Support, “How to uninstall a Windows Update”. https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/how-to-uninstall-a-windows-update

[11] Microsoft Support, “Windows Recovery Environment”. https://support.microsoft.com/en-us/windows/windows-recovery-environment-0eb14733-6301-41cb-8d26-06a12b42770b

[12] Microsoft Learn, “Recognized environment variables”. https://learn.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables

[13] Microsoft Support, “Free up drive space in Windows”. https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/free-up-drive-space-in-windows

[14] Microsoft Support, “Manage drive space with Storage Sense”. https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/manage-drive-space-with-storage-sense

[15] Microsoft Support, “Why does Clipchamp store temporary files on my computer?”. https://support.microsoft.com/en-us/clipchamp/why-does-clipchamp-store-temporary-files-on-my-computer

[16] Microsoft Support, “Windows File Recovery”. https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery

[17] Microsoft Learn Q&A, “By Pass recycle bin when delete file”. https://learn.microsoft.com/en-us/answers/questions/5248514/by-pass-recycle-bin-when-delete-file

[18] Microsoft Support, “Storage settings in Windows”. https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/storage-settings-in-windows

[19] Microsoft Learn, “How User Account Control works”. https://learn.microsoft.com/en-us/windows/security/application-security/application-control/user-account-control/how-it-works

[20] Microsoft Learn, “SuperFetch (SysMain) service spikes CPU”. https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/superfetch-sysmain-service-spikes-cpu

[21] Microsoft Learn Q&A, “Is it okay to delete prefetch files to save storage?”. https://learn.microsoft.com/en-us/answers/questions/4173323/is-it-okay-to-delete-prefetch-files-to-save-storag

[22] Microsoft Support, “Delete your previous version of Windows”. https://support.microsoft.com/en-us/windows/deployment/install-upgrade/delete-your-previous-version-of-windows

[23] Microsoft Support, “Retrieve files from the Windows.old folder after a Windows upgrade”. https://support.microsoft.com/en-us/windows/deployment/install-upgrade/retrieve-files-from-the-windows-old-folder-after-a-windows-upgrade

[24] Microsoft Learn, “Storage Sense”. https://learn.microsoft.com/en-us/windows/configuration/storage/storage-sense

[25] Microsoft Learn, “ipconfig”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig

[26] Microsoft Support, “Fix Wi-Fi connection issues in Windows”. https://support.microsoft.com/en-us/windows/experience/connectivity-networking/fix-wi-fi-connection-issues-in-windows

[27] Microsoft Learn, “Clear-DnsClientCache (DnsClient)”. https://learn.microsoft.com/en-us/powershell/module/dnsclient/clear-dnsclientcache?view=windowsserver2025-ps

[28] Microsoft Support, “How to perform a clean boot in Windows”. https://support.microsoft.com/en-us/windows/experience/startup-boot/how-to-perform-a-clean-boot-in-windows

[29] Microsoft Support, “System configuration tools in Windows”. https://support.microsoft.com/en-us/windows/experience/system-configuration-tools-in-windows

[30] Microsoft Learn, “BCDEdit /set”. https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/bcdedit--set

[31] Microsoft Support, “Tips to improve PC performance in Windows”. https://support.microsoft.com/en-us/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows

[32] Microsoft Support, “Configure Startup applications in Windows”. https://support.microsoft.com/en-us/windows/experience/startup-boot/configure-startup-applications-in-windows

[33] Microsoft Learn, “chkdsk”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chkdsk

[34] Seagate Support, “Seagate USB External drive diagnostics”. https://www.seagate.com/support/kb/seagate-usb-external-drive-diagnostics-006153en/

[35] Seagate Support, “What do I do if my drive reports bad sectors?”. https://www.seagate.com/support/kb/what-do-i-do-if-my-drive-reports-bad-sectors-196351en/

[36] Seagate Support, “My system reported a S.M.A.R.T. error on the drive”. https://www.seagate.com/support/kb/my-system-reported-a-smart-error-on-the-drive-184619en/

[37] Microsoft Support, “What to do about a critical warning for a storage device”. https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/what-to-do-about-a-critical-warning-for-a-storage-device

[38] Microsoft Learn, “netsh winsock”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-winsock

[39] Microsoft Learn, “netsh”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh

[40] Microsoft Support, “Fix Ethernet connection problems in Windows”. https://support.microsoft.com/en-us/windows/experience/connectivity-networking/fix-ethernet-connection-problems-in-windows

[41] Microsoft Support, “How to fix Error 0xA: IRQL_not_less_or_equal”. https://support.microsoft.com/en-us/windows/experience/performance-optimization/how-to-fix-error-0xa-irql-not-less-or-equal

[42] Microsoft Support, “Troubleshooting Windows unexpected restarts and stop code errors”. https://support.microsoft.com/en-us/windows/experience/performance-optimization/troubleshooting-windows-unexpected-restarts-and-stop-code-errors

[43] Microsoft Support, “Keyboard shortcuts in Windows”. https://support.microsoft.com/en-us/accessibility/windows/keyboard-shortcuts-in-windows

[44] Microsoft Support, “System Protection”. https://support.microsoft.com/en-us/windows/experience/backup-recovery/system-protection

[45] Microsoft Support, “Recovery options in Windows”. https://support.microsoft.com/en-us/windows/experience/backup-recovery/recovery-options-in-windows

[46] Microsoft Learn, “Checkpoint-Computer”. https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/checkpoint-computer?view=powershell-7.5

[47] Microsoft Learn, “Fast startup causes hibernation or shutdown to fail in Windows 10”. https://learn.microsoft.com/en-us/troubleshoot/windows-client/setup-upgrade-and-drivers/fast-startup-causes-system-hibernation-shutdown-fail

[48] Microsoft Support, “Windows 10 support has ended on October 14, 2025”. https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/windows-10-support-has-ended-on-october-14-2025

[49] Microsoft Learn, “ping”. https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping

[50] Microsoft Learn, “Troubleshoot TCP/IP communication”. https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-tcp-ip-communication-guidance

[51] Microsoft Learn, “Event ID 41: The system has rebooted without cleanly shutting down first”. https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/event-id-41-restart

[52] Microsoft Support, “Update drivers through Device Manager in Windows”. https://support.microsoft.com/en-us/windows/update-drivers-through-device-manager-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6

[53] Microsoft Learn, “Windows 10 Home and Pro lifecycle”. https://learn.microsoft.com/en-us/lifecycle/products/windows-10-home-and-pro

[54] Crucial, “Storage Executive”. https://www.crucial.com/support/storage-executive

[55] Samsung, “Magician Software”. https://www.samsung.com/us/memory-storage/magician-software/

[56] Microsoft, “How to delete temporary files”. https://www.microsoft.com/en-us/windows/learning-center/how-to-delete-temporary-files
