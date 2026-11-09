// ============================================================================
// PORTAL DE ENSINO — PROF. JERONIMO SILVA
// Arquitetura Front-End + Banco Relacional SQLite (portal_ensino.db via sql.js)
// ============================================================================

let db = null; // Instância ativa do banco SQLite (sql.js)
let currentView = "home"; // 'home' | 'turma' | 'sobre'
let activeTurmaSlug = "excel-407";
let activeChapterId = "boas-vindas"; // 'boas-vindas' | 'atalhos' | slug do caderno
let currentTheme = localStorage.getItem("portal_ensino_theme") || "light";

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("portal_ensino_theme", theme);
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.classList.add("dark-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.classList.remove("dark-theme");
  }
}

function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  renderApp();
}

// Utilitário para executar SELECT no SQLite retornando array de objetos [{col: val}, ...]
function queryAll(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ============================================================================
// CONSULTAS RELACIONAIS SQL (SQLite)
// ============================================================================

function getModalidadesComTurmas() {
  const modalidades = queryAll(`
    SELECT id, slug, titulo, icone, descricao
    FROM modalidades
    ORDER BY ordem ASC;
  `);

  return modalidades.map(m => {
    const turmas = queryAll(`
      SELECT id, codigo, slug, nome, unidade, tag_status, ativa
      FROM turmas
      WHERE modalidade_id = ?
      ORDER BY ordem ASC;
    `, [m.id]);
    return { ...m, turmas };
  });
}

function getTurmaBySlug(slug) {
  return queryOne(`
    SELECT t.id, t.codigo, t.slug, t.nome, t.unidade, t.tag_status, t.ativa,
           m.id AS modalidade_id, m.titulo AS modalidade_titulo, m.icone AS modalidade_icone
    FROM turmas t
    INNER JOIN modalidades m ON t.modalidade_id = m.id
    WHERE t.slug = ?;
  `, [slug]);
}

function getCadernosLiberadosDaTurma(turmaId) {
  return queryAll(`
    SELECT c.id, c.codigo, c.slug, c.encontro, c.titulo, c.subtitulo, c.arquivo_xlsx, c.dica_ouro
    FROM cadernos c
    INNER JOIN turma_cadernos tc ON tc.caderno_id = c.id
    WHERE tc.turma_id = ? AND tc.liberado = 1
    ORDER BY c.ordem ASC;
  `, [turmaId]);
}

function getDetalhesCaderno(cadernoId) {
  const conceitos = queryAll(`
    SELECT titulo, texto
    FROM caderno_conceitos
    WHERE caderno_id = ?
    ORDER BY ordem ASC;
  `, [cadernoId]);

  const abas = queryAll(`
    SELECT titulo_aba, descricao
    FROM caderno_abas
    WHERE caderno_id = ?
    ORDER BY ordem ASC;
  `, [cadernoId]);

  return { conceitos, abas };
}

function getGlossarioDaTurma(turmaId, termoBusca = "") {
  const filtro = `%${(termoBusca || "").trim().toLowerCase()}%`;
  return queryAll(`
    SELECT g.id, g.termo, g.definicao, g.aba_ref, g.categoria,
           c.codigo AS caderno_codigo, c.slug AS caderno_slug
    FROM glossario g
    INNER JOIN cadernos c ON g.caderno_id = c.id
    INNER JOIN turma_cadernos tc ON tc.caderno_id = c.id
    WHERE tc.turma_id = ?
      AND tc.liberado = 1
      AND (
        ? = '%%'
        OR LOWER(g.termo) LIKE ?
        OR LOWER(g.definicao) LIKE ?
        OR LOWER(g.aba_ref) LIKE ?
        OR LOWER(c.codigo) LIKE ?
      )
    ORDER BY c.ordem ASC, g.ordem ASC;
  `, [turmaId, filtro, filtro, filtro, filtro, filtro]);
}

// ============================================================================
// NAVEGAÇÃO E COMPONENTES DE INTERFACE
// ============================================================================

function openTurma(turmaSlug) {
  const turma = getTurmaBySlug(turmaSlug);
  if (!turma || !turma.ativa) {
    alert("Esta turma estará disponível em breve aqui no portal!");
    return;
  }
  activeTurmaSlug = turmaSlug;
  currentView = "turma";
  activeChapterId = "boas-vindas";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  currentView = "home";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openSobreView() {
  currentView = "sobre";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openChapter(chapterSlug) {
  activeChapterId = chapterSlug;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTopbar() {
  const isDark = currentTheme === "dark";
  return `
    <header class="topbar">
      <div class="brand" onclick="goHome()">
        <div class="brand-badge">JS</div>
        <div class="brand-title">
          <h1>Portal de Ensino — Prof. Jeronimo Silva</h1>
          <p>Repositório de Aulas, Planilhas Oficiais e Cadernos de Exercícios</p>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn" onclick="toggleTheme()" title="Alternar tema claro/escuro">
          ${isDark ? '☀️ Claro' : '🌙 Escuro'}
        </button>
        ${currentView !== "sobre" ? `
          <button class="topbar-btn" onclick="openSobreView()" title="Conhecer perfil do professor">
            👨‍🏫 Sobre o Professor
          </button>
        ` : ""}
        ${currentView !== "home" ? `
          <button class="btn-back-home" onclick="goHome()">
            ← Início
          </button>
        ` : ""}
      </div>
    </header>
  `;
}

// TELA 1: RECEPÇÃO POR MODALIDADES E CÓDIGOS DE TURMA
function renderHomeView() {
  const areas = getModalidadesComTurmas();

  return `
    ${renderTopbar()}
    <div class="home-wrapper">
      <div class="home-container">
        <div class="home-hero">
          <span class="home-hero-badge">Ambiente de Apoio ao Aluno</span>
          <h2>Olá! Selecione a sua área de estudo</h2>
          <p>Materiais de apoio, cadernos de exercícios e planilhas práticas para acelerar sua produtividade.</p>
        </div>

        <div class="areas-grid">
          ${areas.map(area => {
            const hasTurmas = area.turmas && area.turmas.length > 0;
            return `
              <div class="area-card">
                <div>
                  <span class="area-icon">${area.icone}</span>
                  <h3>${area.titulo}</h3>
                  <p>${area.descricao}</p>
                </div>
                <div>
                  ${hasTurmas ? `
                    <button class="btn-entrar" onclick="openTurma('${area.turmas[0].slug}')">
                      <span>Entrar</span>
                      <span>→</span>
                    </button>
                  ` : `
                    <div class="em-breve-container">
                      <span class="badge-em-breve">Em breve</span>
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="home-discreet-footer">
          Portal desenvolvido e mantido pelo <a href="javascript:void(0)" onclick="openSobreView()">Prof. Jeronimo Silva</a>
        </div>
      </div>
    </div>
  `;
}

// TELA DEDICADA: SOBRE O PROFESSOR (COM FOTO OFICIAL & REDES)
function renderSobreView() {
  return `
    ${renderTopbar()}
    <div class="home-wrapper">
      <div class="home-container">
        <div class="sobre-profile-card">
          <div class="sobre-profile-header">
            <div class="profile-photo-wrapper">
              <img src="assets/jeronimo_perfil.jpg" alt="Prof. Jeronimo Silva" class="profile-photo" />
            </div>
            <div class="profile-header-info">
              <span class="teacher-tag">Um pouco sobre mim</span>
              <h2>Prof. Jeronimo Silva</h2>
              <p class="profile-role">Instrutor de Tecnologia & Produtividade</p>
              
              <div class="teacher-social-grid">
                <a href="https://www.linkedin.com/in/jeronimo-jrsilva/" target="_blank" rel="noopener noreferrer" class="social-btn linkedin">
                  <span class="social-icon">💼</span>
                  <span class="social-meta">
                    <strong>LinkedIn</strong>
                    <small>in/jeronimo-jrsilva</small>
                  </span>
                </a>
                <a href="https://github.com/jeronimo-jrsilva" target="_blank" rel="noopener noreferrer" class="social-btn github">
                  <span class="social-icon">🐙</span>
                  <span class="social-meta">
                    <strong>GitHub</strong>
                    <small>@jeronimo-jrsilva</small>
                  </span>
                </a>
                <a href="https://instagram.com/englishwithjeronimo" target="_blank" rel="noopener noreferrer" class="social-btn instagram">
                  <span class="social-icon">📸</span>
                  <span class="social-meta">
                    <strong>Instagram</strong>
                    <small>@englishwithjeronimo</small>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div class="sobre-body">
            <p style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 24px;">
              Oi! Eu sou o Jeronimo. Meu objetivo como professor é bem direto: tirar o medo de encarar planilhas cheias de números, fórmulas ou códigos, e mostrar como essas ferramentas podem trabalhar a seu favor no dia a dia — economizando tempo e evitando retrabalho.
            </p>

            <h3 class="section-h3">🎯 Como funcionam as nossas aulas</h3>
            <p>
              Ninguém aprende a dominar o Excel ou a programar só olhando outra pessoa fazer. Por isso, nossas aulas são práticas desde o primeiro minuto, divididas em três etapas simples:
            </p>
            <div class="concept-grid" style="margin: 20px 0;">
              <div class="concept-card">
                <strong>1. Fazemos juntos primeiro</strong>
                <p>A gente abre o arquivo, entende a lógica com calma e resolve o primeiro exemplo sem pressa, tirando as dúvidas na hora.</p>
              </div>
              <div class="concept-card">
                <strong>2. Você assume o controle</strong>
                <p>Com a ideia clara, você pratica em exercícios parecidos com situações reais que aparecem em qualquer empresa ou escritório.</p>
              </div>
              <div class="concept-card">
                <strong>3. Desafios para fixar</strong>
                <p>Pequenos problemas mais abertos para você pensar na solução por conta própria e ganhar confiança de verdade.</p>
              </div>
            </div>

            <h3 class="section-h3" style="margin-top: 28px;">💻 Por que este portal existe?</h3>
            <p>
              Em sala de aula o ritmo flui, mas é em casa ou no trabalho que as dúvidas costumam aparecer. Montei este espaço para você ter sempre à mão as planilhas originais de cada encontro, os resumos dos pontos principais e um glossário prático de atalhos para consultar quando precisar.
            </p>

            <div class="sobre-actions">
              <button class="pager-btn" onclick="goHome()">← Voltar ao Início</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// TELA 2: APOSTILA DIGITAL DA TURMA (CONSULTA SQLITE POR TURMA)
function renderTurmaView() {
  const turma = getTurmaBySlug(activeTurmaSlug);
  const liberados = getCadernosLiberadosDaTurma(turma.id);

  let contentHtml = "";

  if (activeChapterId === "boas-vindas") {
    const primeiroCaderno = liberados[0];
    contentHtml = `
      <div class="chapter-tag">Caderno Digital • ${turma.modalidade_titulo}</div>
      <h2 class="chapter-title">👋 Bem-vindo ao material de ${turma.modalidade_titulo}</h2>
      <p class="chapter-lead">
        Este é o caderno digital do nosso curso. Sempre que avançarmos para uma nova planilha em sala de aula, ela aparecerá automaticamente no menu ao lado para você baixar e revisar!
      </p>

      <h3 class="section-h3">Como aproveitar melhor este material?</h3>
      <div class="concept-grid">
        <div class="concept-card">
          <strong>1. Navegue pelo menu lateral</strong>
          <p>Cada capítulo à esquerda corresponde a uma planilha trabalhada em sala, na ordem exata do nosso curso.</p>
        </div>
        <div class="concept-card">
          <strong>2. Baixe o arquivo .xlsx</strong>
          <p>Clique no botão verde no topo da aula para salvar a planilha no seu computador e praticar os 3 níveis de exercício.</p>
        </div>
        <div class="concept-card">
          <strong>3. Consulte o Glossário Prático</strong>
          <p>Esqueceu algum comando, atalho ou máscara numérica durante o exercício? Clique em <em>"📚 Glossário & Atalhos"</em> no menu!</p>
        </div>
      </div>

      ${primeiroCaderno ? `
        <div class="pager-row">
          <span></span>
          <button class="pager-btn" onclick="openChapter('${primeiroCaderno.slug}')">Ir para o Caderno ${primeiroCaderno.codigo} →</button>
        </div>
      ` : ""}
    `;
  } else if (activeChapterId === "atalhos") {
    const lastLib = liberados[liberados.length - 1];
    const itensGlossario = getGlossarioDaTurma(turma.id, "");

    contentHtml = `
      <div class="chapter-tag">Consulta Rápida em Sala (Banco Relacional SQLite)</div>
      <h2 class="chapter-title">📚 Glossário Prático & Guia de Atalhos (${itensGlossario.length} termos liberados)</h2>
      <p class="chapter-lead">Pesquise rapidamente por qualquer ferramenta, atalho ou máscara vista nas aulas já ministradas. Clique na etiqueta verde no rodapé do cartão para abrir o caderno correspondente:</p>

      <input
        type="text"
        id="glossarySearchInput"
        class="glossary-search"
        placeholder="🔍 Filtrar termo, comando ou atalho (ex.: Moeda, Alt + Enter, Pincel, Zeros, Valores, #####)..."
        oninput="filterGlossary(this.value)"
      />

      <div id="glossaryGrid" class="glossary-grid">
        ${renderGlossaryCards(itensGlossario)}
      </div>

      ${lastLib ? `
        <div class="pager-row">
          <button class="pager-btn" onclick="openChapter('${lastLib.slug}')">← Voltar ao Caderno ${lastLib.codigo}</button>
          <span></span>
        </div>
      ` : ""}
    `;
  } else {
    const cad = liberados.find(c => c.slug === activeChapterId) || liberados[0];
    const { conceitos, abas } = getDetalhesCaderno(cad.id);
    const idx = liberados.findIndex(c => c.slug === cad.slug);
    const prevId = idx === 0 ? "boas-vindas" : liberados[idx - 1].slug;
    const prevLabel = idx === 0 ? "← Boas-vindas" : `← Caderno ${liberados[idx - 1].codigo}`;
    const nextId = idx < liberados.length - 1 ? liberados[idx + 1].slug : "atalhos";
    const nextLabel = idx < liberados.length - 1 ? `Próximo: Caderno ${liberados[idx + 1].codigo} →` : "Glossário & Atalhos →";

    contentHtml = `
      <div class="chapter-tag">${cad.encontro}</div>
      <h2 class="chapter-title">📘 Caderno ${cad.codigo}: ${cad.titulo}</h2>
      <p class="chapter-lead">${cad.subtitulo}</p>

      <div class="download-banner">
        <div>
          <h4>📂 Planilha Oficial da Aula (.xlsx)</h4>
          <p>Arquivo estruturado em 5 abas independentes (Nível 1 Guiado → Nível 2 Fixação → Nível 3 Desafio).</p>
        </div>
        <a class="btn-dl" href="${cad.arquivo_xlsx}" download>📥 Baixar Planilha ${cad.codigo} (.xlsx)</a>
      </div>

      <h3 class="section-h3">🎯 Resumo dos Pontos-Chave desta Planilha</h3>
      <div class="concept-grid">
        ${conceitos.map(k => `
          <div class="concept-card">
            <strong>${k.titulo}</strong>
            <p>${k.texto}</p>
          </div>
        `).join("")}
      </div>

      <div class="callout-tip">
        <strong>💡 Dica de Ouro vista em Sala:</strong> ${cad.dica_ouro}
      </div>

      <h3 class="section-h3">📑 O que praticamos em cada aba da planilha (Clique para expandir)</h3>
      <div>
        ${abas.map((aba, i) => `
          <div class="accordion-item ${i === 0 ? 'open' : ''}" onclick="this.classList.toggle('open')">
            <button class="accordion-header">
              <span>Aba ${aba.titulo_aba}</span>
              <span>▾</span>
            </button>
            <div class="accordion-body">${aba.descricao}</div>
          </div>
        `).join("")}
      </div>

      <div class="pager-row">
        <button class="pager-btn" onclick="openChapter('${prevId}')">${prevLabel}</button>
        <button class="pager-btn" onclick="openChapter('${nextId}')">${nextLabel}</button>
      </div>
    `;
  }

  return `
    ${renderTopbar()}
    <div class="classroom-layout">
      <aside class="sidebar">
        <div class="turma-badge-box">
          <span>Curso Selecionado</span>
          <strong>${turma.modalidade_icone} ${turma.modalidade_titulo}</strong>
        </div>

        <div class="nav-section-title">Orientações & Consulta</div>
        <button class="nav-item ${activeChapterId === 'boas-vindas' ? 'active' : ''}" onclick="openChapter('boas-vindas')">
          👋 Boas-vindas
        </button>
        <button class="nav-item ${activeChapterId === 'atalhos' ? 'active' : ''}" onclick="openChapter('atalhos')">
          📚 Glossário & Atalhos
        </button>
        <button class="nav-item" onclick="openSobreView()">
          👨‍🏫 Sobre o Professor
        </button>

        <div class="nav-section-title">Cadernos Ministrados</div>
        ${liberados.map(c => `
          <button class="nav-item ${activeChapterId === c.slug ? 'active' : ''}" onclick="openChapter('${c.slug}')">
            📗 Caderno ${c.codigo}: ${c.titulo.split(',')[0]}
          </button>
        `).join("")}

        <div class="sidebar-teacher-box">
          <div class="sidebar-teacher-header" onclick="openSobreView()" style="cursor: pointer;" title="Conhecer perfil do professor">
            <img src="assets/jeronimo_perfil.jpg" alt="Prof. Jeronimo Silva" class="teacher-avatar-sm-img" />
            <div>
              <div class="sidebar-teacher-name">Prof. Jeronimo Silva</div>
              <div class="sidebar-teacher-sub">Ver perfil com foto →</div>
            </div>
          </div>
          <div class="sidebar-social-links">
            <a href="https://www.linkedin.com/in/jeronimo-jrsilva/" target="_blank" rel="noopener noreferrer" title="LinkedIn">💼</a>
            <a href="https://github.com/jeronimo-jrsilva" target="_blank" rel="noopener noreferrer" title="GitHub">🐙</a>
            <a href="https://instagram.com/englishwithjeronimo" target="_blank" rel="noopener noreferrer" title="Instagram">📸</a>
          </div>
        </div>
      </aside>

      <main class="content-area">
        ${contentHtml}
      </main>
    </div>
  `;
}

function renderGlossaryCards(items) {
  if (!items.length) {
    return `<div class="concept-card" style="grid-column: 1 / -1;"><strong>Nenhum termo encontrado</strong><p>Tente pesquisar por outra palavra-chave (ex.: Moeda, Valores, Pincel, Zeros).</p></div>`;
  }
  return items.map(g => `
    <div class="glossary-card">
      <div class="glossary-term">${g.termo}</div>
      <div class="glossary-def">${g.definicao}</div>
      <div class="glossary-sources">
        <button class="source-tag" onclick="openChapter('${g.caderno_slug}')" title="Abrir Caderno ${g.caderno_codigo}">
          📗 Caderno ${g.caderno_codigo} • ${g.aba_ref} →
        </button>
      </div>
    </div>
  `).join("");
}

function filterGlossary(query) {
  const turma = getTurmaBySlug(activeTurmaSlug);
  const filtered = getGlossarioDaTurma(turma.id, query);
  const grid = document.getElementById("glossaryGrid");
  if (grid) {
    grid.innerHTML = renderGlossaryCards(filtered);
  }
}

function renderApp() {
  const root = document.getElementById("appRoot");
  if (!db) {
    root.innerHTML = `
      ${renderTopbar()}
      <div class="home-wrapper">
        <div class="home-container" style="text-align:center; padding-top:60px;">
          <p style="color:var(--text-muted); font-size:1rem;">Carregando banco de dados SQLite (<code>portal_ensino.db</code>)...</p>
        </div>
      </div>
    `;
    return;
  }
  if (currentView === "home") {
    root.innerHTML = renderHomeView();
  } else if (currentView === "sobre") {
    root.innerHTML = renderSobreView();
  } else {
    root.innerHTML = renderTurmaView();
  }
}

// ============================================================================
// INICIALIZAÇÃO DO BANCO SQLITE (sql.js WebAssembly + portal_ensino.db)
// ============================================================================
async function bootSqlitePortal() {
  applyTheme(currentTheme);
  renderApp();
  try {
    const SQL = await initSqlJs({
      locateFile: file => `vendor/${file}`
    });
    // Cache-bust leve usando timestamp de versão para garantir leitura fresca após atualizações
    const response = await fetch(`portal_ensino.db?v=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Falha ao carregar portal_ensino.db (HTTP ${response.status})`);
    }
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));
    renderApp();
  } catch (err) {
    console.error("Erro ao inicializar SQLite:", err);
    document.getElementById("appRoot").innerHTML = `
      ${renderTopbar()}
      <div class="home-wrapper">
        <div class="home-container">
          <div class="callout-tip" style="border-left-color:#dc2626; background:#fef2f2; color:#991b1b;">
            <strong>⚠️ Aviso de Carregamento Local:</strong> Não foi possível abrir <code>portal_ensino.db</code> via protocolo <code>file://</code> (bloqueio de segurança CORS do navegador).
            Para visualizar localmente no computador, acesse pelo link oficial no ar (<strong>https://jeronimo-jrsilva.github.io/portal-ensino/</strong>) ou rode <code>python3 -m http.server 8080</code> nesta pasta.
          </div>
        </div>
      </div>
    `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  bootSqlitePortal();
});
