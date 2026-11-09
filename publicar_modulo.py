#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Motor de Publicação Progressiva do Portal de Ensino (SQLite Relacional) — Prof. Jeronimo Silva
Opera diretamente sobre o banco de dados SQLite `portal_ensino.db`.

Exemplos de uso:
  python3 publicar_modulo.py --status
  python3 publicar_modulo.py 03 --push
  python3 publicar_modulo.py --turma 407 --liberar 03 --push
  python3 publicar_modulo.py --turma 407 --bloquear 03 --push
"""

import os
import shutil
import sqlite3
import argparse
import subprocess

PORTAL_DIR = "/home/jeronimo/G-Sync/Aulas/Portal_Ensino"
DB_PATH = os.path.join(PORTAL_DIR, "portal_ensino.db")
SRC_EXCEL_DIR = "/home/jeronimo/G-Sync/Aulas/04_Ensino_Excel/Modulos_Oficiais"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def set_module_state(codigo_turma: str, codigo_caderno: str, liberar: bool):
    cod_cad = codigo_caderno.zfill(2)
    conn = get_connection()
    cur = conn.cursor()

    turma = cur.execute(
        "SELECT id, nome, codigo FROM turmas WHERE codigo = ?;",
        (codigo_turma,)
    ).fetchone()
    if not turma:
        print(f"[ERRO] Turma '{codigo_turma}' não encontrada no banco SQLite.")
        conn.close()
        return

    caderno = cur.execute(
        "SELECT id, codigo, titulo, arquivo_xlsx FROM cadernos WHERE codigo = ?;",
        (cod_cad,)
    ).fetchone()
    if not caderno:
        print(f"[ERRO] Caderno '{cod_cad}' não encontrado no banco SQLite.")
        conn.close()
        return

    fname = os.path.basename(caderno["arquivo_xlsx"])
    src_path = os.path.join(SRC_EXCEL_DIR, fname)
    dst_path = os.path.join(PORTAL_DIR, caderno["arquivo_xlsx"])
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)

    if liberar:
        if not os.path.exists(src_path):
            print(f"[ERRO] Planilha oficial não encontrada em: {src_path}")
            conn.close()
            return
        shutil.copy2(src_path, dst_path)
        print(f"[ARQUIVO] Planilha copiada para pasta pública: {dst_path}")
    else:
        if os.path.exists(dst_path):
            os.remove(dst_path)
            print(f"[ARQUIVO] Planilha removida da pasta pública: {dst_path}")

    novo_estado = 1 if liberar else 0
    cur.execute("""
        INSERT INTO turma_cadernos (turma_id, caderno_id, liberado, data_atualizacao)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(turma_id, caderno_id) DO UPDATE SET
            liberado = excluded.liberado,
            data_atualizacao = CURRENT_TIMESTAMP;
    """, (turma["id"], caderno["id"], novo_estado))

    conn.commit()
    conn.close()

    badge = "🟢 LIBERADO" if liberar else "🔒 BLOQUEADO"
    print(f"[SQLITE] Turma {turma['codigo']} ({turma['nome']}) -> Caderno {cod_cad} ({caderno['titulo']}) atualizado para {badge}!")


def show_status(codigo_turma: str = "407"):
    conn = get_connection()
    cur = conn.cursor()

    turma = cur.execute(
        "SELECT id, codigo, nome FROM turmas WHERE codigo = ?;",
        (codigo_turma,)
    ).fetchone()

    rows = cur.execute("""
        SELECT c.codigo, c.titulo, c.arquivo_xlsx,
               COALESCE(tc.liberado, 0) AS liberado,
               (SELECT COUNT(*) FROM glossario g WHERE g.caderno_id = c.id) AS qtd_glossario
        FROM cadernos c
        LEFT JOIN turma_cadernos tc ON tc.caderno_id = c.id AND tc.turma_id = ?
        ORDER BY c.ordem ASC;
    """, (turma["id"],)).fetchall()

    print(f"\n=== STATUS NO BANCO SQLITE (portal_ensino.db) — {turma['nome']} ===")
    for r in rows:
        badge = "🟢 LIBERADO " if r["liberado"] else "🔒 BLOQUEADO"
        dst_path = os.path.join(PORTAL_DIR, r["arquivo_xlsx"])
        has_file = "📂 .xlsx público" if os.path.exists(dst_path) else "🚫 .xlsx oculto "
        print(f"  Caderno {r['codigo']} | {badge} | {has_file} | +{r['qtd_glossario']} termos glossário | {r['titulo']}")
    print()
    conn.close()


def git_publish(msg: str):
    print("[GIT] Enviando portal_ensino.db atualizado para o GitHub Pages...")
    subprocess.run(["git", "-C", PORTAL_DIR, "add", "."], check=True)
    status = subprocess.run(["git", "-C", PORTAL_DIR, "status", "--porcelain"], capture_output=True, text=True)
    if status.stdout.strip():
        subprocess.run(["git", "-C", PORTAL_DIR, "commit", "-m", msg], check=True)
        subprocess.run(["git", "-C", PORTAL_DIR, "push", "origin", "main"], check=True)
        print("[OK] Site atualizado no ar! (https://jeronimo-jrsilva.github.io/portal-ensino/)")
    else:
        print("[INFO] Nenhuma alteração pendente para publicar.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerenciador SQLite de Liberação Progressiva do Portal")
    parser.add_argument("codigo_posicional", nargs="?", help="Atalho para liberar um caderno (ex.: python3 publicar_modulo.py 03 --push)")
    parser.add_argument("--turma", type=str, default="407", help="Código da turma (padrão: 407)")
    parser.add_argument("--status", action="store_true", help="Exibe o status atual de cada caderno no SQLite")
    parser.add_argument("--liberar", type=str, help="Libera um caderno no SQLite (ex.: 03)")
    parser.add_argument("--bloquear", type=str, help="Bloqueia um caderno no SQLite (ex.: 03)")
    parser.add_argument("--push", action="store_true", help="Faz commit e push de portal_ensino.db para o GitHub Pages")
    args = parser.parse_args()

    target_lib = args.liberar or args.codigo_posicional
    commit_msg = "chore(db): atualiza portal_ensino.db"

    if target_lib:
        set_module_state(args.turma, target_lib, True)
        commit_msg = f"feat(db): libera Caderno {target_lib.zfill(2)} na Turma {args.turma} (SQLite)"
    elif args.bloquear:
        set_module_state(args.turma, args.bloquear, False)
        commit_msg = f"chore(db): oculta Caderno {args.bloquear.zfill(2)} na Turma {args.turma} (SQLite)"

    show_status(args.turma)

    if args.push:
        git_publish(commit_msg)
