import { Product, Category, SiteSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SITE_SETTINGS } from '../data/mockData';

const DB_NAME = 'catkapi_db_v1';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_CATEGORIES = 'categories';
const STORE_SETTINGS = 'site_settings';
const DELETED_PRODUCTS_KEY = 'catkapi_deleted_product_ids';

// Track deleted product IDs to prevent ghost restoration from cloud snapshots
export function trackDeletedProductId(id: string): void {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    set.add(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('[Storage] trackDeletedProductId error:', e);
  }
}

export function getDeletedProductIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

// Open IndexedDB safely with fallback
function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save array of products to IndexedDB and LocalStorage
 */
export async function persistProducts(products: Product[]): Promise<void> {
  // 1. Save to LocalStorage
  try {
    const serialized = JSON.stringify(products);
    localStorage.setItem('catkapi_products_v1', serialized);
    localStorage.setItem('catkapi_products', serialized);
  } catch (err) {
    console.warn('[Storage] LocalStorage full or blocked for products, saving to IndexedDB');
  }

  // 2. Save to IndexedDB
  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = tx.objectStore(STORE_PRODUCTS);
    store.clear();
    for (const p of products) {
      store.put(p);
    }
  } catch (idbErr) {
    console.warn('[Storage] IndexedDB put error:', idbErr);
  }
}

/**
 * Save array of categories to IndexedDB and LocalStorage
 */
export async function persistCategories(categories: Category[]): Promise<void> {
  try {
    const serialized = JSON.stringify(categories);
    localStorage.setItem('catkapi_categories_v1', serialized);
    localStorage.setItem('catkapi_categories', serialized);
  } catch (err) {
    console.warn('[Storage] LocalStorage full for categories');
  }

  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIES);
    store.clear();
    for (const c of categories) {
      store.put(c);
    }
  } catch (idbErr) {
    console.warn('[Storage] IndexedDB put error for categories:', idbErr);
  }
}

/**
 * Save Site Settings to IndexedDB and LocalStorage
 */
export async function persistSiteSettings(settings: SiteSettings): Promise<void> {
  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem('catkapi_site_settings_v1', serialized);
    localStorage.setItem('catkapi_site_settings', serialized);
  } catch (err) {
    console.warn('[Storage] LocalStorage full for settings');
  }

  try {
    const db = await openIndexedDb();
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    store.put({ id: 'global', ...settings });
  } catch (idbErr) {
    console.warn('[Storage] IndexedDB put error for settings:', idbErr);
  }
}

/**
 * Load all data from IndexedDB or LocalStorage
 */
export async function loadPersistedData(): Promise<{
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
}> {
  let products: Product[] | null = null;
  let categories: Category[] | null = null;
  let siteSettings: SiteSettings | null = null;

  // 1. Try IndexedDB first (which holds largest dataset)
  try {
    const db = await openIndexedDb();

    // Read products
    const pTx = db.transaction(STORE_PRODUCTS, 'readonly');
    const pStore = pTx.objectStore(STORE_PRODUCTS);
    const pRequest = pStore.getAll();
    const idbProducts = await new Promise<Product[]>((res) => {
      pRequest.onsuccess = () => res(pRequest.result || []);
      pRequest.onerror = () => res([]);
    });

    if (idbProducts && idbProducts.length > 0) {
      products = idbProducts;
    }

    // Read categories
    const cTx = db.transaction(STORE_CATEGORIES, 'readonly');
    const cStore = cTx.objectStore(STORE_CATEGORIES);
    const cRequest = cStore.getAll();
    const idbCategories = await new Promise<Category[]>((res) => {
      cRequest.onsuccess = () => res(cRequest.result || []);
      cRequest.onerror = () => res([]);
    });

    if (idbCategories && idbCategories.length > 0) {
      categories = idbCategories;
    }

    // Read settings
    const sTx = db.transaction(STORE_SETTINGS, 'readonly');
    const sStore = sTx.objectStore(STORE_SETTINGS);
    const sRequest = sStore.get('global');
    const idbSettings = await new Promise<SiteSettings | null>((res) => {
      sRequest.onsuccess = () => res(sRequest.result || null);
      sRequest.onerror = () => res(null);
    });

    if (idbSettings && idbSettings.companyName) {
      siteSettings = idbSettings;
    }
  } catch (idbErr) {
    console.warn('[Storage] IndexedDB read error, falling back to localStorage:', idbErr);
  }

  // 2. Fallback to LocalStorage if IndexedDB was empty
  if (!products || products.length === 0) {
    try {
      const localP = localStorage.getItem('catkapi_products_v1') || localStorage.getItem('catkapi_products');
      if (localP) {
        products = JSON.parse(localP);
      }
    } catch {
      products = null;
    }
  }

  if (!categories || categories.length === 0) {
    try {
      const localC = localStorage.getItem('catkapi_categories_v1') || localStorage.getItem('catkapi_categories');
      if (localC) {
        categories = JSON.parse(localC);
      }
    } catch {
      categories = null;
    }
  }

  if (!siteSettings || !siteSettings.companyName) {
    try {
      const localS = localStorage.getItem('catkapi_site_settings_v1') || localStorage.getItem('catkapi_site_settings');
      if (localS) {
        siteSettings = JSON.parse(localS);
      }
    } catch {
      siteSettings = null;
    }
  }

  return {
    products: products && products.length > 0 ? products : INITIAL_PRODUCTS,
    categories: categories && categories.length > 0 ? categories : INITIAL_CATEGORIES,
    siteSettings: siteSettings && siteSettings.companyName ? siteSettings : INITIAL_SITE_SETTINGS,
  };
}

/**
 * Export all database content to a downloadable JSON file
 */
export function exportDatabaseBackup(
  products: Product[],
  categories: Category[],
  siteSettings: SiteSettings
): void {
  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Çat Kapı Ahşap & Mobilya',
    products,
    categories,
    siteSettings,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `catkapi_mobilya_yedek_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import database backup from a JSON file
 */
export function importDatabaseBackup(
  file: File
): Promise<{ products: Product[]; categories: Category[]; siteSettings: SiteSettings }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.products || !Array.isArray(parsed.products)) {
          throw new Error('Geçersiz yedek dosyası: Ürün listesi bulunamadı.');
        }

        const validProducts = parsed.products as Product[];
        const validCategories = Array.isArray(parsed.categories) ? (parsed.categories as Category[]) : INITIAL_CATEGORIES;
        const validSettings = parsed.siteSettings ? (parsed.siteSettings as SiteSettings) : INITIAL_SITE_SETTINGS;

        // Persist immediately
        await persistProducts(validProducts);
        await persistCategories(validCategories);
        await persistSiteSettings(validSettings);

        resolve({
          products: validProducts,
          categories: validCategories,
          siteSettings: validSettings,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsText(file);
  });
}
