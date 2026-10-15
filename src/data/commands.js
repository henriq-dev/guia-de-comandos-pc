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
    guide: 'Use só quando o computador ficar preso em "reparo de sistema pendente" após atualizações interrompidas. Reinicie em seguida. É último recurso: cancela as atualizações pendentes e a atualização em andamento pode ficar incompleta e ser refeita depois pelo Windows Update. Tente reiniciar normalmente antes.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'temp-user',
    type: 'run',
    icon: Trash2,
    title: 'Arquivos Temporários do Usuário',
    description: 'Abre a pasta com os arquivos temporários gerados pelos aplicativos da conta atual.',
    code: '%temp%',
    guide: 'Pressione Ctrl + A para selecionar tudo e Shift + Delete para apagar de forma permanente. Ignore arquivos em uso. Confira que está na pasta temporária antes de apagar. Feche os programas abertos antes: a pasta fica dentro do perfil do usuário (AppData\\Local\\Temp) e não contém Documentos nem Fotos.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'temp-sys',
    type: 'run',
    icon: FolderOpen,
    title: 'Arquivos Temporários do Sistema',
    description: 'Abre a pasta de arquivos temporários raiz do sistema operacional Windows (C:\\Windows\\Temp).',
    code: 'temp',
    guide: 'Apague o conteúdo periodicamente para liberar espaço no SSD/HD principal. Pode pedir permissão de administrador ao abrir: confirme a janela. Pule os arquivos em uso.',
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
    guide: 'Útil em atendimentos remotos quando o cliente relata lentidão de navegação ou sites não carregando. É seguro e não precisa reiniciar: só descarta o cache, que o Windows refaz sozinho. Não resolve falha do roteador ou do provedor: teste outro aparelho antes.',
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
    title: 'Verificar Erros no Disco (HD)',
    description: 'Corrige erros no sistema de arquivos (NTFS) e varre a superfície atrás de setores defeituosos. Só para HD mecânico.',
    code: 'chkdsk C: /f /r',
    guide: 'Antes, confira o S.M.A.R.T. no CrystalDiskInfo: em Alerta ou Crítico, não rode e faça backup imediato. Use só em HD mecânico saudável; em SSD use o card seguinte, sem o /r. Execute como Administrador e aceite agendar para o próximo reinício. Pode demorar bastante.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'chkdsk-ssd',
    type: 'cmd',
    icon: Activity,
    title: 'Verificar Erros no Disco (SSD)',
    description: 'Corrige erros no sistema de arquivos (NTFS) sem a varredura de superfície, que gasta o SSD sem nenhum benefício.',
    code: 'chkdsk C: /f',
    guide: 'Confira o S.M.A.R.T. no CrystalDiskInfo antes: em Alerta ou Crítico, faça backup e não rode. Execute como Administrador e aceite agendar para o próximo reinício. Não use /r em SSD. Se o disco continuar com problemas, use a ferramenta de diagnóstico do fabricante.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'winsock',
    type: 'cmd',
    icon: Network,
    title: 'Redefinir Rede (Winsock)',
    description: 'Restaura o catálogo Winsock ao padrão, resolvendo falhas de conexão causadas por softwares ou malwares.',
    code: 'netsh winsock reset',
    guide: 'Execute como Administrador e reinicie o computador em seguida. Use só depois que ipconfig /flushdns e ipconfig /renew não resolverem a internet instável. O reset pode remover configurações de VPN e de alguns antivírus que se encaixam na rede: avise o cliente, pois podem precisar ser reconfigurados.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'mdsched',
    type: 'run',
    icon: MemoryStick,
    title: 'Diagnóstico de Memória RAM',
    description: 'Abre o teste nativo de memória do Windows para investigar travamentos e telas azuis.',
    code: 'mdsched',
    guide: 'O teste exige reiniciar o computador. Avise o cliente antes: durante o teste a tela fica azul e a máquina não pode ser usada. Escolha "Reiniciar agora" para testar na hora ou "na próxima inicialização". O teste leva vários minutos. O resultado aparece depois do boot; se não aparecer, veja em Visualizador de Eventos > Logs do Windows > Sistema, origem MemoryDiagnostics-Results.',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'taskmgr',
    type: 'run',
    icon: Gauge,
    title: 'Gerenciador de Tarefas',
    description: 'Mostra o uso de CPU, RAM, disco e rede em tempo real e os aplicativos de inicialização.',
    code: 'taskmgr',
    guide: 'Atalho direto: Ctrl + Shift + Esc. Use na triagem e de novo no fim do atendimento para comparar o consumo em repouso. Em repouso, desconfie de disco parado perto de 100%, memória acima de 80% ou um programa gastando CPU sem estar em uso.',
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
