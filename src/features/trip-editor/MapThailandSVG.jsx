// src/features/trip-editor/MapThailandSVG.jsx
import { useMemo, useRef, useState } from "react";
import cls from "./MapThailandSVG.module.css";

/**
 * Props:
 * - zones: array dal CSV delle zone (campi: CODICE, ZONA, TIPO_AREA, DESCRIZIONE, CARATTERISTICHE, COORDINATE_LAT, COORDINATE_LNG)
 * - selectedZone: string (CODICE) attualmente selezionato
 * - onZoneClick: (zoneObj) => void
 *
 * Mapping CSV → SVG: si basa sul CODICE (es. ZTHBA01 = Bangkok).
 * Se nel CSV mancano record, il relativo shape resta ma prende label fallback dallo shape registry.
 */

export default function MapThailandSVG({ zones = [], selectedZone, onZoneClick }) {
  const wrapperRef = useRef(null);
  const [hover, setHover] = useState(null); // { code, name, x, y }

  // Palette per TIPO_AREA
  const typeColors = {
    "città": "#3b82f6",
    "mare": "#0ea5e9",
    "montagna": "#22c55e",
    "natura": "#10b981",
    "deserto": "#fbbf24",
  };

  // Registry dei 5 shape stilizzati (viewBox 0 0 800 600)
  // Poligoni volutamente "stilizzati" e posizionati in aree coerenti con la geografia della Thailandia.
  const SHAPES = useMemo(() => ([
    {
      code: "ZTHBA01",
      fallbackName: "Bangkok",
      tipo: "città",
      // centro zona (per tooltip su tastiera)
      labelPos: { x: 430, y: 365 },
      // poligono area Bangkok (stilizzato nell’area centro-sud)
      points: "410,350 455,350 470,370 455,390 415,390 400,370",
    },
    {
      code: "ZTHCM01",
      fallbackName: "Chiang Mai",
      tipo: "natura",
      labelPos: { x: 420, y: 150 },
      // nord montuoso
      points: "390,110 440,95 465,125 450,165 410,175 385,145",
    },
    {
      code: "ZTHPH01",
      fallbackName: "Phuket",
      tipo: "mare",
      labelPos: { x: 320, y: 515 },
      // sud-ovest (isola stilizzata)
      points: "305,485 335,490 340,510 330,535 305,525 295,505",
    },
    {
      code: "ZTHKS01",
      fallbackName: "Koh Samui",
      tipo: "mare",
      labelPos: { x: 620, y: 500 },
      // golfo della Thailandia (isola stilizzata)
      points: "605,485 635,490 640,505 625,520 605,510 600,495",
    },
    {
      code: "ZTHPA01",
      fallbackName: "Pattaya",
      tipo: "città",
      labelPos: { x: 520, y: 380 },
      // est rispetto a Bangkok sulla costa del golfo
      points: "505,365 540,365 550,385 535,400 510,400 500,385",
    },
  ]), []);

  // Indice CSV per lookup rapido via CODICE
  const zonesByCode = useMemo(() => {
    const map = new Map();
    for (const z of zones) map.set(String(z.CODICE).trim(), z);
    return map;
  }, [zones]);

  // Tooltip HTML posizionato fuori dall'SVG
  const showTooltip = (evt, code, name) => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = evt.clientX - rect.left + 10;
    const y = evt.clientY - rect.top + 10;
    setHover({ code, name, x, y });
  };

  const hideTooltip = () => setHover(null);

  const handleActivate = (code) => {
    const z = zonesByCode.get(code);
    const shapeMeta = SHAPES.find(s => s.code === code);
    const payload = z || {
      CODICE: code,
      ZONA: shapeMeta?.fallbackName ?? code,
      TIPO_AREA: shapeMeta?.tipo ?? "città",
      DESCRIZIONE: "",
      CARATTERISTICHE: "",
    };
    onZoneClick?.(payload);
  };

  return (
    <div ref={wrapperRef} className={cls.wrapper}>
      {/* SVG responsive */}
      <svg
        className={cls.svg}
        viewBox="0 0 800 600"
        role="img"
        aria-labelledby="th-title th-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="th-title">Mappa interattiva della Thailandia</title>
        <desc id="th-desc">
          Mappa stilizzata con aree cliccabili per Bangkok, Chiang Mai, Phuket, Koh Samui e Pattaya.
        </desc>

        {/* Fondo neutro sfumato */}
        <defs>
          <linearGradient id="bgGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#eef2ff" />
            <stop offset="100%" stopColor="#f5f3ff" />
          </linearGradient>

          {/* Ombra sottile per le aree */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.15)" />
          </filter>
        </defs>

        <rect x="0" y="0" width="800" height="600" fill="url(#bgGrad)" rx="18" />

        {/* Titolo destinazione */}
        <text x="24" y="52" className={cls.mapTitle}>
          Thailandia
        </text>

        {/* Gruppo aree */}
        <g>
          {SHAPES.map(({ code, fallbackName, points, labelPos, tipo }) => {
            const data = zonesByCode.get(code);
            const name = data?.ZONA || fallbackName;
            const type = (data?.TIPO_AREA || tipo || "città").toLowerCase();
            const fill = typeColors[type] || typeColors["città"];
            const isSelected = selectedZone && String(selectedZone).trim() === code;

            return (
              <g key={code}>
                {/* Area */}
                <polygon
                  id={code}
                  data-code={code}
                  points={points}
                  className={[
                    cls.zone,
                    isSelected ? cls.selected : "",
                  ].join(" ")}
                  style={{ fill }}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#softShadow)"
                  // Accessibilità tastiera
                  tabIndex={0}
                  role="button"
                  aria-label={`${name} — ${type}`}
                  aria-pressed={isSelected ? "true" : "false"}
                  onClick={() => handleActivate(code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleActivate(code);
                    }
                  }}
                  onMouseMove={(e) => showTooltip(e, code, name)}
                  onMouseLeave={hideTooltip}
                  onFocus={(e) => {
                    // mostra tooltip al centro della shape quando navigo con tastiera
                    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    const x = (rect ? rect.left : 0) + labelPos.x + 10;
                    const y = (rect ? rect.top : 0) + labelPos.y + 10;
                    setHover({ code, name, x, y });
                  }}
                  onBlur={hideTooltip}
                >
                  <title>{name}</title>
                </polygon>

                {/* Etichetta zona (minimale) */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  className={cls.zoneLabel}
                  pointerEvents="none"
                >
                  {name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Bordo estetico */}
        <rect
          x="4" y="4" width="792" height="592"
          rx="16"
          fill="none"
          stroke="rgba(102,126,234,0.25)"
          strokeWidth="2"
        />
      </svg>

      {/* Tooltip HTML (segue il mouse) */}
      {hover && (
        <div
          className={cls.tooltip}
          role="tooltip"
          style={{ left: hover.x, top: hover.y }}
        >
          {hover.name}
        </div>
      )}
    </div>
  );
}