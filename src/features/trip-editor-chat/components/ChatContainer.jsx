import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import styles from './ChatContainer.module.css';

/**
 * Container principale per la chat
 * Gestisce lo scroll automatico e il rendering dei messaggi
 */
function ChatContainer({ messages, isTyping, isProcessing, onOptionSelect, onCardSelect, onCardDetails }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Disabilita azioni se il bot sta scrivendo o processando
  const isDisabled = isTyping || isProcessing;

  // Auto-scroll quando arriva un nuovo messaggio
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  return (
    <div className={styles.chatContainer} ref={containerRef}>
      <div className={styles.messagesArea}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h3>Inizia la conversazione</h3>
            <p>Il bot ti guiderà nella creazione del tuo viaggio perfetto!</p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isDisabled={isDisabled}
            onOptionSelect={onOptionSelect}
            onCardSelect={onCardSelect}
            onCardDetails={onCardDetails}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

ChatContainer.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  isTyping: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onOptionSelect: PropTypes.func,
  onCardSelect: PropTypes.func,
  onCardDetails: PropTypes.func
};

export default ChatContainer;
