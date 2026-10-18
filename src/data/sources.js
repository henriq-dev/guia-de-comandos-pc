// ÂNCORA: fontes confiáveis de cada comando e etapa. Priorize documentação oficial Microsoft e fabricante do próprio produto.
// Para citar um comando/etapa: crie a fonte em SOURCES e ligue o id em commandSources ou stepSources.

export const SOURCES = {
  'sfc-learn': { label: 'sfc: referência do comando (Microsoft Learn)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sfc' },
  'sfc-support': { label: 'Use o System File Checker para reparar arquivos do sistema (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/experience/backup-recovery/use-the-system-file-checker-tool-to-repair-missing-or-corrupted-system-files' },
  'dism-repair': { label: 'Repair a Windows Image (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/repair-a-windows-image?view=windows-11' },
  'dism-opcoes': { label: 'DISM: opções de servicing do sistema operacional (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/dism-operating-system-package-servicing-command-line-options?view=windows-11' },
  'dism-source': { label: 'Configure a Windows Repair Source (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/configure-a-windows-repair-source?view=windows-11' },
  'dism-inventory': { label: 'Take Inventory of an Image or Component Using DISM (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/take-inventory-of-an-image-or-component-using-dism?view=windows-11' },
  'winre': { label: 'Windows Recovery Environment (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/windows-recovery-environment-0eb14733-6301-41cb-8d26-06a12b42770b' },
  'uninstall-update': { label: 'How to uninstall a Windows Update (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/deployment/updates-lifecycle/how-to-uninstall-a-windows-update' },
  'space-suporte': { label: 'Libere espaço em disco no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/free-up-drive-space-in-windows' },
  'storage-sense': { label: 'Manage drive space with Storage Sense (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/experience/storage-filemanagement/manage-drive-space-with-storage-sense' },
  'env-vars': { label: 'Recognized environment variables (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows/deployment/usmt/usmt-recognized-environment-variables' },
  'cleanmgr-learn': { label: 'cleanmgr: referência do comando (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cleanmgr' },
  'windows-old': { label: 'Delete your previous version of Windows (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/deployment/install-upgrade/delete-your-previous-version-of-windows' },
  'ipconfig-learn': { label: 'ipconfig: referência do comando (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig' },
  'winsock-learn': { label: 'netsh winsock: referência do comando (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-winsock' },
  'msconfig-suporte': { label: 'Ferramentas de configuração do sistema no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/system-configuration-tools-in-windows' },
  'cleanboot': { label: 'Como executar uma inicialização limpa no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/startup-boot/how-to-perform-a-clean-boot-in-windows' },
  'startup-apps': { label: 'Configurar aplicativos de inicialização no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/startup-boot/configure-startup-applications-in-windows' },
  'bcdedit': { label: 'BCDEdit /set: opções de inicialização (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/devtest/bcdedit--set' },
  'chkdsk-learn': { label: 'chkdsk: referência do comando (Microsoft Learn)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chkdsk' },
  'crystal': { label: 'CrystalDiskInfo (site oficial, em inglês)', url: 'https://crystalmark.info/en/software/crystaldiskinfo/' },
  'seagate-diagnostics': { label: 'Seagate: diagnóstico de unidade externa (suporte oficial, em inglês)', url: 'https://www.seagate.com/support/kb/seagate-usb-external-drive-diagnostics-006153en/' },
  'seagate-bad-sectors': { label: 'Seagate: o que fazer quando a unidade relata setores defeituosos (suporte oficial, em inglês)', url: 'https://www.seagate.com/support/kb/what-do-i-do-if-my-drive-reports-bad-sectors-196351en/' },
  'seagate-smart': { label: 'Seagate: alerta S.M.A.R.T. da unidade (suporte oficial, em inglês)', url: 'https://www.seagate.com/support/kb/my-system-reported-a-smart-error-on-the-drive-184619en/' },
  'mdsched-support': { label: 'Diagnóstico de memória do Windows: salvar trabalho e verificar resultados (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/experience/performance-optimization/how-to-fix-error-0xa-irql-not-less-or-equal' },
  'taskmgr-learn': { label: 'Solucionar problemas de processos usando o Gerenciador de Tarefas (Microsoft Learn)', url: 'https://learn.microsoft.com/pt-br/troubleshoot/windows-server/support-tools/support-tools-task-manager' },
  'perf-tips': { label: 'Dicas para melhorar o desempenho do PC no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows' },
  'restore': { label: 'Proteção do Sistema e pontos de restauração (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/backup-recovery/system-protection' },
  'recovery-options': { label: 'Recovery options in Windows (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/experience/backup-recovery/recovery-options-in-windows' },
  'wifi': { label: 'Corrigir problemas de conexão Wi-Fi no Windows (Suporte Microsoft)', url: 'https://support.microsoft.com/en-us/windows/experience/connectivity-networking/fix-wi-fi-connection-issues-in-windows' },
  'ping': { label: 'ping: referência do comando (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping' },
  'tcpip-troubleshooting': { label: 'Solução de problemas de comunicação TCP/IP (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-tcp-ip-communication-guidance' },
  'bsod': { label: 'Solução de problemas de reinicializações e códigos de parada (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/experience/performance-optimization/troubleshooting-windows-unexpected-restarts-and-stop-code-errors' },
  'bugchecks': { label: 'Bug checks (Stop code errors): referência de códigos (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/bug-checks--blue-screens-' },
  'event41': { label: 'Event ID 41: encerramento não limpo (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/event-id-41-restart' },
  'drivers-dm': { label: 'Atualizar ou reverter drivers no Windows (Suporte Microsoft, em inglês)', url: 'https://support.microsoft.com/en-us/windows/update-drivers-through-device-manager-in-windows-ec62f46c-ff14-c91d-eead-d7126dc1f7b6' },
  'win10-lifecycle': { label: 'Ciclo de vida do Windows 10 Home e Pro (Microsoft Learn, em inglês)', url: 'https://learn.microsoft.com/en-us/lifecycle/products/windows-10-home-and-pro' }
}

// Comandos do Guia (id do comando → fontes). Lista vazia = sem fonte oficial verificada.
export const commandSources = {
  sfc: ['sfc-learn', 'sfc-support'],
  dism: ['dism-repair', 'dism-opcoes', 'dism-source', 'dism-inventory'],
  revert: ['dism-opcoes', 'winre', 'uninstall-update'],
  'temp-user': ['space-suporte', 'storage-sense', 'env-vars'],
  'temp-sys': ['space-suporte', 'storage-sense', 'env-vars'],
  prefetch: [],
  cleanmgr: ['cleanmgr-learn', 'space-suporte', 'storage-sense', 'windows-old'],
  dns: ['ipconfig-learn'],
  msconfig: ['msconfig-suporte', 'cleanboot', 'startup-apps', 'bcdedit'],
  chkdsk: ['chkdsk-learn', 'crystal', 'seagate-diagnostics', 'seagate-bad-sectors', 'seagate-smart'],
  'chkdsk-ssd': ['chkdsk-learn', 'crystal', 'seagate-diagnostics', 'seagate-bad-sectors', 'seagate-smart'],
  winsock: ['winsock-learn'],
  mdsched: ['mdsched-support'],
  taskmgr: ['taskmgr-learn', 'perf-tips', 'startup-apps']
}

// Etapas do Roteiro (id da etapa → fontes)
export const stepSources = {
  p0: ['restore', 'recovery-options'],
  s1: ['taskmgr-learn', 'perf-tips', 'crystal', 'seagate-smart'],
  s2: ['cleanboot', 'msconfig-suporte', 'startup-apps'],
  s3: ['space-suporte', 'storage-sense', 'cleanmgr-learn', 'windows-old', 'env-vars'],
  s4: ['dism-repair', 'dism-source', 'dism-inventory', 'sfc-learn', 'ipconfig-learn'],
  i1: ['wifi'],
  i2: ['wifi', 'ipconfig-learn', 'winsock-learn', 'ping', 'tcpip-troubleshooting'],
  i3: ['wifi', 'tcpip-troubleshooting'],
  b1: ['bsod', 'bugchecks', 'event41'],
  b2: ['mdsched-support', 'chkdsk-learn', 'crystal', 'seagate-diagnostics', 'seagate-bad-sectors', 'seagate-smart'],
  b3: ['dism-repair', 'dism-source', 'dism-inventory', 'sfc-learn'],
  b4: ['drivers-dm', 'uninstall-update', 'recovery-options', 'win10-lifecycle'],
  b5: ['bsod', 'win10-lifecycle']
}

// Devolve a lista de fontes de uma chave; undefined = nunca cadastrado
export const getSources = (map, id) => map[id]?.map((key) => SOURCES[key])
