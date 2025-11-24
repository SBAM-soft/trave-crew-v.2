import PropTypes from 'prop-types';
import ChatExperienceCard from './ChatExperienceCard';
import styles from './ChatExperienceCardRow.module.css';

/**
 * Componente che mostra 3 ChatExperienceCard affiancate
 * Stile "Tinder-like" ma con 3 esperienze visibili contemporaneamente
 */
function ChatExperienceCardRow({ experiences, zone, onSelect, disabled = false }) {
  const handleSelect = (value) => {
    if (disabled) return;
    // Quando l'utente seleziona (like o dislike), passa il valore al parent
    if (onSelect) {
      onSelect(value);
    }
  };

  // Mostra fino a 3 esperienze
  const experiencesToShow = experiences.slice(0, 3);

  return (
    <div className={styles.cardRow}>
      {experiencesToShow.map((experience, index) => (
        <div key={experience.id || experience.code || index} className={styles.cardWrapper}>
          <ChatExperienceCard
            experience={experience}
            zone={zone}
            onLike={handleSelect}
            onDislike={handleSelect}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}

ChatExperienceCardRow.propTypes = {
  experiences: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      code: PropTypes.string,
      nome: PropTypes.string.isRequired,
      descrizione: PropTypes.string,
      descrizioneEstesa: PropTypes.string,
      prezzo: PropTypes.number,
      durata: PropTypes.string,
      tipo: PropTypes.string,
      difficolta: PropTypes.number,
      emoji: PropTypes.string,
      immagini: PropTypes.arrayOf(PropTypes.string),
      highlights: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired,
  zone: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string
  }),
  onSelect: PropTypes.func,
  disabled: PropTypes.bool
};

export default ChatExperienceCardRow;
