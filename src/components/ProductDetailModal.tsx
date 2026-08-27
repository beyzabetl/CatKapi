import React, { useState } from 'react';
import { X, MessageCircle, ChevronLeft, ChevronRight, Phone, Ruler } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'];

  const [activeImageIndex, setActiveImageIndex] = useState(product.coverImageIndex ?? 0);

  const formattedPrice =
    product.campaignPrice && product.isCampaign
      ? `₺${product.campaignPrice.toLocaleString('tr-TR')}`
      : product.startingPrice && product.startingPrice > 0
      ? `₺${product.startingPrice.toLocaleString('tr-TR')}`
      : 'Fiyat Teklifli';

  const generateWhatsAppUrl = () => {
    const msg = `Merhaba Nuri Usta (Çat Kapı), web sitenizde incelediğim model hakkında bilgi ve ölçü randevusu almak istiyorum:
*Ürün:* ${product.name}
*Kategori:* ${product.category} (${product.subCategory || 'Genel'})
*Fiyat:* ${formattedPrice}

Mersin adresime yerinde ücretsiz keşif için müsaitlik durumunuzu öğrenebilir miyim?`;

    return `https://wa.me/905352194789?text=${encodeURIComponent(msg)}`;
  };

  const dimensionsText =
    product.dimensions ||
    product.specs?.['Ölçü'] ||
    product.specs?.['Genişlik'] ||
    'Ölçüye göre özel üretim yapılmaktadır.';

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-content"
        className="bg-[#141414] border border-stone-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-stone-300 hover:text-white border border-stone-700/80 transition-all cursor-pointer"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Carousel & Gallery */}
          <div className="lg:col-span-6 bg-stone-950 p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#111111] border border-stone-850">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer border border-stone-800 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) => (prev + 1) % images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer border border-stone-800 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur rounded-lg text-[10px] font-mono font-bold text-stone-300 border border-stone-800">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex
                        ? 'border-amber-500 scale-95 shadow-md'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-[#141414]">
            <div className="space-y-5">
              {/* Category & SubCategory */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg uppercase tracking-wide font-mono">
                  {product.category}
                </span>
                {product.subCategory && (
                  <span className="px-2.5 py-1 bg-stone-900 border border-stone-800 text-stone-300 text-xs font-medium rounded-lg">
                    {product.subCategory}
                  </span>
                )}
                {product.isCampaign && (
                  <span className="px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg uppercase">
                    Kampanyalı
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {product.name}
              </h2>

              {/* Price Display */}
              <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                  {product.isCampaign ? 'Kampanyalı Fiyat' : 'Ürün Fiyatı'}
                </span>
                <div className="flex items-baseline gap-3">
                  {product.campaignPrice && product.isCampaign ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                        ₺{product.campaignPrice.toLocaleString('tr-TR')}
                      </span>
                      {product.startingPrice > 0 && (
                        <span className="text-sm text-stone-500 line-through font-mono">
                          Normal: ₺{product.startingPrice.toLocaleString('tr-TR')}
                        </span>
                      )}
                    </>
                  ) : product.startingPrice && product.startingPrice > 0 ? (
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      ₺{product.startingPrice.toLocaleString('tr-TR')}
                    </span>
                  ) : (
                    <span className="text-base font-bold text-amber-400/90">Fiyat Teklifi Alınız</span>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Ürün Açıklaması
                </h4>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-[#181818] p-3.5 rounded-xl border border-stone-850">
                  {product.description || 'Özel tasarım ve ölçüye göre üretilen mobilya modeli.'}
                </p>
              </div>

              {/* Product Dimensions */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Ruler size={13} className="text-amber-400" />
                  <span>Ürün Ölçüleri</span>
                </h4>
                <div className="text-xs text-stone-200 bg-[#181818] p-3.5 rounded-xl border border-stone-850">
                  {dimensionsText}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-850 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                id="product-modal-whatsapp-btn"
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Nuri Usta'dan Fiyat Teklifi ve Ölçü Al</span>
              </a>

              <a
                id="product-modal-phone-btn"
                href="tel:05352194789"
                className="py-3.5 px-4 bg-stone-850 hover:bg-stone-800 text-amber-400 border border-stone-750 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={15} />
                <span>0535 219 47 89</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
