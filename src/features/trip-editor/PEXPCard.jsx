import Button from '../../shared/Button';
import Card from '../../shared/Card';
import styles from './PEXPCard.module.css';

function PEXPCard({ pexp, onClick, isSelected = false }) {
  // Calcola score like/dislike
  const totalVotes = (pexp.likes || 0) + (pexp.dislikes || 0);
  const likePercentage = totalVotes > 0 ? Math.round(((pexp.likes || 0) / totalVotes) * 100) : 0;

  return (
    <Card hover className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      {/* Badge durata */}
      <div className={styles.badges}>
        <span className={styles.badge}>
          📅 {pexp.giorni_totali} giorni • {pexp.notti} notti
        </span>
        {isSelected && (
          <span className={styles.selectedBadge}>
            ✓ Selezionato
          </span>
        )}
      </div>

      {/* Titolo pacchetto */}
      <h3 className={styles.title}>{pexp.nome}</h3>

      {/* Intro storytelling (troncata) */}
      <p className={styles.intro}>
        {pexp.storytelling?.intro 
          ? `${pexp.storytelling.intro.substring(0, 120)}...`
          : 'Scopri questo fantastico pacchetto di esperienze'}
      </p>

      {/* Informazioni zona */}
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.icon}>🗺️</span>
          <span>{pexp.zona_nome || 'Zona non specificata'}</span>
        </div>
        
        {pexp.citta_arrivo && (
          <div className={styles.metaItem}>
            <span className={styles.icon}>✈️</span>
            <span>Da {pexp.citta_arrivo}</span>
          </div>
        )}
      </div>

      {/* Numero esperienze incluse */}
      {pexp.esperienze_ids && pexp.esperienze_ids.length > 0 && (
        <div className={styles.experiences}>
          <span className={styles.experiencesLabel}>
            ⭐ {pexp.esperienze_ids.length} esperienze incluse
          </span>
        </div>
      )}

      {/* Footer: prezzo e voti */}
      <div className={styles.footer}>
        {/* Prezzo */}
        <div className={styles.price}>
          <span className={styles.priceLabel}>A partire da</span>
          <span className={styles.priceValue}>€{pexp.prezzo_base || 0}</span>
        </div>

        {/* Voti */}
        <div className={styles.votes}>
          {totalVotes > 0 ? (
            <>
              <span className={styles.voteBar}>
                <span 
                  className={styles.voteBarFill}
                  style={{ width: `${likePercentage}%` }}
                />
              </span>
              <span className={styles.voteText}>
                {likePercentage}% ❤️ ({totalVotes})
              </span>
            </>
          ) : (
            <span className={styles.voteText}>Nessuna recensione</span>
          )}
        </div>
      </div>

      {/* Pulsante azione */}
      <Button 
        onClick={() => onClick && onClick(pexp)} 
        variant={isSelected ? "outline" : "primary"}
        className={styles.button}
      >
        {isSelected ? 'Visualizza dettagli' : 'Scopri pacchetto'}
      </Button>
    </Card>
  );
}

export default PEXPCard;