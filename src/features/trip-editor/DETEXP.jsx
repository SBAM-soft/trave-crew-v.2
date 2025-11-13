import { useState } from 'react';
import MediaSlider from './MediaSlider';
import PlusSelector from './PlusSelector';
import LikeDislikeButtons from './LikeDislikeButtons';
import CostSummary from './CostSummary';
import styles from './DETEXP.module.css';

function DETEXP({ expId, onLike, onDislike, onClose }) {
  const [selectedPlus, setSelectedPlus] = useState([]);

  // Mock data esperienza (poi da CSV)
  const mockExp = {
    id: expId,
    nome: 'Bangkok Grand Palace & Temples Tour',
    intro: 'Preparati a vivere un\'avventura indimenticabile nel cuore spirituale della Thailandia',
    descrizione_dettagliata: `Un'esperienza unica che ti porterà alla scoperta dei luoghi più sacri di Bangkok. 
    
Inizierai con una visita guidata al magnifico Grand Palace, residenza dei re di Thailandia per 150 anni. Ammirerai l'architettura tradizionale thai, i dettagli dorati e il famoso Buddha di Smeraldo.

Proseguirai poi al Wat Pho, il tempio del Buddha disteso lungo 46 metri, completamente ricoperto d'oro. Qui potrai anche scoprire le origini del massaggio thailandese tradizionale.

L'esperienza si concluderà con una tranquilla crociera sul fiume Chao Phraya al tramonto, ammirando i templi illuminati mentre sorsegghi un drink rinfrescante.`,
    info_utili: [
      '📍 Punto di incontro: Hotel lobby ore 8:00',
      '⏱️ Durata: 8 ore (mattina + pomeriggio)',
      '👕 Dress code: Spalle e ginocchia coperte (no canottiere, no shorts)',
      '🍽️ Include: Pranzo tipico thai',
      '👤 Guida: Italiana o inglese',
      '🚶 Difficoltà: Leggera (molto camminare)'
    ],
    costo_base: 85,
    disponibile_plus: [
      { id: 'plus1', nome: 'Massaggio Thai 1h', prezzo: 25 },
      { id: 'plus2', nome: 'Cena romantica in crociera', prezzo: 45 },
      { id: 'plus3', nome: 'Fotografo professionista', prezzo: 60 }
    ],
    media: {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      images: [
        'https://images.unsplash.com/photo-1563492065211-4f7e3a4c9c3e?w=800',
        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'
      ]
    }
  };

  const handlePlusChange = (newSelectedPlus) => {
    setSelectedPlus(newSelectedPlus);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header con close button */}
        <div className={styles.header}>
          <h2 className={styles.title}>{mockExp.nome}</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        {/* Content scrollabile */}
        <div className={styles.content}>
          {/* Intro */}
          <p className={styles.intro}>{mockExp.intro}</p>

          {/* Media Slider */}
          <MediaSlider 
            videoUrl={mockExp.media.video}
            images={mockExp.media.images}
          />

          {/* Descrizione dettagliata */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📖 Cosa farai</h3>
            <div className={styles.description}>
              {mockExp.descrizione_dettagliata.split('\n').map((para, i) => (
                para.trim() && <p key={i}>{para.trim()}</p>
              ))}
            </div>
          </div>

          {/* Info utili */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>ℹ️ Info utili</h3>
            <ul className={styles.infoList}>
              {mockExp.info_utili.map((info, i) => (
                <li key={i}>{info}</li>
              ))}
            </ul>
          </div>

          {/* Plus Selector */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>✨ Personalizza l'esperienza</h3>
            <PlusSelector
              availablePlus={mockExp.disponibile_plus}
              selectedPlus={selectedPlus}
              onChange={handlePlusChange}
            />
          </div>

          {/* Cost Summary */}
          <div className={styles.section}>
            <CostSummary
              baseCost={mockExp.costo_base}
              selectedPlus={selectedPlus}
            />
          </div>

          {/* Like/Dislike Buttons */}
          <div className={styles.section}>
            <LikeDislikeButtons
              onLike={onLike}
              onDislike={onDislike}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DETEXP;