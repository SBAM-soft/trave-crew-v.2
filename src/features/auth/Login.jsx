import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      // Mock login
      if (formData.email && formData.password) {
        alert(`✓ Login effettuato con successo!\nBenvenuto ${formData.email}`);
        navigate('/profile');
      } else {
        alert('⚠️ Inserisci email e password');
      }
    } else {
      // Mock registrazione
      if (formData.email && formData.password && formData.nome && formData.cognome) {
        if (formData.password === formData.confermPassword) {
          alert(`✓ Registrazione completata!\nBenvenuto ${formData.nome}!`);
          navigate('/profile');
        } else {
          alert('⚠️ Le password non coincidono');
        }
      } else {
        alert('⚠️ Compila tutti i campi');
      }
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Login con ${provider} in arrivo!`);
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

              <Button variant="primary" type="submit" className={styles.submitBtn}>
                {isLogin ? 'Accedi' : 'Registrati'}
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
    </div>
  );
}

export default Login;
