import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  RotateCcw,
  Check,
  Filter,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryAccordionFilterProps {
  categories: Category[];
  selectedMainCategory: string | null;
  setSelectedMainCategory: (cat: string | null) => void;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (sub: string | null) => void;
  categorySearchQuery: string;
  setCategorySearchQuery: (query: string) => void;
  onClearFilters: () => void;
}

export const CategoryAccordionFilter: React.FC<CategoryAccordionFilterProps> = ({
  categories,
  selectedMainCategory,
  setSelectedMainCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  categorySearchQuery,
  setCategorySearchQuery,
  onClearFilters,
}) => {
  // Store set of open category IDs (all closed by default)
  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setOpenCategoryIds((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const activeCategories = categories.filter((c) => c.isActive !== false);

  // Normalize Turkish text helper
  const trNorm = (str?: string) => (str || '').trim().toLocaleLowerCase('tr-TR');

  // Filter categories and subcategories by categorySearchQuery
  const filteredCategories = activeCategories.filter((cat) => {
    if (!categorySearchQuery.trim()) return true;
    const q = trNorm(categorySearchQuery);
    if (trNorm(cat.name).includes(q)) return true;
    return (cat.subCategories || []).some((sub) =>
      trNorm(sub.name).includes(q)
    );
  });

  const isAllSelected = !selectedMainCategory && !selectedSubCategory;

  return (
    <div className="w-full bg-[#141414] border border-stone-850 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header: Title & Clear Filter Button */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black text-stone-300 uppercase tracking-widest">
            KATEGORİLER VE ÜRÜN LİSTESİ
          </span>
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Filtreyi Temizle</span>
        </button>
      </div>

      {/* Category Search Input */}
      <div className="relative">
        <input
          type="text"
          value={categorySearchQuery}
          onChange={(e) => setCategorySearchQuery(e.target.value)}
          placeholder="Kategori veya ürün ara..."
          className="w-full bg-[#1a1a1a] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-2.5 pl-9 rounded-xl outline-none placeholder:text-stone-600 transition-colors"
        />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
      </div>

      {/* Accordion Tree List */}
      <div className="space-y-1 pt-1">
        {/* Option 1: Tüm Kategoriler ve Ürünler */}
        <button
          type="button"
          onClick={() => {
            setSelectedMainCategory(null);
            setSelectedSubCategory(null);
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isAllSelected
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-stone-300 hover:bg-[#1c1c1c] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">•</span>
            <span>Tüm Kategoriler ve Ürünler</span>
          </div>
          {isAllSelected && <Check size={15} className="text-amber-400" />}
        </button>

        {/* Category Accordion Items */}
        <div className="space-y-1 pt-1">
          {filteredCategories.map((cat) => {
            const isOpen = Boolean(openCategoryIds[cat.id]);
            const isCategorySelected =
              trNorm(selectedMainCategory || '') === trNorm(cat.name) &&
              !selectedSubCategory;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Main Category Header Row */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isCategorySelected
                      ? 'bg-stone-800/80 text-amber-400'
                      : 'text-stone-200 hover:bg-[#1c1c1c] hover:text-white'
                  }`}
                  onClick={() => {
                    toggleCategory(cat.id);
                    setSelectedMainCategory(cat.name);
                    setSelectedSubCategory(null);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-xs">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span>{cat.name}</span>
                  </div>

                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <span className="text-[10px] text-stone-500 font-mono">
                      {cat.subCategories.length}
                    </span>
                  )}
                </div>

                {/* Subcategories Dropdown List (Expanded) */}
                {isOpen && cat.subCategories && cat.subCategories.length > 0 && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-stone-800 ml-4">
                    {/* All Subcategories for this Category */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMainCategory(cat.name);
                        setSelectedSubCategory(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                        isCategorySelected
                          ? 'text-amber-400 font-bold bg-amber-500/10'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                      }`}
                    >
                      <span>- Tüm {cat.name} Modelleri</span>
                      {isCategorySelected && <Check size={12} className="text-amber-400" />}
                    </button>

                    {/* Subcategories */}
                    {cat.subCategories
                      .filter((sub) => sub.isActive !== false)
                      .map((sub) => {
                        const isSubSelected =
                          trNorm(selectedMainCategory || '') === trNorm(cat.name) &&
                          trNorm(selectedSubCategory || '') === trNorm(sub.name);

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setSelectedMainCategory(cat.name);
                              setSelectedSubCategory(sub.name);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                              isSubSelected
                                ? 'text-amber-400 font-bold bg-amber-500/10'
                                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                            }`}
                          >
                            <span>- {sub.name}</span>
                            {isSubSelected && <Check size={12} className="text-amber-400" />}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
