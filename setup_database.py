#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Modelagem e População Inicial do Banco de Dados Relacional SQLite (portal_ensino.db)
Portal de Ensino — Prof. Jerônimo Silva (SENAC)
"""

import os
import sqlite3

PORTAL_DIR = "/home/jeronimo/G-Sync/Aulas/Portal_Ensino"
DB_PATH = os.path.join(PORTAL_DIR, "portal_ensino.db")


def build_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON;")

    # 1. Tabela de Modalidades (Áreas de Ensino)
    cur.execute("""
    CREATE TABLE modalidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        titulo TEXT NOT NULL,
        icone TEXT NOT NULL,
        descricao TEXT NOT NULL,
        ordem INTEGER NOT NULL DEFAULT 1
    );
    """)

    # 2. Tabela de Turmas (ex.: Excel 407, Programador 1082, Inglês 573)
    cur.execute("""
    CREATE TABLE turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_senac TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        modalidade_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        unidade TEXT NOT NULL,
        tag_status TEXT NOT NULL,
        ativa INTEGER NOT NULL DEFAULT 0,
        ordem INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE
    );
    """)

    # 3. Tabela de Cadernos / Módulos (Conteúdo Base da Modalidade)
    cur.execute("""
    CREATE TABLE cadernos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modalidade_id INTEGER NOT NULL,
        codigo TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        encontro TEXT NOT NULL,
        titulo TEXT NOT NULL,
        subtitulo TEXT NOT NULL,
        arquivo_xlsx TEXT NOT NULL,
        dica_ouro TEXT NOT NULL,
        ordem INTEGER NOT NULL,
        FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE
    );
    """)

    # 4. Tabela Associativa Turma <-> Cadernos (N:N - Controle de Liberação por Turma)
    cur.execute("""
    CREATE TABLE turma_cadernos (
        turma_id INTEGER NOT NULL,
        caderno_id INTEGER NOT NULL,
        liberado INTEGER NOT NULL DEFAULT 0,
        data_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (turma_id, caderno_id),
        FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE,
        FOREIGN KEY (caderno_id) REFERENCES cadernos(id) ON DELETE CASCADE
    );
    """)

    # 5. Tabela de Conceitos-Chave de cada Caderno (1:N)
    cur.execute("""
    CREATE TABLE caderno_conceitos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caderno_id INTEGER NOT NULL,
        ordem INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        texto TEXT NOT NULL,
        FOREIGN KEY (caderno_id) REFERENCES cadernos(id) ON DELETE CASCADE
    );
    """)

    # 6. Tabela de Abas Práticas de cada Caderno (1:N)
    cur.execute("""
    CREATE TABLE caderno_abas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caderno_id INTEGER NOT NULL,
        ordem INTEGER NOT NULL,
        titulo_aba TEXT NOT NULL,
        descricao TEXT NOT NULL,
        FOREIGN KEY (caderno_id) REFERENCES cadernos(id) ON DELETE CASCADE
    );
    """)

    # 7. Tabela de Glossário & Atalhos (Vinculada à Modalidade e ao Caderno de Origem)
    cur.execute("""
    CREATE TABLE glossario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modalidade_id INTEGER NOT NULL,
        caderno_id INTEGER NOT NULL,
        aba_ref TEXT NOT NULL,
        termo TEXT NOT NULL,
        definicao TEXT NOT NULL,
        categoria TEXT NOT NULL DEFAULT 'Comando',
        ordem INTEGER NOT NULL,
        FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,
        FOREIGN KEY (caderno_id) REFERENCES cadernos(id) ON DELETE CASCADE
    );
    """)

    # =========================================================================
    # POPULAÇÃO INICIAL: MODALIDADES E TURMAS
    # =========================================================================
    modalidades_data = [
        (1, "excel", "Excel & Produtividade", "📊",
         "Domine planilhas do zero ao avançado: formatação profissional, funções lógicas (SE), auditoria de fórmulas e automação.", 1),
        (2, "programacao", "Programação & Sistemas", "💻",
         "Lógica de programação, algoritmos em Python, bancos de dados SQL e desenvolvimento de sistemas passo a passo.", 2),
        (3, "ingles", "Inglês Técnico & Conversação", "🌎",
         "Vocabulário aplicado à tecnologia e carreira, leitura instrumental e estruturas práticas para o dia a dia.", 3),
    ]
    cur.executemany(
        "INSERT INTO modalidades (id, slug, titulo, icone, descricao, ordem) VALUES (?, ?, ?, ?, ?, ?);",
        modalidades_data
    )

    turmas_data = [
        (1, "407", "excel-407", 1, "Turma 407 — SENAC Aldeota", "SENAC Aldeota", "Em andamento", 1, 1),
        (2, "1082", "prog-1082", 2, "Programador de Sistemas 1082", "SENAC", "Em breve", 0, 1),
        (3, "573", "ingles-573", 3, "Inglês 573", "SENAC", "Em breve", 0, 1),
    ]
    cur.executemany(
        "INSERT INTO turmas (id, codigo_senac, slug, modalidade_id, nome, unidade, tag_status, ativa, ordem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
        turmas_data
    )

    # =========================================================================
    # POPULAÇÃO INICIAL: CADERNOS DE EXCEL (01 A 08)
    # =========================================================================
    cadernos_raw = [
        {
            "id": 1,
            "codigo": "01",
            "slug": "caderno-01",
            "encontro": "Caderno 01 • Fundamentos Práticos",
            "titulo": "Manipulação, Sequências e Colagem Especial",
            "subtitulo": "Primeiros passos para ganhar velocidade no Excel: ajuste de colunas, autopreenchimento inteligente, primeiras fórmulas e colagem de valores.",
            "arquivo": "downloads/excel/01_Manipulacao_Sequencias_e_Colagem.xlsx",
            "liberado": 1,
            "dica_ouro": "Quando aparecer '#####' na célula, não é erro de cálculo! Significa apenas que a coluna está estreita demais para mostrar o número ou data. Dê duplo clique na divisória da coluna que o Excel ajusta na hora.",
            "conceitos": [
                ("🖱️ Os 3 Cursores do Excel", "Cruz Branca Grossa seleciona células; Setas Pretas na borda movem o conteúdo; Cruz Preta Fina no cantinho inferior direito arrasta séries e fórmulas."),
                ("⚡ Alça de Preenchimento", "Ao digitar dois números (ex.: 10 e 20), selecione OS DOIS juntos antes de puxar a cruz preta fina para o Excel entender o passo da sequência."),
                ("➕ Toda Fórmula começa com '='", "Nunca faça contas de cabeça! Use =A2+B2 (soma), =A2-B2 (subtração), =A2*B2 (multiplicação) e =A2/B2 (divisão)."),
                ("📋 Colar Valores (Ctrl+Alt+V)", "Remove a fórmula de trás da célula e congela apenas o resultado final fixo.")
            ],
            "abas": [
                ("01.1 — Ajuste e Manipulação", "Ajuste automático de largura de colunas (duplo clique na divisória entre letras), altura de linhas e correção do erro visual #####."),
                ("01.2 — Alça e Sequências", "Autopreenchimento de meses, dias da semana, códigos (ITEM-001) e progressões numéricas selecionando o par inicial."),
                ("01.3 — Cálculos Básicos", "Uso dos operadores +, -, * (multiplicação) e / (divisão) referenciando células e arrastando fórmulas."),
                ("01.4 — Colagem Especial", "Diferença entre Colar Tudo, Colar Valores (congelar resultado), Colar Fórmulas, Colar Formatos e Transpor (trocar linha por coluna)."),
                ("01.5 — Desafio de Consolidação", "3 exercícios práticos de 20 linhas integrando sequências, cálculos e colagem de valores.")
            ]
        },
        {
            "id": 2,
            "codigo": "02",
            "slug": "caderno-02",
            "encontro": "Caderno 02 • Apresentação e Alertas Visuais",
            "titulo": "Formatação, Grupo Número e Formatação Condicional",
            "subtitulo": "Como deixar a planilha com visual executivo, aplicar máscaras numéricas sem estragar cálculos e criar alertas automáticos por cor.",
            "arquivo": "downloads/excel/02_Formatacao_Grupo_Numero_e_Condicional.xlsx",
            "liberado": 1,
            "dica_ouro": "Regra de Ouro do Excel: NUNCA digite 'R$', pontos de milhar ou unidades como 'kg' dentro de uma célula que vai entrar em cálculo! Digite só o número puro e formate pelo menu Número.",
            "conceitos": [
                ("↩️ Quebra de Texto (Alt + Enter)", "Para escrever em duas linhas dentro da mesma célula sem precisar alargar a coluna inteira, use o botão 'Quebrar Texto Automaticamente' ou Alt + Enter."),
                ("🖌️ Pincel com Duplo Clique", "Um clique no Pincel copia o visual uma única vez. Dois cliques rápidos travam o Pincel ligado para você pintar quantas tabelas quiser (aperte Esc para soltar)."),
                ("💰 Moeda vs. Contábil", "No formato Moeda, o R$ fica colado no número. No Contábil, o R$ fica alinhado na esquerda da célula, os centavos ficam alinhados e o zero vira um traço (R$ -)."),
                ("🆔 Zeros à Esquerda (00000)", "O Excel apaga zeros à esquerda por padrão. Para manter códigos como 00125, clique com o Botão Direito → Formatar Células → Personalizado e digite 00000!")
            ],
            "abas": [
                ("02.1 — Fonte, Alinhamento e Pincel", "Hierarquia visual, Mesclar e Centralizar, Quebra de Texto Automática (Alt+Enter), Bordas e Pincel de Formatação."),
                ("02.2 — Grupo Número", "Aplicação correta de Moeda, Contábil, Porcentagem (%), Separador de Milhar, Casas Decimais, Datas e Horas."),
                ("02.3 — Máscaras Personalizadas", "Caminho: Botão Direito → Formatar Células (ou setinha ↘ do Grupo Número). Máscaras para CEP (00000-000), CPF, Telefone e unidades (0,00\" kg\")."),
                ("02.4 — Formatação Condicional", "Regras de realce automático (Maior que, Menor que, Entre, Texto que contém, Duplicados), Primeiros/Últimos e Barras de Dados."),
                ("02.5 — Desafio de Consolidação", "3 exercícios de 20 linhas aplicando formatação numérica e alertas visuais.")
            ]
        },
        {
            "id": 3,
            "codigo": "03",
            "slug": "caderno-03",
            "encontro": "Caderno 03 • Cálculos e Funções Base",
            "titulo": "Expressões, Parênteses, Datas e Funções Base",
            "subtitulo": "Precedência matemática com parênteses, folha de ponto de 2 turnos, =HOJE() e funções SOMA, MÉDIA, MÁXIMO e MÍNIMO.",
            "arquivo": "downloads/excel/03_Expressoes_Parenteses_Datas_e_Funcoes_Base.xlsx",
            "liberado": 0,
            "dica_ouro": "Cuidado com a armadilha da Média: escrever =A2+B2+C2/3 divide APENAS a célula C2 por 3! Sempre envolva a soma entre parênteses =(A2+B2+C2)/3 ou use =MÉDIA(A2:C2).",
            "conceitos": [
                ("🧮 Ordem dos Parênteses", "O Excel resolve multiplicação (*) e divisão (/) ANTES de soma (+) e subtração (-). Para somar antes de dividir, use parênteses: =(Nota1+Nota2)/2."),
                ("📅 Datas são Números", "Para o Excel, cada dia vale 1 número inteiro. Por isso você pode subtrair duas datas (=Vencimento - Hoje) para descobrir os dias de prazo!"),
                ("⏱️ Folha de Ponto (2 Turnos)", "Total de Horas = (Saída1 - Entrada1) + (Saída2 - Entrada2). Se somar mais de 24h no mês, use o formato personalizado [h]:mm."),
                ("📊 As 4 Funções Base", "=SOMA(A2:A20) soma tudo; =MÉDIA(A2:A20) calcula a média; =MÁXIMO(A2:A20) acha o maior valor; =MÍNIMO(A2:A20) acha o menor.")
            ],
            "abas": [
                ("03.1 — Parênteses e Precedência", "Ordem de cálculo do Excel, média na unha com parênteses, descontos comerciais e variação percentual =(Atual-Anterior)/Anterior."),
                ("03.2 — Cálculos com Datas e Horas", "Função =HOJE(), prazos em dias e Folha de Ponto completa de 2 turnos (Entrada/Saída Manhã + Tarde)."),
                ("03.3 — SOMA e MÉDIA", "Substituição de somas longas pelo intervalo dois-pontos (:) e atalho AutoSoma (Alt + =)."),
                ("03.4 — MÁXIMO e MÍNIMO", "Painel gerencial extraindo extremos de faturamento, notas e tempos de atendimento."),
                ("03.5 — Desafio de Consolidação", "3 exercícios de 20 linhas (Folha de Ponto, Boletim Escolar e Fechamento Comercial).")
            ]
        },
        {
            "id": 4,
            "codigo": "04",
            "slug": "caderno-04",
            "encontro": "Caderno 04 • Consolidação do Bloco 01",
            "titulo": "Prática Integrada — Revisão Geral do Bloco 01",
            "subtitulo": "4 projetos completos simulando situações reais de trabalho (Vendas, RH, Custos e Estoque) do zero ao painel executivo.",
            "arquivo": "downloads/excel/04_Pratica_Integrada_Bloco_01.xlsx",
            "liberado": 0,
            "dica_ouro": "Em qualquer planilha profissional, siga sempre a ordem: 1º Estrutura e Sequências → 2º Fórmulas e Funções → 3º Formatação Numérica → 4º Formatação Condicional.",
            "conceitos": [
                ("🏗️ Visão de Projeto Completo", "Integra tudo o que vimos nos Cadernos 01, 02 e 03 sem dicas prontas na fórmula, treinando autonomia real."),
                ("📈 Painel Resumo no Topo", "Toda boa planilha corporativa traz no topo ou rodapé os 4 indicadores rápidos: Total (SOMA), Média (MÉDIA), Maior (MÁXIMO) e Menor (MÍNIMO).")
            ],
            "abas": [
                ("04.1 — Fechamento Comercial", "Cálculo de receita bruta, descontos, receita líquida, formatação contábil e destaque de metas."),
                ("04.2 — RH e Folha de Ponto", "Controle de jornada em 2 turnos, banco de horas e resumo do setor."),
                ("04.3 — Controle de Custos", "Orçado vs. Executado, variação em R$ e % e alertas de estouro de orçamento."),
                ("04.4 — Giro de Estoque", "Controle de entradas, saídas, saldo físico, valor financeiro em estoque e alertas de reposição."),
                ("04.5 — Desafio Master Bloco 01", "3 estudos de caso de 20 linhas integrando todos os fundamentos.")
            ]
        },
        {
            "id": 5,
            "codigo": "05",
            "slug": "caderno-05",
            "encontro": "Caderno 05 • Travamento e Diagnóstico",
            "titulo": "Referência Absoluta ($) e Auditoria dos 5 Erros",
            "subtitulo": "Como travar células com o cifrão ($F$4), calcular impostos de Nota Fiscal, participação % no total e corrigir erros de fórmula.",
            "arquivo": "downloads/excel/05_Referencia_Absoluta_e_Auditoria_de_Erros.xlsx",
            "liberado": 0,
            "dica_ouro": "Pergunta mágica antes de arrastar uma fórmula: 'Esta célula faz parte da minha linha ou é uma célula única isolada fora da tabela?' Se for única (câmbio, imposto, total geral), trave com F4 ($F$4)!",
            "conceitos": [
                ("🔒 Travamento Absoluto ($F$4)", "Posicione o cursor na célula dentro da fórmula e aperte F4 (ou digite os cifrões $) para que ela não escorregue ao arrastar para baixo."),
                ("🧾 Nota Fiscal (CSLL, PIS, COFINS)", "Exemplo clássico de escritório: 3 colunas de impostos apontando para as alíquotas no topo da planilha."),
                ("🥧 Participação % no Total", "Fórmula =Valor_da_Linha / $Total_Geral_Travado. Permite descobrir quantos % cada filial ou produto representa no todo."),
                ("🩺 Os 5 Erros do Excel", "#NOME? (nome de função digitado errado), #VALOR! (conta matemática com texto), #DIV/0! (divisão por zero/vazio), #REF! (célula apagada) e #NÚM!.")
            ],
            "abas": [
                ("05.1 — O Problema do Escorregamento", "Diagnóstico visual do erro ao arrastar sem $ e travamento com F4 em câmbio e tabela de descontos."),
                ("05.2 — Nota Fiscal e Impostos", "Cálculo de CSLL (4,8%), PIS (0,65%), COFINS (3,0%) e Valor Líquido da NF com alíquotas fixas."),
                ("05.3 — Participação % e Ref. Mista", "Cálculo de % Share sobre o total geral travado e matriz cruzada com referência mista ($A4 e B$3)."),
                ("05.4 — Clínica dos 5 Erros", "Diagnóstico e conserto prático de #NOME?, #VALOR!, #DIV/0!, #REF! e #NÚM!."),
                ("05.5 — Desafio de Consolidação", "3 exercícios de 20 linhas com travamento de células e auditoria.")
            ]
        },
        {
            "id": 6,
            "codigo": "06",
            "slug": "caderno-06",
            "encontro": "Caderno 06 • Divisor de Águas: Lógica no Excel",
            "titulo": "Comparadores Lógicos e Função SE (Fundamentos)",
            "subtitulo": "Caderno 100% dedicado a dominar o raciocínio condicional: testes VERDADEIRO/FALSO e a estrutura em 3 passos da Função SE.",
            "arquivo": "downloads/excel/06_Comparadores_e_Funcao_SE_Fundamentos.xlsx",
            "liberado": 0,
            "dica_ouro": "Regra das Aspas na Função SE: Textos dentro da fórmula SEMPRE levam aspas duplas (\"Aprovado\"). Números, porcentagens e referências de células NUNCA levam aspas!",
            "conceitos": [
                ("⚖️ Os 6 Comparadores Lógicos", "= (Igual), > (Maior), < (Menor), >= (Maior ou igual), <= (Menor ou igual) e <> (Diferente). Toda comparação responde VERDADEIRO ou FALSO."),
                ("🔀 Anatomia da Função SE", "=SE( teste_lógico ; valor_se_verdadeiro ; valor_se_falso ). O primeiro ponto-e-vírgula significa 'ENTÃO' e o segundo significa 'SENÃO'."),
                ("💵 SE com Cálculo Matemático", "A Função SE não devolve apenas palavras! Ela pode calcular um bônus de 15% se bateu a meta ou 5% se não bateu: =SE(C4>=B4; C4*15%; C4*5%)."),
                ("📅 SE com Datas e Atraso", "Comparando o Vencimento com =HOJE(), a planilha informa sozinha se o boleto está 'Em atraso' ou 'No prazo' e calcula os dias vencidos.")
            ],
            "abas": [
                ("06.1 — Comparadores Lógicos", "Treino isolado dos 6 sinais (=, >, <, >=, <=, <>) gerando respostas booleanas VERDADEIRO ou FALSO."),
                ("06.2 — SE com Resposta em Texto", "Aprovado/Reprovado, Meta Batida/Abaixo da Meta e Repor Estoque/Estoque Normal."),
                ("06.3 — SE com Cálculo Matemático", "Comissões variáveis, descontos progressivos, horas extras e frete condicional."),
                ("06.4 — SE com Datas e $F$4", "Contas a pagar com cálculo de dias em atraso usando =HOJE() e parâmetros travados."),
                ("06.5 — Desafio de Consolidação", "3 exercícios de 20 linhas focados exclusivamente em dominar a Função SE.")
            ]
        },
        {
            "id": 7,
            "codigo": "07",
            "slug": "caderno-07",
            "encontro": "Caderno 07 • Lógica Combinada e Destaque de Linha",
            "titulo": "SE com Funções e Formatação Condicional com Fórmulas",
            "subtitulo": "Combinando SE com SOMA/MÉDIA/MÍN/MÁX e voltando à Formatação Condicional para criar regras inteligentes e pintar a linha inteira.",
            "arquivo": "downloads/excel/07_SE_Avancado_e_Formatacao_Condicional_Formulas.xlsx",
            "liberado": 0,
            "dica_ouro": "Para pintar a LINHA INTEIRA da tabela na Formatação Condicional, selecione apenas os dados (sem o cabeçalho!), coloque o cifrão APENAS na letra da coluna-gatilho (ex.: =$E7=\"Em atraso\") e use a linha inicial da seleção!",
            "conceitos": [
                ("🧩 SE com Funções Internas", "Você pode colocar MÉDIA, SOMA, MÍNIMO ou MÁXIMO dentro do teste da Função SE: =SE(MÉDIA(B4:E4)>=7; \"Aprovado\"; \"Recuperação\")."),
                ("🎨 Condicional comparando 2 Colunas", "Usando 'Usar uma fórmula para determinar quais células devem ser formatadas' (ex.: =C7>B7), o Excel compara cada linha com a meta específica dela."),
                ("🖍️ Pintar a Linha Inteira ($Coluna)", "O segredo da referência mista =$E7=\"Em atraso\": o cifrão trava a leitura na coluna E, fazendo as colunas A até F daquela linha mudarem de cor juntas!")
            ],
            "abas": [
                ("07.1 — SE com SOMA e MÉDIA", "Decisões automáticas baseadas na média do aluno ou na soma trimestral da equipe."),
                ("07.2 — SE com MÍNIMO e MÁXIMO", "Auditoria de qualidade (menor nota acima do piso) e controle de propostas de fornecedores."),
                ("07.3 — Condicional com Fórmulas", "Regras personalizadas comparando colunas linha a linha (=C7>B7, =E7<D7) sem limite de valor fixo."),
                ("07.4 — Pintando a Linha Inteira", "Passo a passo da referência mista na coluna (=$E7=\"Em atraso\") para destacar o registro completo."),
                ("07.5 — Desafio de Consolidação", "3 exercícios de 20 linhas unindo SE avançado e destaque de linha inteira.")
            ]
        },
        {
            "id": 8,
            "codigo": "08",
            "slug": "caderno-08",
            "encontro": "Caderno 08 • Consolidação do Bloco 02",
            "titulo": "Prática Integrada — Revisão Geral (Blocos 01 e 02)",
            "subtitulo": "3 Estudos de Caso Corporativos de 20 linhas integrando Referência Absoluta ($), Função SE e Formatação Condicional por Linha.",
            "arquivo": "downloads/excel/08_Pratica_Integrada_Bloco_02.xlsx",
            "liberado": 0,
            "dica_ouro": "Teste sempre sua planilha mudando 1 único parâmetro no painel do topo (ex.: subir a meta ou o dólar). Se todas as fórmulas SE e as cores das linhas mudarem sozinhas, sua automação está perfeita!",
            "conceitos": [
                ("🏢 Simulação Real de Trabalho", "Três cenários completos de 20 linhas que exigem combinar travamento F4, lógica SE e pintura automática de linhas.")
            ],
            "abas": [
                ("08.1 — Caso 1: Fiscal e Câmbio", "Importação em dólar, cálculo de impostos retidos na NF, SE de auditoria e destaque das linhas retidas."),
                ("08.2 — Caso 2: RH e Metas", "Avaliação trimestral com MÉDIA, MÍNIMO, bônus proporcional via SE e destaque da linha inteira."),
                ("08.3 — Caso 3: Tesouraria e SLA", "Contas a pagar + estoque mínimo com alertas de vencimento, juros diários e pintura de linha.")
            ]
        }
    ]

    for c in cadernos_raw:
        cur.execute("""
            INSERT INTO cadernos (id, modalidade_id, codigo, slug, encontro, titulo, subtitulo, arquivo_xlsx, dica_ouro, ordem)
            VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (c["id"], c["codigo"], c["slug"], c["encontro"], c["titulo"], c["subtitulo"], c["arquivo"], c["dica_ouro"], c["id"]))

        # Vincula à Turma 407 (turma_id = 1)
        cur.execute("""
            INSERT INTO turma_cadernos (turma_id, caderno_id, liberado)
            VALUES (1, ?, ?);
        """, (c["id"], c["liberado"]))

        for idx_conc, (tit_c, txt_c) in enumerate(c["conceitos"], start=1):
            cur.execute("""
                INSERT INTO caderno_conceitos (caderno_id, ordem, titulo, texto)
                VALUES (?, ?, ?, ?);
            """, (c["id"], idx_conc, tit_c, txt_c))

        for idx_aba, (tit_a, desc_a) in enumerate(c["abas"], start=1):
            cur.execute("""
                INSERT INTO caderno_abas (caderno_id, ordem, titulo_aba, descricao)
                VALUES (?, ?, ?, ?);
            """, (c["id"], idx_aba, tit_a, desc_a))

    # =========================================================================
    # POPULAÇÃO INICIAL: GLOSSÁRIO & ATALHOS (RELACIONADO AOS CADERNOS)
    # =========================================================================
    glossario_raw = [
        (1, "Aba 01.1", "Erro Visual ##### (Jogo da Velha)",
         "Não é erro de fórmula! Significa apenas que a coluna está estreita demais para exibir o número ou a data. Posicione o mouse na divisória entre as letras das colunas no topo (ex.: entre A e B) e dê um duplo clique.",
         "Solução"),
        (1, "Aba 01.2", "Alça de Preenchimento (Cruz Preta Fina)",
         "Quadradinho no canto inferior direito da seleção. Arraste para autopreencher meses, datas ou copiar fórmulas. Para sequências numéricas (10, 20, 30...), selecione os 2 primeiros números juntos antes de puxar!",
         "Ferramenta"),
        (1, "Aba 01.4", "Colar Especial: Valores (Ctrl + Alt + V)",
         "Remove a fórmula de trás da célula e deixa apenas o resultado final congelado. Copie (Ctrl + C), clique no destino → Botão Direito → ícone '123' (Valores) ou aperte Ctrl + Alt + V → Valores.",
         "Atalho"),
        (1, "Aba 01.4", "Transpor Tabela (Virar Linha em Coluna)",
         "Copie a tabela original (Ctrl + C), clique em uma célula vazia com o Botão Direito e escolha o ícone 'Transpor' (ou Ctrl + Alt + V → marque a caixinha Transpor).",
         "Ferramenta"),
        (2, "Aba 02.1", "Quebrar Texto Automaticamente (Alt + Enter)",
         "Faz um título ou texto longo caber em 2 ou mais linhas dentro da mesma célula sem precisar alargar a coluna. Use o botão 'Quebrar Texto Automaticamente' na guia Página Inicial ou aperte Alt + Enter enquanto digita.",
         "Atalho"),
        (2, "Aba 02.1", "Pincel de Formatação (1 Clique vs. Duplo Clique)",
         "Copia apenas o visual (cor, fonte, borda e formato de número) de uma célula para outra. Um clique aplica 1 vez; dois cliques rápidos travam o pincel ligado para pintar várias células seguidas (aperte Esc para soltar).",
         "Ferramenta"),
        (2, "Aba 02.2", "Formato Moeda vs. Formato Contábil",
         "Ambos colocam R$ sem atrapalhar cálculos. No formato Moeda, o R$ fica colado junto ao número; no Contábil, o R$ fica alinhado na borda esquerda da célula, os centavos ficam alinhados e o valor zero vira um traço (R$ -).",
         "Conceito"),
        (2, "Aba 02.3", "Formatar Células / Máscaras Personalizadas",
         "Para abrir a janela completa de formatação em qualquer computador: clique com o Botão Direito na célula → 'Formatar Células...' (ou clique na setinha diagonal ↘ no canto inferior direito do bloco Número).",
         "Comando"),
        (2, "Aba 02.3", "Zeros à Esquerda, CEP e Unidades (\"kg\")",
         "Em Formatar Células → aba Número → Personalizado, digite no campo Tipo: 00000 (para códigos de 5 dígitos com zero na frente), 00000-000 (para CEP) ou 0,00\" kg\" (para exibir a unidade mantendo o número calculável).",
         "Máscara"),
        (2, "Aba 02.4", "Formatação Condicional (Regras de Realce)",
         "Pinta células automaticamente conforme o valor. Selecione apenas os números da coluna → Página Inicial → Formatação Condicional → Regras de Realce das Células (É Maior do que, É Menor do que, Texto que Contém...).",
         "Ferramenta"),
        (3, "Aba 03.1", "Parênteses e Ordem de Precedência =(A2+B2)/2",
         "O Excel calcula multiplicação (*) e divisão (/) ANTES de soma (+) e subtração (-). Para somar notas antes de dividir, envolva a soma entre parênteses: =(B2+C2+D2)/3.",
         "Conceito"),
        (3, "Aba 03.2", "Função =HOJE() e Cálculo de Dias/Horas",
         "=HOJE() retorna a data atual do computador (com parênteses vazios). Para achar dias restantes, subtraia =Vencimento - HOJE(). Em folha de ponto de 2 turnos, use =(Saída1-Entrada1)+(Saída2-Entrada2).",
         "Função"),
        (3, "Aba 03.3", "Funções =SOMA() e =MÉDIA() (Atalho Alt + =)",
         "=SOMA(B4:B23) soma todo o intervalo contínuo de B4 até B23 (os dois-pontos ':' significam 'ATÉ'). =MÉDIA(B4:B23) calcula a média aritmética. Dica: Alt + = insere a SOMA automaticamente!",
         "Função"),
        (3, "Aba 03.4", "Funções =MÁXIMO() e =MÍNIMO()",
         "=MÁXIMO(B4:B23) descobre o maior valor numérico do intervalo; =MÍNIMO(B4:B23) descobre o menor valor numérico.",
         "Função"),
        (5, "Aba 05.1", "Referência Absoluta / Travamento F4 ($F$4)",
         "Impede que uma célula fixa (cotação do dólar, alíquota de imposto ou total geral) escorregue ao arrastar a fórmula para baixo. Clique no endereço da célula na fórmula e aperte F4 (ou digite $F$4).",
         "Atalho"),
        (5, "Aba 05.4", "Auditoria dos 5 Erros (#NOME?, #VALOR!, #DIV/0!, #REF!, #NÚM!)",
         "#NOME? = função escrita errada; #VALOR! = conta matemática com texto; #DIV/0! = divisão por zero/célula vazia; #REF! = linha/coluna apagada; #NÚM! = número inválido.",
         "Solução"),
        (6, "Aba 06.1", "Comparadores Lógicos (=, >, <, >=, <=, <>)",
         "Fazem uma pergunta lógica para o Excel que responde VERDADEIRO ou FALSO. Destaque para >= (Maior ou igual), <= (Menor ou igual) e <> (Diferente).",
         "Conceito"),
        (6, "Aba 06.2", "Função =SE(teste; se_verdadeiro; se_falso)",
         "Toma decisões automáticas na planilha. Exemplo: =SE(C4>=7; \"Aprovado\"; \"Recuperação\"). Lembre-se: textos dentro da fórmula SEMPRE ficam entre aspas duplas!",
         "Função"),
        (7, "Aba 07.4", "Pintar a Linha Inteira na Formatação Condicional (=$E7=\"Em atraso\")",
         "Selecione apenas as linhas de dados da tabela → Formatação Condicional → Nova Regra → Usar uma fórmula. Trave APENAS a letra da coluna com cifrão (ex.: =$E7=\"Em atraso\") e escolha a cor!",
         "Máscara"),
    ]

    for idx_g, (cad_id, aba_ref, termo, definicao, cat) in enumerate(glossario_raw, start=1):
        cur.execute("""
            INSERT INTO glossario (modalidade_id, caderno_id, aba_ref, termo, definicao, categoria, ordem)
            VALUES (1, ?, ?, ?, ?, ?, ?);
        """, (cad_id, aba_ref, termo, definicao, cat, idx_g))

    conn.commit()
    conn.close()
    print(f"[OK] Banco SQLite relacional criado com sucesso em: {DB_PATH}")


if __name__ == "__main__":
    build_database()
