// ÂNCORA: roteiro de atendimento. Cada item vira uma caixa de marcar com progresso salvo.
// Dentro de "text", o que estiver entre crases (`assim`) é exibido como código.
export const steps = [
  {
    id: 's1',
    kicker: 'Etapa 01 — Primordial',
    title: 'Triagem Inicial & Diagnóstico do Hardware',
    intro: 'Antes de alterar qualquer configuração de software, entenda o estado do hardware da máquina do cliente.',
    items: [
      { id: 's1-armazenamento', lead: 'Verificar Armazenamento:', text: 'Confira em "Este Computador" se o disco (C:) é SSD ou HD mecânico e o espaço livre (menos de 10% livre causa lentidão extrema).' },
      { id: 's1-ram-cpu', lead: 'Verificar Memória RAM & CPU:', text: 'Abra o Gerenciador de Tarefas com `Ctrl + Shift + Esc` e analise o uso de CPU, RAM e Disco em repouso.' },
      { id: 's1-smart', lead: 'Saúde do Disco (S.M.A.R.T.):', text: 'Se o disco estiver em 100% constante, verifique a saúde com uma ferramenta leve como o CrystalDiskInfo. Não adianta otimizar o software se o disco estiver danificado.' }
    ],
    tip: 'Se o cliente usa HD mecânico como disco do sistema, recomende a migração para SSD como prioridade máxima de upgrade.'
  },
  {
    id: 's2',
    kicker: 'Etapa 02 — Inicialização & Processos',
    title: 'Limpeza de Inicialização (Boot Limpo)',
    intro: 'Softwares em segundo plano são a causa nº 1 de lentidão após ligar o sistema.',
    items: [
      { id: 's2-apps', lead: 'Aplicativos de Inicialização:', text: 'No Gerenciador de Tarefas, aba "Aplicativos de inicialização", desative programas pesados que não precisam abrir com o Windows (ex.: Spotify, Steam, Discord, Teams).' },
      { id: 's2-servicos', lead: 'Serviços de Terceiros:', text: 'Execute `msconfig`, vá em "Serviços", marque obrigatoriamente "Ocultar todos os serviços Microsoft" e desative atualizadores desnecessários (ex.: Adobe, Google Update).' }
    ]
  },
  {
    id: 's3',
    kicker: 'Etapa 03 — Limpeza de Arquivos Residuais',
    title: 'Liberação de Espaço e Arquivos Temporários',
    intro: 'Remova gigabytes de lixo eletrônico que sobrecarregam o índice de busca e o disco.',
    items: [
      { id: 's3-pastas', lead: 'Pastas Temporárias:', text: 'Acesse via `Win + R` as pastas `%temp%`, `temp` e `prefetch` e elimine os dados antigos.' },
      { id: 's3-cleanmgr', lead: 'Limpeza de Disco Integrada:', text: 'Execute `cleanmgr` como administrador para remover itens da lixeira, relatórios de erro e cópias antigas do Windows Update.' }
    ]
  },
  {
    id: 's4',
    kicker: 'Etapa 04 — Integridade do Sistema',
    title: 'Verificação e Correção de Sistema Corrompido',
    intro: 'Garanta que o sistema operacional está estável antes de finalizar o atendimento.',
    items: [
      { id: 's4-dism', lead: 'Reparo de Imagem:', text: 'Se houver falhas recorrentes, rode `dism /online /cleanup-image /restorehealth` no CMD como administrador.' },
      { id: 's4-sfc', lead: 'Verificação de Integridade:', text: 'Execute `sfc /scannow` no CMD como administrador para corrigir DLLs e arquivos danificados.' },
      { id: 's4-dns', lead: 'Rede e Navegação:', text: 'Execute `ipconfig /flushdns` para limpar o cache DNS e evitar lentidão no navegador.' }
    ]
  },
  {
    id: 's5',
    kicker: 'Etapa 05 — Validação & Encerramento',
    title: 'Reboot e Teste Final',
    intro: 'Confirme a melhoria e entregue a máquina pronta ao cliente.',
    items: [
      { id: 's5-reboot', lead: 'Reinicialização Completa:', text: 'Reinicie o sistema para consolidar os arquivos reparados e as alterações feitas.' },
      { id: 's5-validacao', lead: 'Validação dos Resultados:', text: 'Abra o Gerenciador de Tarefas e confirme se o uso de CPU, RAM e Disco baixou em repouso.' },
      { id: 's5-relatorio', lead: 'Relatório ao Cliente:', text: 'Informe brevemente as ações realizadas (arquivos limpos, inicialização otimizada e correções de sistema).' }
    ]
  }
]
