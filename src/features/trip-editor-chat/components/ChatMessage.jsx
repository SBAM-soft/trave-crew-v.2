import PropTypes from 'prop-types';
import ChatOptions from './ChatOptions';
import styles from './ChatMessage.module.css';

/**
 * Componente per renderizzare un singolo messaggio nella chat
 * Gestisce diversi tipi di messaggio: bot, user, options, cards, map, etc.
 */
function ChatMessage({ message, onOptionSelect, onCardSelect }) {
  const { type, content, data, sender } = message;

  // Messaggio bot standard
  if (type === 'bot' || sender === 'bot') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.avatar}>🤖</div>
        <div className={styles.bubble}>
          {content}
        </div>
      </div>
    );
  }

  // Messaggio utente
  if (type === 'user' || sender === 'user') {
    return (
      <div className={`${styles.message} ${styles.user}`}>
        <div className={styles.bubbleUser}>
          {content}
        </div>
      </div>
    );
  }

  // Messaggio bot con opzioni
  if (type === 'bot_options') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.avatar}>🤖</div>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          {data?.options && (
            <ChatOptions
              options={data.options}
              onSelect={onOptionSelect}
            />
          )}
        </div>
      </div>
    );
  }

  // Messaggio bot con card riepilogo
  if (type === 'bot_message_with_card') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.avatar}>🤖</div>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          {data?.card && (
            <div className={styles.card}>
              {data.card.type === 'wizard_summary' && (
                <WizardSummaryCard data={data.card.data} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Messaggio bot con cards (pacchetti/zone)
  if (type === 'bot_cards') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.avatar}>🤖</div>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          <div className={styles.cardsContainer}>
            {/* Le card verranno renderizzate dal componente ChatCard */}
            {data?.cards && (
              <p className={styles.placeholder}>
                [Componente ChatCard - da implementare]
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Messaggio bot con mappa
  if (type === 'bot_map') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.avatar}>🤖</div>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          <div className={styles.mapContainer}>
            {/* Mappa verrà renderizzata dal componente ChatMap */}
            {data?.zones && (
              <p className={styles.placeholder}>
                [Componente ChatMap - da implementare]
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: messaggio semplice
  return (
    <div className={`${styles.message} ${styles.bot}`}>
      <div className={styles.avatar}>🤖</div>
      <div className={styles.bubble}>
        {content}
        {data && (
          <pre className={styles.debug}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// Componente card riepilogo wizard
function WizardSummaryCard({ data }) {
  return (
    <div className={styles.wizardSummary}>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>📍 Destinazione:</span>
        <span className={styles.summaryValue}>{data.destinazioneNome || data.destinazione}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>👥 Persone:</span>
        <span className={styles.summaryValue}>{data.numeroPersone}</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>💰 Budget:</span>
        <span className={styles.summaryValue}>{data.budget?.toUpperCase()}</span>
      </div>
      {data.interessi && data.interessi.length > 0 && (
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>🎯 Interessi:</span>
          <span className={styles.summaryValue}>{data.interessi.join(', ')}</span>
        </div>
      )}
      {data.dataPartenza && (
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>📅 Partenza:</span>
          <span className={styles.summaryValue}>{data.dataPartenza}</span>
        </div>
      )}
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string.isRequired,
    content: PropTypes.string,
    data: PropTypes.any,
    sender: PropTypes.string,
    timestamp: PropTypes.instanceOf(Date)
  }).isRequired,
  onOptionSelect: PropTypes.func,
  onCardSelect: PropTypes.func
};

export default ChatMessage;
