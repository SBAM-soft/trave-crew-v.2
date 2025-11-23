#!/usr/bin/env python3
"""Analizza la struttura del file Excel"""

import pandas as pd
import sys

excel_file = 'TravelCrew_Database Edit 2.xlsx'

try:
    # Leggi tutti i fogli
    xl = pd.ExcelFile(excel_file)

    sep = '='*80

    print(f'📊 ANALISI: {excel_file}')
    print(sep)
    print(f'\n📋 FOGLI TROVATI ({len(xl.sheet_names)}):')

    for i, sheet in enumerate(xl.sheet_names, 1):
        print(f'   {i}. {sheet}')

    print(f'\n{sep}')
    print(f'\n📝 DETTAGLIO COLONNE PER FOGLIO:\n')

    for sheet_name in xl.sheet_names:
        df = pd.read_excel(excel_file, sheet_name=sheet_name, dtype=str, na_filter=False)
        print(f'\n🔸 {sheet_name}')
        print(f'   Righe: {len(df)}')
        print(f'   Colonne: {len(df.columns)}')
        print(f'   Nomi colonne:')
        for col in df.columns:
            # Conta valori non vuoti
            non_empty = (df[col] != '').sum()
            print(f'      - {col} ({non_empty}/{len(df)} valori)')

except Exception as e:
    print(f'❌ ERRORE: {e}')
    sys.exit(1)
