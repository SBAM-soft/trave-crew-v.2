#!/usr/bin/env python3
"""
Script per generare TravelCrew_Database.xlsx da CSV esistenti
Separa automaticamente colonne tech e copy per ogni entità
"""

import pandas as pd
import os
from pathlib import Path

# Directory CSV
CSV_DIR = "public/data"
EXCEL_FILE = "TravelCrew_Database.xlsx"

# Mapping colonne: quali vanno in *_tech e quali in *_copy
# Comune a tutti: CODICE, TIPO devono essere in entrambi i fogli

COLUMN_MAPPING = {
    "destinazioni": {
        "tech": [
            "CODICE", "TIPO", "COORDINATE_LAT", "COORDINATE_LNG",
            "GIORNI_CONSIGLIATI", "VISTO_RICHIESTO", "COSTO_VISTO",
            "DIFFICOLTA_LINGUA", "BUDGET_MEDIO_GIORNO", "ORDINE",
            "DEST_ABBINATA_1", "COSTI_ACC_1", "COSTI_ACC_2", "COSTI_ACC_3",
            "COSTI_ACC_4", "COSTI_ACC_5", "COSTI_ACC_6", "COSTI_ACC_7", "COSTI_ACC_8"
        ],
        "copy": [
            "CODICE", "TIPO", "NOME", "NOME_COMPLETO", "CONTINENTE", "EMOJI",
            "TAGLINE", "DESCRIZIONE", "CAPITALE", "LINGUA", "VALUTA", "TIMEZONE",
            "PERIODO_MIGLIORE", "IMMAGINE_URL"
        ]
    },
    "zone": {
        "tech": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "ORDINE",
            "COORDINATE_LAT", "COORDINATE_LNG", "GIORNI_CONSIGLIATI",
            "DISTANZA_CAPITALE_KM", "DESTINAZIONE_COLLEGATA", "PRIORITA",
            "VOLO_1", "VOLO_2", "HOTEL_1", "HOTEL_2", "HOTEL_3",
            "COSTI_ACC_1", "COSTI_ACC_2", "COSTI_ACC_3",
            "EXTRA_1", "EXTRA_2", "EXTRA_3"
        ],
        "copy": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "DESCRIZIONE",
            "TIPO_AREA", "CARATTERISTICHE", "CITTA_PRINCIPALE",
            "AEROPORTO_PIU_VICINO", "PERIODO_MIGLIORE", "IMMAGINE_URL"
        ]
    },
    "esperienze": {
        "tech": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "ZONA_COLLEGATA",
            "ORDINE", "DIFFICOLTA", "SLOT", "PRX_PAX",
            "EXTRA_1", "EXTRA_2", "EXTRA_3", "EXTRA_4", "EXTRA_5",
            "EXTRA_6", "EXTRA_7", "EXTRA_8", "EXTRA_9"
        ],
        "copy": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA",
            "ESPERIENZE", "DESCRIZIONE"
        ]
    },
    "pacchetti": {
        "tech": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "CONTATORE_AREA",
            "ZONA_COLLEGATA", "DIFFICOLTA", "MIN_NOTTI", "PRX_PAX",
            "DAY2_ESPERIENZA_STD", "DAY3_ESPERIENZA_STD", "DAY4_ESPERIENZA_STD",
            "DAY5_ESPERIENZA_STD", "DAY6_ESPERIENZA_STD", "DAY7_ESPERIENZA_STD",
            "DAY8_ESPERIENZA_STD", "DAY9_ESPERIENZA_STD", "DAY10_ESPERIENZA_STD"
        ],
        "copy": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA",
            "NOME_PACCHETTO", "CATEGORIA_1", "CATEGORIA_2", "CATEGORIA_3"
        ]
    },
    "hotel": {
        "tech": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "QUARTIERE", "BUDGET",
            "PRZ_PAX_NIGHT_15_01_2026", "PRZ_PAX_NIGHT_23_01_2026",
            "PRZ_PAX_NIGHT_12_02_2026", "PRZ_PAX_NIGHT_26_02_2026",
            "PRZ_PAX_NIGHT_05_03_2026", "PRZ_PAX_NIGHT_20_03_2026",
            "PRZ_PAX_NIGHT_02_04_2026", "PRZ_PAX_NIGHT_16_04_2026",
            "PRZ_PAX_NIGHT_07_05_2026", "PRZ_PAX_NIGHT_13_05_2026",
            "PRZ_PAX_NIGHT_04_06_2026", "PRZ_PAX_NIGHT_18_06_2026",
            "PRZ_PAX_NIGHT_02_07_2026", "PRZ_PAX_NIGHT_16_07_2026",
            "PRZ_PAX_NIGHT_06_08_2026", "PRZ_PAX_NIGHT_20_08_2026",
            "PRZ_PAX_NIGHT_10_09_2026", "PRZ_PAX_NIGHT_17_09_2026",
            "PRZ_PAX_NIGHT_09_10_2026", "PRZ_PAX_NIGHT_16_10_2026",
            "PRZ_PAX_NIGHT_11_11_2026", "PRZ_PAX_NIGHT_18_11_2026",
            "PRZ_PAX_NIGHT_08_12_2026", "PRZ_PAX_NIGHT_15_12_2026",
            "EXTRA_1", "EXTRA_2", "EXTRA_3", "EXTRA_4", "EXTRA_5", "EXTRA_6", "EXTRA_7"
        ],
        "copy": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA", "QUARTIERE", "BUDGET",
            "SERVIZI_MINIMI"
        ]
    }
}

# Fogli che hanno solo versione tech (no copy)
TECH_ONLY_SHEETS = ["voli", "itinerario", "costi_accessori", "extra"]


def detect_separator(csv_path):
    """Rileva il separatore del CSV (virgola o punto e virgola)"""
    with open(csv_path, 'r', encoding='utf-8') as f:
        first_line = f.readline()
        if ';' in first_line and first_line.count(';') > first_line.count(','):
            return ';'
        return ','


def read_csv_smart(csv_path):
    """Legge CSV con rilevamento automatico del separatore"""
    separator = detect_separator(csv_path)
    print(f"   → Separatore rilevato: '{separator}'")
    return pd.read_csv(csv_path, sep=separator, dtype=str, na_filter=False)


def create_excel_from_csvs():
    """Crea file Excel con 14 fogli da CSV esistenti"""

    print(f"📊 Generazione {EXCEL_FILE} da CSV esistenti\n")

    # Crea Excel writer
    writer = pd.ExcelWriter(EXCEL_FILE, engine='openpyxl')

    sheets_created = 0

    # Processa entità con separazione tech/copy
    for entity, columns in COLUMN_MAPPING.items():
        csv_file = os.path.join(CSV_DIR, f"{entity}.csv")

        if not os.path.exists(csv_file):
            print(f"⚠️  {csv_file} non trovato, skip")
            continue

        print(f"🔄 Processing: {entity}.csv")

        # Leggi CSV
        df = read_csv_smart(csv_file)

        # Crea foglio _tech
        tech_sheet = f"{entity}_tech"
        tech_cols = [col for col in columns["tech"] if col in df.columns]
        df_tech = df[tech_cols]
        df_tech.to_excel(writer, sheet_name=tech_sheet, index=False)
        print(f"   ✅ {tech_sheet}: {len(df_tech)} righe × {len(tech_cols)} colonne")
        sheets_created += 1

        # Crea foglio _copy
        copy_sheet = f"{entity}_copy"
        copy_cols = [col for col in columns["copy"] if col in df.columns]
        df_copy = df[copy_cols]
        df_copy.to_excel(writer, sheet_name=copy_sheet, index=False)
        print(f"   ✅ {copy_sheet}: {len(df_copy)} righe × {len(copy_cols)} colonne")
        sheets_created += 1
        print()

    # Processa fogli solo tech
    for entity in TECH_ONLY_SHEETS:
        csv_file = os.path.join(CSV_DIR, f"{entity}.csv")

        if not os.path.exists(csv_file):
            print(f"⚠️  {csv_file} non trovato, skip")
            continue

        print(f"🔄 Processing: {entity}.csv (solo tech)")

        # Leggi CSV
        df = read_csv_smart(csv_file)

        # Crea foglio _tech
        tech_sheet = f"{entity}_tech"
        df.to_excel(writer, sheet_name=tech_sheet, index=False)
        print(f"   ✅ {tech_sheet}: {len(df)} righe × {len(df.columns)} colonne")
        sheets_created += 1
        print()

    # Salva Excel
    writer.close()

    print(f"{'='*60}")
    print(f"✅ EXCEL GENERATO CON SUCCESSO!")
    print(f"{'='*60}")
    print(f"📁 File: {EXCEL_FILE}")
    print(f"📋 Fogli creati: {sheets_created}/14")

    # Mostra dimensione file
    file_size = os.path.getsize(EXCEL_FILE) / 1024
    print(f"💾 Dimensione: {file_size:.1f} KB")
    print(f"{'='*60}")

    # Lista fogli creati
    print(f"\n📋 FOGLI EXCEL CREATI:")
    wb = pd.ExcelFile(EXCEL_FILE)
    for i, sheet in enumerate(wb.sheet_names, 1):
        print(f"   {i}. {sheet}")

    print(f"\n🎉 File pronto per essere committato!")
    print(f"💡 Prossimo step: git add {EXCEL_FILE}")


if __name__ == "__main__":
    create_excel_from_csvs()
