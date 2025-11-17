import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePaymentStore from '../../store/usePaymentStore';
import SplitPaymentModal from './SplitPaymentModal';
import styles from './Checkout.module.css';

function Checkout({ tripData, onClose }) {
  const navigate = useNavigate();
  const {
    walletBalance,
    paymentMethods,
    processPayment,
    createSplitPayment
  } = usePaymentStore();

  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitData, setSplitData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCost = tripData.costs?.total || 0;
  const perPerson = tripData.costs?.perPerson || totalCost;

  const handlePayment = () => {
    if (isProcessing) return;

    // Validazioni
    if (paymentMethod === 'wallet' && walletBalance < totalCost) {
      toast.error('Saldo wallet insufficiente', {
        description: `Saldo disponibile: €${walletBalance.toFixed(2)}`
      });
      return;
    }

    if (paymentMethod !== 'wallet' && paymentMethods.length === 0) {
      toast.error('Aggiungi un metodo di pagamento');
      return;
    }

    setIsProcessing(true);
    toast.loading('Elaborazione pagamento...', { id: 'payment' });

    // Prepara dati pagamento
    const paymentData = {
      tripId: tripData.id,
      tripName: tripData.name || 'Viaggio',
      amount: splitData ? splitData.perPerson : totalCost,
      paymentMethod,
      description: splitData
        ? `Pagamento quota viaggio ${tripData.name} (${splitData.participants.length} persone)`
        : `Pagamento viaggio ${tripData.name}`,
      splitDetails: splitData
    };

    // Processa il pagamento
    const transactionId = processPayment(paymentData);

    // Simula elaborazione
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Pagamento completato con successo!', {
        id: 'payment',
        description: `Transazione #${transactionId.slice(0, 8)}`
      });

      // Naviga al wallet per vedere la transazione
      setTimeout(() => {
        onClose();
        navigate('/wallet');
      }, 1500);
    }, 2000);
  };

  const handleSplitPayment = (participants) => {
    const split = createSplitPayment(
      {
        id: tripData.id,
        name: tripData.name || 'Viaggio',
        totalCost
      },
      participants
    );
    setSplitData(split);
    setShowSplitModal(false);
    toast.success('Pagamento diviso tra i partecipanti', {
      description: `€${split.perPerson.toFixed(2)} a persona`
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const defaultPaymentMethod = paymentMethods.find(m => m.isDefault);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>💳 Checkout</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {/* Trip Summary */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Riepilogo Viaggio</h3>
            <div className={styles.tripInfo}>
              <div className={styles.tripName}>
                {tripData.name || 'Il Tuo Viaggio'}
              </div>
              {tripData.destination && (
                <div className={styles.tripDetail}>
                  📍 {tripData.destination}
                </div>
              )}
              {tripData.dates && (
                <div className={styles.tripDetail}>
                  📅 {tripData.dates}
                </div>
              )}
              {tripData.participants && (
                <div className={styles.tripDetail}>
                  👥 {tripData.participants} {tripData.participants === 1 ? 'persona' : 'persone'}
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Dettaglio Costi</h3>
            <div className={styles.costBreakdown}>
              {tripData.costs?.experiences > 0 && (
                <div className={styles.costRow}>
                  <span>Esperienze</span>
                  <span>{formatCurrency(tripData.costs.experiences)}</span>
                </div>
              )}
              {tripData.costs?.hotels > 0 && (
                <div className={styles.costRow}>
                  <span>Hotel</span>
                  <span>{formatCurrency(tripData.costs.hotels)}</span>
                </div>
              )}
              {tripData.costs?.extras > 0 && (
                <div className={styles.costRow}>
                  <span>Extra</span>
                  <span>{formatCurrency(tripData.costs.extras)}</span>
                </div>
              )}
              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span>Totale</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              {splitData && (
                <div className={styles.perPersonRow}>
                  <span>A persona ({splitData.participants.length} persone)</span>
                  <span className={styles.perPersonAmount}>
                    {formatCurrency(splitData.perPerson)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Split Payment Option */}
          <div className={styles.section}>
            <button
              className={styles.splitBtn}
              onClick={() => setShowSplitModal(true)}
            >
              👥 Dividi il Costo
            </button>
            {splitData && (
              <div className={styles.splitInfo}>
                ✓ Costo diviso tra {splitData.participants.length} persone
                <button
                  className={styles.splitEditBtn}
                  onClick={() => setShowSplitModal(true)}
                >
                  Modifica
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Metodo di Pagamento</h3>

            {/* Wallet Option */}
            <label className={`${styles.paymentOption} ${paymentMethod === 'wallet' ? styles.selected : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.radio}
              />
              <div className={styles.optionContent}>
                <div className={styles.optionIcon}>👛</div>
                <div className={styles.optionInfo}>
                  <div className={styles.optionName}>Wallet</div>
                  <div className={styles.optionDetail}>
                    Saldo: {formatCurrency(walletBalance)}
                  </div>
                </div>
                {walletBalance < totalCost && (
                  <div className={styles.insufficientBadge}>
                    Saldo insufficiente
                  </div>
                )}
              </div>
            </label>

            {/* Saved Payment Methods */}
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`${styles.paymentOption} ${paymentMethod === method.id ? styles.selected : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={styles.radio}
                />
                <div className={styles.optionContent}>
                  <div className={styles.optionIcon}>
                    {method.type === 'card' && '💳'}
                    {method.type === 'paypal' && '🅿️'}
                    {method.type === 'bank' && '🏦'}
                  </div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionName}>
                      {method.name || method.type}
                      {method.isDefault && (
                        <span className={styles.defaultBadge}>Predefinito</span>
                      )}
                    </div>
                    <div className={styles.optionDetail}>
                      {method.type === 'card' && `•••• ${method.last4}`}
                      {method.type === 'paypal' && method.email}
                      {method.type === 'bank' && `IBAN ••••${method.last4}`}
                    </div>
                  </div>
                </div>
              </label>
            ))}

            {paymentMethods.length === 0 && paymentMethod !== 'wallet' && (
              <div className={styles.noMethods}>
                <p>Nessun metodo di pagamento salvato</p>
                <button
                  className={styles.addMethodBtn}
                  onClick={() => navigate('/wallet')}
                >
                  Aggiungi Metodo
                </button>
              </div>
            )}
          </div>

          {/* Payment Button */}
          <button
            className={styles.payBtn}
            onClick={handlePayment}
            disabled={
              isProcessing ||
              (paymentMethod === 'wallet' && walletBalance < totalCost) ||
              (paymentMethod !== 'wallet' && paymentMethods.length === 0)
            }
          >
            {isProcessing ? (
              <>⏳ Elaborazione...</>
            ) : (
              <>
                💳 Paga {splitData ? formatCurrency(splitData.perPerson) : formatCurrency(totalCost)}
              </>
            )}
          </button>

          <div className={styles.securityNote}>
            🔒 Pagamento sicuro e protetto
          </div>
        </div>

        {/* Split Payment Modal */}
        {showSplitModal && (
          <SplitPaymentModal
            tripData={{ ...tripData, totalCost }}
            onConfirm={handleSplitPayment}
            onClose={() => setShowSplitModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Checkout;
