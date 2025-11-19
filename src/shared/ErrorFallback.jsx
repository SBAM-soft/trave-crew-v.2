import { useNavigate } from 'react-router-dom';
import Button from './Button';
import styles from './ErrorFallback.module.css';

/**
 * Componente riutilizzabile per mostrare errori con azioni
 */
function ErrorFallback({ error, onRetry, showHomeButton = true }) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (error?.actionPath) {
      navigate(error.actionPath);
    }
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorIcon}>
          {error?.icon || '⚠️'}
        </div>

        <h2 className={styles.errorTitle}>
          {error?.title || 'Si è verificato un errore'}
        </h2>

        <p className={styles.errorMessage}>
          {error?.message || 'Qualcosa è andato storto'}
        </p>

        {error?.description && (
          <p className={styles.errorDescription}>
            {error.description}
          </p>
        )}

        <div className={styles.errorActions}>
          {(onRetry || error?.actionPath) && (
            <Button onClick={handleRetry} variant="primary">
              {error?.actionLabel || 'Riprova'}
            </Button>
          )}

          {showHomeButton && (
            <Button onClick={() => navigate('/')} variant="outline">
              Torna alla Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
