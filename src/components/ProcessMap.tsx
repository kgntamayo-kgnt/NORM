import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { AlertCircle, CheckCircle2, Filter, Pause, Play, Sparkles } from 'lucide-react';
import {
  Anexo2Row,
  classifyDoseRate,
  DECAY_CHAIN_TH232,
  DECAY_CHAIN_U238,
  ENVIRONMENTAL_MATRICES,
  FACILITY_NODES,
  IOGP_BENCHMARK_DATA,
  RADIONUCLIDES_DB,
  ROCK_CONCENTRATIONS,
} from '../data/normData';
import { NormAppearanceVisuals } from './VisualSchematics';

interface ProcessMapProps {
  anexo2Rows: Anexo2Row[];
  avgBackground: number;
}

export const ProcessMap: React.FC<ProcessMapProps> = ({ anexo2Rows, avgBackground }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('wellhead');
  const [chainFilter, setChainFilter] = useState<'ALL' | 'U238' | 'Th232' | 'K40'>('ALL');
  const [activeDecaySeries, setActiveDecaySeries] = useState<'U238' | 'Th232'>('U238');
  const [decayStepIdx, setDecayStepIdx] = useState<number>(5); // Default on 226Ra
  const [isPlayingDecay, setIsPlayingDecay] = useState<boolean>(false);

  const activeChain = activeDecaySeries === 'U238' ? DECAY_CHAIN_U238 : DECAY_CHAIN_TH232;

  useEffect(() => {
    if (!isPlayingDecay) return;
    const timer = window.setInterval(() => {
      setDecayStepIdx((prev) => (prev + 1) % activeChain.length);
    }, 850);
    return () => window.clearInterval(timer);
  }, [isPlayingDecay, activeChain.length]);

  const selectedDecayNode = activeChain[Math.min(decayStepIdx, activeChain.length - 1)];

  const selectedNode = useMemo(
    () => FACILITY_NODES.find((n) => n.id === selectedNodeId) || FACILITY_NODES[0],
    [selectedNodeId]
  );

  const nodeRiskMap = useMemo(() => {
    const map: Record<string, { maxMeasured: number; color: string; status: string; count: number }> = {};
    FACILITY_NODES.forEach((n) => {
      const related = anexo2Rows.filter((r) => r.facilityNodeId === n.id);
      if (related.length === 0) {
        map[n.id] = { maxMeasured: 0, color: '#64748B', status: 'Sin registro', count: 0 };
      } else {
        const maxMeasured = Math.max(...related.map((r) => Number(r.measured)));
        const cls = classifyDoseRate(maxMeasured, avgBackground);
        map[n.id] = {
          maxMeasured,
          color: cls.colorHex,
          status: cls.shortLabel,
          count: related.length,
        };
      }
    });
    return map;
  }, [anexo2Rows, avgBackground]);

  const filteredRadionuclides = useMemo(() => {
    if (chainFilter === 'ALL') return RADIONUCLIDES_DB;
    return RADIONUCLIDES_DB.filter((r) => r.chainGroup === chainFilter);
  }, [chainFilter]);

  const nodePositions = [
    { id: 'wellhead', x: 95, y: 110, label: '1. Boca de Pozo', sub: 'Upstream' },
    { id: 'separators', x: 295, y: 110, label: '2. Separadores', sub: 'Tratamiento' },
    { id: 'tanks', x: 495, y: 110, label: '3. Tanques / Agua', sub: 'Almacenamiento' },
    { id: 'gaslines', x: 695, y: 110, label: '4. Líneas de Gas', sub: 'Midstream' },
    { id: 'pits', x: 895, y: 110, label: '5. Piscinas y Patio', sub: 'Clausura' },
  ];

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* DIAGRAMA ESQUEMÁTICO INTERACTIVO Y ANIMADO DE FACILIDAD OIL & GAS */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              Caracterización Geoquímica y Puntos Críticos de Acumulación NORM
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Esquema Animado de Procesos en Facilidades de Hidrocarburos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona cualquier unidad industrial para explorar mecanismos de concentración, radionucleidos críticos y directrices operativas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-600 inline-block" /> Investigación
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" /> Intervención
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" /> Actuación
            </span>
          </div>
        </div>

        {/* SVG Industrial Process Schematic with animated pipelines */}
        <div className="w-full overflow-x-auto bg-[#0B1320] rounded-xl border border-slate-800 p-4">
          <svg
            viewBox="0 0 990 235"
            className="w-full min-w-[760px] h-auto"
            role="img"
            aria-label="Diagrama esquemático animado de acumulación NORM en facilidades Oil and Gas"
          >
            <defs>
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="990" height="235" fill="url(#gridPattern)" rx="8" />

            <text x="24" y="24" fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans">
              UPSTREAM · EXTRACCIÓN Y SEPARACIÓN
            </text>
            <text x="415" y="24" fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans">
              MIDSTREAM · FLUIDOS Y GAS
            </text>
            <text x="805" y="24" fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans">
              PERFORACIÓN / CLAUSURA
            </text>

            {/* Animated Connecting Pipelines */}
            <line
              x1="150"
              y1="110"
              x2="240"
              y2="110"
              stroke="#38BDF8"
              strokeWidth="3.2"
              strokeDasharray="10 6"
              className="animate-flow-dash"
            />
            <polygon points="236,104 246,110 236,116" fill="#38BDF8" />

            <line
              x1="350"
              y1="110"
              x2="440"
              y2="110"
              stroke="#38BDF8"
              strokeWidth="3.2"
              strokeDasharray="10 6"
              className="animate-flow-dash"
            />
            <polygon points="436,104 446,110 436,116" fill="#38BDF8" />

            <line
              x1="550"
              y1="110"
              x2="640"
              y2="110"
              stroke="#F59E0B"
              strokeWidth="3.2"
              strokeDasharray="10 6"
              className="animate-flow-dash"
            />
            <polygon points="636,104 646,110 636,116" fill="#F59E0B" />

            <line
              x1="750"
              y1="110"
              x2="840"
              y2="110"
              stroke="#94A3B8"
              strokeWidth="2.8"
              strokeDasharray="8 6"
              className="animate-flow-dash-slow"
            />
            <polygon points="836,104 846,110 836,116" fill="#94A3B8" />

            {/* Interactive Equipment Nodes */}
            {nodePositions.map((pos) => {
              const isSelected = selectedNodeId === pos.id;
              const risk = nodeRiskMap[pos.id];
              const nodeData = FACILITY_NODES.find((n) => n.id === pos.id)!;

              return (
                <g
                  key={pos.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNodeId(pos.id)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNodeId(pos.id);
                    }
                  }}
                >
                  {/* Animated selection highlight aura */}
                  {isSelected && (
                    <rect
                      x="-82"
                      y="-64"
                      width="164"
                      height="140"
                      rx="16"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      className="animate-node-aura"
                    />
                  )}

                  <rect
                    x="-76"
                    y="-58"
                    width="152"
                    height="128"
                    rx="12"
                    fill={isSelected ? '#1E293B' : '#0F172A'}
                    stroke={isSelected ? '#F59E0B' : risk.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  <rect x="-76" y="-58" width="152" height="5" rx="2" fill={risk.color} />

                  {pos.id === 'wellhead' && (
                    <g stroke={isSelected ? '#FBBF24' : '#CBD5E1'} strokeWidth="2" fill="none">
                      <line x1="0" y1="-34" x2="0" y2="10" />
                      <line x1="-22" y1="-20" x2="22" y2="-20" />
                      <line x1="-16" y1="-8" x2="16" y2="-8" />
                      <rect x="-12" y="10" width="24" height="8" rx="1" fill="#334155" />
                      <circle cx="0" cy="-36" r="4" fill="#F59E0B" stroke="none" />
                    </g>
                  )}
                  {pos.id === 'separators' && (
                    <g stroke={isSelected ? '#FBBF24' : '#CBD5E1'} strokeWidth="2" fill="none">
                      <rect x="-34" y="-22" width="68" height="28" rx="14" fill="#1E293B" />
                      <line x1="-12" y1="-22" x2="-12" y2="6" strokeDasharray="3 2" />
                      <line x1="12" y1="-22" x2="12" y2="6" strokeDasharray="3 2" />
                      <line x1="-22" y1="6" x2="-22" y2="16" />
                      <line x1="22" y1="6" x2="22" y2="16" />
                    </g>
                  )}
                  {pos.id === 'tanks' && (
                    <g stroke={isSelected ? '#FBBF24' : '#CBD5E1'} strokeWidth="2" fill="none">
                      <path d="M -28 -22 L 0 -32 L 28 -22 L 28 16 L -28 16 Z" fill="#1E293B" />
                      <line x1="-28" y1="-4" x2="28" y2="-4" stroke="#38BDF8" strokeWidth="1.5" />
                      <line x1="-28" y1="6" x2="28" y2="6" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.5" />
                    </g>
                  )}
                  {pos.id === 'gaslines' && (
                    <g stroke={isSelected ? '#FBBF24' : '#CBD5E1'} strokeWidth="2" fill="none">
                      <path d="M -34 -16 L -12 -16 L -12 8 L 12 8 L 12 -16 L 34 -16" />
                      <circle cx="0" cy="-4" r="10" fill="#1E293B" />
                      <line x1="-6" y1="-4" x2="6" y2="-4" />
                    </g>
                  )}
                  {pos.id === 'pits' && (
                    <g stroke={isSelected ? '#FBBF24' : '#CBD5E1'} strokeWidth="2" fill="none">
                      <polygon points="-32,-8 32,-8 22,14 -22,14" fill="#1E293B" />
                      <line x1="-24" y1="-18" x2="24" y2="-18" strokeWidth="3" />
                      <line x1="-20" y1="-26" x2="20" y2="-26" strokeWidth="3" />
                    </g>
                  )}

                  <text
                    x="0"
                    y="38"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans"
                  >
                    {pos.label}
                  </text>
                  <text
                    x="0"
                    y="54"
                    textAnchor="middle"
                    fill={risk.color}
                    fontSize="10.5"
                    fontWeight="600"
                    fontFamily="JetBrains Mono"
                  >
                    {risk.count > 0 ? `${risk.maxMeasured.toFixed(2)} µSv/h · ${risk.status}` : nodeData.emitters.join(' / ')}
                  </text>

                  <text
                    x="0"
                    y="90"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono"
                  >
                    Emisores: {nodeData.emitters.join(', ')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* DETALLE DEL NODO SELECCIONADO */}
        <div
          key={selectedNode.id}
          className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fade-slide"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs font-medium text-sky-700">{selectedNode.stage}</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {selectedNode.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">Radionucleidos críticos:</span>
              <span className="font-bold text-slate-900">
                {selectedNode.radionuclides.join(' · ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">Forma Física y Matriz</div>
              <p className="text-slate-700 font-medium">{selectedNode.form}</p>
              <p className="text-slate-500">Matriz: {selectedNode.matrix}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">Actividad Típica (IOGP 412)</div>
              <p className="font-mono font-semibold text-amber-800">{selectedNode.activityRange}</p>
              <p className="text-slate-600">Vía crítica: {selectedNode.exposurePath}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">Monitoreo y Control</div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Medición:</strong> {selectedNode.monitoring}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Control:</strong> {selectedNode.controls}
              </p>
            </div>
          </div>

          <div className="bg-[#0B1320] text-slate-100 rounded-lg p-4 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-400">Nota para Tomadores de Decisión: </span>
              <span>{selectedNode.executiveNote}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CADENAS RADIACTIVAS ANIMADAS INTERACTIVAS (238U y 232Th) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Cadenas de Desintegración Radiactiva Natural en Hidrocarburos
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Cascada Interactiva de Decaimiento ({activeDecaySeries === 'U238' ? 'Serie ²³⁸U' : 'Serie ²³²Th'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier isótopo o reproduce la animación para observar las emisiones Alfa (α) y Beta (β) hasta alcanzar el plomo estable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setActiveDecaySeries('U238');
                  setDecayStepIdx(0);
                  setIsPlayingDecay(false);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeDecaySeries === 'U238'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Serie ²³⁸U (15 etapas)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDecaySeries('Th232');
                  setDecayStepIdx(0);
                  setIsPlayingDecay(false);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeDecaySeries === 'Th232'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Serie ²³²Th (11 etapas)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPlayingDecay((p) => !p)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                isPlayingDecay
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-sky-700 text-white hover:bg-sky-800'
              }`}
            >
              {isPlayingDecay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlayingDecay ? 'Pausar cadena' : 'Animar cadena'}
            </button>
          </div>
        </div>

        {/* Horizontal Interactive Decay Sequence */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1">
          {activeChain.map((iso, idx) => {
            const isSelected = idx === decayStepIdx;
            const isPast = idx < decayStepIdx;
            return (
              <React.Fragment key={iso.symbol}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingDecay(false);
                    setDecayStepIdx(idx);
                  }}
                  className={`shrink-0 px-3 py-2.5 rounded-xl border text-center transition-all duration-200 min-w-[82px] ${
                    isSelected
                      ? 'bg-[#0B1320] text-white border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : iso.stable
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : isPast
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="font-mono text-sm font-bold">{iso.symbol}</div>
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    {iso.halfLife}
                  </div>
                </button>
                {iso.nextDecay && (
                  <div className="flex flex-col items-center shrink-0 px-0.5">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        iso.nextDecay === 'α' ? 'text-amber-600' : 'text-sky-600'
                      }`}
                    >
                      {iso.nextDecay}
                    </span>
                    <span className="text-slate-400 text-xs leading-none">→</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Isotope Detail Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-slate-900">{selectedDecayNode.symbol}</span>{' '}
              <span className="font-semibold text-slate-800">({selectedDecayNode.name})</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="font-mono text-slate-600">T½: {selectedDecayNode.halfLife}</span>
              {selectedDecayNode.highlight && (
                <p className="text-slate-600 mt-1">{selectedDecayNode.highlight}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 shrink-0">
            <span className="text-amber-700 font-semibold">α = Emisión Alfa</span>
            <span>·</span>
            <span className="text-sky-700 font-semibold">β = Emisión Beta</span>
          </div>
        </div>
      </section>

      {/* FORMAS DE APARICIÓN ANIMADAS (AGUA, INCRUSTACIONES, LODOS, PELÍCULAS) */}
      <NormAppearanceVisuals />

      {/* BENCHMARK ACTIVIDAD IOGP 412 + MATRICES AMBIENTALES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Actividad Específica Típica (IOGP 412) vs. Exención OIEA (1 Bq/g)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Escala logarítmica (log₁₀ Bq/g). Los valores sobre 1 Bq/g requieren control regulatorio y gestión NORM.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={IOGP_BENCHMARK_DATA}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 10, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[-1.5, 4.6]}
                  ticks={[-1, 0, 1, 2, 3, 4]}
                  tickFormatter={(v) => {
                    if (v === -1) return '0.1';
                    if (v === 0) return '1 Bq/g';
                    if (v === 1) return '10';
                    if (v === 2) return '100';
                    if (v === 3) return '1,000';
                    if (v === 4) return '10,000';
                    return String(v);
                  }}
                  tick={{ fontSize: 11, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={175}
                  tick={{ fontSize: 11.5, fill: '#0F172A', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#0B1320] text-white px-3 py-2 rounded-lg text-xs border border-slate-700">
                        <div className="font-semibold text-amber-400">{item.name}</div>
                        <div className="font-mono mt-0.5">{item.refLabel}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  x={0}
                  stroke="#DC2626"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Exención 1 Bq/g',
                    position: 'top',
                    fill: '#DC2626',
                    fontSize: 10.5,
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="logVal" radius={[0, 6, 6, 0]} maxBarSize={22} animationDuration={600}>
                  {IOGP_BENCHMARK_DATA.map((entry, idx) => (
                    <Cell key={idx} fill={entry.critical ? '#D97706' : '#059669'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrices Ambientales de Caracterización */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Matrices Ambientales de Muestreo
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Radionucleidos prioritarios y unidades de reporte requeridas en estudios ambientales y vigilancia.
            </p>
          </div>
          <div className="space-y-3">
            {ENVIRONMENTAL_MATRICES.map((m) => (
              <div
                key={m.matrix}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">Matriz {m.matrix}</span>
                  <span className="font-mono font-semibold text-sky-800">Unidad: {m.unit}</span>
                </div>
                <div className="text-slate-500">Aplica para: {m.appliesTo.join(' · ')}</div>
                <div className="font-mono font-semibold text-slate-800">
                  {m.radionuclides.join(', ')}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONCENTRACIONES CARACTERÍSTICAS POR TIPO DE ROCA (OGP 2016) */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900">
            Concentraciones Geoquímicas de Uranio, Torio y Potasio por Tipo de Roca (OGP)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Referencia geológica de formaciones con potencial hidrocarburífero. Las lodolitas y lutitas (shale) concentran los mayores contenidos naturales.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">Tipo de Roca</th>
                <th className="py-3 px-4 font-semibold">⁴⁰K (% Prom. / Rango)</th>
                <th className="py-3 px-4 font-semibold text-right">⁴⁰K (Bq/g)</th>
                <th className="py-3 px-4 font-semibold">²³²Th (ppm Prom. / Rango)</th>
                <th className="py-3 px-4 font-semibold text-right">²³²Th (Bq/g)</th>
                <th className="py-3 px-4 font-semibold">²³⁸U (ppm Prom. / Rango)</th>
                <th className="py-3 px-4 font-semibold text-right">²³⁸U (Bq/g)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ROCK_CONCENTRATIONS.map((row) => {
                const isShale = row.rockType.includes('Lutitas');
                return (
                  <tr
                    key={row.rockType}
                    className={isShale ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50/70'}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.rockType}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.k40Percent}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 font-semibold">
                      {row.k40BqG.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.th232Ppm}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 font-semibold">
                      {row.th232BqG.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{row.u238Ppm}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-right text-slate-900 font-semibold">
                      {row.u238BqG.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* TABLA FILTRABLE DE RADIONUCLEIDOS */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Radionucleidos Representativos en la Producción de Hidrocarburos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Semidesintegración, tipo de emisión, producto principal y comportamiento en facilidades (IOGP 412 / OIEA GSR Part 3).
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'U238', label: 'Serie ²³⁸U' },
              { id: 'Th232', label: 'Serie ²³²Th' },
              { id: 'K40', label: '⁴⁰K' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setChainFilter(f.id as 'ALL' | 'U238' | 'Th232' | 'K40')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  chainFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">Isótopo</th>
                <th className="py-3 px-4 font-semibold">Cadena / Producto</th>
                <th className="py-3 px-4 font-semibold">Semidesintegración</th>
                <th className="py-3 px-4 font-semibold">Emisión</th>
                <th className="py-3 px-4 font-semibold">Criterio Exención</th>
                <th className="py-3 px-4 font-semibold">Comportamiento en Oil & Gas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRadionuclides.map((rad) => (
                <tr key={rad.symbol} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-900">{rad.symbol}</span>
                    <span className="block text-slate-500">{rad.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{rad.chain}</div>
                    <div className="text-[11px] text-slate-500">{rad.productNote}</div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    {rad.halfLife}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {rad.decay}
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {rad.exemption}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md">{rad.appearance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
