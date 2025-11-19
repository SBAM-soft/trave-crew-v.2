import { toast } from 'sonner';
import { loadEntityData } from '../../../core/utils/dataLoader';
import { calculateNightsForZone, formatPrice } from '../utils/validators';

/**
 * Configurazione completa del flow conversazionale
 * Con correzioni per campi CSV reali
 */

// Helper per filtrare zone disponibili in base a contatore (logica progressiva priorità)
const getAvailableZones = (allZones, itinerari, counter) => {
  if (!itinerari || itinerari.length === 0) {
    console.log('⚠️ Nessun itinerario disponibile, mostro tutte le zone');
    return allZones;
  }

  // Trova itinerari con CONTATORE_ZONA <= counter
  const availableItinerari = itinerari.filter(it => {
    const contatore = parseInt(it.CONTATORE_ZONA);
    return !isNaN(contatore) && contatore <= counter;
  });

  console.log(`📊 Itinerari disponibili con contatore <= ${counter}:`, availableItinerari.length);

  // Estrai codici zone da questi itinerari
  const codiciZoneDisponibili = new Set();
  availableItinerari.forEach(it => {
    ['ZONA_1', 'ZONA_2', 'ZONA_3', 'ZONA_4'].forEach(campo => {
      if (it[campo]) {
        codiciZoneDisponibili.add(it[campo]);
      }
    });
  });

  // Filtra zone
  const zoneDisponibili = allZones.filter(z => codiciZoneDisponibili.has(z.CODICE));

  if (zoneDisponibili.length === 0) {
    console.log('⚠️ Nessuna zona trovata, fallback a tutte le zone');
    return allZones;
  }

  console.log(`🔓 Contatore ${counter}: ${zoneDisponibili.length} zone disponibili`, zoneDisponibili.map(z => z.ZONA));
  return zoneDisponibili;
};

// Helper per estrarre esperienze da pacchetto (corretto con campi reali)
const extractExperiencesFromPackage = (packageData, esperienze) => {
  const experienceIds = [];

  // CORREZIONE: Usa DAY2_ESPERIENZA_STD invece di EXP_1
  ['DAY2_ESPERIENZA_STD', 'DAY3_ESPERIENZA_STD', 'DAY4_ESPERIENZA_STD',
   'DAY5_ESPERIENZA_STD', 'DAY6_ESPERIENZA_STD', 'DAY7_ESPERIENZA_STD',
   'DAY8_ESPERIENZA_STD', 'DAY9_ESPERIENZA_STD', 'DAY10_ESPERIENZA_STD'].forEach(slot => {
    if (packageData[slot] && packageData[slot] !== 'TBD') {
      experienceIds.push(packageData[slot]);
    }
  });

  // Trova dati completi esperienze dal database
  const experiences = experienceIds.map(code => {
    const expData = esperienze.find(e => e.CODICE === code);
    if (!expData) {
      console.warn(`⚠️ Esperienza ${code} non trovata nel database`);
      return null;
    }

    return {
      id: expData.CODICE,
      nome: expData.ESPERIENZE || expData.NOME_ESPERIENZA || `Esperienza ${code}`,
      descrizione: expData.DESCRIZIONE || '',
      durata: expData.SLOT ? `${expData.SLOT} ${expData.SLOT === 1 ? 'giorno' : 'giorni'}` : '1 giorno',
      prezzo: parseFloat(expData.PRX_PAX) || 0,
      difficolta: expData.DIFFICOLTA || 1,
      slot: parseInt(expData.SLOT) || 1,
      emoji: expData.EMOJI || '🎯',
      // Mantieni tutti i campi originali
      ...expData
    };
  }).filter(Boolean);

  return experiences;
};

// Helper per ottenere prezzo hotel medio (semplificato per MVP)
const getHotelAveragePrice = (hotel) => {
  const priceFields = Object.keys(hotel).filter(k => k.startsWith('PRZ_PAX_NIGHT_'));
  const prices = priceFields
    .map(f => parseFloat(hotel[f]))
    .filter(p => !isNaN(p) && p > 0);

  if (prices.length === 0) return 50; // Fallback
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
};

export const CHAT_FLOW_CONFIG = {

  // ===== STEP 1: WELCOME =====
  welcome: {
    id: 'welcome',
    type: 'bot_message_with_card',

    getMessage: ({ wizardData = {} }) => ({
      text: `Ciao! Vedo che vuoi organizzare un viaggio in ${wizardData.destinazioneNome || wizardData.destinazione || 'una destinazione fantastica'} per ${wizardData.numeroPersone || 2} persone con budget ${wizardData.budget || 'medio'}.\n\nTi aiuterò a costruire l'itinerario perfetto! 🎒`,
      card: {
        type: 'wizard_summary',
        data: wizardData
      }
    }),

    onEnter: async ({ addBotMessage, getMessage, wizardData, store }) => {
      console.log('📥 Wizard data ricevuto:', wizardData);

      const message = getMessage({ wizardData });
      addBotMessage(message.text, 'bot_message_with_card', { card: message.card });

      // Carica dati necessari in cache se non già caricati
      const cachedData = store.cachedData || {};
      const needsDataLoad = !cachedData.zone || cachedData.zone.length === 0 ||
                            !cachedData.pacchetti || cachedData.pacchetti.length === 0;

      if (needsDataLoad) {
        console.log('📥 Caricamento database per destinazione...');

        try {
          const [zone, pacchetti, esperienze, hotel, itinerario, extra, costi_accessori] = await Promise.all([
            loadEntityData('zone', true),
            loadEntityData('pacchetti', true),
            loadEntityData('esperienze', true),
            loadEntityData('hotel', true),
            loadEntityData('itinerario', false),
            loadEntityData('extra', false),
            loadEntityData('costi_accessori', false)
          ]);

          // Filtra per destinazione (Thailandia)
          const destName = wizardData?.destinazioneNome?.toLowerCase() || wizardData?.destinazione?.toLowerCase() || 'thailandia';

          const destZone = zone.filter(z =>
            z.DESTINAZIONE?.toLowerCase().includes(destName)
          );
          const destPacchetti = pacchetti.filter(p =>
            p.DESTINAZIONE?.toLowerCase().includes(destName)
          );
          const destHotel = hotel.filter(h =>
            h.DESTINAZIONE?.toLowerCase().includes(destName)
          );

          // Salva in cache
          store.setCachedData('zone', destZone);
          store.setCachedData('pacchetti', destPacchetti);
          store.setCachedData('esperienze', esperienze);
          store.setCachedData('hotel', destHotel);
          store.setCachedData('itinerario', itinerario);
          store.setCachedData('extra', extra);
          store.setCachedData('costi_accessori', costi_accessori);

          console.log('✅ Database caricato:', {
            zone: destZone.length,
            pacchetti: destPacchetti.length,
            hotel: destHotel.length
          });
        } catch (error) {
          console.error('❌ Errore caricamento database:', error);
          toast.error('Errore nel caricamento dei dati');
          // Non fare return qui - mostra comunque le opzioni
        }
      }

      // Mostra opzioni - sempre, anche in caso di errore nel caricamento
      setTimeout(() => {
        addBotMessage(
          'Iniziamo?',
          'bot_options',
          {
            options: [
              { value: 'start', label: '✅ Iniziamo!', emoji: '🚀' },
              { value: 'modify', label: '✏️ Modifica dati', emoji: '✏️' }
            ]
          }
        );
      }, 800);
    },

    onResponse: ({ value, addUserMessage, goToStep, wizardData, setTotalDays }) => {
      if (value === 'start') {
        addUserMessage('✅ Iniziamo!');

        // Se la durata è già stata scelta nel wizard, saltala e vai direttamente alle zone
        if (wizardData.durata && wizardData.durata > 0) {
          setTotalDays(wizardData.durata);
          console.log(`✅ Durata già impostata dal wizard: ${wizardData.durata} giorni`);
          goToStep('zones');
        } else {
          goToStep('duration');
        }
      } else {
        addUserMessage('✏️ Modifica dati');
        toast.info('Torna al wizard per modificare i dati');
      }
    },

    getNextStep: ({ wizardData }) => wizardData?.durata ? 'zones' : 'duration'
  },

  // ===== STEP 2: DURATA =====
  duration: {
    id: 'duration',
    type: 'bot_options',

    getMessage: () => 'Per quanti giorni vorresti partire?',

    onEnter: ({ addBotMessage, getMessage }) => {
      addBotMessage(
        getMessage(),
        'bot_options',
        {
          options: [
            {
              value: 4,
              label: '3-4 giorni',
              emoji: '🏃',
              description: 'Weekend lungo'
            },
            {
              value: 6,
              label: '5-6 giorni',
              emoji: '✈️',
              description: 'Settimana classica'
            },
            {
              value: 8,
              label: '7-8 giorni',
              emoji: '🌴',
              description: 'Relax totale'
            },
            {
              value: 10,
              label: '9-10 giorni',
              emoji: '🗺️',
              description: 'Esplorazione completa'
            }
          ]
        }
      );
    },

    onResponse: ({ value, addUserMessage, addBotMessage, setTotalDays, goToStep }) => {
      const days = parseInt(value);
      addUserMessage(`${days} giorni`);
      setTotalDays(days);

      // Messaggio di conferma
      addBotMessage(
        `Perfetto! ${days} giorni ti permetteranno di esplorare diverse zone senza fretta.\n\nIl primo giorno sarà dedicato all'arrivo e sistemazione, quindi avrai ${days - 2} giorni per le esperienze! 🎉`
      );

      // Vai al prossimo step
      setTimeout(() => goToStep('zones'), 1000);
    },

    getNextStep: () => 'zones'
  },

  // ===== STEP 3: ZONE =====
  zones: {
    id: 'zones',
    type: 'bot_map',

    getMessage: ({ wizardData = {}, tripData, availableCounter }) => {
      const daysAvailable = tripData.totalDays - 2;

      if (availableCounter === 1) {
        return `Iniziamo con la zona di arrivo! ✈️\n\nSeleziona l'aeroporto dove vuoi iniziare il tuo viaggio in ${wizardData.destinazioneNome || wizardData.destinazione || 'questa destinazione'}.\n\n💡 Altre zone si sbloccheranno dopo la selezione del primo pacchetto.`;
      }

      return `Ora scegli quali zone visitare durante il tuo viaggio.\n\n💡 Consiglio: 2-3 zone per ${tripData.totalDays} giorni è l'ideale!\n\nHai ${daysAvailable} giorni disponibili per le esperienze.`;
    },

    onEnter: ({ addBotMessage, getMessage, tripData, wizardData, store }) => {
      const availableCounter = store.availableCounter;
      const cachedData = store.cachedData || {};

      console.log('📍 Zone step - counter:', availableCounter, 'cachedData:', cachedData);

      addBotMessage(getMessage({ wizardData, tripData, availableCounter }));

      // SOLUZIONE SEMPLIFICATA: Mostra zone in base alla PRIORITA, non all'itinerario
      // Priorità 1 (01) al primo giro, poi tutte le altre
      const allZones = cachedData.zone || [];
      const availableZones = availableCounter === 1
        ? allZones.filter(z => parseInt(z.PRIORITA) === 1)
        : allZones.filter(z => parseInt(z.PRIORITA) > 1);

      console.log('📍 Available zones:', availableZones.length, availableZones.map(z => z.ZONA));

      // Per il primo contatore (priorità 1), mostra opzioni semplici invece di mappa
      if (availableCounter === 1) {
        // Filtra solo zone con priorità 1
        const primaryZones = availableZones.filter(z => parseInt(z.PRIORITA) === 1);

        setTimeout(() => {
          addBotMessage(
            'Dove vuoi iniziare il tuo viaggio?',
            'bot_options',
            {
              options: primaryZones.map(z => ({
                value: {
                  action: 'add',
                  zone: {
                    code: z.CODICE,
                    name: z.ZONA,
                    description: z.DESCRIZIONE || '',
                    daysRecommended: parseInt(z.GIORNI_CONSIGLIATI) || 2,
                    tipo: z.TIPO_AREA,
                    priorita: parseInt(z.PRIORITA) || 99
                  }
                },
                label: z.ZONA,
                emoji: z.TIPO_AREA === 'mare' ? '🏖️' : z.TIPO_AREA === 'montagna' ? '⛰️' : '🏙️',
                description: z.DESCRIZIONE?.substring(0, 60) + '...' || ''
              }))
            }
          );
        }, 600);
      } else {
        // Per contatori successivi, usa la mappa
        const zones = availableZones.map(z => ({
          code: z.CODICE,
          name: z.ZONA,
          description: z.DESCRIZIONE || '',
          daysRecommended: parseInt(z.GIORNI_CONSIGLIATI) || 2,
          coordinates: {
            lat: parseFloat(z.COORDINATE_LAT),
            lng: parseFloat(z.COORDINATE_LNG)
          },
          tipo: z.TIPO_AREA,
          priorita: parseInt(z.PRIORITA) || 99
        }));

        setTimeout(() => {
          addBotMessage(
            'Clicca sulla mappa per selezionare altre zone:',
            'bot_map',
            {
              zones,
              multiSelect: true,
              daysAvailable: tripData.totalDays - 2
            }
          );
        }, 600);
      }
    },

    onResponse: ({ value, addUserMessage, addBotMessage, addZone, goToStep, tripData, store }) => {
      const availableCounter = store.availableCounter;

      if (value.action === 'add') {
        addZone(value.zone);
        const totalDaysSelected = tripData.selectedZones.reduce((sum, z) => sum + z.daysRecommended, 0) + value.zone.daysRecommended;
        const daysAvailable = tripData.totalDays - 2;

        addUserMessage(`📍 ${value.zone.name}`);
        addBotMessage(`Ottima scelta! Hai selezionato ${value.zone.name}.`);

        // Se primo contatore (priorità 1), vai subito ai pacchetti
        if (availableCounter === 1) {
          setTimeout(() => {
            addBotMessage('Ora selezioniamo i pacchetti esperienza per questa zona! 📦');
            goToStep('packages');
          }, 1000);
        } else {
          // Contatori successivi - chiedi se proseguire o aggiungere zone
          if (totalDaysSelected >= daysAvailable) {
            setTimeout(() => {
              addBotMessage(
                'Perfetto! Hai coperto tutti i giorni disponibili. Proseguiamo?',
                'bot_options',
                {
                  options: [
                    { value: 'continue', label: '✅ Prosegui', emoji: '➡️' },
                    { value: 'modify', label: '✏️ Modifica zone', emoji: '🗺️' }
                  ]
                }
              );
            }, 500);
          } else {
            setTimeout(() => {
              addBotMessage(
                `Hai ${daysAvailable - totalDaysSelected} giorni disponibili. Vuoi aggiungere un'altra zona?`,
                'bot_options',
                {
                  options: [
                    { value: 'add_more', label: '➕ Aggiungi zona', emoji: '🗺️' },
                    { value: 'continue', label: '✅ Prosegui così', emoji: '➡️' }
                  ]
                }
              );
            }, 500);
          }
        }

      } else if (value === 'continue' || value === 'add_more') {
        if (value === 'continue') {
          addUserMessage('✅ Prosegui');
          goToStep('packages');
        } else {
          addUserMessage('➕ Aggiungi zona');
          // Rimani nello stesso step
        }
      } else if (value === 'modify') {
        addUserMessage('✏️ Modifica zone');
        // TODO: Implementare modifica zone
      }
    },

    getNextStep: ({ tripData }) => {
      return tripData.selectedZones.length > 0 ? 'packages' : 'zones';
    }
  },

  // ===== STEP 4: PACCHETTI (LOOP per ogni zona) =====
  packages: {
    id: 'packages',
    type: 'bot_cards',

    // Tiene traccia della zona corrente nel loop
    currentZoneIndex: 0,

    getMessage: ({ tripData }) => {
      const currentZone = tripData.selectedZones[CHAT_FLOW_CONFIG.packages.currentZoneIndex];
      if (!currentZone) return 'Selezioniamo i pacchetti esperienza!';
      return `Perfetto! Ora selezioniamo le esperienze per ${currentZone.name}.\n\nHo trovato pacchetti tematici basati sui tuoi interessi:`;
    },

    onEnter: ({ addBotMessage, getMessage, tripData, wizardData, store }) => {
      const currentZone = tripData.selectedZones[CHAT_FLOW_CONFIG.packages.currentZoneIndex];

      if (!currentZone) {
        console.error('❌ Nessuna zona selezionata per step packages');
        return;
      }

      addBotMessage(getMessage({ tripData }));

      // Carica pacchetti per zona
      const cachedData = store.cachedData;
      const pacchetti = cachedData.pacchetti;

      // Filtra pacchetti per zona
      let zonePacchetti = pacchetti
        .filter(p => p.ZONA_COLLEGATA === currentZone.code)
        .map(p => ({
          id: p.CODICE,
          name: p.NOME_PACCHETTO || p.NOME,
          description: p.DESCRIZIONE_BREVE || '',
          price: parseFloat(p.PRX_PAX) || 0,
          duration: parseInt(p.MIN_NOTTI) + 1 || 3,
          rating: p.RATING ? parseFloat(p.RATING) : 4.5,
          reviewCount: p.NUMERO_RECENSIONI ? parseInt(p.NUMERO_RECENSIONI) : 0,
          image: p.URL_IMMAGINE_COPERTINA || '',
          highlights: [p.HIGHLIGHT_1, p.HIGHLIGHT_2, p.HIGHLIGHT_3].filter(Boolean),
          tags: (p.TAG || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
          rawData: p // Mantieni dati originali per dopo
        }));

      // Filtra per interessi dell'utente se presenti
      const userInterests = wizardData.interessi || [];
      if (userInterests.length > 0) {
        const interestKeywords = userInterests.map(i => i.toLowerCase());

        // Prima prova con tag esatti
        let filtered = zonePacchetti.filter(p =>
          p.tags.some(tag => interestKeywords.some(interest => tag.includes(interest)))
        );

        // Se non trova nulla, prova con nome e descrizione
        if (filtered.length === 0) {
          filtered = zonePacchetti.filter(p => {
            const searchText = `${p.name} ${p.description}`.toLowerCase();
            return interestKeywords.some(interest => searchText.includes(interest));
          });
        }

        // Se ha trovato pacchetti filtrati, usali; altrimenti mostra tutti
        if (filtered.length > 0) {
          zonePacchetti = filtered;
          console.log(`🎯 Pacchetti filtrati per interessi [${userInterests.join(', ')}]:`, zonePacchetti.length);
        } else {
          console.log(`⚠️ Nessun pacchetto trovato per interessi [${userInterests.join(', ')}], mostro tutti`);
        }
      }

      // Limita a max 3 pacchetti (priorità a rating più alto)
      zonePacchetti = zonePacchetti
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);

      console.log(`📦 Pacchetti per ${currentZone.name}:`, zonePacchetti.length);

      if (zonePacchetti.length === 0) {
        addBotMessage(
          `Non ci sono pacchetti disponibili per ${currentZone.name}. Selezioniamo un'altra zona?`,
          'bot_options',
          {
            options: [
              { value: 'change_zone', label: '🔄 Cambia zona', emoji: '🗺️' }
            ]
          }
        );
        return;
      }

      setTimeout(() => {
        addBotMessage(
          'Quale ti ispira di più?',
          'bot_cards',
          {
            cards: zonePacchetti,
            zone: currentZone
          }
        );
      }, 800);
    },

    onResponse: async ({ value, addUserMessage, addBotMessage, addPackage, goToStep, tripData, store, incrementCounter }) => {
      // value può essere: { action: 'select', packageId, zoneCode }
      if (value.action === 'select') {
        const cachedData = store.cachedData;
        const pacchetti = cachedData.pacchetti;
        const esperienze = cachedData.esperienze;

        const packageData = pacchetti.find(p => p.CODICE === value.packageId);

        if (!packageData) {
          console.error('❌ Pacchetto non trovato:', value.packageId);
          return;
        }

        // Estrai esperienze usando helper (con campi corretti DAY2_ESPERIENZA_STD)
        const experiences = extractExperiencesFromPackage(packageData, esperienze);

        addUserMessage(`✅ Pacchetto selezionato: ${packageData.NOME_PACCHETTO}`);
        addBotMessage(`Fantastico! 🎉\n\nHo aggiunto il pacchetto "${packageData.NOME_PACCHETTO}" al tuo viaggio!`);

        // Aggiungi al trip
        addPackage(value.zoneCode, packageData, experiences);

        // Incrementa contatore per sbloccare nuove zone
        incrementCounter();

        // Controlla se ci sono altre zone
        CHAT_FLOW_CONFIG.packages.currentZoneIndex++;
        if (CHAT_FLOW_CONFIG.packages.currentZoneIndex < tripData.selectedZones.length) {
          // Altra zona → ripeti step packages
          setTimeout(() => {
            addBotMessage('Prossima zona!');
            goToStep('packages');
          }, 1000);
        } else {
          // Fine zone → vai a summary
          CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0; // Reset per prossima volta
          setTimeout(() => goToStep('summary_before_hotels'), 1500);
        }
      } else if (value === 'change_zone') {
        addUserMessage('🔄 Cambia zona');
        CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0;
        goToStep('zones');
      }
    },

    getNextStep: ({ tripData }) => {
      const allZonesHavePackages = tripData.selectedZones.every(zone =>
        tripData.filledBlocks.some(block => block.zoneCode === zone.code)
      );
      return allZonesHavePackages ? 'summary_before_hotels' : 'packages';
    }
  },

  // ===== STEP 5: RIEPILOGO PRE-HOTEL =====
  summary_before_hotels: {
    id: 'summary_before_hotels',
    type: 'bot_timeline',

    getMessage: () => 'Ecco il tuo itinerario completo! 🗺️\n\nHo organizzato l\'ordine delle esperienze:',

    onEnter: ({ addBotMessage, getMessage, tripData, calculateCosts }) => {
      calculateCosts();

      addBotMessage(getMessage());

      // Prepara dati timeline
      const days = Array.from({ length: tripData.totalDays }, (_, i) => {
        const dayNumber = i + 1;

        if (dayNumber === 1) {
          return {
            day: 1,
            type: 'arrival',
            title: '✈️ Arrivo',
            description: 'Check-in hotel e orientamento'
          };
        } else if (dayNumber === tripData.totalDays) {
          return {
            day: dayNumber,
            type: 'departure',
            title: '🏡 Ritorno',
            description: 'Check-out e viaggio di ritorno'
          };
        } else {
          const block = tripData.filledBlocks.find(b => b.day === dayNumber);
          return block ? {
            day: dayNumber,
            type: 'experience',
            zone: block.zone,
            experience: block.experience,
            package: block.package
          } : {
            day: dayNumber,
            type: 'free',
            title: '☀️ Giorno libero',
            description: 'Relax o esplorazione autonoma'
          };
        }
      });

      setTimeout(() => {
        // Per ora mostriamo testo semplice, poi implementeremo timeline visuale
        const summary = days.map(d => {
          if (d.type === 'arrival') return `Giorno ${d.day}: ${d.title}`;
          if (d.type === 'departure') return `Giorno ${d.day}: ${d.title}`;
          if (d.type === 'experience') return `Giorno ${d.day}: ${d.experience.nome} (${d.zone})`;
          return `Giorno ${d.day}: ${d.title}`;
        }).join('\n');

        addBotMessage(`${summary}\n\n💰 Costo stimato esperienze: €${tripData.costs.experiences}`);

        setTimeout(() => {
          addBotMessage(
            'Cosa vuoi fare?',
            'bot_options',
            {
              options: [
                { value: 'hotels', label: '✅ Prosegui con hotel', emoji: '🏨' },
                { value: 'modify', label: '✏️ Modifica itinerario', emoji: '✏️' },
                { value: 'save', label: '💾 Salva bozza', emoji: '💾' }
              ]
            }
          );
        }, 1000);
      }, 800);
    },

    onResponse: ({ value, addUserMessage, goToStep }) => {
      if (value === 'hotels') {
        addUserMessage('✅ Prosegui con hotel');
        goToStep('hotels');
      } else if (value === 'modify') {
        addUserMessage('✏️ Modifica itinerario');
        toast.info('Seleziona un giorno dalla timeline per modificarlo');
      } else if (value === 'save') {
        addUserMessage('💾 Salva bozza');
        toast.success('Bozza salvata nei miei viaggi!');
      }
    },

    getNextStep: () => 'hotels'
  },

  // ===== STEP 6: HOTEL (LOOP per ogni zona) =====
  hotels: {
    id: 'hotels',
    type: 'bot_hotel_selector',

    currentZoneIndex: 0,

    getMessage: ({ tripData }) => {
      const totalZones = tripData.selectedZones.length;
      if (CHAT_FLOW_CONFIG.hotels.currentZoneIndex === 0) {
        return `Ora selezioniamo gli hotel! 🏨\n\nServono hotel per:\n${tripData.selectedZones.map(z => `• ${z.name}`).join('\n')}`;
      } else {
        const zone = tripData.selectedZones[CHAT_FLOW_CONFIG.hotels.currentZoneIndex];
        return `Hotel per ${zone.name}:`;
      }
    },

    onEnter: ({ addBotMessage, getMessage, tripData, wizardData, store }) => {
      const zone = tripData.selectedZones[CHAT_FLOW_CONFIG.hotels.currentZoneIndex];
      const notti = calculateNightsForZone(zone.code, tripData);

      addBotMessage(getMessage({ tripData }));

      // Carica hotel per zona
      const cachedData = store.cachedData;
      const hotel = cachedData.hotel;
      const extra = cachedData.extra;

      // Crea tier basati sul budget wizard
      const budgetTier = wizardData.budget?.toLowerCase() || 'medium';

      const tiers = [
        {
          id: 'low',
          nome: 'LOW',
          emoji: '💰',
          prezzo: 40,
          recommended: budgetTier === 'low',
          features: ['Max 2★', 'Servizi base', 'Posizione: Buona']
        },
        {
          id: 'medium',
          nome: 'MEDIUM',
          emoji: '💎',
          prezzo: 75,
          recommended: budgetTier === 'medium',
          features: ['3-4★', 'Colazione inclusa', 'WiFi, piscina', 'Posizione: Centrale']
        },
        {
          id: 'high',
          nome: 'LUXURY',
          emoji: '👑',
          prezzo: 150,
          recommended: budgetTier === 'high',
          features: ['5★', 'Colazione premium', 'Spa, gym, rooftop', 'Posizione: Premium']
        }
      ];

      // Extra hotel disponibili
      const hotelExtras = extra
        .filter(e => e.TIPO?.toLowerCase() === 'hotel')
        .map(e => ({
          id: e.CODICE,
          nome: e.NOME_EXTRA || e.NOME,
          prezzo: parseFloat(e.PREZZO_PP) || 0,
          descrizione: e.DESCRIZIONE || ''
        }));

      setTimeout(() => {
        addBotMessage(
          'Scegli la categoria hotel:',
          'bot_hotel_selector',
          {
            zona: zone.name,
            notti,
            tiers,
            extras: hotelExtras
          }
        );
      }, 800);
    },

    onResponse: ({ value, addUserMessage, addBotMessage, selectHotel, goToStep, tripData, store }) => {
      // value = { tier, extras[], note }
      const zone = tripData.selectedZones[CHAT_FLOW_CONFIG.hotels.currentZoneIndex];
      const notti = calculateNightsForZone(zone.code, tripData);

      selectHotel(zone.code, value.tier, notti, value.extras, value.note);

      addUserMessage(`🏨 Hotel ${value.tier.toUpperCase()}`);
      addBotMessage(`Ottima scelta! Hotel ${value.tier.toUpperCase()} confermato per ${zone.name}.`);

      // Prossima zona o fine
      CHAT_FLOW_CONFIG.hotels.currentZoneIndex++;
      if (CHAT_FLOW_CONFIG.hotels.currentZoneIndex < tripData.selectedZones.length) {
        setTimeout(() => goToStep('hotels'), 1000);
      } else {
        CHAT_FLOW_CONFIG.hotels.currentZoneIndex = 0; // Reset
        setTimeout(() => goToStep('final_summary'), 1500);
      }
    },

    getNextStep: ({ tripData }) => {
      const allZonesHaveHotels = tripData.selectedZones.every(zone =>
        tripData.hotels.some(h => h.zona === zone.code)
      );
      return allZonesHaveHotels ? 'final_summary' : 'hotels';
    }
  },

  // ===== STEP 7: RIEPILOGO FINALE =====
  final_summary: {
    id: 'final_summary',
    type: 'bot_final_card',

    getMessage: () => 'Il tuo viaggio è pronto! 🎉',

    onEnter: ({ addBotMessage, getMessage, tripData, calculateCosts }) => {
      calculateCosts();

      addBotMessage(getMessage());

      setTimeout(() => {
        const summary = `
📍 Destinazione: ${tripData.selectedZones.map(z => z.name).join(', ')}
🗓️ Durata: ${tripData.totalDays} giorni
🎯 Esperienze: ${tripData.filledBlocks.length}
🏨 Hotel: ${tripData.hotels.length} zone

💰 COSTO TOTALE: €${tripData.costs.total}
   ├─ Esperienze: €${tripData.costs.experiences}
   ├─ Hotel: €${tripData.costs.hotels}
   ├─ Extra hotel: €${tripData.costs.hotelExtras}
   └─ Accessori: €${tripData.costs.accessories}
        `;

        addBotMessage(summary);

        setTimeout(() => {
          addBotMessage(
            'Cosa vuoi fare con il tuo viaggio?',
            'bot_options',
            {
              options: [
                { value: 'save', label: '💾 Salva nei miei viaggi', emoji: '💾' },
                { value: 'share', label: '📤 Condividi', emoji: '📤' },
                { value: 'publish', label: '🌍 Pubblica in Esplora', emoji: '🌍' },
                { value: 'edit', label: '✏️ Modifica', emoji: '✏️' }
              ]
            }
          );
        }, 1000);
      }, 800);
    },

    onResponse: ({ value, addUserMessage }) => {
      if (value === 'save') {
        addUserMessage('💾 Salva nei miei viaggi');
        toast.success('Viaggio salvato!');
      } else if (value === 'share') {
        addUserMessage('📤 Condividi');
        toast.info('Feature condivisione: coming soon');
      } else if (value === 'publish') {
        addUserMessage('🌍 Pubblica in Esplora');
        toast.success('Viaggio pubblicato!');
      } else if (value === 'edit') {
        addUserMessage('✏️ Modifica');
        toast.info('Clicca su un elemento per modificarlo');
      }
    },

    getNextStep: () => null // Fine flow
  }
};

export default CHAT_FLOW_CONFIG;
