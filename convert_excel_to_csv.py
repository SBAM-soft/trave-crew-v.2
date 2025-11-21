#!/usr/bin/env python3
"""
Script per convertire TravelCrew_Database.xlsx in CSV separati
Simula il workflow GitHub Actions in locale
"""

import pandas as pd
import os
from pathlib import Path

EXCEL_FILE = "TravelCrew_Database Edit.xlsx"
OUTPUT_DIR = "public/data"

# Array dei 12 fogli da convertire (pacchetti_tech e pacchetti_copy rimossi)
SHEETS = [
    "destinazioni_tech",
    "destinazioni_copy",
    "zone_tech",
    "zone_copy",
    "esperienze_tech",
    "esperienze_copy",
    "hotel_tech",
    "hotel_copy",
    "voli_tech",
    "itinerario_tech",
    "costi_accessori_tech",
    "extra_tech"
]

def fill_placeholders(df):
    """Riempie celle vuote con placeholder appropriati"""
    for col in df.columns:
        col_lower = col.lower()

        # Applica placeholder basati sul tipo di colonna
        if any(keyword in col_lower for keyword in ['prezzo', 'costo', 'budget', 'importo']):
            df[col] = df[col].replace('', '0')
        elif any(keyword in col_lower for keyword in ['url', 'immagine', 'link', 'foto']):
            df[col] = df[col].replace('', 'https://placeholder.com/image.jpg')
        elif any(keyword in col_lower for keyword in ['emoji', 'icona', 'icon']):
            df[col] = df[col].replace('', '📍')
        elif 'coordinate' in col_lower or col_lower in ['lat', 'lng', 'latitude', 'longitude']:
            df[col] = df[col].replace('', '0')
        elif 'codice' in col_lower and 'collegat' in col_lower:
            df[col] = df[col].replace('', 'PENDING')
        elif any(keyword in col_lower for keyword in ['visto', 'obbligator', 'richiesto']):
            df[col] = df[col].replace('', 'no')
        elif any(keyword in col_lower for keyword in ['durata', 'giorni', 'notti']):
            df[col] = df[col].replace('', '0')
        else:
            # Default per colonne testuali
            df[col] = df[col].replace('', 'TBD')

    return df


# Verifica esistenza file Excel
if not os.path.exists(EXCEL_FILE):
    print(f"❌ ERRORE: File {EXCEL_FILE} non trovato!")
    exit(1)

# Crea directory output se non esiste
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

print(f"📊 Conversione Excel → CSV")
print(f"📁 Excel: {EXCEL_FILE}")
print(f"📂 Output: {OUTPUT_DIR}")
print(f"📋 Fogli: {len(SHEETS)}\n")

converted = 0
failed = []

# Converti ogni foglio
for sheet_name in SHEETS:
    try:
        print(f"🔄 {sheet_name}")

        # Leggi foglio
        df = pd.read_excel(
            EXCEL_FILE,
            sheet_name=sheet_name,
            dtype=str,
            na_filter=False
        )

        # Pulisci
        df = df.dropna(how='all')
        df = df.dropna(axis=1, how='all')
        df = fill_placeholders(df)

        # Salva CSV
        csv_path = os.path.join(OUTPUT_DIR, f"{sheet_name}.csv")
        df.to_csv(
            csv_path,
            index=False,
            encoding='utf-8',
            lineterminator='\n'
        )

        print(f"   ✅ {len(df)} righe × {len(df.columns)} colonne\n")
        converted += 1

    except Exception as e:
        failed.append(sheet_name)
        print(f"   ❌ Errore: {e}\n")

print(f"{'='*60}")
print(f"✅ Conversione completata!")
print(f"   Successi: {converted}/{len(SHEETS)}")
if failed:
    print(f"   Falliti: {', '.join(failed)}")
print(f"{'='*60}")
