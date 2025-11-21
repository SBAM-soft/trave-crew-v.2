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
- [x] ChatMessage (bot_message_with_card)
- [x] ChatCard (WizardSummaryCard)
- [x] ChatOptions (Inizia / Modifica dati)

**Flusso:**
```
La chat si avvia dopo il completamento del wizard descrivendo il riassunto delle scelte fatte.
All'avvio della chat un'animazione trasforma queste info nella barra di stato.
```

**Note UX:**
```
Barra di stato in alto con le info di recap che si aggiornano in base alle scelte.
La barra deve essere discreta e collassabile.

⚠️ NOTA IMPORTANTE: Verificare le voci interessi del wizard con le voci interessi
nel file excel per avere le corrispondenze corrette (CATEGORIA_1/2/3 in esperienze_tech.csv)
```

**Database:**
```
Nessun database coinvolto in questo step, solo dati dal wizard.
```

---

### STEP 2: Duration Selection
**Finestre coinvolte:**
- [x] ChatMessage (bot_options)
- [x] ChatOptions (5/7/9/13/16 notti) ⚠️ MODIFICATO: non più 3 notti

**Flusso:**
```
La prima domanda sarà: "Quante notti vuoi fermarti?"
Opzioni: 5 / 7 / 9 / 13 / 16 notti

Dopo aver risposto compare in alto nella barra di stato la barra del tempo composta
dai blocchi temporali pari al numero di notti scelte.
(usiamo notti perché è lo standard di slot commerciale nel settore viaggi)
```

**Calcoli:**
- Input: Numero notti (5/7/9/13/16)
- Output: totalDays = notti + 1
- Giorni esclusi: Giorno 1 (arrivo) + ultimo giorno (partenza)

**Note UX:**
```
Barra tempo visualizza blocchi = numero notti.
Animazione apparizione barra tempo dopo selezione.
```

---

### STEP 3: Zone Selection (MULTI-STEP)
**Finestre coinvolte:**
- [x] ChatMap (selezione zone successive)
- [x] ChatOptions (Stay/Transit per ogni zona)
- [x] MapInteractive (mappa interattiva con zone cliccabili)

**Flusso Prima Selezione (Arrivo):**
```
Chiede le prime zone che vuole visitare tra quelle di arrivo dall'Italia.

DATABASE: zone_tech.csv
- Mostra solo zone con PRIORITA = "1"
- Filtro per DESTINAZIONE_COLLEGATA = destinazione scelta nel wizard

Dopo selezione prima zona chiede: "Solo di passaggio o vuoi fare esperienze?"
- "Solo di passaggio" → completa primo blocco temporale, propone altre zone (vai a Step 3B)
- "Voglio fare esperienze" → vai a Step 4
```

**Flusso Selezioni Successive (Step 3B):**
```
Per le zone successive bisogna considerare l'eventuale spostamento tecnico per raggiungerle.

DATABASE: zone_tech.csv
- Mostra zone con PRIORITA = "2" (o successive)
- Filtro per DESTINAZIONE_COLLEGATA = destinazione scelta

Anche qui: "Solo di passaggio o vuoi fare esperienze?"
```

**Logica Progressive Unlock:**
- Contatore: `availableCounter` (parte da 1)
- Prima iterazione: mostra solo zone PRIORITA=1
- Dopo scelta prima zona: TUTTE le altre zone sono libere (PRIORITA=2+)
- ⚠️ MODIFICATO: non più unlock progressivo dopo ogni zona, ma solo dopo prima zona

**Note UX:**
```
Mappa interattiva con zone cliccabili.
Stay/Transit determina se passare a esperienze (Step 4) o continuare selezione zone.
Feedback visivo su barra tempo: blocchi riempiti vs disponibili.
```

---

### STEP 4: Experiences Selection (TINDER-STYLE)
**Finestre coinvolte:**
- [x] ChatExperienceCard (swipe singola esperienza) - slider orizzontale con 3 card
- [x] ExperienceDetailFullscreen (dettagli completi) - modale fullscreen stile product page
- [x] ItineraryBuildingAnimation (dopo completamento barra tempo)

**Flusso per ogni Zona:**
```
Propone 3 card esperienza cliccabili in sliding orizzontale.
Al fondo dello slider c'è la possibilità di caricare altre esperienze.

DATABASE: esperienze_tech.csv
- Filtro per ZONA_COLLEGATA = zona corrente
- Filtro per destinazione
- Filtro per interessi: match con CATEGORIA_1, CATEGORIA_2, CATEGORIA_3
  vs interessi selezionati nel wizard

Se l'utente clicca sulla card si apre finestra fullscreen stile product page
con tutti i dettagli dell'esperienza (da esperienze_copy.csv).
```

**Azioni Utente:**
- ❤️ Like → aggiunge esperienza al trip → vai a **Step 4B**
- 👎 Dislike → skippa esperienza → vai a **Step 4C**
- 👁️ Dettagli → mostra fullscreen modal (poi torna a swipe)

**Gesture:** Like/Dislike possono avere logica gesture tipo Tinder

**Progress Tracking:**
- Visualizza: X/Y giorni completati
- Quando X == Y → passa a zona successiva
- Dopo tutte le zone → mostra animazione building → vai a Step 5

**Note UX:**
```
Slider orizzontale con 3 card visibili + "Carica altre".
Gesture swipe left/right per dislike/like.
Fullscreen modal con info complete esperienza, galleria immagini, descrizione, extra.
Progress bar sempre visibile: X/Y giorni completati per zona corrente.
```

---

### STEP 4B: Continua Experiences Selection
**Dopo conferma esperienza (Like):**

**Flusso:**
```
Dopo che ha confermato un'esperienza si completa il blocco temporale corrispondente.

Chiede: "Vuoi continuare con un'altra esperienza, aggiungere un giorno libero,
o cambiare zona?"

Opzioni:
- Altra esperienza → torna a Step 4
- Giorno libero → completa blocco con "free day", chiede di nuovo
- Cambia zona → torna a Step 3B (selezione zone successive)

Loop finché non completa la barra del tempo.
```

**Note UX:**
```
Barra tempo si riempie progressivamente.
Feedback visivo chiaro su giorni riempiti vs disponibili.
```

---

### STEP 4C: Dislike Experience Handler
**Dopo rifiuto esperienza (Dislike):**

**Flusso:**
```
L'esperienza rifiutata sparisce.

Propone: "Vuoi un giorno libero o scegli un'altra esperienza?"

Opzioni:
- Giorno libero → completa blocco con "free day" → vai a Step 4B
- Scegli altra esperienza → torna a Step 4 (nuova esperienza)

⚠️ TODO: Sistema suggerimento alternative automatico (esperienze simili)
```

**Note UX:**
```
Animazione scomparsa card rifiutata (swipe out).
Proposta immediata di alternativa o giorno libero.
```

---

### STEP 5: Summary Before Hotels (TTS - Timeline Travel Summary)
**Finestre coinvolte:**
- [x] Complete Trip Timeline (pagina riepilogativa stile product page)
- [x] Mappa itinerario
- [x] Breakdown costi parziali (solo esperienze)
- [x] ChatOptions (Salva bozza / Continua hotel / Modifica)

**Flusso:**
```
Quando ha riempito la barra del tempo con tutti i blocchi temporali
(esperienze o giorni liberi), esce la possibilità di creare l'itinerario
con l'animazione già creata (ItineraryBuildingAnimation).

Arriva ad una pagina riepilogativa (TTS) stile product page completa:
- Timeline verticale con tutte le esperienze
- Mappa dell'itinerario con zone visitate
- Dettagli di ogni esperienza
- Costi parziali (solo esperienze finora)

DATABASE:
- itinerario_tech.csv: trova itinerario con ZONA_1/2/3/4 = zone scelte
- itinerario_copy.csv: ⚠️ NUOVO FILE DA CREARE con info complete per display
  (dettagli per rendering pagina riepilogativa)
```

**Opzioni Utente:**
- **Salva bozza** → salva in "My Trips" (localStorage) per riprendere dopo
- **Continua con hotel** → vai a Step 6
- **Modifica viaggio** → torna alla chat (quale step?)

**Dati Mostrati:**
- Timeline cronologica esperienze per zona
- Mappa con route tra zone
- Breakdown costi esperienze: SUM(PRX_PAX × numberOfPeople)
- Totale parziale

**Note UX:**
```
Pagina riepilogativa deve essere engaging e completa.
Timeline verticale con card esperienze espandibili.
Mappa interattiva con markers zone.

⚠️ TODO TTS Modificabile:
Quando clicca su "Modifica" si apre chat per gestire modifiche.
Caso d'uso: giorno con esperienza mezza giornata → tempo libero residuo
→ Alert: "Puoi aggiungere un'esperienza per un giorno pieno"
→ Se accetta: apre flusso selezione esperienze (Step 4)
→ LOGICA DATABASE: [ANDREA]
```

---

### STEP 6: Hotels Selection
**Finestre coinvolte:**
- [x] ChatHotelSelector (3 tier: LOW/MEDIUM/LUXURY) - card espandibili
- [x] Hotel Extras (opzionali) - dentro card espansa
- [x] Text Field (preferenze personali) - dentro card espansa

**Flusso per ogni Zona:**
```
La scelta hotel riattiva la chat per questa parte di selezione con logiche a step.

Prima domanda: in base alla prima zona dell'itinerario propone scelta primo hotel.

Ci saranno 3 proposte, 1 per budget (LOW/MEDIUM/LUXURY).

⚠️ IMPORTANTE: Modalità BLIND
Questa scelta è una "mandato di ricerca" per permetterci di trovargli i migliori
hotel per la scelta di budget effettuata.
Dopo un lasso di tempo (TODO: definire), verrà notificata la fine della ricerca
e la possibilità di confermare la prenotazione.

Le card hotel NON sono di un hotel specifico ma di un "hotel tipo" (modalità blind)
con servizi tipo per quella fascia di budget.
Sviluppo card = product page espansa come per esperienze.

Nella card espansa l'utente può:
- Confermare la card così com'è
- Aggiungere extra (spa, transfer, upgrade, etc.)
- Inserire preferenze personali (text field libero)
- Scegliere una delle altre due tipologie di budget

Una volta confermata la tipologia per la prima zona → propone hotel zona successiva
con stessa modalità → loop fino ad esaurire tutte le zone dell'itinerario.

Una volta terminate le zone → ripropone TTS completo con hotel selezionati.
```

**Definizione Prezzi Hotel:**
```
DATABASE: hotel_tech.csv

I prezzi visualizzati nelle 3 card vengono presi tramite combinazione:
- ZONA (match con zona corrente)
- BUDGET (LOW/MEDIUM/HIGH)
- Colonne prezzi: PRZ_PAX_NIGHT_[MESE][SETTIMANA]
  Es: PRZ_PAX_NIGHT_GENNAIO2 = seconda settimana gennaio
      PRZ_PAX_NIGHT_GENNAIO4 = quarta settimana gennaio

Selezione data/periodo:
1. Se nel wizard ha scelto date specifiche → usa quella
2. Se wizard ha scelto mese/periodo → usa quello
3. Se non ha fatto scelta date nel wizard → CHIEDI IN CHAT:
   a) Proponi 3 date di partenza suggerite
   b) Oppure se rifiuta → proponi mese di partenza
   c) Poi proponi periodo del mese (es: inizio/metà/fine mese)
   d) Match con colonne PRZ_PAX_NIGHT_[MESE][SETTIMANA]

⚠️ TODO WIZARD: Togliere nel wizard la "data libera" e bottoni scelta rapida.
Se serve, pianifica questa modifica per altra sessione.
```

**Tier Hotel:**
- LOW: prezzo da hotel_tech.csv con BUDGET="LOW"
- MEDIUM: prezzo da hotel_tech.csv con BUDGET="MEDIUM"
- LUXURY: prezzo da hotel_tech.csv con BUDGET="HIGH"

**Calcolo Notti:**
- NON basato su GIORNI_CONSIGLIATI (quelli sono solo raccomandazioni)
- Basato su giorni effettivi allocati a quella zona dall'utente
- **BUG RISOLTO:** Non usa più totalDays ma giorni specifici per zona

**Extras Opzionali:**
```
DATABASE: extra_tech.csv
- Filtro per LIVELLO_PLUS = "htl" (hotel)
- Filtro per CODICE_COLLEGATO = hotel selezionato
- Spa, transfers, upgrade camera, etc.
- Costo: COSTO_SUPPLEMENTO × notti × numberOfPeople
```

**Note UX:**
```
Card hotel tipo (blind) con servizi generici per fascia budget.
Card espandibile stile product page.
Dentro card espansa: lista extra con checkbox, text field preferenze.
Animazione transizione tra zone.

Una volta confermato si comunica:
"Abbiamo attivato la ricerca dell'hotel da prenotare!"
"Vuoi fare altre modifiche o procedere all'itinerario finale?"

⚠️ TODO VOLI:
Adesso solo opzione di caricare biglietto di partenza se già preso.
In chat: carica solo la data.
Nel profilo: carica il biglietto per richiamarlo anche dall'app.
```

---

### STEP 7: Final Summary (TTS Completo)
**Finestre coinvolte:**
- [x] Complete TTS (Timeline Travel Summary completa)
- [x] Mappa itinerario con tutte le zone
- [x] Full Cost Breakdown dettagliato
- [x] ChatOptions (Salva / Condividi / Pubblica / Modifica)

**Flusso:**
```
Il flusso è completato. Mostra TTS completo con:
- Tutte le zone visitate (con mappa itinerario)
- Tutte le esperienze selezionate (timeline verticale)
- Tutti gli hotel scelti (o in fase di selezione con "mandato ricerca" attivo)
- Breakdown costi completo e dettagliato
```

**Dati Mostrati:**

**1. Zone Visitate:**
- Mappa itinerario con markers e route
- Lista zone con giorni allocati

**2. Esperienze:**
- Timeline verticale cronologica
- Card esperienza con dettagli, foto, descrizione
- Extra collegati ad ogni esperienza

**3. Hotel:**
- Card hotel per zona con tier selezionato
- Stato: "In ricerca" o "Confermato" (se già trovato)
- Extra hotel selezionati
- Preferenze personali inserite

**4. Breakdown Costi Completo:**
```
Esperienze: SUM(esperienza.PRX_PAX × numberOfPeople)
Hotel: SUM(tierPrice × notti × numberOfPeople) per ogni zona
Hotel Extras: SUM(extra.COSTO_SUPPLEMENTO × notti × numberOfPeople)
Accessori: 180 × numberOfPeople (voli interni, tasse - fisso stimato)

TOTALE: [somma di tutto quanto sopra]
```

**Azioni Finali:**
- **Salva in "My Trips"** → localStorage (persistenza locale)
- **Condividi** → ⚠️ TODO FUTURE (social share)
- **Pubblica in Explore** → ⚠️ TODO FUTURE (community feature)
- **Modifica** → torna a step specifico (quale? TBD)

**Note UX:**
```
TTS finale deve essere il "wow moment":
- Design accattivante, engaging
- Timeline verticale fluida con animazioni
- Mappa interattiva con route visuale
- Breakdown costi chiaro e trasparente
- CTA evidenti per prossimi step

Possibile integrazione:
- Download PDF itinerario
- Condivisione via link
- Aggiunta al calendario
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
- DESTINAZIONE_COLLEGATA (FK → destinazioni)
- ZONA (nome)
- PRIORITA (1 = città arrivo, 2+ = zone secondarie)
- GIORNI_CONSIGLIATI (raccomandazione, NON vincolo)
- COORDINATE_LAT, COORDINATE_LNG (per mappa interattiva)
- HOTEL_1, HOTEL_2, HOTEL_3 (FK → hotel)
- VOLO_1, VOLO_2 (FK → voli)
- COSTI_ACC_1-3 (FK → costi_accessori)
- EXTRA_1-3 (FK → extra)

```
[ANDREA: Logiche relazioni, priorità progressive unlock, collegamenti]

Logica PRIORITA:
- PRIORITA = "1" → Zone di arrivo dall'Italia (es: Bangkok, Atene)
  Mostrate per prime in Step 3, l'utente DEVE scegliere una di queste
- PRIORITA = "2" o superiore → Zone secondarie/interne
  Sbloccate DOPO scelta prima zona, mostrate su mappa interattiva

Filtro destinazione:
- DESTINAZIONE_COLLEGATA deve matchare destinazione scelta nel wizard
- Es: wizard.destination = "TH" → mostra solo zone con DESTINAZIONE_COLLEGATA = "TH"

GIORNI_CONSIGLIATI:
- È solo una raccomandazione visiva per l'utente
- NON determina allocazione automatica giorni
- L'utente decide quanti giorni allocare tramite esperienze selezionate

Collegamenti:
- HOTEL_1/2/3: codici hotel disponibili per quella zona (LOW/MEDIUM/HIGH)
- COSTI_ACC_1-3: costi accessori specifici per quella zona (tasse locali, transfer, etc.)
```

#### 3. esperienze_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "X"
- DESTINAZIONE (FK)
- ZONA
- ZONA_COLLEGATA (FK → zone.CODICE)
- CATEGORIA_1, CATEGORIA_2, CATEGORIA_3 (interessi: cultura, natura, avventura, etc.)
- DIFFICOLTA (1-3: facile/media/difficile)
- SLOT (durata in giorni, di solito 2)
- PRX_PAX (prezzo per persona)
- EXTRA_1-9 (FK → extra)

```
[ANDREA: Logiche filtri per zona, difficoltà, collegamenti extra]

Filtri principali (Step 4):
1. Filtro zona:
   - ZONA_COLLEGATA = zona_corrente.CODICE
   - Mostra solo esperienze disponibili nella zona in cui si trova l'utente

2. Filtro destinazione:
   - DESTINAZIONE = wizard.destination

3. ⚠️ CRITICO - Filtro interessi:
   - Match tra wizard.interests e (CATEGORIA_1 OR CATEGORIA_2 OR CATEGORIA_3)
   - Es: Se wizard.interests = ["cultura", "natura"]
     Mostra esperienze dove CATEGORIA_1="cultura" OR CATEGORIA_2="cultura"
     OR CATEGORIA_3="cultura" OR CATEGORIA_1="natura" OR ...
   - VERIFICARE mapping esatto nomi categorie wizard ↔ CSV

4. SLOT (durata):
   - Indica quanti giorni/blocchi temporali occupa l'esperienza
   - Quando utente fa Like, riempie SLOT giorni nella barra tempo
   - Es: SLOT=2 → occupa 2 notti del viaggio

Collegamenti EXTRA:
- EXTRA_1-9 contengono codici FK → extra_tech.csv
- Query extra per fullscreen modal:
  SELECT * FROM extra_tech
  WHERE CODICE IN (EXTRA_1, EXTRA_2, ..., EXTRA_9)
  AND LIVELLO_PLUS = "esp"
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

```
[ANDREA: Logiche pacchetti (se ancora in uso), relazioni esperienze]

⚠️ DEPRECATO: Sistema pacchetti vecchio

Il nuovo flusso (Step 4) NON usa più i pacchetti pre-confezionati.
Utilizza invece selezione esperienze singole stile Tinder.

Tabella probabilmente da ignorare o da rimuovere in futuro.
Se ancora in uso per altro scopo, documentare qui.
```

#### 5. hotel_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "H"
- DESTINAZIONE (FK)
- ZONA (match con zone_tech.ZONA)
- QUARTIERE
- BUDGET (LOW/MEDIUM/HIGH)
- PRZ_PAX_NIGHT_GENNAIO2, PRZ_PAX_NIGHT_GENNAIO4, ... PRZ_PAX_NIGHT_DICEMBRE4
  (25 colonne: 12 mesi × 2 periodi = 24, più alcune settimane extra)
- EXTRA_1-7 (FK → extra)

```
[ANDREA: Logiche pricing dinamico per date, filtri per zona/budget]

Modalità BLIND (Step 6):
- Le card hotel NON mostrano hotel specifici
- Mostrano "hotel tipo" con servizi generici per fascia budget
- Es: "Hotel 3* in zona centrale con piscina" (generico)

Filtri (Step 6):
1. Zona: ZONA = zona_corrente.nome
2. Destinazione: DESTINAZIONE = wizard.destination
3. Budget tier: BUDGET IN ("LOW", "MEDIUM", "HIGH")
   - Query 3 hotel (uno per tier) per ogni zona

Pricing dinamico PRZ_PAX_NIGHT_[MESE][SETTIMANA]:
- Colonne: PRZ_PAX_NIGHT_GENNAIO2 = seconda settimana gennaio
           PRZ_PAX_NIGHT_MARZO4 = quarta settimana marzo, etc.

Logica selezione prezzo:
1. Se wizard.departureDate disponibile:
   - Estrai mese (es: Gennaio)
   - Calcola settimana del mese (1-4)
   - Match colonna: PRZ_PAX_NIGHT_[MESE][SETTIMANA]

2. Se wizard ha solo mese/periodo:
   - Usa quel periodo direttamente

3. Se wizard non ha date:
   - CHIEDI IN CHAT (Step 6):
     * Proponi 3 date suggerite OR
     * Proponi mese + periodo (inizio/metà/fine mese)
   - Poi match colonna pricing

Calcolo costo hotel zona:
- prezzo_base = PRZ_PAX_NIGHT_[PERIODO] × notti_zona × numberOfPeople
- notti_zona = COUNT(giorni allocati a quella zona) da tripData

Collegamenti EXTRA:
- EXTRA_1-7 → extra_tech.csv (spa, transfer, upgrade, etc.)
- Filtro: LIVELLO_PLUS = "htl"
```

#### 6. itinerario_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "I"
- DESTINAZIONE (FK)
- CONTATORE_ZONA (livello unlock progressivo - probabilmente non più usato)
- ZONA_1, ZONA_2, ZONA_3, ZONA_4 (FK → zone.CODICE - sequenza zone itinerario)
- MIN_NOTTI
- COSTI_ACC_1-6 (FK → costi_accessori)
- EXTRA_1-7 (FK → extra)

```
[ANDREA: Logiche sequenze zone permesse, contatore unlock]

Utilizzo (Step 5):
- Trova itinerario che match le zone scelte dall'utente
- Query: WHERE ZONA_1 = zona1.CODICE AND ZONA_2 = zona2.CODICE AND ...
- Questo identifica l'itinerario "ufficiale" per quella combinazione di zone

⚠️ NOTA: CONTATORE_ZONA probabilmente non più usato con nuovo flusso
(progressive unlock ora basato solo su PRIORITA in zone_tech.csv)

Validazione sequenze zone:
- ZONA_1/2/3/4 definiscono sequenze logiche/geografiche permesse
- Es: ZONA_1=Bangkok, ZONA_2=Chiang Mai, ZONA_3=Phuket
  → sequenza geograficamente sensata
- Se utente sceglie combinazione non esistente → ???
  (Da definire: warning? proposta itinerario simile?)

Collegamenti costi accessori:
- COSTI_ACC_1-6 → costi_accessori_tech.csv
- Costi obbligatori per quell'itinerario (voli interni, tasse, etc.)

⚠️ NUOVO FILE NECESSARIO: itinerario_copy.csv
- Per rendering TTS con info marketing/descrittive
- Campi da definire con Andrea
```

#### 7. extra_tech.csv
**Campi principali:**
- CODICE (PK)
- TIPO = "E"
- DESTINAZIONE (FK)
- ZONA
- PLUS (nome extra, es: "Spa Premium", "Transfer aeroporto", "Guida privata")
- LIVELLO_PLUS (esp = esperienza, htl = hotel, etc.)
- SUPPLEMENTO (descrizione dettagliata)
- COSTO_SUPPLEMENTO (costo extra da aggiungere)
- CODICE_COLLEGATO (FK a esperienza/hotel - opzionale?)
- PREZZO_SERVIZIO_BASE
- PREZZO_FINALE_SERVIZIO
- MARGINE_FINALE

```
[ANDREA: Logiche collegamenti extra a esperienze/hotel, calcoli costi]

Collegamenti a esperienze (Step 4):
- Esperienze hanno EXTRA_1-9 con codici FK
- Query: SELECT * FROM extra_tech
         WHERE CODICE IN (esperienza.EXTRA_1-9)
         AND LIVELLO_PLUS = "esp"
- Display in fullscreen modal esperienza

Collegamenti a hotel (Step 6):
- Hotel hanno EXTRA_1-7 con codici FK
- Query: SELECT * FROM extra_tech
         WHERE CODICE IN (hotel.EXTRA_1-7)
         AND LIVELLO_PLUS = "htl"
- Display come checkbox in card hotel espansa
- Es: Spa (+€50/notte), Transfer (+€30), Upgrade camera (+€40/notte)

Calcolo costi extra:
- Esperienze: COSTO_SUPPLEMENTO × numberOfPeople (una tantum)
- Hotel: COSTO_SUPPLEMENTO × notti_zona × numberOfPeople

⚠️ NOTA: CODICE_COLLEGATO sembra ridondante se esperienze/hotel
hanno già EXTRA_1-9/EXTRA_1-7. Verificare utilizzo con Andrea.
```

#### 8. costi_accessori_tech.csv
**Campi principali (da confermare con Andrea):**
- CODICE (PK)
- TIPO = "CA" (costo accessorio?)
- DESTINAZIONE (FK)
- ZONA (opzionale - se specifico per zona)
- NOME_COSTO (es: "Volo interno Bangkok-Phuket", "Tassa ingresso Angkor Wat")
- DESCRIZIONE
- COSTO (??? nome campo da confermare)
- OBBLIGATORIO (sì/no)

```
[ANDREA: Descrivi struttura, costi obbligatori (voli interni, tasse, tickets)]

Utilizzo (Step 7):
- Costi accessori sono costi obbligatori NON inclusi in esperienze/hotel
- Es: voli interni tra zone, tasse ingresso parchi nazionali, transfer obbligatori

Collegamenti:
- Da itinerario_tech.csv tramite COSTI_ACC_1-6
- Da zone_tech.csv tramite COSTI_ACC_1-3

Query (Step 7):
SELECT * FROM costi_accessori_tech
WHERE CODICE IN (
  itinerario.COSTI_ACC_1-6,
  zona1.COSTI_ACC_1-3,
  zona2.COSTI_ACC_1-3,
  ...
)
AND DESTINAZIONE = wizard.destination

Calcolo:
- costo_accessorio × numberOfPeople (per ogni accessorio)
- TOTALE accessori = SUM(tutti gli accessori)

⚠️ SE TABELLA NON DISPONIBILE O INCOMPLETA:
- Usa stima fissa: 180 × numberOfPeople
- Da sostituire con calcolo preciso quando disponibile

⚠️ CRITICO: Confermare struttura esatta con Andrea
```

---

### Relazioni Database - Diagramma Logico

```
[ANDREA: Crea diagramma testuale delle relazioni principali]

Destinazione (1) ──┬──> (*) Zone (via DESTINAZIONE_COLLEGATA)
                   ├──> (*) Esperienze (via DESTINAZIONE)
                   ├──> (*) Pacchetti (via DESTINAZIONE) [DEPRECATO]
                   ├──> (*) Hotel (via DESTINAZIONE)
                   ├──> (*) Itinerario (via DESTINAZIONE)
                   ├──> (*) Extra (via DESTINAZIONE)
                   └──> (*) Costi_Accessori (via DESTINAZIONE)

Zone (1) ──┬──> (*) Esperienze (via ZONA_COLLEGATA = zone.CODICE)
           ├──> (*) Hotel (via ZONA match)
           ├──> (3) Hotel_Tier (via HOTEL_1, HOTEL_2, HOTEL_3)
           ├──> (*) Extra (via ZONA)
           └──> (*) Costi_Accessori (via COSTI_ACC_1-3)

Esperienze (1) ──┬──> (*) Extra (via EXTRA_1-9, filtro LIVELLO_PLUS="esp")
                 └──> (1) Zona (via ZONA_COLLEGATA)

Hotel (1) ──┬──> (*) Extra (via EXTRA_1-7, filtro LIVELLO_PLUS="htl")
            └──> (1) Zona (via ZONA)

Itinerario (1) ──┬──> (4) Zone (via ZONA_1, ZONA_2, ZONA_3, ZONA_4)
                 ├──> (*) Costi_Accessori (via COSTI_ACC_1-6)
                 └──> (*) Extra (via EXTRA_1-7)

Extra ──> (1) Esperienze/Hotel (via CODICE_COLLEGATO - opzionale/ridondante?)

Wizard (runtime) ──┬──> seleziona (1) Destinazione
                   ├──> filtro interessi → Esperienze (CATEGORIA_1/2/3)
                   ├──> filtro numberOfPeople → calcoli prezzi
                   └──> filtro departureDate → Hotel pricing (PRZ_PAX_NIGHT_[PERIODO])

TripData (runtime Zustand) ──┬──> (*) Zone selezionate
                              ├──> (*) Esperienze (filledBlocks)
                              ├──> (*) Hotel (per zona con tier)
                              └──> (1) Itinerario (match ZONA_1-4)

[ANDREA: Verifica e completa relazioni mancanti]
```

---

### Query e Filtri Principali

#### Filtro per Destinazione
```
[ANDREA: Spiega come si filtrano i dati per destinazione selezionata]

Filtro globale applicato a TUTTE le query:
- wizard.destination = codice destinazione (es: "TH" = Thailand, "GR" = Greece)

Tabelle con campo DESTINAZIONE:
- zone_tech.csv → DESTINAZIONE_COLLEGATA = wizard.destination
- esperienze_tech.csv → DESTINAZIONE = wizard.destination
- hotel_tech.csv → DESTINAZIONE = wizard.destination
- itinerario_tech.csv → DESTINAZIONE = wizard.destination
- extra_tech.csv → DESTINAZIONE = wizard.destination
- costi_accessori_tech.csv → DESTINAZIONE = wizard.destination

Tutte le query DEVONO includere questo filtro per evitare mix di dati
tra destinazioni diverse.
```

#### Filtro Zone per Progressive Unlock
```
[ANDREA: Spiega logica PRIORITA e CONTATORE_AREA per sblocco progressivo]

Step 3 - Prima selezione (zone arrivo):
SELECT * FROM zone_tech
WHERE DESTINAZIONE_COLLEGATA = wizard.destination
AND PRIORITA = "1"

Output: Zone di arrivo dall'Italia (es: Bangkok, Atene, L'Avana)
L'utente DEVE scegliere una di queste per iniziare.

Step 3B - Selezioni successive (zone interne):
SELECT * FROM zone_tech
WHERE DESTINAZIONE_COLLEGATA = wizard.destination
AND PRIORITA >= "2"

Output: Tutte le altre zone, mostrate su mappa interattiva.
L'utente può scegliere liberamente.

⚠️ NOTA IMPORTANTE:
- CONTATORE_AREA in pacchetti_tech.csv NON più usato (pacchetti deprecati)
- CONTATORE_ZONA in itinerario_tech.csv probabilmente non più usato
- Progressive unlock ora basato SOLO su PRIORITA (1 vs 2+)
- NON c'è più unlock graduale dopo ogni zona completata
```

#### Filtro Esperienze per Zona e Interessi
```
[ANDREA: Spiega filtri applicati a esperienze (zona, interessi utente, difficoltà)]

Step 4 - Query esperienze per zona corrente:

SELECT * FROM esperienze_tech
WHERE ZONA_COLLEGATA = zona_corrente.CODICE
AND DESTINAZIONE = wizard.destination
AND (
  CATEGORIA_1 IN wizard.interests OR
  CATEGORIA_2 IN wizard.interests OR
  CATEGORIA_3 IN wizard.interests
)
ORDER BY ???  -- [ANDREA: priorità? prezzo? random?]

⚠️ CRITICO - Mapping interessi:
- wizard.interests = array di stringhe (es: ["cultura", "natura", "avventura"])
- CATEGORIA_1/2/3 devono avere ESATTAMENTE gli stessi valori stringa
- Es: Se wizard usa "cultura" → CSV deve avere "cultura" (non "culturale")
- VERIFICARE ASSOLUTAMENTE prima di implementare

Filtro difficoltà (opzionale?):
- DIFFICOLTA 1 = facile, 2 = media, 3 = difficile
- Da filtrare in base a wizard.fitnessLevel? (se disponibile)

Output: Lista esperienze filtrate
- Mostra 3 alla volta in slider orizzontale
- Pulsante "Carica altre" per vedere successive
```

#### Selezione Hotel per Zona e Budget
```
[ANDREA: Spiega come si selezionano hotel per zona e tier budget]

Step 6 - Query 3 hotel per zona (uno per tier):

Per ogni zona nell'itinerario:

-- Hotel LOW
SELECT * FROM hotel_tech
WHERE ZONA = zona_corrente.nome
AND DESTINAZIONE = wizard.destination
AND BUDGET = "LOW"
LIMIT 1  -- [ANDREA: quale scegliere se ce ne sono multipli? random? first?]

-- Hotel MEDIUM
SELECT * FROM hotel_tech
WHERE ZONA = zona_corrente.nome
AND DESTINAZIONE = wizard.destination
AND BUDGET = "MEDIUM"
LIMIT 1

-- Hotel HIGH (LUXURY)
SELECT * FROM hotel_tech
WHERE ZONA = zona_corrente.nome
AND DESTINAZIONE = wizard.destination
AND BUDGET = "HIGH"
LIMIT 1

Output: 3 card hotel (blind) con prezzi dinamici per periodo viaggio

Pricing dinamico - Selezione colonna:
1. Determina mese/periodo da wizard.departureDate (o chiedi in chat)
2. Map mese+settimana → nome colonna
   Es: 15 Gennaio (settimana 2) → PRZ_PAX_NIGHT_GENNAIO2
   Es: 25 Marzo (settimana 4) → PRZ_PAX_NIGHT_MARZO4
3. Estrai prezzo da colonna corrispondente

Calcolo costo zona:
- prezzo_notte = hotel.PRZ_PAX_NIGHT_[PERIODO]
- notti_zona = COUNT(giorni allocati) da tripData per quella zona
- costo_base = prezzo_notte × notti_zona × numberOfPeople
```

#### Calcolo Costi
```
[ANDREA: Formula calcolo costi totali]

Formula breakdown completo (Step 7):

1. COSTO ESPERIENZE:
   FOR EACH esperienza IN tripData.filledBlocks:
     costo_esperienza = esperienza.PRX_PAX × numberOfPeople

   TOTALE_ESPERIENZE = SUM(costo_esperienza per tutte le esperienze)

2. COSTO HOTEL BASE:
   FOR EACH zona IN tripData.selectedZones:
     notti_zona = COUNT(giorni in tripData.filledBlocks per quella zona)
     hotel_tier = tripData.hotels[zona].selectedTier  -- LOW/MEDIUM/HIGH
     prezzo_notte = hotel_tier.PRZ_PAX_NIGHT_[PERIODO]
     costo_hotel_zona = prezzo_notte × notti_zona × numberOfPeople

   TOTALE_HOTEL_BASE = SUM(costo_hotel_zona per tutte le zone)

3. COSTO HOTEL EXTRAS:
   FOR EACH zona IN tripData.selectedZones:
     notti_zona = COUNT(giorni per quella zona)
     FOR EACH extra IN tripData.hotels[zona].selectedExtras:
       costo_extra_zona = extra.COSTO_SUPPLEMENTO × notti_zona × numberOfPeople

   TOTALE_HOTEL_EXTRAS = SUM(costo_extra_zona per tutte le zone e extra)

4. COSTI ACCESSORI:
   -- Da itinerario
   itinerario_accessori = SELECT FROM costi_accessori_tech
                          WHERE CODICE IN itinerario.COSTI_ACC_1-6

   -- Da zone
   zone_accessori = SELECT FROM costi_accessori_tech
                    WHERE CODICE IN zona.COSTI_ACC_1-3 PER OGNI zona

   FOR EACH accessorio IN (itinerario_accessori + zone_accessori):
     costo_accessorio = accessorio.COSTO × numberOfPeople

   TOTALE_ACCESSORI = SUM(costo_accessorio)

   ⚠️ SE costi_accessori_tech.csv non disponibile o incompleto:
   TOTALE_ACCESSORI = 180 × numberOfPeople (stima fissa)

5. TOTALE FINALE:
   TOTALE = TOTALE_ESPERIENZE +
            TOTALE_HOTEL_BASE +
            TOTALE_HOTEL_EXTRAS +
            TOTALE_ACCESSORI

Display breakdown:
- Esperienze: €X
- Hotel: €Y
- Servizi extra hotel: €Z
- Costi accessori: €W
- ─────────────────
- TOTALE VIAGGIO: €TOTALE
```

---

## MAPPATURA CHAT ↔ DATABASE

> Questa sezione mappa ogni step del flusso chat con le query/tabelle database coinvolte

### STEP 1: Welcome → Database Load
**Chat:**
- Mostra dati wizard (destinazione, persone, budget, interessi)
- Opzioni: Inizia / Modifica
- Nessun database caricato in questo step

**Database:**
```
[ANDREA: Conferma che nessun CSV viene caricato qui]

Solo dati da wizard in memoria.
Eventuale preload delle tabelle principali per Step 2-3?
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
- Mostra zone disponibili (prima arrivo PRIORITA=1, poi tutte PRIORITA=2+)
- Stay/Transit logic
- Progressive unlock dopo prima zona

**Database:**
```
[ANDREA: Query per zone PRIORITA=1 iniziali]

Tabella: zone_tech.csv
Filtri:
- PRIORITA = "1"
- DESTINAZIONE_COLLEGATA = wizard.destination
Output: Lista zone arrivo

[ANDREA: Query per zone successive]

Tabella: zone_tech.csv
Filtri:
- PRIORITA >= "2" (tutte le altre zone)
- DESTINAZIONE_COLLEGATA = wizard.destination
Output: Tutte le zone non-arrivo (mostra su mappa)

[ANDREA: Come si determina GIORNI_CONSIGLIATI per allocation?]

Campo: GIORNI_CONSIGLIATI in zone_tech.csv
- È solo un suggerimento per l'utente
- NON determina allocazione automatica
- Utente decide se Stay (fa esperienze) o Transit (passa oltre)
- Se Stay: riempie giorni fino a saturazione barra tempo (non basato su GIORNI_CONSIGLIATI)
```

---

### STEP 4: Experiences → Filtri Multi-Livello
**Chat:**
- Swipe esperienze per zona (slider 3 card + "carica altre")
- Like/Dislike/Dettagli
- Riempie giorni zona fino a saturazione barra tempo

**Database:**
```
[ANDREA: Query esperienze filtrate per:]

Tabella: esperienze_tech.csv
Filtri principali:
- ZONA_COLLEGATA = zonaCorrente.CODICE
- DESTINAZIONE = wizard.destination
- Interessi: match tra wizard.interests e (CATEGORIA_1 OR CATEGORIA_2 OR CATEGORIA_3)

⚠️ CRITICO: Verificare mapping interessi wizard ↔ CATEGORIA_1/2/3
Es: wizard.interests = ["cultura", "natura"]
    deve matchare esperienze con CATEGORIA_1="cultura" o CATEGORIA_2="natura" etc.

Output: Lista esperienze filtrate, mostra 3 alla volta

[ANDREA: Come si determina numero SLOT esperienza?]

Campo: SLOT in esperienze_tech.csv
- Indica durata esperienza in giorni (di solito 2)
- Quando utente fa Like, riempie SLOT giorni nella barra tempo
- Es: SLOT=2 → riempie 2 blocchi temporali

[ANDREA: Come si collegano EXTRA a esperienze?]

Campi: EXTRA_1, EXTRA_2, ..., EXTRA_9 in esperienze_tech.csv
- Contengono codici FK → extra_tech.csv
- Query extra:
  Tabella: extra_tech.csv
  Filtri:
  - CODICE IN (esperienza.EXTRA_1, esperienza.EXTRA_2, ..., esperienza.EXTRA_9)
  - LIVELLO_PLUS = "esp" (esperienza level)

Output: Lista extra collegati all'esperienza per display in fullscreen modal
```

---

### STEP 5: Summary → Aggregazione Dati
**Chat:**
- Timeline esperienze (TTS parziale)
- Mappa itinerario
- Costi parziali (solo esperienze)

**Database:**
```
[ANDREA: Quali dati aggregati? Come si calcola timeline?]

Tabella principale: itinerario_tech.csv
Query:
- Trova riga dove ZONA_1, ZONA_2, ZONA_3, ZONA_4 matchano le zone scelte dall'utente
- Questo determina l'itinerario "ufficiale"

⚠️ NUOVO FILE: itinerario_copy.csv
Creare file con info complete per rendering TTS:
- Descrizioni zone
- Info logistiche (spostamenti tra zone)
- Testi marketing per ogni itinerario
- ???

Aggregazione esperienze:
- Da tripData.filledBlocks (in memoria Zustand)
- Ordinamento cronologico per giorno
- Per ogni esperienza: fetch dettagli completi da esperienze_tech.csv + esperienze_copy.csv

Calcolo costi parziali:
Esperienze: SUM(esperienza.PRX_PAX × numberOfPeople) per ogni esperienza in filledBlocks
Totale parziale = solo esperienze (hotel ancora da selezionare)

Timeline:
- Array filledBlocks ordinato per indice giorno
- Ogni blocco ha: esperienza.CODICE, zona, giorno
- Render timeline verticale con dati da esperienze_copy.csv
```

---

### STEP 6: Hotels → Pricing Dinamico
**Chat:**
- 3 tier hotel blind per zona (LOW/MEDIUM/LUXURY)
- Extras opzionali in card espansa
- Calcola costi per notti effettive zona

**Database:**
```
[ANDREA: Query hotel per zona e budget tier]

Tabella: hotel_tech.csv

Per ogni zona nell'itinerario, query 3 hotel (uno per tier):
Filtri:
- ZONA = zonaCorrente.nome
- DESTINAZIONE = wizard.destination
- BUDGET = "LOW" (poi "MEDIUM", poi "HIGH")

Output: 1 hotel per tier (totale 3 card)

[ANDREA: Come si seleziona PRZ_PAX_NIGHT_[DATE] corretto?]

Colonne: PRZ_PAX_NIGHT_GENNAIO2, PRZ_PAX_NIGHT_GENNAIO4, ..., PRZ_PAX_NIGHT_DICEMBRE4

Logica selezione:
1. Se wizard.departureDate esiste → estrai mese + settimana → match colonna
   Es: 15 Gennaio → GENNAIO2 (seconda settimana)
2. Se wizard ha solo mese/periodo → usa quello
3. Se wizard non ha date → CHIEDI IN CHAT:
   - Proponi 3 date specifiche O
   - Proponi mese + periodo (inizio/metà/fine mese)

Match mese + settimana a colonna PRZ_PAX_NIGHT_[MESE][SETTIMANA]

Output: prezzo_per_notte per quel tier in quel periodo

[ANDREA: Come si collegano hotel extras (EXTRA_1-7)?]

Campi: EXTRA_1, EXTRA_2, ..., EXTRA_7 in hotel_tech.csv
- Contengono codici FK → extra_tech.csv
- Query extra:
  Tabella: extra_tech.csv
  Filtri:
  - CODICE IN (hotel.EXTRA_1, hotel.EXTRA_2, ..., hotel.EXTRA_7)
  - LIVELLO_PLUS = "htl" (hotel level)

Output: Lista extra (spa, transfer, upgrade) per checkbox in card espansa

[ANDREA: Formula calcolo costi hotel + extras]

Per ogni zona:
- notti_zona = giorni allocati a quella zona (da tripData)
- prezzo_base = hotel.PRZ_PAX_NIGHT_[PERIODO] × notti_zona × numberOfPeople

Se extra selezionati:
- prezzo_extra = SUM(extra.COSTO_SUPPLEMENTO × notti_zona × numberOfPeople)

Totale zona = prezzo_base + prezzo_extra

Totale hotel = SUM(totale zona) per tutte le zone
```

---

### STEP 7: Final Summary → Tutti i Dati
**Chat:**
- TTS completo con tutto (zone, esperienze, hotel)
- Mappa itinerario finale
- Breakdown costi totale dettagliato

**Database:**
```
[ANDREA: Aggregazione finale di tutte le tabelle]

Dati da aggregare:
1. Zone: da zone_tech.csv (già in memoria da Step 3)
2. Esperienze: da esperienze_tech.csv + esperienze_copy.csv (già in tripData.filledBlocks)
3. Hotel: da hotel_tech.csv (già in tripData.hotels con tier selezionati)
4. Itinerario: da itinerario_tech.csv + itinerario_copy.csv (già determinato in Step 5)
5. Costi accessori: da costi_accessori_tech.csv (NUOVO - vedi sotto)

[ANDREA: Come si caricano costi_accessori?]

Tabella: costi_accessori_tech.csv

Query costi obbligatori:
- Collegati all'itinerario via itinerario_tech.csv colonne COSTI_ACC_1-6
- Collegati alle zone via zone_tech.csv colonne COSTI_ACC_1-3

Filtri:
- CODICE IN (itinerario.COSTI_ACC_1-6, zona.COSTI_ACC_1-3 per ogni zona)
- DESTINAZIONE = wizard.destination

Output: Lista costi accessori (voli interni, tasse ingresso, tickets obbligatori, etc.)

[ANDREA: Formula calcolo TOTALE finale]

Breakdown completo:

1. Costo Esperienze:
   SUM(esperienza.PRX_PAX × numberOfPeople) per ogni esperienza in filledBlocks

2. Costo Hotel Base:
   SUM(hotel.PRZ_PAX_NIGHT_[PERIODO] × notti_zona × numberOfPeople) per ogni zona

3. Costo Hotel Extras:
   SUM(extra.COSTO_SUPPLEMENTO × notti_zona × numberOfPeople) per ogni extra selezionato

4. Costi Accessori:
   SUM(accessorio.costo × numberOfPeople) per ogni accessorio obbligatorio
   ⚠️ Se non disponibile formula precisa: 180 × numberOfPeople (stima fissa)

TOTALE = (1) + (2) + (3) + (4)

Output: Breakdown dettagliato + TOTALE finale
```

---

## ISSUES E MIGLIORAMENTI

### Bug Noti da Risolvere

#### BUG #1: Dislike Handler Incompleto
**Problema UX:**
```
Quando utente fa Dislike su un'esperienza, l'esperienza sparisce ma il sistema
propone solo "giorno libero" o "scegli altra esperienza" manualmente.

MANCA: Sistema automatico di suggerimento alternative simili.

Comportamento desiderato:
- Dislike esperienza X
- Sistema suggerisce automaticamente esperienza Y simile a X
- Se anche Y viene rifiutata → propone Z
- Dopo N rifiuti → propone "giorno libero" o "scegli manualmente"
```

**Soluzione Database:**
```
[ANDREA: Come dovrebbero funzionare le alternative? Query per esperienze simili?]

Query alternative:
Tabella: esperienze_tech.csv
Filtri:
- ZONA_COLLEGATA = stessa zona esperienza rifiutata
- DESTINAZIONE = stessa destinazione
- SLOT = stesso valore (stessa durata)
- CATEGORIA_1/2/3 match con categorie esperienza rifiutata
- DIFFICOLTA = stessa o ±1
- CODICE != esperienza già rifiutata (escludi già viste)

Ordinamento:
- Priorità a esperienze con più categorie in comune
- Poi per prezzo simile (PRX_PAX vicino)

Output: Esperienza alternativa più simile
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
- Vecchio sistema usava totalDays invece di (totalDays - 1)
- Caricava 1 notte in più

**Soluzione Chat:**
```
✅ RISOLTO con nuovo flusso:

NON si usa più GIORNI_CONSIGLIATI per calcolo notti.
Si usano giorni EFFETTIVI allocati dall'utente per ogni zona.

In Step 6:
- Per ogni zona: calcola notti = giorni effettivi allocati a quella zona
- NON usa totalDays globale
- Calcolo: hotel.PRZ_PAX_NIGHT × notti_zona × numberOfPeople

Esempio:
- Zona Bangkok: 3 giorni allocati → 3 notti hotel
- Zona Phuket: 2 giorni allocati → 2 notti hotel
- Totale: 5 notti (non totalDays - 1)
```

**Soluzione Database:**
```
[ANDREA: Formula corretta per notti hotel per zona]

Per ogni zona nell'itinerario:
- notti_zona = COUNT(giorni con esperienze in quella zona) da tripData.filledBlocks
- prezzo_zona = hotel_tier.PRZ_PAX_NIGHT_[PERIODO] × notti_zona × numberOfPeople

NON usare:
- totalDays (troppo globale)
- totalDays - 1 (non tiene conto allocazione per zona)
- GIORNI_CONSIGLIATI (è solo raccomandazione)
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

1. ⚠️ CRITICO: Verificare mapping interessi wizard ↔ CATEGORIA_1/2/3 in esperienze_tech.csv
2. ⚠️ CRITICO: Creare itinerario_copy.csv per rendering TTS
3. TODO: Implementare sistema alternative automatico per Dislike (BUG #1)
4. TODO: Modificare wizard - togliere "data libera" e bottoni scelta rapida date
5. TODO: Implementare TTS modificabile (alert giorni mezzi vuoti)
6. TODO: Definire lasso di tempo ricerca hotel blind
7. TODO: Sviluppare parte voli (upload biglietto partenza)
8. TODO: Fix IDs non univoci (BUG #4)
9. TODO: Fix type coercion CSV strings (BUG #5)
10. FUTURE: Condivisione social, pubblicazione Explore
```

### Dubbi e Domande Aperte
```
[ENTRAMBI: Domande da risolvere]

1. ANDREA: Quali campi esatti per itinerario_copy.csv?
2. ANDREA: Come strutturare esperienze_copy.csv per fullscreen modal?
3. ANDREA: Struttura esatta costi_accessori_tech.csv? Campo costo come si chiama?
4. ENTRAMBI: TTS modificabile - come gestire riapertura chat per modifica specifica giorno?
5. ENTRAMBI: Hotel blind - quanto tempo ricerca? Notifica come funziona?
6. ENTRAMBI: Voli - solo upload data o anche altre info?
7. ENTRAMBI: Modifica finale (Step 7) - torna a quale step specifico?
```

---

**Fine Documento - Revisione Generale Chat & Database**
