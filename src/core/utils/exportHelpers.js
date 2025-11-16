/**
 * Helper per esportazione itinerari
 */

/**
 * Genera testo formattato dell'itinerario
 */
export function generateItineraryText(tripData) {
  const { wizardData, timeline, totalDays, totalCost } = tripData;

  let text = `═══════════════════════════════════════════════════════\n`;
  text += `🗺️  ITINERARIO DI VIAGGIO - ${wizardData.destinazione.toUpperCase()}\n`;
  text += `═══════════════════════════════════════════════════════\n\n`;

  text += `📋 DETTAGLI VIAGGIO\n`;
  text += `─────────────────────────────────────────────────────\n`;
  text += `📍 Destinazione: ${wizardData.destinazione}\n`;
  text += `📅 Durata: ${totalDays} giorni\n`;
  text += `👥 Partecipanti: ${wizardData.numeroPersone} ${wizardData.numeroPersone === 1 ? 'persona' : 'persone'}\n`;
  if (wizardData.dataPartenza) {
    text += `🛫 Partenza: ${new Date(wizardData.dataPartenza).toLocaleDateString('it-IT')}\n`;
  }
  if (totalCost) {
    text += `💰 Costo stimato: €${totalCost.toFixed(2)}\n`;
  }
  text += `\n`;

  text += `📅 PROGRAMMA GIORNALIERO\n`;
  text += `═══════════════════════════════════════════════════════\n\n`;

  timeline.forEach((day, index) => {
    text += `┌─ GIORNO ${day.dayNumber} `;
    text += `${'─'.repeat(Math.max(0, 45 - day.dayNumber.toString().length))}\n`;

    if (day.type === 'arrival') {
      text += `│ ✈️ ${day.title}\n`;
      text += `│ ${day.description}\n`;
      if (day.notes) {
        text += `│ 📝 Note: ${day.notes}\n`;
      }
    } else if (day.type === 'experience' && day.experiences && day.experiences.length > 0) {
      day.experiences.forEach(exp => {
        text += `│ 🎯 ${exp.nome || exp.NOME || 'Esperienza'}\n`;
        if (exp.descrizione || exp.DESCRIZIONE) {
          const desc = exp.descrizione || exp.DESCRIZIONE;
          text += `│    ${desc.substring(0, 60)}${desc.length > 60 ? '...' : ''}\n`;
        }
        if (exp.durata || exp.DURATA) {
          text += `│    ⏱️  ${exp.durata || exp.DURATA}\n`;
        }
        if (exp.prezzo || exp.PREZZO) {
          text += `│    💵 €${exp.prezzo || exp.PREZZO}\n`;
        }
      });
      if (day.notes) {
        text += `│ 📝 Note: ${day.notes}\n`;
      }
    } else if (day.type === 'free') {
      text += `│ 🌴 ${day.title}\n`;
      text += `│ ${day.description}\n`;
      if (day.notes) {
        text += `│ 📝 Note: ${day.notes}\n`;
      }
    } else {
      text += `│ 📝 ${day.title}\n`;
      text += `│ ${day.description || 'Da pianificare'}\n`;
    }

    text += `└${'─'.repeat(50)}\n\n`;
  });

  text += `═══════════════════════════════════════════════════════\n`;
  text += `Generato con Travel Crew v2.0 - ${new Date().toLocaleDateString('it-IT')}\n`;
  text += `═══════════════════════════════════════════════════════\n`;

  return text;
}

/**
 * Scarica itinerario come file di testo
 */
export function downloadAsText(tripData) {
  try {
    const text = generateItineraryText(tripData);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerario-${tripData.wizardData.destinazione.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Errore download testo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Copia itinerario negli appunti
 */
export async function copyToClipboard(tripData) {
  try {
    const text = generateItineraryText(tripData);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } else {
      // Fallback per browser che non supportano clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      return { success: true };
    }
  } catch (error) {
    console.error('Errore copia clipboard:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Genera link condivisibile (simulato - richiede backend)
 */
export function generateShareLink(tripData) {
  // TODO: Implementare backend endpoint per generare link condivisibili
  // Per ora generiamo un link simulato con i dati codificati

  try {
    const shareData = {
      dest: tripData.wizardData.destinazione,
      days: tripData.totalDays,
      people: tripData.wizardData.numeroPersone,
      timestamp: Date.now()
    };

    // Simula un hash
    const hash = btoa(JSON.stringify(shareData)).substring(0, 12);
    const shareUrl = `${window.location.origin}/shared/${hash}`;

    return {
      success: true,
      url: shareUrl,
      message: 'Link generato! Nota: questa è una demo, richiede implementazione backend per link permanenti.'
    };
  } catch (error) {
    console.error('Errore generazione link:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Esporta come JSON (per backup o import futuro)
 */
export function downloadAsJSON(tripData) {
  try {
    const json = JSON.stringify(tripData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerario-${tripData.wizardData.destinazione.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Errore download JSON:', error);
    return { success: false, error: error.message };
  }
}

/**
 * TODO: Esporta come PDF (richiede libreria html2pdf o jsPDF)
 *
 * Per implementazione futura:
 * 1. npm install jspdf html2canvas
 * 2. Generare HTML formattato
 * 3. Convertire in PDF con jsPDF
 */
export async function downloadAsPDF(tripData) {
  // Placeholder per futura implementazione
  return {
    success: false,
    error: 'Esportazione PDF in arrivo nella prossima versione! Per ora usa il download come testo.'
  };
}
