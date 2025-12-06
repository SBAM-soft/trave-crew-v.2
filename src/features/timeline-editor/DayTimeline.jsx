import { useState } from 'react';
import { BLOCK_TYPE, BLOCK_CONFIG } from '../../core/constants';
import styles from './DayTimeline.module.css';

function DayTimeline({ day, isFirst, isLast, onAddNote, totalDays }) {
  const [isExpanded, setIsExpanded] = useState(
    day.type === BLOCK_TYPE.EXPERIENCE ||
    day.type === BLOCK_TYPE.ARRIVAL ||
    day.type === BLOCK_TYPE.DEPARTURE
  );
  const [noteText, setNoteText] = useState(day.notes || '');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Determina configurazione per tipo giorno usando BLOCK_CONFIG
  const blockConfig = BLOCK_CONFIG[day.type] || BLOCK_CONFIG[BLOCK_TYPE.EMPTY];

  const getDayTypeIcon = () => blockConfig.icon;
  const getDayTypeColor = () => blockConfig.color;
  const getDayTypeLabel = () => blockConfig.label;
  const isTechnicalBlock = () => blockConfig.isTechnical;

  // Calcola quale notte corrisponde a questo giorno
  // Esempio: 7 notti = 8 giorni
  // Giorno 1 = Arrivo (notte 1)
  // Giorno 2 = Notte 1 completa
  // Giorno 8 = Partenza (dopo notte 7)
  const getNightInfo = () => {
    if (day.dayNumber === 1) return 'Arrivo';
    if (day.dayNumber === totalDays) return 'Partenza';
    return `Notte ${day.dayNumber - 1}`;
  };

  // Handler salva nota
  const handleSaveNote = () => {
    onAddNote(day.dayNumber, noteText);
    setShowNoteInput(false);
  };

  return (
    <div className={`${styles.dayTimeline} ${isLast ? styles.last : ''}`}>
      {/* Timeline Line */}
      {!isLast && <div className={styles.timelineLine} />}

      {/* Day Marker */}
      <div
        className={styles.dayMarker}
        style={{ backgroundColor: getDayTypeColor() }}
      >
        <span className={styles.dayIcon}>{getDayTypeIcon()}</span>
      </div>

      {/* Day Content */}
      <div className={styles.dayContent}>
        {/* Header */}
        <div
          className={styles.dayHeader}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className={styles.dayHeaderLeft}>
            <div className={styles.dayTitleRow}>
              <h3 className={styles.dayTitle}>{day.title}</h3>
              {isTechnicalBlock() && (
                <span className={styles.technicalBadge} title="Giorno tecnico necessario per logistica">
                  🔧 BLOCCO TECNICO
                </span>
              )}
            </div>
            <div className={styles.dayMetaInfo}>
              <span className={styles.nightInfo}>{getNightInfo()}</span>
              {day.zoneName && (
                <span className={styles.zoneInfo}>📍 {day.zoneName}</span>
              )}
              {day.packageName && (
                <span className={styles.packageBadge}>📦 {day.packageName}</span>
              )}
            </div>
          </div>
          <button className={styles.expandBtn}>
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={styles.dayBody}>
            {/* Descrizione base */}
            {day.description && (
              <p className={styles.dayDescription}>{day.description}</p>
            )}

            {/* Esperienze */}
            {day.experiences && day.experiences.length > 0 && (
              <div className={styles.experiences}>
                {day.experiences.map((exp, i) => (
                  <div key={i} className={styles.experienceCard}>
                    <div className={styles.expHeader}>
                      <h4 className={styles.expTitle}>{exp.nome}</h4>
                      {exp.prezzo > 0 && (
                        <span className={styles.expPrice}>€{exp.prezzo}</span>
                      )}
                    </div>

                    <p className={styles.expDescription}>
                      {exp.descrizione}
                    </p>

                    <div className={styles.expMeta}>
                      {exp.durata && (
                        <span className={styles.expMetaItem}>
                          ⏱️ {exp.durata}
                        </span>
                      )}
                      {exp.difficolta && (
                        <span className={styles.expMetaItem}>
                          🚶 Difficoltà {exp.difficolta}/3
                        </span>
                      )}
                      {exp.tags && exp.tags.length > 0 && (
                        <div className={styles.expTags}>
                          {exp.tags.slice(0, 3).map((tag, ti) => (
                            <span key={ti} className={styles.expTag}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Include/Non Include */}
                    {(exp.include || exp.nonInclude) && (
                      <div className={styles.expDetails}>
                        {exp.include && (
                          <div className={styles.expDetailSection}>
                            <strong>✅ Include:</strong>
                            <ul className={styles.expDetailList}>
                              {exp.include.split(';').filter(i => i.trim()).map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {exp.nonInclude && (
                          <div className={styles.expDetailSection}>
                            <strong>❌ Non include:</strong>
                            <ul className={styles.expDetailList}>
                              {exp.nonInclude.split(';').filter(i => i.trim()).map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Note personali */}
            <div className={styles.notesSection}>
              {!showNoteInput && !day.notes && (
                <button
                  className={styles.addNoteBtn}
                  onClick={() => setShowNoteInput(true)}
                >
                  ➕ Aggiungi nota personale
                </button>
              )}

              {(showNoteInput || day.notes) && (
                <div className={styles.noteInput}>
                  <textarea
                    className={styles.noteTextarea}
                    placeholder="Aggiungi una nota per questo giorno (es. indirizzo hotel, orari, promemoria...)"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                  />
                  <div className={styles.noteActions}>
                    <button
                      className={styles.noteSaveBtn}
                      onClick={handleSaveNote}
                    >
                      💾 Salva
                    </button>
                    {!day.notes && (
                      <button
                        className={styles.noteCancelBtn}
                        onClick={() => {
                          setShowNoteInput(false);
                          setNoteText(day.notes || '');
                        }}
                      >
                        Annulla
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DayTimeline;
