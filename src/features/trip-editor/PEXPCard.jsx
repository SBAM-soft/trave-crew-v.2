import Button from '../../shared/Button';
import Card from '../../shared/Card';
import styles from './PEXPCard.module.css';

function PEXPCard({ pexp, onClick, isSelected = false }) {
  // Compatibilità CSV: estrai valori da struttura CSV o mock
  const notti = pexp.MIN_NOTTI || pexp.notti || 2;
  const giorniTotali = notti + 1;
  const nome = pexp.NOME || pexp.nome || 'Pacchetto esperienza';
  const descrizione = pexp.DESCRIZIONE || pexp.storytelling?.intro || 'Scopri questo fantastico pacchetto di esperienze';
  const zona = pexp.ZONA || pexp.zona_nome || 'Zona non specificata';
  const prezzo = pexp.PRX_PAX || pexp.prezzo_base || 0;

  // Conta esperienze dal CSV (campi ATTIVITA_G*_ORD*)
  const countExperiences = () => {
    const slots = ['ATTIVITA_G2_ORD1', 'ATTIVITA_G2_ORD2', 'ATTIVITA_G3_ORD1', 'ATTIVITA_G3_ORD2',
                   'ATTIVITA_G4_ORD1', 'ATTIVITA_G4_ORD2', 'ATTIVITA_G5_ORD1'];
    let count = 0;
    slots.forEach(slot => {
      if (pexp[slot]) count++;
    });
    return count || (pexp.esperienze_ids?.length || 0);
  };

  const experiencesCount = countExperiences();

  // Calcola score like/dislike
  const totalVotes = (pexp.likes || 0) + (pexp.dislikes || 0);
  const likePercentage = totalVotes > 0 ? Math.round(((pexp.likes || 0) / totalVotes) * 100) : 0;

  return (
    <Card hover className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      {/* Badge durata */}
      <div className={styles.badges}>
        <span className={styles.badge}>
          📅 {giorniTotali} giorni • {notti} notti
        </span>
        {isSelected && (
          <span className={styles.selectedBadge}>
            ✓ Selezionato
          </span>
        )}
      </div>

      {/* Titolo pacchetto */}
      <h3 className={styles.title}>{nome}</h3>

      {/* Intro storytelling (troncata) */}
      <p className={styles.intro}>
        {descrizione.length > 120
          ? `${descrizione.substring(0, 120)}...`
          : descrizione}
      </p>

      {/* Informazioni zona */}
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.icon}>🗺️</span>
          <span>{zona}</span>
        </div>

        {pexp.citta_arrivo && (
          <div className={styles.metaItem}>
            <span className={styles.icon}>✈️</span>
            <span>Da {pexp.citta_arrivo}</span>
          </div>
        )}
      </div>

      {/* Numero esperienze incluse */}
      {experiencesCount > 0 && (
        <div className={styles.experiences}>
          <span className={styles.experiencesLabel}>
            ⭐ {experiencesCount} esperienze incluse
          </span>
        </div>
      )}

      {/* Footer: prezzo e voti */}
      <div className={styles.footer}>
        {/* Prezzo */}
        <div className={styles.price}>
          <span className={styles.priceLabel}>A partire da</span>
          <span className={styles.priceValue}>€{prezzo}</span>
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