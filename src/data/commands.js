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
    description: 'Verifica arquivos protegidos do Windows e tenta substituir os corrompidos usando uma cópia em cache.',
    code: 'sfc /scannow',
    guide: 'Abra o Prompt de Comando como Administrador e execute depois do DISM. Aguarde a verificação chegar a 100%. Se alguns arquivos não forem reparados, consulte o resultado e o registro em %WinDir%\\Logs\\CBS\\CBS.log e siga a orientação de reparo da imagem do Windows.',
    categories: ['cmd', 'limpeza']
  },
  {
    id: 'dism',
    type: 'cmd',
    icon: Wrench,
    title: 'Reparo de Imagem do Windows (DISM)',
    description: 'Verifica e tenta reparar o repositório de componentes usado na manutenção do Windows; execute antes do SFC.',
    code: 'dism /online /cleanup-image /restorehealth',
    guide: 'Execute no Prompt de Comando como Administrador, antes de sfc /scannow, e aguarde a conclusão (pode levar vários minutos). Windows Update é a origem padrão quando permitido pela política; uma origem local ou de rede compatível também pode ser usada. Para um exemplo com ISO que contenha install.wim: confira o índice com `dism /Get-ImageInfo /ImageFile:D:\\sources\\install.wim` e use `dism /online /cleanup-image /restorehealth /source:wim:D:\\sources\\install.wim:<índice> /limitaccess`. Troque D: e o índice; confirme que a origem corresponde à versão/build/idioma do Windows instalado. Se a mídia tiver install.esd, o formato da origem é diferente.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'revert',
    type: 'cmd',
    icon: RotateCcw,
    title: 'Reverter Ações Pendentes (Recuperação Avançada)',
    description: 'Ação avançada de recuperação para uma instalação Windows offline que não inicializa possivelmente por operações de servicing pendentes.',
    code: 'dism /image:<letra-da-instalação>:\\ /cleanup-image /revertpendingactions',
    guide: 'Use somente quando o Windows não inicializa e há suspeita de operações de servicing pendentes. Inicie no Ambiente de Recuperação do Windows, abra o Prompt de Comando, identifique a letra real da instalação offline e substitua o marcador no comando; não use /online nem aponte para a imagem do próprio WinRE/WinPE. Se o BitLocker solicitar, será necessária a chave de recuperação. Não execute em um Windows que inicia normalmente. Se a atualização problemática for identificável, prefira avaliar “Desinstalar atualizações” nas opções de recuperação do Windows. É uma operação avançada: confirme backup/consentimento quando possível e procure assistência se houver dúvida.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'temp-user',
    type: 'run',
    icon: Trash2,
    title: 'Arquivos Temporários do Usuário',
    description: 'Abre a pasta temporária associada à conta e à variável TEMP atuais; o caminho usual fica no perfil do usuário.',
    code: '%temp%',
    guide: 'Para liberar espaço, prefira Configurações > Sistema > Armazenamento > Arquivos temporários/Recomendações de limpeza e revise cada categoria. Se fizer limpeza manual, confirme a pasta, salve o trabalho e feche os aplicativos relevantes; remova somente itens reconhecidos e ignore arquivos em uso. Shift + Delete ignora a Lixeira, mas não é apagamento seguro nem garante recuperação posterior. Peça autorização e pare se não souber a que um arquivo pertence.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'temp-sys',
    type: 'run',
    icon: FolderOpen,
    title: 'Arquivos Temporários do Windows',
    description: 'Abre o caminho típico da pasta Temp sob a instalação atual do Windows (%windir%\\Temp).',
    code: '%windir%\\Temp',
    guide: 'Não apague o conteúdo periodicamente nem indiscriminadamente. Prefira Configurações > Sistema > Armazenamento > Arquivos temporários/Recomendações de limpeza e revise os itens. Se a limpeza manual for necessária, confirme o caminho, feche aplicativos/instalações/atualizações, remova somente itens reconhecidos e ignore os bloqueados; não force exclusões nem altere permissões. Só aprove uma solicitação de administrador quando a operação esperada realmente exigir elevação.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'prefetch',
    type: 'run',
    icon: Zap,
    title: 'Pasta Prefetch (uso avançado)',
    description: 'Abre a pasta Prefetch; abrir o caminho não apaga nem altera arquivos.',
    code: 'prefetch',
    guide: 'Não use como limpeza de rotina nem como correção presumida de malware ou falha ao iniciar um aplicativo: as fontes oficiais consultadas não recomendam essa exclusão como solução para Windows 10/11. Para liberar espaço, use as opções de Armazenamento do Windows. Para suspeita de malware, faça uma verificação de segurança; para falha de aplicativo, investigue o próprio aplicativo. Não apague a pasta nem itens desconhecidos.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'cleanmgr',
    type: 'run',
    icon: HardDrive,
    title: 'Limpeza de Disco (cleanmgr)',
    description: 'Abre a ferramenta nativa de Limpeza de Disco; as categorias disponíveis variam conforme o Windows e o volume.',
    code: 'cleanmgr',
    guide: 'Confira o volume e revise cada categoria antes de confirmar; marque somente itens autorizados pelo cliente. Revise Downloads e o conteúdo da Lixeira antes de removê-los. Para Windows.old/instalação anterior, confirme que arquivos pessoais foram recuperados ou copiados e que a reversão não será necessária: a remoção pode ser irreversível e desativa essa opção. Eleve privilégios apenas se o Windows solicitar para limpar arquivos do sistema. O Armazenamento do Windows também oferece recomendações de limpeza revisáveis.',
    categories: ['run', 'limpeza']
  },
  {
    id: 'dns',
    type: 'cmd',
    icon: Wifi,
    title: 'Limpar Cache DNS',
    description: 'Esvazia o cache DNS do resolvedor local do Windows; pode ajudar quando há suspeita de uma resolução de nomes desatualizada.',
    code: 'ipconfig /flushdns',
    guide: 'Abra o Prompt de Comando como Administrador conforme o fluxo de suporte e execute quando o sintoma indicar problema de resolução de nomes. Não é uma correção genérica para navegação lenta nem limpa o cache do roteador, provedor ou navegador. Não precisa reiniciar: o Windows repovoa o cache conforme novas consultas DNS são feitas.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'msconfig',
    type: 'run',
    icon: Settings,
    title: 'Configuração do Sistema (MSConfig)',
    description: 'Acessa opções de inicialização e ferramentas de diagnóstico; use Serviços para isolar conflitos temporariamente, não como otimizador genérico.',
    code: 'msconfig',
    guide: 'Para um diagnóstico de inicialização limpa, use uma sessão administrativa, marque “Ocultar todos os serviços Microsoft”, registre o estado original, desative serviços de terceiros somente de forma temporária, reinicie e teste; depois restaure a inicialização normal. Serviços de terceiros também podem ser necessários. Para aplicativos de inicialização, prefira o Gerenciador de Tarefas. Não desative atualizadores sem avaliar o impacto. Não limite “Número de processadores” para acelerar o PC: a opção restringe os processadores disponíveis e exige reinicialização.',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'chkdsk',
    type: 'cmd',
    icon: Activity,
    title: 'Verificar Erros no Disco (HD)',
    description: 'Verifica o sistema de arquivos; /f corrige erros lógicos e /r procura setores defeituosos e tenta recuperar informação legível. Não repara a mídia física.',
    code: 'chkdsk C: /f /r',
    guide: 'Antes de qualquer CHKDSK, faça e confira um backup dos dados importantes; um SMART sem alerta não elimina o risco. Se houver alerta de saúde, erros de leitura/I/O, disco sumindo ou ruídos, priorize preservar os dados e consultar o diagnóstico do fabricante antes de uma varredura. Confirme que C: é o volume correto. Execute no Prompt como Administrador; se o Windows oferecer agendamento para a próxima reinicialização, salve o trabalho e confirme uma janela de indisponibilidade. /r inclui /f, pode levar muitas horas em discos grandes e não é reparo físico. Mantenha alimentação estável e não interrompa à força.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'chkdsk-ssd',
    type: 'cmd',
    icon: Activity,
    title: 'Verificar Erros no Disco (SSD)',
    description: 'Corrige erros lógicos do sistema de arquivos do volume; /f verifica e repara erros sem afirmar saúde física do SSD.',
    code: 'chkdsk C: /f',
    guide: 'Antes de qualquer CHKDSK, faça e confira um backup dos dados importantes; SMART normal não prova saúde perfeita. Se houver alerta, erros de leitura/I/O ou sintomas de falha, priorize preservar os dados e consulte o diagnóstico oficial compatível com a marca/modelo. Confirme o volume e execute como Administrador. Se o Windows oferecer agendamento, salve o trabalho e combine a indisponibilidade. /f corrige erros lógicos; /r procura setores defeituosos e tenta recuperar informação legível, inclui /f e pode demorar muito. Não há base para proibi-lo genericamente em SSD; escolha conforme o objetivo e o diagnóstico, não como rotina.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'winsock',
    type: 'cmd',
    icon: Network,
    title: 'Redefinir Catálogo Winsock',
    description: 'Redefine o catálogo Winsock e remove provedores LSP personalizados; pode ajudar se a falha de rede estiver ligada a corrupção desse catálogo.',
    code: 'netsh winsock reset',
    guide: 'Use apenas em falha persistente localizada neste PC, depois de testes e ações menos invasivas. Execute no Prompt como Administrador e faça uma única reinicialização após o reset, no passo de validação. Alguns softwares que instalam componentes Winsock/LSP podem precisar de reparo ou reconfiguração; isso depende do produto. Não significa que toda VPN ou antivírus será removido. Avise o cliente e confirme uma forma de recuperar a conexão antes de agir remotamente.',
    categories: ['cmd', 'otimizacao']
  },
  {
    id: 'mdsched',
    type: 'run',
    icon: MemoryStick,
    title: 'Diagnóstico de Memória RAM',
    description: 'Abre o teste nativo de memória do Windows para investigar uma possível causa de travamentos ou telas azuis.',
    code: 'mdsched',
    guide: 'Antes de reiniciar, salve todo o trabalho e feche os aplicativos; o computador ficará indisponível durante o teste e reiniciará ao terminar. Escolha “Reiniciar agora” ou “Verificar na próxima inicialização”. O tempo varia; o teste Estendido demora mais. Não desligue nem interrompa o teste. Depois, entre no Windows e procure a notificação; se necessário, pesquise MemoryDiagnostics-Results no Visualizador de Eventos (o canal pode variar entre instalações). Um resultado sem erro não exclui toda falha intermitente.',
    categories: ['run', 'otimizacao']
  },
  {
    id: 'taskmgr',
    type: 'run',
    icon: Gauge,
    title: 'Gerenciador de Tarefas',
    description: 'Mostra CPU, memória, disco e rede e permite revisar aplicativos de inicialização; use como ferramenta de observação, não como diagnóstico automático.',
    code: 'taskmgr',
    guide: 'Atalho documentado: Ctrl + Shift + Esc. Para comparar, aguarde a inicialização e tarefas visíveis terminarem; observe por um intervalo consistente e compare condições semelhantes. Uso alto sustentado ou picos recorrentes são sinais para investigar o processo responsável, não prova de defeito: tarefas legítimas de fundo e picos transitórios são possíveis. Não finalize processos indiscriminadamente. A invocação pelo Win+R é mantida como atalho prático, mas não foi confirmada nas fontes citadas.',
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
