import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Sliders, Instagram, Menu, X, Hammer, Compass, Sparkles } from 'lucide-react';
import { MainTabType, SiteSettings } from '../types';

interface NavbarProps {
  currentTab: MainTabType;
  setCurrentTab: (tab: MainTabType) => void;
  onOpenAdminCms?: () => void;
  siteSettings: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAdminCms,
  siteSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: MainTabType; label: string }[] = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'products', label: 'Ürünler' },
    { id: 'custom-production', label: 'Özel Üretim' },
    { id: 'contact', label: 'İletişim' },
  ];

  const handleTabChange = (tab: MainTabType) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const instagramHandle = siteSettings?.instagram || '@catyapii';
  const instagramUrl = (() => {
    if (instagramHandle.startsWith('http')) return instagramHandle;
    const clean = instagramHandle.replace(/^@/, '').trim();
    return `https://instagram.com/${clean}`;
  })();

  const rawPhone = (siteSettings?.phone || '0535 219 47 89').replace(/\s+/g, '');
  const rawWhatsApp = (siteSettings?.whatsapp || '0535 219 47 89').replace(/[^0-9]/g, '');

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full bg-[#111111]/95 text-white shadow-xl backdrop-blur-md border-b border-amber-900/20">
      {/* Top Bar matching uploaded image */}
      <div id="top-bar" className="w-full bg-[#0e0e0e] text-[11px] text-stone-300 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center w-full">
          {/* Left Side: 3 items from user screenshot */}
          <div className="flex items-center space-x-3 sm:space-x-5 text-xs font-semibold overflow-x-auto scrollbar-none">
            {/* Phone */}
            <a
              id="topbar-phone"
              href={`tel:${rawPhone}`}
              className="flex items-center space-x-1.5 text-stone-300 hover:text-amber-400 transition-colors shrink-0"
              title="Telefonla arayın"
            >
              <Phone size={13} className="text-amber-500 shrink-0" />
              <span>{siteSettings?.phone || '0535 219 47 89'}</span>
            </a>

            {/* WhatsApp */}
            <a
              id="topbar-whatsapp"
              href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta, Çat Kapı üzerinden iletişime geçiyorum.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-stone-300 hover:text-emerald-400 transition-colors shrink-0"
              title="Nuri Usta WhatsApp"
            >
              <MessageCircle size={13} className="text-emerald-500 shrink-0" />
              <span>Nuri Usta WhatsApp</span>
            </a>

            {/* Location */}
            <div className="flex items-center space-x-1.5 text-stone-300 shrink-0">
              <MapPin size={13} className="text-amber-500 shrink-0" />
              <span>{siteSettings?.address ? 'Akdeniz, Mersin' : 'Akdeniz, Mersin'}</span>
            </div>
          </div>

          {/* Right Side: Instagram (Far Right) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <a
              id="topbar-instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-stone-300 hover:text-pink-400 font-bold text-xs transition-colors cursor-pointer"
              title="Instagram sayfamızı ziyaret edin"
            >
              <Instagram size={13} className="text-pink-500 shrink-0" />
              <span>{instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div id="main-nav" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex justify-between items-center">
        {/* Brand Logo with Hammer Icon matching screenshot */}
        <button
          id="navbar-brand-logo"
          onClick={() => handleTabChange('home')}
          className="flex items-center space-x-3 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black shadow-lg group-hover:scale-105 transition-transform">
            <Hammer size={20} className="text-black" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tight text-white flex items-center gap-1.5 uppercase font-sans">
              <span>ÇAT KAPI</span>
            </div>
          </div>
        </button>

        {/* Desktop Nav Items with bottom indicator matching screenshot */}
        <nav id="desktop-navigation" className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`py-1 text-sm font-black tracking-wider uppercase transition-all relative cursor-pointer ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Actions: Nuri Usta'yı Ara & Keşif Talep Et (Replaced Nuri Usta'ya Yaz) */}
        <div className="hidden lg:flex items-center space-x-2.5">
          <a
            id="navbar-phone-link"
            href={`tel:${rawPhone}`}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#1c1c1c] hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <Phone size={13} className="text-amber-500" />
            <span>NURİ USTA'YI ARA</span>
          </a>

          <a
            id="navbar-kesif-link"
            href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta, Çat Kapı üzerinden yerinde keşif ve mimari ölçü talebinde bulunmak istiyorum.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <MessageCircle size={14} />
            <span>KEŞİF TALEP ET</span>
          </a>
        </div>

        {/* Medium Screen Quick Action (Tablets) */}
        <div className="hidden md:flex lg:hidden items-center space-x-2">
          <a
            id="navbar-kesif-link-md"
            href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta, Çat Kapı üzerinden keşif talebinde bulunmak istiyorum.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all"
          >
            <MessageCircle size={13} />
            <span>KEŞİF TALEP ET</span>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-850 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 cursor-pointer"
            aria-label="Menüyü Aç"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-drawer" className="md:hidden bg-[#161616] border-b border-stone-800 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`p-3 rounded-xl text-xs font-bold transition-all text-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-stone-900/80 border border-stone-800 text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
            <a
              id="mobile-call-btn"
              href={`tel:${rawPhone}`}
              className="w-full py-2.5 bg-stone-850 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-xl border border-stone-750 flex items-center justify-center gap-2"
            >
              <Phone size={14} />
              <span>Nuri Usta'yı Ara: {siteSettings?.phone || '0535 219 47 89'}</span>
            </a>
            <a
              id="mobile-whatsapp-btn"
              href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta, Çat Kapı web sitenizden ulaşıyorum.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} />
              <span>Nuri Usta WhatsApp Hattı</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
