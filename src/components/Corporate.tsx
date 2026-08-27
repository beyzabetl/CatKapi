import React from 'react';
import { Sparkles, ShieldCheck, Compass, CheckCircle2, Star, Hammer, MessageCircle, ArrowRight, Phone } from 'lucide-react';
import { SiteSettings, MainTabType, QualityPrinciple } from '../types';

interface CorporateProps {
  siteSettings: SiteSettings;
  onNavigateTab?: (tab: MainTabType) => void;
}

const DEFAULT_PRINCIPLES: QualityPrinciple[] = [
  {
    id: 'pr-1',
    title: 'İpek Mat CNC Lake',
    description: 'Sarılaşmayan İtalyan Sayerlack boya ve CNC hassas oyma işçiliği.',
    icon: 'sparkles',
  },
  {
    id: 'pr-2',
    title: 'Sıfır Suntalam Prensibi',
    description: 'Gövde ve kapaklarda yalnızca 1. Sınıf MDF Lam, Marin ve Lake kullanılır.',
    icon: 'shield',
  },
  {
    id: 'pr-3',
    title: 'Lazer Ölçüm & 3D Onay',
    description: 'Mersin geneli mimari keşif ve üretime geçmeden önce 3D görselleştirme.',
    icon: 'compass',
  },
  {
    id: 'pr-4',
    title: '2 Yıl İmalat Garantisi',
    description: 'Blum & Hafele frenli ray sistemleri ile ömürlük sorunsuz kullanım.',
    icon: 'check',
  },
];

export const Corporate: React.FC<CorporateProps> = ({ siteSettings, onNavigateTab }) => {
  const promo = siteSettings?.promoSection || {
    title: 'Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri',
    subtitle: "MERSİN'İN LOKAL DEĞERİ",
    description: "ÇAT KAPI, Mersin Akdeniz'deki modern imalat tesisinde, Nuri Yanık liderliğinde, sıradan fabrikasyon yapı market algısını yıkmak; evine hak ettiği sıcaklığı ve lüksü kazandırmak isteyen seçkin müşterilerimiz için butik üretim yapmaktadır.",
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800',
    buttonText: 'Nuri Usta İle İletişime Geç',
    buttonLink: 'contact',
    whatsappButtonText: "WhatsApp'tan Yaz",
    ownerName: 'Nuri Yanık',
    ownerPhone: '0535 219 47 89',
    principles: DEFAULT_PRINCIPLES,
  };

  const principlesToRender: QualityPrinciple[] =
    promo.principles && promo.principles.length > 0
      ? promo.principles
      : DEFAULT_PRINCIPLES;

  const renderIcon = (iconType?: string) => {
    switch (iconType) {
      case 'shield':
        return <ShieldCheck className="text-emerald-400 mt-0.5 shrink-0" size={18} />;
      case 'compass':
        return <Compass className="text-amber-400 mt-0.5 shrink-0" size={18} />;
      case 'check':
        return <CheckCircle2 className="text-blue-400 mt-0.5 shrink-0" size={18} />;
      case 'star':
        return <Star className="text-yellow-400 mt-0.5 shrink-0" size={18} />;
      case 'hammer':
        return <Hammer className="text-amber-500 mt-0.5 shrink-0" size={18} />;
      case 'sparkles':
      default:
        return <Sparkles className="text-amber-400 mt-0.5 shrink-0" size={18} />;
    }
  };

  const handleButtonClick = () => {
    if (promo.buttonLink === 'contact' && onNavigateTab) {
      onNavigateTab('contact');
    } else if (promo.buttonLink === 'custom-production' && onNavigateTab) {
      onNavigateTab('custom-production');
    } else if (promo.buttonLink === 'products' && onNavigateTab) {
      onNavigateTab('products');
    } else if (promo.buttonLink && promo.buttonLink.startsWith('http')) {
      window.open(promo.buttonLink, '_blank');
    } else if (onNavigateTab) {
      onNavigateTab('contact');
    }
  };

  const masterName = promo.ownerName || siteSettings?.ownerName || 'Nuri Yanık';
  const masterPhone = promo.ownerPhone || siteSettings?.phone || '0535 219 47 89';
  const rawWhatsApp = (siteSettings?.whatsapp || masterPhone).replace(/[^0-9]/g, '');

  return (
    <section id="corporate-profile" className="w-full bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-850">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Presentation Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-gradient-to-b from-[#161616] to-[#121212] p-6 sm:p-10 lg:p-12 rounded-3xl border border-stone-850 shadow-2xl">
          {/* Left: Image & Clean Name/Phone Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-2xl border border-stone-800 shadow-2xl group">
              <img
                src={promo.image || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'}
                alt={promo.title}
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Floating Info Box: Nuri Yanık & Phone */}
            <div className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-20 bg-[#1a1a1a]/95 backdrop-blur-md p-4 rounded-xl border border-amber-500/30 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-extrabold text-base tracking-wide">
                    {masterName}
                  </h4>
                  <a
                    href={`tel:${masterPhone.replace(/\s+/g, '')}`}
                    className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone size={13} />
                    <span>{masterPhone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content & Core Values */}
          <div className="lg:col-span-7 space-y-6 pt-6 lg:pt-0">
            <div>
              {promo.subtitle && (
                <span className="text-amber-400 font-mono text-xs font-black uppercase tracking-widest block mb-2">
                  {promo.subtitle}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                {promo.title}
              </h2>
            </div>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {promo.description}
            </p>

            {/* Quality Checklist - Dynamically Loaded from CMS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {principlesToRender.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-start space-x-3 p-3.5 rounded-xl bg-[#181818] border border-stone-800/80 hover:border-amber-500/30 transition-colors"
                >
                  {renderIcon(item.icon)}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-800">
              <button
                id="corporate-cta-primary"
                onClick={handleButtonClick}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>{promo.buttonText || 'Nuri Usta İle İletişime Geç'}</span>
                <ArrowRight size={15} />
              </button>

              <a
                id="corporate-cta-whatsapp"
                href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta, Çat Kapı web sitenizdeki atölye imalat çözümleriniz hakkında görüşmek istiyorum.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <MessageCircle size={15} />
                <span>{promo.whatsappButtonText || "WhatsApp'tan Yaz"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
