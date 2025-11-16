# Sistema Hotel - Note Implementazione

## Panoramica

Questo documento descrive la nuova logica del sistema di selezione hotel implementata per Travel Crew v2.0.

## Logica Implementata

### 1. **Selezione Hotel Basata su Zone Visitate**

Gli hotel vengono ora visualizzati in funzione delle **zone effettivamente visitate** nell'itinerario creato dall'utente.

**Esempio:**
- Se l'utente seleziona esperienze a Bangkok e Chiang Mai, vedrà solo hotel di Bangkok e Chiang Mai
- Le zone vengono estratte automaticamente dai pacchetti esperienza confermati nel Trip Editor

**File modificati:**
- `src/core/utils/itinerarioHelpers.js` - nuove funzioni:
  - `getZoneVisitate()` - estrae zone dai filledBlocks
  - `groupHotelsByZoneAndBudget()` - raggruppa hotel per zona e budget
  - `getHotelExtras()` - estrae extra disponibili per un hotel

### 2. **3 Opzioni Hotel per Zona**

Per ogni zona visitata, l'utente può scegliere tra **3 opzioni** di hotel differenziate per budget:
- **LOW** (€) - Budget economico
- **MEDIUM** (€€) - Fascia media
- **HIGH** (€€€) - Fascia lusso

**Implementazione:**
- `HotelSelectionPage.jsx` completamente riscritto
- Mostra sezioni separate per ogni zona
- 3 card hotel affiancate per budget
- Selezione obbligatoria: un hotel per ogni zona

### 3. **Sistema di Extra Hotel**

Ogni hotel può avere **extra opzionali** selezionabili dall'utente.

**Caratteristiche:**
- Extra caricati dal CSV `plus.csv`
- Collegamento tramite campi `EXTRA_1` ... `EXTRA_7` nel CSV hotel
- Filtro per `APPLICABILE_A` = "Hotel"
- Visualizzazione con:
  - Nome, descrizione, categoria
  - Prezzo per persona
  - Icona personalizzata
  - Badge popolarità

**Esempio di extra:**
- Upgrade Camera Superior
- Suite con Vista Fiume
- Early Check-in 10am
- Late Checkout 18:00

### 4. **Salvataggio Viaggio Completo**

**File modificati:**
- `src/core/utils/tripStorage.js` - nuova funzione `saveTripComplete()`

**Dati salvati:**
```javascript
{
  wizardData,
  filledBlocks,
  zoneVisitate,
  selectedHotels: [
    {
      zona: "BANGKOK",
      hotel: { ...hotelObject },
      extras: [ ...extraObjects ]
    }
  ],
  itinerario,
  costiAccessori,
  extraSuggeriti,
  costoTotale // Calcolato automaticamente
}
```

**Funzionalità:**
- **Salva come bozza** - categoria 'saved' in localStorage
- **Riprendi modifica** - da "I miei viaggi" con tutti i dati
- **Calcolo costo automatico** - include hotel + extra × numero persone

### 5. **Flusso Completo**

1. **Trip Editor** → Selezione pacchetti esperienza
2. Click "Crea Itinerario" → Estrazione zone visitate
3. **Hotel Selection** → Selezione hotel per ogni zona + extra
4. **Salvataggio** → localStorage con tutti i dati
5. **Timeline/Riepilogo** → Visualizzazione finale

## Note su Funzionalità Future

### A. **Privilegi Admin per Viaggi Privati**

**Logica da implementare:**
- Se `wizardData.tipoViaggio === 'privato'`:
  - Chi crea il viaggio ha privilegi di **admin**
  - L'admin può scegliere gli hotel per tutti i partecipanti
  - Utile per viaggi in famiglia o gruppi privati

- Se `wizardData.tipoViaggio === 'pubblico'`:
  - Ogni utente che aderisce sceglie il proprio hotel
  - Nessun utente può scegliere per gli altri

**Implementazione suggerita:**
```javascript
// In HotelSelectionPage
const isAdmin = wizardData.tipoViaggio === 'privato' && wizardData.userId === currentUser.id;

if (isAdmin) {
  // Mostra opzione "Scegli per tutti i partecipanti"
}
```

**File da modificare:**
- `HotelSelectionPage.jsx` - aggiungere flag `isAdminSelection`
- `tripStorage.js` - salvare info admin e selezioni per utente

### B. **Pubblicazione Viaggi di Gruppo nell'Esplora**

**Logica da implementare:**
- Viaggi di gruppo pubblici possono essere pubblicati nell'**Esplora**
- La pubblicazione è possibile quando:
  - Itinerario è completo (tutti i giorni pianificati)
  - **Non serve** selezione hotel (la fanno gli utenti che aderiscono)

**Flusso:**
1. Utente crea viaggio pubblico nel Trip Editor
2. Completa solo l'itinerario con le esperienze
3. Click "Pubblica nell'Esplora"
4. Altri utenti vedono il viaggio nell'Esplora
5. Quando aderiscono, scelgono loro gli hotel

**Implementazione suggerita:**
```javascript
// In TripEditor
const handlePublishToExplore = () => {
  if (wizardData.tipoViaggio !== 'pubblico') {
    toast.error('Solo i viaggi pubblici possono essere pubblicati nell\'Esplora');
    return;
  }

  if (filledBlocks.length < totalDays - 1) {
    toast.error('Completa l\'itinerario prima di pubblicare');
    return;
  }

  // Salva come viaggio pubblico nell'Esplora
  publishTripToExplore({ wizardData, filledBlocks, zoneVisitate });
};
```

**File da creare/modificare:**
- `exploreStorage.js` - gestione viaggi pubblici
- `Explore.jsx` - visualizzazione viaggi pubblici
- Aggiungere pulsante "Pubblica nell'Esplora" nel TripEditor

## Struttura Dati CSV

### hotel.csv
```
CODICE,TIPO,DESTINAZIONE,ZONA,QUARTIERE,BUDGET,SERVIZI_MINIMI,
PRZ_PAX_NIGHT_*,EXTRA_1,EXTRA_2,...
```

### plus.csv
```
CODICE,TIPO,DESTINAZIONE,ZONA,PLUS,LIVELLO_PLUS,CATEGORIA,
DESCRIZIONE,APPLICABILE_A,PRZ_PAX_GEN,ICON,POPOLARITA
```

## Testing

Per testare il nuovo flusso:

1. Vai su `/trip-editor`
2. Seleziona una destinazione (es. Thailandia)
3. Seleziona pacchetti esperienza per diverse zone (es. Bangkok, Chiang Mai)
4. Click "Crea Itinerario"
5. Verifica che vengano mostrati solo hotel delle zone selezionate
6. Seleziona un hotel per ogni zona
7. Aggiungi extra opzionali
8. Click "Salva bozza" oppure "Conferma e Continua"
9. Verifica salvataggio in localStorage

## Commit e Deploy

**Branch:** `claude/fix-hotel-visibility-01X6ipmn5kbNzg2Wkt6KUaYD`

**Commit message suggerito:**
```
fix: implementato sistema hotel basato su zone visitate

- Aggiunta estrazione zone dai pacchetti confermati
- Implementato raggruppamento hotel per zona e budget (LOW/MEDIUM/HIGH)
- Aggiunto sistema di extra hotel dal CSV plus.csv
- Implementato salvataggio completo con hotel e extra
- Riscritto HotelSelectionPage con nuova UI/UX
- Aggiornato sistema di storage con calcolo costi automatico

Refs #[issue-number]
```

## Autore

Implementazione: Claude AI
Data: 2025-11-16
Versione: Travel Crew v2.0
