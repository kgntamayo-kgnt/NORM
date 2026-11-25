import React from 'react';
import { ArrowRight, Compass } from 'lucide-react';

/* 1. GUÍA VISUAL INTERACTIVA DE FLUJO DE TRABAJO (PARA TODOS LOS PERFILES) */
interface WorkflowGuideStripProps {
  onNavigate: (tab: string) => void;
}

const WORKFLOW_STEPS = [
  {
    num: '01',
    tab: 'evaluator',
    title: 'Medir y Clasificar',
    subtitle: 'Fondo natural (4 lecturas) y tasa neta a 30 cm frente a niveles de referencia.',
    accent: '#0284C7',
  },
  {
    num: '02',
    tab: 'process',
    title: 'Ubicar en Procesos',
    subtitle: 'Identificar lodos, incrustaciones, películas y cadenas ²³⁸U / ²³²Th en la instalación.',
    accent: '#D97706',
  },
  {
    num: '03',
    tab: 'decisions',
    title: 'Decidir y Proteger',
    subtitle: 'Aplicar flujos de descontaminación, remediación y optimización ALARA (1/d²).',
    accent: '#059669',
  },
  {
    num: '04',
    tab: 'records',
    title: 'Registrar y Exportar',
    subtitle: 'Documentar Anexos 1, 2 y 3 con calibración instrumental y descarga directa.',
    accent: '#475569',
  },
];

export const WorkflowGuideStrip: React.FC<WorkflowGuideStripProps> = ({ onNavigate }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900">
            Ruta Rápida de Uso de la Plataforma
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          Haz clic en cualquier etapa para ir directamente al módulo correspondiente
        </span>
      </div>

      {/* Línea conectora animada en desktop */}
      <div className="relative">
        <svg
          viewBox="0 0 1000 18"
          className="hidden lg:block w-full h-4 mb-1 pointer-events-none"
          aria-hidden="true"
        >
          <line
            x1="120"
            y1="9"
            x2="880"
            y2="9"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          <line
            x1="120"
            y1="9"
            x2="880"
            y2="9"
            stroke="#0284C7"
            strokeWidth="2"
            strokeDasharray="10 10"
            className="animate-flow-dash"
          />
          {[125, 375, 625, 875].map((cx, idx) => (
            <g key={cx}>
              <circle cx={cx} cy="9" r="6" fill="#FFFFFF" stroke={WORKFLOW_STEPS[idx].accent} strokeWidth="2.5" />
            </g>
          ))}
        </svg>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {WORKFLOW_STEPS.map((step) => (
            <button
              key={step.num}
              type="button"
              onClick={() => onNavigate(step.tab)}
              className="group text-left p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-sky-300 transition-all duration-150 hover:-translate-y-0.5 flex flex-col justify-between gap-2"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200"
                    style={{ color: step.accent }}
                  >
                    Paso {step.num}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-xs font-bold text-slate-900">{step.title}</div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{step.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

/* 2. ESQUEMA ANIMADO DE MEDICIÓN EN CAMPO A 30 CM (EVALUADOR DE DOSIS) */
interface FieldMeasurementSchematicProps {
  avgBackground: number;
  pointReading: number;
  netDoseRate: number;
  tierColor: string;
  tierLabel: string;
}

export const FieldMeasurementSchematic: React.FC<FieldMeasurementSchematicProps> = ({
  avgBackground,
  pointReading,
  netDoseRate,
  tierColor,
  tierLabel,
}) => {
  return (
    <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <span className="text-xs font-semibold text-white">
          Esquema Gráfico de Procedimiento en Campo: Fondo Natural vs. Medición a 30 cm
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Sincronizado en tiempo real con tus lecturas
        </span>
      </div>

      <svg
        viewBox="0 0 880 158"
        className="w-full min-w-[660px] h-auto"
        role="img"
        aria-label="Esquema animado de toma de fondo natural y medición a 30 centímetros con intensímetro calibrado"
      >
        {/* Zona 1: Fondo Natural */}
        <rect x="12" y="14" width="235" height="130" rx="10" fill="#131F33" stroke="#1E293B" />
        <text x="26" y="34" fill="#94A3B8" fontSize="10.5" fontWeight="600">
          1. ZONA LIBRE (FONDO NATURAL)
        </text>
        {/* Suelo natural + rayos cósmicos */}
        <path d="M 28 118 Q 85 110, 140 116 T 232 114 L 232 132 L 28 132 Z" fill="#1E3A2F" />
        <line x1="65" y1="46" x2="65" y2="86" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow-dash-slow" />
        <line x1="115" y1="46" x2="115" y2="86" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-flow-dash-slow" />
        <rect x="52" y="84" width="76" height="24" rx="5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.2" />
        <text x="90" y="100" textAnchor="middle" fill="#E0F2FE" fontSize="11" fontFamily="JetBrains Mono" fontWeight="700">
          {avgBackground.toFixed(3)} µSv/h
        </text>
        <text x="142" y="72" fill="#CBD5E1" fontSize="10">
          Promedio
        </text>
        <text x="142" y="86" fill="#94A3B8" fontSize="9.5">
          ≥ 4 lecturas
        </text>
        <text x="142" y="100" fill="#94A3B8" fontSize="9.5">
          sin equipos
        </text>

        {/* Flecha 1 -> 2 */}
        <line x1="252" y1="79" x2="294" y2="79" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
        <polygon points="292,74 302,79 292,84" fill="#38BDF8" />

        {/* Zona 2: Punto de Interés a 30 cm */}
        <rect x="306" y="14" width="320" height="130" rx="10" fill="#131F33" stroke="#1E293B" />
        <text x="320" y="34" fill="#94A3B8" fontSize="10.5" fontWeight="600">
          2. MEDICIÓN EN PUNTO DE INTERÉS (A 30 CM)
        </text>

        {/* Tubería con incrustación interna */}
        <circle cx="372" cy="86" r="30" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" />
        <circle cx="372" cy="86" r="21" fill="#78350F" stroke="#F59E0B" strokeWidth="3" strokeDasharray="5 2" />
        <circle cx="372" cy="86" r="13" fill="#0F172A" />
        <text x="372" y="132" textAnchor="middle" fill="#CBD5E1" fontSize="9.5">
          Tubería / Equipo
        </text>

        {/* Ondas de radiación animadas */}
        <circle cx="372" cy="86" r="36" fill="none" stroke={tierColor} strokeWidth="1.8" className="animate-radar-wave" />
        <circle
          cx="372"
          cy="86"
          r="36"
          fill="none"
          stroke={tierColor}
          strokeWidth="1.5"
          className="animate-radar-wave"
          style={{ animationDelay: '1.1s' }}
        />

        {/* Cota de 30 cm */}
        <line x1="406" y1="86" x2="496" y2="86" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="406" y1="80" x2="406" y2="92" stroke="#FBBF24" strokeWidth="1.5" />
        <line x1="496" y1="80" x2="496" y2="92" stroke="#FBBF24" strokeWidth="1.5" />
        <rect x="428" y="62" width="46" height="18" rx="4" fill="#F59E0B" />
        <text x="451" y="74.5" textAnchor="middle" fill="#0B1320" fontSize="10.5" fontWeight="700" fontFamily="JetBrains Mono">
          30 cm
        </text>

        {/* Intensímetro portátil */}
        <rect x="502" y="54" width="106" height="62" rx="8" fill="#1E293B" stroke={tierColor} strokeWidth="2" />
        <rect x="512" y="64" width="86" height="24" rx="4" fill="#0B1320" />
        <text x="555" y="80" textAnchor="middle" fill="#F8FAFC" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono">
          {Number(pointReading).toFixed(2)} µSv/h
        </text>
        <text x="555" y="103" textAnchor="middle" fill="#94A3B8" fontSize="9.5">
          Intensímetro ATEX
        </text>

        {/* Flecha 2 -> 3 */}
        <line x1="630" y1="79" x2="668" y2="79" stroke={tierColor} strokeWidth="2" strokeDasharray="6 4" className="animate-flow-dash" />
        <polygon points="666,74 676,79 666,84" fill={tierColor} />

        {/* Zona 3: Cálculo Tasa Neta */}
        <rect x="680" y="14" width="188" height="130" rx="10" fill="#131F33" stroke={tierColor} strokeWidth="1.8" />
        <text x="694" y="34" fill="#94A3B8" fontSize="10.5" fontWeight="600">
          3. TASA NETA RESULTANTE
        </text>
        <text x="774" y="60" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="JetBrains Mono">
          {Number(pointReading).toFixed(2)} − {avgBackground.toFixed(3)}
        </text>
        <text x="774" y="95" textAnchor="middle" fill="#FFFFFF" fontSize="22" fontWeight="800" fontFamily="JetBrains Mono">
          {netDoseRate.toFixed(2)}
        </text>
        <text x="774" y="111" textAnchor="middle" fill="#94A3B8" fontSize="10.5" fontFamily="JetBrains Mono">
          µSv/h netos
        </text>
        <rect x="704" y="119" width="140" height="18" rx="4" fill={tierColor} fillOpacity="0.22" />
        <text x="774" y="131.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
          Nivel: {tierLabel}
        </text>
      </svg>
    </div>
  );
};

/* 3. ESQUEMAS ANIMADOS DE LAS 4 FORMAS DE APARICIÓN NORM EN HIDROCARBUROS */
export const NormAppearanceVisuals: React.FC = () => {
  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div>
        <div className="text-xs text-slate-500">
          Mecanismos de Transporte y Concentración en Exploración y Producción
        </div>
        <h3 className="text-base font-bold text-slate-900 mt-1">
          Principales Formas de Aparición de Radionucleidos Naturales
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Esquema visual de cómo los radionucleidos migran desde la formación geológica hasta equipos y corrientes de proceso.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Agua de Producción */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-[#0B1320] p-3">
            <svg viewBox="0 0 220 96" className="w-full h-24" role="img" aria-label="Esquema animado de agua de producción con iones de radio">
              <rect x="8" y="34" width="204" height="54" rx="6" fill="#0C4A6E" fillOpacity="0.55" stroke="#38BDF8" strokeOpacity="0.5" />
              <path d="M 8 44 Q 35 36, 62 44 T 116 44 T 170 44 T 212 44" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="8 4" className="animate-flow-dash" />
              <circle cx="52" cy="66" r="10" fill="#0284C7" className="animate-gas-rise" />
              <text x="52" y="69" textAnchor="middle" fill="#FFF" fontSize="8" fontFamily="JetBrains Mono" fontWeight="700">Ra</text>
              <circle cx="110" cy="70" r="10" fill="#0EA5E9" className="animate-gas-rise" style={{ animationDelay: '0.9s' }} />
              <text x="110" y="73" textAnchor="middle" fill="#FFF" fontSize="8" fontFamily="JetBrains Mono" fontWeight="700">Ba</text>
              <circle cx="166" cy="64" r="10" fill="#38BDF8" className="animate-gas-rise" style={{ animationDelay: '1.7s' }} />
              <text x="166" y="67" textAnchor="middle" fill="#0B1320" fontSize="8" fontFamily="JetBrains Mono" fontWeight="700">Ca</text>
              <text x="110" y="20" textAnchor="middle" fill="#BAE6FD" fontSize="10" fontWeight="700">
                Cationes Grupo II Disueltos
              </text>
            </svg>
          </div>
          <div className="p-4 space-y-1.5 text-xs flex-1">
            <div className="font-bold text-slate-900">Agua de Producción</div>
            <div className="font-mono text-[11px] font-semibold text-sky-800">
              ²²⁶Ra · ²²⁸Ra · ²²⁴Ra · ²¹⁰Pb
            </div>
            <p className="text-slate-600 leading-relaxed">
              Disuelve sales y cationes de Ca, Sr, Ba y Radio desde la roca reservorio según salinidad y volumen producido.
            </p>
          </div>
        </div>

        {/* 2. Incrustaciones (Radiobarita) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-[#0B1320] p-3">
            <svg viewBox="0 0 220 96" className="w-full h-24" role="img" aria-label="Esquema animado de incrustaciones de radiobarita en tubería">
              {/* Corte de tubería */}
              <circle cx="110" cy="52" r="34" fill="#334155" stroke="#94A3B8" strokeWidth="2.5" />
              <circle cx="110" cy="52" r="24" fill="#92400E" stroke="#F59E0B" strokeWidth="4" strokeDasharray="6 2" />
              <circle cx="110" cy="52" r="13" fill="#0B1320" />
              {/* Emisión gamma externa */}
              <circle cx="110" cy="52" r="38" fill="none" stroke="#EF4444" strokeWidth="1.6" className="animate-radar-wave" />
              <text x="34" y="22" fill="#FCD34D" fontSize="9.5" fontWeight="700">γ Externa</text>
              <text x="155" y="84" fill="#FDBA74" fontSize="9" fontFamily="JetBrains Mono">Ba(Ra)SO₄</text>
            </svg>
          </div>
          <div className="p-4 space-y-1.5 text-xs flex-1">
            <div className="font-bold text-slate-900">Incrustaciones (Escamas)</div>
            <div className="font-mono text-[11px] font-semibold text-amber-800">
              ²²⁶Ra · ²²⁸Ra · ²²⁴Ra (Radiobarita)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Al bajar presión y temperatura, precipitan sulfatos y carbonatos duros en tuberías, válvulas y cabezales.
            </p>
          </div>
        </div>

        {/* 3. Lodos y Sedimentos */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-[#0B1320] p-3">
            <svg viewBox="0 0 220 96" className="w-full h-24" role="img" aria-label="Esquema animado de sedimentación de lodos radiactivos en tanques y separadores">
              <rect x="30" y="18" width="160" height="68" rx="8" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              {/* Capa de lodos en el fondo */}
              <path d="M 32 64 Q 80 56, 125 63 T 188 60 L 188 84 L 32 84 Z" fill="#B45309" fillOpacity="0.85" />
              {/* Partículas sedimentando */}
              <circle cx="72" cy="36" r="3" fill="#FBBF24" className="animate-sediment-drop" />
              <circle cx="110" cy="32" r="3.5" fill="#F59E0B" className="animate-sediment-drop" style={{ animationDelay: '0.8s' }} />
              <circle cx="148" cy="38" r="3" fill="#FBBF24" className="animate-sediment-drop" style={{ animationDelay: '1.5s' }} />
              <text x="110" y="77" textAnchor="middle" fill="#FFFBEB" fontSize="9.5" fontWeight="700">
                Arenas · Arcillas · Parafinas
              </text>
            </svg>
          </div>
          <div className="p-4 space-y-1.5 text-xs flex-1">
            <div className="font-bold text-slate-900">Lodos y Cortes</div>
            <div className="font-mono text-[11px] font-semibold text-amber-800">
              ²²⁶Ra · ²²⁸Ra · ²¹⁰Pb · ²¹⁰Po
            </div>
            <p className="text-slate-600 leading-relaxed">
              Se sedimentan en fondos de separadores, tanques y piscinas; exigen control de irradiación externa y ventilación.
            </p>
          </div>
        </div>

        {/* 4. Películas Finas en Líneas de Gas */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
          <div className="bg-[#0B1320] p-3">
            <svg viewBox="0 0 220 96" className="w-full h-24" role="img" aria-label="Esquema animado de flujo de gas con radón y deposición de películas de Plomo-210 y Polonio-210">
              {/* Ducto horizontal */}
              <rect x="14" y="28" width="192" height="40" rx="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="2" />
              {/* Película fina superior e inferior */}
              <line x1="20" y1="32" x2="200" y2="32" stroke="#F87171" strokeWidth="3" />
              <line x1="20" y1="64" x2="200" y2="64" stroke="#F87171" strokeWidth="3" />
              {/* Flujo de gas con Radón */}
              <line x1="26" y1="48" x2="194" y2="48" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="8 6" className="animate-flow-dash" />
              <text x="110" y="20" textAnchor="middle" fill="#FCA5A5" fontSize="9.5" fontWeight="700">
                Película ²¹⁰Pb / ²¹⁰Po
              </text>
              <text x="110" y="84" textAnchor="middle" fill="#7DD3FC" fontSize="9.5" fontFamily="JetBrains Mono">
                Flujo de Gas (²²²Rn)
              </text>
            </svg>
          </div>
          <div className="p-4 space-y-1.5 text-xs flex-1">
            <div className="font-bold text-slate-900">Películas en Gas</div>
            <div className="font-mono text-[11px] font-semibold text-red-700">
              ²²²Rn → ²¹⁰Pb / ²¹⁰Po (α / β)
            </div>
            <p className="text-slate-600 leading-relaxed">
              El gas radón migra y su progenie forma depósitos delgados en compresores y líneas de tratamiento y licuefacción.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* 4. ESCENA INTERACTIVA EN VIVO DE PRINCIPIOS ALARA (TIEMPO · DISTANCIA · BLINDAJE) */
interface AlaraLiveSceneProps {
  distanceM: number;
  stayHours: number;
  shieldId: string;
  effectiveDoseRate: number;
}

export const AlaraLiveScene: React.FC<AlaraLiveSceneProps> = ({
  distanceM,
  stayHours,
  shieldId,
  effectiveDoseRate,
}) => {
  // Map distance 0.3m..3.0m to x offset 125..470
  const normDist = Math.max(0, Math.min(1, (distanceM - 0.3) / 2.7));
  const workerX = 140 + normDist * 320;
  const shieldColors: Record<string, { fill: string; label: string; width: number }> = {
    none: { fill: 'transparent', label: '', width: 0 },
    steel: { fill: '#64748B', label: 'Acero 10mm', width: 12 },
    concrete: { fill: '#94A3B8', label: 'Concreto 5cm', width: 22 },
    lead: { fill: '#475569', label: 'Plomo 12mm', width: 16 },
  };
  const shield = shieldColors[shieldId] || shieldColors.none;

  const rateColor =
    effectiveDoseRate > 10
      ? '#EF4444'
      : effectiveDoseRate > 2.5
      ? '#F59E0B'
      : '#10B981';

  return (
    <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <span className="font-semibold text-white">
          Visualización en Vivo: Distancia, Blindaje y Tiempo de Exposición
        </span>
        <span className="font-mono text-[11px] text-slate-300">
          {distanceM.toFixed(2)} m · {stayHours.toFixed(2)} h · {effectiveDoseRate.toFixed(2)} µSv/h
        </span>
      </div>

      <svg
        viewBox="0 0 600 130"
        className="w-full min-w-[480px] h-auto"
        role="img"
        aria-label={`Escena interactiva ALARA mostrando operador a ${distanceM.toFixed(1)} metros de la fuente`}
      >
        {/* Piso */}
        <line x1="20" y1="104" x2="580" y2="104" stroke="#334155" strokeWidth="2" />

        {/* Fuente NORM (Tubería / Válvula) */}
        <rect x="34" y="42" width="38" height="62" rx="6" fill="#334155" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="53" cy="64" r="10" fill="#F59E0B" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="53" y="68" textAnchor="middle" fill="#FCD34D" fontSize="11" fontWeight="700">
          ☢
        </text>
        <text x="53" y="120" textAnchor="middle" fill="#94A3B8" fontSize="9.5">
          Fuente
        </text>

        {/* Ondas de radiación desde la fuente */}
        <circle cx="53" cy="64" r="24" fill="none" stroke="#F59E0B" strokeWidth="1.5" className="animate-radar-wave" />
        <circle
          cx="53"
          cy="64"
          r="24"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.2"
          className="animate-radar-wave"
          style={{ animationDelay: '1.1s' }}
        />

        {/* Haz de radiación hacia el operador */}
        <line
          x1="74"
          y1="64"
          x2={workerX - 18}
          y2="64"
          stroke={rateColor}
          strokeWidth={shieldId === 'none' ? 2.5 : 1.5}
          strokeDasharray="7 5"
          strokeOpacity={Math.max(0.25, 1 - normDist * 0.65)}
          className="animate-flow-dash"
        />

        {/* Barrera de blindaje (aparece si está seleccionada) */}
        {shield.width > 0 && (
          <g style={{ transition: 'opacity 250ms ease' }}>
            <rect
              x="104"
              y="26"
              width={shield.width}
              height="78"
              rx="3"
              fill={shield.fill}
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
            <text x={104 + shield.width / 2} y="120" textAnchor="middle" fill="#CBD5E1" fontSize="9">
              {shield.label}
            </text>
          </g>
        )}

        {/* Cota dinámica de distancia */}
        <line x1="74" y1="22" x2={workerX} y2="22" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 3" />
        <rect x={(74 + workerX) / 2 - 26} y="12" width="52" height="18" rx="4" fill="#0284C7" />
        <text
          x={(74 + workerX) / 2}
          y="24.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="700"
          fontFamily="JetBrains Mono"
        >
          {distanceM.toFixed(1)} m
        </text>

        {/* Silueta animada del operador (se desplaza suavemente con transform) */}
        <g
          style={{
            transform: `translateX(${workerX}px)`,
            transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Casco + cabeza */}
          <circle cx="0" cy="44" r="9" fill="#E2E8F0" />
          <path d="M -10 42 A 10 9 0 0 1 10 42 Z" fill="#F59E0B" />
          {/* Cuerpo */}
          <rect x="-10" y="55" width="20" height="28" rx="6" fill="#0284C7" />
          {/* Piernas */}
          <line x1="-4" y1="83" x2="-5" y2="103" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <line x1="4" y1="83" x2="5" y2="103" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          {/* Indicador tasa en operador */}
          <rect x="-32" y="108" width="64" height="16" rx="4" fill={rateColor} fillOpacity="0.22" />
          <text x="0" y="119" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
            {effectiveDoseRate.toFixed(1)} µSv/h
          </text>
        </g>

        {/* Reloj visual de tiempo a la derecha */}
        <g transform="translate(546, 56)">
          <circle cx="0" cy="0" r="26" fill="#131F33" stroke="#334155" strokeWidth="2" />
          <circle
            cx="0"
            cy="0"
            r="20"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="4"
            strokeDasharray={`${(stayHours / 8) * 125.6} 125.6`}
            transform="rotate(-90)"
            style={{ transition: 'stroke-dasharray 220ms ease' }}
          />
          <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="10.5" fontWeight="700" fontFamily="JetBrains Mono">
            {stayHours.toFixed(1)}h
          </text>
          <text x="0" y="42" textAnchor="middle" fill="#94A3B8" fontSize="9">
            Tiempo
          </text>
        </g>
      </svg>
    </div>
  );
};

/* 5. ESQUEMA VISUAL DE HIGIENE Y DESCONTAMINACIÓN HUMANA (3 PASOS GRÁFICOS) */
export const HumanHygieneSchematic: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-2 pt-1">
      {/* 1. Prohibición */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center space-y-1.5">
        <svg viewBox="0 0 64 48" className="w-12 h-9 mx-auto" role="img" aria-label="Prohibido comer, beber o fumar en zona NORM">
          <circle cx="32" cy="24" r="18" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2.5" />
          <rect x="21" y="21" width="22" height="6" rx="2" fill="#475569" />
          <line x1="19" y1="11" x2="45" y2="37" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="text-[10.5px] font-bold text-slate-800 leading-tight">
          No comer, beber ni fumar
        </div>
      </div>

      {/* 2. Retiro EPP */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center space-y-1.5">
        <svg viewBox="0 0 64 48" className="w-12 h-9 mx-auto" role="img" aria-label="Retirar ropa contaminada y guardar en bolsa plástica sellada">
          <path d="M 18 16 L 46 16 L 50 42 L 14 42 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path d="M 24 16 L 26 8 L 38 8 L 40 16" fill="none" stroke="#D97706" strokeWidth="2" />
          <line x1="22" y1="26" x2="42" y2="26" stroke="#B45309" strokeWidth="2" strokeDasharray="3 2" />
          <text x="32" y="37" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="700">EPP</text>
        </svg>
        <div className="text-[10.5px] font-bold text-slate-800 leading-tight">
          Embolsar ropa contaminada
        </div>
      </div>

      {/* 3. Ducha tibia + jabón neutro */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center space-y-1.5">
        <svg viewBox="0 0 64 48" className="w-12 h-9 mx-auto" role="img" aria-label="Ducha con agua tibia y jabón neutro">
          <path d="M 20 14 Q 32 6, 44 14 Z" fill="#0284C7" />
          <line x1="24" y1="18" x2="22" y2="38" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" className="animate-flow-dash" />
          <line x1="32" y1="18" x2="32" y2="40" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" className="animate-flow-dash" />
          <line x1="40" y1="18" x2="42" y2="38" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" className="animate-flow-dash" />
        </svg>
        <div className="text-[10.5px] font-bold text-slate-800 leading-tight">
          Ducha tibia y jabón neutro
        </div>
      </div>
    </div>
  );
};

/* 6. ESQUEMA VISUAL ANIMADO DE MÉTODOS DE DESCONTAMINACIÓN (PASO 3 EN ÁRBOLES) */
export const DecontaminationMethodsSchematic: React.FC = () => {
  return (
    <div className="bg-[#0B1320] border border-slate-800 rounded-xl p-4 overflow-x-auto">
      <div className="text-[11px] font-semibold text-slate-300 mb-2">
        Comparativa Gráfica de Técnicas de Remoción de Incrustaciones y Películas
      </div>
      <svg
        viewBox="0 0 680 112"
        className="w-full min-w-[540px] h-auto"
        role="img"
        aria-label="Diagrama animado comparando descontaminación abrasiva por agua a alta presión y descontaminación química"
      >
        {/* Izquierda: Abrasivo Mecánico (Hidrojet / Escariado + HEPA) */}
        <rect x="8" y="8" width="320" height="96" rx="8" fill="#131F33" stroke="#334155" />
        <text x="22" y="26" fill="#38BDF8" fontSize="10.5" fontWeight="700">
          MÉTODOS ABRASIVOS (HIDROJET / ESCARIADO / MANUAL)
        </text>
        {/* Tubería con escama */}
        <rect x="24" y="42" width="120" height="36" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="28" y="46" width="112" height="7" fill="#D97706" />
        <rect x="28" y="67" width="112" height="7" fill="#D97706" />
        {/* Chorro animado */}
        <line x1="154" y1="60" x2="60" y2="60" stroke="#38BDF8" strokeWidth="3.5" strokeDasharray="8 4" className="animate-jet-stream" />
        <circle cx="164" cy="60" r="8" fill="#0284C7" />
        <text x="246" y="54" textAnchor="middle" fill="#CBD5E1" fontSize="9.5" fontWeight="600">
          Alta eficiencia mecánica
        </text>
        <text x="246" y="68" textAnchor="middle" fill="#94A3B8" fontSize="9">
          Control obligatorio de
        </text>
        <text x="246" y="80" textAnchor="middle" fill="#FCD34D" fontSize="9" fontWeight="600">
          aerosoles y filtro HEPA
        </text>

        {/* Derecha: Métodos Químicos */}
        <rect x="352" y="8" width="320" height="96" rx="8" fill="#131F33" stroke="#334155" />
        <text x="366" y="26" fill="#34D399" fontSize="10.5" fontWeight="700">
          MÉTODOS QUÍMICOS (INHIBIDORES IN SITU / QUELANTES)
        </text>
        {/* Circuito cerrado químico */}
        <rect x="372" y="44" width="90" height="34" rx="5" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
        <text x="417" y="65" textAnchor="middle" fill="#A7F3D0" fontSize="10" fontWeight="700">
          Ácido / Quelante
        </text>
        <path
          d="M 464 54 L 520 54 L 520 72 L 464 72"
          fill="none"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          className="animate-flow-dash"
        />
        <text x="594" y="54" textAnchor="middle" fill="#CBD5E1" fontSize="9.5" fontWeight="600">
          Superficies complejas
        </text>
        <text x="594" y="68" textAnchor="middle" fill="#94A3B8" fontSize="9">
          Gestionar efluentes líquidos
        </text>
        <text x="594" y="80" textAnchor="middle" fill="#6EE7B7" fontSize="9" fontWeight="600">
          con radionucleidos disueltos
        </text>
      </svg>
    </div>
  );
};
