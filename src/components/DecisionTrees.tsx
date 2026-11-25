import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Gauge,
  Layers,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';

interface DecisionTreesProps {
  onShowToast: (msg: string) => void;
}

type TreeMode = 'equipment' | 'remediation';

interface StepMeta {
  id: string;
  shortTitle: string;
  kind: 'decision' | 'action' | 'release' | 'waste';
}

const EQUIP_STEPS: StepMeta[] = [
  { id: 'start', shortTitle: '1. Retiro de Equipo', kind: 'decision' },
  { id: 'assume_contaminated', shortTitle: '2A. Embalaje Preventivo', kind: 'action' },
  { id: 'monitor_onsite', shortTitle: '2B. Verificación ≤ 10 µSv/h', kind: 'decision' },
  { id: 'decontaminate', shortTitle: '3. Métodos de Descontaminación', kind: 'decision' },
  { id: 'can_remove', shortTitle: '4. Viabilidad ALARA', kind: 'decision' },
  { id: 'released', shortTitle: 'Dictamen: Liberación RVR', kind: 'release' },
  { id: 'waste_management', shortTitle: 'Dictamen: Residuo NORM', kind: 'waste' },
];

const REM_STEPS: StepMeta[] = [
  { id: 'start', shortTitle: '1. Monitoreo > 2.5 µSv/h', kind: 'decision' },
  { id: 'lab_check', shortTitle: '2. Caracterización SGC (>1 Bq/g)', kind: 'decision' },
  { id: 'execute_remediation', shortTitle: '3. Remediación y Verificación', kind: 'action' },
  { id: 'no_action', shortTitle: 'Dictamen: Sin Remediación', kind: 'release' },
  { id: 'area_released', shortTitle: 'Dictamen: Área Liberada', kind: 'release' },
];

export const DecisionTrees: React.FC<DecisionTreesProps> = ({ onShowToast }) => {
  const [treeMode, setTreeMode] = useState<TreeMode>('equipment');
  const [equipHistory, setEquipHistory] = useState<string[]>(['start']);
  const [remHistory, setRemHistory] = useState<string[]>(['start']);

  const equipStep = equipHistory[equipHistory.length - 1];
  const remStep = remHistory[remHistory.length - 1];

  const advanceEquip = (next: string) => setEquipHistory((prev) => [...prev, next]);
  const advanceRem = (next: string) => setRemHistory((prev) => [...prev, next]);

  const copyDecisionSummary = (title: string, detail: string) => {
    const pathText = (treeMode === 'equipment' ? equipHistory : remHistory)
      .map((id) => {
        const list = treeMode === 'equipment' ? EQUIP_STEPS : REM_STEPS;
        return list.find((s) => s.id === id)?.shortTitle || id;
      })
      .join(' → ');
    const text = `ACTA DE DECISIÓN OPERATIVA NORM\nProtocolo: ${
      treeMode === 'equipment'
        ? 'Gestión de Equipamiento Contaminado'
        : 'Remediación de Áreas y Clausura'
    }\nRuta evaluada: ${pathText}\nDictamen: ${title}\nDirectriz: ${detail}\nReferencia: MME Res. 18 0005 / OIEA SSG-60 / TRS 419`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => onShowToast('Dictamen operativo copiado al portapapeles.'),
        () => onShowToast('No se pudo acceder al portapapeles.')
      );
    } else {
      onShowToast('Dictamen generado correctamente.');
    }
  };

  const activeSteps = treeMode === 'equipment' ? EQUIP_STEPS : REM_STEPS;
  const activeHistory = treeMode === 'equipment' ? equipHistory : remHistory;
  const activeCurrent = treeMode === 'equipment' ? equipStep : remStep;

  return (
    <div className="space-y-6 animate-fade-slide">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs text-slate-500">
              Gestión de Materiales, Elementos y Residuos NORM · OIEA SSG-60 / TRS 419
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Asistente Visual de Toma de Decisiones Operativas
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                setTreeMode('equipment');
                setEquipHistory(['start']);
              }}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                treeMode === 'equipment'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Flujo 1: Equipamiento Contaminado
            </button>
            <button
              type="button"
              onClick={() => {
                setTreeMode('remediation');
                setRemHistory(['start']);
              }}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                treeMode === 'remediation'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Flujo 2: Remediación de Áreas
            </button>
          </div>
        </div>

        {/* DISEÑO EN 2 COLUMNAS: MAPA DE RUTA + TARJETA ACTIVA ANIMADA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Mapa de Ruta Regulatoria</span>
              <button
                type="button"
                onClick={() =>
                  treeMode === 'equipment'
                    ? setEquipHistory(['start'])
                    : setRemHistory(['start'])
                }
                className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar
              </button>
            </div>

            <div className="space-y-1.5">
              {activeSteps.map((step) => {
                const visitedIdx = activeHistory.indexOf(step.id);
                const isCurrent = activeCurrent === step.id;
                const isVisited = visitedIdx !== -1;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={!isVisited}
                    onClick={() => {
                      if (!isVisited) return;
                      if (treeMode === 'equipment') {
                        setEquipHistory(equipHistory.slice(0, visitedIdx + 1));
                      } else {
                        setRemHistory(remHistory.slice(0, visitedIdx + 1));
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs border transition-all duration-150 flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-[#0B1320] text-white border-slate-900 font-semibold shadow-sm'
                        : isVisited
                        ? 'bg-white text-slate-800 border-emerald-300 hover:bg-emerald-50/50 cursor-pointer'
                        : 'bg-slate-100/70 text-slate-400 border-slate-200 cursor-default'
                    }`}
                  >
                    <span className="truncate">{step.shortTitle}</span>
                    {isCurrent ? (
                      <span className="text-[10px] font-mono text-amber-400 shrink-0">ACTUAL</span>
                    ) : isVisited ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={`${treeMode}-${activeCurrent}`} className="lg:col-span-8 animate-fade-slide">
            {/* FLUJO 1: EQUIPAMIENTO */}
            {treeMode === 'equipment' && (
              <div>
                {equipStep === 'start' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500">
                        Protocolo de Descontaminación y Liberación de Equipos
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Paso 1: Posible contaminación de equipamiento con fuentes naturales
                      </h3>
                      <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                        Se retira una pieza (tubería, válvula, bomba, separador) de línea de producción o mantenimiento. ¿El equipamiento puede monitorearse radiométricamente en el mismo lugar?
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => advanceEquip('monitor_onsite')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        Sí, monitorear en sitio
                      </button>
                      <button
                        type="button"
                        onClick={() => advanceEquip('assume_contaminated')}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        No es posible en sitio
                      </button>
                    </div>
                  </div>
                )}

                {equipStep === 'assume_contaminated' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-amber-950">
                        Paso 2A: Asumir preventivamente que el equipamiento está contaminado
                      </h3>
                      <p className="text-sm text-amber-900 max-w-xl mx-auto leading-relaxed">
                        Embalar para evitar dispersión (tapones herméticos en extremos de tubería y polietileno de alta densidad) y trasladar a zona controlada para monitoreo con detectores calibrados.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => advanceEquip('monitor_onsite')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Continuar a Monitoreo Radiométrico
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {equipStep === 'monitor_onsite' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Paso 2B: Verificación de Tasa de Dosis y Contaminación Superficial
                      </h3>
                      <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                        ¿Los valores medidos de radiación están por debajo del{' '}
                        <strong className="text-slate-900">Nivel de Actuación (&le; 10 µSv/h netos)</strong>{' '}
                        y criterios de dispensa aplicables?
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => advanceEquip('released')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Sí, bajo el nivel
                      </button>
                      <button
                        type="button"
                        onClick={() => advanceEquip('decontaminate')}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        No, superan el nivel
                      </button>
                    </div>
                  </div>
                )}

                {equipStep === 'decontaminate' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-5">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900">
                        Paso 3: Selección de Métodos de Descontaminación
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Embalar para evitar dispersión antes del traslado y seleccionar la técnica adecuada según geometría y control de residuos secundarios.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                        <span className="font-bold text-sky-800 block">Métodos Abrasivos (Incrustaciones y Lodos)</span>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Mecánicos (alta eficiencia):</strong> perforación y escariado, aspiración HEPA e inyección de agua a altas presiones. Exigen control estricto de aerosoles y particulado.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Manuales:</strong> remoción directa por personal para retirar arenas y lodos en superficies accesibles sin equipo mecánico.
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                        <span className="font-bold text-sky-800 block">Métodos Químicos (Preventivos y Correctivos)</span>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Desincrustación IN SITU:</strong> uso preventivo de inhibidores para evitar deposición de sales radiactivas en los equipos de producción.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          <strong className="text-slate-800">Limpieza Química:</strong> ácidos, álcalis o agentes quelantes para superficies de difícil acceso. Genera desechos líquidos con radionucleidos disueltos.
                        </p>
                      </div>
                    </div>
                    <div className="text-center space-y-3 pt-2">
                      <p className="text-sm font-semibold text-slate-800">
                        ¿La verificación post-limpieza confirma descontaminación efectiva?
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => advanceEquip('released')}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          Sí, descontaminación efectiva
                        </button>
                        <button
                          type="button"
                          onClick={() => advanceEquip('can_remove')}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          No, persiste contaminación
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {equipStep === 'can_remove' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-5">
                    <h3 className="text-lg font-bold text-amber-950">
                      Paso 4: Evaluación Costo-Beneficio (ALARA) de Remoción Adicional
                    </h3>
                    <p className="text-sm text-amber-900 max-w-xl mx-auto leading-relaxed">
                      ¿Es técnica y económicamente viable un segundo ciclo de remoción sin incrementar innecesariamente la dosis ocupacional bajo el principio ALARA?
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => advanceEquip('decontaminate')}
                        className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Sí, repetir ciclo controlado
                      </button>
                      <button
                        type="button"
                        onClick={() => advanceEquip('waste_management')}
                        className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        No → Procedimientos de Gestión NORM
                      </button>
                    </div>
                  </div>
                )}

                {equipStep === 'released' && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-950">
                      Equipamiento Liberado para Operación Normal o Disposición Convencional
                    </h3>
                    <p className="text-sm text-emerald-900 max-w-xl mx-auto leading-relaxed">
                      Emitir certificado de liberación radiológica firmado por el Responsable de Vigilancia Radiológica (RVR) adjuntando las lecturas de verificación final.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyDecisionSummary(
                          'Equipamiento Liberado para Operación Normal',
                          'Emitir certificado de liberación radiológica firmado por el RVR.'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Acta de Decisión
                    </button>
                  </div>
                )}

                {equipStep === 'waste_management' && (
                  <div className="bg-red-50 border border-red-300 rounded-xl p-8 text-center space-y-4">
                    <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
                    <h3 className="text-lg font-bold text-red-950">
                      Gestión como Residuo Radiactivo NORM (Res. 18 0005 / OIEA SSG-60)
                    </h3>
                    <p className="text-sm text-red-900 max-w-xl mx-auto leading-relaxed">
                      Aislar en área de almacenamiento temporal autorizada, etiquetar con señalización reglamentaria, inventariar actividad específica (Bq/g) y gestionar mediante gestor licenciado o alternativas avaladas por el regulador.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyDecisionSummary(
                          'Gestión como Residuo Radiactivo NORM',
                          'Aislar, etiquetar, inventariar actividad (Bq/g) y gestionar bajo Res. 18 0005 / OIEA SSG-60.'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Acta de Decisión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* FLUJO 2: REMEDIACIÓN DE ÁREAS */}
            {treeMode === 'remediation' && (
              <div>
                {remStep === 'start' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-5">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-slate-500">
                        Protocolo para Liberación o Remediación de Áreas en Clausura
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Paso 1: Monitoreo Radiológico en Puntos de Interés
                      </h3>
                      <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                        ¿Los valores medidos en piscinas, patios de tubería o suelos superan el{' '}
                        <strong className="text-slate-900">Nivel de Intervención Operacional (&gt; 2.5 µSv/h netos)</strong>?
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => advanceRem('lab_check')}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Sí, superan 2.5 µSv/h
                      </button>
                      <button
                        type="button"
                        onClick={() => advanceRem('no_action')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        No, bajo el nivel
                      </button>
                    </div>
                  </div>
                )}

                {remStep === 'no_action' && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-950">
                      No se Requiere Acción de Remediación Radiológica
                    </h3>
                    <p className="text-sm text-emerald-900 max-w-xl mx-auto leading-relaxed">
                      Verificar las <strong>consideraciones no radiológicas</strong> (hidrocarburos totales, metales pesados, acidez, salinidad y estabilidad geotécnica) antes de la liberación ambiental definitiva.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyDecisionSummary(
                          'Sin Remediación Radiológica Requerida',
                          'Validar parámetros fisicoquímicos no radiológicos para cierre ambiental.'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Acta de Decisión
                    </button>
                  </div>
                )}

                {remStep === 'lab_check' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Paso 2: Caracterización en Laboratorio y Riesgos Fisicoquímicos
                    </h3>
                    <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                      Verificar registros de caracterización de matrices ambientales analizadas en laboratorio (criterio de exención 1 Bq/g para U/Th) y evaluar integralmente riesgos fisicoquímicos y radiológicos. ¿Se confirma necesidad de remediación?
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => advanceRem('execute_remediation')}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Sí, ejecutar plan de remediación
                      </button>
                      <button
                        type="button"
                        onClick={() => advanceRem('no_action')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        No, bajo exención (≤ 1 Bq/g)
                      </button>
                    </div>
                  </div>
                )}

                {remStep === 'execute_remediation' && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 space-y-5">
                    <h3 className="text-lg font-bold text-amber-950 text-center">
                      Paso 3: Controles de Exposición, Remediación y Mapeo de Verificación
                    </h3>
                    <ul className="text-xs text-amber-950 space-y-2.5 max-w-xl mx-auto leading-relaxed">
                      <li>
                        <strong>1. Controles previos:</strong> Demarcar perímetro, humectación para evitar resuspensión de polvo, dosimetría personal y EPP respiratorio para operadores.
                      </li>
                      <li>
                        <strong>2. Remediación (OIEA TRS 419 / SSG-60):</strong> Remoción selectiva de suelos o sedimentos contaminados, estabilización o aislamiento según caracterización.
                      </li>
                      <li>
                        <strong>3. Monitoreo de verificación:</strong> Mapeo radiométrico final en grilla para comprobar retorno a valores de línea base (fondo natural).
                      </li>
                    </ul>
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => advanceRem('area_released')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Verificación Exitosa → Liberar Área
                      </button>
                    </div>
                  </div>
                )}

                {remStep === 'area_released' && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-8 text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-950">
                      Área Liberada para Uso Sin Restricciones
                    </h3>
                    <p className="text-sm text-emerald-900 max-w-xl mx-auto leading-relaxed">
                      Consolidar informe técnico de clausura con mapeo radiométrico post-remediación y cadena de custodia de los residuos NORM retirados.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyDecisionSummary(
                          'Área Liberada para Uso Sin Restricciones',
                          'Consolidar informe de clausura con mapeo post-remediación y cadena de custodia NORM.'
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Acta de Decisión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consideraciones No Radiológicas */}
      <div className="bg-[#0B1320] text-white rounded-xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-amber-400 mb-2">
          Evaluación Integral · Consideraciones No Radiológicas
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          En grandes volúmenes de lodos, cortes y aguas de producción, el riesgo dominante suele ser{' '}
          <strong className="text-white">fisicoquímico y ambiental</strong> (contaminantes tóxicos, metales pesados como bario, plomo o mercurio; hidrocarburos totales; sustancias ácidas; sedimentación, erosión y filtraciones hacia cuerpos de agua) más que el radiológico. Todo plan de gestión NORM debe articularse con el Plan de Manejo Ambiental (PMA) y las autorizaciones ambientales vigentes.
        </p>
      </div>
    </div>
  );
};
