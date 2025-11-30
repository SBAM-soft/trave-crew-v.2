import PropTypes from 'prop-types';
import ChatOptions from './ChatOptions';
import ChatCard from './ChatCard';
import ChatMap from './ChatMap';
import ChatHotelSelector from './ChatHotelSelector';
import ChatExperienceCard from './ChatExperienceCard';
import ChatExperienceCardRow from './ChatExperienceCardRow';
import FreeDaySelector from './FreeDaySelector';
import styles from './ChatMessage.module.css';

/**
 * Componente per renderizzare un singolo messaggio nella chat
 * Gestisce diversi tipi di messaggio: bot, user, options, cards, map, etc.
 */
function ChatMessage({ message, isDisabled, onOptionSelect, onCardSelect, onCardDetails }) {
  const { type, content, data, sender } = message;

  console.log('🎨 Rendering message:', { type, content, hasData: !!data, data, isDisabled });

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

  // Messaggio bot con opzioni (DEVE essere prima del controllo generico 'bot')
  if (type === 'bot_options') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          {data?.options && (
            <ChatOptions
              options={data.options}
              onSelect={onOptionSelect}
              disabled={isDisabled}
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
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          <div className={styles.cardsContainer}>
            {data?.cards && data.cards.map(card => (
              <ChatCard
                key={card.id}
                card={{ ...card, zoneCode: data.zone?.code }}
                onSelect={onCardSelect}
                onDetails={onCardDetails}
                disabled={isDisabled}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Messaggio bot con mappa
  if (type === 'bot_map') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubbleMap}>
          <p className={styles.text}>{content}</p>
          <div className={styles.mapContainer}>
            {data?.zones && (
              <ChatMap
                zones={data.zones}
                selectedZones={[]}
                onZoneSelect={onOptionSelect}
                multiSelect={data.multiSelect}
                daysAvailable={data.daysAvailable}
                disabled={isDisabled}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Messaggio bot con hotel selector
  if (type === 'bot_hotel_selector') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          {data && (
            <ChatHotelSelector
              zona={data.zona}
              notti={data.notti}
              tiers={data.tiers}
              extras={data.extras}
              onSelect={onOptionSelect}
              disabled={isDisabled}
            />
          )}
        </div>
      </div>
    );
  }

  // Messaggio bot con free day selector
  if (type === 'bot_free_day_selector') {
    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          <FreeDaySelector
            onConfirm={(days) => onOptionSelect({ action: 'confirm_free_days', days })}
            onCancel={() => onOptionSelect({ action: 'cancel_free_days' })}
            disabled={isDisabled}
          />
        </div>
      </div>
    );
  }

  // Messaggio bot con 3 experience cards affiancate (Tinder-style)
  if (type === 'bot_experience_cards_row') {
    console.log('🎨 Rendering bot_experience_cards_row:', {
      type,
      hasData: !!data,
      hasExperiences: !!data?.experiences,
      experiencesCount: data?.experiences?.length
    });

    if (!data?.experiences || data.experiences.length === 0) {
      console.error('❌ Missing experiences data in bot_experience_cards_row message');
      return (
        <div className={`${styles.message} ${styles.bot}`}>
          <div className={styles.bubble}>
            <p className={styles.text}>{content}</p>
            <p style={{ color: 'red' }}>Errore: nessuna esperienza disponibile</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubbleExperienceCards}>
          <p className={styles.text}>{content}</p>
          <ChatExperienceCardRow
            experiences={data.experiences}
            zone={data.zone}
            onSelect={onOptionSelect}
            disabled={isDisabled}
          />
        </div>
      </div>
    );
  }

  // Messaggio bot con esperienza singola (swipe style) - deprecato, tenuto per compatibilità
  if (type === 'bot_experience_detail' || type === 'bot_experience_swipe') {
    console.log('🎨 Rendering bot_experience_detail:', {
      type,
      hasData: !!data,
      hasExperience: !!data?.experience,
      experienceName: data?.experience?.nome
    });

    if (!data?.experience) {
      console.error('❌ Missing experience data in bot_experience_detail message');
      return (
        <div className={`${styles.message} ${styles.bot}`}>
          <div className={styles.bubble}>
            <p className={styles.text}>{content}</p>
            <p style={{ color: 'red' }}>Errore: dati esperienza mancanti</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${styles.message} ${styles.bot}`}>
        <div className={styles.bubble}>
          <p className={styles.text}>{content}</p>
          <ChatExperienceCard
            experience={data.experience}
            zone={data.zone}
            progress={data.progress}
            onLike={onOptionSelect}
            onDislike={onOptionSelect}
            disabled={isDisabled}
          />
        </div>
      </div>
    );
  }

  // Fallback: messaggio bot standard (DEVE essere DOPO tutti i controlli specifici)
  return (
    <div className={`${styles.message} ${styles.bot}`}>
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
  isDisabled: PropTypes.bool,
  onOptionSelect: PropTypes.func,
  onCardSelect: PropTypes.func,
  onCardDetails: PropTypes.func
};

export default ChatMessage;
