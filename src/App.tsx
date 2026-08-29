import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Corporate } from './components/Corporate';
import { HomeShowcase } from './components/HomeShowcase';
import { Showroom } from './components/Showroom';
import { CustomProduction } from './components/CustomProduction';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminSecurityModal } from './components/AdminSecurityModal';
import { AdminUnifiedCms } from './components/AdminUnifiedCms';

import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SITE_SETTINGS,
} from './data/mockData';
import { Product, Category, SiteSettings, MainTabType } from './types';
import { MessageCircle, Phone, ArrowUp } from 'lucide-react';
import {
  saveProductsToFirestore,
  saveCategoriesToFirestore,
  saveSiteSettingsToFirestore,
  subscribeToFirestoreData,
  initializeCloudDatabaseIfEmpty,
  deleteProductFromFirestore,
  syncCloudTombstones,
} from './services/firestoreSync';
import {
  persistProducts,
  persistCategories,
  persistSiteSettings,
  loadPersistedData,
  getDeletedProductIds,
  isPermanentlyRemovedProduct,
  PERMANENTLY_REMOVED_PRODUCT_IDS,
  PERMANENTLY_REMOVED_NAMES,
} from './services/storageManager';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTabType>('home');

  // Helper to filter out any removed products
  const filterActiveProducts = (list: Product[]): Product[] => {
    const deletedSet = getDeletedProductIds();
    return (list || []).filter(
      (p) =>
        p &&
        p.id &&
        !deletedSet.has(p.id) &&
        !isPermanentlyRemovedProduct(p)
    );
  };

  // Persistence for products, categories, siteSettings
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('catkapi_products_v1') || localStorage.getItem('catkapi_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = filterActiveProducts(parsed);
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('catkapi_categories_v1') || localStorage.getItem('catkapi_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATEGORIES;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('catkapi_site_settings_v1') || localStorage.getItem('catkapi_site_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SITE_SETTINGS;
  });

  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isAdminCmsOpen, setIsAdminCmsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // IndexedDB & Cloud Database Sync on initial load
  useEffect(() => {
    let isMounted = true;

    // Helper to safely merge local and cloud products without losing user-added products
    const mergeSafeProducts = (localList: Product[], cloudList: Product[]): Product[] => {
      const deletedSet = getDeletedProductIds();
      const map = new Map<string, Product>();

      const isAllowed = (p: Product) => {
        if (!p || !p.id) return false;
        if (deletedSet.has(p.id)) return false;
        if (isPermanentlyRemovedProduct(p)) return false;
        return true;
      };

      // 1. Put cloud products
      (cloudList || []).forEach((p) => {
        if (isAllowed(p)) {
          map.set(p.id, p);
        }
      });

      // 2. Put local products (preserving all user creations)
      (localList || []).forEach((p) => {
        if (isAllowed(p)) {
          map.set(p.id, p);
        }
      });

      return Array.from(map.values());
    };

    // Helper to safely merge categories
    const mergeSafeCategories = (localCats: Category[], cloudCats: Category[]): Category[] => {
      const map = new Map<string, Category>();
      (cloudCats || []).forEach((c) => {
        if (c && c.id) map.set(c.id, c);
      });
      (localCats || []).forEach((c) => {
        if (c && c.id) map.set(c.id, c);
      });
      return Array.from(map.values());
    };

    // 1. First Load large-scale persistent storage (IndexedDB)
    loadPersistedData()
      .then(async (persisted) => {
        if (!isMounted) return;

        let activeProducts = products;
        let activeCategories = categories;
        let activeSettings = siteSettings;

        if (persisted.products && persisted.products.length > 0) {
          activeProducts = persisted.products;
          setProducts(activeProducts);
        }
        if (persisted.categories && persisted.categories.length > 0) {
          activeCategories = persisted.categories;
          setCategories(activeCategories);
        }
        if (persisted.siteSettings && persisted.siteSettings.companyName) {
          activeSettings = persisted.siteSettings;
          setSiteSettings(activeSettings);
        }

        // 2. Initialize or fetch cloud database and merge safely
        try {
          const cloudData = await initializeCloudDatabaseIfEmpty(activeProducts, activeCategories, activeSettings);
          if (!isMounted) return;

          if (cloudData.products && cloudData.products.length > 0) {
            setProducts((prev) => {
              const combined = mergeSafeProducts(prev, cloudData.products);
              persistProducts(combined);
              return combined;
            });
          }
          if (cloudData.categories && cloudData.categories.length > 0) {
            setCategories((prev) => {
              const combinedCats = mergeSafeCategories(prev, cloudData.categories);
              persistCategories(combinedCats);
              return combinedCats;
            });
          }
          if (cloudData.siteSettings && cloudData.siteSettings.companyName) {
            setSiteSettings(cloudData.siteSettings);
            persistSiteSettings(cloudData.siteSettings);
          }
        } catch (err) {
          console.warn('[Firestore] Cloud init notice:', err);
        }
      })
      .catch((e) => console.warn('[Storage] Load error:', e));

    // 3. Subscribe to live Firestore updates across all devices
    const unsubscribe = subscribeToFirestoreData(({ products: newProds, categories: newCats, siteSettings: newSettings }) => {
      if (!isMounted) return;

      if (newProds && newProds.length > 0) {
        setProducts((prev) => {
          const combined = mergeSafeProducts(prev, newProds);
          persistProducts(combined);
          return combined;
        });
      }
      if (newCats && newCats.length > 0) {
        setCategories((prev) => {
          const combinedCats = mergeSafeCategories(prev, newCats);
          persistCategories(combinedCats);
          return combinedCats;
        });
      }
      if (newSettings && newSettings.companyName) {
        setSiteSettings(newSettings);
        persistSiteSettings(newSettings);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync state to IndexedDB, LocalStorage AND Cloud Firestore
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    persistProducts(newProducts);
    try {
      localStorage.setItem('catkapi_products_v1', JSON.stringify(newProducts));
    } catch (e) {
      console.warn(e);
    }
    // Save to Cloud Firestore
    saveProductsToFirestore(newProducts).catch((err) => {
      console.warn('[Firestore] Sync notice (saved safely in storage):', err);
    });
  };

  const handleUpdateCategories = (newCats: Category[]) => {
    setCategories(newCats);
    persistCategories(newCats);
    try {
      localStorage.setItem('catkapi_categories_v1', JSON.stringify(newCats));
    } catch (e) {
      console.warn(e);
    }
    // Save to Cloud Firestore
    saveCategoriesToFirestore(newCats).catch((err) => {
      console.warn('[Firestore] Sync notice (saved safely in storage):', err);
    });
  };

  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    persistSiteSettings(newSettings);
    try {
      localStorage.setItem('catkapi_site_settings_v1', JSON.stringify(newSettings));
    } catch (e) {
      console.warn(e);
    }
    // Save to Cloud Firestore
    saveSiteSettingsToFirestore(newSettings).catch((err) => {
      console.warn('[Firestore] Sync notice (saved safely in storage):', err);
    });
  };

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: MainTabType) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rawPhone = (siteSettings?.phone || '0535 219 47 89').replace(/\s+/g, '');
  const rawWhatsApp = (siteSettings?.whatsapp || '0535 219 47 89').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#111111] text-[#e5e5e5] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAdminCms={() => setIsAdminAuthModalOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Main Content Render */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && (
          <>
            {/* Carousel Hero */}
            <Hero
              siteSettings={siteSettings}
              onDiscoverShowroom={() => handleTabChange('products')}
              onOpenCustomProduction={() => handleTabChange('custom-production')}
              onNavigateTab={handleTabChange}
            />

            {/* Vitrin & Atölyeden Yeni Çıkan Modeller (Showcase of all products) */}
            <HomeShowcase
              products={products}
              categories={categories}
              onSelectProductDetail={(product) => setSelectedProductDetail(product)}
              onDiscoverAll={() => handleTabChange('products')}
              onOpenCustomProduction={() => handleTabChange('custom-production')}
            />

            {/* Corporate Profile & Values (Mersin'in Lokal Değeri Kartı) */}
            <Corporate siteSettings={siteSettings} onNavigateTab={handleTabChange} />
          </>
        )}

        {currentTab === 'products' && (
          <div className="py-6">
            <Showroom
              products={products}
              categories={categories}
              onOpenConfigurator={() => handleTabChange('custom-production')}
              onSelectProductDetail={(product) => setSelectedProductDetail(product)}
            />
          </div>
        )}

        {currentTab === 'custom-production' && (
          <div className="py-6">
            <CustomProduction products={products} categories={categories} />
          </div>
        )}

        {currentTab === 'contact' && (
          <div className="py-6">
            <ContactSection siteSettings={siteSettings} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        currentTab={currentTab}
        siteSettings={siteSettings}
        onNavigateTab={handleTabChange}
        onOpenAdminCms={() => setIsAdminAuthModalOpen(true)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            aria-label="Yukarı Çık"
            className="w-11 h-11 bg-stone-900/90 hover:bg-amber-500 hover:text-black text-stone-200 border border-stone-750 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-sm cursor-pointer"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* WhatsApp Circular Floating Button with Tooltip (Matching Image 1) */}
        <div className="relative group flex items-center">
          {/* Hover Tooltip: "Nuri Usta WhatsApp İletişim" */}
          <div
            id="whatsapp-hover-tooltip"
            className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap bg-[#1a1a1a] text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-1.5 z-50"
          >
            <span>Nuri Usta WhatsApp İletişim</span>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a1a1a] border-t border-r border-stone-700 rotate-45"></div>
          </div>

          <a
            id="floating-whatsapp-btn"
            href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Merhaba Nuri Usta (Çat Kapı), web siteniz üzerinden ulaşıyorum. Özel üretim ve mimari çözümleriniz hakkında bilgi almak istiyorum.')}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nuri Usta WhatsApp İletişim"
            className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-emerald-400/40 relative z-40"
          >
            <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
          </a>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />

      {/* Admin PIN Auth Modal */}
      <AdminSecurityModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAdminCmsOpen(true);
        }}
      />

      {/* Admin Unified CMS Fullscreen Modal */}
      {isAdminCmsOpen && (
        <AdminUnifiedCms
          products={products}
          categories={categories}
          siteSettings={siteSettings}
          onUpdateProducts={handleUpdateProducts}
          onUpdateCategories={handleUpdateCategories}
          onUpdateSiteSettings={handleUpdateSiteSettings}
          onClose={() => setIsAdminCmsOpen(false)}
          onNavigateToProducts={() => {
            setIsAdminCmsOpen(false);
            handleTabChange('products');
          }}
        />
      )}
    </div>
  );
}
