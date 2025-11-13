# 💻 TRAVEL CREW v2.0 - CODE REFERENCE

Tutti gli esempi di codice, snippet e strutture dati del progetto.

---

## 📦 STRUTTURA PEXP (Pacchetto Esperienza)

```javascript
{
  id: 1,
  nome: "Jungla Nord Thailandia",
  destinazione_id: 1,
  zona_id: 2,
  
  // Composizione
  giorni_totali: 4,  // 1 arrivo + 3 esperienze
  notti: 3,
  esperienze_ids: [12, 23, 34],  // 3 exp per 3 giorni
  
  // Storytelling
  storytelling: {
    titolo: "Avventura nella giungla",
    intro: "Immergiti nel cuore verde della Thailandia...",
    descrizione_dettagliata: "Tre giorni intensi tra...",
    foto_urls: ["url1", "url2", "url3"],
    video_url: "url_video"
  },
  
  // Plus opzionali
  plus_ids: [3, 7, 9],
  
  // Logistica
  citta_arrivo: "Bangkok",  // Città con volo internazionale
  possibili_next_zone: [3, 5, 8],  // Zone raggiungibili dopo
  
  // Costi
  prezzo_base: 450,
  
  // Social
  likes: 120,
  dislikes: 15
}
```

---

## 🎨 TRIP EDITOR - LIVELLO 1

### PEXPCard (card sintetica)

```jsx
import styles from './PEXPCard.module.css';

function PEXPCard({ pexp, onClick, isSelected }) {
  return (
    <Card hover className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.badge}>{pexp.giorni_totali} giorni</div>
      
      <h3 className={styles.title}>{pexp.nome}</h3>
      
      <div className={styles.meta}>
        <span>🌍 {pexp.zona_nome}</span>
        <span>⭐ {pexp.likes - pexp.dislikes} voti</span>
      </div>
      
      <div className={styles.price}>€{pexp.prezzo_base}</div>
      
      <Button onClick={() => onClick(pexp)} variant="primary">
        Scopri pacchetto
      </Button>
    </Card>
  );
}

export default PEXPCard;
```

### DayBlocksGrid (blocchi quadrati giorni)

```jsx
import styles from './DayBlocksGrid.module.css';

function DayBlocksGrid({ totalDays, filledBlocks, onBlockClick }) {
  const blocks = Array.from({ length: totalDays }, (_, i) => i + 1);
  
  return (
    <div className={styles.grid}>
      {blocks.map(day => {
        const filled = filledBlocks.includes(day);
        
        return (
          <div 
            key={day}
            className={`${styles.block} ${filled ? styles.filled : styles.empty}`}
            onClick={() => filled && onBlockClick(day)}
          >
            <span className={styles.dayNumber}>{day}</span>
            {filled && <div className={styles.checkmark}>✓</div>}
          </div>
        );
      })}
    </div>
  );
}

export default DayBlocksGrid;
```

### MapInteractive (mappa interattiva)

```jsx
import { useState } from 'react';
import styles from './MapInteractive.module.css';

function MapInteractive({ destinazione, zone, selectedZone, onZoneClick }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  
  return (
    <div className={styles.mapContainer}>
      <img 
        src={destinazione.mappa_url} 
        alt={destinazione.nome}
        className={styles.mapImage}
      />
      
      {/* Overlay zone cliccabili */}
      {zone.map(zona => (
        <div
          key={zona.id}
          className={`${styles.zoneOverlay} ${selectedZone === zona.id ? styles.selected : ''}`}
          style={{
            top: `${zona.coord_y}%`,
            left: `${zona.coord_x}%`,
            width: `${zona.area_width}%`,
            height: `${zona.area_height}%`
          }}
          onClick={() => onZoneClick(zona)}
          onMouseEnter={() => setHoveredZone(zona.id)}
          onMouseLeave={() => setHoveredZone(null)}
        >
          {hoveredZone === zona.id && (
            <div className={styles.zoneTooltip}>
              {zona.nome}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MapInteractive;
```

---

## 🎨 PEXP PANEL - LIVELLO 2

```jsx
import { useState } from 'react';
import styles from './PEXPPanel.module.css';

function PEXPPanel({ pexp, onConfirm, onClose }) {
  const [experiences, setExperiences] = useState(pexp.esperienze);
  const [openDetailExp, setOpenDetailExp] = useState(null);
  
  const handleExpDislike = (expId) => {
    // Marca esperienza come disliked (slot vuoto/tratteggiato)
    setExperiences(experiences.map(exp => 
      exp.id === expId ? { ...exp, disliked: true } : exp
    ));
  };
  
  const handleReplaceExp = (oldExpId, newExp) => {
    setExperiences(experiences.map(exp =>
      exp.id === oldExpId ? newExp : exp
    ));
  };
  
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button onClick={onClose} className={styles.back}>← Indietro</button>
        <h2>{pexp.nome}</h2>
      </div>
      
      <div className={styles.summary}>
        <p>{pexp.storytelling.intro}</p>
      </div>
      
      <div className={styles.experiencesList}>
        <h3>Esperienze incluse ({pexp.giorni_totali - 1} giorni):</h3>
        
        {experiences.map((exp, index) => (
          <div key={exp.id} className={styles.expSlot}>
            <div className={styles.dayLabel}>Giorno {index + 2}</div>
            
            {exp.disliked ? (
              // Slot vuoto/tratteggiato
              <div className={styles.emptySlot}>
                <span>Esperienza rimossa</span>
                <select 
                  onChange={(e) => handleReplaceExp(exp.id, JSON.parse(e.target.value))}
                  className={styles.replaceSelect}
                >
                  <option value="">Scegli sostituzione...</option>
                  {/* Carica alternative dalla stessa zona */}
                </select>
                <button className={styles.keepFree}>
                  Mantieni giorno libero
                </button>
              </div>
            ) : (
              // Card esperienza normale
              <EXPCard 
                exp={exp}
                onClick={() => setOpenDetailExp(exp)}
              />
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.footer}>
        <div className={styles.total}>
          Totale: <strong>€{pexp.prezzo_base}</strong>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => onConfirm(experiences)}
        >
          ✓ Conferma pacchetto
        </Button>
      </div>
      
      {/* Modal DETEXP */}
      {openDetailExp && (
        <DETEXP 
          exp={openDetailExp}
          onLike={() => {/* chiudi modal */}}
          onDislike={() => handleExpDislike(openDetailExp.id)}
          onClose={() => setOpenDetailExp(null)}
        />
      )}
    </div>
  );
}

export default PEXPPanel;
```

### EXPCard (card singola esperienza)

```jsx
import styles from './EXPCard.module.css';

function EXPCard({ exp, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <img src={exp.foto_url} alt={exp.nome} className={styles.thumb} />
      
      <div className={styles.content}>
        <h4>{exp.nome}</h4>
        <p className={styles.description}>{exp.descrizione_breve}</p>
      </div>
      
      <button className={styles.detailBtn}>
        Vedi dettagli →
      </button>
    </div>
  );
}

export default EXPCard;
```

---

## 🎨 DETEXP - LIVELLO 3

```jsx
import { useState } from 'react';
import styles from './DETEXP.module.css';

function DETEXP({ exp, pexp, onLike, onDislike, onClose }) {
  const [selectedPlus, setSelectedPlus] = useState([]);
  
  const calcolaTotale = () => {
    return exp.prezzo + selectedPlus.reduce((sum, p) => sum + p.prezzo, 0);
  };
  
  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <button className={styles.close} onClick={onClose}>✕</button>
        
        {/* Header */}
        <div className={styles.header}>
          <h2>{exp.nome}</h2>
          <p className={styles.intro}>{exp.intro_testuale}</p>
        </div>
        
        {/* Media slider */}
        <MediaSlider 
          photos={exp.foto_urls}
          video={exp.video_url}
        />
        
        {/* Descrizione dettagliata */}
        <div className={styles.description}>
          <h3>Descrizione</h3>
          <p>{exp.descrizione_dettagliata}</p>
          
          <div className={styles.infoUtili}>
            <h4>Info utili:</h4>
            <ul>
              <li>Durata: {exp.durata}</li>
              <li>Difficoltà: {exp.difficolta}</li>
              <li>Include: {exp.cosa_include}</li>
            </ul>
          </div>
        </div>
        
        {/* Plus specifici esperienza */}
        {exp.plus_ids && exp.plus_ids.length > 0 && (
          <PlusSelector 
            plus={exp.plus_ids}
            selected={selectedPlus}
            onChange={setSelectedPlus}
            title="Aggiungi extra a questa esperienza:"
          />
        )}
        
        {/* Riassunto costi */}
        <div className={styles.costSummary}>
          <div className={styles.costLine}>
            <span>Esperienza base</span>
            <span>€{exp.prezzo}</span>
          </div>
          
          {selectedPlus.map(plus => (
            <div key={plus.id} className={styles.costLine}>
              <span>+ {plus.nome}</span>
              <span>€{plus.prezzo}</span>
            </div>
          ))}
          
          <div className={styles.costTotal}>
            <span>Totale</span>
            <strong>€{calcolaTotale()}</strong>
          </div>
        </div>
        
        {/* Like/Dislike */}
        <div className={styles.actions}>
          <button 
            className={styles.dislikeBtn}
            onClick={() => {
              onDislike();
              onClose();
            }}
          >
            👎 Non mi interessa
          </button>
          
          <button 
            className={styles.likeBtn}
            onClick={() => {
              onLike(selectedPlus);
              onClose();
            }}
          >
            👍 Mi piace, confermo
          </button>
        </div>
      </div>
    </div>
  );
}

export default DETEXP;
```

### MediaSlider (slider foto/video)

```jsx
import { useState } from 'react';
import styles from './MediaSlider.module.css';

function MediaSlider({ photos, video }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allMedia = video ? [{ type: 'video', url: video }, ...photos.map(url => ({ type: 'photo', url }))] : photos.map(url => ({ type: 'photo', url }));
  
  const next = () => setCurrentIndex((currentIndex + 1) % allMedia.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + allMedia.length) % allMedia.length);
  
  const currentMedia = allMedia[currentIndex];
  
  return (
    <div className={styles.slider}>
      {currentMedia.type === 'video' ? (
        <video 
          src={currentMedia.url} 
          controls 
          className={styles.media}
        />
      ) : (
        <img 
          src={currentMedia.url} 
          alt="Experience" 
          className={styles.media}
        />
      )}
      
      <button className={styles.prev} onClick={prev}>‹</button>
      <button className={styles.next} onClick={next}>›</button>
      
      <div className={styles.indicators}>
        {allMedia.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default MediaSlider;
```

---

## 🗺️ TIMELINE TRIP EDITOR (TTE)

### AnimazioneAI (fake per ora)

```jsx
import { useEffect, useState } from 'react';
import styles from './AnimazioneAI.module.css';

function AnimazioneAI({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Analizzando esperienze...');
  
  useEffect(() => {
    const steps = [
      { progress: 20, message: 'Analizzando esperienze...', delay: 800 },
      { progress: 40, message: 'Ottimizzando percorso...', delay: 1000 },
      { progress: 60, message: 'Calcolando spostamenti...', delay: 900 },
      { progress: 80, message: 'Generando timeline...', delay: 700 },
      { progress: 100, message: 'Itinerario pronto!', delay: 500 }
    ];
    
    let currentStep = 0;
    
    const animate = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgress(step.progress);
        setMessage(step.message);
        currentStep++;
        setTimeout(animate, step.delay);
      } else {
        setTimeout(onComplete, 500);
      }
    };
    
    animate();
  }, [onComplete]);
  
  return (
    <div className={styles.container}>
      <div className={styles.ai}>
        <div className={styles.spinner} />
        <h2>Creazione itinerario in corso...</h2>
        <p>{message}</p>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progress} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default AnimazioneAI;
```

### MappaNavigazione (mappa con percorso)

```jsx
import styles from './MappaNavigazione.module.css';

function MappaNavigazione({ itinerario, destinazione }) {
  return (
    <div className={styles.mapContainer}>
      <img 
        src={destinazione.mappa_url} 
        alt={destinazione.nome}
        className={styles.mapImage}
      />
      
      {/* Tappe con frecce */}
      {itinerario.map((tappa, index) => (
        <div key={tappa.id}>
          {/* Pin tappa */}
          <div 
            className={styles.pin}
            style={{ 
              top: `${tappa.coord_y}%`, 
              left: `${tappa.coord_x}%` 
            }}
          >
            <span className={styles.pinNumber}>{index + 1}</span>
          </div>
          
          {/* Freccia verso prossima tappa */}
          {index < itinerario.length - 1 && (
            <svg className={styles.arrow}>
              <line 
                x1={`${tappa.coord_x}%`}
                y1={`${tappa.coord_y}%`}
                x2={`${itinerario[index + 1].coord_x}%`}
                y2={`${itinerario[index + 1].coord_y}%`}
                stroke="#4f46e5"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export default MappaNavigazione;
```

---

## 🏨 FASE 2 - HOTEL

### HotelTierSelector (3 tier)

```jsx
import { useState } from 'react';
import styles from './HotelTierSelector.module.css';

function HotelTierSelector({ pexp, onSelect }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedPlus, setSelectedPlus] = useState([]);
  const [preferenze, setPreferenze] = useState('');
  
  const tiers = [
    { 
      level: 'LOW', 
      label: 'Budget', 
      stelle: '⭐⭐ max',
      descrizione: 'Sistemazione economica, servizi base',
      prezzo: 35
    },
    { 
      level: 'MEDIUM', 
      label: 'Comfort', 
      stelle: '⭐⭐⭐⭐',
      descrizione: 'Hotel confortevole con colazione inclusa',
      prezzo: 85
    },
    { 
      level: 'LUXURY', 
      label: 'Premium', 
      stelle: '⭐⭐⭐⭐⭐',
      descrizione: '5 stelle con colazione premium ed extra',
      prezzo: 220
    }
  ];
  
  const handleConfirm = () => {
    onSelect({
      pexp_id: pexp.id,
      tier: selectedTier,
      plus: selectedPlus,
      preferenze
    });
  };
  
  return (
    <div className={styles.selector}>
      <h3>Scegli alloggio per {pexp.nome}</h3>
      <p className={styles.zona}>📍 Zona: {pexp.zona_nome} ({pexp.notti} notti)</p>
      
      <div className={styles.tiers}>
        {tiers.map(tier => (
          <div 
            key={tier.level}
            className={`${styles.tier} ${selectedTier === tier.level ? styles.selected : ''}`}
            onClick={() => setSelectedTier(tier.level)}
          >
            <div className={styles.tierHeader}>
              <h4>{tier.label}</h4>
              <span className={styles.stelle}>{tier.stelle}</span>
            </div>
            
            <p className={styles.tierDesc}>{tier.descrizione}</p>
            
            <div className={styles.tierPrice}>
              €{tier.prezzo} <span>/ notte</span>
            </div>
            
            <div className={styles.tierTotal}>
              Totale: €{tier.prezzo * pexp.notti}
            </div>
            
            {selectedTier === tier.level && <div className={styles.check}>✓</div>}
          </div>
        ))}
      </div>
      
      {/* Plus hotel */}
      {selectedTier && (
        <div className={styles.plusSection}>
          <h4>Aggiungi extra:</h4>
          <PlusSelector 
            plus={/* plus hotel per tier selezionato */}
            selected={selectedPlus}
            onChange={setSelectedPlus}
          />
        </div>
      )}
      
      {/* Campo preferenze */}
      <div className={styles.preferenze}>
        <label>Preferenze personali (gestite manualmente):</label>
        <textarea 
          value={preferenze}
          onChange={(e) => setPreferenze(e.target.value)}
          placeholder="Es: camera piano alto, lontano da ascensore, vista mare..."
          rows={3}
        />
      </div>
      
      {selectedTier && (
        <Button variant="primary" size="lg" onClick={handleConfirm}>
          Conferma alloggio
        </Button>
      )}
    </div>
  );
}

export default HotelTierSelector;
```

---

## 🛠️ UTILS

### packageHelpers.js

```javascript
// Carica PEXP filtrati per destinazione + interessi + logistica
export const loadFilteredPEXP = async (destinazioneId, interessi, cittaArrivo = null) => {
  const pacchetti = await loadCSV('pacchetti.csv');
  
  let filtered = pacchetti.filter(p => p.destinazione_id === destinazioneId);
  
  // Filtro per interessi
  if (interessi && interessi.length > 0) {
    filtered = filtered.filter(p => {
      const pexpInteressi = p.interessi_tags?.split(',') || [];
      return interessi.some(int => pexpInteressi.includes(int));
    });
  }
  
  // Primo pacchetto: solo da città arrivo
  if (cittaArrivo) {
    filtered = filtered.filter(p => p.citta_arrivo === cittaArrivo);
  }
  
  return filtered;
};

// Trova PEXP successivi logisticamente possibili
export const getNextPossiblePEXP = async (currentPEXP, allPEXP) => {
  if (!currentPEXP.possibili_next_zone) return allPEXP;
  
  const nextZones = currentPEXP.possibili_next_zone.split(',').map(Number);
  return allPEXP.filter(p => nextZones.includes(p.zona_id));
};

// Calcola se blocchi sono completi
export const areBlocksComplete = (selectedPEXP, totalDays) => {
  const usedDays = selectedPEXP.reduce((sum, p) => sum + p.giorni_totali, 0);
  return usedDays === totalDays;
};
```

---

**Version**: 2.0 Final  
**Last Update**: 2025-01-09  
**Note**: Esempi aggiornati con sistema PEXP (no slot)
