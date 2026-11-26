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
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  Anexo2Row,
  Anexo3Row,
  classifyDoseRate,
  EXECUTIVE_SCENARIOS,
  FieldHeaderMeta,
  IAEA_GLOSSARY_URL,
  REFERENCE_PDF_PATH,
  RiskTier,
  ScenarioPreset,
} from '../data/normData';
import bannerImg from '../assets/images/oil_gas_facility_banner_1795569270407.jpg';
import { WorkflowGuideStrip } from './VisualSchematics';

interface ExecutiveDashboardProps {
  avgBackground: number;
  radonLevel: number;
  fieldMeta: FieldHeaderMeta;
  anexo2Rows: Anexo2Row[];
  anexo3Rows: Anexo3Row[];
  activeScenarioId: string;
  onApplyScenario: (scenario: ScenarioPreset) => void;
  onNavigate: (tab: string) => void;
  onInspectPoint: (measured: number) => void;
  onShowToast: (msg: string) => void;
}

const TIER_META: Record<RiskTier, { label: string; color: string; order: number }> = {
  actuacion: { label: 'Actuación (>10 µSv/h)', color: '#DC2626', order: 0 },
  intervencion: { label: 'Intervención (>2.5 µSv/h)', color: '#D97706', order: 1 },
  investigacion: { label: 'Investigación (>3× Fondo)', color: '#0284C7', order: 2 },
  normal: { label: 'Normal (Fondo)', color: '#059669', order: 3 },
};

const escapeHtml = (value: string | number): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  avgBackground,
  radonLevel,
  fieldMeta,
  anexo2Rows,
  anexo3Rows,
  activeScenarioId,
  onApplyScenario,
  onNavigate,
  onInspectPoint,
  onShowToast,
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

  const handleExportHtmlReport = () => {
    try {
      const reportDate = fieldMeta.date || new Date().toISOString().slice(0, 10);
      const filename = `Informe_Vigilancia_Radiologica_NORM_${reportDate}.html`;

      const pointsRowsHtml = enrichedPoints
        .map(
          (pt) => `
          <tr>
            <td style="font-family:monospace;font-weight:600;">${escapeHtml(pt.code)}</td>
            <td>${escapeHtml(pt.desc)}</td>
            <td style="text-align:right;font-family:monospace;">${Number(pt.measured).toFixed(2)}</td>
            <td style="text-align:right;font-family:monospace;font-weight:700;">${pt.net.toFixed(3)}</td>
            <td style="font-weight:700;color:${pt.classification.colorHex};">${escapeHtml(pt.classification.shortLabel)}</td>
            <td>${escapeHtml(pt.classification.owner)}</td>
            <td>${escapeHtml(pt.classification.executiveDirective)}</td>
          </tr>`
        )
        .join('');

      const dosimetryRowsHtml = anexo3Rows
        .map(
          (r) => `
          <tr>
            <td style="font-family:monospace;">${escapeHtml(r.date)}</td>
            <td>${escapeHtml(r.worker)}</td>
            <td>${escapeHtml(r.role)}</td>
            <td>${escapeHtml(r.activity)}</td>
            <td style="text-align:right;font-family:monospace;">${Number(r.hours).toFixed(1)}</td>
            <td style="text-align:right;font-family:monospace;font-weight:700;">${Number(r.dose).toFixed(1)}</td>
          </tr>`
        )
        .join('');

      const htmlDoc = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Informe Técnico de Vigilancia Radiológica NORM — ${escapeHtml(reportDate)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 32px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 6px; color: #0B1320; }
  h2 { font-size: 14px; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 2px solid #E2E8F0; color: #0B1320; text-transform: uppercase; letter-spacing: 0.04em; }
  .subtitle { font-size: 12px; color: #475569; margin-bottom: 18px; }
  .banner { background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
  .kpi { border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; background: #FFFFFF; }
  .kpi-label { font-size: 11px; color: #64748B; }
  .kpi-val { font-size: 20px; font-weight: 700; font-family: monospace; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; vertical-align: top; }
  th { background: #F1F5F9; font-weight: 600; color: #334155; }
  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 18px; font-size: 12px; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #CBD5E1; font-size: 11px; color: #475569; display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  @media print { body { margin: 16px; } .no-print { display: none; } }
</style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;">
    <div>
      <h1>Informe Técnico de Vigilancia Radiológica NORM</h1>
      <div class="subtitle">
        Documento de referencia: Criterios de vigilancia radiológica durante el desarrollo de los Proyectos Piloto de Investigación Integral, PPII, en yacimientos no convencionales de hidrocarburos (Ministerio de Minas y Energía, 2021) · OIEA GSR Part 3 / SSG-60 · IOGP 412.
      </div>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:8px 14px;background:#0B1320;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
      Imprimir / Guardar PDF
    </button>
  </div>

  <div class="banner">
    <div style="font-size:13px;font-weight:700;margin-bottom:4px;">Estado Global: ${escapeHtml(globalVerdict.status)}</div>
    <div style="font-size:12px;color:#334155;">${escapeHtml(globalVerdict.message)}</div>
  </div>

  <h2>Datos de Inspección y Calibración</h2>
  <div class="meta-grid">
    <div><strong>Fecha y Hora:</strong> ${escapeHtml(fieldMeta.date)} ${escapeHtml(fieldMeta.time)}</div>
    <div><strong>Responsable:</strong> ${escapeHtml(fieldMeta.performedBy)}</div>
    <div><strong>Instrumento:</strong> ${escapeHtml(fieldMeta.detectorType)} (Serial: ${escapeHtml(fieldMeta.detectorSerial)})</div>
    <div><strong>Vigencia Calibración:</strong> ${escapeHtml(fieldMeta.calibrationExpiry)}</div>
    <div style="grid-column:1 / -1;"><strong>Actividad Evaluada:</strong> ${escapeHtml(fieldMeta.activityDesc)}</div>
  </div>

  <h2>Indicadores Clave de Vigilancia</h2>
  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Fondo Natural Base</div>
      <div class="kpi-val">${avgBackground.toFixed(3)} µSv/h</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Tasa Neta Máxima (${escapeHtml(summary.maxPointCode)})</div>
      <div class="kpi-val">${summary.maxNet.toFixed(2)} µSv/h</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Dosis Proyectada Máx.</div>
      <div class="kpi-val">${summary.maxWorkerAnnualMsv.toFixed(2)} mSv/a</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">²²²Radón en Aire</div>
      <div class="kpi-val">${radonLevel.toLocaleString('es-CO')} Bq/m³</div>
    </div>
  </div>

  <h2>Resultados por Punto de Interés y Acciones Recomendadas (Anexo 2)</h2>
  <table>
    <thead>
      <tr>
        <th>Punto</th>
        <th>Descripción del Equipo / Área</th>
        <th style="text-align:right;">Medida (µSv/h)</th>
        <th style="text-align:right;">Neta (µSv/h)</th>
        <th>Nivel</th>
        <th>Responsable</th>
        <th>Acción Recomendada</th>
      </tr>
    </thead>
    <tbody>
      ${pointsRowsHtml}
    </tbody>
  </table>

  <h2>Registro Dosimétrico Operacional (Anexo 3)</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Trabajador</th>
        <th>Rol</th>
        <th>Actividad</th>
        <th style="text-align:right;">Tiempo (h)</th>
        <th style="text-align:right;">Lectura (µSv)</th>
      </tr>
    </thead>
    <tbody>
      ${dosimetryRowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <span>Referencia oficial: Criterios de vigilancia radiológica — Ministerio de Minas y Energía (2021) · Glosario OIEA.</span>
    <strong>Desarrollado por Karel Giovanny Nuñez</strong>
  </div>
</body>
</html>`;

      const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      onShowToast(`Informe técnico "${filename}" descargado. Ábrelo en tu navegador para imprimir o guardar en PDF.`);
    } catch {
      onShowToast('No fue posible generar el informe descargable.');
    }
  };

  const handleExportSummaryCSV = () => {
    try {
      const reportDate = fieldMeta.date || new Date().toISOString().slice(0, 10);
      const filename = `Resumen_Vigilancia_NORM_${reportDate}.csv`;
      const rows: (string | number)[][] = [
        ['Informe de Vigilancia Radiológica NORM', 'Referencia: Criterios de vigilancia radiológica (MME, 2021)'],
        ['Fecha', fieldMeta.date, 'Responsable', fieldMeta.performedBy],
        ['Fondo Natural Base (µSv/h)', avgBackground.toFixed(3), 'Radón-222 (Bq/m³)', radonLevel],
        ['Estado Global', globalVerdict.status],
        [],
        [
          'Punto',
          'Descripción',
          'Tasa Medida (µSv/h)',
          'Tasa Neta (µSv/h)',
          'Clasificación',
          'Urgencia',
          'Responsable',
          'Acción Recomendada',
        ],
        ...enrichedPoints.map((pt) => [
          pt.code,
          pt.desc,
          Number(pt.measured).toFixed(2),
          pt.net.toFixed(3),
          pt.classification.shortLabel,
          pt.classification.urgency,
          pt.classification.owner,
          pt.classification.executiveDirective,
        ]),
      ];

      const csvContent =
        '\uFEFF' +
        rows
          .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
          .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      onShowToast(`Archivo "${filename}" descargado correctamente.`);
    } catch {
      onShowToast('Error al exportar el resumen en formato CSV.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* CABECERA PRINCIPAL CON VISUAL DE INSTALACIÓN OIL & GAS */}
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
              <span>Vigilancia Radiológica NORM · Sector Hidrocarburos</span>
              <span aria-hidden="true">·</span>
              <span>MME Res. 18 1434 / 18 0005</span>
              <span aria-hidden="true">·</span>
              <span>OIEA SSG-60 / IOGP 412</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Criterios Orientadores de Vigilancia Radiológica para Empresas y Partes Interesadas
            </h2>

            <div className={`p-4 rounded-xl border ${globalVerdict.borderTone} backdrop-blur-xs transition-all duration-200`}>
              <div className="flex items-center gap-2 mb-1">
                {summary.highestTier === 'normal' && radonLevel <= 1000 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className={`text-sm font-semibold ${globalVerdict.tone}`}>
                  Estado Global: {globalVerdict.status}
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
              onClick={handleExportHtmlReport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Exportar Informe Técnico
            </button>
          </div>
        </div>

        {/* BARRA DE SIMULACIÓN DE ESCENARIOS OPERATIVOS */}
        <div className="relative z-10 px-6 lg:px-8 py-3.5 bg-slate-950/70 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Simulador de Escenarios Operativos:</span>{' '}
            Alterna condiciones de campo para analizar niveles de referencia y medidas de control.
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

      {/* REFERENCIA OFICIAL AL DOCUMENTO DE CRITERIOS DE VIGILANCIA RADIOLÓGICA */}
      <section className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-800">
              Documento Técnico de Referencia · Ministerio de Minas y Energía (2021)
            </div>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">
              Basado en{' '}
              <strong className="font-semibold text-slate-900">
                “Criterios de vigilancia radiológica durante el desarrollo de los Proyectos Piloto de
                Investigación Integral, PPII, en yacimientos no convencionales de hidrocarburos a
                través de la técnica de fracturamiento hidráulico multietapa con perforación
                horizontal”
              </strong>{' '}
              (Grupo de Asuntos Nucleares – MinEnergía), diseñado
              como herramienta abierta de consulta y apoyo para equipos técnicos, operadores, HSE,
              responsables de vigilancia radiológica y grupos de interés.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
          <a
            href={REFERENCE_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Ver Documento (PDF)
          </a>
          <a
            href={IAEA_GLOSSARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Glosario OIEA
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>

      {/* RUTA VISUAL INTERACTIVA DE USO */}
      <WorkflowGuideStrip onNavigate={onNavigate} />

      {/* FRANJA DE 4 INDICADORES PRINCIPALES */}
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
                Perfil Radiométrico por Punto de Interés vs. Niveles de Referencia
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
                  width={78}
                  tick={{ fontSize: 12, fill: '#475569', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  unit=" µSv/h"
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
            <h3 className="text-base font-bold text-slate-900">Distribución por Nivel de Referencia</h3>
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

      {/* PLAN DE ACCIÓN Y PRIORIDADES OPERATIVAS */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Plan de Acción y Prioridades de Vigilancia Radiológica
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Recomendaciones generadas automáticamente a partir de las mediciones en campo para orientar la operación segura, el control de accesos y el seguimiento técnico.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={handleExportSummaryCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => onNavigate('decisions')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Protocolos de Gestión
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
              No se registran desviaciones radiológicas que requieran acciones adicionales.
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
                  <th className="py-3 px-4 font-semibold">Acción Recomendada</th>
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
