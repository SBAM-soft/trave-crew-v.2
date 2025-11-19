import {useMemo, useState, useCallback} from "react";
// Import “MapLibre mode” di react-map-gl: niente mapLib prop necessario
import Map, {Source, Layer, Popup, NavigationControl} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Props:
 * - zones: array CSV [{ CODICE, ZONA, TIPO_AREA, COORDINATE_LAT, COORDINATE_LNG, DESCRIZIONE, CARATTERISTICHE, ... }]
 * - selectedZone: string (CODICE)
 * - onZoneClick: (zoneObj) => void
 *
 * Nota:
 *  - Usa MapTiler "streets-v2" come basemap (metti la tua key in .env)
 *  - Clic sugli overlay: usa interactiveLayerIds + event.features di react-map-gl
 */

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`; // stile consigliato da MapTiler per MapLibre
// TH center/zoom iniziali
const INITIAL_VIEW = { longitude: 100.5, latitude: 15.8, zoom: 4.7, pitch: 0, bearing: 0 };

// Normalizza i tipi liberi del CSV ai 5 colori base richiesti
function baseType(t) {
  const s = String(t || "").toLowerCase();
  if (s.includes("mare")) return "mare";
  if (s.includes("montagna")) return "montagna";
  if (s.includes("natura")) return "natura";
  if (s.includes("deserto")) return "deserto";
  return "città";
}

function zonesToGeoJSON(zones = []) {
  return {
    type: "FeatureCollection",
    features: zones
      .filter(z => z && z.COORDINATE_LNG && z.COORDINATE_LAT)
      .map(z => ({
        type: "Feature",
        properties: {
          ...z,
          TIPO_BASE: baseType(z.TIPO_AREA || z.TIPO) // campo ausiliario per lo style
        },
        geometry: {
          type: "Point",
          coordinates: [Number(z.COORDINATE_LNG), Number(z.COORDINATE_LAT)]
        }
      }))
  };
}

export default function MapThailandGL({ zones = [], selectedZone, onZoneClick }) {
  const data = useMemo(() => zonesToGeoJSON(zones), [zones]);
  const [hover, setHover] = useState(null); // {lng, lat, props}

  // Espressione colori per TIPO_BASE
  const colorByType = [
    "match", ["get", "TIPO_BASE"],
    "città", "#3b82f6",
    "mare", "#0ea5e9",
    "montagna", "#22c55e",
    "natura", "#10b981",
    "deserto", "#fbbf24",
    /* default */ "#3b82f6"
  ];

  // Layer: bolle
  const bubble = {
    id: "zone-bubbles",
    type: "circle",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 8, 8, 26],
      "circle-color": colorByType,
      "circle-opacity": 0.6,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-blur": 0.15
    }
  };

  // Layer: selezione (bordo evidenziato solo sulla feature con CODICE === selectedZone)
  const selected = {
    id: "zone-selected",
    type: "circle",
    filter: ["==", ["get", "CODICE"], selectedZone ?? ""],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 12, 8, 32],
      "circle-color": colorByType,
      "circle-opacity": 0.85,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 4
    }
  };

  // Layer: etichette
  const labels = {
    id: "zone-labels",
    type: "symbol",
    layout: {
      "text-field": ["get", "ZONA"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 14],
      "text-anchor": "top",
      "text-offset": [0, 1.1]
    },
    paint: {
      "text-color": "#1f2937",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.2
    }
  };

  const handleClick = useCallback((e) => {
    const f = e.features?.find(ft => ft.layer?.id === "zone-bubbles" || ft.layer?.id === "zone-labels");
    if (f?.properties) {
      const props = Object.fromEntries(Object.entries(f.properties).map(([k, v]) => [k, typeof v === "string" ? v : v]));
      // prova a riconsegnare l'oggetto zona originale (preserva referenze/campi extra)
      const z = zones.find(x => String(x.CODICE) === String(props.CODICE)) || props;
      onZoneClick?.(z);
    }
  }, [zones, onZoneClick]);

  const handleMove = useCallback((e) => {
    const f = e.features?.find(ft => ft.layer?.id === "zone-bubbles");
    if (f?.properties) {
      setHover({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        props: f.properties
      });
      return;
    }
    setHover(null);
  }, []);

  return (
    <div style={{ width: "100%", aspectRatio: "16/10", minHeight: 320, borderRadius: 16, overflow: "hidden" }}>
      <Map
        initialViewState={INITIAL_VIEW}
        mapStyle={MAP_STYLE}
        // Importante: “Map (MapLibre)” già configurato; niente mapLib prop
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["zone-bubbles", "zone-labels"]}
        cursor={hover ? "pointer" : "grab"}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        attributionControl={true}
      >
        <NavigationControl position="bottom-right" />

        <Source id="zones" type="geojson" data={data}>
          <Layer {...bubble} />
          <Layer {...selected} />
          <Layer {...labels} />
        </Source>

        {hover && (
          <Popup
            longitude={hover.lng}
            latitude={hover.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={10}
          >
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{hover.props.ZONA}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>
              {hover.props.TIPO_AREA || hover.props.TIPO_BASE}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}