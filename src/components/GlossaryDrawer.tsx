import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, FileText, Search, X } from 'lucide-react';
import { GLOSSARY_TERMS, IAEA_GLOSSARY_URL, REFERENCE_PDF_PATH } from '../data/normData';

interface GlossaryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({ open, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(GLOSSARY_TERMS.map((g) => g.category)));
    return ['Todas', ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((item) => {
      if (selectedCategory !== 'Todas' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.def.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCategory]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px] flex justify-end no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Glosario Técnico NORM y Radioprotección"
    >
      <div
        className="w-full max-w-lg bg-white h-full border-l border-slate-200 flex flex-col shadow-2xl animate-fade-slide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-[#0B1320] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-sm font-semibold tracking-tight truncate">
              Glosario Técnico y Regulatorio ({GLOSSARY_TERMS.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
            aria-label="Cerrar glosario"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Enlace oficial al Glosario OIEA */}
        <div className="px-4 py-3 bg-sky-50 border-b border-sky-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-sky-950">
              Glosario Oficial del OIEA (IAEA)
            </div>
            <p className="text-[11px] text-sky-800 leading-snug mt-0.5">
              Consulta la publicación completa de Seguridad Nuclear, Tecnológica y Física del OIEA.
            </p>
          </div>
          <a
            href={IAEA_GLOSSARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Abrir OIEA
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar término (ej. Radiobarita, ALARA, Becquerel, RVR)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600/30 focus:border-sky-600"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-slate-200">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No se encontraron términos para “{search}”.
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.term} className="py-3.5">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900">{item.term}</h3>
                  <span className="text-[11px] text-slate-500 shrink-0">{item.category}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.def}</p>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <a
            href={IAEA_GLOSSARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-sky-700 hover:text-sky-900"
          >
            Glosario OIEA (IAEA)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={REFERENCE_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Documento Base MME (PDF)
          </a>
        </div>
      </div>
    </div>
  );
};
