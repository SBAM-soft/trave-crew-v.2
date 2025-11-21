# REVISIONE GENERALE: Flussi Chat e Database

**Data:** 21 Novembre 2025
**Partecipanti:** Utente (Flussi Chat) + Andrea (Database)

---

## INDICE
1. [Overview Sistema Attuale](#overview-sistema-attuale)
2. [Flussi Chat - Sequenze e Finestre](#flussi-chat---sequenze-e-finestre)
3. [Database - Relazioni e Logiche](#database---relazioni-e-logiche)
4. [Mappatura Chat ↔ Database](#mappatura-chat--database)
5. [Issues e Miglioramenti](#issues-e-miglioramenti)

---

## OVERVIEW SISTEMA ATTUALE

### Architettura Generale
- **Frontend:** React + Zustand (state management)
- **Database:** CSV files in `/public/data/`
- **Chat Engine:** Conversational flow con 7 step principali
- **Componenti:** Trip-editor-chat con rendering dinamico messaggi

### File Chiave
- **Chat Logic:** `/src/features/trip-editor-chat/`
- **Flow Config:** `chatFlowConfig.js` (definizione step)
- **Store:** `useTripEditorChatStore.js` (Zustand state)
- **Hook:** `useChatFlow.js` (gestione transizioni)
- **Database:** `/public/data/*.csv` (8 file CSV)

---

## FLUSSI CHAT - Sequenze e Finestre

> **SEZIONE UTENTE:** Documenta qui le logiche di flusso per chat e finestre

### STEP 1: Welcome
**Finestre coinvolte:**
- [ ] ChatMessage (bot_message_with_card)
- [ ] ChatCard (WizardSummaryCard)
- [ ] ChatOptions (Inizia / Modifica dati)

**Flusso:**
```
[UTENTE: Descrivi il flusso qui]




```

**Note UX:**
```
[UTENTE: Annotazioni interfaccia, behavior, transizioni]




```

---

### STEP 2: Duration Selection
**Finestre coinvolte:**
- [ ] ChatMessage (bot_options)
- [ ] ChatOptions (3/5/7/9/13 notti)

**Flusso:**
```
[UTENTE: Descrivi il flusso qui]




```

**Calcoli:**
- Input: Numero notti
- Output: totalDays = notti + 1
- Giorni esclusi: Giorno 1 (arrivo) + ultimo giorno (partenza)

**Note UX:**
```
[UTENTE: Annotazioni]




```

---

### STEP 3: Zone Selection (MULTI-STEP)
**Finestre coinvolte:**
- [ ] ChatMap (selezione zone successive)
- [ ] ChatOptions (Stay/Transit per prima zona)
- [ ] MapInteractive (mappa interattiva con zone cliccabili)

**Flusso Prima Selezione (Arrivo):**
```
[UTENTE: Descrivi il flusso prima selezione - solo zone priorità 1]




```

**Flusso Selezioni Successive:**
```
[UTENTE: Descrivi il flusso selezioni successive - mappa con progressivo unlock]




```

**Logica Progressive Unlock:**
- Contatore: `availableCounter` (parte da 1)
- Prima iterazione: mostra solo zone PRIORITA=1
- Ogni zona completata → incrementa counter → sblocca zone successive

**Note UX:**
```
[UTENTE: Annotazioni su mappa, selezione stay/transit, feedback visivo]




```

---

### STEP 4: Experiences Selection (TINDER-STYLE)
**Finestre coinvolte:**
- [ ] ChatExperienceCard (swipe singola esperienza)
- [ ] ExperienceDetailFullscreen (dettagli completi)
- [ ] ItineraryBuildingAnimation (dopo completamento)

**Flusso per ogni Zona:**
```
[UTENTE: Descrivi il flusso swipe esperienze]




```

**Azioni Utente:**
- ❤️ Like → aggiunge esperienza al trip
- 👎 Dislike → skippa esperienza (TODO: suggerire alternativa)
- 👁️ Dettagli → mostra fullscreen modal

**Progress Tracking:**
- Visualizza: X/Y giorni completati
- Quando X == Y → passa a zona successiva
- Dopo tutte le zone → mostra animazione building

**Note UX:**
```
[UTENTE: Annotazioni su swipe, dettagli, progress bar]




```

---

### STEP 5: Summary Before Hotels
**Finestre coinvolte:**
- [ ] ChatMessage (timeline esperienze)
- [ ] Costi parziali (solo esperienze)
- [ ] ChatOptions (Continua / Modifica / Salva bozza)

**Flusso:**
```
[UTENTE: Descrivi il flusso riepilogo intermedio]




```

**Dati Mostrati:**
- Timeline cronologica esperienze
- Breakdown costi esperienze
- Totale parziale

**Note UX:**
```
[UTENTE: Annotazioni]




```

---

### STEP 6: Hotels Selection
**Finestre coinvolte:**
- [ ] ChatHotelSelector (3 tier: LOW/MEDIUM/LUXURY)
- [ ] Hotel Extras (opzionali)
- [ ] Text Field (preferenze personali)

**Flusso per ogni Zona:**
```
[UTENTE: Descrivi il flusso selezione hotel]




```

**Tier Hotel:**
- LOW: ~€40/notte
- MEDIUM: ~€75/notte
- LUXURY: ~€150/notte

**Calcolo Notti:**
- Basato su giorni raccomandati zona
- **BUG NOTO:** usa totalDays invece di (totalDays - 1)

**Extras Opzionali:**
- Spa, transfers, upgrade camera, etc.
- Costo extra × notti × persone

**Note UX:**
```
[UTENTE: Annotazioni su selezione tier, extras, preferenze]




```

---

### STEP 7: Final Summary
**Finestre coinvolte:**
- [ ] Complete Trip Timeline
- [ ] Full Cost Breakdown
- [ ] ChatOptions (Salva / Condividi / Pubblica / Modifica)

**Flusso:**
```
[UTENTE: Descrivi il flusso riepilogo finale]




```

**Dati Mostrati:**
- Tutte le zone visitate
- Tutte le esperienze selezionate
- Tutti gli hotel scelti
- Breakdown costi completo:
  - Esperienze
  - Hotel
  - Hotel extras
  - Accessori (voli interni, tasse)
  - **TOTALE**

**Azioni Finali:**
- Salva in "My Trips" (localStorage)
- Condividi (future)
- Pubblica in Explore (future)
- Modifica (torna a step specifico)

**Note UX:**
```
[UTENTE: Annotazioni]




```

---

## DATABASE - Relazioni e Logiche

> **SEZIONE ANDREA:** Documenta qui relazioni database e logiche

### Schema CSV - File Sorgenti

**Percorso:** `/public/data/`

#### 1. destinazioni_tech.csv
```
[ANDREA: Descrivi struttura, campi chiave, logiche]




```

#### 2. zone_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "Z"
- DESTINAZIONE (FK)
- ZONA (nome)
- PRIORITA (1 = città arrivo, 2+ = zone secondarie)
- GIORNI_CONSIGLIATI
- COORDINATE_LAT, COORDINATE_LNG
- HOTEL_1, HOTEL_2, HOTEL_3 (FK → hotel)
- VOLO_1, VOLO_2 (FK → voli)
- COSTI_ACC_1-3 (FK → costi_accessori)
- EXTRA_1-3 (FK → extra)

```
[ANDREA: Logiche relazioni, priorità progressive unlock, collegamenti]




```

#### 3. esperienze_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "X"
- DESTINAZIONE (FK)
- ZONA
- ZONA_COLLEGATA (FK → zone)
- DIFFICOLTA (1-3)
- SLOT (durata in giorni, di solito 2)
- PRX_PAX (prezzo per persona)
- EXTRA_1-9 (FK → extra)

```
[ANDREA: Logiche filtri per zona, difficoltà, collegamenti extra]




```

#### 4. pacchetti_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "P"
- CONTATORE_AREA (per progressive unlock)
- ZONA_COLLEGATA (FK)
- MIN_NOTTI
- PRX_PAX
- DAY2_ESPERIENZA_STD ... DAY10_ESPERIENZA_STD (FK → esperienze)

**NOTA:** Sistema pacchetti vecchio, ora si usa swipe esperienze singole

```
[ANDREA: Logiche pacchetti (se ancora in uso), relazioni esperienze]




```

#### 5. hotel_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "H"
- DESTINAZIONE (FK)
- ZONA
- QUARTIERE
- BUDGET (LOW/MEDIUM/HIGH)
- PRZ_PAX_NIGHT_[DATE] (25 colonne per date specifiche)
- EXTRA_1-7 (FK → extra)

```
[ANDREA: Logiche pricing dinamico per date, filtri per zona/budget]




```

#### 6. itinerario_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "I"
- CONTATORE_ZONA (livello unlock progressivo)
- ZONA_1, ZONA_2, ZONA_3, ZONA_4 (FK → zone permesse in sequenza)
- MIN_NOTTI
- COSTI_ACC_1-6 (FK → costi_accessori)
- EXTRA_1-7 (FK → extra)

```
[ANDREA: Logiche sequenze zone permesse, contatore unlock]




```

#### 7. extra_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "E"
- PLUS (nome extra)
- LIVELLO_PLUS (esp = esperienza, htl = hotel, etc.)
- SUPPLEMENTO (descrizione)
- COSTO_SUPPLEMENTO
- CODICE_COLLEGATO (FK a esperienza/hotel)
- PREZZO_SERVIZIO_BASE
- PREZZO_FINALE_SERVIZIO
- MARGINE_FINALE

```
[ANDREA: Logiche collegamenti extra a esperienze/hotel, calcoli costi]




```

#### 8. costi_accessori_tech.csv
```
[ANDREA: Descrivi struttura, costi obbligatori (voli interni, tasse, tickets)]




```

---

### Relazioni Database - Diagramma Logico

```
[ANDREA: Crea diagramma testuale delle relazioni principali]

Destinazione (1) ──┬──> (*) Zone
                   ├──> (*) Esperienze
                   ├──> (*) Pacchetti
                   ├──> (*) Hotel
                   └──> (*) Itinerario

Zone (1) ──┬──> (*) Esperienze (via ZONA_COLLEGATA)
           ├──> (*) Pacchetti (via ZONA_COLLEGATA)
           ├──> (*) Hotel (via ZONA match)
           └──> ...

[CONTINUA QUI]




```

---

### Query e Filtri Principali

#### Filtro per Destinazione
```
[ANDREA: Spiega come si filtrano i dati per destinazione selezionata]




```

#### Filtro Zone per Progressive Unlock
```
[ANDREA: Spiega logica PRIORITA e CONTATORE_AREA per sblocco progressivo]




```

#### Filtro Esperienze per Zona e Interessi
```
[ANDREA: Spiega filtri applicati a esperienze (zona, interessi utente, difficoltà)]




```

#### Selezione Hotel per Zona e Budget
```
[ANDREA: Spiega come si selezionano hotel per zona e tier budget]




```

#### Calcolo Costi
```
[ANDREA: Formula calcolo costi totali]

Esperienze: SUM(esperienza.PRX_PAX × numberOfPeople)
Hotel: tierPrice × nights × numberOfPeople (per ogni zona)
Hotel Extras: extraPrice × nights × numberOfPeople
Accessori: 180 × numberOfPeople (fisso stimato)

TOTALE = ...




```

---

## MAPPATURA CHAT ↔ DATABASE

> Questa sezione mappa ogni step del flusso chat con le query/tabelle database coinvolte

### STEP 1: Welcome → Database Load
**Chat:**
- Mostra dati wizard
- Opzioni: Inizia / Modifica

**Database:**
```
[ANDREA: Quali tabelle vengono caricate? Quali filtri applicati?]




```

---

### STEP 2: Duration → Calcoli
**Chat:**
- Utente seleziona notti
- Calcola totalDays

**Database:**
```
[ANDREA: Quali vincoli da MIN_NOTTI? Relazioni con itinerari?]




```

---

### STEP 3: Zone Selection → Query Progressive
**Chat:**
- Mostra zone disponibili (prima arrivo, poi mappa)
- Stay/Transit logic
- Progressive unlock

**Database:**
```
[ANDREA: Query per zone PRIORITA=1 iniziali]


[ANDREA: Query per zone successive con CONTATORE_AREA/availableCounter]


[ANDREA: Come si determina GIORNI_CONSIGLIATI per allocation?]




```

---

### STEP 4: Experiences → Filtri Multi-Livello
**Chat:**
- Swipe esperienze per zona
- Like/Dislike
- Riempie giorni zona

**Database:**
```
[ANDREA: Query esperienze filtrate per:]
- ZONA_COLLEGATA = zonaCorrente.CODICE
- DESTINAZIONE = destinazioneSelezionata
- Interessi utente (come mappati nei campi CSV?)


[ANDREA: Come si determina numero SLOT esperienza?]


[ANDREA: Come si collegano EXTRA a esperienze?]




```

---

### STEP 5: Summary → Aggregazione Dati
**Chat:**
- Timeline esperienze
- Costi parziali

**Database:**
```
[ANDREA: Quali dati aggregati? Come si calcola timeline?]




```

---

### STEP 6: Hotels → Pricing Dinamico
**Chat:**
- 3 tier hotel per zona
- Extras opzionali
- Calcola costi

**Database:**
```
[ANDREA: Query hotel per zona e budget tier]


[ANDREA: Come si seleziona PRZ_PAX_NIGHT_[DATE] corretto?]


[ANDREA: Come si collegano hotel extras (EXTRA_1-7)?]


[ANDREA: Formula calcolo costi hotel + extras]




```

---

### STEP 7: Final Summary → Tutti i Dati
**Chat:**
- Trip completo
- Breakdown costi totale

**Database:**
```
[ANDREA: Aggregazione finale di tutte le tabelle]


[ANDREA: Come si caricano costi_accessori?]


[ANDREA: Formula calcolo TOTALE finale]




```

---

## ISSUES E MIGLIORAMENTI

### Bug Noti da Risolvere

#### BUG #1: Dislike Handler Incompleto
**Problema:**
```
[UTENTE: Descrivi il problema da perspective UX]


```

**Soluzione Database:**
```
[ANDREA: Come dovrebbero funzionare le alternative? Query per esperienze simili?]


```

---

#### BUG #2: Race Conditions Payment
**Problema:**
```
[UTENTE: Descrivi il problema]


```

**Soluzione Database:**
```
[ANDREA: Quali lock o transazioni necessarie?]


```

---

#### BUG #3: Hotel Cost Calculation (Extra Night)
**Problema:**
- Usa totalDays invece di (totalDays - 1)
- Carica 1 notte in più

**Soluzione Chat:**
```
[UTENTE: Dove correggere il calcolo nel flusso?]


```

**Soluzione Database:**
```
[ANDREA: Formula corretta per notti hotel per zona]


```

---

#### BUG #4: Non-Unique IDs (Date.now())
**Problema:**
```
[UTENTE: Dove vengono generati ID duplicati?]


```

**Soluzione Database:**
```
[ANDREA: Sistema ID univoci da implementare]


```

---

#### BUG #5: Type Coercion CSV Strings
**Problema:**
- Dati CSV come stringhe, confronti numerici falliscono

**Soluzione Chat:**
```
[UTENTE: Dove si manifestano errori di tipo nel flusso?]


```

**Soluzione Database:**
```
[ANDREA: Quali campi necessitano parsing numerico? Schema type conversion?]


```

---

### Miglioramenti Futuri

#### 1. Alternative Suggestions (Dislike)
**UX:**
```
[UTENTE: Come dovrebbe funzionare il sistema di alternative?]


```

**Database:**
```
[ANDREA: Query per trovare esperienze simili (stesso SLOT, stessa DIFFICOLTA, etc.)]


```

---

#### 2. Date Selection (Wizard Step 5)
**UX:**
```
[UTENTE: Flusso selezione date specifiche viaggio]


```

**Database:**
```
[ANDREA: Come usare colonne PRZ_PAX_NIGHT_[DATE] per pricing dinamico?]


```

---

#### 3. Validazione Sequenze Zone
**UX:**
```
[UTENTE: Come impedire sequenze zone illogiche geograficamente?]


```

**Database:**
```
[ANDREA: Come usare ZONA_1-4 in itinerario_tech per validare sequenze?]


```

---

#### 4. Ottimizzazione Caricamento Dati
**UX:**
```
[UTENTE: Loading states, preloading, caching strategy]


```

**Database:**
```
[ANDREA: Strategia caricamento lazy/eager per CSV? Indexing?]


```

---

## NOTE FINALI E DECISIONI

### Decisioni Architetturali
```
[ENTRAMBI: Annotate qui decisioni prese durante revisione]




```

### Priorità Interventi
```
[ENTRAMBI: Lista prioritizzata cosa fixare/implementare]

1.
2.
3.
```

### Dubbi e Domande Aperte
```
[ENTRAMBI: Domande da risolvere]




```

---

**Fine Documento - Revisione Generale Chat & Database**
