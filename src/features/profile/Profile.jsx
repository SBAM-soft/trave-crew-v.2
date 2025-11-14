import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();

  // Mock user data (in futuro da backend/context)
  const [user, setUser] = useState({
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario',
    telefono: '+39 333 123 4567',
    citta: 'Milano',
    paese: 'Italia',
    bio: 'Appassionato di viaggi e avventure. Sempre alla ricerca di nuove destinazioni.',
    interessi: ['Natura', 'Avventura', 'Cultura', 'Food'],
    viaggiCompletati: 12,
    viaggiProssimi: 2,
    dataDiIscrizione: 'Gennaio 2024'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  // Handler salva modifiche
  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    alert('✓ Profilo aggiornato con successo!');
  };

  // Handler annulla modifiche
  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  // Handler change input
  const handleChange = (field, value) => {
    setEditedUser({ ...editedUser, [field]: value });
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
              src={user.avatar}
              alt={`${user.nome} ${user.cognome}`}
              className={styles.avatar}
            />
            <div className={styles.avatarInfo}>
              <h2 className={styles.userName}>{user.nome} {user.cognome}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.viaggiCompletati}</span>
                  <span className={styles.statLabel}>Viaggi completati</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.viaggiProssimi}</span>
                  <span className={styles.statLabel}>Prossimi viaggi</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{user.interessi.length}</span>
                  <span className={styles.statLabel}>Interessi</span>
                </div>
              </div>
            </div>
          </div>

          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              ✏️ Modifica Profilo
            </Button>
          )}
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
                    value={editedUser.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.nome}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cognome</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.cognome}
                    onChange={(e) => handleChange('cognome', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.cognome}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.email}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Telefono</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.telefono}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Città</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.citta}
                    onChange={(e) => handleChange('citta', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.citta}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Paese</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.paese}
                    onChange={(e) => handleChange('paese', e.target.value)}
                    className={styles.input}
                  />
                ) : (
                  <p className={styles.value}>{user.paese}</p>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              {isEditing ? (
                <textarea
                  value={editedUser.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className={styles.textarea}
                  rows={3}
                />
              ) : (
                <p className={styles.value}>{user.bio}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className={styles.cardFooter}>
              <Button variant="outline" onClick={handleCancel}>
                Annulla
              </Button>
              <Button variant="primary" onClick={handleSave}>
                💾 Salva Modifiche
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
              {user.interessi.map((interesse, i) => (
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
          <p>👤 Membro dal {user.dataDiIscrizione}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
