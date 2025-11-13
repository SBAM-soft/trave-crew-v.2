import styles from './HowItWorks.module.css';

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '🎯',
      title: 'Crea il tuo viaggio',
      description: 'Scegli la destinazione, le date, il budget e i tuoi interessi. Il wizard ti guida passo dopo passo.'
    },
    {
      number: '02',
      icon: '🗺️',
      title: 'Personalizza l\'itinerario',
      description: 'Esplora pacchetti esperienza, seleziona le attività che ti piacciono e costruisci il viaggio perfetto.'
    },
    {
      number: '03',
      icon: '✈️',
      title: 'Parti insieme',
      description: 'Invita gli amici, votate le modifiche insieme e partite per un\'avventura indimenticabile!'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Come funziona</h2>
          <p className={styles.subtitle}>
            Organizza il tuo viaggio in 3 semplici passi
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={styles.stepCard}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.arrow}>
          <svg
            className={styles.arrowSvg}
            viewBox="0 0 100 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 10 L 90 10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
            <polygon
              points="90,5 100,10 90,15"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
