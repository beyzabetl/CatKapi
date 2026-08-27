import React from 'react';
import { MainTabType, SiteSettings } from '../types';

interface FooterProps {
  currentTab?: MainTabType;
  siteSettings?: SiteSettings;
  onNavigateTab: (tab: MainTabType) => void;
  onOpenAdminCms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentTab = 'home',
  onNavigateTab,
  onOpenAdminCms,
}) => {
  return (
    <footer id="app-footer" className="w-full bg-[#0d0d0d] text-white border-t border-stone-850 pt-12 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Quick Links Only */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
            Hızlı Gezinti
          </h4>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <button
              id="footer-nav-home"
              onClick={() => onNavigateTab('home')}
              className="text-stone-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Ana Sayfa
            </button>
            <button
              id="footer-nav-products"
              onClick={() => onNavigateTab('products')}
              className="text-stone-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Ürünler
            </button>
            <button
              id="footer-nav-custom-production"
              onClick={() => onNavigateTab('custom-production')}
              className="text-stone-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Özel Üretim
            </button>
            <button
              id="footer-nav-contact"
              onClick={() => onNavigateTab('contact')}
              className="text-stone-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              İletişim
            </button>
          </nav>
        </div>

        {/* Centered Copyright Line with subtle hidden admin trigger */}
        <div className="pt-6 border-t border-stone-850 flex flex-col items-center justify-center text-center text-xs text-stone-400 space-y-1">
          <p>© 2025 Çat Kapı-Tüm Hakları Saklıdır</p>
          {currentTab === 'home' && onOpenAdminCms && (
            <button
              id="footer-secret-cms-btn"
              onClick={onOpenAdminCms}
              className="text-[9px] text-[#0e0e0e] hover:text-stone-600 transition-colors duration-500 font-mono tracking-widest cursor-pointer select-none outline-none mt-0.5"
              aria-label="CMS"
            >
              cms
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
