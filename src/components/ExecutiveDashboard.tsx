import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Printer,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  Anexo2Row,
  Anexo3Row,
  classifyDoseRate,
  EXECUTIVE_SCENARIOS,
  RiskTier,
  ScenarioPreset,
} from '../data/normData';
import bannerImg from '../assets/images/oil_gas_facility_banner_1795569270407.jpg';

interface ExecutiveDashboardProps {
  avgBackground: number;
  radonLevel: number;
  anexo2Rows: Anexo2Row[];
  anexo3Rows: Anexo3Row[];
  activeScenarioId: string;
  onApplyScenario: (scenario: ScenarioPreset) => void;
  onNavigate: (tab: string) => void;
  onInspectPoint: (measured: number) => void;
}

const TIER_META: Record<RiskTier, { label: string; color: string; order: number }> = {
  actuacion: { label: 'Actuación (>10 µSv/h)', color: '#DC2626', order: 0 },
  intervencion: { label: 'Intervención (>2.5 µSv/h)', color: '#D97706', order: 1 },
  investigacion: { label: 'Investigación (>3× Fondo)', color: '#0284C7', order: 2 },
  normal: { label: 'Normal (Fondo)', color: '#059669', order: 3 },
};

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  avgBackground,
  radonLevel,
  anexo2Rows,
  anexo3Rows,
  activeScenarioId,
  onApplyScenario,
  onNavigate,
  onInspectPoint,
}) => {
  const [imgError, setImgError] = useState(false);

  const enrichedPoints = useMemo(() => {
    return anexo2Rows.map((row) => {
      const net = Math.max(0, Number(row.measured) - avgBackground);
      const cls = classifyDoseRate(Number(row.measured), avgBackground);
      return {
        ...row,
        net: Number(net.toFixed(3)),
        classification: cls,
      };
    });
  }, [anexo2Rows, avgBackground]);

  const summary = useMemo(() => {
    const counts: Record<RiskTier, number> = {
      actuacion: 0,
      intervencion: 0,
      investigacion: 0,
      normal: 0,
    };
    let maxNet = 0;
    let maxPointCode = '—';

    enrichedPoints.forEach((p) => {
      counts[p.classification.tier] += 1;
      if (p.net >= maxNet) {
        maxNet = p.net;
        maxPointCode = p.code;
      }
    });

    const highestTier: RiskTier =
      counts.actuacion > 0
        ? 'actuacion'
        : counts.intervencion > 0
        ? 'intervencion'
        : counts.investigacion > 0
        ? 'investigacion'
        : 'normal';

    const totalWorkerDoseUsv = anexo3Rows.reduce((acc, r) => acc + Number(r.dose || 0), 0);
    const maxWorkerDoseUsv = anexo3Rows.reduce((acc, r) => Math.max(acc, Number(r.dose || 0)), 0);
    const maxWorkerAnnualMsv = (maxWorkerDoseUsv * 12) / 1000;

    const flaggedPoints = enrichedPoints
      .filter((p) => p.classification.tier !== 'normal')
      .sort((a, b) => b.net - a.net);

    return {
      counts,
      maxNet,
      maxPointCode,
      highestTier,
      totalWorkerDoseUsv,
      maxWorkerDoseUsv,
      maxWorkerAnnualMsv,
      flaggedPoints,
      totalPoints: enrichedPoints.length,
    };
  }, [enrichedPoints, anexo3Rows]);

  const pieData = useMemo(() => {
    return (['actuacion', 'intervencion', 'investigacion', 'normal'] as RiskTier[])
      .map((tier) => ({
        name: TIER_META[tier].label,
        value: summary.counts[tier],
        color: TIER_META[tier].color,
      }))
      .filter((item) => item.value > 0);
  }, [summary.counts]);

  const barData = useMemo(() => {
    return enrichedPoints.map((p) => ({
      code: p.code,
      desc: p.desc,
      measured: Number(p.measured),
      net: p.net,
      color: p.classification.colorHex,
      tierLabel: p.classification.shortLabel,
    }));
  }, [enrichedPoints]);

  const globalVerdict = useMemo(() => {
    if (summary.highestTier === 'actuacion' || radonLevel > 1000) {
      return {
        status: 'Intervención Inmediata Requerida',
        tone: 'text-red-300',
        borderTone: 'border-red-500/40 bg-red-950/50',
        message:
          radonLevel > 1000 && summary.highestTier !== 'actuacion'
            ? 'Alerta crítica por concentración de Radón-222 superior a 1,000 Bq/m³. Activar ventilación mecánica y restringir espacios confinados.'
            : 'Existen puntos activos sobre el Nivel de Actuación (> 10 µSv/h netos). Se requiere restricción inmediata de zona, dosimetría directa y plan de descontaminación.',
      };
    }
    if (summary.highestTier === 'intervencion') {
      return {
        status: 'Atención Operacional Prioritaria',
        tone: 'text-amber-300',
        borderTone: 'border-amber-500/40 bg-amber-950/45',
        message:
          'Se detectan puntos sobre el Nivel de Intervención (> 2.5 µSv/h netos). Demarcar preventivamente, aplicar ALARA y solicitar espectrometría en laboratorio (1 Bq/g).',
      };
    }
    if (summary.highestTier === 'investigacion') {
      return {
        status: 'Vigilancia Reforzada Activa',
        tone: 'text-sky-300',
        borderTone: 'border-sky-500/40 bg-sky-950/45',
        message:
          'Uno o más equipos superan 3× el fondo natural. Recomendar investigación técnica del RVR para prevenir acumulación de incrustaciones antes del próximo mantenimiento.',
      };
    }
    return {
      status: 'Operación Nominal Bajo Control',
      tone: 'text-emerald-300',
      borderTone: 'border-emerald-500/40 bg-emerald-950/45',
      message:
        'Todos los puntos evaluados y el nivel de Radón-222 cumplen los umbrales de referencia MME y OIEA. Mantener el programa de monitoreo rutinario.',
    };
  }, [summary.highestTier, radonLevel]);

  const investigationThresholdNet = Number((avgBackground * 2).toFixed(2));

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* HERO EJECUTIVO CON VISUAL DE FACILIDAD OIL & GAS */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0B1320] text-white border border-slate-800">
        {!imgError ? (
          <img
            src={bannerImg}
            alt="Instalación industrial de procesamiento Oil and Gas al anochecer"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1320] via-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1320] via-[#0B1320]/90 to-[#0B1320]/35" />

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>Tablero Gerencial de Riesgo Radiológico</span>
              <span aria-hidden="true">·</span>
              <span>MME Res. 18 1434 / 18 0005</span>
              <span aria-hidden="true">·</span>
              <span>OIEA SSG-60 / IOGP 412</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Estado Radiológico de la Facilidad y Prioridades de Decisión
            </h2>

            <div className={`p-4 rounded-xl border ${globalVerdict.borderTone} backdrop-blur-xs transition-all duration-200`}>
              <div className="flex items-center gap-2 mb-1">
                {summary.highestTier === 'normal' && radonLevel <= 1000 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className={`text-sm font-semibold ${globalVerdict.tone}`}>
                  Dictamen Global: {globalVerdict.status}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{globalVerdict.message}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 no-print">
            <button
              type="button"
              onClick={() => onNavigate('evaluator')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 whitespace-nowrap"
            >
              Evaluar Nuevo Punto
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              Imprimir Informe Ejecutivo
            </button>
          </div>
        </div>

        {/* BARRA DE SIMULACIÓN DE ESCENARIOS PARA TOMADORES DE DECISIÓN */}
        <div className="relative z-10 px-6 lg:px-8 py-3.5 bg-slate-950/70 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Simulador de Escenarios Operativos:</span>{' '}
            Alterna condiciones de campo para evaluar impacto regulatorio y prioridades.
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {EXECUTIVE_SCENARIOS.map((sc) => {
              const active = activeScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onApplyScenario(sc)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {sc.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FRANJA DE 4 KPIs EJECUTIVOS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Puntos Monitoreados (Anexo 2)</span>
            <ClipboardCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalPoints}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {summary.flaggedPoints.length} con alerta activa
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Fondo natural base</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {avgBackground.toFixed(3)} µSv/h
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Tasa Neta Máxima Detectada</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                summary.maxNet > 10
                  ? 'text-red-600'
                  : summary.maxNet > 2.5
                  ? 'text-amber-600'
                  : 'text-slate-900'
              }`}
            >
              {summary.maxNet.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">µSv/h netos</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Punto crítico</span>
            <span className="font-mono font-semibold text-slate-800">{summary.maxPointCode}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Dosis Ocupacional Proy. Máx.</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                summary.maxWorkerAnnualMsv > 1 ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              {summary.maxWorkerAnnualMsv.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">mSv/año</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Límite ocupacional: 20 mSv/a</span>
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {((summary.maxWorkerAnnualMsv / 20) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span>Control ²²²Radón en Aire</span>
            <AlertTriangle
              className={`w-4 h-4 ${radonLevel > 1000 ? 'text-red-600' : 'text-emerald-600'}`}
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                radonLevel > 1000 ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {radonLevel.toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-mono text-slate-500">Bq/m³</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ref. Res. 18 1434: 1,000</span>
            <span
              className={`font-semibold ${
                radonLevel > 1000 ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {radonLevel > 1000 ? 'Excede límite' : 'Cumple norma'}
            </span>
          </div>
        </div>
      </section>

      {/* FILA DE GRÁFICOS PRINCIPALES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Barras de Tasa de Dosis Neta por Punto vs Umbrales */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Perfil Radiométrico por Punto de Interés vs. Umbrales MME / OIEA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasa de dosis neta (µSv/h) sincronizada con Anexo 2. Haz clic en una barra para analizar el punto en el Evaluador.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
              <span>Intervención: 2.5 µSv/h</span>
              <span aria-hidden="true">·</span>
              <span>Actuación: 10 µSv/h</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 12, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  unit=" µSv"
                  domain={[0, (dataMax: number) => Math.max(11.5, Math.ceil(dataMax * 1.15))]}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-[#0B1320] text-white px-3.5 py-2.5 rounded-lg text-xs shadow-lg border border-slate-700 space-y-1">
                        <div className="font-semibold text-amber-400">
                          {item.code} — {item.desc}
                        </div>
                        <div className="font-mono tabular-nums">
                          Medida: {item.measured.toFixed(2)} µSv/h · Neta: {item.net.toFixed(3)} µSv/h
                        </div>
                        <div className="text-slate-300">Nivel: {item.tierLabel}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={10}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Actuación (10 µSv/h)',
                    position: 'insideTopRight',
                    fill: '#DC2626',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <ReferenceLine
                  y={2.5}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Intervención (2.5 µSv/h)',
                    position: 'insideTopRight',
                    fill: '#B45309',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                {investigationThresholdNet > 0 && (
                  <ReferenceLine
                    y={investigationThresholdNet}
                    stroke="#0284C7"
                    strokeDasharray="2 4"
                  />
                )}
                <Bar
                  dataKey="net"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  animationDuration={550}
                  className="cursor-pointer"
                  onClick={(data) => {
                    const measuredVal =
                      (data as { payload?: { measured?: number }; measured?: number })?.payload
                        ?.measured ??
                      (data as { measured?: number })?.measured;
                    if (typeof measuredVal === 'number') {
                      onInspectPoint(measuredVal);
                    }
                  }}
                >
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Donut de Distribución de Riesgo */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Distribución por Nivel de Riesgo</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Clasificación agregada de los {summary.totalPoints} puntos activos bajo enfoque graduado.
            </p>
          </div>

          <div className="h-52 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                  strokeWidth={0}
                  animationDuration={600}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} punto(s)`, name]}
                  contentStyle={{
                    backgroundColor: '#0B1320',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                {summary.flaggedPoints.length}/{summary.totalPoints}
              </span>
              <span className="text-[11px] text-slate-500">Con alerta</span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {(['actuacion', 'intervencion', 'investigacion', 'normal'] as RiskTier[]).map((tier) => (
              <div key={tier} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: TIER_META[tier].color }}
                  />
                  <span>{TIER_META[tier].label}</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {summary.counts[tier]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MATRIZ DE DECISIONES GERENCIALES */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Matriz de Decisiones Prioritarias para la Dirección y Operaciones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acciones concretas derivadas automáticamente de las lecturas de campo para asignación de recursos, control de accesos y cumplimiento regulatorio.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={() => onNavigate('decisions')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Abrir Árboles de Decisión
            </button>
            <button
              type="button"
              onClick={() => onNavigate('records')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Editar Registros Anexo 2
            </button>
          </div>
        </div>

        {summary.flaggedPoints.length === 0 && radonLevel <= 1000 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900">
              No se registran desviaciones radiológicas que requieran intervención gerencial.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Todas las estaciones operan dentro del fondo natural esperado ({avgBackground.toFixed(3)} µSv/h).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs">
                  <th className="py-3 px-4 font-semibold">Punto / Activo</th>
                  <th className="py-3 px-4 font-semibold text-right">Tasa Neta</th>
                  <th className="py-3 px-4 font-semibold">Nivel & Urgencia</th>
                  <th className="py-3 px-4 font-semibold">Responsable</th>
                  <th className="py-3 px-4 font-semibold">Directriz Recomendada</th>
                  <th className="py-3 px-4 font-semibold text-right no-print">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {radonLevel > 1000 && (
                  <tr className="bg-red-50/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      Espacios Confinados · ²²²Radón
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-red-700">
                      {radonLevel.toLocaleString('es-CO')} Bq/m³
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-red-700">Alerta Radón</span>
                      <span className="block text-slate-500">Inmediata (&lt; 24 h)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">HSE + Operaciones</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      Implementar extracción/ventilación mecánica forzada antes de cualquier ingreso y exigir monitoreo continuo de ²²²Rn (Res. 18 1434).
                    </td>
                    <td className="py-3.5 px-4 text-right no-print">
                      <button
                        type="button"
                        onClick={() => onNavigate('protection')}
                        className="text-sky-700 hover:text-sky-900 font-semibold whitespace-nowrap"
                      >
                        Ver protocolo →
                      </button>
                    </td>
                  </tr>
                )}
                {summary.flaggedPoints.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        <span className="font-mono text-slate-500 mr-1.5">{pt.code}</span>
                        {pt.desc}
                      </div>
                      {pt.obs && <div className="text-slate-500 mt-0.5">{pt.obs}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                      {pt.net.toFixed(2)} µSv/h
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className="font-semibold"
                        style={{ color: pt.classification.colorHex }}
                      >
                        {pt.classification.shortLabel}
                      </span>
                      <span className="block text-slate-500">{pt.classification.urgency}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {pt.classification.owner}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-md">
                      {pt.classification.executiveDirective}
                    </td>
                    <td className="py-3.5 px-4 text-right no-print">
                      <button
                        type="button"
                        onClick={() => onInspectPoint(Number(pt.measured))}
                        className="text-sky-700 hover:text-sky-900 font-semibold whitespace-nowrap"
                      >
                        Analizar →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
