import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { saveTripComplete } from '../../core/utils/tripStorage';
import { downloadAsText, downloadAsJSON, downloadAsPDF, copyToClipboard } from '../../core/utils/exportHelpers';
import { toPrice, toInt } from '../../core/utils/typeHelpers';
import { generateMediaForExperience } from '../../core/utils/mediaHelpers';
import { useCostiAccessori, calcolaCostiApplicabili } from '../../hooks/useCostiAccessori';
import Button from '../../shared/Button';
import Checkout from '../wallet/Checkout';
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Carica costi accessori per la destinazione
  const { costiAccessori } = useCostiAccessori(wizardData.destinazione || wizardData.destinazioneNome);

  // Genera immagini per il riepilogo
  const heroImage = useMemo(() => {
    const destinationName = wizardData.destinazioneNome || wizardData.destinazione || 'travel';
    return `https://source.unsplash.com/featured/1200x400/?${encodeURIComponent(destinationName)},landscape&sig=hero`;
  }, [wizardData]);

  // Genera immagini per le esperienze
  const experienceImages = useMemo(() => {
    return filledBlocks.slice(0, 6).map((block, index) => {
      const exp = block.experience;
      if (!exp) return null;
      const media = generateMediaForExperience(exp, {
        count: 1,
        includeVideo: false,
        destinazione: wizardData.destinazione
      });
      return media[0]?.url;
    }).filter(Boolean);
  }, [filledBlocks, wizardData.destinazione]);

  // Calcola costi totali
  const calculateCosts = () => {
    let experiencesCost = 0;
    let hotelsCost = 0;
    let extrasCost = 0;

    // Costo esperienze
    filledBlocks.forEach(block => {
      if (block.experience && block.experience.prezzo) {
        const price = toPrice(block.experience.prezzo, 0);
        const numPersone = toInt(wizardData.numeroPersone, 1);
        experiencesCost += price * numPersone;
      }
    });

    // Costo hotel (totalDays - 1 perché il primo giorno è arrivo, l'ultimo è partenza)
    selectedHotels.forEach(item => {
      if (item.hotel && item.hotel.PREZZO) {
        const price = toPrice(item.hotel.PREZZO, 0);
        hotelsCost += price * (totalDays - 1);
      }
      // Extra hotel
      if (item.extras) {
        item.extras.forEach(extra => {
          const price = toPrice(extra.PRZ_PAX_GEN || extra.PRZ_PAX_FEB, 0);
          const numPersone = toInt(wizardData.numeroPersone, 1);
          extrasCost += price * numPersone;
        });
      }
    });

    // Costi accessori (assicurazione, documenti, voli interni)
    const numeroPersone = toInt(wizardData.numeroPersone, 1);
    const costiAccessoriApplicabili = calcolaCostiApplicabili(
      costiAccessori,
      numeroPersone,
      zoneVisitate
    );
    const accessoriesCost = costiAccessoriApplicabili.totale;

    const total = experiencesCost + hotelsCost + extrasCost + accessoriesCost;

    return {
      experiences: experiencesCost,
      hotels: hotelsCost,
      extras: extrasCost,
      accessories: accessoriesCost,
      accessoriesItems: costiAccessoriApplicabili.items,
      total: total,
      perPerson: total
    };
  };

  const costs = calculateCosts();

  // Handler salva viaggio
  const handleSaveTrip = async () => {
    setSaving(true);

    try {
      // Usa 'upcoming' per viaggi confermati pronti alla partenza
      const saved = saveTripComplete(tripData, 'upcoming');

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
  const handleExport = async (type) => {
    const exportData = {
      wizardData,
      timeline,
      totalDays,
      totalCost: costs.total,
      selectedHotels
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
    } else if (type === 'pdf') {
      const result = await downloadAsPDF(exportData);
      if (result.success) {
        toast.success('PDF generato con successo!');
      } else {
        toast.error(result.error || 'Errore generazione PDF');
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

  // Handler procedi pagamento
  const handleProceedToPayment = () => {
    setShowCheckout(true);
  };

  // Handler pubblica viaggio nella sezione esplora
  const handlePublishTrip = async () => {
    setPublishing(true);

    try {
      // Salva il viaggio nel localStorage per la sezione esplora
      const EXPLORE_TRIPS_KEY = 'trave_crew_explore_trips';

      const existingTrips = JSON.parse(localStorage.getItem(EXPLORE_TRIPS_KEY) || '[]');

      const publishedTrip = {
        id: crypto.randomUUID(),
        TITOLO: `${wizardData.destinazioneNome || wizardData.destinazione} - Viaggio ${totalDays} giorni`,
        DESCRIZIONE: `Esperienza unica con ${filledBlocks.length} attività selezionate`,
        DESTINAZIONE: wizardData.destinazioneNome || wizardData.destinazione,
        DURATA_GIORNI: totalDays,
        BUDGET_CATEGORIA: wizardData.budget || 'medium',
        COSTO_TOTALE_PP: costs.perPerson,
        GENERE: wizardData.tipoViaggio || 'privato',
        STATO: 'aperto',
        NUM_PERSONE: wizardData.numeroPersone,
        DATA_PARTENZA: wizardData.dataPartenza,
        IMMAGINE: heroImage,
        ESPERIENZE: filledBlocks.map(b => b.experience?.nome).filter(Boolean),
        HOTEL: selectedHotels.map(h => h.hotel?.ZONA).filter(Boolean),
        createdAt: new Date().toISOString(),
        publishedBy: 'user' // In futuro collegare all'utente reale
      };

      existingTrips.push(publishedTrip);
      localStorage.setItem(EXPLORE_TRIPS_KEY, JSON.stringify(existingTrips));

      setIsPublished(true);

      toast.success('🎉 Viaggio pubblicato con successo!', {
        description: 'Il tuo viaggio è ora visibile nella sezione Esplora',
        duration: 5000
      });

      // Opzionale: dopo 2 secondi naviga alla sezione esplora
      setTimeout(() => {
        navigate('/explore');
      }, 2000);
    } catch (error) {
      console.error('Errore pubblicazione viaggio:', error);
      toast.error('Errore nella pubblicazione del viaggio');
    } finally {
      setPublishing(false);
    }
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

      {/* Hero Image */}
      <div className={styles.heroSection}>
        <img
          src={heroImage}
          alt={wizardData.destinazioneNome || wizardData.destinazione}
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
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
      </div>

      {/* Experience Images Gallery */}
      {experienceImages.length > 0 && (
        <div className={styles.gallerySection}>
          <div className={styles.galleryGrid}>
            {experienceImages.map((imgUrl, index) => (
              <div key={index} className={styles.galleryItem}>
                <img
                  src={imgUrl}
                  alt={`Esperienza ${index + 1}`}
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
                        €{(parseFloat(exp.prezzo) || 0).toFixed(2)}
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
                        €{(parseFloat(hotel.PREZZO) || 0).toFixed(2)} / notte
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
              {costs.accessories > 0 && (
                <div className={styles.costRow}>
                  <span>Costi Accessori</span>
                  <span className={styles.costValue}>€{costs.accessories.toFixed(2)}</span>
                </div>
              )}
              {costs.accessoriesItems && costs.accessoriesItems.length > 0 && (
                <div className={styles.accessoriesDetail}>
                  {costs.accessoriesItems.map((item, idx) => (
                    <div key={idx} className={styles.accessoryItem}>
                      <span className={styles.accessoryLabel}>
                        • {item.tipo}: {item.descrizione}
                      </span>
                      <span className={styles.accessoryValue}>
                        €{item.costo.toFixed(2)}
                      </span>
                    </div>
                  ))}
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
                  <button className={styles.exportOption} onClick={() => handleExport('pdf')}>
                    📕 Scarica PDF
                  </button>
                </div>
              )}
            </div>

            <Button variant="outline" onClick={handleSaveTrip} disabled={saving}>
              {saving ? 'Salvataggio...' : '💾 Salva Viaggio'}
            </Button>

            <Button
              variant="outline"
              onClick={handlePublishTrip}
              disabled={publishing || isPublished}
              style={{
                background: isPublished ? '#10b981' : 'transparent',
                color: isPublished ? 'white' : '#667eea',
                borderColor: isPublished ? '#10b981' : '#667eea'
              }}
            >
              {publishing ? '⏳ Pubblicazione...' : isPublished ? '✓ Pubblicato' : '🌍 Pubblica'}
            </Button>

            <Button variant="primary" onClick={handleProceedToPayment} size="lg">
              💳 Procedi al Pagamento
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          tripData={{
            id: Date.now().toString(),
            name: `${wizardData.destinazioneNome || wizardData.destinazione}`,
            destination: wizardData.destinazioneNome || wizardData.destinazione,
            dates: wizardData.dataPartenza ? `Dal ${new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}` : undefined,
            participants: wizardData.numeroPersone,
            costs
          }}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}

export default TripSummary;
