import React, { useState, useEffect } from 'react';
import { Ruler, MessageCircle, CheckCircle2, Box, PenTool } from 'lucide-react';
import { Product, Category } from '../types';

interface CustomProductionProps {
  products?: Product[];
  categories: Category[];
}

export const CustomProduction: React.FC<CustomProductionProps> = ({
  products = [],
  categories = [],
}) => {
  const activeCategories = categories.filter((c) => c.isActive !== false);

  const [selectedCategory, setSelectedCategory] = useState(
    activeCategories[0]?.name || 'Yatak Odası'
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedProductOption, setSelectedProductOption] = useState('Diğer (Ürünü Yazınız)');
  const [customProductName, setCustomProductName] = useState('');
  const [materialInfo, setMaterialInfo] = useState('');
  const [width, setWidth] = useState(240);
  const [height, setHeight] = useState(220);
  const [depth, setDepth] = useState(60);
  const [specialNotes, setSpecialNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Active Category Object
  const activeCategoryObj = activeCategories.find(
    (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Available SubCategories
  const subCategories = (activeCategoryObj?.subCategories || []).filter(
    (s) => s.isActive !== false
  );

  // Available Products for this Category
  const categoryProducts = products.filter(
    (p) =>
      !p.isHidden &&
      p.category?.toLowerCase() === selectedCategory.toLowerCase() &&
      (!selectedSubCategory ||
        !p.subCategory ||
        p.subCategory.toLowerCase() === selectedSubCategory.toLowerCase())
  );

  // Reset SubCategory and Product options on Category change
  useEffect(() => {
    if (subCategories.length > 0) {
      setSelectedSubCategory(subCategories[0].name);
    } else {
      setSelectedSubCategory('');
    }
    setSelectedProductOption('Diğer (Ürünü Yazınız)');
  }, [selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const productNameFinal =
      selectedProductOption === 'Diğer (Ürünü Yazınız)'
        ? customProductName || `${selectedCategory} - ${selectedSubCategory || 'Özel Model'}`
        : selectedProductOption;

    const formattedMessage = `Merhaba Nuri Usta (Çat Kapı), web sitenizdeki "İmalat Parametreleri" formu üzerinden özel üretim talebi hazırladım:

*Müşteri Bilgisi:* ${customerName || 'Belirtilmedi'}
*İletişim Tel:* ${customerPhone || 'Belirtilmedi'}

*Kategori:* ${selectedCategory}
*Alt Kategori:* ${selectedSubCategory || 'Genel'}
*Ürün:* ${productNameFinal}
*İmalat Malzemesi:* ${materialInfo || 'Müşteriyle belirlenecek (MDF / Lake)'}

*ÖLÇÜLER:*
- Genişlik (En): ${width} cm
- Yükseklik (Boy): ${height} cm
- Derinlik: ${depth} cm

*Özel İstekler / Mimari Notlar:*
${specialNotes || 'Belirtilmedi, yerinde keşif isteniyor.'}

Mersin içi yerinde keşif ve net fiyatlandırma için dönüşünüzü rica ediyorum.`;

    const waUrl = `https://wa.me/905352194789?text=${encodeURIComponent(formattedMessage)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 800);
  };

  return (
    <section id="custom-production-section" className="w-full bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Simple Clean Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Özel Üretim İmalat Talep Sayfası
          </h1>
        </div>

        {/* Main Form Container Matching User Reference Mockup Exactly */}
        <div className="bg-[#151515] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Header: İmalat Parametreleri */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-850">
            <Ruler className="text-amber-500 w-5 h-5 -rotate-45" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              İmalat Parametreleri
            </h2>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="text-center py-12 px-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-5 animate-in fade-in">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
              <h3 className="text-xl font-black text-white">İmalat Talebiniz Hazırlandı!</h3>
              <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Tüm ölçü ve malzeme detaylarınız WhatsApp üzerinden Nuri Usta'ya iletiliyor.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Yeni Bir Talep Formu Doldur
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* SECTION 1: KATEGORİ & ÜRÜN SEÇİMİ (3-Step Columns) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
                    KATEGORİ & ÜRÜN SEÇİMİ
                  </span>
                </div>

                {/* 3 Step Dropdowns in One Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Step 1: Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 block">
                      1. Adım: Kategori
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-3.5 py-3 rounded-xl outline-none cursor-pointer transition-colors"
                    >
                      {activeCategories.map((cat) => (
                        <option key={cat.id} value={cat.name} className="bg-stone-900 text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Alt Kategori */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 block">
                      2. Adım: Alt Kategori
                    </label>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-3.5 py-3 rounded-xl outline-none cursor-pointer transition-colors"
                    >
                      {subCategories.length > 0 ? (
                        subCategories.map((sub) => (
                          <option key={sub.id} value={sub.name} className="bg-stone-900 text-white">
                            {sub.name}
                          </option>
                        ))
                      ) : (
                        <option value="" className="bg-stone-900 text-white">
                          Genel Modeller
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Step 3: Ürün Seçimi */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-400 block">
                      3. Adım: Ürün Seçimi
                    </label>
                    <select
                      value="Diğer (Ürünü Yazınız)"
                      disabled
                      className="w-full bg-[#1c1c1c] border border-stone-800 text-amber-400 font-bold text-xs px-3.5 py-3 rounded-xl outline-none cursor-default"
                    >
                      <option value="Diğer (Ürünü Yazınız)" className="bg-stone-900 text-white">
                        Diğer (Ürünü Yazınız)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Custom Product Name Input Field - Always Visible */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-stone-300 block">
                    Ürün Adını Yazınız:
                  </label>
                  <input
                    type="text"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder="Örn: 6 Kapaklı Camlı Lake Gardırop, Ada Mutfak Tezgahı..."
                    className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-stone-600 transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 2: İMALAT MALZEMESİ */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-300 block">
                  İmalat Malzemesi:
                </label>
                <input
                  type="text"
                  value={materialInfo}
                  onChange={(e) => setMaterialInfo(e.target.value)}
                  placeholder="Örn: Gövde MDF Lam, Kapaklar İpek Mat Lake, Frenli Blum Menteşe..."
                  className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-stone-600 transition-colors"
                />
              </div>

              {/* SECTION 3: ÖLÇÜ SEÇİMİ (cm) SLIDERS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
                    ÖLÇÜ SEÇİMİ (CM)
                  </span>
                </div>

                <div className="space-y-4 bg-[#191919] p-5 rounded-2xl border border-stone-850">
                  {/* Genişlik (En) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-stone-300">Genişlik (En)</span>
                      <span className="text-amber-400 font-mono text-sm bg-stone-900 px-2.5 py-0.5 rounded border border-stone-800">
                        {width} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={600}
                      step={5}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-stone-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Yükseklik (Boy) */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-stone-300">Yükseklik (Boy)</span>
                      <span className="text-amber-400 font-mono text-sm bg-stone-900 px-2.5 py-0.5 rounded border border-stone-800">
                        {height} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={350}
                      step={5}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-stone-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Derinlik */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-stone-300">Derinlik</span>
                      <span className="text-amber-400 font-mono text-sm bg-stone-900 px-2.5 py-0.5 rounded border border-stone-800">
                        {depth} cm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      step={5}
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-stone-800 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ÖZEL İSTEKLERİNİZ & NOTLAR */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-300 block">
                  Özel İstekleriniz & Notlar:
                </label>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Kapak rengi (RAL kodu), LED aydınlatma, kulp modeli, teslim adresi veya mimari isteklerinizi belirtebilirsiniz..."
                  className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs p-4 rounded-xl outline-none placeholder:text-stone-600 transition-colors resize-none"
                />
              </div>

              {/* SECTION 5: AD SOYAD & İLETİŞİM TELEFON NO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-300 block">
                    Ad Soyad:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-stone-600 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-300 block">
                    İletişim Telefon No:
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full bg-[#1c1c1c] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-3 rounded-xl outline-none placeholder:text-stone-600 transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 6: SUBMIT BUTTON (İmalat İsteğini Nuri Usta'ya Gönder (WhatsApp)) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-emerald-900/40"
                >
                  <MessageCircle size={20} className="text-white" />
                  <span>İmalat İsteğini Nuri Usta'ya Gönder (WhatsApp)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
