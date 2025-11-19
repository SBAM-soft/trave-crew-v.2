import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ItineraryBuildingAnimation.module.css';

/**
 * Animazione mostrata durante la creazione dell'itinerario
 * Durata: 3 secondi
 */
function ItineraryBuildingAnimation({ tripData, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: '🗺️', message: 'Analizzando le zone selezionate...' },
    { icon: '✨', message: 'Organizzando le esperienze...' },
    { icon: '📅', message: 'Ottimizzando l\'ordine dei giorni...' },
    { icon: '🎯', message: 'Creando il tuo itinerario perfetto...' }
  ];

  const totalDuration = 3000; // 3 secondi

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Call onComplete dopo un breve delay
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + (100 / (totalDuration / 50)); // Update every 50ms
      });
    }, 50);

    // Steps animation
    const stepDuration = totalDuration / steps.length;
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
  }, [onComplete, steps.length, totalDuration]);

  const experienceCount = tripData?.filledBlocks?.length || 0;
  const zoneCount = tripData?.selectedZones?.filter(z => !z.isTransit)?.length || 0;
  const totalDays = tripData?.totalDays || 7;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Icon animato */}
          <div className={styles.iconContainer}>
            <div className={styles.spinnerOuter}>
              <div className={styles.spinnerInner}></div>
            </div>
            <span className={styles.mainIcon}>🎉</span>
          </div>

          {/* Titolo */}
          <h2 className={styles.title}>Sto creando il tuo itinerario...</h2>

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
          <div className={styles.tripInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🗺️</span>
              <span className={styles.infoText}>{zoneCount} {zoneCount === 1 ? 'zona' : 'zone'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>✨</span>
              <span className={styles.infoText}>{experienceCount} {experienceCount === 1 ? 'esperienza' : 'esperienze'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>📅</span>
              <span className={styles.infoText}>{totalDays} giorni</span>
            </div>
          </div>

          {/* Check list degli step */}
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

ItineraryBuildingAnimation.propTypes = {
  tripData: PropTypes.shape({
    filledBlocks: PropTypes.array,
    selectedZones: PropTypes.array,
    totalDays: PropTypes.number
  }),
  onComplete: PropTypes.func
};

export default ItineraryBuildingAnimation;
