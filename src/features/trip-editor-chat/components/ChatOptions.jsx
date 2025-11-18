import PropTypes from 'prop-types';
import styles from './ChatOptions.module.css';

/**
 * Componente per renderizzare opzioni/bottoni cliccabili
 */
function ChatOptions({ options, onSelect, multiSelect = false }) {
  const handleClick = (optionValue) => {
    if (onSelect) {
      onSelect(optionValue);
    }
  };

  return (
    <div className={styles.optionsGrid}>
      {options.map((option, index) => (
        <button
          key={option.value || index}
          className={styles.optionButton}
          onClick={() => handleClick(option.value)}
          type="button"
        >
          {option.emoji && (
            <span className={styles.emoji}>{option.emoji}</span>
          )}
          <div className={styles.content}>
            <span className={styles.label}>{option.label}</span>
            {option.description && (
              <span className={styles.description}>{option.description}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

ChatOptions.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    emoji: PropTypes.string,
    description: PropTypes.string
  })).isRequired,
  onSelect: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool
};

export default ChatOptions;
