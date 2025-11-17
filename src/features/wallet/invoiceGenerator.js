import { jsPDF } from 'jspdf';

/**
 * Genera una fattura/ricevuta PDF per una transazione
 */
export const generateInvoicePDF = (transaction, userInfo = {}) => {
  const doc = new jsPDF();

  // Configurazione
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Colori
  const primaryColor = [102, 126, 234]; // #667eea
  const secondaryColor = [118, 75, 162]; // #764ba2
  const textColor = [26, 26, 26];
  const grayColor = [102, 102, 102];

  // === HEADER ===
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL CREW', margin, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Ricevuta di Pagamento', margin, 30);

  y = 60;

  // === INFORMAZIONI RICEVUTA ===
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Box informazioni ricevuta
  doc.setDrawColor(...grayColor);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('Numero Ricevuta:', margin + 5, y + 8);
  doc.text('Data:', margin + 5, y + 16);
  doc.text('Stato:', margin + 5, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.text(`#${transaction.id.slice(0, 12).toUpperCase()}`, margin + 45, y + 8);
  doc.text(formatDate(transaction.date), margin + 45, y + 16);
  doc.text(getStatusText(transaction.status), margin + 45, y + 24);

  y += 45;

  // === INFORMAZIONI CLIENTE ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Intestato a:', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(userInfo.name || 'Cliente', margin, y);
  y += 6;
  if (userInfo.email) {
    doc.text(userInfo.email, margin, y);
    y += 6;
  }
  if (userInfo.address) {
    doc.text(userInfo.address, margin, y);
    y += 6;
  }

  y += 10;

  // === DETTAGLI TRANSAZIONE ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Dettagli Transazione', margin, y);
  y += 10;

  // Tabella dettagli
  const tableY = y;
  const tableHeight = 50;

  // Header tabella
  doc.setFillColor(...primaryColor);
  doc.rect(margin, tableY, pageWidth - 2 * margin, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Descrizione', margin + 5, tableY + 7);
  doc.text('Importo', pageWidth - margin - 35, tableY + 7);

  // Contenuto tabella
  y = tableY + 10;
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');

  // Riga principale
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;
  const description = transaction.description || 'Pagamento viaggio';
  const descriptionLines = doc.splitTextToSize(description, pageWidth - 2 * margin - 50);
  doc.text(descriptionLines, margin + 5, y);

  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(transaction.amount), pageWidth - margin - 35, y, { align: 'right' });

  y += descriptionLines.length * 5 + 5;

  // Dettagli viaggio se presenti
  if (transaction.tripName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(`Viaggio: ${transaction.tripName}`, margin + 5, y);
    y += 6;
  }

  // Split details se presenti
  if (transaction.splitDetails && transaction.splitDetails.participants) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.text('Divisione Costi:', margin + 5, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    transaction.splitDetails.participants.forEach((participant) => {
      const status = participant.paid ? '✓ Pagato' : '○ In attesa';
      doc.text(`${participant.name} - ${formatCurrency(participant.amount)} - ${status}`, margin + 10, y);
      y += 6;
    });
  }

  y += 10;

  // === TOTALE ===
  doc.setDrawColor(...grayColor);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.text('TOTALE PAGATO', margin, y);

  doc.setTextColor(...primaryColor);
  doc.text(formatCurrency(transaction.amount), pageWidth - margin - 5, y, { align: 'right' });

  y += 15;

  // === METODO DI PAGAMENTO ===
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text('Metodo di Pagamento:', margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  const paymentMethodText = getPaymentMethodText(transaction.paymentMethod);
  doc.text(paymentMethodText, margin + 5, y + 15);

  y += 35;

  // === NOTE ===
  if (transaction.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Note:', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(transaction.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 5 + 10;
  }

  // === FOOTER ===
  const footerY = pageHeight - 30;

  doc.setDrawColor(...grayColor);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);

  doc.text('Grazie per aver scelto Travel Crew!', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('Per assistenza: info@travelcrew.com | +39 02 1234567', pageWidth / 2, footerY + 14, { align: 'center' });

  // Informativa
  doc.setFontSize(7);
  doc.text('Questo documento è una ricevuta di pagamento generata automaticamente.', pageWidth / 2, footerY + 20, { align: 'center' });

  // === SALVA PDF ===
  const fileName = `ricevuta_${transaction.id.slice(0, 8)}_${formatDateFile(transaction.date)}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * Genera una fattura riepilogativa per un viaggio
 */
export const generateTripInvoicePDF = (tripData, transactions = []) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  const primaryColor = [102, 126, 234];
  const textColor = [26, 26, 26];
  const grayColor = [102, 102, 102];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL CREW', margin, 20);

  doc.setFontSize(12);
  doc.text('Riepilogo Viaggio', margin, 30);

  y = 60;

  // Informazioni viaggio
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(tripData.name || 'Il Tuo Viaggio', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (tripData.destination) {
    doc.text(`Destinazione: ${tripData.destination}`, margin, y);
    y += 7;
  }
  if (tripData.dates) {
    doc.text(`Date: ${tripData.dates}`, margin, y);
    y += 7;
  }
  if (tripData.participants) {
    doc.text(`Partecipanti: ${tripData.participants}`, margin, y);
    y += 7;
  }

  y += 10;

  // Dettaglio costi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Dettaglio Costi', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (tripData.costs) {
    if (tripData.costs.experiences > 0) {
      doc.text('Esperienze:', margin, y);
      doc.text(formatCurrency(tripData.costs.experiences), pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    }
    if (tripData.costs.hotels > 0) {
      doc.text('Hotel:', margin, y);
      doc.text(formatCurrency(tripData.costs.hotels), pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    }
    if (tripData.costs.extras > 0) {
      doc.text('Extra:', margin, y);
      doc.text(formatCurrency(tripData.costs.extras), pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    }

    y += 5;
    doc.setDrawColor(...grayColor);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TOTALE:', margin, y);
    doc.setTextColor(...primaryColor);
    doc.text(formatCurrency(tripData.costs.total), pageWidth - margin - 5, y, { align: 'right' });
  }

  y += 20;

  // Transazioni
  if (transactions.length > 0) {
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Cronologia Pagamenti', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    transactions.forEach((tx) => {
      doc.text(formatDate(tx.date), margin, y);
      doc.text(tx.description, margin + 40, y);
      doc.text(formatCurrency(tx.amount), pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    });
  }

  const fileName = `viaggio_${tripData.id || 'riepilogo'}_${formatDateFile(new Date())}.pdf`;
  doc.save(fileName);

  return fileName;
};

// === HELPER FUNCTIONS ===

function formatCurrency(amount) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateFile(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function getStatusText(status) {
  const statusMap = {
    completed: '✓ Completato',
    pending: '○ In attesa',
    processing: '⚙ In elaborazione',
    failed: '✗ Fallito',
    refunded: '↩ Rimborsato'
  };
  return statusMap[status] || status;
}

function getPaymentMethodText(method) {
  if (!method) return 'Non specificato';

  if (method === 'wallet') return 'Wallet Travel Crew';
  if (typeof method === 'string') return method;

  return 'Metodo di pagamento salvato';
}
