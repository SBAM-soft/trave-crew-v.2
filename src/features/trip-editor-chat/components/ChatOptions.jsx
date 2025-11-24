import PropTypes from 'prop-types';
import styles from './ChatOptions.module.css';

/**
 * Componente per renderizzare opzioni/bottoni cliccabili
 */
function ChatOptions({ options, onSelect, multiSelect = false, disabled = false }) {
  console.log('🔘 ChatOptions rendering:', { optionsCount: options?.length, hasOnSelect: !!onSelect, disabled, options });

  const handleClick = (optionValue) => {
    if (disabled) {
      console.log('🔘 Option click blocked (disabled)');
      return;
    }
    console.log('🔘 Option clicked:', optionValue);
    if (onSelect) {
      onSelect(optionValue);
    } else {
      console.warn('⚠️ onSelect is not defined!');
    }
  };

  if (!options || options.length === 0) {
    console.warn('⚠️ No options provided to ChatOptions!');
    return null;
  }

  return (
    <div className={styles.optionsGrid}>
      {options.map((option, index) => (
        <button
          key={option.value || index}
          className={styles.optionButton}
          onClick={() => handleClick(option.value)}
          disabled={disabled}
          type="button"
          style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
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
  multiSelect: PropTypes.bool,
  disabled: PropTypes.bool
};

export default ChatOptions;
