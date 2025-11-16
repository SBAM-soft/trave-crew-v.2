import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import Button from '../../shared/Button';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { userProfile, updateUserProfile, loading: profileLoading } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Redirect se non autenticato
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Devi effettuare il login per accedere al profilo');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Inizializza editedProfile quando userProfile è caricato
  useEffect(() => {
    if (userProfile) {
      setEditedProfile(userProfile);
    }
  }, [userProfile]);

  // Handler salva modifiche
  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateUserProfile(editedProfile);

      if (result.success) {
        toast.success('Profilo aggiornato con successo!');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Errore durante l\'aggiornamento');
      }
    } catch (error) {
      toast.error('Si è verificato un errore');
      console.error('Errore salvataggio profilo:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handler annulla modifiche
  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  // Handler change input
  const handleChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  // Handler logout
  const handleLogout = () => {
    logout();
    toast.success('Logout effettuato con successo');
    navigate('/');
  };

  if (!authUser || !userProfile) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.loading}>
          <p>Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  // Combina dati auth e profile
  const displayData = {
    nome: authUser.nome || 'Utente',
    email: authUser.email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.nome || authUser.email}`,
    telefono: editedProfile.telefono || '',
    citta: editedProfile.citta || '',
    paese: editedProfile.paese || 'Italia',
    bio: editedProfile.bio || '',
    interessi: ['Natura', 'Avventura', 'Cultura'], // TODO: Aggiungere gestione interessi
    viaggiCreati: editedProfile.statistiche?.viaggiCreati || 0,
    viaggiCompletati: editedProfile.statistiche?.viaggiCompletati || 0,
    dataDiIscrizione: authUser.createdAt ? new Date(authUser.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : 'N/A'
  };

  return (
    <div className={styles.profilePage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Il mio profilo</h1>
          <p className={styles.subtitle}>Gestisci le tue informazioni personali</p>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Card Avatar e Info Base */}
        <div className={styles.card}>
          <div className={styles.avatarSection}>
            <img
              src={displayData.avatar}
              alt={displayData.nome}
              className={styles.avatar}
            />
            <div className={styles.avatarInfo}>
              <h2 className={styles.userName}>{displayData.nome}</h2>
              <p className={styles.userEmail}>{displayData.email}</p>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{displayData.viaggiCompletati}</span>
                  <span className={styles.statLabel}>Viaggi completati</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{displayData.viaggiCreati}</span>
                  <span className={styles.statLabel}>Viaggi creati</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{displayData.interessi.length}</span>
                  <span className={styles.statLabel}>Interessi</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.avatarActions}>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                ✏️ Modifica Profilo
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className={styles.logoutBtn}>
              🚪 Logout
            </Button>
          </div>
        </div>

        {/* Card Informazioni Personali */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>📋 Informazioni Personali</h3>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nome</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.nome}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cognome</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.cognome}
                    onChange={(e) => handleChange('cognome', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.cognome}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.email}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Telefono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.telefono}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Città</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.citta}
                    onChange={(e) => handleChange('citta', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.citta}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Paese</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.paese}
                    onChange={(e) => handleChange('paese', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{displayData.paese}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className={styles.textarea}
                  rows={3}
                />
              ) : (
                <p className={styles.value}>{displayData.bio || 'Nessuna bio inserita'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className={styles.cardFooter}>
              <Button variant="outline" onClick={handleCancel}>
                Annulla
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
              </Button>
            </div>
          )}
        </div>

        {/* Card Interessi */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>❤️ I miei interessi</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.interests}>
              {displayData.interessi.map((interesse, i) => (
                <span key={i} className={styles.interestBadge}>
                  {interesse}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>⚡ Azioni rapide</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.actions}>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/my-trips')}
              >
                🗺️ I miei viaggi
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/create')}
              >
                ➕ Crea nuovo viaggio
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => navigate('/explore')}
              >
                🔍 Esplora destinazioni
              </button>
            </div>
          </div>
        </div>

        {/* Info Account */}
        <div className={styles.infoBox}>
          <p>👤 Membro dal {displayData.dataDiIscrizione}</p>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default Profile;
