import { useState } from 'react';
import styles from './EXPCard.module.css';

function EXPCard({ exp, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Mock data esperienza
  const mockExp = {
    ...exp,
    immagine: exp.immagine || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400',
    badge: exp.badge || 'Full Day',
    durata: exp.durata || 'Giorno intero'
  };

  return (
    <div 
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Immagine con overlay hover */}
      <div className={styles.imageWrapper}>
        <img 
          src={mockExp.immagine} 
          alt={mockExp.nome}
          className={styles.image}
        />
        
        {/* Badge */}
        <div className={styles.badge}>{mockExp.badge}</div>

        {/* Overlay azioni (visibile on hover) */}
        {isHovered && (
          <div className={styles.actionsOverlay}>
            <button className={styles.detailBtn}>
              👁️ Dettagli
            </button>
          </div>
        )}
      </div>

      {/* Contenuto card */}
      <div className={styles.content}>
        <h4 className={styles.title}>{mockExp.nome}</h4>
        <p className={styles.description}>{mockExp.descrizione}</p>
        
        {/* Meta info */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>⏱️ {mockExp.durata}</span>
        </div>
      </div>
    </div>
  );
}

export default EXPCard;