import React, { useState, useEffect } from 'react';
import { Compass, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteSettings, MainTabType } from '../types';

interface HeroProps {
  siteSettings: SiteSettings;
  onDiscoverShowroom: () => void;
  onOpenCustomProduction: () => void;
  onNavigateTab: (tab: MainTabType) => void;
}

export const Hero: React.FC<HeroProps> = ({
  siteSettings,
  onDiscoverShowroom,
  onOpenCustomProduction,
  onNavigateTab,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const fallbackSlides = [
    {
      id: 'hs-1',
      title: 'Özel Üretim Mobilya & Kapı Çözümleri',
      subtitle: 'Mersin Akdeniz İmalat Atölyesi',
      description: 'Milimetrik ölçüye göre üretilen lüks lake kapılar, gardıroplar ve ada mutfaklar.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      tag: 'ZANAAT & KALİTE',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      secondaryButtonText: 'Tüm Ürün Kataloğu',
      secondaryButtonLink: 'products',
    },
    {
      id: 'hs-2',
      title: 'Hayalinizdeki Tasarımı Gerçeğe Dönüştürün',
      subtitle: 'Ücretsiz Yerinde Keşif ve Ölçü',
      description: 'Evinize ve mimari mekanınıza tam oturan özel imalat projeleri.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200',
      tag: 'ÖZEL İMALAT',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      secondaryButtonText: 'Tüm Ürün Kataloğu',
      secondaryButtonLink: 'products',
    },
    {
      id: 'hs-3',
      title: 'Kaliteli & Modern Yaşam Alanları',
      subtitle: 'Nuri Usta Güvencesiyle',
      description: 'Doğrudan imalatçı fiyatları ve kusursuz montaj teslimatı.',
      image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
      tag: 'DOĞRUDAN ATÖLYEDEN',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      secondaryButtonText: 'Tüm Ürün Kataloğu',
      secondaryButtonLink: 'products',
    },
  ];

  const rawSlides = siteSettings?.heroSlides && siteSettings.heroSlides.length > 0
    ? siteSettings.heroSlides.filter((s) => !s.isHidden)
    : fallbackSlides;

  const slides = rawSlides.length > 0 ? rawSlides : fallbackSlides;

  useEffect(() => {
    if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const isVideoMedia = (url?: string) => {
    if (!url) return false;
    return url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
  };

  const handlePrimaryButtonClick = () => {
    const link = activeSlide.buttonLink;
    if (link === 'products') {
      onDiscoverShowroom();
    } else if (link === 'custom-production') {
      onOpenCustomProduction();
    } else if (link === 'contact') {
      onNavigateTab('contact');
    } else if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      onOpenCustomProduction();
    }
  };

  const handleSecondaryButtonClick = () => {
    const link = activeSlide.secondaryButtonLink || 'products';
    if (link === 'products') {
      onDiscoverShowroom();
    } else if (link === 'custom-production') {
      onOpenCustomProduction();
    } else if (link === 'contact') {
      onNavigateTab('contact');
    } else if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      onDiscoverShowroom();
    }
  };

  const hasSlideText = Boolean(
    activeSlide.title || activeSlide.subtitle || activeSlide.description || activeSlide.tag
  );

  return (
    <section id="showroom-hero" className="relative w-full overflow-hidden bg-[#111111] text-white">
      <div className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] w-full flex items-center justify-center py-16">
        {/* Background Images / Videos with Smooth Fade */}
        {slides.map((slide, idx) => {
          const isVideo = isVideoMedia(slide.image);
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${
                idx === currentSlideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/60 z-10" />
              {isVideo ? (
                <video
                  src={slide.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title || 'Slider Görseli'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          );
        })}

        {/* Content: Slide Text and Action Buttons - Shifted Left As Requested */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12 flex flex-col items-start justify-center text-left space-y-6">
          {hasSlideText && (
            <div className="space-y-3.5 max-w-2xl animate-in fade-in slide-in-from-left-4 duration-500 text-left">
              {activeSlide.tag && (
                <div className="inline-block px-3.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[11px] font-mono font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                  {activeSlide.tag}
                </div>
              )}

              {activeSlide.title && (
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg leading-tight text-left">
                  {activeSlide.title}
                </h1>
              )}

              {activeSlide.subtitle && (
                <p className="text-sm sm:text-base font-semibold text-amber-400 font-mono tracking-wide text-left">
                  {activeSlide.subtitle}
                </p>
              )}

              {activeSlide.description && (
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed drop-shadow text-left max-w-xl">
                  {activeSlide.description}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons - Left Aligned */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-4 pt-2">
            <button
              id="hero-primary-cta"
              onClick={handlePrimaryButtonClick}
              className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-2xl text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-2xl transition-all cursor-pointer hover:scale-105"
            >
              <Compass size={18} className="mr-2.5 text-black" />
              <span>{activeSlide.buttonText || 'Özel Üretim Talebi'}</span>
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-secondary-cta"
              onClick={handleSecondaryButtonClick}
              className="flex items-center justify-center px-8 py-4 bg-black/60 hover:bg-black/80 border border-white/20 hover:border-amber-500/60 rounded-2xl text-stone-100 hover:text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all backdrop-blur-md cursor-pointer hover:scale-105 shadow-xl"
            >
              <span>{activeSlide.secondaryButtonText || 'Tüm Ürün Kataloğu'}</span>
            </button>
          </div>
        </div>

        {/* Carousel Slide Indicators & Controls */}
        <div className="absolute bottom-6 right-6 sm:right-12 z-30 flex items-center space-x-3">
          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                id={`hero-slide-dot-${idx}`}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlideIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex space-x-1 ml-4">
            <button
              id="hero-prev-slide-btn"
              onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/90 border border-stone-800 text-stone-400 hover:text-white cursor-pointer"
              aria-label="Önceki Slayt"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              id="hero-next-slide-btn"
              onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
              className="p-2 rounded-lg bg-black/50 hover:bg-black/90 border border-stone-800 text-stone-400 hover:text-white cursor-pointer"
              aria-label="Sonraki Slayt"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
