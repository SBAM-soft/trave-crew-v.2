# Logica Timeline - Documentazione Definitiva

## Principi Fondamentali

### 1. Conteggio Commerciale
**Le logiche di conteggio e commerciali sono SEMPRE conteggiate in NOTTI.**

- Esempio: 7 notti in Thailandia
- Il pricing, le prenotazioni hotel e i preventivi si basano sul numero di notti
- Formula commerciale: `notti = giorni - 1`

### 2. Visualizzazione Timeline
**La visualizzazione della timeline corrisponde ai GIORNI per semplificare la comprensione dell'utente.**

- Esempio: 7 notti = 8 giorni
- Formula visualizzazione: `totalDays = notti + 1`
- Giorno 1 = Arrivo (prima notte)
- Giorno 8 = Partenza (dopo 7ª notte)

### 3. Conversione Notti → Giorni

```javascript
// Input utente: numero di notti
const notti = 7;

// Calcolo giorni totali per visualizzazione
const totalDays = notti + 1; // = 8 giorni

// Giorni disponibili per esperienze (escluso giorno partenza)
const giorniDisponibili = totalDays - 1; // = 7 giorni
```

## Tipi di Blocchi

### BLOCCHI TECNICI (non commerciali)
Necessari per la logistica del viaggio, **non sono vendibili come esperienze**.

#### 1. ARRIVAL (Arrivo)
- **Tipo**: `BLOCK_TYPE.ARRIVAL`
- **Posizione**: Sempre giorno 1
- **Icona**: ✈️
- **Colore**: #fbbf24 (giallo)
- **Descrizione**: Arrivo dall'Italia e sistemazione in hotel
- **Esempio**: "Arrivo a Bangkok e sistemazione in hotel"

#### 2. LOGISTICS (Spostamento interno)
- **Tipo**: `BLOCK_TYPE.LOGISTICS`
- **Posizione**: Quando si cambia zona all'interno del paese
- **Icona**: 🚗
- **Colore**: #f59e0b (arancione)
- **Descrizione**: Trasferimento tra zone e sistemazione
- **Esempio**: "Trasferimento da Bangkok a Phuket e sistemazione"

#### 3. DEPARTURE (Partenza)
- **Tipo**: `BLOCK_TYPE.DEPARTURE`
- **Posizione**: Sempre ultimo giorno (totalDays)
- **Icona**: 🛫
- **Colore**: #ef4444 (rosso)
- **Descrizione**: Check-out e partenza per l'Italia
- **Esempio**: "Check-out e partenza da Chiang Mai"

### BLOCCHI COMMERCIALI (vendibili)
Esperienze che possono essere vendute e prenotate.

#### 4. EXPERIENCE (Esperienza)
- **Tipo**: `BLOCK_TYPE.EXPERIENCE`
- **Icona**: ⭐
- **Colore**: #667eea (viola)
- **Descrizione**: Esperienza programmata con guida/tour
- **Include**: Prezzo, durata, difficoltà, descrizione dettagliata

#### 5. FREE (Giorno libero)
- **Tipo**: `BLOCK_TYPE.FREE`
- **Icona**: 🏖️
- **Colore**: #10b981 (verde)
- **Descrizione**: Giorno libero per esplorare in autonomia
- **Include**: Nessun costo associato, tempo libero per il viaggiatore

## Esempio Completo: 7 Notti in Thailandia (8 Giorni)

### Scenario
- **Notti**: 7
- **Giorni**: 8
- **Zone**: Bangkok (priorità 1) → Phuket (priorità 2)

### Timeline Giorno per Giorno

| Giorno | Tipo | Descrizione | Notte | Zona |
|--------|------|-------------|-------|------|
| 1 | ARRIVAL 🔧 | Arrivo a Bangkok e sistemazione | 1 | Bangkok |
| 2 | EXPERIENCE | Visita Grande Palazzo Reale | 2 | Bangkok |
| 3 | EXPERIENCE | Tour mercati galleggianti | 3 | Bangkok |
| 4 | LOGISTICS 🔧 | Trasferimento Bangkok → Phuket | 4 | Phuket |
| 5 | EXPERIENCE | Tour isole Phi Phi | 5 | Phuket |
| 6 | FREE | Giorno libero a Phuket | 6 | Phuket |
| 7 | EXPERIENCE | Snorkeling Coral Island | 7 | Phuket |
| 8 | DEPARTURE 🔧 | Partenza da Phuket per Italia | - | - |

**🔧 = Blocco Tecnico** (non vendibile, necessario per logistica)

### Calcoli Commerciali

```javascript
// NOTTI (per preventivo e hotel)
const nottiPerZona = {
  'Bangkok': 3,  // Giorni 1-3
  'Phuket': 4    // Giorni 4-7
};
const totaleNotti = 7;

// ESPERIENZE (per pricing)
const esperienze = 4;  // Giorni 2, 3, 5, 7
const giorniLiberi = 1;  // Giorno 6
const blocchiTecnici = 3;  // Giorni 1, 4, 8
```

## Implementazione Codice

### 1. Costanti (src/core/constants/index.js)

```javascript
export const BLOCK_TYPE = {
  // BLOCCHI TECNICI
  ARRIVAL: 'arrival',
  LOGISTICS: 'logistics',
  DEPARTURE: 'departure',

  // BLOCCHI COMMERCIALI
  EXPERIENCE: 'experience',
  FREE: 'free',

  // UTILITY
  EMPTY: 'empty'
};

export const BLOCK_CONFIG = {
  [BLOCK_TYPE.ARRIVAL]: {
    icon: '✈️',
    color: '#fbbf24',
    label: 'Arrivo',
    isTechnical: true,
    description: (zone) => `Arrivo a ${zone} e sistemazione in hotel`
  },
  // ... altri tipi
};
```

### 2. Store (useTripEditorChatStore.js)

```javascript
// Creazione blocco logistics
const logisticsBlock = {
  day: lastDay + 1,
  type: BLOCK_TYPE.LOGISTICS,
  zoneCode: zone.code,
  zoneName: zone.name,
  experience: {
    nome: `Trasferimento e sistemazione a ${zone.name}`,
    descrizione: `Giorno dedicato al trasferimento e sistemazione`,
    type: BLOCK_TYPE.LOGISTICS
  }
};
```

### 3. Visualizzazione (TimelineEditor.jsx)

```javascript
// Giorno 1 - Arrivo
days.push({
  dayNumber: 1,
  type: BLOCK_TYPE.ARRIVAL,
  title: `${BLOCK_CONFIG[BLOCK_TYPE.ARRIVAL].icon} ${BLOCK_CONFIG[BLOCK_TYPE.ARRIVAL].label}`,
  description: BLOCK_CONFIG[BLOCK_TYPE.ARRIVAL].description(firstZone),
  zoneName: firstZone
});

// Ultimo giorno - Partenza
days.push({
  dayNumber: totalDays,
  type: BLOCK_TYPE.DEPARTURE,
  title: `${BLOCK_CONFIG[BLOCK_TYPE.DEPARTURE].icon} ${BLOCK_CONFIG[BLOCK_TYPE.DEPARTURE].label}`,
  description: BLOCK_CONFIG[BLOCK_TYPE.DEPARTURE].description(lastZone),
  zoneName: lastZone
});
```

## Regole di Business

### 1. Creazione Blocchi
- **Prima zona selezionata**: NON crea blocco LOGISTICS
  - Le esperienze partono da giorno 1 (che è già ARRIVAL)
- **Zone successive**: SEMPRE crea blocco LOGISTICS
  - Necessario per trasferimento e sistemazione
- **Ultimo giorno**: SEMPRE è DEPARTURE
  - Mai disponibile per esperienze

### 2. Conteggio Giorni Disponibili
```javascript
// Formula: totalDays - 1 (partenza) - blocchi già occupati
const giorniDisponibili = totalDays - 1 - filledBlocks.length;
```

### 3. Calcolo Notti per Zona
```javascript
// Ogni blocco (esperienza/logistics/free) in una zona = 1 notte
nottiPerZona[zona] = filledBlocks
  .filter(b => b.zona === zona && b.type !== BLOCK_TYPE.DEPARTURE)
  .length;
```

## UI/UX Guidelines

### Badge Blocco Tecnico
I blocchi tecnici mostrano un badge arancione:
```jsx
{isTechnicalBlock() && (
  <span className={styles.technicalBadge} title="Giorno tecnico necessario per logistica">
    🔧 BLOCCO TECNICO
  </span>
)}
```

### Informazioni Visualizzate
Per ogni giorno nella timeline mostrare:
1. **Numero giorno**: "Giorno X"
2. **Notte corrispondente**: "Notte Y" o "Arrivo"/"Partenza"
3. **Zona corrente**: "📍 Nome Zona"
4. **Tipo blocco**: Badge se tecnico
5. **Nome esperienza**: Se presente

### Calcolo Notte da Giorno
```javascript
const getNightInfo = (dayNumber, totalDays) => {
  if (dayNumber === 1) return 'Arrivo';
  if (dayNumber === totalDays) return 'Partenza';
  return `Notte ${dayNumber - 1}`;
};
```

## File Modificati

1. **Constants**
   - `src/core/constants/index.js`: Definizione BLOCK_TYPE e BLOCK_CONFIG

2. **Store & Services**
   - `src/features/trip-editor-chat/store/useTripEditorChatStore.js`: Uso costanti
   - `src/core/services/tripBuilderService.js`: Uso costanti
   - `src/core/utils/itinerarioHelpers.js`: Uso costanti

3. **Componenti Visualizzazione**
   - `src/features/timeline-editor/TimelineEditor.jsx`: Timeline completa con DEPARTURE
   - `src/features/timeline-editor/DayTimeline.jsx`: Badge tecnici e info notte
   - `src/features/timeline-editor/DayTimeline.module.css`: Stili nuovi badge
   - `src/features/trip-summary/TripSummaryUnified.jsx`: Timeline animata con costanti
   - `src/components/trip-card/TripTimeline.jsx`: Timeline compatta con costanti

## Testing

### Test Scenario: 7 Notti in Thailandia

**Setup**:
```javascript
const notti = 7;
const totalDays = 8;
const zone = ['Bangkok', 'Phuket'];
```

**Verifiche**:
- ✅ Giorno 1 è ARRIVAL
- ✅ Giorno 4 è LOGISTICS (cambio zona)
- ✅ Giorno 8 è DEPARTURE
- ✅ Notti Bangkok = 3
- ✅ Notti Phuket = 4
- ✅ Giorni disponibili per esperienze = 5 (2,3,5,6,7)
- ✅ Badge "BLOCCO TECNICO" su giorni 1,4,8
- ✅ Info notte corretta per ogni giorno

## Note Importanti

1. **DEPARTURE non è mai in filledBlocks**
   - È generato dinamicamente nella visualizzazione
   - Non occupa spazio nei giorni disponibili

2. **ARRIVAL potrebbe non essere in filledBlocks**
   - Dipende dall'implementazione legacy
   - Prima zona non crea blocco logistics, esperienza parte da giorno 1

3. **Conteggio notti sempre basato su blocchi**
   - Ogni blocco con zona = 1 notte in quella zona
   - DEPARTURE non conta come notte

4. **Backward Compatibility**
   - Gestito il tipo legacy 'transfer' come LOGISTICS
   - Tutti i componenti aggiornati per usare costanti

---

**Versione**: 1.0
**Data**: 2025-12-05
**Autore**: Sistema Travel Crew v2.0
