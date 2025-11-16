import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { loadCSV } from '../../core/utils/dataLoader';
import { groupHotelsByZoneAndBudget, getHotelExtras } from '../../core/utils/itinerarioHelpers';
import { saveTripComplete } from '../../core/utils/tripStorage';
import HotelCard from '../trip-editor/HotelCard';
import Button from '../../shared/Button';
import styles from './HotelSelectionPage.module.css';

function HotelSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dati dalla navigazione
  const {
    wizardData = {},
    filledBlocks = [],
    totalDays = 7,
    zoneVisitate = [],
    itinerario = null,
    costiAccessori = [],
    extraSuggeriti = [],
    plus = []
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [groupedHotels, setGroupedHotels] = useState({});
  const [plusDB, setPlusDB] = useState(plus);

  // State per selezioni hotel (un hotel per zona)
  // { zonaNome: { hotel: {...}, extras: [codiceExtra1, codiceExtra2...] } }
  const [selections, setSelections] = useState({});

  // State per extra panel aperto
  const [activeExtraZone, setActiveExtraZone] = useState(null);

  // Carica dati hotel
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Carica hotel e plus (se non già passati)
        const [hotelsData, plusData] = await Promise.all([
          loadCSV('hotel.csv'),
          plusDB.length > 0 ? Promise.resolve(plusDB) : loadCSV('plus.csv')
        ]);

        // Filtra hotel per destinazione
        const destInput = (wizardData.destinazioneNome || wizardData.destinazione || '').toLowerCase().trim();
        const destHotels = hotelsData.filter(h =>
          h.DESTINAZIONE?.toLowerCase().trim() === destInput
        );

        setHotels(destHotels);
        setPlusDB(plusData);

        // Raggruppa hotel per zona e budget
        const grouped = groupHotelsByZoneAndBudget(destHotels, zoneVisitate);

        setGroupedHotels(grouped);

        // Inizializza selezioni vuote per ogni zona (usa UPPERCASE come chiave)
        const initialSelections = {};
        zoneVisitate.forEach(zona => {
          const zonaKey = zona.nome.toUpperCase().trim();
          initialSelections[zonaKey] = {
            hotel: null,
            extras: []
          };
        });
        setSelections(initialSelections);

        setLoading(false);
      } catch (err) {
        console.error('❌ Errore caricamento dati:', err);
        toast.error('Errore nel caricamento degli hotel');
        setLoading(false);
      }
    };

    if (zoneVisitate.length > 0) {
      loadData();
    } else {
      console.warn('⚠️ Nessuna zona visitata trovata!');
      toast.error('Errore: nessuna zona visitata trovata');
      setLoading(false);
    }
  }, []);

  // Handler selezione hotel per zona
  const handleSelectHotel = (zonaNome, hotel) => {
    setSelections(prev => ({
      ...prev,
      [zonaNome]: {
        ...prev[zonaNome],
        hotel: hotel
      }
    }));

    toast.success(`Hotel selezionato per ${zonaNome}`, {
      description: hotel.ZONA
    });
  };

  // Handler toggle extra
  const handleToggleExtra = (zonaNome, extraCodice) => {
    setSelections(prev => {
      const currentExtras = prev[zonaNome].extras || [];
      const newExtras = currentExtras.includes(extraCodice)
        ? currentExtras.filter(e => e !== extraCodice)
        : [...currentExtras, extraCodice];

      return {
        ...prev,
        [zonaNome]: {
          ...prev[zonaNome],
          extras: newExtras
        }
      };
    });
  };

  // Handler conferma e procedi
  const handleConfirm = () => {
    // Verifica che tutti gli hotel siano selezionati
    const allSelected = Object.keys(selections).every(
      zonaKey => selections[zonaKey].hotel !== null
    );

    if (!allSelected) {
      toast.warning('Seleziona un hotel per ogni zona prima di continuare');
      return;
    }

    // Converti selections in formato più compatto (zonaKey è già UPPERCASE)
    const selectedHotels = Object.entries(selections).map(([zonaKey, data]) => ({
      zona: zonaKey, // Usa la chiave UPPERCASE
      hotel: data.hotel,
      extras: data.extras.map(extraCode => {
        return plusDB.find(p => p.CODICE === extraCode);
      }).filter(e => e !== undefined)
    }));

    // Naviga alla timeline/salvataggio con tutti i dati
    navigate('/timeline-editor', {
      state: {
        wizardData,
        filledBlocks,
        totalDays,
        zoneVisitate,
        selectedHotels,
        itinerario,
        costiAccessori,
        extraSuggeriti
      }
    });

    toast.success('Selezione completata!');
  };

  // Handler salva come bozza
  const handleSaveAsDraft = () => {
    // Converti selections in formato compatto (zonaKey è già UPPERCASE)
    const selectedHotels = Object.entries(selections)
      .filter(([_, data]) => data.hotel !== null)
      .map(([zonaKey, data]) => ({
        zona: zonaKey, // Usa la chiave UPPERCASE
        hotel: data.hotel,
        extras: data.extras.map(extraCode => {
          return plusDB.find(p => p.CODICE === extraCode);
        }).filter(e => e !== undefined)
      }));

    // Prepara i dati del viaggio
    const tripData = {
      wizardData,
      filledBlocks,
      giorni: totalDays,
      zoneVisitate,
      selectedHotels,
      itinerario,
      costiAccessori,
      extraSuggeriti
    };

    // Salva come bozza (categoria 'saved')
    const saved = saveTripComplete(tripData, 'saved');

    if (saved) {
      toast.success('Bozza salvata!', {
        description: 'Puoi riprendere la modifica da "I miei viaggi"'
      });

      // Naviga ai miei viaggi
      setTimeout(() => {
        navigate('/my-trips');
      }, 1500);
    } else {
      toast.error('Errore nel salvataggio della bozza');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Caricamento hotel disponibili...</p>
      </div>
    );
  }

  if (zoneVisitate.length === 0) {
    return (
      <div className={styles.error}>
        <h2>⚠️ Errore</h2>
        <p>Nessuna zona visitata trovata. Torna al Trip Editor.</p>
        <Button onClick={() => navigate(-1)}>← Torna indietro</Button>
      </div>
    );
  }

  return (
    <div className={styles.hotelSelectionPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.phaseIndicator}>
            <span className={styles.phaseNumber}>Fase 2/3</span>
            <div className={styles.phaseSteps}>
              <div className={styles.stepCompleted}>✓ Itinerario</div>
              <div className={styles.stepActive}>🏨 Hotel</div>
              <div className={styles.stepPending}>📋 Riepilogo</div>
            </div>
          </div>
          <h1 className={styles.title}>Scegli gli Hotel</h1>
          <p className={styles.subtitle}>
            {wizardData.destinazione} • {totalDays} giorni • {wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}
          </p>
          <p className={styles.zoneInfo}>
            🗺️ Zone da visitare: {zoneVisitate.map(z => z.nome).join(', ')}
          </p>
        </div>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Torna all'itinerario
        </button>
      </div>

      {/* Contenuto principale */}
      <div className={styles.content}>
        {/* Sezioni per zona */}
        {zoneVisitate.map((zona, index) => {
          const zonaKey = zona.nome.toUpperCase().trim(); // Usa UPPERCASE come chiave
          const zoneHotels = groupedHotels[zonaKey] || {};
          const hasLow = zoneHotels.LOW !== null;
          const hasMedium = zoneHotels.MEDIUM !== null;
          const hasHigh = zoneHotels.HIGH !== null;
          const selectedHotel = selections[zonaKey]?.hotel;
          const selectedExtras = selections[zonaKey]?.extras || [];

          return (
            <section key={zona.codice} className={styles.zoneSection}>
              <div className={styles.zoneSectionHeader}>
                <h2 className={styles.zoneTitle}>
                  {index + 1}. {zona.nome}
                </h2>
                <p className={styles.zoneSubtitle}>
                  Seleziona un hotel tra le 3 opzioni disponibili
                </p>
              </div>

              <div className={styles.budgetOptions}>
                {/* Budget LOW */}
                {hasLow && (
                  <div className={styles.budgetColumn}>
                    <div className={styles.budgetHeader}>
                      <span className={styles.budgetBadge} style={{ backgroundColor: '#10b981' }}>
                        € Budget
                      </span>
                    </div>
                    <HotelCard
                      hotel={zoneHotels.LOW}
                      onSelect={() => handleSelectHotel(zonaKey, zoneHotels.LOW)}
                      isSelected={selectedHotel?.CODICE === zoneHotels.LOW.CODICE}
                    />
                  </div>
                )}

                {/* Budget MEDIUM */}
                {hasMedium && (
                  <div className={styles.budgetColumn}>
                    <div className={styles.budgetHeader}>
                      <span className={styles.budgetBadge} style={{ backgroundColor: '#f59e0b' }}>
                        €€ Medio
                      </span>
                    </div>
                    <HotelCard
                      hotel={zoneHotels.MEDIUM}
                      onSelect={() => handleSelectHotel(zonaKey, zoneHotels.MEDIUM)}
                      isSelected={selectedHotel?.CODICE === zoneHotels.MEDIUM.CODICE}
                    />
                  </div>
                )}

                {/* Budget HIGH */}
                {hasHigh && (
                  <div className={styles.budgetColumn}>
                    <div className={styles.budgetHeader}>
                      <span className={styles.budgetBadge} style={{ backgroundColor: '#ef4444' }}>
                        €€€ Lusso
                      </span>
                    </div>
                    <HotelCard
                      hotel={zoneHotels.HIGH}
                      onSelect={() => handleSelectHotel(zonaKey, zoneHotels.HIGH)}
                      isSelected={selectedHotel?.CODICE === zoneHotels.HIGH.CODICE}
                    />
                  </div>
                )}

                {!hasLow && !hasMedium && !hasHigh && (
                  <div className={styles.noHotels}>
                    <p>Nessun hotel disponibile per {zona.nome}</p>
                  </div>
                )}
              </div>

              {/* Extra hotel */}
              {selectedHotel && (
                <div className={styles.extrasSection}>
                  <div className={styles.extrasHeader}>
                    <h3 className={styles.extrasTitle}>✨ Extra disponibili per questo hotel</h3>
                    <button
                      className={styles.extrasToggle}
                      onClick={() => setActiveExtraZone(activeExtraZone === zonaKey ? null : zonaKey)}
                    >
                      {activeExtraZone === zonaKey ? '▲ Nascondi' : '▼ Mostra extra'}
                    </button>
                  </div>

                  {activeExtraZone === zonaKey && (() => {
                    const extras = getHotelExtras(selectedHotel, plusDB);

                    if (extras.length === 0) {
                      return (
                        <div className={styles.noExtras}>
                          <p>Nessun extra disponibile per questo hotel</p>
                        </div>
                      );
                    }

                    return (
                      <div className={styles.extrasGrid}>
                        {extras.map(extra => (
                          <div
                            key={extra.CODICE}
                            className={`${styles.extraCard} ${selectedExtras.includes(extra.CODICE) ? styles.selected : ''}`}
                            onClick={() => handleToggleExtra(zonaKey, extra.CODICE)}
                          >
                            <div className={styles.extraHeader}>
                              <span className={styles.extraIcon}>{extra.ICON || '✨'}</span>
                              <div className={styles.extraInfo}>
                                <h4 className={styles.extraName}>{extra.PLUS}</h4>
                                <p className={styles.extraCategory}>{extra.CATEGORIA}</p>
                              </div>
                              <div className={styles.extraCheckbox}>
                                <input
                                  type="checkbox"
                                  checked={selectedExtras.includes(extra.CODICE)}
                                  onChange={() => {}}
                                />
                              </div>
                            </div>
                            <p className={styles.extraDescription}>{extra.DESCRIZIONE}</p>
                            <div className={styles.extraFooter}>
                              <span className={styles.extraPrice}>
                                €{extra.PRZ_PAX_GEN || extra.PRZ_PAX_FEB || 0} / persona
                              </span>
                              {extra.POPOLARITA && (
                                <span className={styles.extraPopularity}>
                                  {extra.POPOLARITA === 'alta' ? '🔥 Popolare' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Footer fisso */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            {Object.values(selections).filter(s => s.hotel !== null).length === zoneVisitate.length ? (
              <>
                <span className={styles.selectedLabel}>✓ Tutti gli hotel selezionati</span>
                <span className={styles.selectedCount}>
                  {Object.values(selections).reduce((acc, s) => acc + s.extras.length, 0)} extra aggiunti
                </span>
              </>
            ) : (
              <span className={styles.selectedLabel}>
                {Object.values(selections).filter(s => s.hotel !== null).length} / {zoneVisitate.length} hotel selezionati
              </span>
            )}
          </div>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={handleSaveAsDraft}>
              💾 Salva bozza
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              ← Indietro
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={Object.values(selections).filter(s => s.hotel !== null).length !== zoneVisitate.length}
              size="lg"
            >
              Conferma e Continua →
            </Button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default HotelSelectionPage;
