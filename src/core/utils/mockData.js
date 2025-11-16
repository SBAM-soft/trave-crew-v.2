/**
 * Mock data centralizzato
 * Questi dati dovrebbero essere collegati al database CSV in futuro
 */

export const DISPONIBILE_PLUS = [
  { id: 'plus1', nome: 'Extra premium', prezzo: 25 },
  { id: 'plus2', nome: 'Fotografo professionista', prezzo: 60 }
];

export const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1563492065211-4f7e3a4c9c3e?w=800',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
];

export const MOCK_MEDIA = {
  video: null,
  images: MOCK_IMAGES
};
