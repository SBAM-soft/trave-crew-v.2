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
  const lastMessageRef = useRef(null);

  // Disabilita azioni se il bot sta scrivendo o processando
  const isDisabled = isTyping || isProcessing;

  // Auto-scroll migliorato: più lento e parte dall'inizio per messaggi lunghi
  useEffect(() => {
    if (!containerRef.current) return;

    const scrollToMessage = () => {
      if (!lastMessageRef.current && !messagesEndRef.current) return;

      // Se c'è un ultimo messaggio, calcola se è lungo
      if (lastMessageRef.current) {
        const messageHeight = lastMessageRef.current.offsetHeight;
        const containerHeight = containerRef.current.offsetHeight;

        // Se il messaggio è più alto del 60% del container, scrolla all'inizio
        if (messageHeight > containerHeight * 0.6) {
          lastMessageRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          return;
        }
      }

      // Altrimenti scrolla normalmente alla fine
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    };

    // Ritardo di 100ms per permettere il rendering e rallentare lo scroll
    const timeoutId = setTimeout(scrollToMessage, 100);
    return () => clearTimeout(timeoutId);
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

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            <ChatMessage
              message={msg}
              isDisabled={isDisabled}
              onOptionSelect={onOptionSelect}
              onCardSelect={onCardSelect}
              onCardDetails={onCardDetails}
            />
          </div>
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
