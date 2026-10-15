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
    description: 'Compara os arquivos protegidos do Windows com a cópia local (pasta WinSxS) e substitui os corrompidos.',
    code: 'sfc /scannow',
    guide: 'Execute no Prompt de Comando como Administrador, depois do DISM: se a cópia local estiver danificada, o SFC não consegue reparar. O registro fica em %WinDir%\\Logs\\CBS\\CBS.log. Se indicar "reparo pendente", reinicie antes de tentar novamente.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'dism',
    type: 'cmd',
    icon: Wrench,
    title: 'Reparo de Imagem do Windows (DISM)',
    description: 'Repara o repositório de componentes do Windows (WinSxS) baixando arquivos íntegros do Windows Update. É a base que o SFC usa para reparar: rode o DISM primeiro.',
    code: 'dism /online /cleanup-image /restorehealth',
    guide: 'Requer conexão com a Internet e deve rodar antes do sfc /scannow. Sem internet ou com o Windows Update quebrado, monte uma ISO do Windows e use: dism /online /cleanup-image /restorehealth /source:wim:D:\\sources\\install.wim:1 /limitaccess (troque D: pela letra da ISO; o número final é a edição do Windows).',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'revert',
    type: 'cmd',
    icon: RotateCcw,
    title: 'Remover Fila de Reparos Pendentes',
    description: 'Cancela atualizações e operações de reparo pendentes que bloqueiam outros utilitários de diagnóstico.',
    code: 'dism /online /cleanup-image /revertpendingactions',
    guide: 'Use só quando o computador ficar preso em "reparo de sistema pendente" após atualizações interrompidas. Reinicie em seguida.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'temp-user',
    type: 'run',
    icon: Trash2,
    title: 'Arquivos Temporários do Usuário',
    description: 'Abre a pasta com os arquivos temporários gerados pelos aplicativos da conta atual.',
    code: '%temp%',
    guide: 'Pressione Ctrl + A para selecionar tudo e Shift + Delete para apagar de forma permanente. Ignore arquivos em uso. Confira que está na pasta temporária antes de apagar.',
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
    description: 'Guarda um mapa de pré-carregamento dos programas mais usados para que abram mais rápido.',
    code: 'prefetch',
    guide: 'Não limpe de rotina: apagar deixa os programas mais lentos nas primeiras aberturas, até o Windows refazer o mapa. Limpe só após remover malware ou se um programa específico falhar ao iniciar. Requer permissão de administrador.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'cleanmgr',
    type: 'run',
    icon: HardDrive,
    title: 'Limpeza de Disco Avançada',
    description: 'Abre o assistente nativo do Windows para remover arquivos temporários, relatórios de erro, atualizações antigas e lixeira.',
    code: 'cleanmgr',
    guide: 'Desmarque "Downloads" se aparecer na lista (são arquivos do cliente). Em "Limpar arquivos do sistema", só remova atualizações antigas e Windows.old se o sistema estiver estável e o cliente não precisar voltar à versão anterior.',
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
    guide: 'Na aba "Serviços", marque "Ocultar todos os serviços Microsoft" antes de desativar qualquer item: sem isso, "Desativar tudo" derruba drivers de teclado, rede e login e o PC pode não iniciar. Não limite o número de processadores em "Inicialização" > "Opções avançadas" (risco de tela azul).',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'chkdsk',
    type: 'cmd',
    icon: Activity,
    title: 'Verificar Erros no Disco',
    description: 'Corrige erros no sistema de arquivos (NTFS) com /f e, com /r, também varre a superfície atrás de setores defeituosos.',
    code: 'chkdsk C: /f /r',
    guide: 'Antes, confira o S.M.A.R.T. no CrystalDiskInfo: em Alerta ou Crítico, não rode e faça backup. Use /r só em HD mecânico saudável; em SSD use apenas chkdsk C: /f. Execute como Administrador e aceite agendar para o próximo reinício. Em HD pode demorar bastante.',
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
