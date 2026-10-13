import {
  ShieldCheck, Wrench, RotateCcw, Trash2, FolderOpen, Zap,
  HardDrive, Wifi, Settings, MemoryStick, Network, Activity, Gauge
} from 'lucide-react'

// ÂNCORA: para adicionar um comando novo, basta incluir um objeto nesta lista.
// type: 'cmd' (Prompt de Comando como Admin) ou 'run' (Win + R)
// categories: use 'cmd' ou 'run' + 'limpeza' e/ou 'otimizacao'
export const commands = [
  {
    id: 'sfc',
    type: 'cmd',
    icon: ShieldCheck,
    title: 'Reparação de Arquivos de Sistema',
    description: 'Varre todos os arquivos protegidos do Windows e substitui as cópias corrompidas pelas originais em cache.',
    code: 'sfc /scannow',
    guide: 'Execute sempre no Prompt de Comando como Administrador. Se indicar "reparo pendente", reinicie o computador antes de tentar novamente.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'dism',
    type: 'cmd',
    icon: Wrench,
    title: 'Reparo de Imagem do Windows (DISM)',
    description: 'Restaura a imagem base dos componentes do Windows através do Windows Update quando o SFC falha.',
    code: 'dism /online /cleanup-image /restorehealth',
    guide: 'Requer conexão com a Internet. Execute antes do sfc /scannow se o sistema estiver com graves instabilidades.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'revert',
    type: 'cmd',
    icon: RotateCcw,
    title: 'Remover Fila de Reparos Pendentes',
    description: 'Cancela atualizações e operações de reparo pendentes que bloqueiam outros utilitários de diagnóstico.',
    code: 'dism /online /cleanup-image /revertpendingactions',
    guide: 'Útil quando o computador fica preso em "reparo de sistema pendente" após atualizações interrompidas. Reinicie em seguida.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'temp-user',
    type: 'run',
    icon: Trash2,
    title: 'Arquivos Temporários do Usuário',
    description: 'Abre a pasta com os arquivos temporários gerados pelos aplicativos da conta atual.',
    code: '%temp%',
    guide: 'Pressione Ctrl + A para selecionar tudo e Shift + Delete para apagar de forma permanente. Ignore arquivos em uso.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'temp-sys',
    type: 'run',
    icon: FolderOpen,
    title: 'Arquivos Temporários do Sistema',
    description: 'Abre a pasta de arquivos temporários raiz do sistema operacional Windows.',
    code: 'temp',
    guide: 'Apague o conteúdo periodicamente para liberar espaço no SSD/HD principal.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'prefetch',
    type: 'run',
    icon: Zap,
    title: 'Cache de Pré-carregamento (Prefetch)',
    description: 'Armazena dados de inicialização de aplicativos. Limpar ajuda quando há erros na execução de softwares.',
    code: 'prefetch',
    guide: 'Requer permissão de administrador ao abrir. Pode apagar todo o conteúdo com segurança.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'cleanmgr',
    type: 'run',
    icon: HardDrive,
    title: 'Limpeza de Disco Avançada',
    description: 'Abre o assistente nativo do Windows para remover atualizações antigas, dumps de memória e lixeira.',
    code: 'cleanmgr',
    guide: 'Clique em "Limpar arquivos do sistema" dentro da ferramenta para remover gigabytes de atualizações antigas do Windows.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'dns',
    type: 'cmd',
    icon: Wifi,
    title: 'Renovar Cache DNS',
    description: 'Limpa o cache de resolução de nomes DNS para corrigir sites que não carregam ou abrem com endereço antigo.',
    code: 'ipconfig /flushdns',
    guide: 'Essencial em atendimentos remotos quando o cliente relata lentidão de navegação ou sites não carregando.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'msconfig',
    type: 'run',
    icon: Settings,
    title: 'Configuração do Sistema (MSConfig)',
    description: 'Acessa as definições de inicialização, serviços e opções de boot do sistema.',
    code: 'msconfig',
    guide: 'Na aba "Serviços", marque "Ocultar todos os serviços Microsoft" antes de desativar qualquer item desnecessário.',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'chkdsk',
    type: 'cmd',
    icon: Activity,
    title: 'Verificar Erros no Disco',
    description: 'Procura e corrige erros lógicos e setores defeituosos no disco do sistema.',
    code: 'chkdsk C: /f /r',
    guide: 'Execute como Administrador. Como o disco C: está em uso, o Windows pede para agendar a verificação no próximo reinício. Em HD mecânico pode demorar bastante.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'winsock',
    type: 'cmd',
    icon: Network,
    title: 'Redefinir Rede (Winsock)',
    description: 'Restaura o catálogo Winsock ao padrão, resolvendo falhas de conexão causadas por softwares ou malwares.',
    code: 'netsh winsock reset',
    guide: 'Execute como Administrador e reinicie o computador em seguida. Combine com ipconfig /flushdns quando o cliente relatar internet instável.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'mdsched',
    type: 'run',
    icon: MemoryStick,
    title: 'Diagnóstico de Memória RAM',
    description: 'Abre o teste nativo de memória do Windows para investigar travamentos e telas azuis.',
    code: 'mdsched',
    guide: 'O teste exige reiniciar o computador. Avise o cliente antes: durante o teste a tela fica azul e a máquina não pode ser usada.',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'taskmgr',
    type: 'run',
    icon: Gauge,
    title: 'Gerenciador de Tarefas',
    description: 'Mostra o uso de CPU, RAM, disco e rede em tempo real e os aplicativos de inicialização.',
    code: 'taskmgr',
    guide: 'Atalho direto: Ctrl + Shift + Esc. Use na triagem e de novo no fim do atendimento para comparar o consumo em repouso.',
    categories: ['run', 'otimizacao']
  }
]

// ÂNCORA: botões de filtro (o id 'fav' é tratado à parte no código)
export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'cmd', label: 'CMD (Prompt)' },
  { id: 'run', label: 'Executar (Win+R)' },
  { id: 'limpeza', label: 'Limpeza' },
  { id: 'otimizacao', label: 'Otimização' }
]
