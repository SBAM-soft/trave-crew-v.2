import { toast } from 'sonner';
import { loadEntityData } from '../../../core/utils/dataLoader';
import { calculateNightsForZone, formatPrice } from '../utils/validators';

/**
 * Configurazione completa del flow conversazionale
 * Con correzioni per campi CSV reali
 */

// Helper per normalizzare codici zona (rimuove zeri finali per matching)
const normalizeZoneCode = (code) => {
  if (!code) return '';
  // Rimuove zeri prima degli ultimi 1-2 caratteri numerici (es. ZTHBA01 -> ZTHBA1)
  return code.replace(/0+(\d{1,2})$/, '$1');
};

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
      const needsDataLoad = !cachedData.zone || cachedData.zone.length === 0;

      if (needsDataLoad) {
        console.log('📥 Caricamento database per destinazione...');

        try {
          const [zone, esperienze, hotel, itinerario, extra, costi_accessori] = await Promise.all([
            loadEntityData('zone', true),
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
          const destEsperienze = esperienze.filter(e =>
            e.DESTINAZIONE?.toLowerCase().includes(destName)
          );
          const destHotel = hotel.filter(h =>
            h.DESTINAZIONE?.toLowerCase().includes(destName)
          );

          // Salva in cache
          store.setCachedData('zone', destZone);
          // pacchetti removed (Nov 2025)
          store.setCachedData('esperienze', destEsperienze);
          store.setCachedData('hotel', destHotel);
          store.setCachedData('itinerario', itinerario);
          store.setCachedData('extra', extra);
          store.setCachedData('costi_accessori', costi_accessori);

          console.log('✅ Database caricato:', {
            zone: destZone.length,
            esperienze: destEsperienze.length,
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

  // ===== STEP 2: DURATA (NOTTI) =====
  duration: {
    id: 'duration',
    type: 'bot_options',

    getMessage: () => '🌙 Quante notti vuoi dormire in viaggio?',

    onEnter: ({ addBotMessage, getMessage }) => {
      addBotMessage(
        getMessage(),
        'bot_options',
        {
          options: [
            {
              value: 4,
              label: '3 notti',
              emoji: '🏃',
              description: 'Weekend lungo (4 giorni)'
            },
            {
              value: 6,
              label: '5 notti',
              emoji: '✈️',
              description: 'Settimana classica (6 giorni)'
            },
            {
              value: 8,
              label: '7 notti',
              emoji: '🌴',
              description: 'Relax totale (8 giorni)'
            },
            {
              value: 10,
              label: '9 notti',
              emoji: '🗺️',
              description: 'Esplorazione completa (10 giorni)'
            },
            {
              value: 14,
              label: '13 notti',
              emoji: '🌏',
              description: 'Viaggio epico (14 giorni)'
            },
            {
              value: 'custom',
              label: 'Altro...',
              emoji: '✏️',
              description: 'Scegli tu il numero di notti'
            }
          ]
        }
      );
    },

    onResponse: ({ value, addUserMessage, addBotMessage, setTotalDays, goToStep }) => {
      // Gestisci opzione "Altro..."
      if (value === 'custom') {
        addUserMessage('✏️ Altro...');

        // Mostra opzioni con numeri custom
        setTimeout(() => {
          addBotMessage(
            'Scegli il numero di notti che preferisci:',
            'bot_options',
            {
              options: [
                { value: 5, label: '4 notti', emoji: '📅' },
                { value: 7, label: '6 notti', emoji: '📅' },
                { value: 9, label: '8 notti', emoji: '📅' },
                { value: 11, label: '10 notti', emoji: '📅' },
                { value: 12, label: '11 notti', emoji: '📅' },
                { value: 15, label: '14 notti', emoji: '📅' },
                { value: 20, label: '19 notti', emoji: '📅' },
                { value: 30, label: '29 notti', emoji: '📅' }
              ]
            }
          );
        }, 500);
        return;
      }

      const days = parseInt(value);
      const nights = days - 1;
      addUserMessage(`${nights} ${nights === 1 ? 'notte' : 'notti'} (${days} giorni)`);
      setTotalDays(days);

      // Messaggio di conferma
      addBotMessage(
        `Perfetto! Con ${nights} ${nights === 1 ? 'notte' : 'notti'} (${days} giorni totali) potrai esplorare diverse zone senza fretta.\n\nIl primo giorno sarà dedicato all'arrivo e sistemazione, quindi avrai circa ${days - 2} giorni pieni per le esperienze! 🎉`
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
                    daysRecommended: 1, // Sempre 1 giorno alla volta
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
          daysRecommended: 1, // Sempre 1 giorno alla volta
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

    onResponse: ({ value, addUserMessage, addBotMessage, addZone, goToStep, tripData, store, removeZone }) => {
      const availableCounter = store.availableCounter;

      if (value.action === 'add') {
        addZone(value.zone);
        const totalDaysSelected = tripData.selectedZones.reduce((sum, z) => sum + z.daysRecommended, 0) + value.zone.daysRecommended;
        const daysAvailable = tripData.totalDays - 2;

        addUserMessage(`📍 ${value.zone.name}`);

        // Chiedi se è solo di passaggio o vuole fermarsi
        setTimeout(() => {
          addBotMessage(
            `Vuoi fermarti in ${value.zone.name} per visitarla, o sei solo di passaggio?`,
            'bot_options',
            {
              options: [
                {
                  value: { action: 'stay', zone: value.zone },
                  label: `✨ Scegli un'esperienza`,
                  emoji: '🎯'
                },
                {
                  value: { action: 'transit', zone: value.zone },
                  label: 'Sono solo di passaggio',
                  emoji: '🚗',
                  description: 'Non fermarti, prosegui verso la prossima destinazione'
                }
              ]
            }
          );
        }, 800);

      } else if (value.action === 'stay') {
        const zone = value.zone;
        addUserMessage(`✨ Scegli un'esperienza in ${zone.name}`);
        addBotMessage(`Perfetto! Ora seleziona un'esperienza da fare in ${zone.name}.`);

        const totalDaysSelected = tripData.selectedZones.reduce((sum, z) => sum + z.daysRecommended, 0);
        const daysAvailable = tripData.totalDays - 2;

        // Se primo contatore (priorità 1), vai subito ai pacchetti
        if (availableCounter === 1) {
          setTimeout(() => {
            addBotMessage('Ora selezioniamo le esperienze per questa zona! ✨');
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

      } else if (value.action === 'transit') {
        const zone = value.zone;
        // Rimuovi la zona appena aggiunta e riaggiungi con flag isTransit
        removeZone(zone.code);
        addZone({ ...zone, isTransit: true, daysRecommended: 0 });

        addUserMessage(`🚗 Solo di passaggio - ${zone.name}`);
        addBotMessage(`Ok! Passerai per ${zone.name} senza fermarti. Questa zona non richiederà giorni dal tuo itinerario.`);

        const totalDaysSelected = tripData.selectedZones
          .filter(z => !z.isTransit)
          .reduce((sum, z) => sum + z.daysRecommended, 0);
        const daysAvailable = tripData.totalDays - 2;

        // Chiedi se aggiungere altre zone
        setTimeout(() => {
          if (totalDaysSelected >= daysAvailable) {
            addBotMessage(
              'Hai coperto tutti i giorni disponibili. Proseguiamo?',
              'bot_options',
              {
                options: [
                  { value: 'continue', label: '✅ Prosegui', emoji: '➡️' },
                  { value: 'add_more', label: '➕ Aggiungi altra zona', emoji: '🗺️' }
                ]
              }
            );
          } else {
            addBotMessage(
              `Hai ancora ${daysAvailable - totalDaysSelected} giorni disponibili. Vuoi aggiungere un'altra zona?`,
              'bot_options',
              {
                options: [
                  { value: 'add_more', label: '➕ Aggiungi zona', emoji: '🗺️' },
                  { value: 'continue', label: '✅ Prosegui così', emoji: '➡️' }
                ]
              }
            );
          }
        }, 800);

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

  // ===== STEP 4: ESPERIENZE SINGOLE (LOOP per ogni zona) =====
  packages: {
    id: 'packages',
    type: 'bot_experience_swipe', // Nuovo tipo per swipe esperienze

    // Tiene traccia della zona corrente nel loop
    currentZoneIndex: 0,
    // Lista esperienze disponibili per la zona corrente
    availableExperiences: [],
    // Indice esperienza corrente mostrata
    currentExperienceIndex: 0,
    // Esperienze già selezionate (liked) per la zona corrente
    selectedExperiences: [],

    getMessage: ({ tripData }) => {
      const currentZone = tripData.selectedZones[CHAT_FLOW_CONFIG.packages.currentZoneIndex];
      if (!currentZone) return 'Selezioniamo le esperienze per il tuo viaggio!';
      const daysNeeded = parseInt(currentZone.daysRecommended) || 3;
      return `Perfetto! Ora selezioniamo le esperienze per **${currentZone.name}**.\n\nHai ${daysNeeded} ${daysNeeded === 1 ? 'giorno' : 'giorni'} disponibili. Ti mostrerò le migliori esperienze una alla volta.\n\n❤️ Mi piace = Aggiungi\n👎 Non mi interessa = Salta`;
    },

    onEnter: ({ addBotMessage, getMessage, tripData, wizardData, store, goToStep, incrementCounter }) => {
      // Trova la prossima zona che non sia solo di passaggio
      let currentZone = null;
      while (CHAT_FLOW_CONFIG.packages.currentZoneIndex < tripData.selectedZones.length) {
        const zone = tripData.selectedZones[CHAT_FLOW_CONFIG.packages.currentZoneIndex];
        if (!zone.isTransit) {
          currentZone = zone;
          break;
        }
        // Skip questa zona di transito
        console.log(`⏭️ Skipping transit zone: ${zone.name}`);
        CHAT_FLOW_CONFIG.packages.currentZoneIndex++;
        incrementCounter();
      }

      // Se non ci sono più zone da visitare, vai al summary
      if (!currentZone) {
        console.log('✅ No more zones to process, going to summary');
        CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0;
        goToStep('summary_before_hotels');
        return;
      }

      console.log(`📍 Step packages - Processing zone: ${currentZone.name} (${currentZone.code})`);

      // Genera messaggio con zona corrente
      const daysNeeded = parseInt(currentZone.daysRecommended) || 3;
      const message = `Perfetto! Ora selezioniamo le esperienze per **${currentZone.name}**.\n\nHai ${daysNeeded} ${daysNeeded === 1 ? 'giorno' : 'giorni'} disponibili. Ti mostrerò le migliori esperienze una alla volta.\n\n❤️ Mi piace = Aggiungi\n👎 Non mi interessa = Salta`;

      addBotMessage(message);

      // Reset selezioni per questa zona
      CHAT_FLOW_CONFIG.packages.selectedExperiences = [];
      CHAT_FLOW_CONFIG.packages.currentExperienceIndex = 0;

      // Carica ESPERIENZE per zona (invece di pacchetti)
      const cachedData = store.cachedData;
      const esperienze = cachedData.esperienze || [];

      // Filtra esperienze per zona (usa normalizzazione per match robusto)
      const normalizedZoneCode = normalizeZoneCode(currentZone.code);
      let zoneExperiences = esperienze
        .filter(exp => normalizeZoneCode(exp.ZONA_COLLEGATA) === normalizedZoneCode)
        .map(exp => {
          const slot = parseInt(exp.SLOT) || 1;
          const difficolta = parseInt(exp.DIFFICOLTA) || 1;

          // Genera emoji basato sul tipo esperienza
          const getEmojiByType = (tipo) => {
            const tipoLower = (tipo || '').toLowerCase();
            if (tipoLower.includes('tour')) return '🚌';
            if (tipoLower.includes('mare') || tipoLower.includes('spiaggia')) return '🏖️';
            if (tipoLower.includes('templo') || tipoLower.includes('tempio')) return '🛕';
            if (tipoLower.includes('natura') || tipoLower.includes('parco')) return '🌴';
            if (tipoLower.includes('cibo') || tipoLower.includes('food')) return '🍜';
            if (tipoLower.includes('avventura')) return '🧗';
            if (tipoLower.includes('cultura')) return '🎭';
            return '🎯';
          };

          return {
            id: exp.CODICE,
            code: exp.CODICE,
            nome: exp.ESPERIENZE || 'Esperienza',
            descrizione: exp.DESCRIZIONE || '',
            descrizioneEstesa: exp.DESCRIZIONE || '',
            prezzo: parseFloat(exp.PRX_PAX) || 0,
            durata: `${slot} ${slot === 1 ? 'giorno' : 'giorni'}`,
            tipo: exp.TIPO || 'Esperienza',
            difficolta: difficolta,
            emoji: getEmojiByType(exp.TIPO),
            immagini: [],
            highlights: [],
            incluso: [],
            nonIncluso: [],
            note: '',
            rating: 4.5,
            tags: [],
            slot: slot,
            rawData: exp
          };
        });

      // Filtra per interessi dell'utente se presenti
      const userInterests = wizardData.interessi || [];
      if (userInterests.length > 0 && zoneExperiences.length > 5) {
        const interestKeywords = userInterests.map(i => i.toLowerCase());

        // Prima prova con tag esatti
        let filtered = zoneExperiences.filter(exp =>
          exp.tags.some(tag => interestKeywords.some(interest => tag.includes(interest)))
        );

        // Se non trova nulla, prova con nome e descrizione
        if (filtered.length === 0) {
          filtered = zoneExperiences.filter(exp => {
            const searchText = `${exp.nome} ${exp.descrizione} ${exp.tipo}`.toLowerCase();
            return interestKeywords.some(interest => searchText.includes(interest));
          });
        }

        // Se ha trovato esperienze filtrate, usali; altrimenti mostra tutte
        if (filtered.length > 0) {
          zoneExperiences = filtered;
          console.log(`🎯 Esperienze filtrate per interessi [${userInterests.join(', ')}]:`, zoneExperiences.length);
        }
      }

      // Ordina per rating e shuffle parziale per varietà
      zoneExperiences = zoneExperiences
        .sort((a, b) => b.rating - a.rating);

      console.log(`✨ Esperienze totali nel cachedData:`, esperienze.length);
      console.log(`✨ Zone code: ${currentZone.code} -> normalized: ${normalizedZoneCode}`);
      console.log(`✨ Esperienze filtrate per ${currentZone.name} (${currentZone.code}):`, zoneExperiences.length);

      if (zoneExperiences.length > 0) {
        console.log('🔍 Prima esperienza:', {
          nome: zoneExperiences[0].nome,
          zona: currentZone.name,
          prezzo: zoneExperiences[0].prezzo,
          highlights: zoneExperiences[0].highlights
        });
      }

      if (zoneExperiences.length === 0) {
        console.warn(`⚠️ Nessuna esperienza trovata per zona ${currentZone.code}`);
        addBotMessage(
          `Non ci sono esperienze disponibili per ${currentZone.name}. Selezioniamo un'altra zona?`,
          'bot_options',
          {
            options: [
              { value: 'change_zone', label: '🔄 Cambia zona', emoji: '🗺️' }
            ]
          }
        );
        return;
      }

      // Salva lista esperienze disponibili
      CHAT_FLOW_CONFIG.packages.availableExperiences = zoneExperiences;

      // Mostra prime 3 esperienze con like/dislike (cards affiancate)
      setTimeout(() => {
        const experiencesToShow = zoneExperiences.slice(0, 3);

        console.log('📤 Adding bot message with 3 experience cards:', {
          type: 'bot_experience_cards_row',
          zoneName: currentZone.name,
          experiencesCount: experiencesToShow.length
        });

        addBotMessage(
          `Ecco le migliori esperienze per ${currentZone.name}! Scegli quella che ti piace di più:`,
          'bot_experience_cards_row',
          {
            experiences: experiencesToShow,
            zone: currentZone
          }
        );
      }, 800);
    },

    onResponse: async ({ value, addUserMessage, addBotMessage, addExperience, goToStep, tripData, store, incrementCounter }) => {
      const currentZone = tripData.selectedZones[CHAT_FLOW_CONFIG.packages.currentZoneIndex];

      // ===== GESTIONE LIKE =====
      if (value && value.action === 'like') {
        const experience = value.experience;

        // Aggiungi esperienza alle selezionate
        CHAT_FLOW_CONFIG.packages.selectedExperiences.push(experience);

        addUserMessage(`❤️ ${experience.nome}`);

        // Aggiungi esperienza al trip (salva nella timeline)
        addExperience(currentZone.code, experience);

        addBotMessage(`Perfetto! "${experience.nome}" è stata aggiunta al tuo viaggio! ✨`);

        // Calcola giorni totali selezionati (ogni blocco = 1 giorno)
        // +1 perché addExperience è asincrono e lo stato potrebbe non essere ancora aggiornato
        const totalDaysUsed = tripData.filledBlocks.length + 1;
        const daysAvailable = tripData.totalDays - 2; // -2 per arrivo/partenza

        console.log(`📊 Giorni usati: ${totalDaysUsed}/${daysAvailable}`);

        // Chiedi cosa fare dopo
        setTimeout(() => {
          if (totalDaysUsed >= daysAvailable) {
            // Giorni completati → vai al summary
            addBotMessage(
              `🎉 Hai completato il tuo itinerario! (${totalDaysUsed} giorni)`,
              'bot_options',
              {
                options: [
                  { value: 'finish_trip', label: '✅ Completa il viaggio', emoji: '🎊' },
                  { value: 'add_more', label: '➕ Aggiungi altro giorno', emoji: '📅' }
                ]
              }
            );
          } else {
            // Chiedi se vuole un'altra esperienza, cambiare zona o giorno libero
            addBotMessage(
              `Cosa vuoi fare ora? (${totalDaysUsed}/${daysAvailable} giorni usati)`,
              'bot_options',
              {
                options: [
                  { value: 'another_experience', label: '🎯 Altra esperienza qui', emoji: '✨' },
                  { value: 'free_day', label: '🏖️ Giorno libero', emoji: '☀️' },
                  { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' },
                  { value: 'finish_trip', label: '✅ Completa così', emoji: '👍' }
                ]
              }
            );
          }
        }, 800);
      }
      // ===== GESTIONE DISLIKE =====
      else if (value && value.action === 'dislike') {
        const experience = value.experience;

        addUserMessage(`👎 ${experience.nome}`);

        // Trova le prossime 3 esperienze non ancora viste o selezionate
        const allExperiences = CHAT_FLOW_CONFIG.packages.availableExperiences;
        const selectedIds = new Set(CHAT_FLOW_CONFIG.packages.selectedExperiences.map(e => e.id));

        // Trova esperienze rimanenti (escludi quelle già selezionate)
        const remainingExperiences = allExperiences.filter(exp => !selectedIds.has(exp.id));

        if (remainingExperiences.length > 0) {
          // Mostra prossime 3 esperienze
          const nextExperiences = remainingExperiences.slice(0, 3);

          setTimeout(() => {
            addBotMessage(
              `Nessun problema! Che ne dici di queste altre?`,
              'bot_experience_cards_row',
              {
                experiences: nextExperiences,
                zone: currentZone
              }
            );
          }, 800);
        } else {
          // Finite le esperienze
          addBotMessage(
            `Hai visto tutte le esperienze disponibili per ${currentZone.name}! Cosa vuoi fare?`,
            'bot_options',
            {
              options: [
                { value: 'free_day', label: '🏖️ Giorno libero', emoji: '☀️' },
                { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' },
                { value: 'finish_trip', label: '✅ Completa così', emoji: '👍' }
              ]
            }
          );
        }
      } else if (value === 'another_experience') {
        addUserMessage(`🎯 Altra esperienza qui`);

        // Trova le prossime 3 esperienze non ancora selezionate
        const allExperiences = CHAT_FLOW_CONFIG.packages.availableExperiences;
        const selectedIds = new Set(CHAT_FLOW_CONFIG.packages.selectedExperiences.map(e => e.id));

        // Filtra esperienze rimanenti (escludi quelle già selezionate)
        const remainingExperiences = allExperiences.filter(exp => !selectedIds.has(exp.id));

        if (remainingExperiences.length > 0) {
          // Mostra prossime 3 esperienze
          const nextExperiences = remainingExperiences.slice(0, 3);

          setTimeout(() => {
            addBotMessage(
              `Ecco altre esperienze disponibili per ${currentZone.name}!`,
              'bot_experience_cards_row',
              {
                experiences: nextExperiences,
                zone: currentZone
              }
            );
          }, 800);
        } else {
          // Finite le esperienze
          addBotMessage(
            `Hai visto tutte le esperienze disponibili per ${currentZone.name}! Cosa vuoi fare?`,
            'bot_options',
            {
              options: [
                { value: 'free_day', label: '🏖️ Giorno libero', emoji: '☀️' },
                { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' },
                { value: 'finish_trip', label: '✅ Completa così', emoji: '👍' }
              ]
            }
          );
        }
      } else if (value === 'free_day') {
        addUserMessage('🏖️ Giorno libero');

        // Mostra il selettore per scegliere quanti giorni liberi
        setTimeout(() => {
          addBotMessage(
            `Perfetto! Seleziona quanti giorni liberi vuoi aggiungere:`,
            'bot_free_day_selector'
          );
        }, 500);
      } else if (value && value.action === 'confirm_free_days') {
        // L'utente ha confermato i giorni liberi dal selettore
        const numDays = value.days || 1;

        // Aggiungi N giorni liberi
        for (let i = 0; i < numDays; i++) {
          const freeDayExperience = {
            id: `free_day_${Date.now()}_${i}`,
            nome: 'Giorno libero',
            descrizione: 'Giornata libera per esplorare o riposare',
            emoji: '🏖️',
            slot: 1,
            prezzo: 0,
            difficolta: 0,
            isFreeDay: true
          };

          // Aggiungi al tracking
          CHAT_FLOW_CONFIG.packages.selectedExperiences.push(freeDayExperience);

          // Aggiungi al trip
          addExperience(currentZone.code, freeDayExperience);
        }

        addBotMessage(`Perfetto! Ho aggiunto ${numDays} ${numDays === 1 ? 'giorno libero' : 'giorni liberi'} al tuo itinerario! 🎉`);

        // Calcola giorni totali (ogni blocco = 1 giorno)
        // +numDays perché addExperience è asincrono e lo stato potrebbe non essere ancora aggiornato
        const totalDaysUsed = tripData.filledBlocks.length + numDays;
        const daysAvailable = tripData.totalDays - 2; // -2 per arrivo/partenza

        // Chiedi cosa fare dopo
        setTimeout(() => {
          if (totalDaysUsed >= daysAvailable) {
            // Giorni completati → vai al summary
            addBotMessage(
              `🎉 Hai completato il tuo itinerario! (${totalDaysUsed} giorni)`,
              'bot_options',
              {
                options: [
                  { value: 'finish_trip', label: '✅ Completa il viaggio', emoji: '🎊' },
                  { value: 'add_more', label: '➕ Aggiungi altro giorno', emoji: '📅' }
                ]
              }
            );
          } else {
            // Chiedi se vuole continuare
            addBotMessage(
              `Cosa vuoi fare ora? (${totalDaysUsed}/${daysAvailable} giorni usati)`,
              'bot_options',
              {
                options: [
                  { value: 'another_experience', label: '🎯 Altra esperienza qui', emoji: '✨' },
                  { value: 'free_day', label: '🏖️ Altro giorno libero', emoji: '☀️' },
                  { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' },
                  { value: 'finish_trip', label: '✅ Completa così', emoji: '👍' }
                ]
              }
            );
          }
        }, 800);
      } else if (value && value.action === 'cancel_free_days') {
        // L'utente ha annullato il selettore giorni liberi
        addUserMessage('❌ Annullato');

        // Torna alle opzioni precedenti
        setTimeout(() => {
          const totalDaysUsed = tripData.filledBlocks.length;
          const daysAvailable = tripData.totalDays - 2;

          addBotMessage(
            `Nessun problema! Cosa vuoi fare? (${totalDaysUsed}/${daysAvailable} giorni usati)`,
            'bot_options',
            {
              options: [
                { value: 'another_experience', label: '🎯 Altra esperienza qui', emoji: '✨' },
                { value: 'free_day', label: '🏖️ Giorno libero', emoji: '☀️' },
                { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' },
                { value: 'finish_trip', label: '✅ Completa così', emoji: '👍' }
              ]
            }
          );
        }, 500);
      } else if (value === 'change_zone') {
        addUserMessage('🗺️ Cambia zona');
        // Reset per nuova zona
        CHAT_FLOW_CONFIG.packages.selectedExperiences = [];
        // Incrementa counter per sbloccare tutte le zone se necessario
        if (store.availableCounter === 1) {
          incrementCounter();
        }
        // Torna allo step zones
        setTimeout(() => {
          addBotMessage('Perfetto! Scegli una nuova zona da esplorare.');
          setTimeout(() => goToStep('zones'), 500);
        }, 500);
      } else if (value === 'finish_trip') {
        addUserMessage('✅ Completa viaggio');
        // Reset e vai al summary
        CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0;
        setTimeout(() => {
          addBotMessage('🎊 Perfetto! Creo il tuo itinerario personalizzato...');
          setTimeout(() => {
            store.setShowItineraryAnimation(true);
          }, 1000);
        }, 500);
      } else if (value === 'add_more') {
        addUserMessage('➕ Aggiungi altro giorno');
        // Permette di continuare oltre i giorni disponibili
        addBotMessage(
          `Cosa vuoi fare?`,
          'bot_options',
          {
            options: [
              { value: 'another_experience', label: '🎯 Altra esperienza qui', emoji: '✨' },
              { value: 'change_zone', label: '🗺️ Cambia zona', emoji: '🚀' }
            ]
          }
        );
      } else if (value === 'proceed_anyway') {
        addUserMessage('✅ Procedi così');
        // Incrementa contatore e vai avanti
        incrementCounter();
        CHAT_FLOW_CONFIG.packages.currentZoneIndex++;

        if (CHAT_FLOW_CONFIG.packages.currentZoneIndex < tripData.selectedZones.length) {
          setTimeout(() => {
            addBotMessage('Passiamo alla prossima zona!');
            setTimeout(() => goToStep('packages'), 1000);
          }, 800);
        } else {
          CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0;
          setTimeout(() => {
            // Mostra animazione prima del summary
            store.setShowItineraryAnimation(true);
          }, 1000);
        }
      } else if (value === 'restart_zone') {
        addUserMessage('🔄 Rivedi esperienze');
        // Riavvia lo step per la zona corrente
        CHAT_FLOW_CONFIG.packages.currentExperienceIndex = 0;
        CHAT_FLOW_CONFIG.packages.selectedExperiences = [];
        goToStep('packages');
      } else if (value === 'change_zone') {
        addUserMessage('🔄 Cambia zona');
        CHAT_FLOW_CONFIG.packages.currentZoneIndex = 0;
        // Incrementa counter per sbloccare tutte le zone se necessario
        if (store.availableCounter === 1) {
          incrementCounter();
        }
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
