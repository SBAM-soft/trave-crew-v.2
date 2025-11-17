import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePaymentStore = create(
  persist(
    (set, get) => ({
      // Wallet balance (simulato)
      walletBalance: 1000, // Saldo iniziale di esempio

      // Metodi di pagamento salvati
      paymentMethods: [],

      // Transazioni completate
      transactions: [],

      // Pagamenti pendenti
      pendingPayments: [],

      // ================ WALLET BALANCE ================
      addFunds: (amount) => set((state) => ({
        walletBalance: state.walletBalance + amount,
        transactions: [
          ...state.transactions,
          {
            id: crypto.randomUUID(),
            type: 'deposit',
            amount: amount,
            date: new Date().toISOString(),
            status: 'completed',
            description: 'Ricarica wallet'
          }
        ]
      })),

      withdrawFunds: (amount) => set((state) => {
        if (state.walletBalance < amount) {
          throw new Error('Saldo insufficiente');
        }
        return {
          walletBalance: state.walletBalance - amount,
          transactions: [
            ...state.transactions,
            {
              id: crypto.randomUUID(),
              type: 'withdrawal',
              amount: amount,
              date: new Date().toISOString(),
              status: 'completed',
              description: 'Prelievo dal wallet'
            }
          ]
        };
      }),

      // ================ PAYMENT METHODS ================
      addPaymentMethod: (method) => set((state) => ({
        paymentMethods: [
          ...state.paymentMethods,
          {
            ...method,
            id: crypto.randomUUID(),
            addedAt: new Date().toISOString()
          }
        ]
      })),

      removePaymentMethod: (methodId) => set((state) => ({
        paymentMethods: state.paymentMethods.filter(m => m.id !== methodId)
      })),

      setDefaultPaymentMethod: (methodId) => set((state) => ({
        paymentMethods: state.paymentMethods.map(m => ({
          ...m,
          isDefault: m.id === methodId
        }))
      })),

      // ================ TRANSACTIONS ================
      addTransaction: (transaction) => set((state) => ({
        transactions: [
          ...state.transactions,
          {
            ...transaction,
            id: transaction.id || crypto.randomUUID(),
            date: transaction.date || new Date().toISOString(),
            status: transaction.status || 'completed'
          }
        ]
      })),

      getTransactionById: (transactionId) => {
        const state = get();
        return state.transactions.find(t => t.id === transactionId);
      },

      getTransactionsByTrip: (tripId) => {
        const state = get();
        return state.transactions.filter(t => t.tripId === tripId);
      },

      // ================ PAYMENTS ================
      processPayment: (paymentData) => {
        // Validazione saldo wallet se pagamento da wallet
        const state = get();
        if (paymentData.paymentMethod === 'wallet' && state.walletBalance < paymentData.amount) {
          throw new Error('Saldo wallet insufficiente');
        }

        const transactionId = crypto.randomUUID();
        const transaction = {
          id: transactionId,
          type: 'payment',
          amount: paymentData.amount,
          tripId: paymentData.tripId,
          tripName: paymentData.tripName,
          date: new Date().toISOString(),
          status: 'completed',
          completedAt: new Date().toISOString(),
          description: paymentData.description || `Pagamento viaggio ${paymentData.tripName}`,
          paymentMethod: paymentData.paymentMethod,
          splitDetails: paymentData.splitDetails
        };

        // Update atomico senza race condition
        set((state) => ({
          transactions: [...state.transactions, transaction],
          walletBalance: paymentData.paymentMethod === 'wallet'
            ? state.walletBalance - paymentData.amount
            : state.walletBalance
        }));

        return transactionId;
      },

      // ================ SPLIT PAYMENTS ================
      createSplitPayment: (tripData, participants) => {
        const totalCost = tripData.totalCost;
        const perPerson = totalCost / participants.length;

        const splitDetails = participants.map(participant => ({
          userId: participant.id,
          name: participant.name,
          email: participant.email,
          amount: perPerson,
          paid: participant.id === 'current-user', // Solo l'utente corrente paga subito
          paidAt: participant.id === 'current-user' ? new Date().toISOString() : null
        }));

        return {
          tripId: tripData.id,
          tripName: tripData.name,
          totalCost,
          perPerson,
          participants: splitDetails,
          createdAt: new Date().toISOString()
        };
      },

      markSplitPaymentPaid: (transactionId, userId) => set((state) => ({
        transactions: state.transactions.map(t => {
          if (t.id === transactionId && t.splitDetails) {
            return {
              ...t,
              splitDetails: {
                ...t.splitDetails,
                participants: t.splitDetails.participants.map(p =>
                  p.userId === userId
                    ? { ...p, paid: true, paidAt: new Date().toISOString() }
                    : p
                )
              }
            };
          }
          return t;
        })
      })),

      // ================ REFUNDS ================
      requestRefund: (transactionId, reason) => {
        const state = get();
        const transaction = state.transactions.find(t => t.id === transactionId);

        if (!transaction) {
          throw new Error('Transazione non trovata');
        }

        const refundTransactionId = crypto.randomUUID();
        const refundTransaction = {
          id: refundTransactionId,
          type: 'refund',
          amount: transaction.amount,
          originalTransactionId: transactionId,
          tripId: transaction.tripId,
          tripName: transaction.tripName,
          date: new Date().toISOString(),
          status: 'completed',
          completedAt: new Date().toISOString(),
          description: `Rimborso: ${transaction.description}`,
          reason
        };

        // Update atomico senza race condition
        set((state) => ({
          transactions: [...state.transactions, refundTransaction],
          walletBalance: state.walletBalance + transaction.amount
        }));

        return refundTransactionId;
      },

      // ================ UTILITIES ================
      getPaymentStats: () => {
        const state = get();
        const completedPayments = state.transactions.filter(
          t => t.type === 'payment' && t.status === 'completed'
        );
        const totalSpent = completedPayments.reduce((sum, t) => sum + t.amount, 0);
        const totalRefunded = state.transactions
          .filter(t => t.type === 'refund' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          totalTransactions: state.transactions.length,
          totalSpent,
          totalRefunded,
          netSpent: totalSpent - totalRefunded,
          walletBalance: state.walletBalance
        };
      },

      // Reset (per testing/debug)
      resetPaymentStore: () => set({
        walletBalance: 1000,
        paymentMethods: [],
        transactions: [],
        pendingPayments: []
      })
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({
        walletBalance: state.walletBalance,
        paymentMethods: state.paymentMethods,
        transactions: state.transactions
        // Non persistere pendingPayments
      })
    }
  )
);

export default usePaymentStore;
