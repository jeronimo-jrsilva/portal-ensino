#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor de Publicação Progressiva do Portal de Ensino — Prof. Jerônimo Silva
Uso:
  python3 publicar_modulo.py --status
  python3 publicar_modulo.py --liberar 03
  python3 publicar_modulo.py --bloquear 03
"""

import os
import re
import shutil
import argparse
import subprocess

PORTAL_DIR = "/home/jeronimo/G-Sync/Aulas/Portal_Ensino"
SRC_EXCEL_DIR = "/home/jeronimo/G-Sync/Aulas/04_Ensino_Excel/Modulos_Oficiais"
DST_EXCEL_DIR = os.path.join(PORTAL_DIR, "downloads", "excel")
APP_JS_PATH = os.path.join(PORTAL_DIR, "app.js")

MAPA_ARQUIVOS = {
    "01": "01_Manipulacao_Sequencias_e_Colagem.xlsx",
    "02": "02_Formatacao_Grupo_Numero_e_Condicional.xlsx",
    "03": "03_Expressoes_Parenteses_Datas_e_Funcoes_Base.xlsx",
    "04": "04_Pratica_Integrada_Bloco_01.xlsx",
    "05": "05_Referencia_Absoluta_e_Auditoria_de_Erros.xlsx",
    "06": "06_Comparadores_e_Funcao_SE_Fundamentos.xlsx",
    "07": "07_SE_Avancado_e_Formatacao_Condicional_Formulas.xlsx",
    "08": "08_Pratica_Integrada_Bloco_02.xlsx",
}


def set_module_state(cod: str, liberar: bool):
    cod = cod.zfill(2)
    if cod not in MAPA_ARQUIVOS:
        print(f"[ERRO] Código '{cod}' inválido. Use de 01 a 08.")
        return

    fname = MAPA_ARQUIVOS[cod]
    src_path = os.path.join(SRC_EXCEL_DIR, fname)
    dst_path = os.path.join(DST_EXCEL_DIR, fname)
    os.makedirs(DST_EXCEL_DIR, exist_ok=True)

    if liberar:
        if not os.path.exists(src_path):
            print(f"[ERRO] Arquivo fonte não encontrado: {src_path}")
            return
        shutil.copy2(src_path, dst_path)
        print(f"[OK] Planilha copiada para pasta pública: {dst_path}")
    else:
        if os.path.exists(dst_path):
            os.remove(dst_path)
            print(f"[OK] Planilha removida da pasta pública: {dst_path}")

    with open(APP_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = rf'(codigo:\s*"{cod}".*?liberado:\s*)(true|false)'
    new_val = "true" if liberar else "false"
    new_content, count = re.subn(pattern, rf"\g<1>{new_val}", content, flags=re.DOTALL)

    if count > 0:
        with open(APP_JS_PATH, "w", encoding="utf-8") as f:
            f.write(new_content)
        status_str = "🟢 LIBERADO" if liberar else "🔒 BLOQUEADO"
        print(f"[OK] Caderno {cod} ({fname}) agora está {status_str} no Portal!")
    else:
        print(f"[AVISO] Bloco do Caderno {cod} não localizado em app.js.")


def show_status():
    with open(APP_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    print("\n=== STATUS ATUAL DOS CADERNOS NO PORTAL ===")
    for cod, fname in sorted(MAPA_ARQUIVOS.items()):
        m = re.search(rf'codigo:\s*"{cod}".*?liberado:\s*(true|false)', content, flags=re.DOTALL)
        is_lib = (m and m.group(1) == "true")
        has_file = os.path.exists(os.path.join(DST_EXCEL_DIR, fname))
        badge = "🟢 LIBERADO" if is_lib else "🔒 BLOQUEADO"
        file_ok = "(Arquivo .xlsx na pasta pública)" if has_file else "(Oculto da pasta pública)"
        print(f"  Caderno {cod}: {badge:14s} | {fname} {file_ok}")
    print()


def git_publish(msg: str):
    print("\n[GIT] Publicando atualização no GitHub Pages (https://jeronimo-jrsilva.github.io/portal-ensino/)...")
    subprocess.run(["git", "-C", PORTAL_DIR, "add", "."], check=True)
    status = subprocess.run(["git", "-C", PORTAL_DIR, "status", "--porcelain"], capture_output=True, text=True)
    if status.stdout.strip():
        subprocess.run(["git", "-C", PORTAL_DIR, "commit", "-m", msg], check=True)
        subprocess.run(["git", "-C", PORTAL_DIR, "push", "origin", "main"], check=True)
        print("[OK] Site atualizado no ar com sucesso! Em ~30 segundos já estará visível para os alunos.")
    else:
        print("[INFO] Nenhuma alteração pendente para publicar.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerenciador de Liberação Progressiva do Portal")
    parser.add_argument("codigo_posicional", nargs="?", help="Atalho para liberar um caderno (ex.: python3 publicar_modulo.py 03 --push)")
    parser.add_argument("--status", action="store_true", help="Exibe o status atual de cada caderno")
    parser.add_argument("--liberar", type=str, help="Libera um caderno (ex.: 03)")
    parser.add_argument("--bloquear", type=str, help="Bloqueia um caderno (ex.: 03)")
    parser.add_argument("--push", action="store_true", help="Faz commit e push automático para o GitHub Pages")
    args = parser.parse_args()

    target_lib = args.liberar or args.codigo_posicional
    commit_msg = "chore: atualiza portal de ensino"

    if target_lib:
        set_module_state(target_lib, True)
        commit_msg = f"feat(excel): libera Caderno {target_lib.zfill(2)} para a turma"
    elif args.bloquear:
        set_module_state(args.bloquear, False)
        commit_msg = f"chore(excel): oculta Caderno {args.bloquear.zfill(2)}"

    show_status()

    if args.push:
        git_publish(commit_msg)
