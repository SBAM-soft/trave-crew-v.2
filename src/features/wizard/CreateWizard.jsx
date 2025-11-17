import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useWizardStore from '../../store/useWizardStore';
import WizardProgress from './WizardProgress';
import Step1_Destinazione from './Step1_Destinazione';
import Step2_NumeroPersone from './Step2_NumeroPersone';
import Step3_Budget from './Step3_Budget';
import Step4_Interessi from './Step4_Interessi';
import Step5_DataPartenza from './Step5_DataPartenza';
import styles from './CreateWizard.module.css';

function CreateWizard() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Zustand store - eliminates props drilling and manual localStorage
  const {
    destinazione,
    destinazioneNome,
    numeroPersone,
    tipoViaggio,
    etaRange,
    genere,
    budget,
    interessi,
    dataPartenza,
    numeroNotti,
    currentStep,
    setDestinazione,
    setNumeroPersone,
    setTipoViaggio,
    setEtaRange,
    setGenere,
    setBudget,
    setInteressi,
    setDataPartenza,
    setNumeroNotti,
    setCurrentStep,
    getWizardData,
    resetWizard,
  } = useWizardStore();

  const [errors, setErrors] = useState({});

  // Reset wizard all'inizio per creare un nuovo viaggio da zero
  useEffect(() => {
    console.log('🔄 Reset wizard per nuovo viaggio');
    resetWizard();
  }, []); // Esegue solo al mount

  // Scroll to top quando cambia step
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  const updateWizardData = (field, value) => {
    // Update via Zustand store based on field
    switch (field) {
      case 'numeroPersone':
        setNumeroPersone(value);
        break;
      case 'tipoViaggio':
        setTipoViaggio(value);
        break;
      case 'etaRange':
        setEtaRange(value);
        break;
      case 'genere':
        setGenere(value);
        break;
      default:
        break;
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Scroll down leggermente dopo selezione
    setTimeout(() => {
      window.scrollBy({ top: 150, behavior: 'smooth' });
    }, 100);
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!destinazione) {
          newErrors.destinazione = 'Seleziona una destinazione';
        }
        break;

      case 2:
        if (!numeroPersone || numeroPersone < 1) {
          newErrors.numeroPersone = 'Indica il numero di persone';
        }
        if (tipoViaggio === 'pubblico') {
          if (etaRange.length === 0) {
            newErrors.etaRange = "Seleziona almeno una fascia d'età";
          }
          if (!genere) {
            newErrors.genere = 'Seleziona la composizione del gruppo';
          }
        }
        break;

      case 3:
        break;

      case 4:
        if (interessi.length === 0) {
          newErrors.interessi = 'Seleziona almeno un interesse';
        }
        break;

      case 5:
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 5) {
      const wizardData = getWizardData();
      console.log('✅ Wizard completato:', wizardData);
      navigate('/trip-editor', { state: { wizardData } });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_Destinazione
            value={destinazione}
            destinazione={destinazioneNome}
            onChange={(id, nome) => {
              setDestinazione(id, nome);
              // Clear error
              if (errors.destinazione) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.destinazione;
                  return newErrors;
                });
              }
            }}
            error={errors.destinazione}
          />
        );

      case 2:
        return (
          <Step2_NumeroPersone
            numeroPersone={numeroPersone}
            tipoViaggio={tipoViaggio}
            etaRange={etaRange}
            genere={genere}
            onChange={updateWizardData}
            errors={errors}
          />
        );

      case 3:
        return (
          <Step3_Budget
            value={budget}
            onChange={(budgetValue) => setBudget(budgetValue)}
          />
        );
      
      case 4:
        return (
          <Step4_Interessi
            value={interessi}
            onChange={(interessiValue) => {
              setInteressi(interessiValue);
              // Clear error
              if (errors.interessi) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.interessi;
                  return newErrors;
                });
              }
            }}
            error={errors.interessi}
          />
        );

      case 5:
        return (
          <Step5_DataPartenza
            value={dataPartenza}
            onChange={(data) => setDataPartenza(data)}
            destinazione={destinazione}
            numeroNotti={numeroNotti}
            onNumeroNottiChange={(notti) => setNumeroNotti(notti)}
          />
        );

      default:
        return null;
    }
  };

  // Componente Navigazione riusabile
  const NavigationButtons = () => (
    <div className={styles.navigation}>
      {currentStep > 1 && (
        <button 
          onClick={goBack}
          className={styles.btnBack}
        >
          ← Indietro
        </button>
      )}
      
      <button 
        onClick={goNext}
        className={styles.btnNext}
      >
        {currentStep === 5 ? 'Crea Viaggio 🚀' : 'Avanti →'}
      </button>
    </div>
  );

  return (
    <div className={styles.wizard}>
      <div className={styles.container} ref={containerRef}>
        <WizardProgress currentStep={currentStep} totalSteps={5} />

        {/* Navigazione TOP */}
        <NavigationButtons />

        <div className={styles.stepContainer}>
          {renderStep()}
        </div>

        {/* Navigazione BOTTOM */}
        <NavigationButtons />
      </div>
    </div>
  );
}

export default CreateWizard;