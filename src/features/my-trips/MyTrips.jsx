import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import Card from '../../shared/Card';
import {
  getAllTrips,
  deleteTrip,
  moveTripToCategory,
  exportTripAsJSON,
  populateTestData
} from '../../core/utils/tripStorage';
import styles from './MyTrips.module.css';

function MyTrips() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [trips, setTrips] = useState({ upcoming: [], past: [], saved: [] });

  // Carica viaggi da localStorage
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    const storedTrips = getAllTrips();
    setTrips(storedTrips);
  };

  // Handler cancella viaggio
  const handleDeleteTrip = (tripId) => {
    if (window.confirm('Sei sicuro di voler cancellare questo viaggio?')) {
      const success = deleteTrip(tripId);
      if (success) {
        loadTrips();
        alert('✓ Viaggio cancellato con successo');
      } else {
        alert('⚠️ Errore durante la cancellazione');
      }
    }
  };

  // Handler modifica viaggio
  const handleEditTrip = (trip) => {
    if (trip.wizardData && trip.filledBlocks) {
      navigate('/trip-editor', {
        state: {
          wizardData: trip.wizardData,
          filledBlocks: trip.filledBlocks,
          totalDays: trip.giorni,
          editMode: true,
          tripId: trip.id
        }
      });
    } else {
      alert('⚠️ Questo viaggio non può essere modificato (dati incompleti)');
    }
  };

  // Handler pubblica viaggio
  const handlePublishTrip = (tripId) => {
    if (window.confirm('Vuoi pubblicare questo viaggio tra i prossimi viaggi?')) {
      const success = moveTripToCategory(tripId, 'upcoming');
      if (success) {
        loadTrips();
        alert('✓ Viaggio pubblicato!');
        setActiveTab('upcoming');
      } else {
        alert('⚠️ Errore durante la pubblicazione');
      }
    }
  };

  // Handler esporta viaggio
  const handleExportTrip = (tripId) => {
    const success = exportTripAsJSON(tripId);
    if (success) {
      alert('✓ Viaggio esportato!');
    } else {
      alert('⚠️ Errore durante l\'esportazione');
    }
  };

  // Handler popola dati di test
  const handlePopulateTestData = () => {
    if (window.confirm('Vuoi popolare lo storage con dati di test?')) {
      populateTestData();
      loadTrips();
      alert('✓ Dati di test caricati!');
    }
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

  // Funzioni helper per timeline
  const generateTimeline = (trip) => {
    const giorni = [];
    for (let i = 1; i <= trip.giorni; i++) {
      if (i === 1) {
        giorni.push({
          day: i,
          type: 'arrival',
          title: `Giorno ${i} - Arrivo`,
          description: `Arrivo a ${trip.destinazione} e sistemazione in hotel`
        });
      } else if (i === trip.giorni) {
        giorni.push({
          day: i,
          type: 'departure',
          title: `Giorno ${i} - Partenza`,
          description: `Check-out e partenza da ${trip.destinazione}`
        });
      } else {
        giorni.push({
          day: i,
          type: 'experience',
          title: `Giorno ${i} - Esplorazione`,
          description: `Giornata di esperienze e attività a ${trip.destinazione}`
        });
      }
    }
    return giorni;
  };

  const getDayTypeIcon = (type) => {
    switch (type) {
      case 'arrival':
        return '✈️';
      case 'departure':
        return '🏠';
      case 'experience':
        return '⭐';
      default:
        return '📍';
    }
  };

  const getDayTypeColor = (type) => {
    switch (type) {
      case 'arrival':
        return '#fbbf24';
      case 'departure':
        return '#ef4444';
      case 'experience':
        return '#667eea';
      default:
        return '#6b7280';
    }
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handlePopulateTestData} size="sm">
            🧪 Dati Test
          </Button>
          <Button variant="primary" onClick={() => navigate('/create')}>
            ➕ Crea nuovo viaggio
          </Button>
        </div>
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

                    {/* Expand button */}
                    <div className={styles.tripExpand}>
                      <button
                        className={styles.expandButton}
                        onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
                      >
                        {expandedTripId === trip.id ? '▲ Chiudi itinerario' : '▼ Vedi itinerario'}
                      </button>
                    </div>

                    {/* Timeline espandibile */}
                    {expandedTripId === trip.id && (
                      <div className={styles.timelineSection}>
                        <h4 className={styles.timelineTitle}>📅 Itinerario del viaggio</h4>
                        <div className={styles.timeline}>
                          {generateTimeline(trip).map((giorno, index, array) => (
                            <div
                              key={giorno.day}
                              className={`${styles.timelineDay} ${index === array.length - 1 ? styles.last : ''}`}
                            >
                              {index < array.length - 1 && <div className={styles.timelineLine} />}
                              <div
                                className={styles.dayMarker}
                                style={{ backgroundColor: getDayTypeColor(giorno.type) }}
                              >
                                <span className={styles.dayIcon}>{getDayTypeIcon(giorno.type)}</span>
                              </div>
                              <div className={styles.dayContent}>
                                <h5 className={styles.dayTitle}>{giorno.title}</h5>
                                <p className={styles.dayDescription}>{giorno.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className={styles.tripActions}>
                      {activeTab === 'upcoming' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportTrip(trip.id)}
                          >
                            📤 Esporta
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleEditTrip(trip)}
                          >
                            ✏️ Modifica
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            🗑️ Cancella
                          </Button>
                        </>
                      )}
                      {activeTab === 'past' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportTrip(trip.id)}
                          >
                            📤 Esporta
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            🗑️ Cancella
                          </Button>
                        </>
                      )}
                      {activeTab === 'saved' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTrip(trip.id)}
                          >
                            🗑️ Cancella
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTrip(trip)}
                          >
                            ✏️ Modifica
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handlePublishTrip(trip.id)}
                          >
                            ✓ Pubblica
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
