export type RiskTier = 'normal' | 'investigacion' | 'intervencion' | 'actuacion';

export const IAEA_GLOSSARY_URL =
  'https://www.iaea.org/es/publications/15649/glosario-de-seguridad-nuclear-tecnologica-y-fisica-del-oiea';

export const REFERENCE_PDF_PATH =
  '/assets/aistudio/30._Criterios_de_vigilancia_radiol_gica_MME_2021_3acd7ec2.pdf';

export interface RadionuclideInfo {
  symbol: string;
  name: string;
  chain: string;
  chainGroup: 'U238' | 'Th232' | 'K40';
  halfLife: string;
  decay: string;
  exemption: string;
  exemptionValue: number;
  productNote: string;
  appearance: string;
}

export interface DecayChainNode {
  symbol: string;
  name: string;
  halfLife: string;
  nextDecay?: 'α' | 'β';
  stable?: boolean;
  highlight?: string;
}

export interface RockConcentrationRow {
  rockType: string;
  k40Percent: string;
  k40BqG: number;
  th232Ppm: string;
  th232BqG: number;
  u238Ppm: string;
  u238BqG: number;
}

export interface EnvironmentalMatrixInfo {
  matrix: 'Sólida' | 'Líquida' | 'Aire';
  appliesTo: string[];
  radionuclides: string[];
  unit: string;
  note: string;
}

export interface FacilityNode {
  id: string;
  shortTitle: string;
  title: string;
  stage: string;
  stageCategory: 'Upstream' | 'Midstream' | 'Clausura';
  matrix: string;
  form: string;
  radionuclides: string[];
  emitters: ('α' | 'β' | 'γ')[];
  activityRange: string;
  maxActivityBqG: number;
  exposurePath: string;
  monitoring: string;
  controls: string;
  executiveNote: string;
}

export interface GlossaryItem {
  term: string;
  category: string;
  def: string;
}

export interface RadiationShieldingInfo {
  type: string;
  symbol: 'α' | 'β' | 'γ';
  nature: string;
  range: string;
  hazard: string;
  shielding: string;
  penetrationLevel: 1 | 2 | 3;
}

export interface TrainingProfile {
  id: string;
  profile: string;
  audience: string;
  topics: string[];
}

export interface Anexo1Row {
  id: number;
  point: string;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  obs: string;
}

export interface Anexo2Row {
  id: number;
  code: string;
  desc: string;
  facilityNodeId: string;
  measured: number;
  obs: string;
}

export interface Anexo3Row {
  id: number;
  date: string;
  worker: string;
  role: string;
  activity: string;
  hours: number;
  dose: number; // µSv
}

export interface FieldHeaderMeta {
  date: string;
  time: string;
  performedBy: string;
  detectorType: 'Intensímetro' | 'Monitor de contaminación';
  detectorSerial: string;
  calibrationExpiry: string;
  activityDesc: string;
}

export interface DoseClassification {
  tier: RiskTier;
  shortLabel: string;
  level: string;
  urgency: string;
  owner: string;
  colorHex: string;
  bgSurface: string;
  borderClass: string;
  textClass: string;
  summary: string;
  executiveDirective: string;
  actions: string[];
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  pointReading: number;
  exposureHours: number;
  radonLevel: number;
  anexo2: Anexo2Row[];
  anexo3: Anexo3Row[];
}

export const ROCK_CONCENTRATIONS: RockConcentrationRow[] = [
  {
    rockType: 'Rocas Detríticas (general)',
    k40Percent: '2.1% (0.01–9.7)',
    k40BqG: 0.7,
    th232Ppm: '12.4 (0.2–362)',
    th232BqG: 0.05,
    u238Ppm: '4.8 (0.01–9.7)',
    u238BqG: 0.06,
  },
  {
    rockType: 'Arenitas, conglomerados y arcosas',
    k40Percent: '1.2% (0.1–8.5)',
    k40BqG: 0.4,
    th232Ppm: '9.7 (0.7–227)',
    th232BqG: 0.04,
    u238Ppm: '4.1 (0.1–62)',
    u238BqG: 0.05,
  },
  {
    rockType: 'Lodolitas y Lutitas (Shale)',
    k40Percent: '3.5% (0.9–8.5)',
    k40BqG: 1.1,
    th232Ppm: '16.3 (5.3–39)',
    th232BqG: 0.07,
    u238Ppm: '5.9 (0.9–80)',
    u238BqG: 0.07,
  },
  {
    rockType: 'Rocas de precipitación química',
    k40Percent: '0.6% (0.01–3.5)',
    k40BqG: 0.2,
    th232Ppm: '14.9 (0.03–132)',
    th232BqG: 0.06,
    u238Ppm: '3.6 (0.03–27)',
    u238BqG: 0.04,
  },
  {
    rockType: 'Calizas (general)',
    k40Percent: '0.3% (0.01–3.5)',
    k40BqG: 0.09,
    th232Ppm: '1.8 (0–11)',
    th232BqG: 0.007,
    u238Ppm: '2.0 (0.03–18)',
    u238BqG: 0.02,
  },
  {
    rockType: 'Evaporitas (general)',
    k40Percent: 'Trazas',
    k40BqG: 0.01,
    th232Ppm: 'Trazas',
    th232BqG: 0.001,
    u238Ppm: '< 0.1',
    u238BqG: 0.001,
  },
];

export const DECAY_CHAIN_U238: DecayChainNode[] = [
  { symbol: '²³⁸U', name: 'Uranio-238', halfLife: '4.45×10⁹ a', nextDecay: 'α', highlight: 'Padre en roca reservorio (lutitas)' },
  { symbol: '²³⁴Th', name: 'Torio-234', halfLife: '24 días', nextDecay: 'β' },
  { symbol: '²³⁴ᵐPa', name: 'Protactinio-234m', halfLife: '1.2 min', nextDecay: 'β' },
  { symbol: '²³⁴U', name: 'Uranio-234', halfLife: '2.45×10⁵ a', nextDecay: 'α' },
  { symbol: '²³⁰Th', name: 'Torio-230', halfLife: '75,000 a', nextDecay: 'α' },
  { symbol: '²²⁶Ra', name: 'Radio-226', halfLife: '1,600 a', nextDecay: 'α', highlight: 'Crítico en incrustaciones de radiobarita y aguas' },
  { symbol: '²²²Rn', name: 'Radón-222', halfLife: '3.82 días', nextDecay: 'α', highlight: 'Gas noble móvil en gas natural y tanques cerrados' },
  { symbol: '²¹⁸Po', name: 'Polonio-218', halfLife: '3.1 min', nextDecay: 'α' },
  { symbol: '²¹⁴Pb', name: 'Plomo-214', halfLife: '27 min', nextDecay: 'β' },
  { symbol: '²¹⁴Bi', name: 'Bismuto-214', halfLife: '20 min', nextDecay: 'β', highlight: 'Fuerte emisor gamma en escamas de tubería' },
  { symbol: '²¹⁴Po', name: 'Polonio-214', halfLife: '160 µs', nextDecay: 'α' },
  { symbol: '²¹⁰Pb', name: 'Plomo-210', halfLife: '22.2 a', nextDecay: 'β', highlight: 'Forma películas persistentes en líneas de gas' },
  { symbol: '²¹⁰Bi', name: 'Bismuto-210', halfLife: '5 días', nextDecay: 'β' },
  { symbol: '²¹⁰Po', name: 'Polonio-210', halfLife: '138.4 días', nextDecay: 'α', highlight: 'Emisor alfa puro de alta toxicidad en películas y lodos' },
  { symbol: '²⁰⁶Pb', name: 'Plomo-206', halfLife: 'Estable', stable: true, highlight: 'Elemento final estable de la serie' },
];

export const DECAY_CHAIN_TH232: DecayChainNode[] = [
  { symbol: '²³²Th', name: 'Torio-232', halfLife: '1.4×10¹⁰ a', nextDecay: 'α', highlight: 'Padre de baja solubilidad en formaciones detríticas' },
  { symbol: '²²⁸Ra', name: 'Radio-228', halfLife: '5.75 a', nextDecay: 'β', highlight: 'Soluble en agua de formación; precipita en incrustaciones' },
  { symbol: '²²⁸Ac', name: 'Actinio-228', halfLife: '6.1 h', nextDecay: 'β', highlight: 'Emisor gamma relevante en equipos de producción' },
  { symbol: '²²⁸Th', name: 'Torio-228', halfLife: '1.91 a', nextDecay: 'α' },
  { symbol: '²²⁴Ra', name: 'Radio-224', halfLife: '3.63 días', nextDecay: 'α', highlight: 'Presente en aguas de producción y lodos recientes' },
  { symbol: '²²⁰Rn', name: 'Torón (Rn-220)', halfLife: '55 s', nextDecay: 'α', highlight: 'Semidesintegración muy corta (~1 min)' },
  { symbol: '²¹⁶Po', name: 'Polonio-216', halfLife: '0.14 s', nextDecay: 'α' },
  { symbol: '²¹²Pb', name: 'Plomo-212', halfLife: '10.6 h', nextDecay: 'β' },
  { symbol: '²¹²Bi', name: 'Bismuto-212', halfLife: '60.5 min', nextDecay: 'β' },
  { symbol: '²⁰⁸Tl', name: 'Talio-208', halfLife: '3.1 min', nextDecay: 'β', highlight: 'Emisor gamma de alta energía en radiobarita' },
  { symbol: '²⁰⁸Pb', name: 'Plomo-208', halfLife: 'Estable', stable: true, highlight: 'Elemento final estable de la serie' },
];

export const ENVIRONMENTAL_MATRICES: EnvironmentalMatrixInfo[] = [
  {
    matrix: 'Sólida',
    appliesTo: ['Sedimento', 'Roca', 'Suelo'],
    radionuclides: ['²³⁸U', '²³²Th', '⁴⁰K', '²²⁶Ra', '²²⁸Ra', '²¹⁰Pb'],
    unit: 'Bq/g',
    note: 'Caracterización radiométrica en laboratorio acreditado (Servicio Geológico Colombiano) con cadena de custodia.',
  },
  {
    matrix: 'Líquida',
    appliesTo: ['Aguas superficiales', 'Aguas subterráneas', 'Agua de producción'],
    radionuclides: ['²²²Rn', '²²⁴Ra', '²²⁶Ra', '²²⁸Ra', '²¹⁰Pb'],
    unit: 'Bq/L',
    note: 'Los primigenios ²³⁸U y ²³²Th tienen baja solubilidad; predominan los cationes del grupo II como el Radio.',
  },
  {
    matrix: 'Aire',
    appliesTo: ['Aire ambiente', 'Espacios cerrados / tanques'],
    radionuclides: ['²²²Rn', 'Progenie (²¹⁸Po, ²¹⁴Po)'],
    unit: 'Bq/m³',
    note: 'Evaluar mediante detectores pasivos de carbón activado, trazas nucleares o monitoreo continuo activo.',
  },
];

export const RADIONUCLIDES_DB: RadionuclideInfo[] = [
  {
    symbol: '²³⁸U',
    name: 'Uranio-238',
    chain: 'Serie del Uranio',
    chainGroup: 'U238',
    halfLife: '4.45 × 10⁹ años',
    decay: 'Alfa (α)',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Padre de cadena',
    appearance: 'Baja solubilidad en agua; se transporta por arrastre mecánico de lutitas/lodolitas y cortes de perforación.',
  },
  {
    symbol: '²³²Th',
    name: 'Torio-232',
    chain: 'Serie del Torio',
    chainGroup: 'Th232',
    halfLife: '1.40 × 10¹⁰ años',
    decay: 'Alfa (α)',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Padre de cadena',
    appearance: 'Baja solubilidad; presente en formaciones detríticas, lodolitas y ripios de perforación.',
  },
  {
    symbol: '⁴⁰K',
    name: 'Potasio-40',
    chain: 'Primigenio (No cadena)',
    chainGroup: 'K40',
    halfLife: '1.24 × 10⁹ años',
    decay: 'Beta-Gamma (β, γ)',
    exemption: '10 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 10,
    productNote: 'Decae a ⁴⁰Ca y ⁴⁰Ar estables',
    appearance: 'Amplia presencia en lutitas, arcillas y lodos base agua; aporta de forma importante al fondo natural.',
  },
  {
    symbol: '²²⁶Ra',
    name: 'Radio-226',
    chain: 'Serie del ²³⁸U',
    chainGroup: 'U238',
    halfLife: '1,600 años',
    decay: 'Alfa (α) + progenie γ',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Genera ²²²Rn (gas noble)',
    appearance: 'Soluble en agua de formación; precipita como radiobarita [Ba(Ra)SO₄] en tuberías, bombas, separadores y lodos.',
  },
  {
    symbol: '²²⁸Ra',
    name: 'Radio-228',
    chain: 'Serie del ²³²Th',
    chainGroup: 'Th232',
    halfLife: '5.75 años',
    decay: 'Beta (β) + progenie γ',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Genera ²²⁸Th emisor alfa',
    appearance: 'Incrustaciones en tuberías, cabezales de pozo, bombas, separadores y aguas de producción.',
  },
  {
    symbol: '²²⁴Ra',
    name: 'Radio-224',
    chain: 'Serie del ²³²Th',
    chainGroup: 'Th232',
    halfLife: '3.63 días',
    decay: 'Alfa (α)',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Genera ²²⁰Rn (Torón)',
    appearance: 'Presente en aguas de producción, fluidos de retorno e incrustaciones frescas de pozos productores.',
  },
  {
    symbol: '²²²Rn',
    name: 'Radón-222',
    chain: 'Serie del ²³⁸U (Hijo ²²⁶Ra)',
    chainGroup: 'U238',
    halfLife: '3.82 días',
    decay: 'Alfa (α)',
    exemption: 'Ref: 1,000 Bq/m³ (Res. 18 1434)',
    exemptionValue: 1,
    productNote: 'Genera ²¹⁸Po y aerosoles',
    appearance: 'Gas noble móvil en corrientes de gas natural y espacios confinados/tanques cerrados sin ventilación.',
  },
  {
    symbol: '²¹⁰Pb',
    name: 'Plomo-210',
    chain: 'Serie del ²³⁸U (Hijo ²²²Rn)',
    chainGroup: 'U238',
    halfLife: '22.20 años',
    decay: 'Beta (β)',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Genera ²¹⁰Po emisor alfa',
    appearance: 'Aerosoles finos (0.05–2 µm) que forman películas delgadas en líneas de gas, bombas y unidades de licuefacción.',
  },
  {
    symbol: '²¹⁰Po',
    name: 'Polonio-210',
    chain: 'Serie del ²³⁸U (Hijo ²¹⁰Pb)',
    chainGroup: 'U238',
    halfLife: '138.37 días',
    decay: 'Alfa puro (α)',
    exemption: '1 Bq/g (OIEA GSR Part 3)',
    exemptionValue: 1,
    productNote: 'Decae a ²⁰⁶Pb estable',
    appearance: 'Alta radiotoxicidad interna; presente en películas de equipos de gas y lodos (hasta 1,300 Bq/g reportados).',
  },
];

export const FACILITY_NODES: FacilityNode[] = [
  {
    id: 'wellhead',
    shortTitle: 'Boca de Pozo',
    title: '1. Boca de Pozo y Árbol de Navidad',
    stage: 'Upstream · Extracción',
    stageCategory: 'Upstream',
    matrix: 'Sólida (Incrustación) / Fluido multifásico',
    form: 'Incrustaciones de Radiobarita y Carbonatos',
    radionuclides: ['²²⁶Ra', '²²⁸Ra', '²²⁴Ra', '²²²Rn'],
    emitters: ['α', 'γ'],
    activityRange: '0.1 – 15,000 Bq/g en incrustaciones',
    maxActivityBqG: 15000,
    exposurePath: 'Irradiación externa gamma (cercanía a válvulas, chokes y líneas de flujo).',
    monitoring: 'Intensímetro intrínsecamente seguro a 30 cm de superficie; inspección previa a intervención de subsuelo.',
    controls: 'Control de tiempos de permanencia, inhibidores de incrustación in situ, señalización si supera nivel de intervención.',
    executiveNote: 'La caída de presión y temperatura cerca de superficie induce cristalización de radiobarita. Dosificar inhibidores reduce significativamente los costos de mantenimiento.',
  },
  {
    id: 'separators',
    shortTitle: 'Separadores',
    title: '2. Separadores Trifásicos y Tratadores',
    stage: 'Upstream · Facilidades',
    stageCategory: 'Upstream',
    matrix: 'Líquida / Lodos / Incrustaciones',
    form: 'Lodos de fondo (arenas, arcillas, parafinas) y escamas',
    radionuclides: ['²²⁶Ra', '²²⁸Ra', '²²⁴Ra', '²¹⁰Pb', '²¹⁰Po'],
    emitters: ['α', 'β', 'γ'],
    activityRange: 'Hasta 1,300 Bq/g en lodos; >10,000 Bq/g en escamas',
    maxActivityBqG: 10000,
    exposurePath: 'Irradiación externa en operación; exposición interna (inhalación/contacto) en apertura y limpieza.',
    monitoring: 'Perfilaje gamma externo antes de parada de planta; monitor de contaminación superficial (Bq/cm²) al abrir.',
    controls: 'Ventilación forzada previa al ingreso, EPP respiratorio HEPA, trajes Tyvek y contención húmeda de lodos.',
    executiveNote: 'Punto crítico en paradas de planta: planificar la gestión de lodos y escamas NORM antes de autorizar la apertura del recipiente.',
  },
  {
    id: 'tanks',
    shortTitle: 'Tanques y Agua',
    title: '3. Tanques, Agua de Producción y Retorno',
    stage: 'Upstream / Midstream',
    stageCategory: 'Midstream',
    matrix: 'Líquida (Salmueras) / Gaseosa (Espacio cabeza)',
    form: 'Cationes disueltos (Ca, Sr, Ba, Ra) y acumulación de ²²²Rn',
    radionuclides: ['²²⁶Ra', '²²⁸Ra', '²²⁴Ra', '²¹⁰Pb', '²²²Rn'],
    emitters: ['α', 'γ'],
    activityRange: '0.1 – 100 Bq/L (agua); hasta 200,000 Bq/m³ (²²²Rn)',
    maxActivityBqG: 100,
    exposurePath: 'Inhalación de ²²²Rn y aerosoles en lugares cerrados sin ventilación; radiación gamma en sedimentos de fondo.',
    monitoring: 'Medidor continuo o pasivo de Radón en espacios cerrados; caracterización en laboratorio para agua y sedimentos.',
    controls: 'Sistemas de ventilación en almacenamiento cerrado; monitoreos posteriores a descargas; prohibición de comer, beber o fumar.',
    executiveNote: 'Priorizar telemetría de nivel y ventilación mecánica en tanques cerrados para mantener ²²²Rn por debajo de 1,000 Bq/m³.',
  },
  {
    id: 'gaslines',
    shortTitle: 'Líneas de Gas',
    title: '4. Líneas de Gas y Fraccionamiento',
    stage: 'Midstream / Downstream',
    stageCategory: 'Midstream',
    matrix: 'Gaseosa / Superficial (Películas finas)',
    form: 'Películas invisibles por decaimiento de Radón (²¹⁰Pb / ²¹⁰Po)',
    radionuclides: ['²²²Rn', '²¹⁰Pb', '²¹⁰Bi', '²¹⁰Po'],
    emitters: ['α', 'β'],
    activityRange: '0.1 – 100 Bq/cm² en paredes internas',
    maxActivityBqG: 450,
    exposurePath: 'Exposición interna crítica (emisores alfa/beta) al cortar, esmerilar o intervenir tuberías y unidades de licuefacción.',
    monitoring: 'Monitor de contaminación superficial Alfa/Beta (Bq/cm² o CPS) y frotis superficiales (smear test) validados en laboratorio.',
    controls: 'Prohibido corte en caliente o pulido en seco sin extracción HEPA; mascarilla P100/HEPA y doble guante de nitrilo.',
    executiveNote: 'Riesgo silencioso: los intensímetros gamma estándar NO detectan ²¹⁰Po puro. Exigir monitoreo Alfa/Beta antes de intervenciones invasivas.',
  },
  {
    id: 'pits',
    shortTitle: 'Piscinas y Patios',
    title: '5. Piscinas de Lodos y Patios de Tubería',
    stage: 'Perforación / Clausura',
    stageCategory: 'Clausura',
    matrix: 'Sólida (Suelos, sedimentos, chatarra tubular)',
    form: 'Ripios de lutitas, lodos deshidratados y tubería almacenada',
    radionuclides: ['²³⁸U', '²³²Th', '⁴⁰K', '²²⁶Ra', '²¹⁰Pb'],
    emitters: ['α', 'β', 'γ'],
    activityRange: 'Lutitas: 0.05–0.1 Bq/g; tubería con escala: >1 a 3,000 Bq/g',
    maxActivityBqG: 3000,
    exposurePath: 'Dispersión ambiental por escorrentía/polvo; liberación no controlada de chatarra contaminada.',
    monitoring: 'Barrido radiométrico en grilla (intensímetro a 1 m y 30 cm); muestreo compuesto de suelo/sedimento con cadena de custodia.',
    controls: 'Tapones herméticos y embalaje en tubería contaminada, impermeabilización y evaluación conjunta de riesgos fisicoquímicos.',
    executiveNote: 'Riesgo legal y ambiental: prohibida la venta o disposición de chatarra tubular sin certificado de liberación firmado por el RVR.',
  },
];

export const IOGP_BENCHMARK_DATA = [
  { name: 'Incrustaciones (Radiobarita)', maxBqG: 15000, logVal: Math.log10(15000), refLabel: 'Hasta 15,000 Bq/g', critical: true },
  { name: 'Lodos de Separadores', maxBqG: 1300, logVal: Math.log10(1300), refLabel: 'Hasta 1,300 Bq/g (²¹⁰Po / Ra)', critical: true },
  { name: 'Tubería Recuperada (Escala)', maxBqG: 800, logVal: Math.log10(800), refLabel: '1 – 800+ Bq/g', critical: true },
  { name: 'Películas Líneas de Gas', maxBqG: 100, logVal: Math.log10(100), refLabel: '0.1 – 100 Bq/cm²', critical: true },
  { name: 'Exención OIEA (U/Th)', maxBqG: 1, logVal: 0, refLabel: '1.0 Bq/g (Umbral)', critical: false },
  { name: 'Cortes de Perforación / Lutitas', maxBqG: 0.1, logVal: -1, refLabel: '0.05 – 0.1 Bq/g', critical: false },
];

export const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    term: 'Acción protectora',
    category: 'Intervención',
    def: 'Intervención con el fin de evitar o reducir las dosis a los miembros del público en situaciones de exposición crónica o de emergencia.',
  },
  {
    term: 'Actividad (A)',
    category: 'Magnitudes',
    def: 'Número de desintegraciones nucleares espontáneas que tienen lugar en un radionucleido por unidad de tiempo. Su unidad en el Sistema Internacional es el Becquerel (Bq).',
  },
  {
    term: 'Área de influencia',
    category: 'Gestión Ambiental',
    def: 'Área en la cual se manifiestan de manera objetiva y cuantificable los impactos ambientales significativos ocasionados por la ejecución de un proyecto, obra o actividad sobre los medios abiótico, biótico y socioeconómico.',
  },
  {
    term: 'Área de operaciones',
    category: 'Operaciones',
    def: 'Espacio donde el operador realiza las obras de adecuación, infraestructura, perforación, fracturamiento, depósito de equipos y manejo de insumos, residuos y vehículos del proyecto.',
  },
  {
    term: 'Autoridad reguladora (Órgano regulador)',
    category: 'Regulación',
    def: 'Entidad a la que de conformidad con la legislación vigente le compete la reglamentación en materia de protección y seguridad radiológica. En Colombia esta competencia radica en el Ministerio de Minas y Energía.',
  },
  {
    term: 'Becquerel (Bq)',
    category: 'Magnitudes',
    def: 'Unidad del Sistema Internacional para radiactividad que expresa el número de decaimientos radiactivos por unidad de tiempo: 1 Bq equivale a un decaimiento radiactivo por segundo (s⁻¹).',
  },
  {
    term: 'Contaminación',
    category: 'Seguridad Radiológica',
    def: 'Presencia de sustancias radiactivas sobre superficies, o dentro de sólidos, líquidos o gases (incluido el cuerpo humano), donde tal presencia no es ni intencionada ni deseable.',
  },
  {
    term: 'Contención',
    category: 'Seguridad Radiológica',
    def: 'Métodos o estructuras físicas diseñados para evitar o controlar la emisión y dispersión de sustancias radiactivas.',
  },
  {
    term: 'Descontaminación',
    category: 'Gestión NORM',
    def: 'Eliminación total o parcial de la contaminación mediante la aplicación deliberada de un proceso físico, químico o biológico.',
  },
  {
    term: 'Descontaminación del cuerpo humano',
    category: 'Protección Radiológica',
    def: 'Eliminación de contaminación externa (retiro de ropa en bolsas plásticas, ducha con agua tibia y jabón neutro) o procesos biológicos facilitados para eliminar radionucleidos incorporados.',
  },
  {
    term: 'Dosis efectiva',
    category: 'Dosimetría',
    def: 'Medida de la dosis ideada para reflejar la cuantía del detrimento por radiación que es probable se derive de la dosis recibida. Su unidad en el Sistema Internacional es el Sievert (Sv).',
  },
  {
    term: 'Enfoque Graduado (Graded Approach)',
    category: 'Regulación',
    def: 'Principio del OIEA según el cual el rigor del control regulatorio y de vigilancia debe ser proporcional a la magnitud y probabilidad de las exposiciones radiológicas.',
  },
  {
    term: 'Exposición natural',
    category: 'Fundamentos',
    def: 'Exposición a radiactividad causada por fuentes naturales (radiación cósmica, corteza terrestre o materiales cuya radiactividad se debe únicamente a radionucleidos naturales).',
  },
  {
    term: 'Fondo natural (Natural Background)',
    category: 'Vigilancia',
    def: 'Dosis, tasas de dosis o concentraciones de actividad asociadas a fuentes naturales existentes en el ambiente que no son susceptibles de control. Típicamente oscila entre 0.05 y 0.20 µSv/h.',
  },
  {
    term: 'Isótopo',
    category: 'Fundamentos',
    def: 'Grupo de elementos químicos con igual número de protones (misma identidad química) y diferente número de neutrones en sus núcleos, lo que otorga variaciones de masa a cada átomo.',
  },
  {
    term: 'Nivel de referencia',
    category: 'Vigilancia',
    def: 'Nivel de dosis, riesgo o concentración de actividad por encima del cual no es apropiado hacer planes para permitir exposiciones y por debajo del cual se continúa aplicando la optimización de la protección y seguridad.',
  },
  {
    term: 'NORM',
    category: 'Fundamentos',
    def: 'Materiales Radiactivos de Origen Natural (Naturally Occurring Radioactive Material) presentes en la naturaleza cuyos radionucleidos (²³⁸U, ²³²Th, ⁴⁰K) pueden concentrarse por procesos industriales como petróleo y gas.',
  },
  {
    term: 'Principio ALARA',
    category: 'Protección Radiológica',
    def: 'Acrónimo de "As Low As Reasonably Achievable" (Tan bajo como sea razonablemente alcanzable). Exige optimizar la protección considerando factores económicos y sociales.',
  },
  {
    term: 'Protección radiológica',
    category: 'Protección Radiológica',
    def: 'Protección contra los efectos nocivos de la exposición a la radiación ionizante y los medios técnicos y operativos para conseguir dicha protección.',
  },
  {
    term: 'Radiación ionizante',
    category: 'Fundamentos',
    def: 'Para efectos de protección radiológica, radiación capaz de producir pares de iones en materia(s) biológica(s).',
  },
  {
    term: 'Radiobarita',
    category: 'Geoquímica',
    def: 'Sulfato de bario y radio [Ba(Ra)SO₄] que cristaliza formando incrustaciones duras en paredes internas de tuberías, válvulas y separadores al descender la presión y temperatura.',
  },
  {
    term: 'Radionucleido',
    category: 'Fundamentos',
    def: 'Elemento inestable que libera radiación ionizante mediante decaimiento radiactivo espontáneo.',
  },
  {
    term: 'Reglamento de protección y seguridad radiológica',
    category: 'Regulación',
    def: 'Requisitos y condiciones mínimas adoptados en Colombia mediante la Resolución No. 18 1434 de 2002 del Ministerio de Minas y Energía para proteger a las personas y el ambiente contra la radiación ionizante.',
  },
  {
    term: 'Responsable de la vigilancia radiológica (RVR)',
    category: 'Gobernanza',
    def: 'Profesional técnicamente competente en protección radiológica encargado de supervisar los criterios de vigilancia, validar calibraciones, investigar anomalías y firmar liberaciones.',
  },
  {
    term: 'Sievert (Sv)',
    category: 'Magnitudes',
    def: 'Unidad de dosis equivalente y dosis efectiva en el Sistema Internacional (1 Sv = 1 J/kg). En vigilancia operacional se utilizan submúltiplos como mSv y µSv.',
  },
  {
    term: 'Vigilancia radiológica (Monitoreo radiológico)',
    category: 'Vigilancia',
    def: 'Medición de la exposición, la dosis o la contaminación con fines de evaluación o control de la exposición a radiación o sustancias radiactivas e interpretación de los resultados.',
  },
];

export const RADIATION_SHIELDING: RadiationShieldingInfo[] = [
  {
    type: 'Alfa (α)',
    symbol: 'α',
    nature: 'Partículas cargadas compuestas por 2 protones y 2 neutrones (núcleos de Helio). Altamente energéticas, muy baja penetración.',
    range: '~2 cm en aire; < 0.001 cm en tejido humano (detenida por piel intacta o una hoja de papel).',
    hazard: 'Exposición INTERNA (inhalación, ingestión o heridas). Mayor riesgo biológico interno.',
    shielding: 'No requiere blindaje estructural. El control es contención, ventilación y EPP respiratorio/dérmico.',
    penetrationLevel: 1,
  },
  {
    type: 'Beta (β)',
    symbol: 'β',
    nature: 'Emisión de electrones o positrones producto de la transformación nuclear de un protón en neutrón o viceversa.',
    range: 'Varios metros en aire; 1 a 2 cm en tejido vivo (riesgo para piel y cristalino).',
    hazard: 'Irradiación externa superficial y exposición interna.',
    shielding: 'Materiales de bajo número atómico (Z) y baja densidad: plástico, madera o acrílicos.',
    penetrationLevel: 2,
  },
  {
    type: 'Gamma (γ)',
    symbol: 'γ',
    nature: 'Emisión de fotones electromagnéticos de alta energía (acompañan generalmente a los decaimientos alfa y beta).',
    range: 'Varios metros en aire; atraviesa el cuerpo humano y distintos materiales estructurales.',
    hazard: 'Irradiación EXTERNA de cuerpo entero (principal preocupación en tanques, separadores y tuberías con incrustaciones).',
    shielding: 'Materiales de alto número atómico (Z) y alta densidad: plomo, acero grueso o concreto.',
    penetrationLevel: 3,
  },
];

export const TRAINING_PROFILES: TrainingProfile[] = [
  {
    id: 'exposed',
    profile: 'Personal en áreas con exposición natural significativa',
    audience: 'Operadores de campo, mantenimiento y contratistas',
    topics: [
      'Naturaleza de los radionucleidos de origen natural en hidrocarburos.',
      'Formas de exposición externa e interna (lodos, incrustaciones, películas y radón).',
      'Riesgos biológicos asociados a la radiación ionizante.',
      'Principios operativos de protección radiológica (tiempo, distancia, blindaje e higiene).',
      'Nociones de respuesta ante incidentes y descontaminación básica.',
    ],
  },
  {
    id: 'sampling',
    profile: 'Personal de muestreos y monitoreos en campo',
    audience: 'Técnicos HSE, inspectores y equipos de muestreo ambiental',
    topics: [
      'Todos los fundamentos de exposición natural y protección radiológica.',
      'Operatividad, verificación de calibración y mantenimiento de detectores.',
      'Protocolos de fondo natural y mediciones a 30 cm en puntos de interés.',
      'Registros digitales y formatos de trazabilidad de campo.',
      'Procedimientos de muestreo por matriz (sólida, líquida, aire), conservación y cadena de custodia.',
    ],
  },
  {
    id: 'rvr',
    profile: 'Responsables de Vigilancia Radiológica (RVR)',
    audience: 'Profesionales designados para dirección técnica y cumplimiento',
    topics: [
      'Dominio integral de los ejes de monitoreo, muestreo y normativa vigente.',
      'Criterios dosimétricos y gestión de niveles de referencia (Investigación, Intervención, Actuación).',
      'Técnicas de descontaminación de equipos, remediación de áreas y descontaminación humana.',
      'Estrategias de gestión de materiales/residuos NORM y riesgos no radiológicos.',
      'Consolidación de reportes regulatorios y comunicación con grupos de interés.',
    ],
  },
];

export const INITIAL_FIELD_META: FieldHeaderMeta = {
  date: '2026-11-24',
  time: '08:30',
  performedBy: 'Ing. Carlos Méndez (RVR)',
  detectorType: 'Intensímetro',
  detectorSerial: 'GM-ATEX-2026-041',
  calibrationExpiry: '2027-06-30',
  activityDesc: 'Campaña periódica de vigilancia radiológica en facilidades de producción',
};

export const INITIAL_ANEXO1: Anexo1Row[] = [
  { id: 1, point: 'Perímetro Norte - Zona Libre', m1: 0.11, m2: 0.12, m3: 0.10, m4: 0.11, obs: 'Sin presencia de equipos ni lodos' },
  { id: 2, point: 'Acceso Vía Principal - Punto Control', m1: 0.13, m2: 0.12, m3: 0.14, m4: 0.13, obs: 'Suelo natural arcilloso' },
];

export const INITIAL_ANEXO2: Anexo2Row[] = [
  { id: 1, code: 'PI-01', desc: 'Cabezal de Pozo Productor P-14', facilityNodeId: 'wellhead', measured: 0.18, obs: 'Operación normal' },
  { id: 2, code: 'PI-02', desc: 'Separador Trifásico V-101 (Fondo)', facilityNodeId: 'separators', measured: 0.65, obs: 'Posible acumulación de lodos' },
  { id: 3, code: 'PI-03', desc: 'Patio de Tubería Recuperada (Rack 4)', facilityNodeId: 'pits', measured: 3.40, obs: 'Incrustación detectada en junta' },
  { id: 4, code: 'PI-04', desc: 'Piscina de Agua de Producción', facilityNodeId: 'tanks', measured: 0.15, obs: 'Nivel basal' },
  { id: 5, code: 'PI-05', desc: 'Manifold de Gas y Bomba GLP-02', facilityNodeId: 'gaslines', measured: 0.24, obs: 'Requiere frotis Alfa/Beta en mantenimiento' },
];

export const INITIAL_ANEXO3: Anexo3Row[] = [
  { id: 1, date: '2026-11-20', worker: 'Ing. Carlos Méndez', role: 'OPR / RVR', activity: 'Inspección radiométrica patio tuberías', hours: 3.5, dose: 4.2 },
  { id: 2, date: '2026-11-22', worker: 'Téc. Ana Gómez', role: 'Mantenimiento', activity: 'Apertura y limpieza separador V-101', hours: 6.0, dose: 11.5 },
  { id: 3, date: '2026-11-24', worker: 'Op. Javier Rojas', role: 'Producción', activity: 'Ronda rutinaria cabezales y tanques', hours: 4.0, dose: 1.8 },
];

export const EXECUTIVE_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'baseline',
    name: 'Escenario Actual (Campo Operativo)',
    description: 'Patio de tubería en Nivel de Intervención (3.40 µSv/h) y separador en Investigación.',
    pointReading: 0.65,
    exposureHours: 200,
    radonLevel: 180,
    anexo2: INITIAL_ANEXO2,
    anexo3: INITIAL_ANEXO3,
  },
  {
    id: 'turnaround',
    name: 'Parada de Planta (Limpieza Separador)',
    description: 'Apertura de separador V-101 con escamas de radiobarita (>10 µSv/h) y Radón elevado.',
    pointReading: 12.4,
    exposureHours: 120,
    radonLevel: 1350,
    anexo2: [
      { id: 1, code: 'PI-01', desc: 'Cabezal de Pozo Productor P-14', facilityNodeId: 'wellhead', measured: 0.22, obs: 'Pozo cerrado en parada' },
      { id: 2, code: 'PI-02', desc: 'Separador Trifásico V-101 (Boca de Visita)', facilityNodeId: 'separators', measured: 12.40, obs: 'Escama dura de radiobarita en bafles' },
      { id: 3, code: 'PI-03', desc: 'Patio de Tubería Recuperada (Rack 4)', facilityNodeId: 'pits', measured: 4.10, obs: 'Pendiente encapsulamiento y tapones' },
      { id: 4, code: 'PI-04', desc: 'Tanque Agua de Producción TK-202', facilityNodeId: 'tanks', measured: 0.92, obs: 'Sedimentos en fondo, ventilar antes de ingreso' },
      { id: 5, code: 'PI-05', desc: 'Línea Succión Gas Compresor C-01', facilityNodeId: 'gaslines', measured: 0.48, obs: 'Sospecha película ²¹⁰Pb/²¹⁰Po' },
    ],
    anexo3: [
      { id: 1, date: '2026-11-24', worker: 'Ing. Carlos Méndez', role: 'OPR / RVR', activity: 'Delimitación zona controlada V-101', hours: 4.0, dose: 28.5 },
      { id: 2, date: '2026-11-24', worker: 'Téc. Ana Gómez', role: 'Mantenimiento', activity: 'Hidrojet y remoción húmeda lodos V-101', hours: 8.0, dose: 64.0 },
      { id: 3, date: '2026-11-24', worker: 'Téc. Luis Paredes', role: 'Contratista HSE', activity: 'Embalaje tambores NORM y etiquetado', hours: 5.5, dose: 31.2 },
    ],
  },
  {
    id: 'nominal',
    name: 'Operación Nominal Controlada',
    description: 'Todos los puntos bajo control basal tras campaña exitosa de descontaminación.',
    pointReading: 0.16,
    exposureHours: 180,
    radonLevel: 110,
    anexo2: [
      { id: 1, code: 'PI-01', desc: 'Cabezal de Pozo Productor P-14', facilityNodeId: 'wellhead', measured: 0.15, obs: 'Inhibidor de incrustación activo' },
      { id: 2, code: 'PI-02', desc: 'Separador Trifásico V-101 (Fondo)', facilityNodeId: 'separators', measured: 0.19, obs: 'Post-limpieza verificada' },
      { id: 3, code: 'PI-03', desc: 'Patio de Tubería Liberada', facilityNodeId: 'pits', measured: 0.14, obs: 'Tubería descontaminada con certificado RVR' },
      { id: 4, code: 'PI-04', desc: 'Piscina de Agua de Producción', facilityNodeId: 'tanks', measured: 0.13, obs: 'Nivel basal confirmado' },
      { id: 5, code: 'PI-05', desc: 'Manifold de Gas y Bomba GLP-02', facilityNodeId: 'gaslines', measured: 0.16, obs: 'Frotis negativo (<0.4 Bq/cm²)' },
    ],
    anexo3: [
      { id: 1, date: '2026-11-24', worker: 'Ing. Carlos Méndez', role: 'OPR / RVR', activity: 'Verificación periódica mensual', hours: 2.0, dose: 0.6 },
      { id: 2, date: '2026-11-24', worker: 'Op. Javier Rojas', role: 'Producción', activity: 'Ronda de rutina en estación', hours: 3.0, dose: 0.5 },
    ],
  },
];

export function classifyDoseRate(measured: number, avgBackground: number): DoseClassification {
  const netDoseRate = Math.max(0, measured - avgBackground);
  const ratio = avgBackground > 0 ? measured / avgBackground : 0;

  if (netDoseRate > 10) {
    return {
      tier: 'actuacion',
      shortLabel: 'Actuación',
      level: 'Nivel de Actuación (> 10 µSv/h netos)',
      urgency: 'Inmediata (< 24 h)',
      owner: 'Coordinación Operativa + RVR',
      colorHex: '#DC2626',
      bgSurface: 'bg-red-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-800',
      summary: 'Tasa de dosis neta crítica. Se requieren acciones protectoras y reparadoras inmediatas.',
      executiveDirective: 'Detener acceso no autorizado, activar zona controlada con señalización y aprobar plan de descontaminación o aislamiento inmediato.',
      actions: [
        'Restringir inmediatamente el acceso al área o equipo y colocar señalización reglamentaria de radiación ionizante (trébol radiactivo).',
        'Notificar al Responsable de Vigilancia Radiológica (RVR) para evaluación dosimétrica detallada y plan de intervención.',
        'Implementar controles estrictos de tiempo, distancia y blindaje; uso obligatorio de dosimetría personal de lectura directa (EPD).',
        'Activar el protocolo de descontaminación de equipamiento o el plan de remediación y aislamiento del área.',
      ],
    };
  }

  if (netDoseRate > 2.5) {
    return {
      tier: 'intervencion',
      shortLabel: 'Intervención',
      level: 'Nivel de Intervención Operacional (> 2.5 µSv/h netos)',
      urgency: 'Corto plazo (< 7 días)',
      owner: 'RVR + Jefe Mantenimiento',
      colorHex: '#D97706',
      bgSurface: 'bg-amber-50',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-900',
      summary: 'Supera el umbral operacional. Deben aplicarse medidas protectoras y optimización ALARA.',
      executiveDirective: 'Demarcar preventivamente, programar espectrometría en laboratorio (criterio 1 Bq/g) y asignar presupuesto de EPP y gestión NORM.',
      actions: [
        'Demarcar y señalizar preventivamente la zona o tramo de tubería con presencia de NORM.',
        'Limitar el tiempo de permanencia de los trabajadores y aumentar la distancia de seguridad.',
        'Exigir EPP específico (guantes de nitrilo, protección respiratoria HEPA si hay riesgo de polvo/aerosoles) y dosimetría.',
        'Programar caracterización radiométrica en laboratorio (espectrometría gamma) para verificar criterios de exención/dispensa (1 Bq/g).',
      ],
    };
  }

  if (ratio > 3) {
    return {
      tier: 'investigacion',
      shortLabel: 'Investigación',
      level: 'Nivel de Investigación (> 3× Fondo Natural)',
      urgency: 'Seguimiento (< 30 días)',
      owner: 'Responsable Vigilancia (RVR)',
      colorHex: '#0284C7',
      bgSurface: 'bg-sky-50',
      borderClass: 'border-sky-200',
      textClass: 'text-sky-900',
      summary: 'Lectura superior a 3 veces el fondo natural local. Amerita investigación técnica.',
      executiveDirective: 'Auditar tendencia de incrustación o lodos, aumentar frecuencia de monitoreo y planificar controles antes del próximo mantenimiento.',
      actions: [
        'Reportar la anomalía al Responsable de Vigilancia Radiológica (RVR) para identificar la causa (inicio de incrustaciones o acumulación de lodos).',
        'Incrementar la frecuencia de monitoreo en este punto de interés.',
        'Verificar calibración y vigencia del intensímetro utilizado.',
        'Registrar en el formato de seguimiento (Anexo 2) y evaluar si se proyectan tareas de mantenimiento invasivo.',
      ],
    };
  }

  return {
    tier: 'normal',
    shortLabel: 'Normal',
    level: 'Condición Normal / Fondo Natural',
    urgency: 'Rutinaria',
    owner: 'Operaciones HSE',
    colorHex: '#059669',
    bgSurface: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-emerald-900',
    summary: 'Valores dentro de la variabilidad natural esperada para el área de operación.',
    executiveDirective: 'Mantener cronograma de vigilancia periódica y archivo histórico de línea base para trazabilidad regulatoria.',
    actions: [
      'Continuar con el programa de vigilancia radiológica rutinario según cronograma establecido.',
      'Mantener el registro histórico de línea base para trazabilidad ambiental y ocupacional.',
      'No se requieren restricciones radiológicas adicionales para operación normal.',
    ],
  };
}
