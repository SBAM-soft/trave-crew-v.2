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
            "DEST_ABBINATA_1",
            "COSTI_ACC_1", "COSTI_ACC_2", "COSTI_ACC_3", "COSTI_ACC_4",
            "COSTI_ACC_5", "COSTI_ACC_6", "COSTI_ACC_7", "COSTI_ACC_8",
            "COSTI_ACC_9", "COSTI_ACC_10", "COSTI_ACC_11", "COSTI_ACC_12",
            "COSTI_ACC_13", "COSTI_ACC_14", "COSTI_ACC_15"
        ],
        "copy": [
            "CODICE", "TIPO", "NOME", "NOME_COMPLETO", "CONTINENTE", "EMOJI",
            "TAGLINE", "DESCRIZIONE", "CAPITALE", "LINGUA", "VALUTA", "TIMEZONE",
            "PERIODO_MIGLIORE", "IMMAGINE_URL"
        ]
    },
    "zone": {
        "tech": [
            "CODICE", "TIPO", "DESTINAZIONE", "ZONA",
            "COORDINATE_LAT", "COORDINATE_LNG", "GIORNI_CONSIGLIATI",
            "DISTANZA_CAPITALE_KM", "DESTINAZIONE_COLLEGATA", "PRIORITA",
            "VOLO_1", "VOLO_2", "VOLO_3", "VOLO_4", "VOLO_5", "VOLO_6", "VOLO_7", "VOLO_8",
            "HOTEL_1", "HOTEL_2", "HOTEL_3",
            "COSTI_ACC_1", "COSTI_ACC_2", "COSTI_ACC_3", "COSTI_ACC_4",
            "COSTI_ACC_5", "COSTI_ACC_6", "COSTI_ACC_7", "COSTI_ACC_8",
            "EXTRA_1", "EXTRA_2", "EXTRA_3", "EXTRA_4", "EXTRA_5", "EXTRA_6",
            "EXTRA_7", "EXTRA_8", "EXTRA_9", "EXTRA_10", "EXTRA_11", "EXTRA_12",
            "EXTRA_13", "EXTRA_14", "EXTRA_15"
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
            "CONTATORE_ZONA", "CATEGORIA_1", "CATEGORIA_2", "CATEGORIA_3",
            "DIFFICOLTA", "SLOT", "PRX_PAX",
            "EXTRA_1", "EXTRA_2", "EXTRA_3", "EXTRA_4", "EXTRA_5",
            "EXTRA_6", "EXTRA_7", "EXTRA_8", "EXTRA_9", "EXTRA_10",
            "EXTRA_11", "EXTRA_12", "EXTRA_13", "EXTRA_14", "EXTRA_15"
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
            "PRZ_PAX_NIGHT_GENNAIO2", "PRZ_PAX_NIGHT_GENNAIO3",
            "PRZ_PAX_NIGHT_FEBBRAIO2", "PRZ_PAX_NIGHT_FEBBRAIO4",
            "PRZ_PAX_NIGHT_MARZO1", "PRZ_PAX_NIGHT_MARZO3",
            "PRZ_PAX_NIGHT_APRILE1", "PRZ_PAX_NIGHT_APRILE3",
            "PRZ_PAX_NIGHT_MAGGIO1", "PRZ_PAX_NIGHT_MAGGIO2",
            "PRZ_PAX_NIGHT_GIUGNO1", "PRZ_PAX_NIGHT_GIUGNO3",
            "PRZ_PAX_NIGHT_LUGLIO1", "PRZ_PAX_NIGHT_LUGLIO3",
            "PRZ_PAX_NIGHT_AGOSTO1", "PRZ_PAX_NIGHT_AGOSTO3",
            "PRZ_PAX_NIGHT_SETTEMBRE2", "PRZ_PAX_NIGHT_SETTEMBRE3",
            "PRZ_PAX_NIGHT_OTTOBRE2", "PRZ_PAX_NIGHT_OTTOBRE3",
            "PRZ_PAX_NIGHT_NOVEMBRE2", "PRZ_PAX_NIGHT_NOVEMBRE3",
            "PRZ_PAX_NIGHT_DICEMBRE2", "PRZ_PAX_NIGHT_DICEMBRE3",
            "EXTRA_1", "EXTRA_2", "EXTRA_3", "EXTRA_4", "EXTRA_5", "EXTRA_6",
            "EXTRA_7", "EXTRA_8", "EXTRA_9", "EXTRA_10", "EXTRA_11", "EXTRA_12",
            "EXTRA_13", "EXTRA_14", "EXTRA_15"
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

    print(f"📊 Generazione {EXCEL_FILE} da CSV già separati\n")

    # Crea Excel writer
    writer = pd.ExcelWriter(EXCEL_FILE, engine='openpyxl')

    sheets_created = 0

    # Processa entità con separazione tech/copy (leggi CSV già separati)
    for entity in COLUMN_MAPPING.keys():
        # Leggi CSV _tech
        tech_csv = os.path.join(CSV_DIR, f"{entity}_tech.csv")
        if os.path.exists(tech_csv):
            print(f"🔄 Processing: {entity}_tech.csv")
            df_tech = read_csv_smart(tech_csv)
            df_tech.to_excel(writer, sheet_name=f"{entity}_tech", index=False)
            print(f"   ✅ {entity}_tech: {len(df_tech)} righe × {len(df_tech.columns)} colonne")
            sheets_created += 1
        else:
            print(f"⚠️  {tech_csv} non trovato, skip")

        # Leggi CSV _copy
        copy_csv = os.path.join(CSV_DIR, f"{entity}_copy.csv")
        if os.path.exists(copy_csv):
            print(f"🔄 Processing: {entity}_copy.csv")
            df_copy = read_csv_smart(copy_csv)
            df_copy.to_excel(writer, sheet_name=f"{entity}_copy", index=False)
            print(f"   ✅ {entity}_copy: {len(df_copy)} righe × {len(df_copy.columns)} colonne")
            sheets_created += 1
        else:
            print(f"⚠️  {copy_csv} non trovato, skip")

        print()

    # Processa fogli solo tech
    for entity in TECH_ONLY_SHEETS:
        tech_csv = os.path.join(CSV_DIR, f"{entity}_tech.csv")

        if not os.path.exists(tech_csv):
            print(f"⚠️  {tech_csv} non trovato, skip")
            continue

        print(f"🔄 Processing: {entity}_tech.csv (solo tech)")

        # Leggi CSV
        df = read_csv_smart(tech_csv)

        # Crea foglio _tech
        df.to_excel(writer, sheet_name=f"{entity}_tech", index=False)
        print(f"   ✅ {entity}_tech: {len(df)} righe × {len(df.columns)} colonne")
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
