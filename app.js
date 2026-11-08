// ============================================================================
// PORTAL DE ESTUDOS — PROF. JERÔNIMO SILVA
// Arquitetura Definitiva:
//   Tela 1 (Recepção Acolhedora por Modalidade e Código da Turma)
//   Tela 2 (Apostila Digital com Menu Lateral — mostra APENAS o que já foi dado!)
// ============================================================================

let currentView = "home"; // 'home' | 'turma'
let activeTurmaId = "excel-407";
let activeChapterId = "caderno-01";

// CATÁLOGO DE ÁREAS E TURMAS NA TELA INICIAL
const AREAS_ENSINO = [
  {
    icone: "📊",
    titulo: "Excel do Básico ao Avançado",
    descricao: "Planilhas modulares, funções financeiras/lógicas, auditoria de erros, formatação condicional e dashboards.",
    turmas: [
      { id: "excel-407", nome: "Turma 407 — SENAC Aldeota (Noite)", ativa: true, tag: "Em andamento" }
    ]
  },
  {
    icone: "💻",
    titulo: "Programação de Sistemas",
    descricao: "Lógica de programação com JavaScript e Python, orientação a objetos, banco de dados SQL e projetos práticos.",
    turmas: [
      { id: "prog-1082", nome: "Turma 1082 — Programador de Sistemas", ativa: false, tag: "Arquivo" },
      { id: "prog-573", nome: "Turma 573 — Programador de Sistemas", ativa: false, tag: "Arquivo" }
    ]
  },
  {
    icone: "📈",
    titulo: "Ciência de Dados & ML",
    descricao: "Tratamento de dados com Pandas, estatística aplicada, visualização e modelos preditivos Scikit-Learn.",
    turmas: [
      { id: "dados-42", nome: "Turma 2026.07.42 — Analista de Dados", ativa: false, tag: "Arquivo" }
    ]
  },
  {
    icone: "🇬🇧",
    titulo: "English with Jeronimo (EWJ)",
    descricao: "Inglês prático, pronúncia conectada e conversação estruturada para carreira e tecnologia.",
    turmas: [
      { id: "ewj-mod1", nome: "Módulo 01 — Foundations & Fluency", ativa: false, tag: "Em preparo" }
    ]
  }
];

// CADERNOS DA TURMA EXCEL 407 (Compatível com publicar_modulo.py)
// Somente os itens com "liberado: true" aparecem no menu lateral da turma!
const CADERNOS_EXCEL = [
  {
    codigo: "01",
    id: "caderno-01",
    titulo: "Manipulação, Sequências e Colagem Especial",
    subtitulo: "Fundamentos de produtividade para trabalhar sem depender de digitação manual repetitiva.",
    arquivo: "downloads/excel/01_Manipulacao_Sequencias_e_Colagem.xlsx",
    liberado: true,
    encontro: "Caderno 01 • Aulas 01 e 02",
    conceitosChave: [
      {
        titulo: "🖱️ Os 4 Cursores do Mouse",
        texto: "Cruz Branca Grossa seleciona; Setas de 4 pontas movem; Cruz Preta Fina (+) no cantinho copia ou cria sequência; Dupla Seta no cabeçalho ajusta a largura."
      },
      {
        titulo: "🔢 O Segredo da Sequência (1 e 2)",
        texto: "Se você digitar só '1' e puxar a alça, o Excel repete 1, 1, 1. Digite '1' na primeira célula e '2' na de baixo, selecione AS DUAS juntas e puxe!"
      },
      {
        titulo: "🧹 Limpeza Rápida (Ctrl + U)",
        texto: "Precisa remover um código sujo como 'REF#' de 500 linhas? Abra o Substituir (Ctrl + U), digite 'REF#' em Localizar e deixe 'Substituir por' em branco!"
      },
      {
        titulo: "📋 Colar Apenas Valores (123)",
        texto: "Quando quiser copiar o resultado de uma conta sem levar a fórmula junto, use Colar Especial → Valores (ou Ctrl + Alt + V)."
      }
    ],
    abas: [
      ["01.1 — Seleção e Navegação", "Treino de salto rápido com Ctrl + Setas, seleção de tabelas inteiras com Ctrl + Shift + Setas e uso dos cursores."],
      ["01.2 — Alça de Preenchimento", "Criação automática de sequências numéricas, pares/ímpares, datas comerciais, meses do ano e dias da semana."],
      ["01.3 — Localizar e Substituir", "Auditoria e higienização de cadastros removendo símbolos indesejados e padronizando nomes de setores."],
      ["01.4 — Colar Especial", "Colar Valores, Colar Transposto (virar linha em coluna) e Colar Especial com Operação Matemática (multiplicar/somar em lote)."],
      ["01.5 — Desafio de Consolidação", "3 exercícios completos de 20 linhas reunindo todas as técnicas da primeira planilha."]
    ],
    dicaImportante: "Ao terminar uma coluna grande, dê um DUPLO CLIQUE na cruz preta fina (+) no canto inferior direito da célula: o Excel preenche sozinho até a última linha da tabela!"
  },
  {
    codigo: "02",
    id: "caderno-02",
    titulo: "Formatação Visual, Grupo Número e Condicional",
    subtitulo: "Como deixar suas planilhas com padrão executivo, máscaras numéricas corretas e alertas automáticos de cor.",
    arquivo: "downloads/excel/02_Formatacao_Grupo_Numero_e_Condicional.xlsx",
    liberado: true,
    encontro: "Caderno 02 • Aulas 03 e 04",
    conceitosChave: [
      {
        titulo: "↩️ Quebra de Linha (Alt + Enter)",
        texto: "Para escrever em duas linhas dentro da MESMA célula sem mudar para a célula de baixo, segure Alt e aperte Enter."
      },
      {
        titulo: "🖌️ Pincel com Duplo Clique",
        texto: "Um clique no Pincel copia o visual uma única vez. Dois cliques rápidos travam o Pincel ligado para você pintar quantas tabelas quiser (aperte Esc para soltar)."
      },
      {
        titulo: "💰 Moeda vs. Contábil",
        texto: "No formato Moeda, o R$ fica colado no número. No Contábil, o R$ fica alinhado na esquerda da célula, os centavos ficam alinhados e o zero vira um traço (R$ -)."
      },
      {
        titulo: "🆔 Zeros à Esquerda (00000)",
        texto: "O Excel apaga zeros à esquerda por padrão. Para manter códigos como 00125, clique com o Botão Direito → Formatar Células → Personalizado e digite 00000!"
      }
    ],
    abas: [
      ["02.1 — Fonte, Alinhamento e Pincel", "Hierarquia visual, Mesclar e Centralizar, Quebra de Texto Automática (Alt+Enter), Bordas e Pincel de Formatação."],
      ["02.2 — Grupo Número", "Aplicação correta de Moeda, Contábil, Porcentagem (%), Separador de Milhar, Casas Decimais, Datas e Horas."],
      ["02.3 — Máscaras Personalizadas", "Caminho: Botão Direito → Formatar Células (ou setinha ↘ do Grupo Número). Máscaras para CEP (00000-000), CPF, Telefone e unidades (0,00\" kg\")."],
      ["02.4 — Formatação Condicional", "Regras de realce automático (Maior que, Menor que, Entre, Texto que contém, Duplicados), Primeiros/Últimos e Barras de Dados."],
      ["02.5 — Desafio de Consolidação", "3 exercícios de 20 linhas aplicando formatação numérica e alertas visuais."]
    ],
    dicaImportante: "Regra de Ouro do Excel: NUNCA digite 'R$', pontos de milhar ou unidades como 'kg' dentro de uma célula que vai entrar em cálculo! Digite só o número puro e formate pelo menu Número."
  },
  {
    codigo: "03",
    id: "caderno-03",
    titulo: "Expressões, Parênteses, Datas e Funções Base",
    subtitulo: "Precedência matemática com parênteses, folha de ponto de 2 turnos, =HOJE() e funções SOMA, MÉDIA, MÁXIMO e MÍNIMO.",
    arquivo: "downloads/excel/03_Expressoes_Parenteses_Datas_e_Funcoes_Base.xlsx",
    liberado: false,
    encontro: "Caderno 03 • Cálculos e Funções Base",
    conceitosChave: [
      { titulo: "➗ Expressão vs. Função", texto: "Expressão (=B7+C7) serve para poucos itens; Função (=SOMA(B7:B50)) resolve grandes intervalos de uma só vez." },
      { titulo: "🔢 Ordem dos Parênteses ()", texto: "O Excel resolve 1º Parênteses (), 2º Potência (^), 3º Multiplicação/Divisão e 4º Soma/Subtração." },
      { titulo: "⏰ Datas e Horas (*24)", texto: "Datas são dias inteiros; horas são frações do dia. Multiplique horas por 24 para converter hh:mm em número decimal!" },
      { titulo: "📊 SOMA, MÉDIA, MÁX e MÍN", texto: "Dois-pontos (:) seleciona intervalo contínuo (ATÉ); ponto e vírgula (;) seleciona células alternadas (E)." }
    ],
    abas: [
      ["03.1 — Expressões e Parênteses ()", "Precedência matemática, cálculo de médias com parênteses e potenciação (^)."],
      ["03.2 — Datas, Horas e =HOJE()", "Soma de prazos, folha de ponto de 2 turnos e conversão para horas decimais (*24)."],
      ["03.3 — Funções SOMA e MÉDIA", "Atalho Alt + =, diferença entre célula vazia e zero na média, e intervalos contínuos vs. alternados."],
      ["03.4 — Funções MÁXIMO e MÍNIMO", "Cotação de preços entre lojas para descobrir o menor preço, o maior preço e a amplitude."],
      ["03.5 — Desafio de Consolidação", "3 cenários de 20 linhas integrando parênteses, datas e estatística básica."]
    ],
    dicaImportante: "Cuidado na função =MÉDIA(): uma célula vazia (em branco) é ignorada na divisão, mas uma célula com 0 (zero) entra na conta e derruba a média!"
  },
  {
    codigo: "04",
    id: "caderno-04",
    titulo: "Cadernão de Prática Integrada — Bloco 01",
    subtitulo: "Revisão acumulativa unindo Autopreenchimento, Ctrl+U, Formatação, Parênteses, Datas e SOMA/MÉDIA/MÁX/MÍN.",
    arquivo: "downloads/excel/04_Pratica_Integrada_Bloco_01.xlsx",
    liberado: false,
    encontro: "Caderno 04 • Consolidação Bloco 01",
    conceitosChave: [
      { titulo: "🛒 Fechamento de Varejo", texto: "Séries de códigos, limpeza Ctrl+U, receita líquida com parênteses e formatação condicional." },
      { titulo: "🚚 Logística e Frota", texto: "Cálculo de dias de viagem, consumo km/L e custo operacional." },
      { titulo: "👥 Folha de Ponto e RH", texto: "Tempo de casa com =HOJE(), horas extras (1,5x) e resumo estatístico." }
    ],
    abas: [
      ["04.1 — Fechamento Varejo (25 linhas)", "Auditoria completa de vendas da rede varejista."],
      ["04.2 — Logística e Frota (20 linhas)", "Relatório de viagens rodoviárias e eficiência de combustível."],
      ["04.3 — RH, Ponto e Folha (20 linhas)", "Fechamento salarial e tempo de casa dinâmico."]
    ],
    dicaImportante: "Resolva uma etapa do enunciado por vez e confira sempre as linhas de SOMA, MÉDIA, MÍNIMO e MÁXIMO no rodapé da tabela."
  },
  {
    codigo: "05",
    id: "caderno-05",
    titulo: "Referência Absoluta ($F4) e Auditoria dos 5 Erros",
    subtitulo: "Trava de células com F4 ($A$1), impostos de Nota Fiscal (CSLL/PIS/COFINS) e correção de #NOME?, #VALOR! e #DIV/0!.",
    arquivo: "downloads/excel/05_Referencia_Absoluta_e_Auditoria_de_Erros.xlsx",
    liberado: false,
    encontro: "Caderno 05 • Trava F4 e Auditoria",
    conceitosChave: [
      { titulo: "🔒 Trava com F4 ($A$1)", texto: "Sempre que multiplicar ou dividir por uma taxa fixa fora da tabela, aperte F4 para colocar os cifrões antes de arrastar!" },
      { titulo: "🧾 Impostos de Nota Fiscal", texto: "Cálculo de retenções CSLL, PIS e COFINS travando cada alíquota do painel superior." },
      { titulo: "🚨 Os 5 Erros Clássicos", texto: "#NOME? (função escrita errada), #VALOR! (conta + com texto), #DIV/0! (divisão por zero/sem $), #REF! e #NÚM!." }
    ],
    abas: [
      ["05.1 — Trava F4 e Impostos de NF", "Reajuste salarial, câmbio US$, Nota Fiscal (CSLL/PIS/COFINS), inflação e imobiliária."],
      ["05.2 — Participação % e Mista", "Cálculo de % Share sobre o total travado e matrizes 2D com referência mista."],
      ["05.3 — Auditoria dos 5 Erros", "Diagnóstico e correção prática de fórmulas quebradas."],
      ["05.4 — Simuladores Paramétricos", "Precificação de importação, PIX vs. Cartão, obras e frota."],
      ["05.5 — Desafio de Consolidação", "3 tabelas de 20 linhas combinando $F4 e prevenção de erros."]
    ],
    dicaImportante: "Se aparecer ##### na célula, não se assuste: não é erro de fórmula! Basta dar duplo-clique na divisória da coluna para alargá-la."
  },
  {
    codigo: "06",
    id: "caderno-06",
    titulo: "Operadores de Comparação e Dominando a Função =SE()",
    subtitulo: "Testes lógicos e tomada de decisão automática com textos, comissões, descontos e datas de vencimento.",
    arquivo: "downloads/excel/06_Comparadores_e_Funcao_SE_Fundamentos.xlsx",
    liberado: false,
    encontro: "Caderno 06 • Lógica e Função SE",
    conceitosChave: [
      { titulo: "⚖️ Os 6 Comparadores", texto: "Igual (=), Maior (>), Menor (<), Maior ou Igual (>=), Menor ou Igual (<=) e Diferente (<>)." },
      { titulo: "🚦 Anatomia da Função SE", texto: "=SE(teste_lógico; valor_se_verdadeiro; valor_se_falso). Textos ficam entre aspas; contas não levam aspas!" },
      { titulo: "⚠️ Sem Ponto de Milhar no Teste", texto: "Dentro do teste lógico, escreva =SE(D21>20000; ...) liso, nunca 20.000 com ponto!" }
    ],
    abas: [
      ["06.1 — Operadores de Comparação", "Testes lógicos retornando VERDADEIRO ou FALSO."],
      ["06.2 — SE com Retorno de Texto", "CNH, notas escolares, farmácia (<50) e regra sem ponto de milhar."],
      ["06.3 — SE com Cálculo Embutido", "Comissão de 15%, meia-entrada (/2), desconto >20000 e adicional >800."],
      ["06.4 — SE com Datas e Trava $F4", "Comparação Pagamento > Vencimento, cálculo de dias em atraso e metas fixas."],
      ["06.5 — Desafio de Consolidação", "3 tabelas de 20 linhas consolidando toda a função SE."]
    ],
    dicaImportante: "Para evitar dias negativos em boletos pagos adiantado, use: =SE(Data_Pag > Vencimento; Data_Pag - Vencimento; 0)."
  },
  {
    codigo: "07",
    id: "caderno-07",
    titulo: "SE c/ Funções e Formatação Condicional por Fórmula",
    subtitulo: "Como aninhar funções estatísticas no SE e usar fórmulas personalizadas para pintar linhas inteiras da tabela.",
    arquivo: "downloads/excel/07_SE_Avancado_e_Formatacao_Condicional_Formulas.xlsx",
    liberado: false,
    encontro: "Caderno 07 • Condicional Avançada",
    conceitosChave: [
      { titulo: "🧮 SE com MÉDIA e MÍNIMO", texto: "Podemos testar uma função direto no SE: =SE(MÉDIA(B7:E7)>=7; \"Aprovado\"; \"Recuperação\")." },
      { titulo: "🎨 Pintar a Linha Inteira (=$E7)", texto: "Selecione a tabela A7:E16 e use a fórmula =$E7=\"Em atraso\" (travando só a coluna $) para pintar toda a linha!" }
    ],
    abas: [
      ["07.1 — SE com Funções Embutidas", "Uso de SOMA, MÉDIA, MÍNIMO e MÁXIMO dentro do teste lógico do SE."],
      ["07.2 — Condicional c/ Fórmula Base", "Comparando duas colunas linha a linha (=C7>B7)."],
      ["07.3 — Pintar a Linha Inteira", "Destaque automático de linhas completas com trava mista (=$E7)."],
      ["07.4 — Condicional com Funções", "Destacando automaticamente a loja mais barata de cada linha (=B7=MÍNIMO($B7:$E7))."],
      ["07.5 — Desafio de Consolidação", "Painel de 20 unidades operacionais."]
    ],
    dicaImportante: "Ao criar uma regra condicional por fórmula para a linha inteira, olhe sempre para a PRIMEIRA linha da sua seleção e trave apenas a letra da coluna ($E7)."
  },
  {
    codigo: "08",
    id: "caderno-08",
    titulo: "Cadernão de Prática Integrada — Bloco 02",
    subtitulo: "Consolidação geral unindo $F4, Impostos de NF, Função SE e Formatação Condicional por Fórmula.",
    arquivo: "downloads/excel/08_Pratica_Integrada_Bloco_02.xlsx",
    liberado: false,
    encontro: "Caderno 08 • Consolidação Bloco 02",
    conceitosChave: [
      { titulo: "🧾 Retenção Fiscal e Bônus", texto: "CSLL/PIS/COFINS com $F4 + SE de meta + linha inteira pintada." },
      { titulo: "📅 Carteira de Cobrança", texto: "Auditoria de vencimentos, dias de atraso, multa/juros e alerta visual." },
      { titulo: "🏥 Central de Compras", texto: "Cotação em 4 distribuidoras + reposição automática de estoque crítico." }
    ],
    abas: [
      ["08.1 — Fiscal e Comissões (20 linhas)", "Auditoria de 20 Notas Fiscais com retenção e bônus."],
      ["08.2 — Prazos e Multas (20 linhas)", "Controle de cobrança de 20 duplicatas."],
      ["08.3 — Cotação e Estoque SE (20 linhas)", "Central de compras hospitalares em 4 lojas."]
    ],
    dicaImportante: "Este cadernão prepara você para os módulos avançados (PROCV, SOMASE, Tabelas Dinâmicas e Projeto Final)!"
  }
];

// GLOSSÁRIO TÉCNICO E DE ATALHOS (ESTILO ADS RECAPS — Com Tags Clicáveis para o Caderno!)
const GLOSSARIO_EXCEL = [
  {
    termo: "Alça de Preenchimento (Cruz Preta Fina +)",
    def: "Cursor exibido ao apontar para o quadradinho no canto inferior direito da seleção. Serve para copiar fórmulas ou gerar sequências. <strong>Dica:</strong> para sequências numéricas (1, 2, 3...), digite <code>1</code> e <code>2</code> nas duas primeiras células e selecione ambas antes de puxar!",
    cadernoId: "caderno-01",
    fonte: "📗 Caderno 01 • Aba 01.2"
  },
  {
    termo: "Alt + Enter (Quebra de Linha Interna)",
    def: "Atalho que força o texto a descer para uma segunda linha <strong>dentro da mesma célula</strong>, sem pular para a célula de baixo. Excelente para cabeçalhos compactos.",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.1"
  },
  {
    termo: "Colar Especial — Apenas Valores (123)",
    def: "Copia apenas o resultado final de uma conta, descartando a fórmula original e a formatação de cor. Acesso via <strong>Botão Direito → Ícone 123</strong> ou <kbd class='light-kbd'>Ctrl + Alt + V</kbd>.",
    cadernoId: "caderno-01",
    fonte: "📗 Caderno 01 • Aba 01.4"
  },
  {
    termo: "Colar Especial — Transpor",
    def: "Inverte a orientação da tabela copiada: o que estava em linha vira coluna, e o que estava em coluna vira linha.",
    cadernoId: "caderno-01",
    fonte: "📗 Caderno 01 • Aba 01.4"
  },
  {
    termo: "Contábil vs. Moeda (Grupo Número)",
    def: "No formato <strong>Moeda</strong>, o <code>R$</code> fica colado ao número. No <strong>Contábil</strong>, o <code>R$</code> fica alinhado à esquerda da célula, os decimais ficam perfeitamente alinhados e o zero vira um traço (<code>R$ -</code>).",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.2"
  },
  {
    termo: "Ctrl + Shift + Setas (Seleção Relâmpago)",
    def: "Seleciona instantaneamente todas as células preenchidas até o final da tabela (para baixo ou para o lado), evitando arrastar o mouse por centenas de linhas.",
    cadernoId: "caderno-01",
    fonte: "📗 Caderno 01 • Aba 01.1"
  },
  {
    termo: "Ctrl + U / Ctrl + L (Localizar e Substituir)",
    def: "Ferramenta de limpeza em massa. Para arrancar um prefixo sujo (ex.: <code>REF#</code>) de toda uma coluna, digite <code>REF#</code> em Localizar, deixe <em>Substituir por</em> vazio e clique em Substituir Tudo.",
    cadernoId: "caderno-01",
    fonte: "📗 Caderno 01 • Aba 01.3"
  },
  {
    termo: "Formatar Células (Máscaras Personalizadas)",
    def: "Janela avançada de formatação. Abra clicando com o <strong>Botão Direito → Formatar Células...</strong> ou na <strong>setinha diagonal (↘)</strong> no canto inferior direito do bloco <em>Número</em>.",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.3"
  },
  {
    termo: "Formatação Condicional (Regras Visuais)",
    def: "Muda automaticamente a cor de fundo ou da fonte de acordo com o valor da célula (ex.: destacar em vermelho valores menores que a meta, textos 'Atrasado' ou valores duplicados).",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.4"
  },
  {
    termo: "Pincel de Formatação (Duplo Clique)",
    def: "Copia toda a estética (cor, fonte, borda e formato de número) de uma célula para outra. Dando <strong>duplo-clique</strong> no ícone do Pincel, ele permanece ativo para pintar várias tabelas seguidas.",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.1"
  },
  {
    termo: "Unidades na Máscara (0\" Unidades\" / 0,00\" kg\")",
    def: "Nunca digite palavras como 'kg' ou 'unid' junto com o número! Digite apenas o número puro e, em <strong>Formatar Células → Personalizado</strong>, coloque o texto entre aspas após o zero: <code>0\" Unidades\"</code>.",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.3"
  },
  {
    termo: "Zeros à Esquerda (Máscara 00000 e CPF)",
    def: "Para obrigar o Excel a exibir zeros à esquerda em matrículas ou códigos, abra <strong>Formatar Células → Personalizado</strong> e digite <code>00000</code> (5 dígitos) ou <code>000.000.000-00</code> para CPF.",
    cadernoId: "caderno-02",
    fonte: "📗 Caderno 02 • Aba 02.3"
  }
];

function goHome() {
  currentView = "home";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openTurma(turmaId) {
  if (turmaId !== "excel-407") {
    alert("Esta turma será disponibilizada em breve! No momento estamos com a Turma 407 de Excel ativa.");
    return;
  }
  activeTurmaId = turmaId;
  currentView = "turma";
  activeChapterId = "caderno-01";
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openChapter(chapId) {
  activeChapterId = chapId;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div class="brand" onclick="goHome()">
        <div class="brand-logo">JS</div>
        <div class="brand-text">
          <h1>Portal de Estudos — Prof. Jerônimo Silva</h1>
          <span>Materiais de Aula, Cadernos Práticos e Guias de Revisão</span>
        </div>
      </div>
      ${currentView === "turma" ? `
        <button class="btn-back-home" onclick="goHome()">
          ← Trocar de Turma / Voltar ao Início
        </button>
      ` : ""}
    </header>
  `;
}

// TELA 1: RECEPÇÃO POR ÁREAS E TURMAS
function renderHomeView() {
  return `
    ${renderTopbar()}
    <div class="home-wrapper">
      <div class="home-container">
        <div class="home-hero">
          <span class="home-hero-badge">Ambiente de Apoio ao Aluno</span>
          <h2>Olá! Selecione a sua turma para começar</h2>
          <p>Cada turma possui seu próprio caderno digital atualizado aula a aula com as planilhas oficiais e resumos práticos.</p>
        </div>

        <div class="areas-grid">
          ${AREAS_ENSINO.map(area => `
            <div class="area-card">
              <div>
                <span class="area-icon">${area.icone}</span>
                <h3>${area.titulo}</h3>
                <p>${area.descricao}</p>
              </div>
              <div>
                <span class="turmas-group-label">Selecione sua turma:</span>
                <div class="turmas-list">
                  ${area.turmas.map(t => `
                    <button class="btn-turma ${t.ativa ? 'active-turma' : 'secondary-turma'}" onclick="openTurma('${t.id}')">
                      <span>${t.nome}</span>
                      <span>${t.ativa ? 'Entrar →' : t.tag}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// TELA 2: APOSTILA DIGITAL DA TURMA (SEM ITENS BLOQUEADOS!)
function renderTurmaView() {
  const liberados = CADERNOS_EXCEL.filter(c => c.liberado);

  let contentHtml = "";

  if (activeChapterId === "boas-vindas") {
    contentHtml = `
      <div class="chapter-tag">Informações da Turma</div>
      <h2 class="chapter-title">👋 Bem-vindo à Turma de Excel (SENAC Aldeota)</h2>
      <p class="chapter-lead">
        Este é o caderno digital exclusivo da nossa turma. Sempre que avançarmos para uma nova planilha em sala de aula, ela aparecerá automaticamente no menu ao lado para você baixar e revisar!
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

      <div class="pager-row">
        <span></span>
        <button class="pager-btn" onclick="openChapter('${liberados[0].id}')">Ir para o Caderno 01 →</button>
      </div>
    `;
  } else if (activeChapterId === "atalhos") {
    const lastLib = liberados[liberados.length - 1];
    contentHtml = `
      <div class="chapter-tag">Consulta Rápida em Sala (Estilo Glossário)</div>
      <h2 class="chapter-title">📚 Glossário Prático & Guia de Atalhos (${GLOSSARIO_EXCEL.length} termos)</h2>
      <p class="chapter-lead">Pesquise rapidamente por qualquer ferramenta, atalho ou máscara vista em aula. Clique na etiqueta verde no rodapé do cartão para ir direto ao caderno onde o recurso foi praticado:</p>

      <input
        type="text"
        id="glossarySearchInput"
        class="glossary-search"
        placeholder="🔍 Filtrar termo, comando ou atalho (ex.: Moeda, Alt + Enter, Pincel, Zeros, Valores, Quebrar Texto)..."
        oninput="filterGlossary(this.value)"
      />

      <div id="glossaryGrid" class="glossary-grid">
        ${renderGlossaryCards(GLOSSARIO_EXCEL)}
      </div>

      <div class="pager-row">
        <button class="pager-btn" onclick="openChapter('${lastLib.id}')">← Voltar ao Caderno ${lastLib.codigo}</button>
        <span></span>
      </div>
    `;
  } else {
    const cad = liberados.find(c => c.id === activeChapterId) || liberados[0];
    const idx = liberados.findIndex(c => c.id === cad.id);
    const prevId = idx === 0 ? "boas-vindas" : liberados[idx - 1].id;
    const prevLabel = idx === 0 ? "← Boas-vindas" : `← Caderno ${liberados[idx - 1].codigo}`;
    const nextId = idx < liberados.length - 1 ? liberados[idx + 1].id : "atalhos";
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
        <a class="btn-dl" href="${cad.arquivo}" download>📥 Baixar Planilha ${cad.codigo} (.xlsx)</a>
      </div>

      <h3 class="section-h3">🎯 Resumo dos Pontos-Chave desta Planilha</h3>
      <div class="concept-grid">
        ${cad.conceitosChave.map(k => `
          <div class="concept-card">
            <strong>${k.titulo}</strong>
            <p>${k.texto}</p>
          </div>
        `).join("")}
      </div>

      <div class="callout-tip">
        <strong>💡 Dica de Ouro vista em Sala:</strong> ${cad.dicaImportante}
      </div>

      <h3 class="section-h3">📑 O que praticamos em cada aba da planilha (Clique para expandir)</h3>
      <div>
        ${cad.abas.map((aba, i) => `
          <div class="accordion-item ${i === 0 ? 'open' : ''}" onclick="this.classList.toggle('open')">
            <button class="accordion-header">
              <span>Aba ${aba[0]}</span>
              <span>▾</span>
            </button>
            <div class="accordion-body">${aba[1]}</div>
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
          <span>Turma Selecionada</span>
          <strong>📊 Excel 407 — SENAC Aldeota</strong>
        </div>

        <div class="nav-section-title">Orientações & Consulta</div>
        <button class="nav-item ${activeChapterId === 'boas-vindas' ? 'active' : ''}" onclick="openChapter('boas-vindas')">
          👋 Boas-vindas da Turma
        </button>
        <button class="nav-item ${activeChapterId === 'atalhos' ? 'active' : ''}" onclick="openChapter('atalhos')">
          📚 Glossário & Atalhos
        </button>

        <div class="nav-section-title">Cadernos Ministrados</div>
        ${liberados.map(c => `
          <button class="nav-item ${activeChapterId === c.id ? 'active' : ''}" onclick="openChapter('${c.id}')">
            📗 Caderno ${c.codigo}: ${c.titulo.split(',')[0]}
          </button>
        `).join("")}
      </aside>

      <main class="content-area">
        ${contentHtml}
      </main>
    </div>
  `;
}

function renderGlossaryCards(items) {
  if (!items.length) {
    return `<div class="concept-card" style="grid-column: 1 / -1;"><strong>Nenhum termo encontrado</strong><p>Tente pesquisar por outra palavra-chave (ex.: Moeda, Valores, Data, Pincel).</p></div>`;
  }
  return items.map(g => `
    <div class="glossary-card">
      <div class="glossary-term">${g.termo}</div>
      <div class="glossary-def">${g.definicao}</div>
      <div class="glossary-sources">
        <button class="source-tag" onclick="openChapter('${g.cadernoId}')" title="Ir para este caderno">
          ${g.fonte} →
        </button>
      </div>
    </div>
  `).join("");
}

function filterGlossary(query) {
  const q = (query || "").toLowerCase().trim();
  const filtered = !q
    ? GLOSSARIO_EXCEL
    : GLOSSARIO_EXCEL.filter(g =>
        g.termo.toLowerCase().includes(q) ||
        g.definicao.toLowerCase().includes(q) ||
        g.fonte.toLowerCase().includes(q)
      );
  const grid = document.getElementById("glossaryGrid");
  if (grid) {
    grid.innerHTML = renderGlossaryCards(filtered);
  }
}

function renderApp() {
  const root = document.getElementById("appRoot");
  root.innerHTML = currentView === "home" ? renderHomeView() : renderTurmaView();
}

window.addEventListener("DOMContentLoaded", () => {
  renderApp();
});
