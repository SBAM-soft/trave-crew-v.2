import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePaymentStore from '../../store/usePaymentStore';
import AddPaymentMethodModal from './AddPaymentMethodModal';
import AddFundsModal from './AddFundsModal';
import styles from './Wallet.module.css';

function Wallet() {
  const navigate = useNavigate();
  const {
    walletBalance,
    paymentMethods,
    transactions,
    pendingPayments,
    getPaymentStats,
    removePaymentMethod,
    setDefaultPaymentMethod
  } = usePaymentStore();

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('all'); // all, payment, deposit, refund

  const stats = getPaymentStats();

  // Combina transazioni completate e pendenti
  const allTransactions = [
    ...pendingPayments.map(t => ({ ...t, isPending: true })),
    ...transactions
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filtra transazioni
  const filteredTransactions = transactionFilter === 'all'
    ? allTransactions
    : allTransactions.filter(t => t.type === transactionFilter);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Proprio ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;

    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💸';
      case 'deposit':
        return '💰';
      case 'refund':
        return '↩️';
      case 'withdrawal':
        return '🏧';
      default:
        return '💳';
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'card':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'bank':
        return '🏦';
      case 'wallet':
        return '👛';
      default:
        return '💰';
    }
  };

  const handleRemovePaymentMethod = (methodId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo metodo di pagamento?')) {
      removePaymentMethod(methodId);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>💼 Il Mio Wallet</h1>
        <p className={styles.subtitle}>Gestisci i tuoi pagamenti e transazioni</p>
      </div>

      {/* Balance & Stats Cards */}
      <div className={styles.grid}>
        {/* Balance Card */}
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Saldo Disponibile</div>
          <div className={styles.balanceAmount}>
            {formatCurrency(walletBalance)}
          </div>
          <div className={styles.balanceActions}>
            <button
              className={styles.balanceBtn}
              onClick={() => setShowAddFundsModal(true)}
            >
              ➕ Ricarica
            </button>
            <button
              className={styles.balanceBtn}
              onClick={() => navigate('/my-trips')}
            >
              📋 Viaggi
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className={styles.statsCard}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.totalTransactions}</div>
              <div className={styles.statLabel}>Transazioni</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {formatCurrency(stats.totalSpent)}
              </div>
              <div className={styles.statLabel}>Spesi</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {formatCurrency(stats.totalRefunded)}
              </div>
              <div className={styles.statLabel}>Rimborsati</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {paymentMethods.length}
              </div>
              <div className={styles.statLabel}>Metodi Pag.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>💳 Metodi di Pagamento</h2>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddPaymentModal(true)}
          >
            ➕ Aggiungi Metodo
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💳</div>
            <div className={styles.emptyText}>Nessun metodo di pagamento</div>
            <div className={styles.emptySubtext}>
              Aggiungi un metodo di pagamento per effettuare transazioni
            </div>
          </div>
        ) : (
          <div className={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`${styles.paymentMethod} ${method.isDefault ? styles.default : ''}`}
              >
                <div className={styles.methodIcon}>
                  {getPaymentMethodIcon(method.type)}
                </div>
                <div className={styles.methodInfo}>
                  <div className={styles.methodType}>
                    {method.isDefault && (
                      <span className={styles.methodBadge}>Predefinito</span>
                    )}
                    {method.name || method.type.toUpperCase()}
                  </div>
                  <div className={styles.methodDetails}>
                    {method.type === 'card' && `•••• ${method.last4}`}
                    {method.type === 'paypal' && method.email}
                    {method.type === 'bank' && `IBAN: ••••${method.last4}`}
                  </div>
                </div>
                <div className={styles.methodActions}>
                  {!method.isDefault && (
                    <button
                      className={styles.iconBtn}
                      onClick={() => setDefaultPaymentMethod(method.id)}
                      title="Imposta come predefinito"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    className={styles.iconBtn}
                    onClick={() => handleRemovePaymentMethod(method.id)}
                    title="Rimuovi"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📜 Cronologia Transazioni</h2>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${transactionFilter === 'all' ? styles.active : ''}`}
            onClick={() => setTransactionFilter('all')}
          >
            Tutte
          </button>
          <button
            className={`${styles.filterBtn} ${transactionFilter === 'payment' ? styles.active : ''}`}
            onClick={() => setTransactionFilter('payment')}
          >
            Pagamenti
          </button>
          <button
            className={`${styles.filterBtn} ${transactionFilter === 'deposit' ? styles.active : ''}`}
            onClick={() => setTransactionFilter('deposit')}
          >
            Ricariche
          </button>
          <button
            className={`${styles.filterBtn} ${transactionFilter === 'refund' ? styles.active : ''}`}
            onClick={() => setTransactionFilter('refund')}
          >
            Rimborsi
          </button>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📜</div>
            <div className={styles.emptyText}>Nessuna transazione</div>
            <div className={styles.emptySubtext}>
              Le tue transazioni appariranno qui
            </div>
          </div>
        ) : (
          <div className={styles.transactions}>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={styles.transaction}>
                <div className={`${styles.transactionIcon} ${styles[transaction.type]}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionDescription}>
                    {transaction.description}
                  </div>
                  <div className={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div>
                  <div
                    className={`${styles.transactionAmount} ${
                      transaction.type === 'deposit' || transaction.type === 'refund'
                        ? styles.positive
                        : styles.negative
                    }`}
                  >
                    {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  {transaction.status && (
                    <span className={`${styles.transactionStatus} ${styles[transaction.status]}`}>
                      {transaction.status === 'completed' && '✓ Completato'}
                      {transaction.status === 'pending' && '⏳ In attesa'}
                      {transaction.status === 'processing' && '⚙️ Elaborazione'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddPaymentModal && (
        <AddPaymentMethodModal onClose={() => setShowAddPaymentModal(false)} />
      )}

      {showAddFundsModal && (
        <AddFundsModal onClose={() => setShowAddFundsModal(false)} />
      )}
    </div>
  );
}

export default Wallet;
