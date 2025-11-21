#!/usr/bin/env python3
"""
Analisi dettagliata dello spostamento esperienze Chiang Mai -> Phuket
"""
import pandas as pd

old_file = "TravelCrew_Database.xlsx"
new_file = "TravelCrew_Database Edit.xlsx"

print("=" * 80)
print("ANALISI DETTAGLIATA SPOSTAMENTO ESPERIENZE CHIANG MAI -> PHUKET")
print("=" * 80)
print()

# Read experiences sheets
old_exp = pd.read_excel(old_file, sheet_name='esperienze_tech')
new_exp = pd.read_excel(new_file, sheet_name='esperienze_tech')

old_exp_copy = pd.read_excel(old_file, sheet_name='esperienze_copy')
new_exp_copy = pd.read_excel(new_file, sheet_name='esperienze_copy')

print("FOGLIO: esperienze_tech")
print("-" * 80)
print()

# Find experiences that changed zone from CHIANG MAI to PHUKET
print("🔄 ESPERIENZE SPOSTATE DA CHIANG MAI A PHUKET:")
print()

# Create a mapping based on row index
for idx in range(min(len(old_exp), len(new_exp))):
    old_row = old_exp.iloc[idx]
    new_row = new_exp.iloc[idx]

    old_zone = old_row.get('ZONA', '')
    new_zone = new_row.get('ZONA', '')
    old_code = old_row.get('CODICE', '')
    new_code = new_row.get('CODICE', '')

    # Check if zone changed from CHIANG MAI to PHUKET
    if old_zone == 'CHIANG MAI' and new_zone == 'PHUKET':
        print(f"Riga {idx}:")
        print(f"  Codice: {old_code} → {new_code}")
        print(f"  Zona: {old_zone} → {new_zone}")
        print(f"  Zona Collegata: {old_row.get('ZONA_COLLEGATA', '')} → {new_row.get('ZONA_COLLEGATA', '')}")

        # Get experience name from copy sheet
        if idx < len(old_exp_copy):
            exp_name = old_exp_copy.iloc[idx].get('ESPERIENZE', '')
            print(f"  Nome: {exp_name}")

        print()

print()
print("=" * 80)
print("FOGLIO: esperienze_copy")
print("-" * 80)
print()

# Check copy sheet
print("🔄 CAMBIAMENTI NEL FOGLIO COPY:")
print()

for idx in range(min(len(old_exp_copy), len(new_exp_copy))):
    old_row = old_exp_copy.iloc[idx]
    new_row = new_exp_copy.iloc[idx]

    old_zone = old_row.get('ZONA', '')
    new_zone = new_row.get('ZONA', '')
    old_name = old_row.get('ESPERIENZE', '')
    new_name = new_row.get('ESPERIENZE', '')
    old_code = old_row.get('CODICE', '')
    new_code = new_row.get('CODICE', '')

    if old_zone == 'CHIANG MAI' and new_zone == 'PHUKET':
        print(f"Riga {idx}:")
        print(f"  Esperienza: {old_name} → {new_name}")
        print(f"  Codice: {old_code} → {new_code}")
        print(f"  Zona: {old_zone} → {new_zone}")
        print()

print()
print("=" * 80)
print("RINUMERAZIONE CODICI PHUKET")
print("-" * 80)
print()

# Check all PHUKET experiences renumbering
print("📝 TUTTI I CODICI PHUKET (vecchio vs nuovo):")
print()

phuket_changes = []
for idx in range(min(len(old_exp), len(new_exp))):
    old_row = old_exp.iloc[idx]
    new_row = new_exp.iloc[idx]

    old_zone = old_row.get('ZONA', '')
    new_zone = new_row.get('ZONA', '')
    old_code = old_row.get('CODICE', '')
    new_code = new_row.get('CODICE', '')

    # If either old or new is PHUKET and code changed
    if (old_zone == 'PHUKET' or new_zone == 'PHUKET') and old_code != new_code:
        exp_name = new_exp_copy.iloc[idx].get('ESPERIENZE', '') if idx < len(new_exp_copy) else ''
        phuket_changes.append({
            'idx': idx,
            'old_code': old_code,
            'new_code': new_code,
            'old_zone': old_zone,
            'new_zone': new_zone,
            'name': exp_name
        })

for change in phuket_changes:
    zone_info = f"{change['old_zone']} → {change['new_zone']}" if change['old_zone'] != change['new_zone'] else change['new_zone']
    print(f"  {change['old_code']:12} → {change['new_code']:12}  [{zone_info}]  {change['name']}")

print()
print("=" * 80)
print("RIEPILOGO")
print("=" * 80)
print()

# Count changes
cm_to_phuket = sum(1 for c in phuket_changes if c['old_zone'] == 'CHIANG MAI' and c['new_zone'] == 'PHUKET')
just_renumbered = sum(1 for c in phuket_changes if c['old_zone'] == 'PHUKET' and c['new_zone'] == 'PHUKET')

print(f"📊 Esperienze spostate da Chiang Mai a Phuket: {cm_to_phuket}")
print(f"📊 Esperienze Phuket rinumerate: {just_renumbered}")
print(f"📊 Totale modifiche codici Phuket: {len(phuket_changes)}")
