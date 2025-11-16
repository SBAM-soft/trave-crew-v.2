import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Esporta un elemento HTML come PDF
 *
 * @param {HTMLElement|string} element - Elemento DOM o selector CSS
 * @param {string} filename - Nome file PDF (senza estensione)
 * @param {Object} options - Opzioni personalizzazione
 * @returns {Promise<void>}
 */
export async function exportToPDF(element, filename = 'documento', options = {}) {
  const {
    orientation = 'portrait', // 'portrait' | 'landscape'
    format = 'a4',
    quality = 0.95,
    margin = 10,
    showProgress = true,
  } = options;

  try {
    // Ottieni l'elemento
    const el = typeof element === 'string'
      ? document.querySelector(element)
      : element;

    if (!el) {
      throw new Error('Elemento non trovato');
    }

    if (showProgress) {
      console.log('📄 Generazione PDF in corso...');
    }

    // Converti HTML in canvas
    const canvas = await html2canvas(el, {
      scale: 2, // Alta qualità
      useCORS: true, // Permetti immagini cross-origin
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Ottieni dimensioni
    const imgData = canvas.toDataURL('image/png', quality);
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Crea PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Calcola dimensioni per il PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const widthRatio = (pageWidth - (margin * 2)) / imgWidth;
    const heightRatio = (pageHeight - (margin * 2)) / imgHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    const canvasWidth = imgWidth * ratio;
    const canvasHeight = imgHeight * ratio;

    // Centra l'immagine
    const x = (pageWidth - canvasWidth) / 2;
    const y = margin;

    // Se l'immagine è più alta di una pagina, dividi in più pagine
    if (canvasHeight > pageHeight - (margin * 2)) {
      let heightLeft = imgHeight;
      let position = 0;
      let pageNum = 0;

      while (heightLeft >= 0) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const sourceY = position;
        const sourceHeight = Math.min(
          (pageHeight - (margin * 2)) / ratio,
          heightLeft
        );

        pdf.addImage(
          imgData,
          'PNG',
          x,
          y,
          canvasWidth,
          sourceHeight * ratio,
          undefined,
          'FAST',
          0,
          sourceY
        );

        heightLeft -= sourceHeight;
        position += sourceHeight;
        pageNum++;
      }
    } else {
      // Singola pagina
      pdf.addImage(imgData, 'PNG', x, y, canvasWidth, canvasHeight);
    }

    // Salva il PDF
    pdf.save(`${filename}.pdf`);

    if (showProgress) {
      console.log('✅ PDF generato con successo!');
    }

    return pdf;
  } catch (error) {
    console.error('❌ Errore durante la generazione del PDF:', error);
    throw error;
  }
}

/**
 * Esporta itinerario come PDF
 *
 * @param {Object} tripData - Dati del viaggio
 * @param {string} filename - Nome file
 * @returns {Promise<void>}
 */
export async function exportItineraryPDF(tripData, filename = 'itinerario') {
  // Crea un elemento temporaneo con l'itinerario formattato
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = `
    padding: 40px;
    font-family: Arial, sans-serif;
    background: white;
    position: absolute;
    left: -9999px;
    width: 800px;
  `;

  // Genera HTML dell'itinerario
  let html = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #667eea; margin-bottom: 10px;">
        ${tripData.destinazione || 'Il Tuo Viaggio'}
      </h1>
      <p style="color: #6b7280; font-size: 16px;">
        ${tripData.numeroPersone || 2} persone • ${tripData.totalDays || 7} giorni
      </p>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #374151; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
        📅 Itinerario
      </h2>
  `;

  // Aggiungi giorni
  if (tripData.filledBlocks && tripData.filledBlocks.length > 0) {
    tripData.filledBlocks.forEach((block, idx) => {
      const exp = block.experience || {};
      html += `
        <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #667eea;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0;">
            Giorno ${block.day || idx + 2}: ${exp.nome || 'Esperienza'}
          </h3>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            ${exp.descrizione || ''}
          </p>
        </div>
      `;
    });
  }

  html += '</div>';

  // Aggiungi hotel se presenti
  if (tripData.selectedHotels && tripData.selectedHotels.length > 0) {
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #374151; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
          🏨 Hotel
        </h2>
    `;

    tripData.selectedHotels.forEach(hotel => {
      html += `
        <div style="margin: 15px 0; padding: 12px; background: #f0f9ff; border-radius: 8px;">
          <h4 style="color: #1f2937; margin: 0 0 5px 0;">${hotel.nome || 'Hotel'}</h4>
          <p style="color: #6b7280; margin: 0; font-size: 13px;">
            📍 ${hotel.zona || ''} • 💰 €${hotel.prezzo || 0}
          </p>
        </div>
      `;
    });

    html += '</div>';
  }

  // Aggiungi riepilogo costi
  if (tripData.costoTotale) {
    html += `
      <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 12px;">
        <h2 style="color: #374151; margin: 0 0 15px 0;">💰 Riepilogo Costi</h2>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
          <span>Totale:</span>
          <span style="color: #667eea;">€${tripData.costoTotale}</span>
        </div>
      </div>
    `;
  }

  // Aggiungi footer
  html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Generato con Travel Crew v2.0 • ${new Date().toLocaleDateString('it-IT')}
      </p>
    </div>
  `;

  tempDiv.innerHTML = html;
  document.body.appendChild(tempDiv);

  try {
    await exportToPDF(tempDiv, filename, {
      orientation: 'portrait',
      format: 'a4',
    });
  } finally {
    // Rimuovi elemento temporaneo
    document.body.removeChild(tempDiv);
  }
}

/**
 * Esporta riepilogo viaggio completo come PDF
 *
 * @param {HTMLElement} summaryElement - Elemento DOM del summary
 * @param {string} filename - Nome file
 * @returns {Promise<void>}
 */
export async function exportTripSummaryPDF(summaryElement, filename = 'riepilogo-viaggio') {
  return exportToPDF(summaryElement, filename, {
    orientation: 'portrait',
    format: 'a4',
    quality: 0.95,
  });
}
