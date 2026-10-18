# Cuidados operacionais com dados de clientes

## Escopo e limites do aplicativo

O Katana Tech Hub salva favoritos, checklist, notas e histórico no `localStorage` do perfil atual do navegador. O aplicativo não implementa criptografia própria, login, sincronização ou controle de acesso por usuário. Quem tiver acesso ao mesmo perfil/dispositivo poderá acessar os dados. O histórico mantém no máximo 50 registros, mas não apaga automaticamente registros por idade.

O backup exportado é um arquivo JSON legível, sem criptografia aplicada pelo aplicativo. Ele pode incluir nome do cliente, equipamento, tipo/status do atendimento, duração, texto da mensagem e detalhes escritos nas notas. O número de telefone digitado no formulário do relatório não é guardado no histórico; evite, de todo modo, copiar esse número para notas ou mensagens.

## Procedimento recomendado

1. **Minimização:** registre apenas o que é necessário para executar e documentar o atendimento. Prefira identificador curto ou iniciais quando o nome completo não for necessário. Não registre senhas, códigos de recuperação, chaves de licença, credenciais de acesso remoto, dados financeiros ou outras informações sensíveis.
2. **Acesso:** use um perfil individual do sistema operacional e do navegador, protegido por senha/bloqueio de tela. Não use o site em computador público, perfil compartilhado ou sessão deixada aberta. Bloqueie o dispositivo ao se afastar.
3. **Retenção no navegador:** revise o histórico periodicamente e exclua registros encerrados quando já não forem necessários para suporte. O limite de 50 é apenas um teto, não um prazo. O responsável pela operação deve definir o prazo aplicável considerando as necessidades da empresa e obrigações pertinentes.
4. **Exportação:** exporte somente quando necessário para migração ou cópia de segurança. Salve o JSON em pasta privada, com acesso restrito e proteção do dispositivo/volume; se o sistema disponibilizar criptografia de disco ou pasta, use-a. Não coloque o arquivo em link público, pasta compartilhada ampla ou serviço pessoal não autorizado.
5. **Transporte e restauração:** antes de enviar um backup, confirme destinatário e canal aprovado; proteja o arquivo durante o transporte. Importe apenas backups de origem confiável, confira se os dados foram incorporados corretamente e remova cópias temporárias. A importação mescla registros e o histórico continua limitado aos 50 mais recentes.
6. **Descarte:** quando a cópia deixar de ser necessária, apague o arquivo do local de armazenamento e de eventuais cópias temporárias. Excluir do aplicativo ou da pasta não equivale a uma promessa de apagamento forense; o tratamento de cópias em nuvem, snapshots e lixeira depende do sistema usado.
7. **Incidente:** se o dispositivo/arquivo for perdido ou compartilhado indevidamente, avise o responsável pela operação, restrinja o acesso quando possível e siga o procedimento interno aplicável. Não prometa que o aplicativo consegue revogar ou apagar uma cópia já exportada.

## Limitação e decisão de produto

Esta política é uma prática operacional para o desenho local atual; não é certificação de conformidade jurídica. Se a operação precisar de acesso multiusuário, sincronização, trilha central, criptografia gerenciada, retenção automática ou exclusão remota, isso exige um projeto de arquitetura separado. Até lá, não trate o aplicativo como CRM nem como repositório central de dados de clientes.
