import styles from './WizardProgress.module.css';

function WizardProgress({ currentStep, totalSteps }) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className={styles.progress}>
      <div className={styles.steps}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
          <div 
            key={step}
            className={`${styles.step} ${
              step < currentStep ? styles.completed :
              step === currentStep ? styles.active :
              styles.upcoming
            }`}
          >
            <div className={styles.stepCircle}>
              {step < currentStep ? '✓' : step}
            </div>
            <div className={styles.stepLabel}>
              {getStepLabel(step)}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getStepLabel(step) {
  const labels = {
    1: 'Destinazione',
    2: 'Partecipanti',
    3: 'Budget',
    4: 'Interessi',
    5: 'Data'
  };
  return labels[step];
}

export default WizardProgress;