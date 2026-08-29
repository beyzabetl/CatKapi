import React from 'react';
import { Filter, Search, RotateCcw, Sparkles } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { Category } from '../types';

interface UnifiedCategoryFilterProps {
  categories?: Category[];
  selectedMainCategory: string | null;
  setSelectedMainCategory: (cat: string | null) => void;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (sub: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalCount: number;
}

export const UnifiedCategoryFilter: React.FC<UnifiedCategoryFilterProps> = ({
  categories: propCategories,
  selectedMainCategory,
  setSelectedMainCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  searchQuery,
  setSearchQuery,
  totalCount,
}) => {
  const allCategories = (propCategories && propCategories.length > 0 ? propCategories : INITIAL_CATEGORIES);
  const categories = allCategories.filter((c) => c.isActive !== false);

  const activeCategoryObj = categories.find(
    (c) => (c.name || '').trim().toLowerCase() === (selectedMainCategory || '').trim().toLowerCase()
  );

  const handleClearFilters = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(selectedMainCategory || selectedSubCategory || searchQuery.trim());

  return (
    <div id="unified-filter-box" className="space-y-4 mb-8">
      {/* Search & Status Bar */}
      <div className="bg-[#161616] border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2.5 text-stone-300 text-xs font-bold uppercase tracking-wider">
          <Filter size={16} className="text-amber-500 shrink-0" />
          <span>Filtreleme & Arama Paneli ({totalCount} Ürün)</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              id="showroom-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Model adı veya kelime ara..."
              className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-2.5 pl-9 rounded-xl outline-none placeholder-stone-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>

          {hasActiveFilters && (
            <button
              id="clear-all-filters-btn"
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Filtreleri Temizle"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Categories Pills Bar */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-2 min-w-max">
          <button
            id="cat-pill-all"
            onClick={() => {
              setSelectedMainCategory(null);
              setSelectedSubCategory(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !selectedMainCategory
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-extrabold'
                : 'bg-[#161616] text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-850'
            }`}
          >
            <Sparkles size={12} />
            <span>Tüm Koleksiyon</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedMainCategory?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => {
                  setSelectedMainCategory(cat.name);
                  setSelectedSubCategory(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-extrabold'
                    : 'bg-[#161616] text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-850'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories Secondary Bar (if main category selected) */}
      {activeCategoryObj && activeCategoryObj.subCategories?.length > 0 && (
        <div className="bg-[#181818] border border-stone-800/80 rounded-2xl p-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] text-stone-400 font-mono font-bold uppercase tracking-wider shrink-0 mr-1">
              Alt Kategori:
            </span>

            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                !selectedSubCategory
                  ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                  : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
              }`}
            >
              Tümü ({activeCategoryObj.name})
            </button>

            {activeCategoryObj.subCategories
              .filter((sub) => sub.isActive !== false)
              .map((sub) => {
                const isSubSelected =
                  selectedSubCategory?.toLowerCase() === sub.name.toLowerCase();
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.name)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSubSelected
                        ? 'bg-amber-400 text-black shadow-sm font-extrabold'
                        : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
