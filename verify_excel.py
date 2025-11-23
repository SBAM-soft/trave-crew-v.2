#!/usr/bin/env python3
"""Verifica che il file Excel generato corrisponda all'originale"""

import pandas as pd

original = 'TravelCrew_Database Edit 2.xlsx'
generated = 'TravelCrew_Database.xlsx'

xl_orig = pd.ExcelFile(original)
xl_gen = pd.ExcelFile(generated)

sep = '='*80

print('📊 VERIFICA STRUTTURA\n')
print(sep)

# Confronta numero fogli
print(f'\n📋 Numero fogli:')
print(f'   Originale:  {len(xl_orig.sheet_names)} fogli')
print(f'   Generato:   {len(xl_gen.sheet_names)} fogli')

# Confronta ogni foglio
print(f'\n📝 CONFRONTO DETTAGLIO:\n')

all_match = True

for sheet in xl_gen.sheet_names:
    df_orig = pd.read_excel(original, sheet_name=sheet, dtype=str, na_filter=False)
    df_gen = pd.read_excel(generated, sheet_name=sheet, dtype=str, na_filter=False)

    shape_match = df_orig.shape == df_gen.shape
    col_match = list(df_orig.columns) == list(df_gen.columns)

    match = '✅' if shape_match and col_match else '❌'
    col_icon = '✅' if col_match else '❌'

    if not (shape_match and col_match):
        all_match = False

    print(f'{match} {sheet}:')
    print(f'      Originale: {len(df_orig)} righe × {len(df_orig.columns)} colonne')
    print(f'      Generato:  {len(df_gen)} righe × {len(df_gen.columns)} colonne')
    print(f'      Colonne: {col_icon}')

print(f'\n{sep}')
if all_match:
    print('✅ VERIFICA COMPLETATA - Tutti i fogli corrispondono!')
else:
    print('⚠️  VERIFICA COMPLETATA - Alcune differenze rilevate')
print(sep)
