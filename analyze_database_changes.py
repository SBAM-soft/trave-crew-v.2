#!/usr/bin/env python3
"""
Script to analyze differences between TravelCrew_Database.xlsx and TravelCrew_Database Edit.xlsx
"""
import pandas as pd
import sys
from collections import defaultdict

def analyze_excel_differences(old_file, new_file):
    """Compare two Excel files and report differences"""

    print("=" * 80)
    print("ANALISI MODIFICHE DATABASE TRAVELCREW")
    print("=" * 80)
    print()

    # Read both Excel files
    try:
        old_xl = pd.ExcelFile(old_file)
        new_xl = pd.ExcelFile(new_file)
    except Exception as e:
        print(f"Errore nella lettura dei file: {e}")
        return

    print(f"📁 File originale: {old_file}")
    print(f"   Fogli: {old_xl.sheet_names}")
    print()
    print(f"📁 File modificato: {new_file}")
    print(f"   Fogli: {new_xl.sheet_names}")
    print()

    # Compare sheets
    old_sheets = set(old_xl.sheet_names)
    new_sheets = set(new_xl.sheet_names)

    if old_sheets != new_sheets:
        removed_sheets = old_sheets - new_sheets
        added_sheets = new_sheets - old_sheets
        if removed_sheets:
            print(f"❌ Fogli rimossi: {removed_sheets}")
        if added_sheets:
            print(f"✅ Fogli aggiunti: {added_sheets}")
        print()

    # Analyze each common sheet
    common_sheets = old_sheets & new_sheets

    changes_summary = []

    for sheet_name in sorted(common_sheets):
        print("=" * 80)
        print(f"FOGLIO: {sheet_name}")
        print("=" * 80)
        print()

        old_df = pd.read_excel(old_file, sheet_name=sheet_name)
        new_df = pd.read_excel(new_file, sheet_name=sheet_name)

        # Compare columns
        old_cols = set(old_df.columns)
        new_cols = set(new_df.columns)

        removed_cols = old_cols - new_cols
        added_cols = new_cols - old_cols
        common_cols = old_cols & new_cols

        sheet_changes = {
            'sheet': sheet_name,
            'removed_columns': list(removed_cols),
            'added_columns': list(added_cols),
            'row_count_old': len(old_df),
            'row_count_new': len(new_df),
            'data_changes': []
        }

        if removed_cols:
            print(f"🔴 COLONNE RIMOSSE ({len(removed_cols)}):")
            for col in sorted(removed_cols):
                print(f"   - {col}")
            print()

        if added_cols:
            print(f"🟢 COLONNE AGGIUNTE ({len(added_cols)}):")
            for col in sorted(added_cols):
                print(f"   + {col}")
            print()

        # Compare row counts
        print(f"📊 Numero righe:")
        print(f"   Vecchio: {len(old_df)} righe")
        print(f"   Nuovo: {len(new_df)} righe")
        print(f"   Differenza: {len(new_df) - len(old_df):+d} righe")
        print()

        # For common columns, check for data changes
        if common_cols:
            print(f"📝 ANALISI MODIFICHE DATI (colonne comuni: {len(common_cols)}):")
            print()

            # Try to identify a key column for comparison
            key_col = None
            for possible_key in ['ID', 'id', 'Code', 'code', 'Codice', 'codice']:
                if possible_key in common_cols:
                    key_col = possible_key
                    break

            if not key_col and len(common_cols) > 0:
                key_col = list(common_cols)[0]

            if key_col:
                print(f"   Usando '{key_col}' come chiave di confronto")
                print()

                # Create dictionaries for easier comparison
                # Check if key column has duplicates
                has_duplicate_keys = False
                if key_col in old_df.columns and key_col in new_df.columns:
                    has_duplicate_keys = old_df[key_col].duplicated().any() or new_df[key_col].duplicated().any()

                if has_duplicate_keys:
                    print(f"   ⚠️  La colonna '{key_col}' contiene duplicati, uso indice numerico")
                    old_dict = old_df.to_dict('index')
                    new_dict = new_df.to_dict('index')
                    old_keys = set(old_dict.keys())
                    new_keys = set(new_dict.keys())
                else:
                    old_dict = old_df.set_index(key_col).to_dict('index') if key_col in old_df.columns else {}
                    new_dict = new_df.set_index(key_col).to_dict('index') if key_col in new_df.columns else {}
                    old_keys = set(old_dict.keys())
                    new_keys = set(new_dict.keys())

                removed_rows = old_keys - new_keys
                added_rows = new_keys - old_keys
                common_keys = old_keys & new_keys

                if removed_rows:
                    print(f"   🔴 Righe rimosse ({len(removed_rows)}):")
                    for key in sorted(list(removed_rows)[:10]):  # Show first 10
                        print(f"      - {key}")
                    if len(removed_rows) > 10:
                        print(f"      ... e altre {len(removed_rows) - 10} righe")
                    print()
                    sheet_changes['data_changes'].append(f"Rimosse {len(removed_rows)} righe")

                if added_rows:
                    print(f"   🟢 Righe aggiunte ({len(added_rows)}):")
                    for key in sorted(list(added_rows)[:10]):  # Show first 10
                        print(f"      + {key}")
                    if len(added_rows) > 10:
                        print(f"      ... e altre {len(added_rows) - 10} righe")
                    print()
                    sheet_changes['data_changes'].append(f"Aggiunte {len(added_rows)} righe")

                # Check for modified values in common rows
                modified_count = 0
                modified_details = []

                for key in common_keys:
                    old_row = old_dict[key]
                    new_row = new_dict[key]

                    for col in common_cols - {key_col}:
                        if col in old_row and col in new_row:
                            old_val = old_row[col]
                            new_val = new_row[col]

                            # Handle NaN comparisons
                            old_is_nan = pd.isna(old_val)
                            new_is_nan = pd.isna(new_val)

                            if old_is_nan and new_is_nan:
                                continue

                            if old_is_nan != new_is_nan or (not old_is_nan and old_val != new_val):
                                modified_count += 1
                                if len(modified_details) < 20:  # Limit details
                                    modified_details.append({
                                        'key': key,
                                        'column': col,
                                        'old': old_val,
                                        'new': new_val
                                    })

                if modified_count > 0:
                    print(f"   ⚠️  Valori modificati: {modified_count} cambiamenti")
                    print()
                    print(f"   Esempi di modifiche (primi 20):")
                    for detail in modified_details:
                        old_val_str = str(detail['old'])[:50]
                        new_val_str = str(detail['new'])[:50]
                        print(f"      {detail['key']} | {detail['column']}")
                        print(f"         Vecchio: {old_val_str}")
                        print(f"         Nuovo:   {new_val_str}")
                    print()
                    sheet_changes['data_changes'].append(f"Modificati {modified_count} valori")
                else:
                    print(f"   ✅ Nessuna modifica nei valori delle righe comuni")
                    print()

        changes_summary.append(sheet_changes)
        print()

    # Print summary
    print("=" * 80)
    print("RIEPILOGO MODIFICHE")
    print("=" * 80)
    print()

    for change in changes_summary:
        print(f"📑 {change['sheet']}:")
        if change['removed_columns']:
            print(f"   - Colonne rimosse: {len(change['removed_columns'])}")
            print(f"     {', '.join(change['removed_columns'])}")
        if change['added_columns']:
            print(f"   - Colonne aggiunte: {len(change['added_columns'])}")
            print(f"     {', '.join(change['added_columns'])}")
        print(f"   - Righe: {change['row_count_old']} → {change['row_count_new']}")
        if change['data_changes']:
            for dc in change['data_changes']:
                print(f"   - {dc}")
        print()

    return changes_summary

if __name__ == "__main__":
    old_file = "TravelCrew_Database.xlsx"
    new_file = "TravelCrew_Database Edit.xlsx"

    analyze_excel_differences(old_file, new_file)
