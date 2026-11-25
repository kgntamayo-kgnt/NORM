import React, { useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardList,
  Download,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Anexo1Row,
  Anexo2Row,
  Anexo3Row,
  classifyDoseRate,
  FACILITY_NODES,
  FieldHeaderMeta,
  RiskTier,
} from '../data/normData';

interface FieldRecordsProps {
  avgBackground: number;
  fieldMeta: FieldHeaderMeta;
  setFieldMeta: React.Dispatch<React.SetStateAction<FieldHeaderMeta>>;
  anexo1Rows: Anexo1Row[];
  setAnexo1Rows: React.Dispatch<React.SetStateAction<Anexo1Row[]>>;
  anexo2Rows: Anexo2Row[];
  setAnexo2Rows: React.Dispatch<React.SetStateAction<Anexo2Row[]>>;
  anexo3Rows: Anexo3Row[];
  setAnexo3Rows: React.Dispatch<React.SetStateAction<Anexo3Row[]>>;
  onShowToast: (msg: string) => void;
}

const MONTHS_LABELS = [
  'Mes 1',
  'Mes 2',
  'Mes 3',
  'Mes 4',
  'Mes 5',
  'Mes 6',
  'Mes 7',
  'Mes 8',
  'Mes 9',
  'Mes 10',
  'Mes 11',
  'Mes 12',
];

export const FieldRecords: React.FC<FieldRecordsProps> = ({
  avgBackground,
  fieldMeta,
  setFieldMeta,
  anexo1Rows,
  setAnexo1Rows,
  anexo2Rows,
  setAnexo2Rows,
  anexo3Rows,
  setAnexo3Rows,
  onShowToast,
}) => {
  const [activeForm, setActiveForm] = useState<'anexo1' | 'anexo2' | 'anexo3'>('anexo2');
  const [anexo2Search, setAnexo2Search] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | RiskTier>('ALL');
  const [monthlyDoses, setMonthlyDoses] = useState<number[]>([
    18.5, 24.0, 15.2, 31.0, 22.4, 19.8, 27.6, 14.5, 29.0, 21.3, 17.5, 0.0,
  ]);

  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const metaHeaderLines = [
        ['Fecha', fieldMeta.date, 'Hora', fieldMeta.time],
        ['Medición realizada por', fieldMeta.performedBy, 'Tipo detector', fieldMeta.detectorType],
        ['Serial detector', fieldMeta.detectorSerial, 'Vigencia calibración', fieldMeta.calibrationExpiry],
        ['Actividad', fieldMeta.activityDesc, 'Fondo promedio (µSv/h)', avgBackground.toFixed(3)],
        [],
      ];

      const allRows = [...metaHeaderLines, headers, ...rows];
      const csvContent =
        '\uFEFF' +
        allRows
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
      URL.revokeObjectURL(url);
      onShowToast(`Archivo "${filename}" descargado con trazabilidad completa.`);
    } catch {
      onShowToast('Error al generar el archivo CSV.');
    }
  };

  const filteredAnexo2 = useMemo(() => {
    const q = anexo2Search.toLowerCase().trim();
    return anexo2Rows.filter((row) => {
      const cls = classifyDoseRate(Number(row.measured), avgBackground);
      if (tierFilter !== 'ALL' && cls.tier !== tierFilter) return false;
      if (!q) return true;
      return (
        row.code.toLowerCase().includes(q) ||
        row.desc.toLowerCase().includes(q) ||
        row.obs.toLowerCase().includes(q)
      );
    });
  }, [anexo2Rows, anexo2Search, tierFilter, avgBackground]);

  const totalDoseAnexo3 = useMemo(
    () => anexo3Rows.reduce((acc, r) => acc + Number(r.dose || 0), 0),
    [anexo3Rows]
  );

  const annualMonthlyDoseMicroSv = useMemo(
    () => monthlyDoses.reduce((acc, v) => acc + Number(v || 0), 0),
    [monthlyDoses]
  );

  const annualMonthlyDoseMSv = annualMonthlyDoseMicroSv / 1000;
  const maxMonthlyVal = Math.max(50, ...monthlyDoses);

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* CABECERA OFICIAL DE INSPECCIÓN RADIOLÓGICA */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-sky-700 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Datos de Cabecera de Inspección y Calibración Instrumental
              </h3>
              <p className="text-xs text-slate-500">
                Metadatos incluidos automáticamente al exportar los Anexos 1, 2 y 3 en formato CSV.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
            Fondo aplicado: {avgBackground.toFixed(3)} µSv/h
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Fecha</label>
            <input
              type="date"
              value={fieldMeta.date}
              onChange={(e) => setFieldMeta({ ...fieldMeta, date: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Hora</label>
            <input
              type="time"
              value={fieldMeta.time}
              onChange={(e) => setFieldMeta({ ...fieldMeta, time: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Medición realizada por</label>
            <input
              type="text"
              value={fieldMeta.performedBy}
              onChange={(e) => setFieldMeta({ ...fieldMeta, performedBy: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Tipo de detector</label>
            <select
              value={fieldMeta.detectorType}
              onChange={(e) =>
                setFieldMeta({
                  ...fieldMeta,
                  detectorType: e.target.value as 'Intensímetro' | 'Monitor de contaminación',
                })
              }
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            >
              <option value="Intensímetro">Intensímetro</option>
              <option value="Monitor de contaminación">Monitor de contaminación</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Serial del detector</label>
            <input
              type="text"
              value={fieldMeta.detectorSerial}
              onChange={(e) => setFieldMeta({ ...fieldMeta, detectorSerial: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Vigencia de calibración</label>
            <input
              type="date"
              value={fieldMeta.calibrationExpiry}
              onChange={(e) => setFieldMeta({ ...fieldMeta, calibrationExpiry: e.target.value })}
              className="w-full px-2.5 py-1.5 font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-600 mb-1">
              Descripción de la actividad evaluada
            </label>
            <input
              type="text"
              value={fieldMeta.activityDesc}
              onChange={(e) => setFieldMeta({ ...fieldMeta, activityDesc: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
        </div>
      </section>

      {/* FORMULARIOS PRINCIPALES: ANEXOS 1, 2 Y 3 */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs text-slate-500">
              Trazabilidad y Registros de Campo · Anexos 1, 2 y 3
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Registros Digitales de Vigilancia Radiológica en Campo
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cualquier edición aquí actualiza automáticamente los gráficos y el plan de acción del Panorama General.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'anexo1', label: `Anexo 1: Fondo (${anexo1Rows.length})` },
              { id: 'anexo2', label: `Anexo 2: Puntos (${anexo2Rows.length})` },
              { id: 'anexo3', label: `Anexo 3: Dosimetría (${anexo3Rows.length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveForm(f.id as 'anexo1' | 'anexo2' | 'anexo3')}
                className={`px-3 py-2 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  activeForm === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ANEXO 1: FONDO NATURAL */}
        {activeForm === 'anexo1' && (
          <div className="space-y-4 animate-fade-slide">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Anexo 1 — Monitoreo de Radiación de Fondo Natural (Natural Background)
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setAnexo1Rows([
                      ...anexo1Rows,
                      {
                        id: Date.now(),
                        point: 'Nuevo Punto Control',
                        m1: 0.11,
                        m2: 0.11,
                        m3: 0.12,
                        m4: 0.11,
                        obs: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Punto
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportToCSV(
                      'Anexo1_Fondo_Natural_NORM.csv',
                      [
                        'Punto Seleccionado',
                        'M1 (µSv/h)',
                        'M2 (µSv/h)',
                        'M3 (µSv/h)',
                        'M4 (µSv/h)',
                        'Promedio (µSv/h)',
                        'Observaciones',
                      ],
                      anexo1Rows.map((r) => [
                        r.point,
                        r.m1,
                        r.m2,
                        r.m3,
                        r.m4,
                        ((Number(r.m1) + Number(r.m2) + Number(r.m3) + Number(r.m4)) / 4).toFixed(3),
                        r.obs,
                      ])
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold">Punto Seleccionado</th>
                    <th className="p-3 font-semibold w-24">Med. 1</th>
                    <th className="p-3 font-semibold w-24">Med. 2</th>
                    <th className="p-3 font-semibold w-24">Med. 3</th>
                    <th className="p-3 font-semibold w-24">Med. 4</th>
                    <th className="p-3 font-semibold text-right">Promedio</th>
                    <th className="p-3 font-semibold">Observaciones</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {anexo1Rows.map((row, idx) => {
                    const avg =
                      (Number(row.m1) + Number(row.m2) + Number(row.m3) + Number(row.m4)) / 4;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.point}
                            onChange={(e) => {
                              const copy = [...anexo1Rows];
                              copy[idx] = { ...copy[idx], point: e.target.value };
                              setAnexo1Rows(copy);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                          />
                        </td>
                        {(['m1', 'm2', 'm3', 'm4'] as const).map((field) => (
                          <td key={field} className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row[field]}
                              onChange={(e) => {
                                const copy = [...anexo1Rows];
                                copy[idx] = { ...copy[idx], [field]: parseFloat(e.target.value) || 0 };
                                setAnexo1Rows(copy);
                              }}
                              className="w-full px-2 py-1.5 font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            />
                          </td>
                        ))}
                        <td className="p-2 text-right font-mono tabular-nums font-bold text-sky-800 whitespace-nowrap">
                          {avg.toFixed(3)} µSv/h
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.obs}
                            onChange={(e) => {
                              const copy = [...anexo1Rows];
                              copy[idx] = { ...copy[idx], obs: e.target.value };
                              setAnexo1Rows(copy);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => setAnexo1Rows(anexo1Rows.filter((r) => r.id !== row.id))}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                            aria-label="Eliminar fila"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANEXO 2: PUNTOS DE INTERÉS */}
        {activeForm === 'anexo2' && (
          <div className="space-y-4 animate-fade-slide">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Anexo 2 — Puntos de Interés (Fondo Aplicado: {avgBackground.toFixed(3)} µSv/h)
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setAnexo2Rows([
                      ...anexo2Rows,
                      {
                        id: Date.now(),
                        code: `PI-${String(anexo2Rows.length + 1).padStart(2, '0')}`,
                        desc: 'Nuevo equipo o tramo',
                        facilityNodeId: 'wellhead',
                        measured: 0.15,
                        obs: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Punto
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportToCSV(
                      'Anexo2_Puntos_Interes_NORM.csv',
                      [
                        'Punto',
                        'Descripción',
                        'Unidad Proceso',
                        'Tasa Medida (µSv/h)',
                        'Tasa Neta (µSv/h)',
                        'Clasificación',
                        'Observaciones',
                      ],
                      anexo2Rows.map((r) => {
                        const net = Math.max(0, Number(r.measured) - avgBackground);
                        const cls = classifyDoseRate(Number(r.measured), avgBackground);
                        return [
                          r.code,
                          r.desc,
                          FACILITY_NODES.find((n) => n.id === r.facilityNodeId)?.shortTitle || '',
                          r.measured,
                          net.toFixed(3),
                          cls.shortLabel.toUpperCase(),
                          r.obs,
                        ];
                      })
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Barra de búsqueda y filtro por nivel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filtrar por código, equipo u observación..."
                  value={anexo2Search}
                  onChange={(e) => setAnexo2Search(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-sky-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'actuacion', label: 'Actuación' },
                  { id: 'intervencion', label: 'Intervención' },
                  { id: 'investigacion', label: 'Investigación' },
                  { id: 'normal', label: 'Normal' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierFilter(t.id as 'ALL' | RiskTier)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      tierFilter === t.id
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold w-24">Punto</th>
                    <th className="p-3 font-semibold">Descripción del Equipo / Área</th>
                    <th className="p-3 font-semibold w-36">Unidad Proceso</th>
                    <th className="p-3 font-semibold w-28 text-right">Medida (µSv/h)</th>
                    <th className="p-3 font-semibold w-28 text-right">Neta (µSv/h)</th>
                    <th className="p-3 font-semibold w-32">Clasificación</th>
                    <th className="p-3 font-semibold">Observaciones</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAnexo2.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No hay puntos que coincidan con el filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    filteredAnexo2.map((row) => {
                      const idx = anexo2Rows.findIndex((r) => r.id === row.id);
                      const net = Math.max(0, Number(row.measured) - avgBackground);
                      const cls = classifyDoseRate(Number(row.measured), avgBackground);
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.code}
                              onChange={(e) => {
                                const copy = [...anexo2Rows];
                                copy[idx] = { ...copy[idx], code: e.target.value };
                                setAnexo2Rows(copy);
                              }}
                              className="w-full px-2 py-1.5 font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.desc}
                              onChange={(e) => {
                                const copy = [...anexo2Rows];
                                copy[idx] = { ...copy[idx], desc: e.target.value };
                                setAnexo2Rows(copy);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.facilityNodeId}
                              onChange={(e) => {
                                const copy = [...anexo2Rows];
                                copy[idx] = { ...copy[idx], facilityNodeId: e.target.value };
                                setAnexo2Rows(copy);
                              }}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            >
                              {FACILITY_NODES.map((n) => (
                                <option key={n.id} value={n.id}>
                                  {n.shortTitle}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.05"
                              min="0"
                              value={row.measured}
                              onChange={(e) => {
                                const copy = [...anexo2Rows];
                                copy[idx] = {
                                  ...copy[idx],
                                  measured: Math.max(0, parseFloat(e.target.value) || 0),
                                };
                                setAnexo2Rows(copy);
                              }}
                              className="w-full px-2 py-1.5 font-mono tabular-nums text-right bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            />
                          </td>
                          <td className="p-2 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                            {net.toFixed(3)}
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <span className="font-semibold" style={{ color: cls.colorHex }}>
                              {cls.shortLabel}
                            </span>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.obs}
                              onChange={(e) => {
                                const copy = [...anexo2Rows];
                                copy[idx] = { ...copy[idx], obs: e.target.value };
                                setAnexo2Rows(copy);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => setAnexo2Rows(anexo2Rows.filter((r) => r.id !== row.id))}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                              aria-label="Eliminar fila"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANEXO 3: DOSIMETRÍA PERSONAL */}
        {activeForm === 'anexo3' && (
          <div className="space-y-6 animate-fade-slide">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Anexo 3 — Control Dosimétrico Operacional por Actividad
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dosis colectiva registrada en campaña:{' '}
                  <strong className="font-mono tabular-nums text-slate-900">
                    {totalDoseAnexo3.toFixed(1)} µSv ({(totalDoseAnexo3 / 1000).toFixed(4)} mSv)
                  </strong>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setAnexo3Rows([
                      ...anexo3Rows,
                      {
                        id: Date.now(),
                        date: fieldMeta.date,
                        worker: 'Operador / Técnico',
                        role: 'Mantenimiento',
                        activity: 'Actividad en zona supervisada',
                        hours: 2.0,
                        dose: 1.5,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Registro
                </button>
                <button
                  type="button"
                  onClick={() =>
                    exportToCSV(
                      'Anexo3_Dosimetria_Personal_NORM.csv',
                      [
                        'Fecha',
                        'Trabajador',
                        'Rol',
                        'Actividad Desarrollada',
                        'Tiempo (h)',
                        'Lectura Dosímetro (µSv)',
                      ],
                      anexo3Rows.map((r) => [r.date, r.worker, r.role, r.activity, r.hours, r.dose])
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold w-32">Fecha</th>
                    <th className="p-3 font-semibold">Trabajador</th>
                    <th className="p-3 font-semibold w-32">Rol</th>
                    <th className="p-3 font-semibold">Actividad Desarrollada</th>
                    <th className="p-3 font-semibold w-24 text-right">Tiempo (h)</th>
                    <th className="p-3 font-semibold w-32 text-right">Dosímetro (µSv)</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {anexo3Rows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], date: e.target.value };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2 py-1.5 font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.worker}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], worker: e.target.value };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.role}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], role: e.target.value };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.activity}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], activity: e.target.value };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={row.hours}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], hours: parseFloat(e.target.value) || 0 };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2 py-1.5 font-mono tabular-nums text-right bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={row.dose}
                          onChange={(e) => {
                            const copy = [...anexo3Rows];
                            copy[idx] = { ...copy[idx], dose: parseFloat(e.target.value) || 0 };
                            setAnexo3Rows(copy);
                          }}
                          className="w-full px-2 py-1.5 font-mono tabular-nums text-right font-bold text-sky-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-sky-600"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => setAnexo3Rows(anexo3Rows.filter((r) => r.id !== row.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                          aria-label="Eliminar fila"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CONTROL DOSIMÉTRICO MENSUAL ACUMULADO (12 MESES) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-700 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Control Dosimétrico Mensual Acumulado (Mes 1 – Mes 12)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Seguimiento anual frente al umbral de 1 mSv/año (1,000 µSv/año) para exposición ocupacional controlada.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Acumulado Anual</div>
                  <div
                    className={`text-base font-bold font-mono tabular-nums ${
                      annualMonthlyDoseMSv >= 1 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {annualMonthlyDoseMicroSv.toFixed(1)} µSv ({annualMonthlyDoseMSv.toFixed(3)} mSv)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
                {MONTHS_LABELS.map((month, idx) => {
                  const val = monthlyDoses[idx];
                  const barPct = Math.min(100, (val / maxMonthlyVal) * 100);
                  return (
                    <div
                      key={month}
                      className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col justify-between gap-2"
                    >
                      <div className="text-[11px] font-semibold text-slate-500 text-center">
                        {month}
                      </div>
                      <div className="h-12 flex items-end justify-center px-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-300"
                          style={{
                            height: `${Math.max(6, barPct)}%`,
                            backgroundColor: val > 80 ? '#D97706' : '#0284C7',
                          }}
                        />
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={val}
                        aria-label={`Dosis ${month} en microsieverts`}
                        onChange={(e) => {
                          const next = [...monthlyDoses];
                          next[idx] = Math.max(0, parseFloat(e.target.value) || 0);
                          setMonthlyDoses(next);
                        }}
                        className="w-full px-1 py-1 text-[11px] font-mono tabular-nums text-center bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-sky-600 focus:bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
