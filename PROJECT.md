# 🚀 TRAVEL CREW v2.0 - PROJECT

## 📋 OVERVIEW

**Nome**: Travel Crew v2.0  
**Stack**: React 19 + Vite + CSS Modules  
**Database**: CSV files (locale)  
**Focus**: Sistema PEXP (Pacchetti Esperienza) con storytelling

### Obiettivo
SPA (Single Page Application) per organizzare viaggi di gruppo democratici con:
- Sistema **PEXP** - Pacchetti Esperienza pre-confezionati
- Trip Editor con storytelling coinvolgente
- Timeline itinerario ottimizzato (futura AI)
- Sistema democratico voti/modifiche
- Gestione personale hotel + wallet

### Principi design
- **Semplicità d'uso**
- **Organizzazione chiara a sezioni**
- **Mobile-first** (90% traffico previsto)
- **Espansione progressiva informazioni**

---

## 📁 ARCHITETTURA

### Struttura cartelle

**travel-crew-v2-final/**
- PROJECT.md - Documentazione descrittiva
- CODE_REFERENCE.md - Esempi codice e snippet
- package.json, vite.config.js, index.html

**src/core/** - Sistema base
- data/ - 9 CSV files (destinazioni, zone, esperienze, pacchetti, hotel, voli, plus, costi_accessori, viaggi)
- utils/ - dataLoader.js, packageHelpers.js, PackageContext.jsx

**src/features/** - Moduli indipendenti
- home/ - Landing page (Home.jsx, Hero.jsx, DestinationsGallery.jsx) ✅
- explore/ - Browse viaggi pubblici ✅
- wizard/ - Creazione viaggio 5 step [ESISTENTE - solo date da finire] ⚠️
- trip-editor/ - Editor principale PEXP [DA COSTRUIRE - PRIORITÀ] 🎯
- wallet/ - Gestione finanziaria + pagamenti [TODO]
- documentation/ - Riepilogo viaggio + allegati [TODO]
- profile/ - Gestione account + miei viaggi [TODO]
- chat/ - Community + social network [TODO]

**src/shared/** - UI components riusabili
- Layout.jsx + .css
- Button.jsx + .css
- Card.jsx + .css

**src/** - Entry points
- App.jsx, main.jsx, index.css, App.css

---

## 🎯 SISTEMA PEXP (Pacchetti Esperienza)

### Regola fondamentale
**1 GIORNO = 1 ESPERIENZA**

Niente più slot multipli. Ogni esperienza occupa un giorno intero per godersela appieno.

### Struttura PEXP
- **Durata**: Min 2 notti (3 giorni) → Max settimana intera
- **Giorno arrivo**: NO esperienze (logistica viaggio + check-in hotel)
- **Composizione**: Pacchetti tematici di esperienze nella stessa zona
- **Micro-esperienze**: Possibili come upsell se exp < 1 giorno

### Esempio Thailandia
**PEXP "Jungla Nord"**: 4 giorni (3 notti)
- Giorno 1: Arrivo Bangkok → transfer Chiang Mai (no exp)
- Giorno 2: Trekking jungla + cascate
- Giorno 3: Visita villaggi tribù
- Giorno 4: Elephant sanctuary

---

## ⭐ TRIP EDITOR - Architettura

### Gerarchia 3 livelli (espansione progressiva)

**Livello 1: TRIP EDITOR** (finestra principale)
- Header riassuntivo scelte wizard
- Mappa interattiva dettagliata destinazione
- Blocchi quadrati giorni (NON cronologico)
- PEXP card (schede sintetiche pacchetti)
- Scelta condizionata per logistica

**Livello 2: PEXP PANEL** (riassunto pacchetto)
- Maggior dettaglio pacchetto
- Card EXP singole esperienze
- Possibilità conferma o modifica
- Slot vuoti/tratteggiati se dislike

**Livello 3: DETEXP** (storytelling completo)
- Titolo + intro testuale
- Video + immagini sequenziali
- Descrizione dettagliata con info utili
- Plus specifici selezionabili
- Riassunto costi
- Like/Dislike finale

### Sistema blocchi quadrati
- Ogni blocco = 1 giorno
- Si riempiono scegliendo PEXP
- NON ordine cronologico (viene dopo con "CREA ITINERARIO")
- Tutti blocchi pieni → sblocca "CREA ITINERARIO"
- Indeciso? → "PROPONI ITINERARIO" (app completa automaticamente)

### Logica scelta condizionata

**Filtri applicati:**
1. **Interessi wizard** (natura, cultura, mare, avventura...)
2. **Logistica città arrivo** (es: Bangkok o Phuket per Thailandia)
3. **Possibilità spostamento** (evita sequenze impossibili)

**Esempio flusso:**
1. Arrivo Bangkok → primo PEXP disponibile: città o nord (jungla)
2. Scelgo jungla Chiang Mai → secondo PEXP: continuo nord o scendo verso mare
3. Scelgo mare isole → terzo PEXP: isole est (Koh Samui) o sud (Phuket)

**Obiettivo**: Evitare ping-pong geografico inefficiente

### Flusso utente completo

```
1. User entra TRIP EDITOR
   ↓
2. Vede mappa + blocchi vuoti + primo PEXP card
   ↓
3. Click PEXP card → apre PEXP PANEL
   ↓
4. Vede esperienze pacchetto
   ↓
5a. Click "Conferma" → torna TRIP EDITOR, blocchi riempiti (verde)
5b. Click EXP card → apre DETEXP
   ↓
6. DETEXP: storytelling, video, plus
   ↓
7a. Like → esperienza confermata
7b. Dislike → slot vuoto in PEXP PANEL (opzioni: giorno libero o sostituisci)
   ↓
8. Conferma PEXP → torna TRIP EDITOR
   ↓
9. Proposta secondo PEXP (condizionata)
   ↓
10. Ripeti fino blocchi completi
    ↓
11. Click "CREA ITINERARIO"
```

### Modifica esperienze
- **Nel TRIP EDITOR**: solo visualizzazione
- **Per modificare**: click → torna PEXP PANEL (modifica rapida) o DETEXP (modifica dettagliata)

---

## 🗺️ TIMELINE TRIP EDITOR (TTE)

### Dopo "CREA ITINERARIO"

**Animazione "AI"** (per ora finta, futura vera AI)
- Simula calcolo ottimizzazione viaggio
- Ordina cronologicamente esperienze
- Ottimizza spostamenti

**Finestra TIMELINE TRIP EDITOR:**

**Mappa navigazione**
- Tutte tappe viaggio
- Frecce/percorso sequenziale visualizzato

**Timeline riepilogo**
- Card dettagliate esperienze in ordine
- Bottone "i" per info estese

**Dettaglio costi**
- Esperienze selezionate
- Costi accessori necessari (voli interni, tasse, ticket obbligatori)

**Date viaggio**
- Proposte date (logica da definire)

**Azioni finali**
- **Salva** → "Miei Viaggi" (profilo personale)
- **Pubblica** → Pubblico (tutti) o Privato (amici)

**Sistema democratico** (implementato qui)
- Voti modifiche proposte
- Discussioni gruppo

**Admin mode** (opzionale)
- Creator viaggio può scegliere Fase 2 per tutti
- Implementazione futura

---

## 🏨 FASE 2 - HOTEL (PERSONALE)

### Concetto chiave: SCELTA PERSONALE

**Viaggio pubblico 5 persone da città diverse:**
- Ognuno sceglie hotel preferito
- Admin può scegliere per tutti (opzionale, futura)

### Logica hotel per zona
- **1 PEXP zona A** → scelta hotel zona A
- **2 PEXP zona A** → hotel pesa su entrambi
- **PEXP zona B** → nuova scelta hotel zona B

### Budget wizard
❌ **Non filtra più hotel**  
✅ **Solo scopo statistico**

### 3 TIER proposta hotel

Per ogni PEXP/zona:

**1. LOW (max 2★)**
- Budget economico
- Servizi base

**2. MEDIUM (3/4★ + colazione)**
- Comfort standard
- Colazione inclusa

**3. LUXURY (5★ + colazione premium + extra)**
- Alta qualità
- Colazione premium
- Eventuali extra inclusi

**Hotel generici**
- NO nome specifico hotel
- Solo categoria/tier

**Plus/Extra/Upsell**
- Sotto ogni tier
- Upgrade camera, spa, transfer, ecc.

**Campo testo libero**
- Preferenze manuali utente
- Gestione manuale successiva

### UI Fase 2
Stesso schema PEXP:
- Card sintetiche hotel tier
- Panel espandibili dettaglio
- Plus selezionabili

### Fine Fase 2
- **Salva** → Miei Viaggi (con soggiorno completo)
- **Pubblica** → Viaggio completo disponibile ad altri

---

## 📱 SEZIONI APP

### 🏠 Home
Landing page con hero + gallery destinazioni  
**Status**: ✅ Completa

### 🔍 Esplora Viaggi
Browse viaggi pubblici, filtri, ricerca  
**Status**: ✅ Completa

### 🧙‍♂️ Wizard Creazione (5 step)
1. Destinazione (6 opzioni)
2. Numero persone + Tipo (pubblico/privato)
3. Budget (LOW/MEDIUM/HIGH) - solo statistico
4. Interessi (multi-select)
5. Data partenza - **DA COMPLETARE** ⚠️

**Status**: ⚠️ Esistente, manca Step 5 date

### ⭐ Trip Editor
Sistema completo PEXP → TTE → Fase 2 Hotel  
**Status**: 🎯 **DA COSTRUIRE - PRIORITÀ MASSIMA**

### 💰 Wallet
- Gestione finanziaria viaggio
- Pagamenti reali esperienze/hotel
- Tracking spese gruppo
- Split costs
**Status**: 📋 TODO

### 📄 Documentazione
- Riepilogo visuale/testuale info viaggio
- Allegati documenti (passaporto, biglietti aerei, ticket)
- Quick access info necessarie (orari, indirizzi, telefoni)
- Download PDF riepilogo
**Status**: 📋 TODO

### 👤 Profilo
- Gestione account classica
- Miei viaggi (salvati/in corso/conclusi)
- Viaggi pubblicati
- Statistiche personali
**Status**: 📋 TODO

### 💬 Chat/Community
- Chat gruppi viaggio
- Mini social network
- Condivisione foto/video
- Espansione futura social features
**Status**: 📋 TODO

### 🔔 Voti + Notifiche
- Sistema democratico votazioni
- Proposte modifiche
- Notifiche push
**Status**: ⏭️ Implementazione DOPO

---

## 📱 MOBILE FIRST

**Traffico previsto**: 90% mobile

**Breakpoint:**
- Mobile: 250px base
- Tablet: 768px
- Desktop: 1024px+

**Layout mobile:**
- Header compatto
- Mappa full-screen swipe
- Blocchi giorni stackati verticalmente
- Panel/modal full-screen
- Bottom sheet per azioni rapide

---

## 🗺️ ROADMAP SVILUPPO

### ✅ COMPLETATO
- Struttura cartelle modulare
- 9 CSV dati
- Componenti base (Button, Card, Layout)
- Home + Hero + Gallery destinazioni
- Explore viaggi
- Utils (dataLoader, packageHelpers)
- Wizard (4/5 step)

### 🎯 FASE 1 - Trip Editor PEXP (PRIORITÀ)
**Obiettivo**: Sistema completo 3 livelli

**Componenti da creare:**
1. **TRIP EDITOR (livello 1)**
   - HeaderWizardSummary
   - MapInteractive
   - DayBlocksGrid
   - PEXPCard

2. **PEXP PANEL (livello 2)**
   - PEXPPanel
   - EXPCard
   - SlotManager (vuoto/pieno/tratteggiato)

3. **DETEXP (livello 3)**
   - StorytellingModal
   - MediaSlider (video + foto)
   - PlusSelector
   - LikeDislikeButtons
   - CostSummary

**Logica condizionata:**
- Filtri interessi
- Validazione logistica spostamenti
- Proposta PEXP successivo

**Test Fase 1:**
- PEXP caricano da CSV filtrati
- 3 livelli navigabili
- Like/dislike funzionano
- Blocchi si riempiono
- "CREA ITINERARIO" si sblocca

### 🎯 FASE 2 - Timeline Trip Editor (TTE)
**Componenti:**
- AnimazioneAI (fake)
- MappaNavigazione
- TimelineItinerario
- CostiAccessori
- DateSelector
- SalvaPublish

### 🎯 FASE 3 - Hotel Personale
**Componenti:**
- HotelTierSelector (3 tier)
- HotelCard (generica)
- PlusHotelSelector
- PreferenzeTextArea

### 🎯 FASE 4 - Wizard Date
Completare Step 5 selezione date

### 🎯 FASE 5 - Wallet
Sistema pagamenti + tracking

### 🎯 FASE 6 - Documentazione
Riepilogo + allegati

### 🎯 FASE 7 - Profilo
Account + miei viaggi

### 🎯 FASE 8 - Chat/Community
Social features

### 🎯 FASE 9 - Voti + Notifiche
Sistema democratico

### 🎯 FASE 10 - AI Itinerario (futura)
Vera intelligenza artificiale ottimizzazione

---

## 🧩 COMPONENTI ATTIVI

### Shared Components
**Button** - Variants: primary/outline/ghost, Sizes: sm/md/lg  
**Card** - Con opzione hover  
**Layout** - Header + Footer wrapper

### Home Components  
**Home** - Container principale  
**Hero** - Hero section con CTA  
**DestinationsGallery** - Galleria 6 destinazioni

### Explore Components
**Explore** - Browse viaggi  
**Filters** - Filtri ricerca  
**TripGrid** - Griglia cards  
**TripCard** - Card singolo viaggio

### Wizard Components (4/5)
**CreateWizard** - Container wizard  
**Step1** - Destinazione  
**Step2** - Numero persone + tipo  
**Step3** - Budget  
**Step4** - Interessi  
**Step5** - Date [DA COMPLETARE] ⚠️

### Core Utils
**dataLoader.js** - Parser CSV con PapaParse  
**packageHelpers.js** - Helper funzioni pacchetti  
**PackageContext.jsx** - Context React per state condiviso

---

## 💾 DATABASE (9 CSV)

**destinazioni.csv** (6) - Thailandia, Grecia, Cuba, Marocco, Spagna, Giappone  
**zone.csv** (19) - Aree geografiche per destinazione  
**esperienze.csv** (152) - Esperienze singole  
**pacchetti.csv** - PEXP tematici (min 2 notti)  
**hotel.csv** (171) - 9 hotel per zona (3 quartieri × 3 budget)  
**voli.csv** (36) - Voli da FCO/MXP/NAP  
**plus.csv** (52) - Upgrade/extra  
**costi_accessori.csv** - Costi obbligatori (tasse, voli interni, ticket)  
**viaggi.csv** - Template viaggi pubblicati

---

## 🚀 QUICK START

**Setup:**
1. cd travel-crew-v2-final
2. npm install
3. npm run dev

**Sviluppo:**
- Lavora su una feature alla volta in /features/
- Compartimenti indipendenti
- Testa isolatamente
- Integra in App.jsx

**Convenzioni:**
- CSS Modules (*.module.css)
- Props destructuring
- Componenti funzionali + hooks
- File naming: PascalCase

---

## ✨ INNOVAZIONI

**Approccio:**
- Pacchetti tematici pre-confezionati
- Storytelling immersivo (video + foto)
- Scelta condizionata logistica
- 1 giorno = 1 esperienza (semplice)
- Hotel personalizzati per ogni utente
- Timeline ottimizzata (futura AI)
- Sistema democratico gruppo

**UX:**
- Espansione progressiva info (3 livelli)
- Mobile-first
- Animazioni coinvolgenti
- Chiara separazione sezioni

---

## 🎯 SUCCESS METRICS MVP

**Completo quando:**
- Trip Editor 3 livelli funzionante
- Scelta condizionata logistica
- Timeline itinerario (animazione)
- Hotel 3 tier personali
- Wizard completo (incluse date)
- Wallet base
- Documentazione riepilogo
- Profilo + miei viaggi
- Responsive mobile/desktop
- Zero bug critici

**Tempo stimato**: 40-50 ore (~6-7 giorni full-time)

---

**Version**: 2.0 Final  
**Last Update**: 2025-01-09  
**Status**: 🟢 Setup completato → **FOCUS: Trip Editor PEXP**
