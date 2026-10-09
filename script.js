/* =========================================================
   SCRIPT.JS — Guia de Comandos & Roteiro de Atendimento
   ========================================================= */

// ÂNCORA: seleção dos elementos usados no site
const navLinks      = document.querySelectorAll('.nav-link');
const sections      = {
  comandos: document.getElementById('pageComandos'),
  roteiro:  document.getElementById('pageRoteiro')
};
const searchBox     = document.getElementById('searchBox');
const searchInput   = document.getElementById('searchInput');
const subtitle      = document.getElementById('headerSubtitle');
const tabButtons    = document.querySelectorAll('.tab-btn');
const cards         = document.querySelectorAll('.card');
const emptyState    = document.getElementById('emptyState');

const subtitles = {
  comandos: 'Manual prático de comandos de CMD e Executar para manutenção, otimização e limpeza profissional do Windows.',
  roteiro:  'Passo a passo sequencial para triagem, diagnóstico e otimização em atendimentos remotos.'
};

// ÂNCORA: estado dos filtros (busca e categoria funcionam juntas)
const filters = { term: '', category: 'all' };

/* ---------------------------------------------------------
   1) TROCA DE PÁGINA
   --------------------------------------------------------- */
function switchPage(page) {
  Object.entries(sections).forEach(([name, section]) => {
    section.classList.toggle('active-section', name === page);
  });

  navLinks.forEach(btn => {
    const isActive = btn.dataset.page === page;
    btn.classList.toggle('active-nav', isActive);
    if (isActive) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  searchBox.hidden = (page !== 'comandos');
  subtitle.textContent = subtitles[page];

  // Lembra a última aba (try/catch: o storage pode estar bloqueado)
  try { localStorage.setItem('katana-page', page); } catch (e) { /* ignora */ }
}

navLinks.forEach(btn => {
  btn.addEventListener('click', () => switchPage(btn.dataset.page));
});

/* ---------------------------------------------------------
   2) COPIAR COMANDO
   --------------------------------------------------------- */
async function copyCode(button, text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Plano B para navegadores sem Clipboard API (ou sem HTTPS)
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }

  const original = button.textContent;
  button.textContent = 'Copiado!';
  button.classList.add('copied');
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove('copied');
  }, 2000);
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => copyCode(btn, btn.dataset.copy));
});

/* ---------------------------------------------------------
   3) FILTROS (BUSCA + CATEGORIA)
   --------------------------------------------------------- */
function applyFilters() {
  let visibleCount = 0;

  cards.forEach(card => {
    // Texto pesquisável: título + descrição + comando
    const text = (
      card.querySelector('h3').textContent + ' ' +
      card.querySelector('p').textContent + ' ' +
      card.querySelector('code').textContent
    ).toLowerCase();

    const categories = card.dataset.category.split(' ');

    const matchesTerm = text.includes(filters.term);
    const matchesCategory = filters.category === 'all' || categories.includes(filters.category);

    const show = matchesTerm && matchesCategory;
    card.hidden = !show;
    if (show) visibleCount++;
  });

  emptyState.hidden = visibleCount > 0;
}

searchInput.addEventListener('input', () => {
  filters.term = searchInput.value.trim().toLowerCase();
  applyFilters();
});

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.category = btn.dataset.category;

    tabButtons.forEach(b => {
      const isActive = (b === btn);
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });

    applyFilters();
  });
});

/* ---------------------------------------------------------
   4) INICIALIZAÇÃO
   --------------------------------------------------------- */
let savedPage = 'comandos';
try { savedPage = localStorage.getItem('katana-page') || 'comandos'; } catch (e) { /* ignora */ }
switchPage(sections[savedPage] ? savedPage : 'comandos');

/* =========================================================
   EXPLICAÇÃO DA LÓGICA (para estudo)
   - filters guarda busca e categoria juntas; applyFilters()
     confere as duas condições (&&) em cada card. Antes, cada
     filtro mostrava/ocultava cards sozinho e um desfazia o outro.
   - card.hidden usa o atributo nativo hidden (com a regra
     [hidden]{display:none} no CSS), em vez de style.display.
   - data-copy guarda o comando no próprio botão: o JS lê
     btn.dataset.copy, sem onclick dentro do HTML.
   ========================================================= */