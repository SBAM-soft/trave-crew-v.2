import { useState } from 'react';
import { toast } from 'sonner';
import styles from './Modal.module.css';

function SplitPaymentModal({ tripData, onConfirm, onClose }) {
  const [participants, setParticipants] = useState([
    {
      id: 'current-user',
      name: 'Tu',
      email: 'tu@example.com',
      isCurrentUser: true
    }
  ]);

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: ''
  });

  const addParticipant = () => {
    if (!newParticipant.name.trim()) {
      toast.error('Inserisci il nome del partecipante');
      return;
    }

    if (!newParticipant.email.trim() || !newParticipant.email.includes('@')) {
      toast.error('Inserisci un email valida');
      return;
    }

    // Verifica email duplicata
    if (participants.some(p => p.email === newParticipant.email)) {
      toast.error('Questa email è già stata aggiunta');
      return;
    }

    const participant = {
      id: Date.now().toString(),
      name: newParticipant.name,
      email: newParticipant.email,
      isCurrentUser: false
    };

    setParticipants([...participants, participant]);
    setNewParticipant({ name: '', email: '' });
    toast.success(`${participant.name} aggiunto`);
  };

  const removeParticipant = (id) => {
    if (id === 'current-user') {
      toast.error('Non puoi rimuoverti dalla lista');
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  const handleConfirm = () => {
    if (participants.length < 2) {
      toast.error('Aggiungi almeno un altro partecipante');
      return;
    }

    onConfirm(participants);
  };

  const costPerPerson = tripData.totalCost / participants.length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>👥 Dividi il Costo</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Trip Info */}
          <div className={styles.formGroup}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '1rem',
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                Costo Totale
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                {formatCurrency(tripData.totalCost)}
              </div>
            </div>
          </div>

          {/* Add Participant Form */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Aggiungi Partecipante</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                className={styles.input}
                placeholder="Nome"
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('email-input').focus();
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                id="email-input"
                type="email"
                className={styles.input}
                placeholder="Email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addParticipant();
                  }
                }}
              />
              <button
                type="button"
                onClick={addParticipant}
                style={{
                  padding: '0.875rem 1.5rem',
                  background: 'var(--primary-color, #667eea)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ➕ Aggiungi
              </button>
            </div>
          </div>

          {/* Participants List */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Partecipanti ({participants.length})
            </label>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    background: participant.isCurrentUser
                      ? 'rgba(102, 126, 234, 0.05)'
                      : 'var(--bg-secondary, #f8f9fa)',
                    border: participant.isCurrentUser
                      ? '2px solid var(--primary-color, #667eea)'
                      : '2px solid transparent',
                    borderRadius: '12px',
                    gap: '1rem'
                  }}
                >
                  <div style={{ fontSize: '1.5rem' }}>
                    {participant.isCurrentUser ? '👤' : '👥'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {participant.name}
                      {participant.isCurrentUser && (
                        <span style={{
                          marginLeft: '0.5rem',
                          background: 'var(--primary-color, #667eea)',
                          color: 'white',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.625rem'
                        }}>
                          Tu
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #666)' }}>
                      {participant.email}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: 'var(--primary-color, #667eea)',
                      fontSize: '1.125rem'
                    }}>
                      {formatCurrency(costPerPerson)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #666)' }}>
                      a persona
                    </div>
                  </div>
                  {!participant.isCurrentUser && (
                    <button
                      onClick={() => removeParticipant(participant.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary, #666)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        fontSize: '1.25rem'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Costo Totale:</span>
              <span className={styles.summaryValue}>
                {formatCurrency(tripData.totalCost)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Numero Partecipanti:</span>
              <span className={styles.summaryValue}>{participants.length}</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Costo a Persona:</span>
              <span className={styles.summaryTotal}>
                {formatCurrency(costPerPerson)}
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            padding: '1rem',
            background: 'rgba(33, 150, 243, 0.1)',
            borderRadius: '12px',
            color: '#2196f3',
            fontSize: '0.875rem',
            marginBottom: '1.5rem'
          }}>
            ℹ️ Ogni partecipante riceverà una notifica email con il link per pagare la sua quota
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Annulla
            </button>
            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleConfirm}
              disabled={participants.length < 2}
            >
              Conferma Divisione
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplitPaymentModal;
