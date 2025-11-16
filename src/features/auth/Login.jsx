import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../shared/Button';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cognome: '',
    confermPassword: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          toast.error('Inserisci email e password');
          return;
        }

        const result = await login(formData.email, formData.password);

        if (result.success) {
          toast.success(`Benvenuto ${result.user.nome || result.user.email}!`);
          setTimeout(() => navigate('/profile'), 1000);
        } else {
          toast.error(result.error || 'Errore durante il login');
        }
      } else {
        // Registrazione
        if (!formData.email || !formData.password || !formData.nome) {
          toast.error('Compila tutti i campi obbligatori');
          return;
        }

        if (formData.password !== formData.confermPassword) {
          toast.error('Le password non coincidono');
          return;
        }

        const nomeCompleto = formData.cognome
          ? `${formData.nome} ${formData.cognome}`
          : formData.nome;

        const result = await register(formData.email, formData.password, nomeCompleto);

        if (result.success) {
          toast.success(`Benvenuto ${result.user.nome}!`);
          setTimeout(() => navigate('/profile'), 1000);
        } else {
          toast.error(result.error || 'Errore durante la registrazione');
        }
      }
    } catch (error) {
      toast.error('Si è verificato un errore imprevisto');
      console.error('Errore auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implementare OAuth con provider esterni
    toast.info(`Login con ${provider} in arrivo presto!`, {
      description: 'Questa funzionalità sarà disponibile nella prossima versione'
    });
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        {/* Left Side - Image/Branding */}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <h1 className={styles.brandTitle}>Travel Crew</h1>
            <p className={styles.brandSubtitle}>
              Crea viaggi indimenticabili con esperienze personalizzate
            </p>
            <div className={styles.brandFeatures}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🗺️</span>
                <span>Itinerari personalizzati</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>⭐</span>
                <span>Esperienze autentiche</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>👥</span>
                <span>Viaggi di gruppo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.formSide}>
          <div className={styles.formContainer}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${isLogin ? styles.active : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Accedi
              </button>
              <button
                className={`${styles.tab} ${!isLogin ? styles.active : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Registrati
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {!isLogin && (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Nome</label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        className={styles.input}
                        placeholder="Mario"
                        required={!isLogin}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Cognome</label>
                      <input
                        type="text"
                        value={formData.cognome}
                        onChange={(e) => handleChange('cognome', e.target.value)}
                        className={styles.input}
                        placeholder="Rossi"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={styles.input}
                  placeholder="mario.rossi@email.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Conferma Password</label>
                  <input
                    type="password"
                    value={formData.confermPassword}
                    onChange={(e) => handleChange('confermPassword', e.target.value)}
                    className={styles.input}
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin && (
                <div className={styles.formOptions}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    <span>Ricordami</span>
                  </label>
                  <a href="#" className={styles.forgotPassword}>
                    Password dimenticata?
                  </a>
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
              </Button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span>oppure</span>
            </div>

            {/* Social Login */}
            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialLogin('Google')}
              >
                <span className={styles.socialIcon}>🔵</span>
                Continua con Google
              </button>
              <button
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialLogin('Facebook')}
              >
                <span className={styles.socialIcon}>📘</span>
                Continua con Facebook
              </button>
            </div>

            {/* Footer */}
            <div className={styles.formFooter}>
              <p>
                {isLogin ? "Non hai un account? " : "Hai già un account? "}
                <button
                  type="button"
                  className={styles.switchBtn}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Registrati ora' : 'Accedi'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default Login;
