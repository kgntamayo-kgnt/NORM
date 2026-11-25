import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calculator,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Menu,
  Radio,
  RotateCcw,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  Anexo1Row,
  Anexo2Row,
  Anexo3Row,
  FieldHeaderMeta,
  IAEA_GLOSSARY_URL,
  INITIAL_ANEXO1,
  INITIAL_ANEXO2,
  INITIAL_ANEXO3,
  INITIAL_FIELD_META,
  REFERENCE_PDF_PATH,
  ScenarioPreset,
} from './data/normData';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DoseEvaluator } from './components/DoseEvaluator';
import { ProcessMap } from './components/ProcessMap';
import { DecisionTrees } from './components/DecisionTrees';
import { ProtectionAndAlara } from './components/ProtectionAndAlara';
import { FieldRecords } from './components/FieldRecords';
import { GlossaryDrawer } from './components/GlossaryDrawer';

type NavTabId =
  | 'executive'
  | 'evaluator'
  | 'process'
  | 'decisions'
  | 'protection'
  | 'records';

interface NavItem {
  id: NavTabId;
  label: string;
  sectionHint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'executive',
    label: 'Panel Ejecutivo',
    sectionHint: 'Visión Gerencial y Decisiones',
    icon: LayoutDashboard,
  },
  {
    id: 'evaluator',
    label: 'Niveles de Referencia',
    sectionHint: 'Evaluador de Tasa de Dosis',
    icon: Calculator,
  },
  {
    id: 'process',
    label: 'Mapa NORM en Procesos',
    sectionHint: 'Esquema Industrial y Cadenas',
    icon: Layers,
  },
  {
    id: 'decisions',
    label: 'Gestión y Remediación',
    sectionHint: 'Protocolos de Decisión Operativa',
    icon: GitBranch,
  },
  {
    id: 'protection',
    label: 'Protección y ALARA',
    sectionHint: 'Simulador 1/d², Blindaje y EPP',
    icon: ShieldAlert,
  },
  {
    id: 'records',
    label: 'Formatos Digitales',
    sectionHint: 'Anexos 1, 2 y 3 · Exportar CSV',
    icon: FileSpreadsheet,
  },
];

interface ErrorBoundaryState {
  hasError: boolean;
}

class WorkspaceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center space-y-4 my-8">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            Se produjo un inconveniente al renderizar la vista
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Puede restablecer el espacio de trabajo inmediatamente sin perder la referencia técnica.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer vista
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('executive');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('baseline');

  // Shared live state across Executive Dashboard, Evaluator, Process Map, and Records
  const [backgroundReadings, setBackgroundReadings] = useState<number[]>([0.11, 0.12, 0.1, 0.11]);
  const [pointReading, setPointReading] = useState<number>(0.65);
  const [exposureHours, setExposureHours] = useState<number>(200);
  const [radonLevel, setRadonLevel] = useState<number>(180);

  const [fieldMeta, setFieldMeta] = useState<FieldHeaderMeta>(INITIAL_FIELD_META);
  const [anexo1Rows, setAnexo1Rows] = useState<Anexo1Row[]>(INITIAL_ANEXO1);
  const [anexo2Rows, setAnexo2Rows] = useState<Anexo2Row[]>(INITIAL_ANEXO2);
  const [anexo3Rows, setAnexo3Rows] = useState<Anexo3Row[]>(INITIAL_ANEXO3);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const avgBackground = useMemo(() => {
    const valid = backgroundReadings.map(Number).filter((n) => !isNaN(n) && n >= 0);
    if (valid.length === 0) return 0.11;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  }, [backgroundReadings]);

  const handleApplyScenario = (scenario: ScenarioPreset) => {
    setActiveScenarioId(scenario.id);
    setPointReading(scenario.pointReading);
    setExposureHours(scenario.exposureHours);
    setRadonLevel(scenario.radonLevel);
    setAnexo2Rows(scenario.anexo2.map((r) => ({ ...r })));
    setAnexo3Rows(scenario.anexo3.map((r) => ({ ...r })));
    showToast(`Escenario cargado: ${scenario.name}`);
  };

  const handleAddPointToAnexo2 = (desc: string, measured: number, obs: string) => {
    const nextCode = `PI-${String(anexo2Rows.length + 1).padStart(2, '0')}`;
    setAnexo2Rows((prev) => [
      ...prev,
      {
        id: Date.now(),
        code: nextCode,
        desc,
        facilityNodeId: 'separators',
        measured,
        obs,
      },
    ]);
    showToast(`${nextCode} agregado al Anexo 2 y sincronizado con el Panel Ejecutivo.`);
  };

  const handleInspectPoint = (measured: number) => {
    setPointReading(measured);
    setActiveTab('evaluator');
  };

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  const handleSelectTab = (id: NavTabId) => {
    setActiveTab(id);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#F4F6F9] text-slate-900">
      {/* NOTIFICACIÓN FLOTANTE */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-[#0B1320] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-fade-slide no-print"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR FIJA DESKTOP (260px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:shrink-0 bg-[#0B1320] text-slate-100 border-r border-slate-800 sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base font-bold tracking-tight text-white truncate">
              NORM <span className="text-amber-400">Oil & Gas</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Vigilancia Radiológica
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  active
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    active ? 'text-amber-400 scale-105' : 'text-slate-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm leading-tight truncate">{item.label}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {item.sectionHint}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Reference Box + Attribution in Sidebar */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Exención OIEA U/Th</span>
              <span className="font-mono text-slate-200">1 Bq/g</span>
            </div>
            <div className="flex justify-between">
              <span>Exención OIEA ⁴⁰K</span>
              <span className="font-mono text-slate-200">10 Bq/g</span>
            </div>
            <div className="flex justify-between">
              <span>Límite ²²²Radón</span>
              <span className="font-mono text-slate-200">1,000 Bq/m³</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400">Desarrollado por</div>
            <div className="text-xs font-semibold text-amber-400 mt-0.5">
              Karel Giovanny Nuñez
            </div>
          </div>
        </div>
      </aside>

      {/* DRAWER MÓVIL */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] lg:hidden no-print"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#0B1320] text-white flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">NORM Oil & Gas Hub</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm ${
                      active
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'text-slate-400'}`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 block">Desarrollado por</span>
              <span className="font-semibold text-amber-400">Karel Giovanny Nuñez</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR CONTRACT: 1 fila limpia con breadcrumb a la izquierda y 1 acción primaria a la derecha */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Abrir navegación"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-semibold text-slate-400 hidden sm:inline whitespace-nowrap">
                NORM Hub
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-bold text-slate-900 truncate">{currentNav.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setGlossaryOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              Glosario OIEA
            </button>
          </div>
        </header>

        {/* VIEWPORT DE CONTENIDO */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <WorkspaceErrorBoundary key={activeTab}>
            {activeTab === 'executive' && (
              <ExecutiveDashboard
                avgBackground={avgBackground}
                radonLevel={radonLevel}
                anexo2Rows={anexo2Rows}
                anexo3Rows={anexo3Rows}
                activeScenarioId={activeScenarioId}
                onApplyScenario={handleApplyScenario}
                onNavigate={(tab) => handleSelectTab(tab as NavTabId)}
                onInspectPoint={handleInspectPoint}
              />
            )}

            {activeTab === 'evaluator' && (
              <DoseEvaluator
                backgroundReadings={backgroundReadings}
                setBackgroundReadings={setBackgroundReadings}
                avgBackground={avgBackground}
                pointReading={pointReading}
                setPointReading={setPointReading}
                exposureHours={exposureHours}
                setExposureHours={setExposureHours}
                radonLevel={radonLevel}
                setRadonLevel={setRadonLevel}
                onAddPointToAnexo2={handleAddPointToAnexo2}
              />
            )}

            {activeTab === 'process' && (
              <ProcessMap anexo2Rows={anexo2Rows} avgBackground={avgBackground} />
            )}

            {activeTab === 'decisions' && <DecisionTrees onShowToast={showToast} />}

            {activeTab === 'protection' && (
              <ProtectionAndAlara baseSourceRate={Math.max(2.5, pointReading)} />
            )}

            {activeTab === 'records' && (
              <FieldRecords
                avgBackground={avgBackground}
                fieldMeta={fieldMeta}
                setFieldMeta={setFieldMeta}
                anexo1Rows={anexo1Rows}
                setAnexo1Rows={setAnexo1Rows}
                anexo2Rows={anexo2Rows}
                setAnexo2Rows={setAnexo2Rows}
                anexo3Rows={anexo3Rows}
                setAnexo3Rows={setAnexo3Rows}
                onShowToast={showToast}
              />
            )}
          </WorkspaceErrorBoundary>
        </main>

        {/* FOOTER INSTITUCIONAL Y CRÉDITO DE AUTORÍA */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-4 mt-8">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
              <span>
                Base normativa: MME 2021 · OIEA GSR Part 3, SSG-60, TRS 419 · IOGP Report 412.
              </span>
              <a
                href={IAEA_GLOSSARY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-medium"
              >
                Glosario OIEA
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={REFERENCE_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
              >
                <FileText className="w-3 h-3" />
                Guía Técnica MME 2021 (PDF)
              </a>
            </div>
            <div className="font-semibold text-slate-800 whitespace-nowrap">
              Desarrollado por Karel Giovanny Nuñez
            </div>
          </div>
        </footer>
      </div>

      {/* DRAWER DE GLOSARIO */}
      <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}
