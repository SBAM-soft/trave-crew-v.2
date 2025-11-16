import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapInteractive.module.css';

// Fix per icone di default di Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente per centrare la mappa quando cambia la destinazione
function MapCenterController({ center, zones }) {
  const map = useMap();

  useEffect(() => {
    if (zones && zones.length > 0) {
      // Crea bounds per includere tutti i marker
      const bounds = L.latLngBounds(
        zones.map(z => [parseFloat(z.COORDINATE_LAT), parseFloat(z.COORDINATE_LNG)])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    } else if (center) {
      map.setView(center, 6);
    }
  }, [map, center, zones]);

  return null;
}

function MapInteractive({ destinazione, zone, selectedZone, onZoneClick, filledBlocks = [] }) {
  const [hoveredZone, setHoveredZone] = useState(null);
  const [mapCenter, setMapCenter] = useState([13.7563, 100.5018]); // Default Bangkok
  const [mapZoom, setMapZoom] = useState(6);

  // Debug log
  useEffect(() => {
    console.log('🗺️ MapInteractive ricevuto zone:', zone?.length || 0, zone);
  }, [zone]);

  // Aggiorna centro mappa quando cambia destinazione
  useEffect(() => {
    if (zone && zone.length > 0) {
      // Prendi coordinate della prima zona come centro iniziale
      const firstZone = zone[0];
      if (firstZone.COORDINATE_LAT && firstZone.COORDINATE_LNG) {
        setMapCenter([
          parseFloat(firstZone.COORDINATE_LAT),
          parseFloat(firstZone.COORDINATE_LNG)
        ]);
      }
    }
  }, [zone]);

  // Estrai percorso dalle zone visitate in ordine
  const visitedPath = useMemo(() => {
    if (!filledBlocks || filledBlocks.length === 0) return [];

    // Estrai zone uniche mantenendo l'ordine di visita
    const visitedZonesMap = new Map();

    filledBlocks
      .filter(block => block.codiceZona && block.zona)
      .forEach((block, index) => {
        if (!visitedZonesMap.has(block.codiceZona)) {
          visitedZonesMap.set(block.codiceZona, {
            codice: block.codiceZona,
            nome: block.zona,
            order: index + 1
          });
        }
      });

    return Array.from(visitedZonesMap.values());
  }, [filledBlocks]);

  // Calcola coordinate del percorso per la Polyline
  const pathCoordinates = useMemo(() => {
    if (visitedPath.length === 0 || !zone) return [];

    return visitedPath
      .map(vz => {
        const zona = zone.find(z => z.CODICE === vz.codice || z.ZONA === vz.nome);
        if (zona && zona.COORDINATE_LAT && zona.COORDINATE_LNG) {
          return [parseFloat(zona.COORDINATE_LAT), parseFloat(zona.COORDINATE_LNG)];
        }
        return null;
      })
      .filter(coord => coord !== null);
  }, [visitedPath, zone]);

  // Crea icone personalizzate per le zone
  const createZoneIcon = (zona, isSelected, isHovered, visitOrder = null) => {
    const iconMap = {
      'città': '🏙️',
      'mare': '🏖️',
      'montagna': '⛰️',
      'natura': '🌿',
      'deserto': '🏜️',
      'città-cultura': '🏛️',
      'città-mare': '🌊'
    };

    const emoji = iconMap[zona.TIPO_AREA] || '📍';
    const size = isSelected || isHovered ? 40 : 32;
    const badgeColor = visitOrder ? '#10b981' : isSelected ? '#667eea' : isHovered ? '#764ba2' : '#f97316';

    return L.divIcon({
      html: `
        <div style="
          position: relative;
          font-size: ${size}px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          ${emoji}
          ${visitOrder ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: ${badgeColor};
              color: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">${visitOrder}</div>
          ` : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  return (
    <div className={styles.mapContainer}>
      {/* Header mappa */}
      <div className={styles.mapHeader}>
        <h3 className={styles.mapTitle}>🗺️ {destinazione?.NOME || 'Destinazione'}</h3>
        <p className={styles.mapSubtitle}>Clicca su una zona per vedere i pacchetti disponibili</p>
      </div>

      {/* Mappa interattiva reale */}
      <div className={styles.mapWrapper}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className={styles.leafletMap}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterController center={mapCenter} zones={zone} />

          {/* Linea del percorso ottimizzato */}
          {pathCoordinates.length > 1 && (
            <Polyline
              positions={pathCoordinates}
              pathOptions={{
                color: '#667eea',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}

          {/* Marker per ogni zona */}
          {zone && zone.map((zona) => {
            if (!zona.COORDINATE_LAT || !zona.COORDINATE_LNG) return null;

            const isSelected = selectedZone === zona.CODICE;
            const isHovered = hoveredZone === zona.CODICE;

            // Trova ordine di visita se la zona è nel percorso
            const visitedZone = visitedPath.find(vz =>
              vz.codice === zona.CODICE || vz.nome === zona.ZONA
            );
            const visitOrder = visitedZone ? visitedZone.order : null;

            return (
              <Marker
                key={zona.CODICE}
                position={[parseFloat(zona.COORDINATE_LAT), parseFloat(zona.COORDINATE_LNG)]}
                icon={createZoneIcon(zona, isSelected, isHovered, visitOrder)}
                eventHandlers={{
                  click: () => onZoneClick(zona),
                  mouseover: () => setHoveredZone(zona.CODICE),
                  mouseout: () => setHoveredZone(null)
                }}
              >
                <Popup>
                  <div className={styles.popupContent}>
                    <h4>{zona.ZONA}</h4>
                    {visitOrder && (
                      <p className={styles.visitOrder}>
                        🗓️ Tappa #{visitOrder} del tuo itinerario
                      </p>
                    )}
                    {zona.CITTA_PRINCIPALE && <p>📍 {zona.CITTA_PRINCIPALE}</p>}
                    {zona.GIORNI_CONSIGLIATI && <p>📅 {zona.GIORNI_CONSIGLIATI} giorni consigliati</p>}
                    {zona.DESCRIZIONE && <p className={styles.popupDesc}>{zona.DESCRIZIONE.substring(0, 100)}...</p>}
                    <button
                      onClick={() => onZoneClick(zona)}
                      className={styles.popupButton}
                    >
                      Seleziona questa zona
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Zone disponibili */}
      <div className={styles.zonesSection}>
        <h4 className={styles.zonesTitle}>Zone disponibili:</h4>
        <div className={styles.zonesGrid}>
          {zone && zone.length > 0 ? (
            zone.map((zona) => (
              <div
                key={zona.CODICE}
                className={`${styles.zoneCard} ${
                  selectedZone === zona.CODICE ? styles.selected : ''
                } ${hoveredZone === zona.CODICE ? styles.hovered : ''}`}
                onClick={() => onZoneClick(zona)}
                onMouseEnter={() => setHoveredZone(zona.CODICE)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Badge tipo area */}
                <div className={styles.zoneBadge} data-type={zona.TIPO_AREA}>
                  {zona.TIPO_AREA === 'città' && '🏙️'}
                  {zona.TIPO_AREA === 'mare' && '🏖️'}
                  {zona.TIPO_AREA === 'montagna' && '⛰️'}
                  {zona.TIPO_AREA === 'natura' && '🌿'}
                  {zona.TIPO_AREA === 'deserto' && '🏜️'}
                  {zona.TIPO_AREA === 'città-cultura' && '🏛️'}
                  {zona.TIPO_AREA === 'città-mare' && '🌊'}
                  {!zona.TIPO_AREA && '📍'}
                </div>

                {/* Nome zona */}
                <h5 className={styles.zoneName}>{zona.ZONA}</h5>

                {/* Descrizione breve */}
                <p className={styles.zoneDescription}>
                  {zona.DESCRIZIONE ? 
                    `${zona.DESCRIZIONE.substring(0, 80)}...` : 
                    'Scopri questa zona'}
                </p>

                {/* Info aggiuntive */}
                <div className={styles.zoneInfo}>
                  {zona.GIORNI_CONSIGLIATI && (
                    <span className={styles.infoItem}>
                      📅 {zona.GIORNI_CONSIGLIATI} giorni
                    </span>
                  )}
                  {zona.CITTA_PRINCIPALE && (
                    <span className={styles.infoItem}>
                      📍 {zona.CITTA_PRINCIPALE}
                    </span>
                  )}
                </div>

                {/* Indicatore selezione */}
                {selectedZone === zona.CODICE && (
                  <div className={styles.selectedIndicator}>
                    ✓ Selezionata
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noZones}>
              <p>Nessuna zona disponibile per questa destinazione</p>
            </div>
          )}
        </div>
      </div>

      {/* Info selezionata */}
      {selectedZone && (
        <div className={styles.selectedInfo}>
          {(() => {
            const zona = zone.find(z => z.CODICE === selectedZone);
            return zona ? (
              <>
                <h4>📌 Zona selezionata: {zona.ZONA}</h4>
                <p>{zona.DESCRIZIONE}</p>
                {zona.CARATTERISTICHE && (
                  <div className={styles.caratteristiche}>
                    <strong>Caratteristiche:</strong>
                    {zona.CARATTERISTICHE.split(';').map((car, idx) => (
                      <span key={idx} className={styles.caratteristica}>
                        {car.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

export default MapInteractive;