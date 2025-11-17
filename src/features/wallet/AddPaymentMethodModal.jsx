import { useState } from 'react';
import { toast } from 'sonner';
import usePaymentStore from '../../store/usePaymentStore';
import styles from './Modal.module.css';

function AddPaymentMethodModal({ onClose }) {
  const { addPaymentMethod } = usePaymentStore();
  const [paymentType, setPaymentType] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    iban: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    let method = { type: paymentType };

    switch (paymentType) {
      case 'card':
        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
          toast.error('Compila tutti i campi della carta');
          return;
        }
        method = {
          ...method,
          name: formData.cardName,
          last4: formData.cardNumber.slice(-4),
          expiry: formData.expiryDate
        };
        break;

      case 'paypal':
        if (!formData.email) {
          toast.error('Inserisci un email PayPal valida');
          return;
        }
        method = {
          ...method,
          email: formData.email,
          name: 'PayPal'
        };
        break;

      case 'bank':
        if (!formData.iban) {
          toast.error('Inserisci un IBAN valido');
          return;
        }
        method = {
          ...method,
          iban: formData.iban,
          last4: formData.iban.slice(-4),
          name: 'Bonifico Bancario'
        };
        break;

      default:
        toast.error('Tipo di pagamento non valido');
        return;
    }

    addPaymentMethod(method);
    toast.success('Metodo di pagamento aggiunto con successo!');
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>➕ Aggiungi Metodo di Pagamento</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Type Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tipo di Pagamento</label>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.typeBtn} ${paymentType === 'card' ? styles.active : ''}`}
                onClick={() => setPaymentType('card')}
              >
                💳 Carta
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${paymentType === 'paypal' ? styles.active : ''}`}
                onClick={() => setPaymentType('paypal')}
              >
                🅿️ PayPal
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${paymentType === 'bank' ? styles.active : ''}`}
                onClick={() => setPaymentType('bank')}
              >
                🏦 Bonifico
              </button>
            </div>
          </div>

          {/* Card Form */}
          {paymentType === 'card' && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Numero Carta</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nome sulla Carta</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="MARIO ROSSI"
                  value={formData.cardName}
                  onChange={(e) => handleChange('cardName', e.target.value.toUpperCase())}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Scadenza</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>CVV</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                  />
                </div>
              </div>
            </>
          )}

          {/* PayPal Form */}
          {paymentType === 'paypal' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Email PayPal</label>
              <input
                type="email"
                className={styles.input}
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          )}

          {/* Bank Transfer Form */}
          {paymentType === 'bank' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>IBAN</label>
              <input
                type="text"
                className={styles.input}
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value.toUpperCase())}
                maxLength={32}
              />
            </div>
          )}

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
              type="submit"
              className={styles.submitBtn}
            >
              Aggiungi Metodo
            </button>
          </div>
        </form>

        <div className={styles.securityNote}>
          🔒 I tuoi dati di pagamento sono protetti e criptati
        </div>
      </div>
    </div>
  );
}

export default AddPaymentMethodModal;
