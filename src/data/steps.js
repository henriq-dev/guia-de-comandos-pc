// ÂNCORA: banco de etapas do roteiro. As rotas (routes.js) escolhem quais etapas usar e em que ordem.
// Cada item vira uma caixa de marcar com progresso salvo. O id do item precisa ser único em TODO o arquivo.
// Dentro de "text", o que estiver entre crases (`assim`) é exibido como código.
// "report" é a frase curta, em linguagem de cliente, que entra no relatório do WhatsApp.
// Use report: null para um item que não deve aparecer no relatório.
// "minutes" = estimativa nominal da etapa, não prazo; "guide" busca o comando no Guia.
export const allSteps = [
  // ===== Segurança antes de mexer =====
  {
    id: 'p0',
    minutes: 3,
    phase: 'Segurança',
    title: 'Ponto de Restauração do Sistema e Aviso ao Cliente',
    intro: 'Crie um ponto de retorno para configurações do sistema quando a Proteção do Sistema estiver ativa. Isso não substitui backup dos arquivos do cliente.',
    items: [
      { id: 'p0-restauracao', lead: 'Criar Ponto de Restauração:', text: 'Com autorização do cliente, abra o PowerShell como administrador e execute `Checkpoint-Computer -Description "Antes do atendimento" -RestorePointType MODIFY_SETTINGS`. Confirme que a Proteção do Sistema está ativa no volume; se estiver desativada, o comando falha. O ponto de restauração protege configurações/arquivos do sistema, não arquivos pessoais.', report: 'Criação de ponto de restauração antes das alterações' },
      { id: 'p0-aviso', lead: 'Confirmar Backup de Arquivos Importantes:', text: 'Pergunte se Documentos, Fotos, Downloads e Área de Trabalho importantes têm cópia de segurança. Faça ou combine o backup antes de CHKDSK, remoção de drivers/atualizações ou outras mudanças de recuperação; não continue com reparo de disco sob suspeita de falha sem priorizar os dados.', report: null }
    ],
    tip: 'A Proteção do Sistema pode não estar ativada por padrão e o Windows limita a criação a um ponto por 24 horas no cenário documentado. System Restore não é backup nem repara falha física do disco.'
  },
  // ===== Manutenção geral e lentidão =====
  {
    id: 's1',
    minutes: 5,
    phase: 'Diagnóstico Inicial',
    title: 'Triagem Inicial e Diagnóstico do Hardware',
    intro: 'Observe o estado do computador antes de alterar configurações; sinais isolados não confirmam a causa.',
    items: [
      { id: 's1-armazenamento', lead: 'Verificar Armazenamento:', text: 'Confira em “Este Computador” se o disco (C:) é SSD ou HD e quanto espaço livre há. Pouco espaço pode afetar desempenho ou atualizações, mas não existe um limite universal de 10% que diagnostique lentidão.', report: 'Verificação do disco e do espaço livre' },
      { id: 's1-ram-cpu', guide: 'taskmgr', lead: 'Verificar Memória RAM e CPU:', text: 'Abra o Gerenciador de Tarefas com `Ctrl + Shift + Esc`. Aguarde a inicialização e tarefas visíveis terminarem; observe CPU, RAM e Disco por um intervalo consistente. Registre valores sustentados e o processo responsável para comparar depois; percentuais altos são sinais de investigação, não diagnóstico automático.', report: 'Análise do uso de processador, memória e disco' },
      { id: 's1-smart', lead: 'Triagem da Saúde do Disco (S.M.A.R.T.):', text: 'Se disponível, consulte a ferramenta oficial do fabricante compatível com o modelo; CrystalDiskInfo é uma opção de terceiro, não uma garantia. Alerta, erros de leitura/I/O, ruídos ou disco desaparecendo: priorize backup/recuperação e diagnóstico do fabricante. Um status normal não prova saúde perfeita. Faça backup verificado antes de qualquer CHKDSK.', report: 'Triagem da saúde do disco (S.M.A.R.T.)' }
    ],
    tip: 'Se o sistema usa HD mecânico, uma migração para SSD pode ser considerada conforme compatibilidade, orçamento e autorização do cliente; não é diagnóstico nem obrigação do atendimento.'
  },
  {
    id: 's2',
    minutes: 5,
    phase: 'Inicialização e Processos',
    title: 'Revisão de Aplicativos de Inicialização e Serviços',
    intro: 'Observe quais itens iniciam com o Windows e altere somente o que foi identificado como dispensável.',
    items: [
      { id: 's2-apps', lead: 'Aplicativos de Inicialização:', text: 'No Gerenciador de Tarefas, abra “Aplicativos de inicialização” (o nome pode variar por versão/localização). Desative apenas aplicativos confirmados como não necessários e registre o estado anterior para poder reverter. Não desative antivírus, drivers ou utilitários do fabricante sem verificar sua função. Desativar impede a inicialização automática; não remove o programa.', report: 'Revisão de aplicativos de inicialização' },
      { id: 's2-servicos', guide: 'msconfig', lead: 'Serviços de Terceiros (somente se investigar conflito):', text: 'Não desative serviços como rotina genérica de otimização. Para um diagnóstico de inicialização limpa, siga o procedimento completo: sessão administrativa, ocultar serviços Microsoft, registrar alterações, desativar temporariamente, reiniciar/testar e restaurar a inicialização normal. Serviços de terceiros também podem ser necessários; se não puder completar e reverter o teste, não os altere.', report: 'Revisão controlada de serviços de terceiros' }
    ],
    tip: 'Não limite “Número de processadores” em Opções avançadas para acelerar o PC: isso restringe os processadores disponíveis e requer reinicialização; não é uma otimização.'
  },
  {
    id: 's3',
    minutes: 5,
    phase: 'Liberação de Espaço',
    title: 'Revisão de Arquivos Temporários',
    intro: 'Revise itens para liberar espaço quando necessário; não há promessa de recuperar gigabytes nem de acelerar a indexação.',
    items: [
      { id: 's3-pastas', guide: 'windir', lead: 'Pastas Temporárias:', text: 'Prefira Configurações > Sistema > Armazenamento > Arquivos temporários/Recomendações de limpeza e revise as categorias. Se a limpeza manual for necessária, confirme os destinos: `%temp%` é a pasta temporária da conta atual e `%windir%\\Temp` é o caminho típico do Windows. Salve o trabalho, feche aplicativos e instalações/atualizações, remova somente itens conhecidos e ignore os bloqueados. Não apague Prefetch como rotina nem como correção presumida de malware/falha de aplicativo.', report: 'Revisão de arquivos temporários' },
      { id: 's3-cleanmgr', guide: 'cleanmgr', lead: 'Limpeza de Disco Integrada:', text: 'Abra `cleanmgr`, confira o volume e marque somente categorias revisadas e autorizadas. Revise Downloads e Lixeira antes de remover. Para Windows.old, confirme que arquivos pessoais foram copiados e que a reversão não será necessária; sua remoção pode ser irreversível. Eleve privilégios apenas se o Windows solicitar para itens de sistema.', report: 'Limpeza de disco após revisão de categorias' }
    ]
  },
  {
    id: 's4',
    minutes: 25,
    phase: 'Integridade do Sistema',
    title: 'Reparos do Windows (Quando Indicados)',
    intro: 'Execute reparos quando houver sintomas que os justifiquem, não como etapa automática de otimização; os tempos de execução podem variar.',
    items: [
      { id: 's4-dism', guide: 'dism', lead: 'Reparo de Imagem:', text: 'Se houver falhas recorrentes compatíveis, execute `dism /online /cleanup-image /restorehealth` no CMD como administrador e aguarde a conclusão. Windows Update é a origem padrão quando permitido; uma origem local ou de rede compatível também pode ser usada. Não há prazo fixo. Para mídia, confira o índice e a compatibilidade da origem no Guia.', report: 'Reparo da imagem do Windows (DISM)' },
      { id: 's4-sfc', guide: 'sfc', lead: 'Verificação de Integridade:', text: 'Depois do DISM, execute `sfc /scannow` no CMD como administrador e aguarde até 100%. O SFC verifica arquivos protegidos do Windows, não apenas DLLs; se algo não for reparado, consulte o resultado e `%WinDir%\\Logs\\CBS\\CBS.log`.', report: 'Verificação e reparo dos arquivos do sistema (SFC)' },
      { id: 's4-dns', guide: 'dns', lead: 'Cache DNS (Opcional):', text: 'Somente se houver sintoma de resolução de nomes (por exemplo, domínio desatualizado ou falha em nomes específicos), execute `ipconfig /flushdns`. Isso limpa o cache DNS local; não é otimizador genérico de navegador nem etapa obrigatória de integridade. Não precisa reiniciar.', report: 'Limpeza do cache DNS local, quando indicada' }
    ]
  },
  {
    id: 's5',
    minutes: 5,
    phase: 'Validação e Encerramento',
    title: 'Reinicialização e Teste Final',
    intro: 'Aplique reinicializações quando a operação solicitar ou quando forem necessárias para validar alterações pendentes.',
    items: [
      { id: 's5-reboot', lead: 'Reinicialização (se necessária):', text: 'Salve o trabalho e combine a indisponibilidade. Quando uma operação pedir reinício ou for preciso validar um ciclo completo, use “Reiniciar”; “Desligar” pode usar Inicialização Rápida. Nem todo reparo exige reinicialização.', report: 'Reinicialização do computador quando necessária' },
      { id: 's5-validacao', lead: 'Validação dos Resultados:', text: 'Se fizer sentido, compare CPU, RAM, Disco e navegação sob condições semelhantes às da triagem. A comparação é uma observação, não prova de que uma ação específica causou melhora. Se o uso alto persistir, investigue o processo/sintoma e não prometa solução.', report: 'Teste final de desempenho' },
      { id: 's5-relatorio', lead: 'Relatório ao Cliente:', text: 'Informe as ações realizadas, o que foi observado e o que ainda não foi confirmado. Diga o que observar nos próximos dias e recomende manter backup dos arquivos importantes.', report: null }
    ]
  },

  // ===== Internet instável =====
  {
    id: 'i1',
    minutes: 5,
    phase: 'Triagem da Conexão',
    title: 'Delimitar a Falha de Conexão',
    intro: 'Os testes delimitam a investigação, mas não identificam sozinhos a causa (PC, Wi-Fi, roteador, provedor, serviço, VPN ou conta).',
    items: [
      { id: 'i1-escopo', lead: 'Comparar dispositivos e serviços:', text: 'Teste o mesmo serviço em outro aparelho na mesma rede e mais de um site/serviço no computador. Se um aparelho falha ou vários falham, isso ajuda a delimitar o escopo, mas não prova a causa. Considere VPN, DNS, conta, site e rede antes de escolher o próximo passo.', report: 'Comparação de conexão entre aparelhos e serviços' },
      { id: 'i1-fisico', lead: 'Conferir o básico:', text: 'Confira cabo, modo avião, Wi-Fi e sinal. Cabo funcionando e Wi-Fi falhando separa caminhos de conexão, mas não prova que o culpado seja apenas sinal ou placa: considere também ponto de acesso/roteador, interferência, configuração e driver.', report: 'Conferência de cabo, Wi-Fi e intensidade do sinal' },
      { id: 'i1-roteador', lead: 'Reiniciar modem/roteador (com autorização):', text: 'Avise que todos os usuários da rede ficarão sem conexão e considere o risco à sessão remota. Em aparelhos separados, desligue e aguarde pelo menos 30 segundos; ligue primeiro o modem e espere estabilizar, depois ligue o roteador e aguarde alguns minutos. Em aparelho combinado, faça um único ciclo. Não aperte o botão Reset, que pode apagar configurações.', report: 'Reinício controlado de modem/roteador' }
    ],
    tip: 'Se vários aparelhos continuarem sem acesso, isso ainda não prova que a falha seja do provedor; confirme se os serviços/sites testados estão disponíveis e, se necessário, peça ao cliente para contatar o provedor com os resultados.'
  },
  {
    id: 'i2',
    minutes: 8,
    phase: 'Rede no Windows',
    title: 'Testes e Ajustes de Rede no Windows',
    intro: 'Use primeiro testes e ações menos invasivas. Abra o CMD como administrador para os comandos de alteração/reset; em acesso remoto, avalie o risco de perder a sessão antes de executar.',
    items: [
      { id: 'i2-ping', lead: 'Testar alcance de rede:', text: 'Compare `ping 8.8.8.8` e `ping google.com`. Resposta ao IP e falha ao nome pode sugerir DNS, mas não prova a causa; ICMP pode ser bloqueado. Timeout não prova ausência de Internet. Confira também o gateway com `ipconfig` e teste a navegação ou o serviço real.', report: 'Teste de alcance IP/DNS (ping)' },
      { id: 'i2-dns', guide: 'dns', lead: 'Limpar cache DNS (se indicado):', text: 'Se os sintomas apontarem a uma resolução DNS possivelmente desatualizada, execute `ipconfig /flushdns`. Isso limpa somente o cache DNS local e não precisa reiniciar.', report: 'Limpeza do cache DNS local, quando indicada' },
      { id: 'i2-renew', lead: 'Renovar o endereço IP (com cautela):', text: '`ipconfig /release` e `/renew` aplicam-se a interfaces configuradas para DHCP; sem indicar adaptador, `/release` pode interromper várias interfaces elegíveis. Em suporte remoto, só execute se o cliente puder recuperar a conexão localmente ou houver acesso alternativo: a sessão pode cair antes do `/renew`.', report: 'Renovação do endereço IP via DHCP, quando indicada' },
      { id: 'i2-winsock', guide: 'winsock', lead: 'Redefinir Winsock (último recurso):', text: 'Use `netsh winsock reset` somente se a falha persistir neste PC após testes e medidas menos invasivas, com suspeita de problema no catálogo Winsock. Pode afetar software com LSP personalizado. Não reinicie aqui: se executado, faça uma única reinicialização no passo i3.', report: 'Redefinição do catálogo Winsock, quando indicada' }
    ],
    tip: 'Antes de `ipconfig /release`, avise em destaque que a conectividade pode cair e encerrar a sessão remota. Executar os comandos em sequência não garante que o acesso remoto sobreviva; tenha o cliente junto ao computador ou um plano de retorno.'
  },
  {
    id: 'i3',
    minutes: 5,
    phase: 'Validação e Encerramento',
    title: 'Validar a Conexão',
    intro: 'Confirme serviços reais de navegação e faça somente a reinicialização pendente necessária.',
    items: [
      { id: 'i3-reboot', lead: 'Reiniciar (somente se necessário):', text: 'Se o reset Winsock foi executado ou outra alteração exigir reinício, salve o trabalho e combine a janela de indisponibilidade; reinicie uma única vez. Se nenhuma operação exigir, pule este passo.', report: 'Reinicialização necessária após alteração de rede' },
      { id: 'i3-teste', lead: 'Testar a navegação:', text: 'Abra mais de um site/serviço e confira se a conexão permanece estável. Se o Wi-Fi falhar e o cabo funcionar, isso ajuda a separar os caminhos, mas ainda não identifica sozinho sinal, adaptador, configuração ou ponto de acesso como causa.', report: 'Teste final de navegação' },
      { id: 'i3-relatorio', lead: 'Relatório ao Cliente:', text: 'Informe o que foi testado, quais resultados foram observados e quais causas continuam em aberto. Se necessário, o cliente pode compartilhar os dados com o provedor sem repetir os testes.', report: null }
    ]
  },

  // ===== Tela azul e travamentos =====
  {
    id: 'b1',
    minutes: 5,
    phase: 'Coleta de Informações',
    title: 'Entender a Tela Azul',
    intro: 'O código, a cronologia e o contexto são pistas para investigação; nenhum deles identifica sozinho a causa.',
    items: [
      { id: 'b1-codigo', lead: 'Anotar o código de parada:', text: 'Peça uma foto ou o texto da tela azul (ex.: `IRQL_NOT_LESS_OR_EQUAL`, `CRITICAL_PROCESS_DIED`). Trate o código como pista, não diagnóstico: correlacione com momento, atualizações, drivers, dispositivos, logs e testes antes de atribuir a causa.', report: 'Registro do código de erro da tela azul' },
      { id: 'b1-quando', lead: 'Perguntar quando começou:', text: 'Investigue se houve atualização, instalação de programa/driver ou troca de peça. A proximidade temporal pode orientar um teste, mas não prova que a mudança seja a causa. Se fizer sentido, altere uma coisa por vez e registre como reverter; ausência de mudança conhecida não prova falha de hardware.', report: 'Levantamento da cronologia dos travamentos' },
      { id: 'b1-eventos', lead: 'Consultar o Visualizador de Eventos:', text: 'Execute `eventvwr`, abra “Logs do Windows” > “Sistema” e procure registros próximos ao horário. Kernel-Power 41 registra que o Windows não encerrou corretamente; sozinho não identifica fonte, superaquecimento ou outro culpado. Correlacione bugcheck, eventos adjacentes e contexto.', report: 'Análise contextual do Visualizador de Eventos' }
    ]
  },
  {
    id: 'b2',
    minutes: 30,
    phase: 'Hardware',
    title: 'Investigar Memória, Disco e Temperatura',
    intro: 'Estes testes investigam hipóteses de hardware, mas não confirmam nem excluem sozinhos todas as falhas.',
    items: [
      { id: 'b2-ram', guide: 'mdsched', lead: 'Memória RAM:', text: 'Salve o trabalho e feche os aplicativos antes de iniciar `mdsched`; escolha reiniciar agora ou na próxima inicialização. O computador ficará indisponível durante o teste, cuja duração varia. Depois do boot, entre no Windows e verifique a notificação ou procure MemoryDiagnostics-Results no Visualizador de Eventos. Resultado sem erro não exclui toda falha intermitente.', report: 'Teste da memória RAM (Diagnóstico de Memória do Windows)' },
      { id: 'b2-disco', guide: 'chkdsk', lead: 'Disco (somente após preservar os dados):', text: 'Faça e confira backup antes de qualquer CHKDSK, mesmo que SMART pareça normal. Se houver alerta, erros de leitura/I/O, ruídos ou disco sumindo, priorize preservar/recuperar os dados e consultar o fabricante. Para erros lógicos, `/f` corrige o sistema de arquivos; `/r` procura setores e tenta recuperar informação legível, inclui `/f` e pode demorar muito. Não é reparo físico nem é proibido genericamente em SSD. Escolha o card CHKDSK correspondente ao objetivo/modelo, confirme o volume, use CMD como administrador e combine a janela de reinício se o Windows oferecer agendamento.', report: 'Verificação do sistema de arquivos (após backup)' },
      { id: 'b2-temp', lead: 'Temperatura e ventilação:', text: 'Se a falha ocorrer sob carga, use limites e ferramentas de diagnóstico do fabricante compatíveis com o modelo. Não aplique um valor térmico universal nem trate HWMonitor como ferramenta oficial para todo equipamento. Confira externamente se as saídas de ar estão obstruídas; não abra o aparelho nem faça limpeza interna sem qualificação e autorização.', report: 'Verificação orientada de temperatura e ventilação' }
    ],
    tip: 'O teste de memória e o CHKDSK agendado podem exigir reinício e deixar a máquina indisponível por tempo variável. Avise o cliente, salve o trabalho e não apresente os 30 min nominais como limite.'
  },
  {
    id: 'b3',
    minutes: 25,
    phase: 'Integridade do Sistema',
    title: 'Reparar Arquivos do Windows (Quando Indicado)',
    intro: 'Execute quando os sintomas e a triagem justificarem; os comandos precisam de Prompt elevado e podem levar tempo variável.',
    items: [
      { id: 'b3-dism', guide: 'dism', lead: 'Reparo de Imagem:', text: 'Execute `dism /online /cleanup-image /restorehealth` e aguarde a conclusão. Windows Update é a origem padrão quando permitido; uma origem local/de rede compatível pode ser indicada. Para mídia, confirme arquivo, índice e compatibilidade conforme “Ver no Guia”; não assuma que índice 1 equivale à edição instalada.', report: 'Reparo da imagem do Windows (DISM)' },
      { id: 'b3-sfc', guide: 'sfc', lead: 'Verificação de Integridade:', text: 'Depois do DISM, execute `sfc /scannow` e aguarde até 100%. Ele verifica arquivos protegidos do Windows; se algo não for reparado, consulte o resultado e o registro CBS antes de decidir o próximo passo.', report: 'Verificação e reparo dos arquivos do sistema (SFC)' }
    ]
  },
  {
    id: 'b4',
    minutes: 10,
    phase: 'Drivers e Programas',
    title: 'Investigar Alterações Recentes',
    intro: 'Siga a cronologia e faça uma mudança por vez; não instale atualizações automaticamente enquanto ainda tenta isolar a causa.',
    items: [
      { id: 'b4-programa', lead: 'Programa ou driver recente:', text: 'Se a falha começou após instalar um programa, avalie removê-lo por Configurações > Aplicativos. Para driver, use o Gerenciador de Dispositivos ou o procedimento do fabricante; “Aplicativos” não é caminho universal para remover drivers. Faça uma alteração por vez, registre o estado e teste antes de continuar.', report: 'Investigação de programa/driver instalado recentemente' },
      { id: 'b4-drivers', lead: 'Driver atualizado recentemente:', text: 'Se a tela azul começou logo após atualização de driver, avalie primeiro “Reverter Driver” no Gerenciador de Dispositivos. Se houver motivo para atualizar, use o site oficial do fabricante do computador ou componente e confirme o modelo. Evite programas genéricos de atualização de drivers.', report: 'Avaliação de reversão/atualização de driver' },
      { id: 'b4-update', lead: 'Windows Update:', text: 'Confira o histórico antes de instalar alterações. Se a tela azul começou após uma atualização, avalie a opção oficial de desinstalá-la antes de instalar novas atualizações em lote. Verifique edição e ciclo de suporte do Windows 10/11; não prometa atualizações de segurança sem confirmar elegibilidade.', report: 'Revisão do histórico de atualizações do Windows' }
    ],
    tip: 'O suporte geral de Windows 10 Home/Pro terminou em 14/10/2025; ESU e edições LTSC têm condições/ciclos próprios. Se a tela azul persistir, encaminhe para diagnóstico presencial em vez de atribuir automaticamente a falha a RAM, disco ou fonte.'
  },
  {
    id: 'b5',
    minutes: 5,
    phase: 'Validação e Encerramento',
    title: 'Acompanhar a Estabilidade',
    intro: 'A validação depende de reproduzir o cenário; falhas intermitentes podem exigir acompanhamento posterior.',
    items: [
      { id: 'b5-reboot', lead: 'Reinicialização e teste:', text: 'Salve o trabalho e reinicie quando a alteração exigir. Reproduza, quando seguro, a tarefa que costumava causar a tela azul. Se não ocorrer durante um teste curto, registre o resultado como provisório — isso não confirma estabilidade quando a falha é rara.', report: 'Reinicialização e teste de estabilidade' },
      { id: 'b5-relatorio', lead: 'Relatório ao Cliente:', text: 'Explique o que foi encontrado e o que permanece incerto. Combine acompanhamento; se a tela azul voltar, peça para registrar data, hora, código e tarefa em execução. Mantenha backup dos arquivos importantes.', report: null }
    ]
  }
]
