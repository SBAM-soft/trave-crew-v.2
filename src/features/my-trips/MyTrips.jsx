import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import Card from '../../shared/Card';
import styles from './MyTrips.module.css';

function MyTrips() {
  const navigate = useNavigate();

  // Mock data viaggi (in futuro da backend/context)
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, saved

  const trips = {
    upcoming: [
      {
        id: 1,
        destinazione: 'Thailandia',
        zona: 'Bangkok e dintorni',
        dataPartenza: '2024-07-15',
        dataRitorno: '2024-07-22',
        giorni: 7,
        persone: 2,
        immagine: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
        status: 'confirmed',
        costoTotale: 1850
      },
      {
        id: 2,
        destinazione: 'Giappone',
        zona: 'Tokyo e Kyoto',
        dataPartenza: '2024-09-10',
        dataRitorno: '2024-09-20',
        giorni: 10,
        persone: 1,
        immagine: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        status: 'pending',
        costoTotale: 2400
      }
    ],
    past: [
      {
        id: 3,
        destinazione: 'Portogallo',
        zona: 'Lisbona e Algarve',
        dataPartenza: '2024-05-01',
        dataRitorno: '2024-05-08',
        giorni: 7,
        persone: 2,
        immagine: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
        status: 'completed',
        costoTotale: 1200,
        recensione: true
      }
    ],
    saved: [
      {
        id: 4,
        destinazione: 'Islanda',
        zona: 'Ring Road',
        giorni: 8,
        persone: 2,
        immagine: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
        status: 'saved',
        costoTotale: 2800
      }
    ]
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: '✓ Confermato', color: '#10b981' },
      pending: { text: '⏳ In attesa', color: '#f59e0b' },
      completed: { text: '✓ Completato', color: '#667eea' },
      saved: { text: '💾 Salvato', color: '#6b7280' }
    };
    return badges[status] || badges.saved;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className={styles.myTripsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>I miei viaggi</h1>
          <p className={styles.subtitle}>Gestisci i tuoi viaggi passati, prossimi e salvati</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/create')}>
          ➕ Crea nuovo viaggio
        </Button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          🗓️ Prossimi ({trips.upcoming.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
          onClick={() => setActiveTab('past')}
        >
          ✓ Passati ({trips.past.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          💾 Salvati ({trips.saved.length})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {trips[activeTab].length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeTab === 'upcoming' && '🗺️'}
              {activeTab === 'past' && '✈️'}
              {activeTab === 'saved' && '💾'}
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === 'upcoming' && 'Nessun viaggio in programma'}
              {activeTab === 'past' && 'Nessun viaggio passato'}
              {activeTab === 'saved' && 'Nessun viaggio salvato'}
            </h3>
            <p className={styles.emptyText}>
              {activeTab === 'upcoming' && 'Inizia a pianificare la tua prossima avventura!'}
              {activeTab === 'past' && 'I tuoi viaggi completati appariranno qui'}
              {activeTab === 'saved' && 'Salva i viaggi che ti interessano per dopo'}
            </p>
            <Button variant="primary" onClick={() => navigate('/create')}>
              Crea il tuo primo viaggio
            </Button>
          </div>
        ) : (
          <div className={styles.tripsGrid}>
            {trips[activeTab].map((trip) => {
              const badge = getStatusBadge(trip.status);
              return (
                <Card key={trip.id} hover className={styles.tripCard}>
                  {/* Immagine */}
                  <div className={styles.tripImage}>
                    <img src={trip.immagine} alt={trip.destinazione} />
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: badge.color }}
                    >
                      {badge.text}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={styles.tripContent}>
                    <h3 className={styles.tripTitle}>{trip.destinazione}</h3>
                    <p className={styles.tripZone}>{trip.zona}</p>

                    <div className={styles.tripMeta}>
                      {trip.dataPartenza && trip.dataRitorno && (
                        <div className={styles.tripMetaItem}>
                          📅 {formatDate(trip.dataPartenza)} - {formatDate(trip.dataRitorno)}
                        </div>
                      )}
                      <div className={styles.tripMetaItem}>
                        ⏱️ {trip.giorni} giorni
                      </div>
                      <div className={styles.tripMetaItem}>
                        👥 {trip.persone} {trip.persone === 1 ? 'persona' : 'persone'}
                      </div>
                      <div className={styles.tripMetaItem}>
                        💰 €{trip.costoTotale}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.tripActions}>
                      {activeTab === 'upcoming' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert('Visualizzazione dettagli viaggio...')}
                          >
                            👁️ Dettagli
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => alert('Modifica viaggio...')}
                          >
                            ✏️ Modifica
                          </Button>
                        </>
                      )}
                      {activeTab === 'past' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert('Visualizzazione dettagli viaggio...')}
                          >
                            👁️ Dettagli
                          </Button>
                          {trip.recensione ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => alert('Vedi recensione...')}
                            >
                              ⭐ Vedi recensione
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => alert('Lascia recensione...')}
                            >
                              ⭐ Lascia recensione
                            </Button>
                          )}
                        </>
                      )}
                      {activeTab === 'saved' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert('Rimuovi dai salvati...')}
                          >
                            🗑️ Rimuovi
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => alert('Prenota viaggio...')}
                          >
                            ✓ Prenota
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTrips;
