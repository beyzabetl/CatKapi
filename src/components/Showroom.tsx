import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  Image as ImageIcon,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { Product, Category } from '../types';
import { CategoryAccordionFilter } from './CategoryAccordionFilter';

interface ShowroomProps {
  products: Product[];
  categories: Category[];
  onOpenConfigurator: () => void;
  onSelectProductDetail: (product: Product) => void;
}

export const Showroom: React.FC<ShowroomProps> = ({
  products,
  categories,
  onOpenConfigurator,
  onSelectProductDetail,
}) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (item.isHidden === true) return false;

      // Main Category Match
      if (selectedMainCategory) {
        const itemCat = (item.category || '').trim().toLocaleLowerCase('tr-TR');
        const selCat = selectedMainCategory.trim().toLocaleLowerCase('tr-TR');

        const matchedCategoryObj = categories.find(
          (c) =>
            c.name.trim().toLocaleLowerCase('tr-TR') === selCat ||
            c.id.trim().toLocaleLowerCase('tr-TR') === selCat
        );

        const validCatSet = new Set(
          [
            selCat,
            matchedCategoryObj?.name?.trim().toLocaleLowerCase('tr-TR'),
            matchedCategoryObj?.id?.trim().toLocaleLowerCase('tr-TR'),
          ].filter(Boolean)
        );

        if (!validCatSet.has(itemCat)) {
          return false;
        }

        // Sub Category Match
        if (selectedSubCategory) {
          const itemSub = (item.subCategory || '').trim().toLocaleLowerCase('tr-TR');
          const selSub = selectedSubCategory.trim().toLocaleLowerCase('tr-TR');

          const matchedSubObj = matchedCategoryObj?.subCategories?.find(
            (s) =>
              s.name.trim().toLocaleLowerCase('tr-TR') === selSub ||
              s.id.trim().toLocaleLowerCase('tr-TR') === selSub
          );

          const validSubSet = new Set(
            [
              selSub,
              matchedSubObj?.name?.trim().toLocaleLowerCase('tr-TR'),
              matchedSubObj?.id?.trim().toLocaleLowerCase('tr-TR'),
            ].filter(Boolean)
          );

          if (!validSubSet.has(itemSub)) {
            return false;
          }
        }
      }

      // Search Query Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLocaleLowerCase('tr-TR').trim();
        const inName = (item.name || '').toLocaleLowerCase('tr-TR').includes(q);
        const inCategory = (item.category || '').toLocaleLowerCase('tr-TR').includes(q);
        const inSubCategory = (item.subCategory || '').toLocaleLowerCase('tr-TR').includes(q);
        const inDesc = (item.description || '').toLocaleLowerCase('tr-TR').includes(q);
        const inMaterials = (item.materials || []).some((m) =>
          m.toLocaleLowerCase('tr-TR').includes(q)
        );

        if (!inName && !inCategory && !inSubCategory && !inDesc && !inMaterials) {
          return false;
        }
      }

      return true;
    });
  }, [products, categories, selectedMainCategory, selectedSubCategory, searchQuery]);

  const handleClearFilters = () => {
    setSelectedMainCategory(null);
    setSelectedSubCategory(null);
    setSearchQuery('');
    setCategorySearchQuery('');
  };

  const generateWhatsAppInquiryUrl = (product: Product) => {
    const formattedPrice =
      product.campaignPrice && product.isCampaign
        ? `₺${product.campaignPrice.toLocaleString('tr-TR')}`
        : product.startingPrice && product.startingPrice > 0
        ? `₺${product.startingPrice.toLocaleString('tr-TR')}`
        : 'Fiyat Teklifli';

    const msg = `Merhaba Nuri Usta (Çat Kapı), web sitenizdeki ürünü inceledim:
*Ürün:* ${product.name} (${product.category} - ${product.subCategory || 'Genel'})
*Fiyat:* ${formattedPrice}
*Durum:* ${product.stockStatus || 'Özel Üretim'}

Bu ürün hakkında detaylı bilgi ve Mersin adresime yerinde ölçü randevusu talep ediyorum.`;

    return `https://wa.me/905352194789?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="showroom-catalog" className="w-full bg-[#111111] py-6 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar: FİLTRELEME & ARAMA PANELİ ( 46 ÜRÜN ) & Global Model Arama */}
        <div className="bg-[#141414] border border-stone-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-2.5 text-stone-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Filter size={16} className="text-amber-500 shrink-0" />
            <span>FİLTRELEME & ARAMA PANELİ ( {filteredProducts.length} ÜRÜN )</span>
          </div>

          <div className="relative w-full md:w-80">
            <input
              id="showroom-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Model adı veya kelime ara..."
              className="w-full bg-[#1b1b1b] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-2.5 pl-9 rounded-xl outline-none placeholder:text-stone-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>
        </div>

        {/* Category Accordion Filter Tree (Top Section matching user reference screenshot) */}
        <CategoryAccordionFilter
          categories={categories}
          selectedMainCategory={selectedMainCategory}
          setSelectedMainCategory={setSelectedMainCategory}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          categorySearchQuery={categorySearchQuery}
          setCategorySearchQuery={setCategorySearchQuery}
          onClearFilters={handleClearFilters}
        />

        {/* Products Grid Matching 3 Columns */}
        {filteredProducts.length > 0 ? (
          <div
            id="products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-7 pt-2"
          >
            {filteredProducts.map((product) => {
              const coverImg =
                product.images?.[product.coverImageIndex ?? 0] ||
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800';
              const photoCount = product.images?.length || 1;

              // Extract dimensions
              const dimensionsText =
                product.dimensions ||
                product.specs?.['Ölçü'] ||
                product.specs?.['Genişlik'] ||
                '240 × 60 × 220 cm';

              const materialsText =
                (product.materials && product.materials.length > 0)
                  ? product.materials.join(', ')
                  : 'MDF, Lake Boyalı MDF, PVC Kenar Bant, Frenli Ray Sistemi, Temperli Cam';

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="group bg-[#161616] rounded-3xl overflow-hidden border border-stone-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between shadow-2xl"
                >
                  {/* Card Media Header */}
                  <div
                    onClick={() => onSelectProductDetail(product)}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950 cursor-pointer"
                  >
                    {/* Category Chip Top Left */}
                    <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/85 backdrop-blur text-stone-200 text-[10px] font-mono font-black uppercase tracking-wider rounded-md border border-stone-700">
                      {product.category.toUpperCase()}
                    </span>

                    {/* Photo Count Top Right */}
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/85 backdrop-blur text-stone-200 text-[10px] font-mono font-bold rounded-md border border-stone-800 flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-amber-400" />
                      <span>{photoCount} Fotoğraf</span>
                    </span>

                    {/* Cover Image */}
                    <img
                      src={coverImg}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Bottom Badges on Image */}
                    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded">
                        KAMPANYA
                      </span>
                      <span className="px-2.5 py-0.5 bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider rounded">
                        ÖZEL ÜRETİM
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3
                        onClick={() => onSelectProductDetail(product)}
                        className="text-lg font-black text-white group-hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-stone-400 leading-relaxed">
                        {product.description || 'Mersin Akdeniz atölyemizde milimetrik ölçülere göre üretilen lüks mobilya modeli.'}
                      </p>
                    </div>

                    {/* Price Section */}
                    <div className="pt-2 border-t border-stone-850 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                        BAŞLANGIÇ FİYATI
                      </span>
                      <div className="flex items-baseline gap-2">
                        {product.campaignPrice && product.isCampaign ? (
                          <>
                            {product.startingPrice > 0 && (
                              <span className="text-xs text-stone-500 line-through font-mono">
                                ₺{product.startingPrice.toLocaleString('tr-TR')}
                              </span>
                            )}
                            <span className="text-base sm:text-lg font-mono font-black text-amber-400">
                              ₺{product.campaignPrice.toLocaleString('tr-TR')}
                            </span>
                          </>
                        ) : product.startingPrice && product.startingPrice > 0 ? (
                          <span className="text-base sm:text-lg font-mono font-black text-amber-400">
                            ₺{product.startingPrice.toLocaleString('tr-TR')}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400">
                            Fiyat Teklifli
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Materials & Dimensions Details Box */}
                    <div className="space-y-1.5 bg-[#1a1a1a] p-3 rounded-xl border border-stone-850 text-[11px] text-stone-300">
                      <div>
                        <span className="font-bold text-stone-400">Malzeme: </span>
                        <span>{materialsText}</span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-400">Ölçü: </span>
                        <span>{dimensionsText}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectProductDetail(product)}
                        className="py-2.5 px-3 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] text-stone-200 hover:text-white font-extrabold text-[11px] uppercase tracking-wider border border-stone-750 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>DETAYLAR</span>
                        <ChevronRight size={13} />
                      </button>

                      <a
                        id={`product-wa-${product.id}`}
                        href={generateWhatsAppInquiryUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <MessageCircle size={14} />
                        <span>WHATSAPP</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#161616] rounded-3xl border border-stone-800 space-y-4">
            <h3 className="text-lg font-black text-white">Aradığınız ürün bulunamadı</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              filtreleri temizleyerek tüm kataloğu görüntüleyebilirsiniz
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl cursor-pointer transition-all"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
