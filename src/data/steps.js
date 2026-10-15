// ÂNCORA: banco de etapas do roteiro. As rotas (routes.js) escolhem quais etapas usar e em que ordem.
// Cada item vira uma caixa de marcar com progresso salvo. O id do item precisa ser único em TODO o arquivo.
// Dentro de "text", o que estiver entre crases (`assim`) é exibido como código.
// "report" é a frase curta, em linguagem de cliente, que entra no relatório do WhatsApp.
// Use report: null para um item que não deve aparecer no relatório.
// "minutes" = tempo estimado da etapa. "guide" (no item) = termo buscado no Guia de Comandos pelo botão "Ver no Guia".
export const allSteps = [
  // ===== Segurança antes de mexer =====
  {
    id: 'p0',
    minutes: 3,
    phase: 'Segurança',
    title: 'Ponto de Restauração e Aviso ao Cliente',
    intro: 'Crie um caminho de volta antes de alterar qualquer coisa. Se algo der errado, o sistema pode ser desfeito.',
    items: [
      { id: 'p0-restauracao', lead: 'Criar Ponto de Restauração:', text: 'Abra o PowerShell como administrador e execute `Checkpoint-Computer -Description "Antes do atendimento" -RestorePointType MODIFY_SETTINGS`. Se der erro de proteção desativada, abra `SystemPropertiesProtection`, ative a proteção do disco (C:) e repita.', report: 'Criação de ponto de restauração antes das alterações' },
      { id: 'p0-aviso', lead: 'Avisar sobre Arquivos Importantes:', text: 'Pergunte ao cliente se há arquivos importantes sem cópia (Documentos, Área de Trabalho, Downloads) e combine o que fazer antes de continuar.', report: null }
    ],
    tip: 'O Windows limita a 1 ponto de restauração a cada 24 horas por padrão. Se o comando avisar isso, já existe um recente e você pode seguir.'
  },
  // ===== Manutenção geral e lentidão =====
  {
    id: 's1',
    minutes: 5,
    phase: 'Primordial',
    title: 'Triagem Inicial & Diagnóstico do Hardware',
    intro: 'Antes de alterar qualquer configuração de software, entenda o estado do hardware da máquina do cliente.',
    items: [
      { id: 's1-armazenamento', lead: 'Verificar Armazenamento:', text: 'Confira em "Este Computador" se o disco (C:) é SSD ou HD mecânico e o espaço livre (menos de 10% livre causa lentidão extrema).', report: 'Verificação do disco e do espaço livre' },
      { id: 's1-ram-cpu', guide: 'taskmgr', lead: 'Verificar Memória RAM & CPU:', text: 'Abra o Gerenciador de Tarefas com `Ctrl + Shift + Esc` e analise o uso de CPU, RAM e Disco em repouso.', report: 'Análise do uso de processador, memória e disco' },
      { id: 's1-smart', lead: 'Saúde do Disco (S.M.A.R.T.):', text: 'Se o disco estiver em 100% constante, verifique a saúde com uma ferramenta leve como o CrystalDiskInfo. Não adianta otimizar o software se o disco estiver danificado.', report: 'Verificação da saúde do disco (S.M.A.R.T.)' }
    ],
    tip: 'Se o cliente usa HD mecânico como disco do sistema, recomende a migração para SSD como prioridade máxima de upgrade.'
  },
  {
    id: 's2',
    minutes: 5,
    phase: 'Inicialização & Processos',
    title: 'Limpeza de Inicialização (Boot Limpo)',
    intro: 'Softwares em segundo plano são a causa nº 1 de lentidão após ligar o sistema.',
    items: [
      { id: 's2-apps', lead: 'Aplicativos de Inicialização:', text: 'No Gerenciador de Tarefas, aba "Aplicativos de inicialização", desative programas pesados que não precisam abrir com o Windows (ex.: Spotify, Steam, Discord, Teams).', report: 'Desativação de programas desnecessários na inicialização' },
      { id: 's2-servicos', guide: 'msconfig', lead: 'Serviços de Terceiros:', text: 'Execute `msconfig`, vá em "Serviços", marque obrigatoriamente "Ocultar todos os serviços Microsoft" e desative atualizadores desnecessários (ex.: Adobe, Google Update).', report: 'Revisão dos serviços de terceiros na inicialização' }
    ]
  },
  {
    id: 's3',
    minutes: 5,
    phase: 'Limpeza de Arquivos Residuais',
    title: 'Liberação de Espaço e Arquivos Temporários',
    intro: 'Remova gigabytes de lixo eletrônico que sobrecarregam o índice de busca e o disco.',
    items: [
      { id: 's3-pastas', guide: 'temp', lead: 'Pastas Temporárias:', text: 'Acesse via `Win + R` as pastas `%temp%`, `temp` e `prefetch` e elimine os dados antigos.', report: 'Limpeza de arquivos temporários' },
      { id: 's3-cleanmgr', guide: 'cleanmgr', lead: 'Limpeza de Disco Integrada:', text: 'Execute `cleanmgr` como administrador para remover itens da lixeira, relatórios de erro e cópias antigas do Windows Update.', report: 'Limpeza de disco (lixeira, relatórios de erro e atualizações antigas)' }
    ]
  },
  {
    id: 's4',
    minutes: 25,
    phase: 'Integridade do Sistema',
    title: 'Verificação e Correção de Sistema Corrompido',
    intro: 'Garanta que o sistema operacional está estável antes de finalizar o atendimento.',
    items: [
      { id: 's4-dism', guide: 'dism', lead: 'Reparo de Imagem:', text: 'Se houver falhas recorrentes, rode `dism /online /cleanup-image /restorehealth` no CMD como administrador.', report: 'Reparo da imagem do Windows (DISM)' },
      { id: 's4-sfc', guide: 'sfc', lead: 'Verificação de Integridade:', text: 'Execute `sfc /scannow` no CMD como administrador para corrigir DLLs e arquivos danificados.', report: 'Verificação e reparo dos arquivos do sistema (SFC)' },
      { id: 's4-dns', guide: 'dns', lead: 'Rede e Navegação:', text: 'Execute `ipconfig /flushdns` para limpar o cache DNS e evitar lentidão no navegador.', report: 'Limpeza do cache de rede (DNS)' }
    ]
  },
  {
    id: 's5',
    minutes: 5,
    phase: 'Validação & Encerramento',
    title: 'Reboot e Teste Final',
    intro: 'Confirme a melhoria e entregue a máquina pronta ao cliente.',
    items: [
      { id: 's5-reboot', lead: 'Reinicialização Completa:', text: 'Reinicie o sistema para consolidar os arquivos reparados e as alterações feitas.', report: 'Reinicialização do computador' },
      { id: 's5-validacao', lead: 'Validação dos Resultados:', text: 'Abra o Gerenciador de Tarefas e confirme se o uso de CPU, RAM e Disco baixou em repouso.', report: 'Teste final de desempenho' },
      { id: 's5-relatorio', lead: 'Relatório ao Cliente:', text: 'Informe brevemente as ações realizadas (arquivos limpos, inicialização otimizada e correções de sistema).', report: null }
    ]
  },

  // ===== Internet instável =====
  {
    id: 'i1',
    minutes: 5,
    phase: 'Triagem da Conexão',
    title: 'Descobrir Onde Está o Problema',
    intro: 'Antes de mexer no Windows, descubra se a falha é do computador, do roteador ou do provedor.',
    items: [
      { id: 'i1-escopo', lead: 'Isolar o problema:', text: 'Teste outro aparelho na mesma rede e outro site no mesmo computador. Se só este computador falha, o problema está nele; se todos falham, está na rede.', report: 'Teste para identificar se a falha era do computador ou da rede' },
      { id: 'i1-fisico', lead: 'Conferir o básico:', text: 'Veja se o cabo está firme, se o Wi-Fi está ligado (modo avião desativado) e se o sinal está forte o bastante.', report: 'Conferência de cabo, Wi-Fi e intensidade do sinal' },
      { id: 'i1-roteador', lead: 'Reiniciar roteador e modem:', text: 'Desligue da tomada por cerca de 30 segundos, religue e aguarde as luzes estabilizarem antes de testar de novo.', report: 'Reinício do roteador e do modem' }
    ],
    tip: 'Se vários aparelhos continuam sem internet depois de reiniciar o roteador, peça ao cliente para acionar o provedor.'
  },
  {
    id: 'i2',
    minutes: 8,
    phase: 'Rede no Windows',
    title: 'Renovar a Configuração de Rede',
    intro: 'Estes comandos limpam e renovam a configuração de rede do Windows. Execute no CMD como administrador.',
    items: [
      { id: 'i2-ping', lead: 'Testar a conexão:', text: 'Execute `ping 8.8.8.8`. Se responde, mas `ping google.com` falha, o problema é de DNS. Se nenhum responde, a conexão com a internet está fora.', report: 'Teste de conexão e de DNS (ping)' },
      { id: 'i2-dns', guide: 'dns', lead: 'Limpar o cache DNS:', text: 'Execute `ipconfig /flushdns`.', report: 'Limpeza do cache de rede (DNS)' },
      { id: 'i2-renew', lead: 'Renovar o endereço IP:', text: 'Execute `ipconfig /release` e depois `ipconfig /renew`.', report: 'Renovação do endereço IP' },
      { id: 'i2-winsock', guide: 'winsock', lead: 'Redefinir o Winsock:', text: 'Execute `netsh winsock reset` e reinicie o computador em seguida.', report: 'Redefinição da pilha de rede (Winsock)' }
    ],
    tip: 'Em atendimento remoto, `ipconfig /release` derruba a conexão e pode encerrar o acesso remoto. Avise o cliente e rode os dois juntos: `ipconfig /release & ipconfig /renew`.'
  },
  {
    id: 'i3',
    minutes: 5,
    phase: 'Validação & Encerramento',
    title: 'Teste da Navegação',
    intro: 'Confirme que a conexão voltou ao normal antes de encerrar.',
    items: [
      { id: 'i3-reboot', lead: 'Reiniciar o computador:', text: 'É necessário depois do reset do Winsock.', report: 'Reinicialização do computador' },
      { id: 'i3-teste', lead: 'Testar a navegação:', text: 'Abra dois sites diferentes, se possível em dois navegadores, e confira se o Wi-Fi mantém o sinal estável.', report: 'Teste final de navegação' },
      { id: 'i3-relatorio', lead: 'Relatório ao Cliente:', text: 'Informe o que foi feito e oriente: se a falha voltar em vários aparelhos, o provedor deve ser acionado.', report: null }
    ]
  },

  // ===== Tela azul e travamentos =====
  {
    id: 'b1',
    minutes: 5,
    phase: 'Coleta de Informações',
    title: 'Entender a Tela Azul',
    intro: 'O código de parada e o momento em que o problema começou apontam a causa mais provável.',
    items: [
      { id: 'b1-codigo', lead: 'Anotar o código de parada:', text: 'Peça ao cliente uma foto ou o texto da tela azul (ex.: `IRQL_NOT_LESS_OR_EQUAL`, `CRITICAL_PROCESS_DIED`).', report: 'Registro do código de erro da tela azul' },
      { id: 'b1-quando', lead: 'Perguntar quando começou:', text: 'Foi depois de atualização, instalação de programa ou driver, ou troca de peça? Isso costuma indicar o culpado.', report: 'Levantamento de quando os travamentos começaram' },
      { id: 'b1-eventos', lead: 'Consultar o Visualizador de Eventos:', text: 'Execute `eventvwr`, abra "Logs do Windows" > "Sistema" e procure erros críticos próximos da hora do travamento.', report: 'Análise do Visualizador de Eventos do Windows' }
    ]
  },
  {
    id: 'b2',
    minutes: 30,
    phase: 'Hardware',
    title: 'Testar Memória e Disco',
    intro: 'Memória RAM e disco com defeito são causas comuns de tela azul.',
    items: [
      { id: 'b2-ram', guide: 'mdsched', lead: 'Memória RAM:', text: 'Execute `mdsched` e escolha reiniciar agora. O teste roda antes do Windows iniciar e o resultado aparece depois do boot.', report: 'Teste da memória RAM (Diagnóstico de Memória do Windows)' },
      { id: 'b2-disco', guide: 'chkdsk', lead: 'Disco:', text: 'Execute `chkdsk C: /f /r` no CMD como administrador e aceite agendar para o próximo reinício. Em HD mecânico pode demorar bastante.', report: 'Verificação de erros no disco (CHKDSK)' },
      { id: 'b2-temp', lead: 'Temperatura:', text: 'Se a tela azul aparece em tarefas pesadas, acompanhe a temperatura com um monitor leve (ex.: HWMonitor) e peça ao cliente para conferir poeira nas saídas de ar.', report: 'Verificação de temperatura e ventilação' }
    ],
    tip: 'O teste de memória exige reiniciar o computador. Avise o cliente antes: durante o teste a máquina não pode ser usada.'
  },
  {
    id: 'b3',
    minutes: 25,
    phase: 'Integridade do Sistema',
    title: 'Reparar os Arquivos do Windows',
    intro: 'Arquivos de sistema corrompidos também provocam travamentos. Execute no CMD como administrador.',
    items: [
      { id: 'b3-dism', guide: 'dism', lead: 'Reparo de Imagem:', text: 'Execute `dism /online /cleanup-image /restorehealth`. Requer conexão com a Internet.', report: 'Reparo da imagem do Windows (DISM)' },
      { id: 'b3-sfc', guide: 'sfc', lead: 'Verificação de Integridade:', text: 'Depois do DISM, execute `sfc /scannow`.', report: 'Verificação e reparo dos arquivos do sistema (SFC)' }
    ]
  },
  {
    id: 'b4',
    minutes: 10,
    phase: 'Drivers & Programas',
    title: 'Remover o Que Causa o Travamento',
    intro: 'Drivers e programas recentes estão entre os principais suspeitos.',
    items: [
      { id: 'b4-programa', lead: 'Desfazer a última mudança:', text: 'Desinstale o programa ou driver instalado pouco antes das telas azuis (Configurações > Aplicativos).', report: 'Remoção do programa ou driver suspeito' },
      { id: 'b4-drivers', lead: 'Atualizar drivers:', text: 'Atualize vídeo e chipset pelo site do fabricante do computador ou da placa. Evite programas "atualizadores de driver".', report: 'Atualização dos drivers de vídeo e chipset' },
      { id: 'b4-update', lead: 'Windows Update:', text: 'Instale as atualizações pendentes do Windows e reinicie.', report: 'Instalação das atualizações do Windows' }
    ],
    tip: 'Se a tela azul persistir mesmo depois disso, suspeite de hardware (RAM, disco ou fonte) e recomende uma avaliação presencial.'
  },
  {
    id: 'b5',
    minutes: 5,
    phase: 'Validação & Encerramento',
    title: 'Acompanhar a Estabilidade',
    intro: 'Confirme que o computador aguenta o uso normal antes de encerrar.',
    items: [
      { id: 'b5-reboot', lead: 'Reinicialização e teste:', text: 'Reinicie e use o computador por alguns minutos com as tarefas que causavam o problema.', report: 'Reinicialização e teste de estabilidade' },
      { id: 'b5-relatorio', lead: 'Relatório ao Cliente:', text: 'Explique o que foi encontrado e combine de o cliente avisar se a tela azul voltar, anotando o novo código.', report: null }
    ]
  }
]
