# Note per il Miglioramento della Logica Dislike

## Problema Attuale

Quando un utente fa "dislike" su un'esperienza in `DETEXPTab.jsx`, il componente semplicemente:
1. Mostra un toast "Esperienza rifiutata"
2. Chiude il tab
3. Non sostituisce l'esperienza con un'alternativa

```javascript
// src/features/trip-editor/DETEXPTab.jsx:92-95
const handleDislike = () => {
  toast.info('Esperienza rifiutata');
  onClose();
};
```

## Miglioramento Proposto

### Obiettivo
Quando l'utente fa dislike, il sistema dovrebbe:
1. Rimuovere l'esperienza corrente dal blocco
2. Cercare esperienze alternative nella stessa zona/categoria
3. Proporre automaticamente un'alternativa
4. Permettere di lasciare il giorno vuoto se non ci sono alternative gradite

### Implementazione Suggerita

#### 1. Aggiungere prop `onDislike` a DETEXPTab

```javascript
// DETEXPTab.jsx
function DETEXPTab({
  exp,
  onClose,
  onDislike,  // NUOVO: callback per gestire dislike
  totalDays,
  filledBlocks,
  destinazione,
  zona,
  dayNumber  // NUOVO: giorno corrente per sostituire esperienza
}) {
  const handleDislike = () => {
    if (onDislike) {
      // Passa l'esperienza corrente e il giorno al parent
      onDislike(exp, dayNumber);
    } else {
      toast.info('Esperienza rifiutata');
      onClose();
    }
  };

  // ... resto del codice
}
```

#### 2. Implementare logica sostituzione in TripEditor

```javascript
// TripEditor.jsx

// Stato per esperienze alternative
const [alternativeExperiences, setAlternativeExperiences] = useState([]);
const [showAlternatives, setShowAlternatives] = useState(false);

// Handler dislike con ricerca alternative
const handleDislikeExperience = async (dislikedExp, dayNumber) => {
  // 1. Rimuovi esperienza dal blocco
  const updatedBlocks = filledBlocks.filter(b => b.day !== dayNumber);
  setFilledBlocks(updatedBlocks);

  // 2. Cerca alternative nella stessa zona/categoria
  const alternatives = await findAlternativeExperiences(dislikedExp, {
    zona: dislikedExp.zona,
    categoria: dislikedExp.categoria,
    excludeIds: [dislikedExp.id], // Escludi quella dislikkata
    maxResults: 5
  });

  // 3. Se ci sono alternative, mostra panel suggerimenti
  if (alternatives.length > 0) {
    setAlternativeExperiences(alternatives);
    setShowAlternatives(true);
    toast.info(`🔄 Trovate ${alternatives.length} alternative`);
  } else {
    toast.info('📭 Nessuna alternativa trovata. Giorno lasciato libero.');
  }

  // 4. Chiudi DETEXP tab
  handleCloseDetexpTab();
};

// Funzione per trovare esperienze alternative
const findAlternativeExperiences = (dislikedExp, options) => {
  const { zona, categoria, excludeIds, maxResults } = options;

  return allExperiences
    .filter(exp =>
      exp.zona === zona &&
      exp.categoria === categoria &&
      !excludeIds.includes(exp.id) &&
      exp.id !== dislikedExp.id
    )
    .slice(0, maxResults);
};

// Handler seleziona alternativa
const handleSelectAlternative = (alternative, dayNumber) => {
  // Aggiungi nuova esperienza al giorno
  const newBlock = {
    day: dayNumber,
    experience: alternative,
    zona: alternative.zona,
    codiceZona: alternative.codiceZona
  };

  setFilledBlocks([...filledBlocks, newBlock]);
  setShowAlternatives(false);
  setAlternativeExperiences([]);

  toast.success('✅ Esperienza sostituita!');
};

// Handler lascia giorno vuoto
const handleLeaveEmpty = (dayNumber) => {
  setShowAlternatives(false);
  setAlternativeExperiences([]);
  toast.info('📭 Giorno lasciato libero');
};
```

#### 3. Componente UI per Alternative

```javascript
// AlternativesPanel.jsx (NUOVO componente)
function AlternativesPanel({
  alternatives,
  dayNumber,
  onSelect,
  onLeaveEmpty,
  onClose
}) {
  return (
    <div className={styles.alternativesPanel}>
      <div className={styles.header}>
        <h3>🔄 Alternative per il Giorno {dayNumber}</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <p className={styles.subtitle}>
        Non ti piaceva l'esperienza precedente? Scegline un'altra!
      </p>

      <div className={styles.alternativesList}>
        {alternatives.map(alt => (
          <div
            key={alt.id}
            className={styles.alternativeCard}
            onClick={() => onSelect(alt, dayNumber)}
          >
            <h4>{alt.nome}</h4>
            <p>{alt.descrizione}</p>
            <span className={styles.price}>€{alt.prezzo}</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button
          variant="outline"
          onClick={() => onLeaveEmpty(dayNumber)}
        >
          📭 Lascia giorno vuoto
        </Button>
      </div>
    </div>
  );
}
```

#### 4. Aggiornare DETEXPTab nel render di TripEditor

```javascript
{/* DETEXP Tab (fullscreen) */}
{activeTab === 'detexp' && currentExp && (
  <DETEXPTab
    exp={currentExp}
    onClose={handleCloseDetexpTab}
    onDislike={handleDislikeExperience}  // NUOVO
    dayNumber={editingBlock?.day}        // NUOVO
    totalDays={totalDays}
    filledBlocks={filledBlocks}
    destinazione={wizardData.destinazione}
    zona={currentExp.zona}
  />
)}

{/* Panel Alternative (NUOVO) */}
{showAlternatives && (
  <AlternativesPanel
    alternatives={alternativeExperiences}
    dayNumber={editingBlock?.day}
    onSelect={handleSelectAlternative}
    onLeaveEmpty={handleLeaveEmpty}
    onClose={() => setShowAlternatives(false)}
  />
)}
```

### Funzionalità Avanzate (Opzionali)

#### A. Suggerimenti Intelligenti
- Ordinare le alternative per score di rilevanza
- Usare gli interessi dell'utente per filtrare
- Considerare la logistica (distanza dalla zona precedente)

```javascript
const findAlternativeExperiences = (dislikedExp, options) => {
  const { zona, categoria, excludeIds, maxResults } = options;

  const alternatives = allExperiences
    .filter(exp =>
      exp.zona === zona &&
      !excludeIds.includes(exp.id)
    );

  // Ordina per rilevanza usando la funzione helper
  return sortPacchettiByRelevance(
    alternatives,
    wizardData.interessi,
    getCurrentPEXP()
  ).slice(0, maxResults);
};
```

#### B. Tracciamento Dislike
- Salvare le esperienze dislikkte per non riproporle
- Usare questi dati per migliorare i suggerimenti futuri

```javascript
const [dislikedExperiences, setDislikedExperiences] = useState([]);

const handleDislikeExperience = (dislikedExp, dayNumber) => {
  // Aggiungi a lista disliked
  setDislikedExperiences([...dislikedExperiences, dislikedExp.id]);

  // Salva in localStorage per persistenza
  localStorage.setItem(
    'disliked_experiences',
    JSON.stringify([...dislikedExperiences, dislikedExp.id])
  );

  // ... resto della logica
};
```

#### C. Opzione "Sorprendimi"
- Bottone per selezionare un'esperienza casuale dalle alternative

```javascript
const handleSurpriseMe = () => {
  if (alternativeExperiences.length > 0) {
    const random = alternativeExperiences[
      Math.floor(Math.random() * alternativeExperiences.length)
    ];
    handleSelectAlternative(random, editingBlock?.day);
    toast.success('🎲 Sorpresa selezionata!');
  }
};
```

## Priorità di Implementazione

1. **Alta**: Aggiungere prop `onDislike` e logica base sostituzione
2. **Media**: Creare panel alternative con UI
3. **Bassa**: Suggerimenti intelligenti e tracciamento

## Note Tecniche

- La logica di ricerca alternative dovrebbe essere performante (usare memoization)
- Le alternative dovrebbero essere filtrate anche per disponibilità/giorni
- Considerare UX: mostrare loading durante ricerca alternative
- Gestire caso edge: nessuna alternativa disponibile

## File da Modificare

1. `src/features/trip-editor/DETEXPTab.jsx` - Aggiungere prop onDislike
2. `src/features/trip-editor/TripEditor.jsx` - Implementare logica sostituzione
3. `src/features/trip-editor/AlternativesPanel.jsx` - NUOVO componente
4. `src/features/trip-editor/AlternativesPanel.module.css` - NUOVO stile

## Testing Suggerito

1. Dislike esperienza → verifica rimozione dal blocco
2. Dislike esperienza → verifica proposte alternative
3. Seleziona alternativa → verifica sostituzione corretta
4. Lascia vuoto → verifica giorno rimane libero
5. Nessuna alternativa → verifica messaggio appropriato
