import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../shared/Button';
import DayTimeline from './DayTimeline';
import styles from './TimelineEditor.module.css';

function TimelineEditor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera dati dal TripEditor
  const tripData = location.state || {
    wizardData: { destinazione: 'Destinazione', numeroPersone: 2 },
    filledBlocks: [],
    totalDays: 7
  };

  const { wizardData, filledBlocks, totalDays } = tripData;

  // State
  const [timeline, setTimeline] = useState([]);
  const [showCostSummary, setShowCostSummary] = useState(false);

  // Costruisci timeline completa
  useEffect(() => {
    buildTimeline();
  }, [filledBlocks, totalDays]);

  const buildTimeline = () => {
    const days = [];

    // Giorno 1 - Arrivo
    days.push({
      dayNumber: 1,
      type: 'arrival',
      title: '✈️ Arrivo',
      description: `Arrivo a ${wizardData.destinazione}. Sistemazione in hotel e relax.`,
      experiences: [],
      notes: 'Check-in hotel, orientamento nella zona'
    });

    // Giorni con esperienze
    for (let i = 2; i <= totalDays; i++) {
      const block = filledBlocks.find(b =>
        typeof b === 'object' ? b.day === i : b === i
      );

      if (block && typeof block === 'object' && block.experience) {
        days.push({
          dayNumber: i,
          type: 'experience',
          title: `Giorno ${i}`,
          experiences: [block.experience],
          packageName: block.packageName || '',
          notes: ''
        });
      } else if (block) {
        days.push({
          dayNumber: i,
          type: 'free',
          title: `Giorno ${i}`,
          description: 'Giorno libero o esperienza da definire',
          experiences: [],
          notes: ''
        });
      } else {
        days.push({
          dayNumber: i,
          type: 'empty',
          title: `Giorno ${i}`,
          description: 'Da pianificare',
          experiences: [],
          notes: ''
        });
      }
    }

    setTimeline(days);
  };

  // Calcola costo totale
  const calculateTotalCost = () => {
    let total = 0;
    timeline.forEach(day => {
      if (day.experiences && day.experiences.length > 0) {
        day.experiences.forEach(exp => {
          total += exp.prezzo || 0;
        });
      }
    });
    return total;
  };

  // Handler aggiungi nota
  const handleAddNote = (dayNumber, note) => {
    setTimeline(timeline.map(day =>
      day.dayNumber === dayNumber ? { ...day, notes: note } : day
    ));
  };

  // Handler torna indietro
  const handleBack = () => {
    navigate(-1);
  };

  // Handler condividi/esporta
  const handleExport = () => {
    alert('Funzionalità esportazione in arrivo!\nPotrai esportare in PDF, condividere via link, o salvare sul tuo account.');
  };

  const totalCost = calculateTotalCost();
  const experienceDays = timeline.filter(d => d.type === 'experience').length;

  return (
    <div className={styles.timelineEditor}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            ← Torna al Trip Editor
          </button>
          <h1 className={styles.title}>
            🗺️ Il tuo Itinerario: {wizardData.destinazione}
          </h1>
          <p className={styles.subtitle}>
            {totalDays} giorni • {experienceDays} esperienze • {wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => setShowCostSummary(!showCostSummary)}>
            💰 Riepilogo Costi
          </Button>
          <Button variant="primary" onClick={handleExport}>
            📤 Esporta Itinerario
          </Button>
        </div>
      </div>

      {/* Cost Summary (collapsible) */}
      {showCostSummary && (
        <div className={styles.costSummary}>
          <div className={styles.costSummaryContent}>
            <h3>💰 Riepilogo Costi</h3>
            <div className={styles.costBreakdown}>
              <div className={styles.costRow}>
                <span>Esperienze ({experienceDays})</span>
                <span className={styles.costValue}>€{totalCost.toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Per persona</span>
                <span className={styles.costValue}>€{(totalCost).toFixed(2)}</span>
              </div>
              <div className={styles.costRow}>
                <span>Totale gruppo ({wizardData.numeroPersone} {wizardData.numeroPersone === 1 ? 'persona' : 'persone'})</span>
                <span className={styles.costValueTotal}>€{(totalCost * wizardData.numeroPersone).toFixed(2)}</span>
              </div>
            </div>
            <p className={styles.costNote}>
              ℹ️ Costi indicativi. Non includono voli, hotel, pasti non specificati.
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className={styles.timeline}>
        {timeline.map((day, index) => (
          <DayTimeline
            key={day.dayNumber}
            day={day}
            isFirst={index === 0}
            isLast={index === timeline.length - 1}
            onAddNote={handleAddNote}
          />
        ))}
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerInfo}>
            <h3>✅ Itinerario Completato - Fase 1/2</h3>
            <p>
              Le esperienze del tuo viaggio a {wizardData.destinazione} sono pronte!<br/>
              Procedi ora alla Fase 2 per scegliere il tuo hotel e completare la prenotazione.
            </p>
          </div>
          <div className={styles.footerActions}>
            <Button variant="outline" onClick={handleBack}>
              ← Modifica Esperienze
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/hotel-selector', { state: tripData })}
              size="lg"
            >
              🏨 Fase 2: Scegli Hotel →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineEditor;
