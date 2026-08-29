import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, SiteSettings } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SITE_SETTINGS,
} from '../data/mockData';

// Firestore collection names
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'site_settings';
const GLOBAL_SETTINGS_DOC = 'global';

// Circuit breaker for Firestore quota or connectivity limits
let isQuotaExceeded = false;

function isQuotaError(err: unknown): boolean {
  if (!err) return false;
  const msg = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as { message?: unknown }).message)
    : String(err);
  const code = typeof err === 'object' && err !== null && 'code' in err
    ? String((err as { code?: unknown }).code)
    : '';
  return (
    code.includes('resource-exhausted') ||
    code.includes('quota') ||
    msg.toLowerCase().includes('quota') ||
    msg.toLowerCase().includes('resource-exhausted') ||
    msg.toLowerCase().includes('limit exceeded')
  );
}

/**
 * Clean data for Firestore to avoid undefined fields
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Save or update a single product in Firestore immediately
 */
export async function saveSingleProductToFirestore(prod: Product): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    await setDoc(docRef, cleanForFirestore(prod));
    console.log('[Firestore] Single product saved to cloud:', prod.id);
  } catch (err) {
    if (isQuotaError(err)) {
      isQuotaExceeded = true;
    }
    console.warn('[Firestore] Single product save notice:', err);
  }
}

/**
 * Delete a single product from Firestore immediately
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  if (isQuotaExceeded) return;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    console.log('[Firestore] Product deleted from cloud:', productId);
  } catch (err) {
    if (isQuotaError(err)) {
      isQuotaExceeded = true;
    }
    console.warn('[Firestore] Product delete notice:', err);
  }
}

/**
 * Save all products to Firestore in safe chunked batches
 */
export async function saveProductsToFirestore(products: Product[]): Promise<void> {
  if (isQuotaExceeded) {
    // If daily quota is exceeded, data is safely saved in localStorage
    return;
  }

  try {
    // 1. Fetch current cloud product IDs to know what to delete
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const currentCloudIds = new Set(snapshot.docs.map((d) => d.id));
    const newProductIds = new Set(products.map((p) => p.id));

    // Chunk writes in groups of 40 to avoid Firestore limits
    const CHUNK_SIZE = 40;
    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((prod) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(docRef, cleanForFirestore(prod));
      });
      await batch.commit();
    }

    // Delete products that no longer exist
    const toDelete = Array.from(currentCloudIds).filter((id) => !newProductIds.has(id));
    for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
      const chunk = toDelete.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, id);
        batch.delete(docRef);
      });
      await batch.commit();
    }

    console.log('[Firestore] Successfully synced products to cloud');
  } catch (error) {
    if (isQuotaError(error)) {
      isQuotaExceeded = true;
      console.warn('[Firestore] Quota limit reached; continuing with persistent local storage mode.');
      return;
    }
    console.warn('[Firestore] Syncing products with batch fallback:', error);
    // Fallback: save each product individually so one corrupt document doesn't fail everything
    try {
      await Promise.all(
        products.map((prod) =>
          setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), cleanForFirestore(prod))
        )
      );
      console.log('[Firestore] Successfully synced products to cloud via individual setDoc');
    } catch (fallbackError) {
      if (isQuotaError(fallbackError)) {
        isQuotaExceeded = true;
      }
      console.warn('[Firestore] Fallback local storage active');
    }
  }
}

/**
 * Save all categories to Firestore in safe chunked batches
 */
export async function saveCategoriesToFirestore(categories: Category[]): Promise<void> {
  if (isQuotaExceeded) return;

  try {
    const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    const currentCloudIds = new Set(snapshot.docs.map((d) => d.id));
    const newCatIds = new Set(categories.map((c) => c.id));

    const CHUNK_SIZE = 40;
    for (let i = 0; i < categories.length; i += CHUNK_SIZE) {
      const chunk = categories.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((cat) => {
        const docRef = doc(db, CATEGORIES_COLLECTION, cat.id);
        batch.set(docRef, cleanForFirestore(cat));
      });
      await batch.commit();
    }

    const toDelete = Array.from(currentCloudIds).filter((id) => !newCatIds.has(id));
    for (let i = 0; i < toDelete.length; i += CHUNK_SIZE) {
      const chunk = toDelete.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((id) => {
        const docRef = doc(db, CATEGORIES_COLLECTION, id);
        batch.delete(docRef);
      });
      await batch.commit();
    }

    console.log('[Firestore] Successfully synced categories to cloud');
  } catch (error) {
    if (isQuotaError(error)) {
      isQuotaExceeded = true;
      console.warn('[Firestore] Quota limit reached; continuing with local storage mode.');
      return;
    }
    console.warn('[Firestore] Syncing categories with batch fallback:', error);
    try {
      await Promise.all(
        categories.map((cat) =>
          setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cleanForFirestore(cat))
        )
      );
      console.log('[Firestore] Successfully synced categories to cloud via individual setDoc');
    } catch (fallbackError) {
      if (isQuotaError(fallbackError)) {
        isQuotaExceeded = true;
      }
      console.warn('[Firestore] Fallback local storage active for categories');
    }
  }
}

/**
 * Save global site settings to Firestore
 */
export async function saveSiteSettingsToFirestore(settings: SiteSettings): Promise<void> {
  if (isQuotaExceeded) return;

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    await setDoc(docRef, cleanForFirestore(settings));
    console.log('[Firestore] Successfully synced site settings to cloud');
  } catch (error) {
    if (isQuotaError(error)) {
      isQuotaExceeded = true;
      console.warn('[Firestore] Quota reached for settings, saved to local storage.');
      return;
    }
    console.warn('[Firestore] Warning saving site settings (local storage active):', error);
  }
}

/**
 * Real-time subscription to Firestore data
 */
export function subscribeToFirestoreData(
  onUpdate: (data: {
    products?: Product[];
    categories?: Category[];
    siteSettings?: SiteSettings;
  }) => void,
  onError?: (err: unknown) => void
): () => void {
  if (isQuotaExceeded) {
    return () => {};
  }

  const unsubscribers: Unsubscribe[] = [];

  try {
    // 1. Subscribe to Products collection
    const unsubProducts = onSnapshot(
      collection(db, PRODUCTS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            prods.push(docSnap.data() as Product);
          });
          onUpdate({ products: prods });
        }
      },
      (err) => {
        if (isQuotaError(err)) {
          isQuotaExceeded = true;
          console.warn('[Firestore] Daily quota limit reached; switched to persistent offline local mode.');
        } else {
          console.warn('[Firestore] Products subscription notice:', err);
        }
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubProducts);

    // 2. Subscribe to Categories collection
    const unsubCats = onSnapshot(
      collection(db, CATEGORIES_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const cats: Category[] = [];
          snapshot.forEach((docSnap) => {
            cats.push(docSnap.data() as Category);
          });
          onUpdate({ categories: cats });
        }
      },
      (err) => {
        if (isQuotaError(err)) {
          isQuotaExceeded = true;
        }
        console.warn('[Firestore] Categories subscription notice:', err);
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubCats);

    // 3. Subscribe to Site Settings document
    const unsubSettings = onSnapshot(
      doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC),
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate({ siteSettings: docSnap.data() as SiteSettings });
        }
      },
      (err) => {
        if (isQuotaError(err)) {
          isQuotaExceeded = true;
        }
        console.warn('[Firestore] Site settings subscription notice:', err);
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubSettings);
  } catch (err) {
    if (isQuotaError(err)) {
      isQuotaExceeded = true;
    }
    console.warn('[Firestore] Subscription init notice:', err);
    if (onError) onError(err);
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Initial cloud seed: If cloud database is empty, seed from current local state or mock data
 */
export async function initializeCloudDatabaseIfEmpty(
  localProducts: Product[],
  localCategories: Category[],
  localSettings: SiteSettings
): Promise<{
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
}> {
  if (isQuotaExceeded) {
    return {
      products: localProducts?.length > 0 ? localProducts : INITIAL_PRODUCTS,
      categories: localCategories?.length > 0 ? localCategories : INITIAL_CATEGORIES,
      siteSettings: localSettings?.companyName ? localSettings : INITIAL_SITE_SETTINGS,
    };
  }

  try {
    // Check if products exist in cloud
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    let cloudProducts: Product[] = [];

    if (productsSnap.empty) {
      console.log('[Firestore] Initializing cloud products from local storage...');
      const seedProducts = localProducts?.length > 0 ? localProducts : INITIAL_PRODUCTS;
      await saveProductsToFirestore(seedProducts);
      cloudProducts = seedProducts;
    } else {
      productsSnap.forEach((docSnap) => {
        cloudProducts.push(docSnap.data() as Product);
      });

      // Merge: If local storage has any newly added products not yet in cloud, upload and keep them
      if (localProducts && localProducts.length > 0) {
        const cloudIdSet = new Set(cloudProducts.map((p) => p.id));
        const localNew = localProducts.filter((p) => !cloudIdSet.has(p.id));
        if (localNew.length > 0) {
          console.log('[Firestore] Preserving and uploading local products to cloud:', localNew.length);
          cloudProducts = [...localNew, ...cloudProducts];
          await saveProductsToFirestore(cloudProducts);
        }
      }
    }

    // Check if categories exist in cloud
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    let cloudCategories: Category[] = [];

    if (categoriesSnap.empty) {
      console.log('[Firestore] Initializing cloud categories from local storage...');
      const seedCategories = localCategories?.length > 0 ? localCategories : INITIAL_CATEGORIES;
      await saveCategoriesToFirestore(seedCategories);
      cloudCategories = seedCategories;
    } else {
      categoriesSnap.forEach((docSnap) => {
        cloudCategories.push(docSnap.data() as Category);
      });

      // Merge: If local storage has custom categories not yet in cloud, preserve them
      if (localCategories && localCategories.length > 0) {
        const cloudCatIdSet = new Set(cloudCategories.map((c) => c.id));
        const localCatNew = localCategories.filter((c) => !cloudCatIdSet.has(c.id));
        if (localCatNew.length > 0) {
          console.log('[Firestore] Preserving and uploading local categories to cloud:', localCatNew.length);
          cloudCategories = [...cloudCategories, ...localCatNew];
          await saveCategoriesToFirestore(cloudCategories);
        }
      }
    }

    // Check if site settings exist in cloud
    const settingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC));
    let cloudSettings: SiteSettings;

    if (!settingsSnap.exists()) {
      console.log('[Firestore] Initializing cloud site settings from local storage...');
      const seedSettings = localSettings?.companyName ? localSettings : INITIAL_SITE_SETTINGS;
      await saveSiteSettingsToFirestore(seedSettings);
      cloudSettings = seedSettings;
    } else {
      cloudSettings = settingsSnap.data() as SiteSettings;
    }

    return {
      products: cloudProducts,
      categories: cloudCategories,
      siteSettings: cloudSettings,
    };
  } catch (error) {
    if (isQuotaError(error)) {
      isQuotaExceeded = true;
      console.warn('[Firestore] Free daily quota reached; seamlessly serving all products and edits from local storage.');
    } else {
      console.warn('[Firestore] Initialization notice (using local storage):', error);
    }
    return {
      products: localProducts?.length > 0 ? localProducts : INITIAL_PRODUCTS,
      categories: localCategories?.length > 0 ? localCategories : INITIAL_CATEGORIES,
      siteSettings: localSettings?.companyName ? localSettings : INITIAL_SITE_SETTINGS,
    };
  }
}
