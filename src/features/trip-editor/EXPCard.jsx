import { useState } from 'react';
import styles from './EXPCard.module.css';

function EXPCard({ exp, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Estrai dati esperienza
  const immagine = exp.immagine || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400';
  const durata = exp.durata || 'Giorno intero';
  const tags = exp.tags || [];
  const prezzo = exp.prezzo || 0;
  const difficolta = exp.difficolta || 1;

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
          src={immagine}
          alt={exp.nome}
          className={styles.image}
        />

        {/* Badge durata */}
        <div className={styles.badge}>⏱️ {durata}</div>

        {/* Overlay azioni (visibile on hover) */}
        {isHovered && (
          <div className={styles.actionsOverlay}>
            <button className={styles.detailBtn}>
              👁️ Dettagli completi
            </button>
          </div>
        )}
      </div>

      {/* Contenuto card */}
      <div className={styles.content}>
        <h4 className={styles.title}>{exp.nome}</h4>

        {/* Tags */}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className={styles.tag}>{tag.trim()}</span>
            ))}
            {tags.length > 2 && (
              <span className={styles.tag}>+{tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Descrizione breve */}
        <p className={styles.description}>
          {exp.descrizione.length > 80
            ? `${exp.descrizione.substring(0, 80)}...`
            : exp.descrizione}
        </p>

        {/* Meta info */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            🚶 Difficoltà {difficolta}/3
          </span>
          {prezzo > 0 && (
            <span className={styles.metaItem}>
              💰 €{prezzo}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default EXPCard;