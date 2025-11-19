# Archive - Codice Deprecato

Questa directory contiene codice deprecato mantenuto per riferimento storico.

## ⚠️ NON UTILIZZARE QUESTO CODICE

Il codice qui contenuto è stato sostituito da implementazioni più moderne e non deve essere usato in produzione.

---

## 📁 `/trip-editor` - DEPRECATED (2025-11-19)

**Sistema vecchio**: Editor viaggi basato su PEXP/DETEXP con paradigma form + mappa + modali

**Sostituito da**: `/src/features/trip-editor-chat` (sistema chat conversazionale)

**Perché deprecato**:
- Architettura monolitica (TripEditor.jsx: 1.055 righe)
- State management complesso (16+ useState locali)
- Sistema pannelli/modali con z-index dinamici (overly complex)
- Paradigma incompatibile con UX moderna (form-based vs conversational)
- 60% duplicazione codice con nuovo sistema

**Cosa è stato salvato**:
- ✅ Business logic → migrata in `/src/core/services/tripBuilderService.js`
- ✅ Componenti UI condivisi → mantenuti in `/src/shared/`
- ✅ Hooks → mantenuti in `/src/hooks/`
- ✅ Utilità → migrate in `/src/core/utils/`

**Componenti principali archiviati**:
- `TripEditor.jsx` (1.055 righe) - Componente principale
- `PEXPTab.jsx`, `DETEXPTab.jsx` - Sistema modal PEXP/DETEXP
- `PEXPCard.jsx`, `EXPCard.jsx` - Card esperienze vecchio stile
- `MapInteractive.jsx`, `MapThailandSVG.jsx` - Mappe interattive
- `HotelSelector.jsx`, `HotelPanel.jsx` - Selezione hotel vecchio stile
- `useTripEditorStore.js` - Store Zustand vecchio sistema

**Riferimenti**:
- Route redirect: `/trip-editor` → `/trip-editor-chat` (App.jsx:44)
- Analisi completa: Vedi conversation del 2025-11-19

---

## 🔍 Come Consultare l'Archivio

Se hai bisogno di recuperare logica specifica dal vecchio sistema:

1. **Verifica prima** se esiste già nel nuovo sistema
2. **Controlla** `/src/core/` per business logic riutilizzabile
3. **Adatta** il codice al nuovo paradigma, non copiarlo direttamente
4. **Non reintrodurre** pattern deprecati (modali nested, state locale eccessivo)

---

## 📅 Timeline Deprecazione

- **2025-11-19**: Deprecazione completa vecchio sistema
- **Route redirect**: `/trip-editor` → `/trip-editor-chat`
- **Codice archiviato**: `/archive/trip-editor/`
- **Prossimi step**: Implementazione nuovo flusso chat + schede fullscreen

---

_Questo file serve come documentazione storica. Per qualsiasi domanda consulta la conversation del 2025-11-19._
