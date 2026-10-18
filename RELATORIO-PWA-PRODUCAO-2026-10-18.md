# Verificação do PWA publicado — 18/10/2026

## Escopo e ambiente

Verificação somente de leitura do endereço público `https://guia-de-comandos-pc.vercel.app/`, em Chromium no sandbox. O viewport foi configurado para **390 × 844 px** para aproximar um celular, mas isso é emulação — não é um telefone real. Nenhuma instalação foi concluída e nenhuma alteração/deploy foi feito no site.

## Achado principal: produção está desatualizada

O site publicado exibe **v2.10.4**. O código enviado pelo usuário é v2.12.0, e o patch de acessibilidade produzido nesta tarefa é v2.12.1. Portanto, os testes abaixo descrevem **o PWA atual em produção (v2.10.4)**, não o pacote v2.12.1.

## Resultado do smoke test

- A página respondeu **HTTP 200** em HTTPS, em contexto seguro.
- O service worker `/sw.js` está registrado, ativado e controlando a página.
- Cache ativo: `katana-shell-2.10.4-03dc9a02`, contendo `index.html`, raiz `/`, JavaScript, CSS, `manifest.webmanifest` e ícones.
- Manifest respondeu **200**; declara `display: standalone`, escopo e início `./`, idioma `pt-BR`, ícones 192×192, 512×512 e maskable, além de atalhos para Roteiro e Histórico.
- Após abrir uma vez online, simulei a desconexão e recarreguei a página. O service worker respondeu **200** do cache e o app voltou a renderizar navegação e conteúdo. Assim, o caminho offline básico passou no Chromium.
- A única solicitação que falhou sem rede foi a fonte remota do Google Fonts. A interface e os comandos continuaram acessíveis usando as fontes de fallback do sistema; a aparência tipográfica pode variar offline.
- O aviso/botão de instalação estava visível. Não acionei o prompt nem concluí a instalação.

## Limitações e próximos passos

1. O domínio publicado não está na versão que o usuário enviou nem no patch corrigido; é necessário publicar v2.12.1 antes de validar o pacote mais recente em produção.
2. Não foi possível executar o teste em aparelho físico: a lista de dispositivos autorizados nesta sessão contém apenas o Manus Sandbox. Falta testar Android/Chrome e iPhone/Safari reais.
3. No telefone real, confirmar instalação e abertura em modo standalone, recarga em modo avião depois do primeiro acesso, atalhos (Android), safe areas/notch, retorno à rede e aviso de nova versão após deploy.

**Conclusão:** o PWA publicado atualmente (v2.10.4) passou no teste básico de carregamento offline por service worker em Chromium com viewport móvel emulado. Isso não substitui a validação do v2.12.1 depois do deploy nem os testes em aparelhos reais.
