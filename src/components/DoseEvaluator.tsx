import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, PlusCircle, RotateCcw } from 'lucide-react';
import { classifyDoseRate } from '../data/normData';
import { FieldMeasurementSchematic } from './VisualSchematics';

interface DoseEvaluatorProps {
  backgroundReadings: number[];
  setBackgroundReadings: React.Dispatch<React.SetStateAction<number[]>>;
  avgBackground: number;
  pointReading: number;
  setPointReading: (v: number) => void;
  exposureHours: number;
  setExposureHours: (v: number) => void;
  radonLevel: number;
  setRadonLevel: (v: number) => void;
  onAddPointToAnexo2: (desc: string, measured: number, obs: string) => void;
}

const QUICK_FIELD_PRESETS = [
  { label: 'Fondo Basal (0.14 µSv/h)', reading: 0.14, hours: 200, radon: 120 },
  { label: 'Inicio Escama (0.65 µSv/h)', reading: 0.65, hours: 200, radon: 240 },
  { label: 'Tubería NORM (3.40 µSv/h)', reading: 3.4, hours: 150, radon: 480 },
  { label: 'Separador Crítico (12.2 µSv/h)', reading: 12.2, hours: 80, radon: 1250 },
];

const MONITORING_PROTOCOL_STEPS = [
  {
    step: '01',
    title: 'Seleccionar intensímetro calibrado',
    desc: 'Verificar vigencia de calibración, serial y certificación intrínsecamente segura.',
  },
  {
    step: '02',
    title: 'Determinar fondo natural local',
    desc: 'Ubicarse en zona libre de lodos, tuberías o equipos y promediar mínimo 4 lecturas.',
  },
  {
    step: '03',
    title: 'Medir punto de interés a 30 cm',
    desc: 'Situar el detector a 30 cm de paredes, válvulas, tuberías o equipos de proceso.',
  },
  {
    step: '04',
    title: 'Calcular tasa neta y actuar',
    desc: 'Restar el fondo natural promedio y clasificar frente a niveles de referencia.',
  },
];

export const DoseEvaluator: React.FC<DoseEvaluatorProps> = ({
  backgroundReadings,
  setBackgroundReadings,
  avgBackground,
  pointReading,
  setPointReading,
  exposureHours,
  setExposureHours,
  radonLevel,
  setRadonLevel,
  onAddPointToAnexo2,
}) => {
  const [pointName, setPointName] = useState('Punto Evaluado en Campo');

  const netDoseRate = useMemo(
    () => Math.max(0, Number(pointReading) - avgBackground),
    [pointReading, avgBackground]
  );

  const ratioToBackground = useMemo(
    () => (avgBackground <= 0 ? 0 : Number(pointReading) / avgBackground),
    [pointReading, avgBackground]
  );

  const projectedAnnualDoseMsv = useMemo(
    () => (netDoseRate * Number(exposureHours)) / 1000,
    [netDoseRate, exposureHours]
  );

  const classification = useMemo(
    () => classifyDoseRate(Number(pointReading), avgBackground),
    [pointReading, avgBackground]
  );

  // Semi-circular radial gauge angle (-90deg to +90deg)
  const gaugeAngle = useMemo(() => {
    const invNet = Math.max(0.05, avgBackground * 2);
    let progress = 0;
    if (netDoseRate <= invNet) {
      progress = (netDoseRate / invNet) * 0.25;
    } else if (netDoseRate <= 2.5) {
      progress = 0.25 + ((netDoseRate - invNet) / Math.max(0.1, 2.5 - invNet)) * 0.25;
    } else if (netDoseRate <= 10) {
      progress = 0.5 + ((netDoseRate - 2.5) / 7.5) * 0.25;
    } else {
      progress = 0.75 + Math.min(1, (netDoseRate - 10) / 10) * 0.25;
    }
    return -90 + progress * 180;
  }, [netDoseRate, avgBackground]);

  const projectionSeries = useMemo(() => {
    const maxHours = Math.max(1000, Math.ceil(exposureHours / 200) * 200 + 200);
    const steps = 10;
    const data = [];
    for (let i = 0; i <= steps; i++) {
      const h = Math.round((maxHours / steps) * i);
      const msv = Number(((netDoseRate * h) / 1000).toFixed(3));
      data.push({ hours: h, msv });
    }
    return data;
  }, [netDoseRate, exposureHours]);

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* BARRA DE ESCENARIOS RÁPIDOS DE LECTURA */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Vigilancia Radiológica en Campo:</span>{' '}
          Calcula el fondo natural promedio (mínimo 4 lecturas) y clasifica la tasa neta bajo enfoque graduado.
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {QUICK_FIELD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setPointReading(preset.reading);
                setExposureHours(preset.hours);
                setRadonLevel(preset.radon);
              }}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECUENCIA OPERATIVA DE MEDICIÓN EN CAMPO (4 PASOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {MONITORING_PROTOCOL_STEPS.map((s) => (
          <div
            key={s.step}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
              {s.step}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">{s.title}</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ESQUEMA ANIMADO DE MEDICIÓN EN CAMPO (FONDO vs 30 CM) */}
      <FieldMeasurementSchematic
        avgBackground={avgBackground}
        pointReading={pointReading}
        netDoseRate={netDoseRate}
        tierColor={classification.colorHex}
        tierLabel={classification.shortLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: CONTROLES DE ENTRADA */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Parámetros de Medición en Campo
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa las lecturas del intensímetro intrínsecamente seguro (a 30 cm del equipo) y los parámetros ocupacionales.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBackgroundReadings([0.11, 0.12, 0.1, 0.11]);
                setPointReading(0.45);
                setExposureHours(200);
                setRadonLevel(180);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 shrink-0"
              title="Restablecer valores"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          </div>

          {/* 1. Fondo Natural */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800">
                1. Lecturas de Fondo Natural (µSv/h)
              </label>
              <span className="text-xs font-mono tabular-nums font-bold text-slate-900">
                Promedio: {avgBackground.toFixed(3)} µSv/h
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {backgroundReadings.map((val, idx) => (
                <div key={idx}>
                  <span className="block text-[11px] text-slate-500 mb-1">Med. {idx + 1}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={val}
                    onChange={(e) => {
                      const next = [...backgroundReadings];
                      next[idx] = Math.max(0, parseFloat(e.target.value) || 0);
                      setBackgroundReadings(next);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Zona libre de equipos, lodos o tuberías almacenadas. Rango típico: 0.05 – 0.20 µSv/h.
            </p>
          </div>

          {/* 2. Lectura en Punto de Interés */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>2. Lectura en Punto de Interés (30 cm)</span>
              <span className="font-mono tabular-nums text-sky-700 text-sm">
                {Number(pointReading).toFixed(2)} µSv/h
              </span>
            </div>

            <input
              type="range"
              min="0.05"
              max="20"
              step="0.05"
              value={Math.min(20, pointReading)}
              onChange={(e) => setPointReading(parseFloat(e.target.value))}
              className="w-full accent-sky-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>0.05</span>
              <span>2.5</span>
              <span>10.0</span>
              <span>20.0 µSv/h</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                step="0.05"
                min="0"
                value={pointReading}
                onChange={(e) => setPointReading(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-32 px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
              />
              <span className="text-xs text-slate-500">
                Valor exacto en µSv/h (admite lecturas &gt; 20 µSv/h)
              </span>
            </div>
          </div>

          {/* 3. Permanencia y Radón */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                3. Permanencia anual (h/año)
              </label>
              <input
                type="number"
                min="0"
                max="8760"
                step="10"
                value={exposureHours}
                onChange={(e) => setExposureHours(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Jornada estándar máx.: 2,000 h/a
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                4. ²²²Radón en aire (Bq/m³)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={radonLevel}
                onChange={(e) => setRadonLevel(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
              />
              <span className="block text-[11px] text-slate-500 mt-1">
                Límite Res. 18 1434: 1,000 Bq/m³
              </span>
            </div>
          </div>

          {/* Acción: Guardar directamente al Anexo 2 */}
          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <label className="block text-xs font-semibold text-slate-800">
              Enviar esta evaluación al Anexo 2 y Panorama General
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="Ej. Válvula Choke Pozo P-22"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
              />
              <button
                type="button"
                onClick={() => {
                  onAddPointToAnexo2(
                    pointName.trim() || 'Punto Evaluado en Campo',
                    Number(pointReading),
                    `Registrado desde Evaluador (${classification.shortLabel})`
                  );
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Registrar en Anexo 2
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: GAUGE + PIRÁMIDE + GRÁFICO PROYECCIÓN + ACCIONES */}
        <div className="lg:col-span-7 space-y-6">
          {/* Fila superior: Instrumento Radial SVG + 4 Métricas Clave */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 flex flex-col items-center">
              <svg
                viewBox="0 0 260 155"
                className="w-full max-w-[280px] overflow-visible"
                role="img"
                aria-label={`Medidor de tasa de dosis neta: ${netDoseRate.toFixed(2)} microsieverts por hora`}
              >
                <path
                  d="M 25 130 A 105 105 0 0 1 55.75 55.75"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />
                <path
                  d="M 57.5 54 A 105 105 0 0 1 128.5 25"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />
                <path
                  d="M 131.5 25 A 105 105 0 0 1 202.5 54"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />
                <path
                  d="M 204.25 55.75 A 105 105 0 0 1 235 130"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="18"
                  strokeLinecap="butt"
                />

                <text x="20" y="148" fontSize="10" fill="#64748B" fontFamily="JetBrains Mono">
                  0
                </text>
                <text x="50" y="42" fontSize="10" fill="#0369A1" fontFamily="JetBrains Mono">
                  3×F
                </text>
                <text x="120" y="14" fontSize="10" fill="#B45309" fontFamily="JetBrains Mono">
                  2.5
                </text>
                <text x="195" y="42" fontSize="10" fill="#B91C1C" fontFamily="JetBrains Mono">
                  10
                </text>
                <text x="225" y="148" fontSize="10" fill="#64748B" fontFamily="JetBrains Mono">
                  20+
                </text>

                {/* Aguja animada */}
                <g
                  transform={`translate(130, 130) rotate(${gaugeAngle})`}
                  style={{ transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <polygon points="-4,0 0,-86 4,0" fill="#0F172A" />
                  <circle cx="0" cy="0" r="8" fill="#0F172A" />
                  <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
                </g>
              </svg>

              <div className="text-center -mt-2">
                <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  {netDoseRate.toFixed(2)}{' '}
                  <span className="text-sm font-normal text-slate-500">µSv/h netos</span>
                </div>
                <div
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: classification.colorHex }}
                >
                  {classification.level}
                </div>
              </div>
            </div>

            <div className="md:col-span-6 grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Relación vs. Fondo</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  {ratioToBackground.toFixed(1)}×
                </span>
                <span className="text-[11px] text-slate-500">Umbral: &gt; 3.0×</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Dosis Proyectada</span>
                <span
                  className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
                    projectedAnnualDoseMsv > 20
                      ? 'text-red-600'
                      : projectedAnnualDoseMsv > 1
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}
                >
                  {projectedAnnualDoseMsv.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">mSv/a</span>
                </span>
                <span className="text-[11px] text-slate-500">Ref. público: 1 mSv/a</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Estado ²²²Radón</span>
                <span
                  className={`text-lg font-bold font-mono mt-1 block ${
                    radonLevel > 1000 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {radonLevel > 1000 ? 'EXCEDE' : 'CUMPLE'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {radonLevel} / 1,000 Bq/m³
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Prioridad Operativa</span>
                <span
                  className="text-sm font-bold mt-1.5 block"
                  style={{ color: classification.colorHex }}
                >
                  {classification.urgency}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {classification.owner}
                </span>
              </div>
            </div>
          </div>

          {/* Pirámide de Niveles + Curva de Proyección Anual */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-700" />
                Esquema de Niveles de Referencia Operativos
              </h3>
              <div className="flex flex-col items-center space-y-1.5 py-2">
                <div
                  className={`w-6/12 py-2.5 px-3 rounded-t-xl text-center border transition-all duration-200 ${
                    classification.tier === 'actuacion'
                      ? 'bg-red-600 text-white border-red-700 font-bold shadow-md scale-[1.03]'
                      : 'bg-red-50/70 text-red-900 border-red-200 opacity-75'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">&gt; 10 µSv/h</div>
                  <div className="text-[11px]">Nivel de Actuación</div>
                </div>
                <div
                  className={`w-8/12 py-2.5 px-3 rounded-lg text-center border transition-all duration-200 ${
                    classification.tier === 'intervencion'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-md scale-[1.03]'
                      : 'bg-amber-50/80 text-amber-900 border-amber-200 opacity-80'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">&gt; 2.5 µSv/h</div>
                  <div className="text-[11px]">Intervención Operacional</div>
                </div>
                <div
                  className={`w-10/12 py-2.5 px-3 rounded-lg text-center border transition-all duration-200 ${
                    classification.tier === 'investigacion'
                      ? 'bg-sky-600 text-white border-sky-700 font-bold shadow-md scale-[1.03]'
                      : 'bg-sky-50/80 text-sky-900 border-sky-200 opacity-85'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">
                    &gt; 3× Fondo ({(avgBackground * 3).toFixed(2)} µSv/h)
                  </div>
                  <div className="text-[11px]">Nivel de Investigación</div>
                </div>
                <div
                  className={`w-full py-2.5 px-3 rounded-b-xl text-center border transition-all duration-200 ${
                    classification.tier === 'normal'
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-md scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">
                    Fondo Natural ≈ {avgBackground.toFixed(2)} µSv/h
                  </div>
                  <div className="text-[11px]">Operación Normal</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Sensibilidad de Dosis Anual vs. Permanencia
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Proyección en mSv/año según horas expuestas a {netDoseRate.toFixed(2)} µSv/h netos.
                </p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionSeries} margin={{ top: 10, right: 14, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      type="number"
                      dataKey="hours"
                      domain={['dataMin', 'dataMax']}
                      tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
                      tickFormatter={(v) => `${v}h`}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, (max: number) => Math.max(1.5, Number((max * 1.15).toFixed(1)))]}
                    />
                    <Tooltip
                      formatter={(val: number) => [`${val.toFixed(3)} mSv/año`, 'Dosis Efectiva']}
                      labelFormatter={(h) => `Permanencia: ${h} h/año`}
                      contentStyle={{
                        backgroundColor: '#0B1320',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine
                      y={1}
                      stroke="#D97706"
                      strokeDasharray="4 4"
                      label={{ value: '1 mSv/a', position: 'insideTopRight', fill: '#B45309', fontSize: 10 }}
                    />
                    {projectedAnnualDoseMsv > 8 && (
                      <ReferenceLine
                        y={20}
                        stroke="#DC2626"
                        strokeDasharray="4 4"
                        label={{ value: '20 mSv/a', position: 'insideTopRight', fill: '#DC2626', fontSize: 10 }}
                      />
                    )}
                    <ReferenceLine
                      x={exposureHours}
                      stroke="#0F172A"
                      strokeDasharray="3 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="msv"
                      stroke={classification.colorHex}
                      strokeWidth={2}
                      fill={classification.colorHex}
                      fillOpacity={0.15}
                      animationDuration={450}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Protocolo de Acción Recomendado */}
          <div className={`p-5 rounded-xl border transition-colors duration-200 ${classification.bgSurface} ${classification.borderClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className={`text-sm font-bold ${classification.textClass}`}>
                Plan de Acción Recomendado · {classification.level}
              </h3>
              {radonLevel > 1000 && (
                <span className="text-xs font-semibold text-red-700">
                  Alerta Radón &gt; 1,000 Bq/m³
                </span>
              )}
            </div>
            <p className={`text-sm font-medium mb-3 ${classification.textClass}`}>
              {classification.summary}
            </p>
            <ul className="space-y-2 text-xs text-slate-800">
              {classification.actions.map((act, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 opacity-75" />
                  <span>{act}</span>
                </li>
              ))}
              {radonLevel > 1000 && (
                <li className="flex items-start gap-2 font-semibold text-red-900 pt-1">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>
                    Acción Radón: Implementar extracción/ventilación mecánica inmediata en espacios cerrados y controlar tiempo de permanencia (Res. 18 1434 / OIEA SSG-32).
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
