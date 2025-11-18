# 🚀 TRAVEL CREW v2.0 - FINAL

## ✅ PROGETTO COMPLETO E AGGIORNATO

Versione finale con tutte le correzioni applicate.

---

## 📋 DOCUMENTAZIONE

**PROJECT.md** → Descrizioni, architettura, roadmap, sezioni app  
**CODE_REFERENCE.md** → Esempi codice e snippet implementativi

---

## 📁 STRUTTURA

```
travel-crew-v2-final/
├── TravelCrew_Database.xlsx    ← DATABASE EXCEL centralizzato 🗄️
├── .github/
│   └── workflows/
│       └── excel-to-csv.yml    ← Conversione automatica ⚙️
├── PROJECT.md                  ← Leggi questo per capire progetto
├── CODE_REFERENCE.md           ← Riferimento per codice
├── public/
│   └── data/                   → 14 CSV auto-generati da Excel ✅
├── src/
│   ├── core/
│   │   ├── data/               → Backup CSV (deprecato)
│   │   └── utils/              → dataLoader, helpers ✅
│   ├── features/
│   │   ├── home/               → Landing ✅
│   │   ├── explore/            → Browse viaggi ✅
│   │   ├── wizard/             → 4/5 step (manca date) ⚠️
│   │   ├── trip-editor/        → DA COSTRUIRE 🎯
│   │   ├── wallet/             → TODO
│   │   ├── documentation/      → TODO
│   │   ├── profile/            → TODO
│   │   └── chat/               → TODO
│   └── shared/                 → Button, Card, Layout ✅
```

---

## 🗄️ DATABASE EXCEL → CSV AUTOMATICO

Il progetto usa un file Excel centralizzato per gestire tutti i dati del database.

### Come funziona

**File Excel**: `TravelCrew_Database.xlsx` (nella root del progetto)

**Struttura**: 14 fogli divisi in due tipologie:
- **Fogli `*_tech`**: Dati tecnici (prezzi, coordinate, codici, logica)
- **Fogli `*_copy`**: Contenuti testuali (descrizioni, emoji, storytelling)

**Fogli disponibili**:
- `destinazioni_tech` / `destinazioni_copy`
- `zone_tech` / `zone_copy`
- `esperienze_tech` / `esperienze_copy`
- `pacchetti_tech` / `pacchetti_copy`
- `hotel_tech` / `hotel_copy`
- `voli_tech` (solo tech)
- `itinerario_tech` (solo tech)
- `costi_accessori_tech` (solo tech)
- `extra_tech` (solo tech, sostituisce plus.csv)

### Workflow automatico

1. Modifica il file `TravelCrew_Database.xlsx` in locale
2. Committa e pusha su GitHub:
   ```bash
   git add TravelCrew_Database.xlsx
   git commit -m "Update database"
   git push
   ```
3. GitHub Actions converte automaticamente Excel → CSV
4. Dopo 1-2 minuti: 14 CSV aggiornati in `public/data/`

### Caratteristiche

- Conversione automatica tramite GitHub Actions
- Rimozione automatica righe/colonne vuote
- Placeholder automatici per celle vuote (TBD, 0, URL placeholder, ecc.)
- Log dettagliati per debugging
- Gestione errori robusta

### Note importanti

- Colonna **CODICE** presente in ogni foglio (chiave primaria)
- Stesso CODICE collega dati tech ↔ copy
- File `plus.csv` e `viaggi.csv` sono **OBSOLETI** (non più aggiornati)
- `extra_tech.csv` sostituisce `plus.csv`

---

## 🎯 SISTEMA PEXP (novità principale)

**1 GIORNO = 1 ESPERIENZA** (no più slot multipli)

- Min 2 notti (3 giorni) → Max settimana
- Giorno arrivo = NO esperienze (logistica)
- Pacchetti tematici zona
- Scelta condizionata (logistica + interessi)

---

## ⭐ TRIP EDITOR - 3 LIVELLI

**Livello 1: TRIP EDITOR**
- Mappa interattiva
- Blocchi quadrati giorni (non cronologico)
- PEXP card (sintetiche)

**Livello 2: PEXP PANEL**
- Dettaglio pacchetto
- Card EXP singole
- Conferma o modifica

**Livello 3: DETEXP**
- Storytelling completo
- Video + foto slider
- Plus selezionabili
- Like/Dislike

---

## 🗺️ TIMELINE TRIP EDITOR (TTE)

Dopo "CREA ITINERARIO":
- Animazione AI (fake per ora)
- Mappa navigazione con percorso
- Timeline ordinata
- Costi accessori
- Salva o Pubblica viaggio

---

## 🏨 FASE 2 - HOTEL PERSONALE

Ogni utente sceglie hotel (admin può decidere per tutti - opzionale)

**3 TIER:**
- LOW (max 2★)
- MEDIUM (3/4★ + colazione)
- LUXURY (5★ + premium + extra)

Hotel generici + plus/upsell + campo preferenze testo libero

---

## 📱 SEZIONI APP

✅ Home  
✅ Esplora Viaggi  
⚠️ Wizard (manca date)  
🎯 **Trip Editor (PRIORITÀ)**  
📋 Wallet (TODO)  
📋 Documentazione (TODO)  
📋 Profilo (TODO)  
📋 Chat/Community (TODO)  
⏭️ Voti + Notifiche (DOPO)

---

## 🚀 QUICK START

```bash
cd travel-crew-v2-final
npm install
npm run dev
```

---

## 💡 PROSSIMI PASSI

1. **Completare Trip Editor** (sistema PEXP 3 livelli)
2. **Finire Wizard date** (Step 5)
3. **Implementare TTE** (Timeline + animazione)
4. **Fase 2 Hotel** (3 tier personali)
5. **Wallet, Doc, Profilo, Chat**
6. **Sistema voti/notifiche**

---

## 📝 NOTE SVILUPPO

- **Mobile-first** (90% traffico)
- **Compartimenti indipendenti** (features/)
- **CSS Modules** per stili
- **Logica pulita, rapida, precisa**

---

🔥 **READY TO GO!**

Metti questi file in Project Knowledge e sviluppiamo velocemente! 🚀
