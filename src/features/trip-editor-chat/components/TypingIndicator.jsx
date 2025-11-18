import styles from './TypingIndicator.module.css';

/**
 * Indicatore "Bot sta scrivendo..."
 * Animazione 3 puntini
 */
function TypingIndicator() {
  return (
    <div className={styles.typingIndicator}>
      <div className={styles.avatar}>🤖</div>
      <div className={styles.bubble}>
        <div className={styles.dots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
