import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './AnimazioneAI.module.css';

/**
 * Animazione "fake AI" che simula l'ottimizzazione dell'itinerario
 * Mostra un processo di elaborazione per rendere l'esperienza più coinvolgente
 */
function AnimazioneAI({ onComplete, tripData }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: '🗺️', message: 'Analisi delle zone da visitare...' },
    { icon: '🚗', message: 'Ottimizzazione percorso tra le tappe...' },
    { icon: '⏱️', message: 'Calcolo tempi di spostamento...' },
    { icon: '🏨', message: 'Ricerca hotel nelle zone ottimali...' },
    { icon: '💰', message: 'Analisi costi e disponibilità...' },
    { icon: '✨', message: 'Finalizzazione itinerario perfetto!' }
  ];

  useEffect(() => {
    // Simula progresso con step incrementali
    const totalDuration = 4000; // 4 secondi totali
    const stepDuration = totalDuration / steps.length;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return prev + (100 / (totalDuration / 50));
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [onComplete, steps.length]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Icona animata */}
          <div className={styles.iconContainer}>
            <div className={styles.spinnerOuter}>
              <div className={styles.spinnerInner}></div>
            </div>
            <span className={styles.mainIcon}>🤖</span>
          </div>

          {/* Titolo */}
          <h2 className={styles.title}>Ottimizzazione in corso...</h2>

          {/* Step corrente */}
          <div className={styles.stepContainer}>
            <span className={styles.stepIcon}>{steps[currentStep].icon}</span>
            <p className={styles.stepMessage}>{steps[currentStep].message}</p>
          </div>

          {/* Barra di progresso */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>{Math.round(progress)}%</p>

          {/* Info viaggio */}
          {tripData && (
            <div className={styles.tripInfo}>
              <p className={styles.infoItem}>
                📍 {tripData.wizardData?.destinazione || 'Destinazione'}
              </p>
              <p className={styles.infoItem}>
                🗓️ {tripData.totalDays || 7} giorni
              </p>
              <p className={styles.infoItem}>
                👥 {tripData.wizardData?.numeroPersone || 1} {tripData.wizardData?.numeroPersone === 1 ? 'persona' : 'persone'}
              </p>
            </div>
          )}

          {/* Lista step completati */}
          <div className={styles.stepsList}>
            {steps.map((step, index) => (
              <div
                key={index}
                className={`${styles.stepItem} ${
                  index < currentStep ? styles.completed :
                  index === currentStep ? styles.active :
                  styles.pending
                }`}
              >
                <span className={styles.stepCheckbox}>
                  {index < currentStep ? '✓' : index === currentStep ? '⏳' : '○'}
                </span>
                <span className={styles.stepLabel}>{step.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

AnimazioneAI.propTypes = {
  onComplete: PropTypes.func.isRequired,
  tripData: PropTypes.shape({
    wizardData: PropTypes.object,
    totalDays: PropTypes.number,
  })
};

export default AnimazioneAI;
