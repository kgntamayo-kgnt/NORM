import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  CheckCircle2,
  Droplets,
  GraduationCap,
  HardHat,
  Pause,
  Play,
  Shield,
  Sliders,
  Users,
} from 'lucide-react';
import { RADIATION_SHIELDING, TRAINING_PROFILES } from '../data/normData';
import { AlaraLiveScene, HumanHygieneSchematic } from './VisualSchematics';

interface ProtectionAndAlaraProps {
  baseSourceRate?: number;
}

const SHIELDING_OPTIONS = [
  { id: 'none', label: 'Sin blindaje adicional', factor: 1.0, detail: 'Atenuación 0% (exposición directa)' },
  { id: 'steel', label: 'Acero carbono 10 mm', factor: 0.62, detail: 'Atenúa ~38% radiación gamma típica ²²⁶Ra' },
  { id: 'concrete', label: 'Concreto 5 cm', factor: 0.50, detail: 'Atenúa ~50% (1 capa hemirreductora aprox.)' },
  { id: 'lead', label: 'Manta plomada 12 mm', factor: 0.25, detail: 'Atenúa ~75% radiación gamma externa' },
];

const SCENARIOS = [
  {
    id: 'routine_gamma',
    label: 'Inspección Rutinaria y Fondo',
    instrument:
      'Intensímetro (Geiger-Müller o Cámara de Ionización) en µSv/h. Debe ser intrínsecamente seguro (ATEX/IECEx) para atmósferas explosivas en Oil & Gas y contar con calibración vigente.',
    dosimetry:
      'Dosímetro pasivo de lectura diferida (mensual) si se opera en zonas supervisadas, provisto por empresa autorizada (Res. 18 1289 de 2004).',
    epp: 'EPP estándar de campo petrolero (casco, gafas, ropa ignífuga, botas). Medir a 30 cm de superficie de equipos/tuberías y a 1 m en áreas abiertas.',
  },
  {
    id: 'maintenance_open',
    label: 'Apertura / Desincrustación',
    instrument:
      'Intensímetro (µSv/h) + Monitor de Contaminación Superficial (Bq/cm² / CPS / CPM) para validar limpieza de piezas y monitorear al personal al finalizar la tarea.',
    dosimetry:
      'Dosímetro Electrónico de Lectura Directa (EPD) con alarma sonora/vibración programada, complementado con dosímetro pasivo oficial.',
    epp: 'Overol desechable Tyvek, doble guante de nitrilo, respirador con filtros HEPA (P100). Prohibido comer, beber o fumar. Ducha con agua tibia y jabón neutro al cierre.',
  },
  {
    id: 'gas_films',
    label: 'Líneas de Gas (²¹⁰Pb/²¹⁰Po)',
    instrument:
      'Monitor de Contaminación Alfa/Beta con sonda de ventana fina + frotis superficiales (smear test) validados por laboratorio para ²¹⁰Pb/²¹⁰Po.',
    dosimetry:
      'Evaluación previa de dosis y control de exposición interna si hay corte, esmerilado o abrasión mecánica en tuberías y unidades de licuefacción.',
    epp: 'Respirador cara completa con filtro P100/HEPA, guantes impermeables sellados. Evitar pulido en seco que genere aerosoles de ²¹⁰Po.',
  },
  {
    id: 'confined_radon',
    label: 'Tanques y Espacios Confinados',
    instrument:
      'Monitor Continuo de Radón (²²²Rn) o sistemas pasivos (carbón activado / centelleo líquido / trazas nucleares) para ²²²Rn y progenie (²¹⁸Po, ²¹⁴Po) + monitor multigás.',
    dosimetry:
      'Mantener concentración media anual por debajo de 1,000 Bq/m³ (Res. 18 1434) y ventilar antes de cualquier ingreso.',
    epp: 'Ventilación forzada continua, línea de aire o equipo de respiración autocontenido (SCBA) si se superan niveles de referencia.',
  },
];

export const ProtectionAndAlara: React.FC<ProtectionAndAlaraProps> = ({
  baseSourceRate = 8.0,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('routine_gamma');
  const [animateRays, setAnimateRays] = useState<boolean>(true);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('exposed');

  // Interactive ALARA Simulator State
  const [sourceRateAt30cm, setSourceRateAt30cm] = useState<number>(
    Math.max(2.5, Number(baseSourceRate.toFixed(1)))
  );
  const [distanceM, setDistanceM] = useState<number>(1.2);
  const [stayHours, setStayHours] = useState<number>(2.0);
  const [shieldId, setShieldId] = useState<string>('none');

  const activeShield = useMemo(
    () => SHIELDING_OPTIONS.find((s) => s.id === shieldId) || SHIELDING_OPTIONS[0],
    [shieldId]
  );

  const effectiveDoseRate = useMemo(() => {
    const distFactor = Math.pow(0.3 / Math.max(0.3, distanceM), 2);
    return sourceRateAt30cm * distFactor * activeShield.factor;
  }, [sourceRateAt30cm, distanceM, activeShield]);

  const unmitigatedTaskDose = useMemo(() => sourceRateAt30cm * 4.0, [sourceRateAt30cm]);
  const optimizedTaskDose = useMemo(() => effectiveDoseRate * stayHours, [effectiveDoseRate, stayHours]);
  const reductionPct = useMemo(() => {
    if (unmitigatedTaskDose <= 0) return 0;
    return Math.max(0, Math.min(99.9, (1 - optimizedTaskDose / unmitigatedTaskDose) * 100));
  }, [unmitigatedTaskDose, optimizedTaskDose]);

  const distanceCurve = useMemo(() => {
    const pts = [];
    for (let d = 0.3; d <= 3.05; d += 0.1) {
      const dist = Number(d.toFixed(2));
      const rateNoShield = Number((sourceRateAt30cm * Math.pow(0.3 / dist, 2)).toFixed(2));
      const rateShielded = Number((rateNoShield * activeShield.factor).toFixed(2));
      pts.push({ dist, rateNoShield, rateShielded });
    }
    return pts;
  }, [sourceRateAt30cm, activeShield]);

  const activeScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0],
    [selectedScenarioId]
  );

  const activeTraining = useMemo(
    () => TRAINING_PROFILES.find((t) => t.id === selectedTrainingId) || TRAINING_PROFILES[0],
    [selectedTrainingId]
  );

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* SIMULADOR INTERACTIVO ALARA: TIEMPO · DISTANCIA (1/d²) · BLINDAJE */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs text-slate-500">
              Optimización Operativa ALARA · Principios de Tiempo, Distancia y Blindaje
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-600" />
              Simulador Gráfico de Control de Exposición Externa (Ley 1/d²)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualiza cómo alejarse del equipo, planificar el tiempo de intervención o interponer blindaje reduce drásticamente la dosis ocupacional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-5 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Tasa medida a 30 cm del equipo</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {sourceRateAt30cm.toFixed(1)} µSv/h
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={sourceRateAt30cm}
                onChange={(e) => setSourceRateAt30cm(parseFloat(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Distancia de trabajo / demarcación</span>
                <span className="font-mono tabular-nums text-sky-700">
                  {distanceM.toFixed(2)} m
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={distanceM}
                onChange={(e) => setDistanceM(parseFloat(e.target.value))}
                className="w-full accent-sky-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0.3 m (Contacto)</span>
                <span>1.5 m</span>
                <span>3.0 m</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                <span>Tiempo de permanencia en tarea</span>
                <span className="font-mono tabular-nums text-amber-700">
                  {stayHours.toFixed(2)} h
                </span>
              </div>
              <input
                type="range"
                min="0.25"
                max="8"
                step="0.25"
                value={stayHours}
                onChange={(e) => setStayHours(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Barrera de blindaje gamma
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {SHIELDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setShieldId(opt.id)}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                      shieldId === opt.id
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="font-mono text-[11px] opacity-80">
                      ×{opt.factor.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Tasa Optimizada en Punto</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  {effectiveDoseRate.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">µSv/h</span>
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Dosis Total de la Tarea</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-sky-700 mt-1 block">
                  {optimizedTaskDose.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">µSv</span>
                </span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block">Reducción ALARA Lograda</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1 block">
                  −{reductionPct.toFixed(1)}%
                </span>
              </div>
            </div>

            <AlaraLiveScene
              distanceM={distanceM}
              stayHours={stayHours}
              shieldId={shieldId}
              effectiveDoseRate={effectiveDoseRate}
            />

            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-800">
                  Curva de Atenuación por Distancia (Ley del Inverso del Cuadrado 1/d²)
                </span>
                <span className="font-mono text-slate-500">Distancia actual: {distanceM.toFixed(1)} m</span>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={distanceCurve} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      type="number"
                      dataKey="dist"
                      domain={[0.3, 3.0]}
                      tickFormatter={(v) => `${v}m`}
                      tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: number, name: string) => [
                        `${val.toFixed(2)} µSv/h`,
                        name === 'rateNoShield' ? 'Sin blindaje' : 'Con blindaje seleccionado',
                      ]}
                      labelFormatter={(d) => `Distancia: ${d} metros`}
                      contentStyle={{
                        backgroundColor: '#0B1320',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine
                      x={Number(distanceM.toFixed(2))}
                      stroke="#0284C7"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="rateNoShield"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="#94A3B8"
                      fillOpacity={0.08}
                      animationDuration={400}
                    />
                    <Area
                      type="monotone"
                      dataKey="rateShielded"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      fill="#0284C7"
                      fillOpacity={0.18}
                      animationDuration={400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIAGRAMA ANIMADO DE PODER DE PENETRACIÓN Y BLINDAJE (α, β, γ) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">Física de Radiaciones Ionizantes y Barreras</div>
            <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-700" />
              Animación de Poder de Penetración y Blindajes Recomendados
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setAnimateRays((a) => !a)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            {animateRays ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {animateRays ? 'Pausar radiación' : 'Animar radiación'}
          </button>
        </div>

        {/* SVG Penetration Schematic with live animated particles */}
        <div className="w-full overflow-x-auto bg-[#0B1320] rounded-xl border border-slate-800 p-4">
          <svg
            viewBox="0 0 880 215"
            className="w-full min-w-[680px] h-auto"
            role="img"
            aria-label="Diagrama animado de penetración de radiaciones Alfa, Beta y Gamma frente a papel, aluminio y plomo"
          >
            {/* Barriers */}
            <rect x="300" y="20" width="16" height="150" rx="3" fill="#F8FAFC" />
            <text x="308" y="194" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="600">
              Papel / Piel
            </text>

            <rect x="490" y="20" width="22" height="150" rx="3" fill="#38BDF8" fillOpacity="0.85" />
            <text x="501" y="194" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="600">
              Acrílico / Aluminio
            </text>

            <rect x="690" y="20" width="42" height="150" rx="4" fill="#64748B" />
            <text x="711" y="194" textAnchor="middle" fill="#CBD5E1" fontSize="11" fontWeight="600">
              Plomo / Acero / Concreto
            </text>

            {/* Alpha row */}
            <text x="24" y="54" fill="#FBBF24" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans">
              Alfa (α)
            </text>
            <text x="24" y="70" fill="#94A3B8" fontSize="10.5">
              Riesgo Interno (²²⁶Ra, ²¹⁰Po)
            </text>
            <line x1="185" y1="54" x2="296" y2="54" stroke="#F59E0B" strokeWidth="2.5" strokeOpacity="0.45" />
            {animateRays && (
              <>
                <circle cx="190" cy="54" r="5.5" fill="#FBBF24" className="animate-alpha-particle" />
                <circle
                  cx="190"
                  cy="54"
                  r="5.5"
                  fill="#F59E0B"
                  className="animate-alpha-particle"
                  style={{ animationDelay: '1.1s' }}
                />
              </>
            )}
            <polygon points="292,48 300,54 292,60" fill="#F59E0B" />
            <text x="330" y="58" fill="#94A3B8" fontSize="11">
              Detenida por papel o piel intacta · Control: EPP HEPA y contención
            </text>

            {/* Beta row */}
            <text x="24" y="106" fill="#38BDF8" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans">
              Beta (β)
            </text>
            <text x="24" y="122" fill="#94A3B8" fontSize="10.5">
              Piel / Cristalino (²²⁸Ra, ²¹⁰Pb)
            </text>
            <line
              x1="185"
              y1="106"
              x2="486"
              y2="106"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="8 5"
              strokeOpacity="0.55"
              className={animateRays ? 'animate-flow-dash' : ''}
            />
            {animateRays && (
              <>
                <circle cx="190" cy="106" r="4" fill="#7DD3FC" className="animate-beta-particle" />
                <circle
                  cx="190"
                  cy="106"
                  r="4"
                  fill="#38BDF8"
                  className="animate-beta-particle"
                  style={{ animationDelay: '1.3s' }}
                />
              </>
            )}
            <polygon points="482,100 490,106 482,112" fill="#38BDF8" />
            <text x="526" y="110" fill="#94A3B8" fontSize="11">
              Detenida por plástico, madera o acrílico
            </text>

            {/* Gamma row */}
            <text x="24" y="156" fill="#F87171" fontSize="13" fontWeight="700" fontFamily="Plus Jakarta Sans">
              Gamma (γ)
            </text>
            <text x="24" y="172" fill="#94A3B8" fontSize="10.5">
              Cuerpo Entero (Incrustaciones)
            </text>
            <path
              d="M 185 156 Q 200 146, 215 156 T 245 156 T 275 156 T 305 156 T 335 156 T 365 156 T 395 156 T 425 156 T 455 156 T 485 156 T 515 156 T 545 156 T 575 156 T 605 156 T 635 156 T 665 156 T 695 156 T 725 156"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.4"
              strokeDasharray={animateRays ? '12 4' : undefined}
              className={animateRays ? 'animate-flow-dash' : ''}
            />
            {animateRays && (
              <>
                <circle cx="190" cy="156" r="3.5" fill="#FCA5A5" className="animate-gamma-particle" />
                <circle
                  cx="190"
                  cy="156"
                  r="3.5"
                  fill="#EF4444"
                  className="animate-gamma-particle"
                  style={{ animationDelay: '1.5s' }}
                />
              </>
            )}
            <line x1="732" y1="156" x2="800" y2="156" stroke="#EF4444" strokeWidth="1.2" strokeOpacity="0.35" strokeDasharray="3 4" />
            <text x="742" y="144" fill="#FCA5A5" fontSize="10.5">
              Atenuada exponencialmente
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {RADIATION_SHIELDING.map((item) => (
            <div
              key={item.symbol}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Radiación {item.type}</span>
                  <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 w-7 h-7 rounded-lg flex items-center justify-center">
                    {item.symbol}
                  </span>
                </div>
                <p className="text-slate-600">{item.nature}</p>
                <p className="text-slate-600">
                  <strong className="text-slate-800">Alcance:</strong> {item.range}
                </p>
                <p className="text-slate-600">
                  <strong className="text-slate-800">Riesgo principal:</strong> {item.hazard}
                </p>
              </div>
              <div className="pt-2.5 border-t border-slate-200 text-slate-900 font-medium">
                <strong className="text-sky-800">Blindaje / Control:</strong> {item.shielding}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SELECTOR DE INSTRUMENTACIÓN Y EPP + 3 PILARES ICRP */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-600" />
              Selector de Instrumentación Radiológica y EPP por Escenario
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona la actividad de campo para verificar detectores calibrados y barreras obligatorias.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors ${
                  selectedScenarioId === sc.id
                    ? 'bg-[#0B1320] text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <div
            key={activeScenario.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs animate-fade-slide"
          >
            <div className="space-y-1.5">
              <div className="font-bold text-sky-800">Instrumento Principal</div>
              <p className="text-slate-700 leading-relaxed">{activeScenario.instrument}</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sky-800">Dosimetría / Umbral</div>
              <p className="text-slate-700 leading-relaxed">{activeScenario.dosimetry}</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sky-800">EPP y Reglas de Campo</div>
              <p className="text-slate-700 leading-relaxed">{activeScenario.epp}</p>
            </div>
          </div>
        </div>

        {/* 3 Pilares ICRP */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <div className="text-xs text-slate-500">Marco ICRP · Res. 18 1434</div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Los 3 Pilares de Protección
            </h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">01. Justificación</span>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Toda intervención que altere una exposición debe producir un beneficio neto positivo superior al detrimento radiológico.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">02. Optimización (ALARA)</span>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Mantener las dosis tan bajas como sea razonablemente alcanzable, integrando factores económicos y sociales.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">03. Limitación y Referencia</span>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Límite ocupacional: <strong className="font-mono text-slate-900">20 mSv/año</strong> (promedio 5 años). Referencia general/público:{' '}
                <strong className="font-mono text-slate-900">1 mSv/año</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPACITACIÓN POR PERFIL + HIGIENE / DESCONTAMINACIÓN HUMANA + GRUPOS DE INTERÉS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-700" />
              Ejes de Capacitación y Entrenamiento por Perfil
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Competencias recomendadas para operadores, equipos de monitoreo y responsables de vigilancia radiológica.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRAINING_PROFILES.map((tp) => (
              <button
                key={tp.id}
                type="button"
                onClick={() => setSelectedTrainingId(tp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTrainingId === tp.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tp.profile.split(' ').slice(0, 4).join(' ')}…
              </button>
            ))}
          </div>

          <div
            key={activeTraining.id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fade-slide"
          >
            <div>
              <div className="text-sm font-bold text-slate-900">{activeTraining.profile}</div>
              <div className="text-xs text-slate-500">{activeTraining.audience}</div>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {activeTraining.topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-700" />
              Higiene y Descontaminación Humana
            </h3>
            <HumanHygieneSchematic />
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>
                <strong className="text-slate-800">Restricción en zona:</strong> Prohibido comer, beber o fumar en áreas con posible presencia de NORM para evitar incorporación interna.
              </li>
              <li>
                <strong className="text-slate-800">Contaminación externa:</strong> Retirar la ropa contaminada y almacenarla en bolsas plásticas para disposición controlada.
              </li>
              <li>
                <strong className="text-slate-800">Lavado inmediato:</strong> Ducharse con agua tibia y jabón neutro para confinar y remover contaminación superficial antes de que ingrese al organismo.
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Transparencia con Grupos de Interés
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              En concordancia con la Resolución 0904 de 2020, la caracterización de radionucleidos de origen natural y los resultados de vigilancia radiológica en áreas cercanas a comunidades deben socializarse activamente mediante mecanismos claros de difusión e información.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
