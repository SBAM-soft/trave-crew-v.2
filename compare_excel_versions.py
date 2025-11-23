#!/usr/bin/env python3
"""Confronta le strutture dei due file Excel per identificare le modifiche"""

import pandas as pd

old_file = 'TravelCrew_Database Edit.xlsx'
new_file = 'TravelCrew_Database Edit 2.xlsx'

print("📊 CONFRONTO STRUTTURE EXCEL\n")
print("="*80)

xl_old = pd.ExcelFile(old_file)
xl_new = pd.ExcelFile(new_file)

print(f"\n📋 FOGLI:")
print(f"   Vecchio: {len(xl_old.sheet_names)} fogli")
print(f"   Nuovo: {len(xl_new.sheet_names)} fogli")

# Confronta ogni foglio
for sheet_name in xl_new.sheet_names:
    print(f"\n{'='*80}")
    print(f"🔸 FOGLIO: {sheet_name}")
    print(f"{'='*80}")

    # Leggi entrambi i fogli
    df_old = pd.read_excel(old_file, sheet_name=sheet_name, dtype=str, na_filter=False)
    df_new = pd.read_excel(new_file, sheet_name=sheet_name, dtype=str, na_filter=False)

    print(f"\n📊 STATISTICHE:")
    print(f"   Vecchio: {len(df_old)} righe × {len(df_old.columns)} colonne")
    print(f"   Nuovo:   {len(df_new)} righe × {len(df_new.columns)} colonne")
    print(f"   Delta:   {len(df_new) - len(df_old):+d} righe, {len(df_new.columns) - len(df_old.columns):+d} colonne")

    # Confronta colonne
    old_cols = set(df_old.columns)
    new_cols = set(df_new.columns)

    removed = old_cols - new_cols
    added = new_cols - old_cols
    common = old_cols & new_cols

    if removed:
        print(f"\n❌ COLONNE RIMOSSE ({len(removed)}):")
        for col in sorted(removed):
            print(f"   - {col}")

    if added:
        print(f"\n✅ COLONNE AGGIUNTE ({len(added)}):")
        for col in sorted(added):
            # Conta valori non vuoti nella nuova colonna
            non_empty = (df_new[col] != '').sum()
            print(f"   + {col} ({non_empty}/{len(df_new)} valori popolati)")

    if not removed and not added:
        print(f"\n✓ Nessuna modifica alle colonne")

    # Mostra tutte le colonne nel nuovo file nell'ordine originale
    print(f"\n📋 COLONNE NEL NUOVO FILE (ordine originale):")
    for i, col in enumerate(df_new.columns, 1):
        is_new = "🆕" if col in added else "  "
        non_empty = (df_new[col] != '').sum()
        print(f"   {is_new} {i:2d}. {col} ({non_empty}/{len(df_new)})")

print(f"\n{'='*80}")
print("✅ ANALISI COMPLETATA")
print(f"{'='*80}")
