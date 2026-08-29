import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  disableNetwork,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category, SiteSettings } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SITE_SETTINGS,
} from '../data/mockData';
import {
  getDeletedProductIds,
  trackDeletedProductId,
  isPermanentlyRemovedProduct,
  PERMANENTLY_REMOVED_PRODUCT_IDS,
} from './storageManager';

// Firestore collection names
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const SETTINGS_COLLECTION = 'site_settings';
const GLOBAL_SETTINGS_DOC = 'global';
const TOMBSTONES_DOC = 'tombstones_meta';

// Persistent Circuit breaker key
const QUOTA_STORAGE_KEY = 'catkapi_firestore_quota_disabled_until';
let isQuotaExceeded = false;

// Check initially on module load
try {
  const disabledUntil = localStorage.getItem(QUOTA_STORAGE_KEY);
  if (disabledUntil) {
    const untilTime = parseInt(disabledUntil, 10);
    if (!isNaN(untilTime) && Date.now() < untilTime) {
      isQuotaExceeded = true;
      disableNetwork(db).catch(() => {});
    }
  }
} catch {
  // Ignore
}

function isQuotaDisabled(): boolean {
  if (isQuotaExceeded) return true;
  try {
    const disabledUntil = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (disabledUntil) {
      const untilTime = parseInt(disabledUntil, 10);
      if (!isNaN(untilTime) && Date.now() < untilTime) {
        isQuotaExceeded = true;
        disableNetwork(db).catch(() => {});
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return false;
}

function markQuotaExceeded(): void {
  isQuotaExceeded = true;
  try {
    // Disable Firestore network calls for 24 hours to prevent SDK retry backoff loops
    const disableUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(QUOTA_STORAGE_KEY, disableUntil.toString());
  } catch {
    // Ignore localStorage errors
  }
  try {
    disableNetwork(db).catch(() => {});
  } catch {
    // Ignore
  }
}

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
    code.includes('unavailable') ||
    msg.toLowerCase().includes('quota') ||
    msg.toLowerCase().includes('resource-exhausted') ||
    msg.toLowerCase().includes('limit exceeded') ||
    msg.toLowerCase().includes('maximum backoff')
  );
}

/**
 * Clean data for Firestore to avoid undefined fields
 */
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Sync and fetch cloud tombstones (deleted product IDs) - Read-only operation
 */
export async function syncCloudTombstones(): Promise<Set<string>> {
  const localDeleted = getDeletedProductIds();
  if (isQuotaDisabled()) return localDeleted;

  try {
    const tombstoneRef = doc(db, SETTINGS_COLLECTION, TOMBSTONES_DOC);
    const snap = await getDoc(tombstoneRef);
    let cloudDeletedList: string[] = [];
    if (snap.exists()) {
      cloudDeletedList = snap.data()?.deletedIds || [];
    }

    const mergedSet = new Set<string>([
      ...Array.from(localDeleted),
      ...cloudDeletedList,
      ...Array.from(PERMANENTLY_REMOVED_PRODUCT_IDS),
    ]);

    // Save back merged list to local storage
    mergedSet.forEach((id) => trackDeletedProductId(id));

    return mergedSet;
  } catch (err) {
    if (isQuotaError(err)) markQuotaExceeded();
    return localDeleted;
  }
}

/**
 * Record a deleted product ID in cloud tombstones
 */
export async function recordDeletedProductIdInCloud(productId: string): Promise<void> {
  trackDeletedProductId(productId);
  if (isQuotaDisabled()) return;
  try {
    const tombstoneRef = doc(db, SETTINGS_COLLECTION, TOMBSTONES_DOC);
    const snap = await getDoc(tombstoneRef);
    const existing = snap.exists() ? snap.data()?.deletedIds || [] : [];
    const set = new Set<string>([...existing, productId]);
    await setDoc(tombstoneRef, {
      deletedIds: Array.from(set),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (isQuotaError(e)) markQuotaExceeded();
  }
}

/**
 * Save or update a single product in Firestore immediately
 */
export async function saveSingleProductToFirestore(prod: Product): Promise<void> {
  if (!prod || !prod.id) return;
  if (isPermanentlyRemovedProduct(prod)) return;
  if (isQuotaDisabled()) return;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    await setDoc(docRef, cleanForFirestore(prod));
    console.log('[Firestore] Single product saved to cloud:', prod.id);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded();
      console.warn('[Firestore] Quota notice: Changes safely stored in offline local storage.');
    } else {
      console.warn('[Firestore] Single product save notice:', err);
    }
  }
}

/**
 * Delete a single product from Firestore immediately
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  trackDeletedProductId(productId);
  recordDeletedProductIdInCloud(productId).catch(() => {});
  if (isQuotaDisabled()) return;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    console.log('[Firestore] Product deleted from cloud:', productId);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded();
      console.warn('[Firestore] Quota notice: Product deleted locally.');
    } else {
      console.warn('[Firestore] Product delete notice:', err);
    }
  }
}

/**
 * Save all products to Firestore in safe chunked batches
 */
export async function saveProductsToFirestore(products: Product[]): Promise<void> {
  if (isQuotaDisabled()) {
    return;
  }

  const deletedSet = getDeletedProductIds();
  const validProducts = products.filter(
    (p) => p && p.id && !deletedSet.has(p.id) && !isPermanentlyRemovedProduct(p)
  );

  try {
    // 1. Fetch current cloud product IDs to know what to delete
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const currentCloudIds = new Set(snapshot.docs.map((d) => d.id));
    const newProductIds = new Set(validProducts.map((p) => p.id));

    // Chunk writes in groups of 40 to avoid Firestore limits
    const CHUNK_SIZE = 40;
    for (let i = 0; i < validProducts.length; i += CHUNK_SIZE) {
      const chunk = validProducts.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((prod) => {
        const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        batch.set(docRef, cleanForFirestore(prod));
      });
      await batch.commit();
    }

    // Delete products that no longer exist or are marked as deleted
    const toDelete = Array.from(currentCloudIds).filter(
      (id) => !newProductIds.has(id) || deletedSet.has(id)
    );
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
      markQuotaExceeded();
      console.warn('[Firestore] Quota limit reached; continuing with persistent local storage mode.');
      return;
    }
    console.warn('[Firestore] Syncing products with batch fallback:', error);
    // Fallback: save each product individually so one corrupt document doesn't fail everything
    try {
      await Promise.all(
        validProducts.map((prod) =>
          setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), cleanForFirestore(prod))
        )
      );
      console.log('[Firestore] Successfully synced products to cloud via individual setDoc');
    } catch (fallbackError) {
      if (isQuotaError(fallbackError)) {
        markQuotaExceeded();
      }
      console.warn('[Firestore] Fallback local storage active');
    }
  }
}

/**
 * Save all categories to Firestore in safe chunked batches
 */
export async function saveCategoriesToFirestore(categories: Category[]): Promise<void> {
  if (isQuotaDisabled()) return;

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
      markQuotaExceeded();
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
        markQuotaExceeded();
      }
      console.warn('[Firestore] Fallback local storage active for categories');
    }
  }
}

/**
 * Save global site settings to Firestore
 */
export async function saveSiteSettingsToFirestore(settings: SiteSettings): Promise<void> {
  if (isQuotaDisabled()) return;

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC);
    await setDoc(docRef, cleanForFirestore(settings));
    console.log('[Firestore] Successfully synced site settings to cloud');
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExceeded();
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
  if (isQuotaDisabled()) {
    return () => {};
  }

  const unsubscribers: Unsubscribe[] = [];

  try {
    // 1. Subscribe to Products collection
    const unsubProducts = onSnapshot(
      collection(db, PRODUCTS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const deletedSet = getDeletedProductIds();
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (data && data.id) {
              if (!deletedSet.has(data.id) && !isPermanentlyRemovedProduct(data)) {
                prods.push(data);
              }
            }
          });
          onUpdate({ products: prods });
        }
      },
      (err) => {
        if (isQuotaError(err)) {
          markQuotaExceeded();
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
          markQuotaExceeded();
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
          markQuotaExceeded();
        }
        console.warn('[Firestore] Site settings subscription notice:', err);
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubSettings);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExceeded();
    }
    console.warn('[Firestore] Subscription init notice:', err);
    if (onError) onError(err);
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

/**
 * Initial cloud data fetch: Safely reads cloud state without performing unsolicited writes
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
  if (isQuotaDisabled()) {
    return {
      products: localProducts?.length > 0 ? localProducts : INITIAL_PRODUCTS,
      categories: localCategories?.length > 0 ? localCategories : INITIAL_CATEGORIES,
      siteSettings: localSettings?.companyName ? localSettings : INITIAL_SITE_SETTINGS,
    };
  }

  try {
    // 0. Sync tombstones first (read-only)
    const deletedSet = await syncCloudTombstones();

    // Check if products exist in cloud
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    let cloudProducts: Product[] = [];

    if (productsSnap.empty) {
      cloudProducts = (localProducts?.length > 0 ? localProducts : INITIAL_PRODUCTS).filter(
        (p) => p && p.id && !deletedSet.has(p.id) && !isPermanentlyRemovedProduct(p)
      );
    } else {
      productsSnap.forEach((docSnap) => {
        const prod = docSnap.data() as Product;
        if (prod && prod.id) {
          if (!deletedSet.has(prod.id) && !isPermanentlyRemovedProduct(prod)) {
            cloudProducts.push(prod);
          }
        }
      });

      // Merge: If local storage has any products not yet in cloud, include them in memory
      if (localProducts && localProducts.length > 0) {
        const cloudIdSet = new Set(cloudProducts.map((p) => p.id));
        const localNew = localProducts.filter(
          (p) => p && p.id && !cloudIdSet.has(p.id) && !deletedSet.has(p.id) && !isPermanentlyRemovedProduct(p)
        );
        if (localNew.length > 0) {
          cloudProducts = [...localNew, ...cloudProducts];
        }
      }
    }

    // Check if categories exist in cloud
    const categoriesSnap = await getDocs(collection(db, CATEGORIES_COLLECTION));
    let cloudCategories: Category[] = [];

    if (categoriesSnap.empty) {
      cloudCategories = localCategories?.length > 0 ? localCategories : INITIAL_CATEGORIES;
    } else {
      categoriesSnap.forEach((docSnap) => {
        cloudCategories.push(docSnap.data() as Category);
      });

      // Merge: If local storage has custom categories not yet in cloud, preserve them in memory
      if (localCategories && localCategories.length > 0) {
        const cloudCatIdSet = new Set(cloudCategories.map((c) => c.id));
        const localCatNew = localCategories.filter((c) => !cloudCatIdSet.has(c.id));
        if (localCatNew.length > 0) {
          cloudCategories = [...cloudCategories, ...localCatNew];
        }
      }
    }

    // Check if site settings exist in cloud
    const settingsSnap = await getDoc(doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC));
    let cloudSettings: SiteSettings;

    if (!settingsSnap.exists()) {
      cloudSettings = localSettings?.companyName ? localSettings : INITIAL_SITE_SETTINGS;
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
      markQuotaExceeded();
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
