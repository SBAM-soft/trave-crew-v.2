import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { saveTripComplete } from '../../core/utils/tripStorage';
import { downloadAsText, downloadAsJSON, copyToClipboard } from '../../core/utils/exportHelpers';
import Button from '../../shared/Button';
import styles from './TripSummary.module.css';

function TripSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { incrementTripStats, addDestination } = useUser();

  const tripData = location.state || {};
  const {
    wizardData = {},
    filledBlocks = [],
    totalDays = 7,
    selectedHotels = [],
    zoneVisitate = [],
    timeline = []
  } = tripData;

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calcola costi totali
  const calculateCosts = () => {
    let experiencesCost = 0;
    let hotelsCost = 0;
    let extrasCost = 0;

    // Costo esperienze
    filledBlocks.forEach(block => {
      if (block.experience && block.experience.prezzo) {
        experiencesCost += block.experience.prezzo * wizardData.numeroPersone;
      }
    });

    // Costo hotel
    selectedHotels.forEach(item => {
      if (item.hotel && item.hotel.PREZZO) {
        hotelsCost += item.hotel.PREZZO * totalDays;
      }
      // Extra hotel
      if (item.extras) {
        item.extras.forEach(extra => {
          const price = extra.PRZ_PAX_GEN || extra.PRZ_PAX_FEB || 0;
          extrasCost += price * wizardData.numeroPersone;
        });
      }
    });

    const total = experiencesCost + hotelsCost + extrasCost;

    return {
      experiences: experiencesCost,
      hotels: hotelsCost,
      extras: extrasCost,
      total: total,
      perPerson: total
    };
  };

  const costs = calculateCosts();

  // Handler salva viaggio
  const handleSaveTrip = async () => {
    setSaving(true);

    try {
      const saved = saveTripComplete(tripData, 'completed');

      if (saved) {
        // Incrementa statistiche utente
        incrementTripStats('completed');
        addDestination(wizardData.destinazioneNome || wizardData.destinazione);

        toast.success('🎉 Viaggio salvato con successo!', {
          description: 'Puoi trovarlo in "I miei viaggi"'
        });

        setTimeout(() => {
          navigate('/my-trips');
        }, 1500);
      } else {
        toast.error('Errore nel salvataggio del viaggio');
      }
    } catch (error) {
      toast.error('Si è verificato un errore');
      console.error('Errore salvataggio:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handler esporta
  const handleExport = (type) => {
    const exportData = {
      wizardData,
      timeline,
      totalDays,
      totalCost: costs.total
    };

    if (type === 'text') {
      const result = downloadAsText(exportData);
      if (result.success) {
        toast.success('Itinerario scaricato!');
      }
    } else if (type === 'json') {
      const result = downloadAsJSON({ ...tripData, costs });
      if (result.success) {
        toast.success('JSON esportato!');
      }
    } else if (type === 'clipboard') {
      copyToClipboard(exportData).then(result => {
        if (result.success) {
          toast.success('Copiato negli appunti!');
        }
      });
    }

    setShowExportMenu(false);
  };

  // Handler modifica
  const handleEdit = (section) => {
    if (section === 'experiences') {
      navigate('/trip-editor', { state: { wizardData } });
    } else if (section === 'hotels') {
      navigate('/hotel-selection', { state: tripData });
    }
  };

  // Handler procedi pagamento (simulato)
  const handleProceedToPayment = () => {
    toast.info('Funzionalità pagamento in arrivo!', {
      description: 'Per ora puoi salvare il viaggio o esportarlo'
    });
  };

  if (!wizardData.destinazione) {
    return (
      <div className={styles.tripSummary}>
        <div className={styles.error}>
          <h2>⚠️ Nessun viaggio trovato</h2>
          <p>Torna alla home e crea un nuovo viaggio</p>
          <Button onClick={() => navigate('/')}>← Torna alla Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tripSummary}>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.phaseIndicator}>
            <span className={styles.phaseNumber}>Fase 3/3</span>
            <div className={styles.phaseSteps}>
              <div className={styles.stepCompleted}>✓ Itinerario</div>
              <div className={styles.stepCompleted}>✓ Hotel</div>
              <div className={styles.stepActive}>📋 Riepilogo</div>
            </div>
          </div>
          <h1 className={styles.title}>🎉 Riepilogo del Viaggio</h1>
          <p className={styles.subtitle}>
            {wizardData.destinazioneNome || wizardData.destinazione} • {totalDays} giorni • {wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Card Informazioni Viaggio */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>📋 Informazioni Viaggio</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Destinazione</span>
                <span className={styles.infoValue}>{wizardData.destinazioneNome || wizardData.destinazione}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Durata</span>
                <span className={styles.infoValue}>{totalDays} giorni</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Partecipanti</span>
                <span className={styles.infoValue}>{wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Budget</span>
                <span className={styles.infoValue}>
                  {wizardData.budget === 'low' && '€ Economico'}
                  {wizardData.budget === 'medium' && '€€ Medio'}
                  {wizardData.budget === 'high' && '€€€ Lusso'}
                </span>
              </div>
              {wizardData.dataPartenza && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Partenza</span>
                  <span className={styles.infoValue}>
                    {new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
              {wizardData.interessi && wizardData.interessi.length > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Interessi</span>
                  <span className={styles.infoValue}>{wizardData.interessi.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Esperienze */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🎯 Esperienze Selezionate</h2>
            <button className={styles.editBtn} onClick={() => handleEdit('experiences')}>
              ✏️ Modifica
            </button>
          </div>
          <div className={styles.cardBody}>
            {filledBlocks.length > 0 ? (
              <div className={styles.experiencesList}>
                {filledBlocks.map((block, index) => {
                  if (!block.experience) return null;
                  const exp = block.experience;
                  return (
                    <div key={index} className={styles.experienceItem}>
                      <div className={styles.expIcon}>🎯</div>
                      <div className={styles.expInfo}>
                        <h3 className={styles.expName}>{exp.nome || exp.NOME}</h3>
                        <p className={styles.expDay}>Giorno {block.day}</p>
                        {exp.durata && <p className={styles.expDuration}>⏱️ {exp.durata}</p>}
                      </div>
                      <div className={styles.expPrice}>
                        €{(exp.prezzo || 0).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>Nessuna esperienza selezionata</p>
            )}
          </div>
        </div>

        {/* Card Hotel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🏨 Hotel Selezionati</h2>
            <button className={styles.editBtn} onClick={() => handleEdit('hotels')}>
              ✏️ Modifica
            </button>
          </div>
          <div className={styles.cardBody}>
            {selectedHotels.length > 0 ? (
              <div className={styles.hotelsList}>
                {selectedHotels.map((item, index) => {
                  if (!item.hotel) return null;
                  const hotel = item.hotel;
                  return (
                    <div key={index} className={styles.hotelItem}>
                      <div className={styles.hotelIcon}>🏨</div>
                      <div className={styles.hotelInfo}>
                        <h3 className={styles.hotelName}>{hotel.ZONA}</h3>
                        <p className={styles.hotelZone}>{item.zona}</p>
                        <p className={styles.hotelType}>
                          {hotel.TIPO === 'LOW' && '€ Budget'}
                          {hotel.TIPO === 'MEDIUM' && '€€ Medio'}
                          {hotel.TIPO === 'HIGH' && '€€€ Lusso'}
                        </p>
                        {item.extras && item.extras.length > 0 && (
                          <p className={styles.hotelExtras}>
                            + {item.extras.length} extra
                          </p>
                        )}
                      </div>
                      <div className={styles.hotelPrice}>
                        €{(hotel.PREZZO || 0).toFixed(2)} / notte
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.emptyState}>Nessun hotel selezionato</p>
            )}
          </div>
        </div>

        {/* Card Riepilogo Costi */}
        <div className={styles.card + ' ' + styles.costCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>💰 Riepilogo Costi</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.costBreakdown}>
              <div className={styles.costRow}>
                <span>Esperienze</span>
                <span className={styles.costValue}>€{costs.experiences.toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Hotel ({totalDays} notti)</span>
                <span className={styles.costValue}>€{costs.hotels.toFixed(2)}</span>
              </div>
              {costs.extras > 0 && (
                <div className={styles.costRow}>
                  <span>Extra</span>
                  <span className={styles.costValue}>€{costs.extras.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.costDivider}></div>
              <div className={styles.costRow + ' ' + styles.costTotal}>
                <span>Totale</span>
                <span className={styles.costValue}>€{costs.total.toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Per persona</span>
                <span className={styles.costValue}>€{costs.perPerson.toFixed(2)}</span>
              </div>
            </div>
            <p className={styles.costNote}>
              ℹ️ I prezzi sono indicativi e non includono voli internazionali
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Indietro
            </Button>

            <div className={styles.exportButtonWrapper}>
              <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                📤 Esporta
              </Button>
              {showExportMenu && (
                <div className={styles.exportMenu}>
                  <button className={styles.exportOption} onClick={() => handleExport('text')}>
                    📄 Scarica Testo
                  </button>
                  <button className={styles.exportOption} onClick={() => handleExport('json')}>
                    📋 Esporta JSON
                  </button>
                  <button className={styles.exportOption} onClick={() => handleExport('clipboard')}>
                    📋 Copia Clipboard
                  </button>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleSaveTrip} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Viaggio'}
            </Button>

            <Button variant="primary" onClick={handleProceedToPayment} size="lg">
              💳 Procedi al Pagamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripSummary;
