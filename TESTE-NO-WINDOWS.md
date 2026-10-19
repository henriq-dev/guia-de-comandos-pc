# Roteiro de teste dos comandos em um Windows de verdade

Faça em uma máquina sua (de preferência virtual ou de teste), nunca em computador de cliente. Abra o Prompt de Comando **como administrador**. Marque o resultado de cada linha e anote qualquer diferença entre o que o site diz e o que aconteceu.

Ordem: do mais leve ao mais pesado.

| # | Comando | O que esperar | Funcionou? | Observação |
|---|---|---|---|---|
| 1 | `ping 8.8.8.8` | 4 respostas com tempo em ms | | |
| 2 | `ipconfig /all` | lista de adaptadores, IP, DNS | | |
| 3 | `ipconfig /flushdns` | "Cache de resolução DNS limpo" | | |
| 4 | `sfc /scannow` | demora; termina com um resultado (sem violações ou reparou arquivos) | | |
| 5 | `DISM /Online /Cleanup-Image /CheckHealth` | rápido; diz se há corrupção marcada | | |
| 6 | `DISM /Online /Cleanup-Image /ScanHealth` | demora; varre a imagem | | |
| 7 | `DISM /Online /Cleanup-Image /RestoreHealth` | só se o ScanHealth achou problema; precisa de internet | | |
| 8 | `chkdsk` (sem parâmetros) | só lê e relata, não corrige | | |
| 9 | `mdsched` | pede reinício para testar a memória (só se quiser testar) | | |
| 10 | Limpeza: `%temp%` e `cleanmgr` | arquivos temporários apagáveis; nada pessoal | | |

Faça por último, e só se aceitar perder a conexão por instantes:

| # | Comando | Cuidado | Funcionou? | Observação |
|---|---|---|---|---|
| 11 | `ipconfig /release` e depois `ipconfig /renew` | derruba e refaz a conexão | | |
| 12 | `netsh winsock reset` | pede reinício; pode afetar VPN e antivírus | | |
| 13 | `chkdsk C: /r` | só com backup; demora horas e roda no reinício | | |

Não execute `DISM ... /revertpendingactions`: o site restringe esse comando à recuperação de um Windows que não inicia.

## Ao terminar
- Se algum comando não fez o que o site diz, me envie o número, o comando e a mensagem exibida, para corrigir o texto.
- Anote a versão do Windows testada (Win + R → `winver`).
