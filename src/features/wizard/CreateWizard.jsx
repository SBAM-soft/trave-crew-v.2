import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationGuard from '../../hooks/useNavigationGuard';
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
  
  const [wizardData, setWizardData] = useState(() => {
    const saved = localStorage.getItem('wizardData');
    return saved ? JSON.parse(saved) : {
      stato_id: null,
      destinazione: '',
      numeroPersone: 1,
      tipoViaggio: 'privato',
      etaRange: [], // Array vuoto per multi-select
      genere: 'misto',
      budget: '',
      interessi: [],
      dataPartenza: null
    };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Protezione navigazione - avvisa se l'utente ha iniziato a compilare il wizard
  const hasStartedWizard = currentStep > 1 || wizardData.stato_id !== null;
  useNavigationGuard(
    hasStartedWizard,
    'Sei sicuro di voler uscire? I dati inseriti nel wizard andranno persi.'
  );

  // Scroll to top quando cambia step
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('wizardData', JSON.stringify(wizardData));
  }, [wizardData]);

  const updateWizardData = (field, value) => {
    setWizardData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
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

    switch(step) {
      case 1:
        if (!wizardData.stato_id) {
          newErrors.stato_id = 'Seleziona una destinazione';
        }
        break;
      
      case 2:
        if (!wizardData.numeroPersone || wizardData.numeroPersone < 1) {
          newErrors.numeroPersone = 'Indica il numero di persone';
        }
        if (wizardData.tipoViaggio === 'pubblico') {
          if (wizardData.etaRange.length === 0) {
            newErrors.etaRange = 'Seleziona almeno una fascia d\'età';
          }
          if (!wizardData.genere) {
            newErrors.genere = 'Seleziona la composizione del gruppo';
          }
        }
        break;
      
      case 3:
        break;
      
      case 4:
        if (wizardData.interessi.length === 0) {
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
      console.log('✅ Wizard completato:', wizardData);
      navigate('/trip-editor', { state: { wizardData } });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <Step1_Destinazione
            value={wizardData.stato_id}
            destinazione={wizardData.destinazione}
            onChange={(id, nome) => {
              updateWizardData('stato_id', id);
              updateWizardData('destinazione', nome);
            }}
            error={errors.stato_id}
          />
        );
      
      case 2:
        return (
          <Step2_NumeroPersone
            numeroPersone={wizardData.numeroPersone}
            tipoViaggio={wizardData.tipoViaggio}
            etaRange={wizardData.etaRange}
            genere={wizardData.genere}
            onChange={updateWizardData}
            errors={errors}
          />
        );
      
      case 3:
        return (
          <Step3_Budget
            value={wizardData.budget}
            onChange={(budget) => updateWizardData('budget', budget)}
          />
        );
      
      case 4:
        return (
          <Step4_Interessi
            value={wizardData.interessi}
            onChange={(interessi) => updateWizardData('interessi', interessi)}
            error={errors.interessi}
          />
        );
      
      case 5:
        return (
          <Step5_DataPartenza
            value={wizardData.dataPartenza}
            onChange={(data) => updateWizardData('dataPartenza', data)}
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