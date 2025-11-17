import { useState } from 'react';
import { toast } from 'sonner';
import usePaymentStore from '../../store/usePaymentStore';
import styles from './Modal.module.css';

function AddFundsModal({ onClose }) {
  const { addFunds, paymentMethods } = usePaymentStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  const presetAmounts = [20, 50, 100, 200, 500];

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Inserisci un importo valido');
      return;
    }

    if (parsedAmount > 10000) {
      toast.error('Importo massimo: €10.000');
      return;
    }

    if (!selectedMethod && paymentMethods.length > 0) {
      toast.error('Seleziona un metodo di pagamento');
      return;
    }

    // Simula elaborazione
    toast.loading('Elaborazione in corso...', { id: 'add-funds' });

    setTimeout(() => {
      addFunds(parsedAmount);
      toast.success(`€${parsedAmount.toFixed(2)} aggiunti al tuo wallet!`, { id: 'add-funds' });
      onClose();
    }, 1500);
  };

  const defaultMethod = paymentMethods.find(m => m.isDefault);
  if (!selectedMethod && defaultMethod) {
    setSelectedMethod(defaultMethod.id);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>💰 Ricarica Wallet</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Importo da Ricaricare</label>
            <div className={styles.amountInput}>
              <span className={styles.currency}>€</span>
              <input
                type="number"
                className={styles.input}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                max="10000"
              />
            </div>
          </div>

          {/* Preset Amounts */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Importi Rapidi</label>
            <div className={styles.buttonGroup}>
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`${styles.presetBtn} ${amount === preset.toString() ? styles.active : ''}`}
                  onClick={() => setAmount(preset.toString())}
                >
                  €{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          {paymentMethods.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Metodo di Pagamento</label>
              <div className={styles.paymentMethodsList}>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`${styles.paymentMethodOption} ${selectedMethod === method.id ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className={styles.radio}
                    />
                    <div className={styles.methodContent}>
                      <span className={styles.methodIcon}>
                        {method.type === 'card' && '💳'}
                        {method.type === 'paypal' && '🅿️'}
                        {method.type === 'bank' && '🏦'}
                      </span>
                      <div className={styles.methodDetails}>
                        <div className={styles.methodName}>{method.name || method.type}</div>
                        <div className={styles.methodInfo}>
                          {method.type === 'card' && `•••• ${method.last4}`}
                          {method.type === 'paypal' && method.email}
                          {method.type === 'bank' && `IBAN ••••${method.last4}`}
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className={styles.defaultBadge}>Predefinito</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {paymentMethods.length === 0 && (
            <div className={styles.warningBox}>
              ⚠️ Aggiungi un metodo di pagamento prima di ricaricare
            </div>
          )}

          {/* Summary */}
          {amount && parseFloat(amount) > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Importo ricarica:</span>
                <span className={styles.summaryValue}>€{parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Commissione:</span>
                <span className={styles.summaryValue}>€0.00</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Totale:</span>
                <span className={styles.summaryTotal}>€{parseFloat(amount).toFixed(2)}</span>
              </div>
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
              disabled={!amount || parseFloat(amount) <= 0 || (paymentMethods.length > 0 && !selectedMethod)}
            >
              Ricarica Wallet
            </button>
          </div>
        </form>

        <div className={styles.securityNote}>
          🔒 Transazione sicura e protetta
        </div>
      </div>
    </div>
  );
}

export default AddFundsModal;
