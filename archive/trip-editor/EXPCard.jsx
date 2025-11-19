import { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './EXPCard.module.css';

function EXPCard({ exp, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Robust validation - prevent crash if exp is invalid
  if (!exp || !exp.nome || !exp.descrizione) {
    return (
      <div className={styles.card} style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Esperienza non disponibile</p>
      </div>
    );
  }

  // Estrai dati esperienza
  const immagine = exp.immagine || 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400';

  // Estrai numero di notti da SLOT o slot
  const slot = exp.SLOT || exp.slot || 1;
  const notti = parseInt(slot) || 1;
  const durata = `${notti} ${notti === 1 ? 'notte' : 'notti'}`;

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

EXPCard.propTypes = {
  exp: PropTypes.shape({
    codice: PropTypes.string,
    nome: PropTypes.string.isRequired,
    descrizione: PropTypes.string.isRequired,
    immagine: PropTypes.string,
    durata: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    prezzo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    difficolta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onClick: PropTypes.func,
};

export default memo(EXPCard);