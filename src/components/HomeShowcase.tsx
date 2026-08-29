import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Eye,
  Ruler,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { Product, Category } from '../types';

interface HomeShowcaseProps {
  products: Product[];
  categories: Category[];
  onSelectProductDetail: (product: Product) => void;
  onDiscoverAll: () => void;
  onOpenCustomProduction: () => void;
}

export const HomeShowcase: React.FC<HomeShowcaseProps> = ({
  products,
  categories,
  onSelectProductDetail,
  onDiscoverAll,
  onOpenCustomProduction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter out hidden products
  const activeProducts = useMemo(() => {
    return (products || []).filter((p) => p && p.id && p.isHidden !== true);
  }, [products]);

  // Extract unique category names for filter pills
  const categoryPills = useMemo(() => {
    const set = new Set<string>();
    (categories || []).forEach((c) => {
      if (c && c.name && c.isActive !== false) {
        set.add(c.name.trim());
      }
    });
    activeProducts.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [categories, activeProducts]);

  // Filtered by selected category pill
  const displayedProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return activeProducts;
    }
    const target = selectedCategory.trim().toLocaleLowerCase('tr-TR');
    return activeProducts.filter((p) => {
      const itemCat = (p.category || '').trim().toLocaleLowerCase('tr-TR');
      const itemSub = (p.subCategory || '').trim().toLocaleLowerCase('tr-TR');
      return (
        itemCat === target ||
        itemSub === target ||
        itemCat.includes(target) ||
        target.includes(itemCat)
      );
    });
  }, [activeProducts, selectedCategory]);

  const generateWhatsAppUrl = (product: Product) => {
    const formattedPrice =
      product.campaignPrice && product.isCampaign
        ? `₺${product.campaignPrice.toLocaleString('tr-TR')}`
        : product.startingPrice && product.startingPrice > 0
        ? `₺${product.startingPrice.toLocaleString('tr-TR')}`
        : 'Fiyat Teklifli';

    const msg = `Merhaba Nuri Usta (Çat Kapı), ana sayfadaki ürünü inceledim:
*Ürün:* ${product.name} (${product.category} - ${product.subCategory || 'Genel'})
*Fiyat:* ${formattedPrice}

Mersin adresime yerinde ücretsiz ölçü ve detaylı bilgi rica ediyorum.`;

    return `https://wa.me/905352194789?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section
      id="home-showcase-section"
      className="w-full bg-[#111111] py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-850 text-white"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span>ATÖLYEDEN YENİ ÇIKANLAR & VİTRİN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Öne Çıkan Modeller & Özel İmalatlarımız
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
              Mersin Akdeniz atölyemizde Nuri Usta güvencesiyle üretilen, sıfır suntalam prensipli ve 1. sınıf lake/ahşap tasarımlar.
            </p>
          </div>

          {/* Direct Link to Showroom */}
          <button
            type="button"
            onClick={onDiscoverAll}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1a1a1a] hover:bg-amber-500 hover:text-black border border-stone-750 text-stone-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0 group"
          >
            <span>TÜM KATALOĞU GÖR ({activeProducts.length} ÜRÜN)</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Category Filter Pills */}
        {categoryPills.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black shadow-lg font-black'
                  : 'bg-[#181818] text-stone-400 hover:text-white hover:bg-[#202020] border border-stone-800'
              }`}
            >
              TÜM MODELLER ({activeProducts.length})
            </button>

            {categoryPills.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = activeProducts.filter((p) => (p.category || '').trim() === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-lg font-black'
                      : 'bg-[#181818] text-stone-400 hover:text-white hover:bg-[#202020] border border-stone-800'
                  }`}
                >
                  {cat.toUpperCase()} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <div
            id="home-products-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
          >
            {displayedProducts.map((product) => {
              const coverImg =
                product.images?.[product.coverImageIndex ?? 0] ||
                product.images?.[0] ||
                'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800';
              const photoCount = product.images?.length || 1;

              const dimensionsText =
                product.dimensions ||
                product.specs?.['Ölçü'] ||
                product.specs?.['Genişlik'] ||
                'Ölçüye göre özel imalat';

              const priceText =
                product.campaignPrice && product.isCampaign
                  ? `₺${product.campaignPrice.toLocaleString('tr-TR')}`
                  : product.startingPrice && product.startingPrice > 0
                  ? `₺${product.startingPrice.toLocaleString('tr-TR')}`
                  : 'Fiyat Teklifli';

              return (
                <div
                  key={product.id}
                  id={`home-product-card-${product.id}`}
                  className="group bg-[#161616] rounded-3xl overflow-hidden border border-stone-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between shadow-2xl"
                >
                  {/* Media Cover Image */}
                  <div
                    onClick={() => onSelectProductDetail(product)}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-stone-950 cursor-pointer"
                  >
                    {/* Category Chip Top Left */}
                    <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/85 backdrop-blur text-stone-200 text-[10px] font-mono font-black uppercase tracking-wider rounded-md border border-stone-700">
                      {(product.category || 'MOBİLYA').toUpperCase()}
                    </span>

                    {/* Photo Count Top Right */}
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/80 backdrop-blur text-amber-400 text-[10px] font-mono font-bold rounded-md border border-stone-700/80 flex items-center gap-1">
                      <ImageIcon size={11} />
                      <span>{photoCount} Görsel</span>
                    </span>

                    {/* Cover Image with Zoom Effect */}
                    <img
                      src={coverImg}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Hover Quick Action Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <span className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xl">
                        <Eye size={14} />
                        <span>DETAYLI İNCELE</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Subcategory & Status */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-400/90 font-bold">
                          {product.subCategory || product.category || 'Özel Üretim'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px]">
                          {product.stockStatus || 'Sipariş Üzerine Üretiliyor'}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => onSelectProductDetail(product)}
                        className="text-base sm:text-lg font-black text-white hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Short Description */}
                      <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed">
                        {product.description || 'Nuri Usta kalitesiyle mimari ölçüye göre özel üretilen tasarım modeli.'}
                      </p>

                      {/* Dimensions Spec */}
                      <div className="flex items-center gap-1.5 text-stone-400 text-[11px] pt-1">
                        <Ruler size={13} className="text-amber-400/80 shrink-0" />
                        <span className="truncate">{dimensionsText}</span>
                      </div>
                    </div>

                    {/* Footer: Price & WhatsApp Action */}
                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-stone-500 font-mono block uppercase">
                          BAŞLANGIÇ FİYATI
                        </span>
                        <span className="text-base font-black text-amber-400 font-mono">
                          {priceText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectProductDetail(product)}
                          className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer border border-stone-700"
                          title="Ürün Detayları"
                        >
                          <Eye size={15} />
                        </button>

                        <a
                          href={generateWhatsAppUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                          title="WhatsApp İle Fiyat Al"
                        >
                          <MessageCircle size={14} className="fill-white" />
                          <span className="hidden sm:inline">Fiyat Al</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#141414] border border-stone-800 rounded-2xl p-12 text-center space-y-4">
            <Layers size={36} className="mx-auto text-stone-600" />
            <p className="text-stone-300 font-bold text-sm">
              Bu kategoride henüz yayınlanmış ürün bulunmuyor.
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              TÜM ÜRÜNLERİ GÖSTER
            </button>
          </div>
        )}

        {/* Custom Production CTA Banner at bottom */}
        <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#181818] border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-black text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>Evinizin Ölçüsüne Özel Farklı Bir Model Mi İstiyorsunuz?</span>
            </h4>
            <p className="text-stone-400 text-xs sm:text-sm">
              Kataloğumuz dışındaki özel dolap, mutfak, kapı ve oda projelerinizi ücretsiz yerinde lazer ölçümüyle projelendiriyoruz.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCustomProduction}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>ÖZEL İMALAT TALEBİ</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};
