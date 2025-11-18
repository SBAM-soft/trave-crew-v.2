/**
 * Factory per creare messaggi bot/user standardizzati
 */

export const createBotMessage = (content, type = 'bot', data = null) => ({
  type,
  content,
  data,
  sender: 'bot',
  timestamp: new Date()
});

export const createUserMessage = (content, data = null) => ({
  type: 'user',
  content,
  data,
  sender: 'user',
  timestamp: new Date()
});

export const createOptionsMessage = (text, options) => ({
  type: 'bot_options',
  content: text,
  data: { options },
  sender: 'bot',
  timestamp: new Date()
});

export const createCardsMessage = (text, cards) => ({
  type: 'bot_cards',
  content: text,
  data: { cards },
  sender: 'bot',
  timestamp: new Date()
});

export const createMapMessage = (text, zones, multiSelect = false, daysAvailable = 0) => ({
  type: 'bot_map',
  content: text,
  data: { zones, multiSelect, daysAvailable },
  sender: 'bot',
  timestamp: new Date()
});

export const createDetailCardMessage = (text, packageData, experiences, zoneCode) => ({
  type: 'bot_detail_card',
  content: text,
  data: { package: packageData, experiences, zoneCode },
  sender: 'bot',
  timestamp: new Date()
});

export const createTimelineMessage = (text, days, costs) => ({
  type: 'bot_timeline',
  content: text,
  data: { days, costs },
  sender: 'bot',
  timestamp: new Date()
});

export const createHotelSelectorMessage = (text, zona, notti, tiers, extras) => ({
  type: 'bot_hotel_selector',
  content: text,
  data: { zona, notti, tiers, extras },
  sender: 'bot',
  timestamp: new Date()
});

export const createFinalCardMessage = (text, tripData, costs) => ({
  type: 'bot_final_card',
  content: text,
  data: { tripData, costs },
  sender: 'bot',
  timestamp: new Date()
});

export const createCardWithDataMessage = (text, card) => ({
  type: 'bot_message_with_card',
  content: text,
  data: { card },
  sender: 'bot',
  timestamp: new Date()
});
