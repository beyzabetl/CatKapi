import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Phone,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  X,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Globe,
  Instagram,
  MessageCircle,
  Search,
  Mail,
  AlertTriangle,
  Upload,
  Film,
  Archive,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Star,
  LogOut,
  User,
  Facebook,
  Youtube,
  Music,
  Link as LinkIcon,
  Video,
  FolderTree,
  Tag,
  Download,
  Database,
  UploadCloud,
  FileJson,
} from 'lucide-react';
import {
  Product,
  Category,
  SiteSettings,
  ManufacturingParams,
  ContactCardItem,
  ContactCardIconType,
  HeroSlide,
  QualityPrinciple,
  SocialLink,
} from '../types';
import { MediaGalleryUploader } from './MediaGalleryUploader';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  trackDeletedProductId,
  isPermanentlyRemovedProduct,
  getDeletedProductIds,
} from '../services/storageManager';
import {
  deleteProductFromFirestore,
  saveSingleProductToFirestore,
  saveProductsToFirestore,
} from '../services/firestoreSync';

interface AdminUnifiedCmsProps {
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings;
  onUpdateProducts: (newProducts: Product[]) => void;
  onUpdateCategories: (newCats: Category[]) => void;
  onUpdateSiteSettings: (newSettings: SiteSettings) => void;
  onClose: () => void;
  onNavigateToProducts?: () => void;
}

type CmsTab = 'products' | 'hero' | 'archive';
type ContentSubTab = 'slider' | 'promo' | 'contact';

export const AdminUnifiedCms: React.FC<AdminUnifiedCmsProps> = ({
  products,
  categories,
  siteSettings,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateSiteSettings,
  onClose,
  onNavigateToProducts,
}) => {
  const [activeTab, setActiveTab] = useState<CmsTab>('products');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // SubTab in Arşiv Sistemi
  const [archiveSubFilter, setArchiveSubFilter] = useState<'all' | 'products' | 'categories' | 'subcategories'>('all');

  // SubTab in Sayfa İçerik Yönetimi
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('slider');

  // Currently expanded slide for editing in Slider tab
  const [editingSlideId, setEditingSlideId] = useState<string | null>(() => {
    return siteSettings?.heroSlides?.[1]?.id || siteSettings?.heroSlides?.[0]?.id || 'hs-1';
  });

  // Global Search Filter in Top Bar
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Category & Subcategory Filter in Left Panel
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState<string | null>(null);

  // Expanded Categories in Tree (all closed by default)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Editing / Active Product in Right Panel
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    return products[0]?.id || null;
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(() => {
    return products[0] ? { ...products[0] } : null;
  });

  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);

  // Category Edit Modals / Inline states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempCatName, setTempCatName] = useState('');
  const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);
  const [tempSubCatName, setTempSubCatName] = useState('');

  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');

  const [addingSubCatToParentId, setAddingSubCatToParentId] = useState<string | null>(null);
  const [newSubCatNameInput, setNewSubCatNameInput] = useState('');

  // Site Settings Temp State
  const [tempSettings, setTempSettings] = useState<SiteSettings>({ ...siteSettings });

  // Contact / Social info rows (synced with tempSettings and siteSettings)
  const buildInitialContactRows = (settings: SiteSettings) => {
    // If we already have socialLinks saved, build from them
    if (settings?.socialLinks && settings.socialLinks.length > 0) {
      return settings.socialLinks.map((s, idx) => ({
        id: s.id || `c-${idx}-${Date.now()}`,
        type: (s.platform || 'other') as any,
        name: s.name || s.platform,
        value: s.url || '',
      }));
    }

    const rawIg = settings?.instagram || 'catyapii';
    const cleanIg = rawIg.replace(/^@/, '').trim();
    return [
      { id: 'c-1', type: 'instagram' as const, name: 'Instagram', value: cleanIg },
      { id: 'c-2', type: 'whatsapp' as const, name: 'WhatsApp', value: settings?.whatsapp || '0535 219 47 89' },
      { id: 'c-3', type: 'website' as const, name: 'Web Sitesi', value: 'https://catkapi.com' },
      { id: 'c-4', type: 'facebook' as const, name: 'Facebook', value: 'https://facebook.com' },
      { id: 'c-5', type: 'tiktok' as const, name: 'TikTok', value: 'https://tiktok.com/@catyapii' },
      { id: 'c-6', type: 'youtube' as const, name: 'YouTube', value: 'https://youtube.com' },
      { id: 'c-7', type: 'email' as const, name: 'E-posta', value: settings?.email || 'info@catkapi.com' },
      { id: 'c-8', type: 'address' as const, name: 'Adres', value: settings?.address || 'Çay Mah. Cumhuriyet Blv. No:33/A Akdeniz / Mersin' },
      { id: 'c-9', type: 'phone' as const, name: 'Telefon', value: settings?.phone || '0535 219 47 89' },
    ];
  };

  const [contactRows, setContactRows] = useState<
    Array<{
      id: string;
      type: 'instagram' | 'whatsapp' | 'website' | 'facebook' | 'tiktok' | 'youtube' | 'email' | 'address' | 'owner' | 'phone' | 'other';
      name: string;
      value: string;
    }>
  >(() => buildInitialContactRows(siteSettings));

  // Sync tempSettings and contactRows if siteSettings props change
  useEffect(() => {
    setTempSettings((prev) => ({ ...prev, ...siteSettings }));
    if (siteSettings?.socialLinks && siteSettings.socialLinks.length > 0) {
      setContactRows(
        siteSettings.socialLinks.map((s, idx) => ({
          id: s.id || `c-${idx}`,
          type: (s.platform || 'other') as any,
          name: s.name || s.platform,
          value: s.url || '',
        }))
      );
    }
  }, [siteSettings]);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: 'Silme Onayı',
    message: '',
    onConfirm: () => {},
  });

  const askConfirmation = (message: string, onConfirm: () => void, title = 'Silme Onayı') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal({ isOpen: false, title: 'Silme Onayı', message: '', onConfirm: () => {} });
      },
    });
  };

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Full Database Backup Export to JSON
  const handleExportBackup = () => {
    try {
      exportDatabaseBackup(products, categories, tempSettings);
      showToast('Tüm site veritabanı (Ürünler, Galeriler, Ayarlar) başarıyla JSON dosyası olarak indirildi!');
    } catch (err) {
      console.error(err);
      alert('Yedek indirilirken bir hata oluştu.');
    }
  };

  // Full Database Backup Import from JSON file
  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importDatabaseBackup(file);
      onUpdateProducts(restored.products);
      onUpdateCategories(restored.categories);
      onUpdateSiteSettings(restored.siteSettings);
      setTempSettings(restored.siteSettings);

      showToast(`Yedek başarıyla yüklendi! (${restored.products.length} ürün, ${restored.categories.length} kategori geri yüklendi)`);
    } catch (err) {
      console.error(err);
      alert('Yedek dosyası yüklenemedi. Lütfen geçerli bir Çat Kapı yedek JSON dosyası seçiniz.');
    }

    e.target.value = '';
  };

  // Toggle tree expand
  const toggleCatExpand = (catId: string) => {
    setExpandedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Switch Selected Product for Right Panel
  const handleSelectProduct = (prod: Product) => {
    setIsCreatingNewProduct(false);
    setSelectedProductId(prod.id);
    setEditingProduct({ ...prod });
  };

  // Start New Product
  const handleStartNewProduct = () => {
    const defaultCat = selectedCategoryFilter || categories[0]?.name || 'Genç Odası';
    const defaultSub = selectedSubCategoryFilter || categories[0]?.subCategories?.[0]?.name || '';
    const newProduct: Product = {
      id: `PROD-${Date.now().toString().slice(-8)}`,
      name: '',
      category: defaultCat,
      subCategory: defaultSub,
      description: '',
      dimensions: '240 cm genişlik × 60 cm derinlik × 220 cm yükseklik',
      startingPrice: 0,
      campaignPrice: 0,
      priceDisplayMode: 'normal',
      isCampaign: false,
      isCustomProduction: true,
      isNew: true,
      stockStatus: 'Sipariş Üzerine Üretiliyor',
      materials: ['Lake Boyalı MDF', 'MDF Lam', 'Frenli Ray Sistemi'],
      keyFeatures: ['Özel Ölçü İmalat', '1. Sınıf Malzeme'],
      images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'],
      coverImageIndex: 0,
      specs: { 'Stok Durumu': 'Sipariş Üzerine Üretiliyor' },
      isHidden: false,
      isArchived: false,
    };
    setIsCreatingNewProduct(true);
    setSelectedProductId(newProduct.id);
    setEditingProduct(newProduct);
    setActiveTab('products');
  };

  // Save Product
  const handleSaveProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('Lütfen ürün adını yazınız!');
      return;
    }

    if (isCreatingNewProduct) {
      const nextProducts = [editingProduct, ...products];
      onUpdateProducts(nextProducts);
      saveSingleProductToFirestore(editingProduct).catch(console.warn);
      setIsCreatingNewProduct(false);
      setSelectedProductId(editingProduct.id);
      showToast(`'${editingProduct.name}' ürünü başarıyla eklendi ve sitede yayına alındı!`);
    } else {
      const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      onUpdateProducts(updated);
      saveSingleProductToFirestore(editingProduct).catch(console.warn);
      showToast(`'${editingProduct.name}' ürün bilgileri güncellendi ve sitede yayına alındı!`);
    }
  };

  // Save Product and immediately view it in the live Showroom
  const handleSaveAndGoToShowroom = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.name.trim()) {
      alert('Lütfen önce ürün adını yazınız!');
      return;
    }

    if (isCreatingNewProduct) {
      const nextProducts = [editingProduct, ...products];
      onUpdateProducts(nextProducts);
      saveSingleProductToFirestore(editingProduct).catch(console.warn);
      setIsCreatingNewProduct(false);
      setSelectedProductId(editingProduct.id);
    } else {
      const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      onUpdateProducts(updated);
      saveSingleProductToFirestore(editingProduct).catch(console.warn);
    }

    showToast(`'${editingProduct.name}' kaydedildi! Showroom kataloğuna yönlendiriliyorsunuz...`);
    setTimeout(() => {
      if (onNavigateToProducts) {
        onNavigateToProducts();
      } else {
        onClose();
      }
    }, 300);
  };

  // Safe Close to ensure no created or edited product is ever discarded
  const handleSafeClose = () => {
    if (editingProduct && editingProduct.name && editingProduct.name.trim().length > 0) {
      if (isCreatingNewProduct) {
        const nextProducts = [editingProduct, ...products];
        onUpdateProducts(nextProducts);
        saveSingleProductToFirestore(editingProduct).catch(console.warn);
        setIsCreatingNewProduct(false);
      } else {
        const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
        onUpdateProducts(updated);
        saveSingleProductToFirestore(editingProduct).catch(console.warn);
      }
    }
    onClose();
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    const prodName = prod?.name || 'Ürün';
    askConfirmation(`'${prodName}' ürününü silmek istediğinize emin misiniz?`, () => {
      trackDeletedProductId(id);
      deleteProductFromFirestore(id).catch(console.warn);
      const nextList = products.filter((p) => p.id !== id);
      onUpdateProducts(nextList);
      if (selectedProductId === id) {
        if (nextList.length > 0) {
          setSelectedProductId(nextList[0].id);
          setEditingProduct({ ...nextList[0] });
        } else {
          setSelectedProductId(null);
          setEditingProduct(null);
        }
      }
      showToast(`'${prodName}' ürünü başarıyla silindi.`);
    });
  };

  // Toggle Visibility
  const handleToggleProductVisibility = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let isNowHidden = false;
    let prodName = 'Ürün';
    const updated = products.map((p) => {
      if (p.id === id) {
        isNowHidden = !p.isHidden;
        prodName = p.name || 'Ürün';
        return { ...p, isHidden: isNowHidden };
      }
      return p;
    });
    onUpdateProducts(updated);
    if (editingProduct?.id === id) {
      setEditingProduct((prev) => (prev ? { ...prev, isHidden: isNowHidden } : null));
    }
    showToast(
      isNowHidden
        ? `'${prodName}' sayfadan gizlendi (Pasife alındı).`
        : `'${prodName}' başarıyla yayına alındı (Sitede aktif)!`
    );
  };

  // Category Actions
  const handleCreateCategory = () => {
    if (!newCategoryNameInput.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryNameInput.trim(),
      isActive: true,
      subCategories: [],
    };
    onUpdateCategories([...categories, newCat]);
    setNewCategoryNameInput('');
    setIsAddingNewCat(false);
    showToast(`'${newCat.name}' ana kategorisi başarıyla eklendi.`);
  };

  const handleSaveEditCategory = (catId: string) => {
    if (!tempCatName.trim()) return;
    const oldCat = categories.find((c) => c.id === catId);
    const oldName = oldCat?.name;
    const newName = tempCatName.trim();

    onUpdateCategories(
      categories.map((c) => (c.id === catId ? { ...c, name: newName } : c))
    );

    // Update associated products
    if (oldName && oldName !== newName) {
      onUpdateProducts(
        products.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
      );
    }

    setEditingCategoryId(null);
    setTempCatName('');
    showToast(`'${newName}' kategori adı başarıyla güncellendi.`);
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    const catName = cat?.name || 'Kategori';
    askConfirmation(
      `'${catName}' ve altındaki alt kategorileri silmek istediğinize emin misiniz?`,
      () => {
        onUpdateCategories(categories.filter((c) => c.id !== catId));
        if (selectedCategoryFilter === cat?.name) {
          setSelectedCategoryFilter(null);
        }
        showToast(`'${catName}' kategorisi başarıyla silindi.`);
      }
    );
  };

  const handleToggleCategoryVisibility = (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let isNowActive = true;
    let catName = 'Kategori';
    const updated = categories.map((c) => {
      if (c.id === catId) {
        catName = c.name;
        isNowActive = c.isActive === false ? true : false;
        return { ...c, isActive: isNowActive };
      }
      return c;
    });
    onUpdateCategories(updated);
    showToast(
      isNowActive
        ? `'${catName}' kategorisi yayına alındı (Sitede görünür).`
        : `'${catName}' kategorisi sayfadan gizlendi.`
    );
  };

  const handleToggleSubCategoryVisibility = (parentCatId: string, subId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let isNowActive = true;
    let subName = 'Alt kategori';
    const updated = categories.map((c) => {
      if (c.id === parentCatId) {
        return {
          ...c,
          subCategories: (c.subCategories || []).map((s) => {
            if (s.id === subId) {
              subName = s.name;
              isNowActive = s.isActive === false ? true : false;
              return { ...s, isActive: isNowActive };
            }
            return s;
          }),
        };
      }
      return c;
    });
    onUpdateCategories(updated);
    showToast(
      isNowActive
        ? `'${subName}' alt kategorisi yayına alındı.`
        : `'${subName}' alt kategorisi sayfadan gizlendi.`
    );
  };

  const handleCreateSubCategory = (parentCatId: string) => {
    if (!newSubCatNameInput.trim()) return;
    const parent = categories.find((c) => c.id === parentCatId);
    if (!parent) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      name: newSubCatNameInput.trim(),
      isActive: true,
    };

    const updated = categories.map((c) =>
      c.id === parentCatId
        ? { ...c, subCategories: [...(c.subCategories || []), newSub] }
        : c
    );

    onUpdateCategories(updated);
    setNewSubCatNameInput('');
    setAddingSubCatToParentId(null);
    showToast(`'${newSub.name}' alt kategorisi başarıyla eklendi.`);
  };

  const handleSaveEditSubCategory = (parentCatId: string, subId: string) => {
    if (!tempSubCatName.trim()) return;
    const parent = categories.find((c) => c.id === parentCatId);
    const oldSub = parent?.subCategories?.find((s) => s.id === subId);
    const oldSubName = oldSub?.name;
    const newSubName = tempSubCatName.trim();

    const updated = categories.map((c) => {
      if (c.id === parentCatId) {
        return {
          ...c,
          subCategories: (c.subCategories || []).map((s) =>
            s.id === subId ? { ...s, name: newSubName } : s
          ),
        };
      }
      return c;
    });

    onUpdateCategories(updated);

    if (oldSubName && oldSubName !== newSubName && parent) {
      onUpdateProducts(
        products.map((p) =>
          p.category === parent.name && p.subCategory === oldSubName
            ? { ...p, subCategory: newSubName }
            : p
        )
      );
    }

    setEditingSubCatId(null);
    setTempSubCatName('');
    showToast('Alt kategori güncellendi.');
  };

  const handleDeleteSubCategory = (parentCatId: string, subId: string) => {
    askConfirmation('Bu alt kategoriyi silmek istediğinize emin misiniz?', () => {
      const updated = categories.map((c) => {
        if (c.id === parentCatId) {
          return {
            ...c,
            subCategories: (c.subCategories || []).filter((s) => s.id !== subId),
          };
        }
        return c;
      });
      onUpdateCategories(updated);
      showToast('Alt kategori silindi.');
    });
  };

  // Slider Image / Video / GIF file upload for Hero slides
  const handleHeroSlideFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slideIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const updated = (tempSettings.heroSlides || []).map((s, idx) =>
          idx === slideIndex ? { ...s, image: reader.result as string } : s
        );
        setTempSettings({ ...tempSettings, heroSlides: updated });
        showToast('Slayt medyası başarıyla yüklendi.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Move slide up or down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const list = [...(tempSettings.heroSlides || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setTempSettings({ ...tempSettings, heroSlides: list });
    showToast(`Slayt #${index + 1} sırası güncellendi.`);
  };

  // Toggle slide isHidden
  const handleToggleSlideVisibility = (index: number) => {
    const list = (tempSettings.heroSlides || []).map((s, i) =>
      i === index ? { ...s, isHidden: !s.isHidden } : s
    );
    setTempSettings({ ...tempSettings, heroSlides: list });
    const isNowHidden = list[index].isHidden;
    showToast(
      isNowHidden
        ? `Slayt #${index + 1} gizlendi (Sitede görünmeyecek).`
        : `Slayt #${index + 1} yayına alındı (Sitede aktif).`
    );
  };

  // Delete slide with confirmation
  const handleDeleteSlide = (index: number) => {
    askConfirmation(`Slayt #${index + 1}'i silmek istediğinize emin misiniz?`, () => {
      const list = (tempSettings.heroSlides || []).filter((_, i) => i !== index);
      setTempSettings({ ...tempSettings, heroSlides: list });
      if (editingSlideId === tempSettings.heroSlides[index]?.id) {
        setEditingSlideId(list[0]?.id || null);
      }
      showToast(`Slayt #${index + 1} başarıyla silindi.`);
    });
  };

  // Add new slide
  const handleAddNewSlide = () => {
    const newSlide: HeroSlide = {
      id: `hs-${Date.now()}`,
      title: 'Yeni Vitrin Başlığı',
      subtitle: 'Mersin Akdeniz İmalat Atölyesi',
      description: 'Milimetrik ölçüye göre üretilen lüks ahşap ve kapı çözümleri.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      tag: 'ÖZEL İMALAT',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      secondaryButtonText: 'Tüm Ürün Kataloğu',
      secondaryButtonLink: 'products',
      isHidden: false,
    };
    const updated = [...(tempSettings.heroSlides || []), newSlide];
    setTempSettings({ ...tempSettings, heroSlides: updated });
    setEditingSlideId(newSlide.id);
    showToast('Yeni slider görseli eklendi ve düzenlemeye açıldı.');
  };

  // Upload promo image
  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setTempSettings((prev) => ({
          ...prev,
          promoSection: {
            ...(prev.promoSection || {
              title: 'Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri',
              subtitle: "MERSİN'İN LOKAL DEĞERİ",
              description: "ÇAT KAPI, Mersin Akdeniz'deki modern imalat tesisinde, Nuri Yanık liderliğinde, sıradan fabrikasyon yapı market algısını yıkmak; evine hak ettiği sıcaklığı ve lüksü kazandırmak isteyen seçkin müşterilerimiz için butik üretim yapmaktadır.",
              image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800',
              buttonText: 'Nuri Usta İle İletişime Geç',
              buttonLink: 'contact',
              ownerName: 'Nuri Yanık',
            }),
            image: reader.result as string,
          },
        }));
        showToast('Tanıtım bölümü görseli başarıyla yüklendi.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Contact rows handlers
  const handleUpdateContactRow = (id: string, field: 'type' | 'name' | 'value', val: string) => {
    setContactRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [field]: val } : r));
      const row = next.find((r) => r.id === id);
      if (row) {
        if (row.type === 'instagram') {
          setTempSettings((s) => ({ ...s, instagram: row.value }));
        } else if (row.type === 'whatsapp') {
          setTempSettings((s) => ({ ...s, whatsapp: row.value }));
        } else if (row.type === 'phone') {
          setTempSettings((s) => ({ ...s, phone: row.value }));
        } else if (row.type === 'email') {
          setTempSettings((s) => ({ ...s, email: row.value }));
        } else if (row.type === 'address') {
          setTempSettings((s) => ({ ...s, address: row.value }));
        }
      }
      return next;
    });
  };

  const handleDeleteContactRow = (id: string) => {
    const row = contactRows.find((r) => r.id === id);
    const rowName = row?.name || 'İletişim bilgisi';
    askConfirmation(`'${rowName}' kaydını silmek istediğinize emin misiniz?`, () => {
      setContactRows((prev) => prev.filter((r) => r.id !== id));
      showToast(`'${rowName}' silindi.`);
    });
  };

  const handleAddContactRow = () => {
    const newRow = {
      id: `c-${Date.now()}`,
      type: 'other' as const,
      name: 'Yeni İletişim / Sosyal Medya',
      value: '',
    };
    setContactRows((prev) => [...prev, newRow]);
    showToast('Yeni iletişim bilgisi satırı eklendi.');
  };

  // Quality Principles handlers for Promo Section
  const handleUpdatePrinciple = (
    id: string,
    field: 'title' | 'description' | 'icon',
    value: string
  ) => {
    setTempSettings((prev) => {
      const currentPrinciples = prev.promoSection?.principles || [];
      const updated = currentPrinciples.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      );
      return {
        ...prev,
        promoSection: {
          ...(prev.promoSection || {
            title: '',
            subtitle: '',
            description: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            ownerName: '',
          }),
          principles: updated,
        },
      };
    });
  };

  const handleDeletePrinciple = (id: string) => {
    const pList = tempSettings.promoSection?.principles || [];
    const item = pList.find((p) => p.id === id);
    const title = item?.title || 'Kalite İlkesi';
    askConfirmation(`'${title}' maddesini silmek istediğinize emin misiniz?`, () => {
      setTempSettings((prev) => ({
        ...prev,
        promoSection: {
          ...(prev.promoSection || {
            title: '',
            subtitle: '',
            description: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            ownerName: '',
          }),
          principles: (prev.promoSection?.principles || []).filter((p) => p.id !== id),
        },
      }));
      showToast(`'${title}' maddesi silindi.`);
    });
  };

  const handleAddPrinciple = () => {
    const newId = `pr-${Date.now()}`;
    const newPrinciple: QualityPrinciple = {
      id: newId,
      title: 'Yeni İmalat / Kalite Prensibi',
      description: 'Açıklama metnini buraya giriniz.',
      icon: 'sparkles',
    };
    setTempSettings((prev) => {
      const current = prev.promoSection?.principles || [];
      return {
        ...prev,
        promoSection: {
          ...(prev.promoSection || {
            title: '',
            subtitle: '',
            description: '',
            image: '',
            buttonText: '',
            buttonLink: '',
            ownerName: '',
          }),
          principles: [...current, newPrinciple],
        },
      };
    });
    showToast('Yeni imalat ve kalite ilkesi eklendi.');
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return <Instagram size={15} className="text-pink-400 shrink-0" />;
      case 'whatsapp':
        return <MessageCircle size={15} className="text-emerald-400 shrink-0" />;
      case 'website':
        return <Globe size={15} className="text-amber-400 shrink-0" />;
      case 'facebook':
        return <Facebook size={15} className="text-blue-400 shrink-0" />;
      case 'tiktok':
        return <Music size={15} className="text-stone-300 shrink-0" />;
      case 'youtube':
        return <Youtube size={15} className="text-red-400 shrink-0" />;
      case 'email':
        return <Mail size={15} className="text-sky-400 shrink-0" />;
      case 'address':
        return <MapPin size={15} className="text-amber-400 shrink-0" />;
      case 'owner':
        return <User size={15} className="text-stone-300 shrink-0" />;
      case 'phone':
        return <Phone size={15} className="text-amber-400 shrink-0" />;
      default:
        return <LinkIcon size={15} className="text-stone-400 shrink-0" />;
    }
  };

  // Filtered Products for Center Column
  const filteredProducts = useMemo(() => {
    const deletedSet = getDeletedProductIds();
    return products.filter((p) => {
      if (!p || !p.id) return false;
      if (deletedSet.has(p.id) || isPermanentlyRemovedProduct(p)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLocaleLowerCase('tr-TR').trim();
        const matchName = (p.name || '').toLocaleLowerCase('tr-TR').includes(q);
        const matchCat = (p.category || '').toLocaleLowerCase('tr-TR').includes(q);
        const matchSub = (p.subCategory || '').toLocaleLowerCase('tr-TR').includes(q);
        const matchId = (p.id || '').toLocaleLowerCase('tr-TR').includes(q);
        if (!matchName && !matchCat && !matchSub && !matchId) return false;
      }

      if (selectedCategoryFilter) {
        const pCat = (p.category || '').trim().toLocaleLowerCase('tr-TR');
        const fCat = selectedCategoryFilter.trim().toLocaleLowerCase('tr-TR');
        if (pCat !== fCat) return false;
      }

      if (selectedSubCategoryFilter) {
        const pSub = (p.subCategory || '').trim().toLocaleLowerCase('tr-TR');
        const fSub = selectedSubCategoryFilter.trim().toLocaleLowerCase('tr-TR');
        if (pSub !== fSub) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategoryFilter, selectedSubCategoryFilter]);

  const hiddenProducts = useMemo(() => {
    const deletedSet = getDeletedProductIds();
    return products.filter(
      (p) =>
        p &&
        p.id &&
        !deletedSet.has(p.id) &&
        !isPermanentlyRemovedProduct(p) &&
        (p.isHidden || p.isArchived)
    );
  }, [products]);

  const hiddenCategories = useMemo(() => {
    return categories.filter((c) => c.isActive === false);
  }, [categories]);

  const hiddenSubCategories = useMemo(() => {
    const list: Array<{
      parentId: string;
      parentName: string;
      sub: { id: string; name: string; isActive?: boolean };
    }> = [];
    categories.forEach((cat) => {
      (cat.subCategories || []).forEach((sub) => {
        if (sub.isActive === false) {
          list.push({
            parentId: cat.id,
            parentName: cat.name,
            sub,
          });
        }
      });
    });
    return list;
  }, [categories]);

  const totalArchivedCount = hiddenProducts.length + hiddenCategories.length + hiddenSubCategories.length;

  return (
    <div
      id="admin-unified-cms-container"
      className="fixed inset-0 z-50 bg-[#0c0c0c] text-white flex flex-col overflow-hidden font-sans"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-2xl bg-amber-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR (Matching Images 1, 2, 3) */}
      <header className="h-16 bg-[#141414] border-b border-stone-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Left: CK Logo + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-md">
            CK
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
              <span>ÇAT KAPI — YÖNETİM PANELİ</span>
            </h1>
          </div>
        </div>

        {/* Center: Akıllı Arama Input */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-6">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Akıllı Arama: Kategori veya ürün adı/kodu yazın... (Örn: Gardırop)"
              className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-white text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none placeholder:text-stone-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions (Matching Image 4) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Hidden JSON Backup File Input */}
          <input
            type="file"
            ref={backupFileInputRef}
            onChange={handleImportBackupFile}
            accept=".json"
            className="hidden"
          />

          {/* Backup Download Button */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-2.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Tüm Ürün, Kategori ve Sayfa Verilerini Bilgisayarınıza JSON Olarak İndirir"
          >
            <Download size={13} className="text-amber-400" />
            <span className="hidden md:inline">Yedek İndir</span>
          </button>

          {/* Backup Restore Button */}
          <button
            type="button"
            onClick={() => backupFileInputRef.current?.click()}
            className="px-2.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-750 text-stone-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Daha önce indirilen JSON yedeğini yükler"
          >
            <UploadCloud size={13} className="text-amber-400" />
            <span className="hidden md:inline">Yedek Yükle</span>
          </button>

          <button
            onClick={() => {
              onUpdateSiteSettings(tempSettings);
              showToast('Tüm değişiklikler sayfaya yayınlandı!');
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Globe size={14} />
            <span className="hidden sm:inline">SAYFAYA YAYINLA</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <Archive size={14} />
            <span>Arşiv</span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
              {totalArchivedCount}
            </span>
          </button>

          <button
            onClick={handleStartNewProduct}
            className="px-3.5 py-2 bg-black hover:bg-stone-900 border border-stone-750 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} className="text-amber-400" />
            <span className="hidden sm:inline">YENİ ÜRÜN EKLE</span>
          </button>

          <button
            onClick={() => {
              showToast('Veriler güncellendi.');
            }}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-colors cursor-pointer border border-stone-800 hidden sm:flex items-center justify-center"
            title="Yenile"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={handleSafeClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-colors cursor-pointer border border-stone-800 hidden sm:flex items-center justify-center"
            title="Oturumu Kapat"
          >
            <LogOut size={14} />
          </button>

          <button
            onClick={handleSafeClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer ml-0.5"
            title="Paneli Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* TABS NAVIGATION BAR (Pills matching image) */}
      <nav className="bg-[#101010] border-b border-stone-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          <Layers size={14} />
          <span>ÜRÜN & KATALOG YÖNETİMİ</span>
        </button>

        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          <Sparkles size={14} />
          <span>SAYFA İÇERİK YÖNETİMİ</span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'archive'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-900'
          }`}
        >
          <Archive size={14} />
          <span>ARŞİV SİSTEMİ ({totalArchivedCount})</span>
        </button>
      </nav>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 overflow-hidden">
        {/* VIEW 1: 3-COLUMN PRODUCT & CATALOG MANAGEMENT (IMAGES 1, 2, 3) */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-12 h-full">
            {/* COLUMN 1: KATEGORİ YÖNETİMİ (SOL PANEL) */}
            <aside className="col-span-12 md:col-span-3 lg:col-span-3 bg-[#111111] border-r border-stone-800 flex flex-col h-full overflow-hidden">
              {/* Header of Col 1 */}
              <div className="p-3.5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-[#141414]">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>KATEGORİ YÖNETİMİ</span>
                </span>
                <button
                  onClick={() => setIsAddingNewCat(true)}
                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 hover:text-black text-amber-400 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>+ YENİ KATEGORİ</span>
                </button>
              </div>

              {/* Inline Add New Category Box */}
              {isAddingNewCat && (
                <div className="p-3 bg-stone-900 border-b border-stone-800 space-y-2 animate-in fade-in">
                  <span className="text-[11px] font-bold text-stone-300 block">Yeni Kategori Adı</span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newCategoryNameInput}
                      onChange={(e) => setNewCategoryNameInput(e.target.value)}
                      placeholder="Örn: Genç Odası"
                      className="w-full bg-black border border-stone-700 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleCreateCategory}
                      className="px-3 bg-amber-500 text-black font-bold text-xs rounded-lg"
                    >
                      Ekle
                    </button>
                    <button
                      onClick={() => setIsAddingNewCat(false)}
                      className="p-1.5 bg-stone-800 text-stone-400 hover:text-white rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Category Tree List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {/* Tüm Kategoriler Filtresi */}
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setSelectedSubCategoryFilter(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategoryFilter === null && selectedSubCategoryFilter === null
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                      : 'bg-stone-900/60 border border-stone-800/80 text-stone-300 hover:bg-stone-850'
                  }`}
                >
                  <span>Tüm Kategoriler</span>
                  <span className="text-[10px] font-mono font-normal opacity-80">
                    ({products.length} Ürün)
                  </span>
                </button>

                {/* Categories Cards */}
                {categories.map((cat) => {
                  const isCatSelected =
                    selectedCategoryFilter === cat.name && selectedSubCategoryFilter === null;
                  const isExpanded = !!expandedCats[cat.id];
                  const isCatHidden = cat.isActive === false;

                  return (
                    <div
                      key={cat.id}
                      className={`rounded-2xl border transition-all bg-[#141414] overflow-hidden ${
                        isCatSelected
                          ? 'border-2 border-amber-500 shadow-md shadow-amber-950/20'
                          : 'border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {/* Main Category Header */}
                      <div
                        className={`p-2.5 flex items-center justify-between gap-1 transition-colors cursor-pointer ${
                          isCatSelected ? 'bg-amber-500/15' : 'hover:bg-stone-850'
                        }`}
                        onClick={() => {
                          setSelectedCategoryFilter(cat.name);
                          setSelectedSubCategoryFilter(null);
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCatExpand(cat.id);
                            }}
                            className="p-1 text-stone-500 hover:text-stone-300"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          {editingCategoryId === cat.id ? (
                            <div
                              className="flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={tempCatName}
                                onChange={(e) => setTempCatName(e.target.value)}
                                className="bg-black border border-amber-500 text-xs px-2 py-0.5 rounded text-white outline-none w-28"
                              />
                              <button
                                onClick={() => handleSaveEditCategory(cat.id)}
                                className="p-1 text-emerald-400"
                              >
                                <Check size={13} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-xs font-black text-white truncate">
                                {cat.name}
                              </span>
                              {isCatHidden && (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                                  GİZLİ
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons on category row */}
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setTempCatName(cat.name);
                            }}
                            className="px-2 py-1 text-[9px] font-bold bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-750 cursor-pointer transition-colors"
                            title="Kategoriyi Düzenle"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => setAddingSubCatToParentId(cat.id)}
                            className="px-2 py-1 text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-black text-amber-400 rounded-lg border border-amber-500/20 cursor-pointer transition-colors"
                            title="Alt Kategori Ekle"
                          >
                            + Alt Kategori
                          </button>
                          <button
                            onClick={(e) => handleToggleCategoryVisibility(cat.id, e)}
                            className={`px-2 py-1 text-[9px] font-bold rounded-lg border cursor-pointer transition-colors flex items-center gap-1 ${
                              isCatHidden
                                ? 'bg-stone-800 text-amber-400 border-amber-500/30'
                                : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-750'
                            }`}
                            title={isCatHidden ? 'Yayına Al' : 'Sayfaya Gizle'}
                          >
                            {isCatHidden ? <Eye size={10} /> : <EyeOff size={10} />}
                            <span className="hidden xl:inline">
                              {isCatHidden ? 'Yayına Al' : 'Gizle'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-1.5 py-1 text-[9px] font-bold bg-stone-850 hover:bg-red-500/20 text-stone-400 hover:text-red-400 rounded-lg border border-stone-750 cursor-pointer transition-colors"
                            title="Kategoriyi Sil"
                          >
                            Sil
                          </button>
                        </div>
                      </div>

                      {/* Add Sub Category inline input */}
                      {addingSubCatToParentId === cat.id && (
                        <div className="p-2 bg-stone-900 border-t border-stone-800 flex gap-1 animate-in fade-in">
                          <input
                            type="text"
                            autoFocus
                            value={newSubCatNameInput}
                            onChange={(e) => setNewSubCatNameInput(e.target.value)}
                            placeholder="Alt kategori adı..."
                            className="w-full bg-black border border-stone-700 text-white text-[11px] px-2 py-1 rounded outline-none"
                          />
                          <button
                            onClick={() => handleCreateSubCategory(cat.id)}
                            className="px-2 bg-amber-500 text-black font-bold text-[10px] rounded"
                          >
                            Ekle
                          </button>
                          <button
                            onClick={() => setAddingSubCatToParentId(null)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}

                      {/* Sub Categories List */}
                      {isExpanded && cat.subCategories && cat.subCategories.length > 0 && (
                        <div className="bg-[#0f0f0f] border-t border-stone-850/80 divide-y divide-stone-850/50">
                          {cat.subCategories.map((sub) => {
                            const isSubSelected =
                              selectedCategoryFilter === cat.name &&
                              selectedSubCategoryFilter === sub.name;
                            const isSubHidden = sub.isActive === false;

                            return (
                              <div
                                key={sub.id}
                                onClick={() => {
                                  setSelectedCategoryFilter(cat.name);
                                  setSelectedSubCategoryFilter(sub.name);
                                }}
                                className={`pl-5 pr-2.5 py-2 flex items-center justify-between gap-1 text-[11px] cursor-pointer transition-colors ${
                                  isSubSelected
                                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                                    : 'text-stone-300 hover:bg-stone-850/50'
                                }`}
                              >
                                {editingSubCatId === sub.id ? (
                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={tempSubCatName}
                                      onChange={(e) => setTempSubCatName(e.target.value)}
                                      className="bg-black border border-amber-500 text-[10px] px-1.5 py-0.5 rounded text-white outline-none w-24"
                                    />
                                    <button
                                      onClick={() => handleSaveEditSubCategory(cat.id, sub.id)}
                                      className="p-1 text-emerald-400"
                                    >
                                      <Check size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="truncate">
                                      - {sub.name}
                                    </span>
                                    {isSubHidden && (
                                      <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[8px] font-black px-1 py-0.2 rounded uppercase shrink-0">
                                        GİZLİ
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div
                                  className="flex items-center gap-1 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setEditingSubCatId(sub.id);
                                      setTempSubCatName(sub.name);
                                    }}
                                    className="px-1.5 py-0.5 text-[8px] font-bold bg-stone-850 hover:bg-stone-800 text-stone-300 rounded border border-stone-750"
                                    title="Düzenle"
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    onClick={(e) => handleToggleSubCategoryVisibility(cat.id, sub.id, e)}
                                    className={`px-1.5 py-0.5 text-[8px] font-bold rounded border transition-colors ${
                                      isSubHidden
                                        ? 'bg-stone-800 text-amber-400 border-amber-500/30'
                                        : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-750'
                                    }`}
                                    title={isSubHidden ? 'Yayına Al' : 'Sayfaya Gizle'}
                                  >
                                    {isSubHidden ? 'Yayına Al' : 'Gizle'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubCategory(cat.id, sub.id)}
                                    className="px-1 py-0.5 text-[8px] font-bold bg-stone-850 hover:bg-red-500/20 text-stone-400 hover:text-red-400 rounded border border-stone-750"
                                    title="Sil"
                                  >
                                    Sil
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* COLUMN 2: ÜRÜN LİSTESİ (ORTA PANEL - GÖRSEL 3) */}
            <section className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#141414] border-r border-stone-800 flex flex-col h-full overflow-hidden">
              {/* Header of Col 2 */}
              <div className="p-3.5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-[#161616]">
                <div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block font-mono">
                    {selectedCategoryFilter || 'TÜM KATEGORİLER'}
                    {selectedSubCategoryFilter ? ` > ${selectedSubCategoryFilter}` : ''}
                  </span>
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-500" />
                    <span>ÜRÜN LİSTESİ ({filteredProducts.length})</span>
                  </h2>
                </div>

                <button
                  onClick={handleStartNewProduct}
                  className="p-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl cursor-pointer transition-all shadow-md"
                  title="Yeni Ürün Ekle"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Product Card List (Matching Image 3) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    Bu filtrede ürün bulunamadı.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProductId === product.id && !isCreatingNewProduct;
                    const coverImg =
                      product.images?.[product.coverImageIndex ?? 0] || product.images?.[0];
                    const priceText =
                      product.campaignPrice && product.isCampaign
                        ? `₺${product.campaignPrice.toLocaleString('tr-TR')}`
                        : product.startingPrice > 0
                        ? `₺${product.startingPrice.toLocaleString('tr-TR')}`
                        : 'Teklifli';

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-500/10 border-2 border-amber-500 shadow-lg shadow-amber-950/20'
                            : 'bg-[#181818] border-stone-800 hover:border-stone-700 hover:bg-[#1e1e1e]'
                        }`}
                      >
                        {/* Left: Thumbnail & Details (Image 3) */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0 relative">
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-600">
                                <ImageIcon size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <h3 className="text-xs font-black text-white truncate">
                              {product.name || 'İsimsiz Ürün'}
                            </h3>
                            <div className="text-[11px] text-stone-400 font-mono">
                              <span className="text-amber-400 font-bold">KOD-{product.id.slice(-4).toUpperCase()}</span>
                              <span className="mx-1.5 text-stone-600">•</span>
                              <span className="font-bold text-white">{priceText}</span>
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  product.isHidden
                                    ? 'bg-stone-800 text-stone-400'
                                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                                }`}
                              >
                                {product.isHidden ? 'GİZLİ' : 'AKTİF'} {product.category}
                              </span>
                              {product.isCampaign && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 uppercase">
                                  KAMPANYA
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions (Image 3) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleProductVisibility(product.id, e)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                              product.isHidden
                                ? 'bg-stone-800 border-stone-700 text-stone-400'
                                : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-300'
                            }`}
                            title={product.isHidden ? 'Sayfaya Göster' : 'Sayfaya Gizle'}
                          >
                            {product.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(product.id);
                            }}
                            className="p-2 rounded-xl bg-stone-850 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-stone-750 cursor-pointer transition-colors"
                            title="Ürünü Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* COLUMN 3: DÜZENLEME PANELİ (SAĞ PANEL - GÖRSELLER 4, 5, 6) */}
            <main className="col-span-12 md:col-span-5 lg:col-span-5 bg-[#101010] flex flex-col h-full overflow-hidden">
              {editingProduct ? (
                <form
                  onSubmit={handleSaveProduct}
                  className="flex flex-col h-full overflow-hidden"
                >
                  {/* Top Bar of Editing Panel (Image 4) */}
                  <div className="p-3.5 border-b border-stone-800 bg-[#141414] flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-amber-500 font-black uppercase tracking-wider block">
                        DÜZENLENEN ÜRÜN (ID: {editingProduct.id})
                      </span>
                      <h2 className="text-xs sm:text-sm font-black text-white uppercase flex items-center gap-1.5 truncate">
                        <Edit2 size={14} className="text-amber-400 shrink-0" />
                        <span className="truncate">
                          {isCreatingNewProduct ? 'YENİ ÜRÜN OLUŞTUR' : `DÜZENLE: ${editingProduct.name || 'İSİMSİZ'}`}
                        </span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveAndGoToShowroom}
                        className="px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-750 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Kaydet ve Showroom Sayfasında Gör"
                      >
                        <Eye size={13} className="text-amber-400" />
                        <span className="hidden sm:inline">Sitede Gör</span>
                      </button>

                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-amber-950/20"
                        title="Ürünü Kaydet ve Sitede Yayınla"
                      >
                        <Save size={13} />
                        <span>KAYDET</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartNewProduct}
                        className="px-2.5 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-750 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Yeni Ürün Formu Aç"
                      >
                        <Plus size={13} className="text-amber-400" />
                        <span className="hidden sm:inline">+ Yeni</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Scrollable Content (Images 4, 5, 6) */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                    {/* 1. ÜRÜN FOTOĞRAF & MEDYA GALERİ (FOTOĞRAF, VİDEO, GIF) */}
                    <MediaGalleryUploader
                      mediaList={editingProduct.images || []}
                      onChange={(newImages) =>
                        setEditingProduct({ ...editingProduct, images: newImages })
                      }
                      coverIndex={editingProduct.coverImageIndex ?? 0}
                      onCoverIndexChange={(newIdx) =>
                        setEditingProduct({ ...editingProduct, coverImageIndex: newIdx })
                      }
                      maxFiles={30}
                      title="1. ÜRÜN FOTOĞRAF & MEDYA GALERİ (FOTOĞRAF, VİDEO, GIF)"
                    />

                    {/* 2. TEMEL ÜRÜN BİLGİLERİ (Görsel 4 & 5) */}
                    <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
                      <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block border-b border-stone-800 pb-2.5">
                        2. TEMEL ÜRÜN BİLGİLERİ
                      </span>

                      {/* Ürün Adı */}
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">
                          ÜRÜN ADI *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) =>
                            setEditingProduct({ ...editingProduct, name: e.target.value })
                          }
                          placeholder="Örn: Gardırop, Sürgülü Lake Kapaklı Gardırop..."
                          className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-white text-xs px-3.5 py-3 rounded-xl outline-none font-bold"
                        />
                      </div>

                      {/* Durumu & Stok Durumu (Görsel 4 & 5) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            DURUMU (AKTİF/PASİF)
                          </label>
                          {editingProduct.isHidden ? (
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, isHidden: false })}
                              className="w-full py-2.5 px-3.5 bg-red-500/10 border-2 border-red-500/40 hover:border-red-500 text-red-400 font-bold text-xs rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                            >
                              <span>PASİF (Sitede Gizli)</span>
                              <EyeOff size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, isHidden: true })}
                              className="w-full py-2.5 px-3.5 bg-emerald-500/10 border-2 border-emerald-500/40 hover:border-emerald-500 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                            >
                              <span>AKTİF (Sitede Görünür)</span>
                              <Eye size={15} />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            STOK DURUMU
                          </label>
                          <select
                            value={editingProduct.specs?.['Stok Durumu'] || 'Sipariş Üzerine Üretiliyor'}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                specs: {
                                  ...(editingProduct.specs || {}),
                                  'Stok Durumu': e.target.value,
                                },
                              })
                            }
                            className="w-full bg-[#0d0d0d] border border-stone-750 text-white text-xs px-3.5 py-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Sipariş Üzerine Üretiliyor">Sipariş Üzerine Üretiliyor</option>
                            <option value="Stokta Hazır (Hızlı Teslimat)">Stokta Hazır (Hızlı Teslimat)</option>
                            <option value="Ölçüye Göre Özel İmalat">Ölçüye Göre Özel İmalat</option>
                          </select>
                        </div>
                      </div>

                      {/* Ana Kategori & Alt Kategori (Görsel 5) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            ANA KATEGORİ
                          </label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              const catObj = categories.find((c) => c.name === newCat);
                              const subCat = catObj?.subCategories?.[0]?.name || '';
                              setEditingProduct({
                                ...editingProduct,
                                category: newCat,
                                subCategory: subCat,
                              });
                            }}
                            className="w-full bg-[#0d0d0d] border border-stone-750 text-white text-xs px-3.5 py-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            ALT KATEGORİ
                          </label>
                          <select
                            value={editingProduct.subCategory || ''}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                subCategory: e.target.value,
                              })
                            }
                            className="w-full bg-[#0d0d0d] border border-stone-750 text-white text-xs px-3.5 py-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="">Genel (Alt Kategori Yok)</option>
                            {categories
                              .find((c) => c.name === editingProduct.category)
                              ?.subCategories?.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3. FİYAT & KAMPANYA BİLGİLERİ (Görsel 5) */}
                    <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
                      <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block border-b border-stone-800 pb-2.5">
                        3. FİYAT & KAMPANYA BİLGİLERİ
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            BAŞLANGIÇ FİYATI (₺)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editingProduct.startingPrice === 0 || !editingProduct.startingPrice ? '' : editingProduct.startingPrice}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                startingPrice: e.target.value === '' ? 0 : Number(e.target.value),
                              })
                            }
                            placeholder="Fiyat giriniz"
                            className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-amber-400 text-xs px-3.5 py-3 rounded-xl outline-none font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-stone-300 block mb-1">
                            KAMPANYA FİYATI (₺)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editingProduct.campaignPrice === 0 || !editingProduct.campaignPrice ? '' : editingProduct.campaignPrice}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                campaignPrice: e.target.value === '' ? 0 : Number(e.target.value),
                              })
                            }
                            placeholder="Kampanya fiyatı giriniz (isteğe bağlı)"
                            className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-emerald-400 text-xs px-3.5 py-3 rounded-xl outline-none font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs text-stone-400 font-mono">
                          KDV DURUMU: <span className="text-stone-200 font-bold">%20 KDV Dahil</span>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.isCampaign || false}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                isCampaign: e.target.checked,
                              })
                            }
                            className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700"
                          />
                          <span className="text-xs font-bold text-amber-400">
                            Kampanya Etiketini Aktif Et
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* 4. ÜRÜN AÇIKLAMASI (Görsel 5) */}
                    <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-2">
                      <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block border-b border-stone-800 pb-2.5">
                        4. ÜRÜN AÇIKLAMASI
                      </span>
                      <label className="text-[11px] font-bold text-stone-400 block">
                        AÇIKLAMA METNİ (İSTEDİĞİNİZ KADAR METİN YAZABİLİRSİNİZ)
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, description: e.target.value })
                        }
                        placeholder="Mersin Akdeniz atölyemizde milimetrik ölçüye göre üretilen lüks mobilya modeli."
                        className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-white text-xs p-3.5 rounded-xl outline-none leading-relaxed"
                      />
                    </div>

                    {/* 5. ÖLÇÜLER (Görsel 6) */}
                    <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-2">
                      <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider block border-b border-stone-800 pb-2.5">
                        5. ÖLÇÜLER
                      </span>
                      <label className="text-[11px] font-bold text-stone-400 block">
                        ÜRÜN ÖLÇÜ BİLGİSİ (SERBEST METİN)
                      </label>
                      <textarea
                        rows={2}
                        value={editingProduct.dimensions || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, dimensions: e.target.value })
                        }
                        placeholder="Örn: 240 cm genişlik × 60 cm derinlik × 220 cm yükseklik"
                        className="w-full bg-[#0d0d0d] border border-stone-750 focus:border-amber-500 text-white text-xs p-3.5 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  {/* Bottom Action Footer (Matching Images 5 & 6) */}
                  <div className="p-4 bg-[#141414] border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    <button
                      type="submit"
                      className="flex-1 min-w-[200px] py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Save size={16} />
                      <span>ÜRÜN BİLGİLERİNİ KAYDET</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveAndGoToShowroom}
                      className="py-3.5 px-5 bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-500 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      title="Ürünü kaydeder ve doğrudan showroom sayfasında görüntüler"
                    >
                      <ExternalLink size={15} />
                      <span>KAYDET VE SİTEDE GÖR</span>
                    </button>

                    {!isCreatingNewProduct && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(editingProduct.id)}
                        className="py-3.5 px-5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={15} />
                        <span className="hidden sm:inline">ÜRÜNÜ SİL</span>
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500">
                  <Layers size={40} className="text-stone-700 mb-3" />
                  <p className="text-sm font-bold text-stone-300">Düzenlemek için bir ürün seçin</p>
                  <p className="text-xs text-stone-500 mt-1">veya yukarıdaki butondan yeni ürün ekleyin.</p>
                </div>
              )}
            </main>
          </div>
        )}

        {/* VIEW 2: SAYFA İÇERİK YÖNETİMİ (HERO SLIDER, TANITIM, İLETİŞİM & HARİTA) */}
        {activeTab === 'hero' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            {/* SUB-TABS NAVIGATION (Matching reference design) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800 scrollbar-none">
              <button
                type="button"
                onClick={() => setContentSubTab('slider')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  contentSubTab === 'slider'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#141414] text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <span>1. Ana Sayfa Slider Yönetimi</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    contentSubTab === 'slider' ? 'bg-black/30 text-black' : 'bg-stone-800 text-amber-400'
                  }`}
                >
                  {(tempSettings.heroSlides || []).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('promo')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  contentSubTab === 'promo'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#141414] text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <span>2. Ana Sayfa Tanıtım Bölümü</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('contact')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  contentSubTab === 'contact'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-[#141414] text-stone-400 hover:text-white hover:bg-stone-850 border border-stone-800'
                }`}
              >
                <span>3. İletişim Sayfası & Harita Yönetimi</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* SUB-VIEW 1: ANA SAYFA HERO SLIDER YÖNETİMİ (IMAGE 1)                      */}
            {/* ========================================================================= */}
            {contentSubTab === 'slider' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-stone-800 p-5 rounded-2xl">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>ANA SAYFA HERO SLIDER YÖNETİMİ</span>
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewSlide}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>+ YENİ SLIDER GÖRSELİ EKLE</span>
                  </button>
                </div>

                {/* Slider List */}
                <div className="space-y-4">
                  {(tempSettings.heroSlides || []).map((slide, idx) => {
                    const isExpanded = editingSlideId === (slide.id || `hs-${idx}`);
                    const isHidden = !!slide.isHidden;

                    return (
                      <div
                        key={slide.id || idx}
                        className={`bg-[#141414] border rounded-2xl overflow-hidden transition-all ${
                          isExpanded
                            ? 'border-amber-500/80 shadow-2xl shadow-amber-500/10'
                            : 'border-stone-800 hover:border-stone-700'
                        } ${isHidden ? 'opacity-60 bg-[#0e0e0e]' : ''}`}
                      >
                        {/* Summary Bar */}
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Left: Thumbnail & Info */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-20 h-14 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-black border border-stone-800 shrink-0 relative">
                              {slide.image?.startsWith('data:video') || slide.image?.endsWith('.mp4') ? (
                                <div className="w-full h-full flex items-center justify-center bg-stone-900 text-amber-400">
                                  <Film size={20} />
                                </div>
                              ) : (
                                <img
                                  src={slide.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600'}
                                  alt={slide.title || `Slayt ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {isHidden && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                  GİZLİ
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  Sıra #{idx + 1} | {slide.tag || 'Özel Tasarım'}
                                </span>
                                {isHidden && (
                                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                                    Gizlendi
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-black text-white truncate">
                                {slide.title || '(Başlıksız Slayt)'}
                              </h3>
                              <p className="text-xs text-stone-400 truncate max-w-xl">
                                {slide.description || slide.subtitle || 'Açıklama girilmedi.'}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions (Matching Photo 1 buttons) */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Down Arrow */}
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'down')}
                              disabled={idx === (tempSettings.heroSlides || []).length - 1}
                              title="Aşağı Taşı"
                              className="p-2 rounded-xl bg-[#1c1c1c] border border-stone-800 text-stone-400 hover:text-white hover:border-amber-500/50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowDown size={14} />
                            </button>

                            {/* Up Arrow */}
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'up')}
                              disabled={idx === 0}
                              title="Yukarı Taşı"
                              className="p-2 rounded-xl bg-[#1c1c1c] border border-stone-800 text-stone-400 hover:text-white hover:border-amber-500/50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                              <ArrowUp size={14} />
                            </button>

                            {/* Edit / Close Toggle Button (Orange when active) */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSlideId(isExpanded ? null : (slide.id || `hs-${idx}`));
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                isExpanded
                                  ? 'bg-amber-500 text-black shadow-md'
                                  : 'bg-[#1c1c1c] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
                              }`}
                            >
                              <Edit2 size={13} />
                              <span>{isExpanded ? 'Kapat' : 'Düzenle'}</span>
                            </button>

                            {/* Hide / Show Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleSlideVisibility(idx)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isHidden
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                  : 'bg-[#1c1c1c] border-stone-800 text-stone-400 hover:text-stone-200'
                              }`}
                              title={isHidden ? 'Yayına Al' : 'Sitede Gizle'}
                            >
                              {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                              <span>{isHidden ? 'Yayına Al' : 'Gizle'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(idx)}
                              className="p-2 rounded-xl bg-[#1c1c1c] border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                              title="Slaytı Sil"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Expanded Edit Form (Image 1 bottom details) */}
                        {isExpanded && (
                          <div className="border-t border-stone-800/80 bg-[#0f0f0f] p-5 sm:p-7 space-y-5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                                SLIDER DETAYLARINI DÜZENLE (SLAYT #{idx + 1})
                              </span>
                              <span className="text-[11px] text-stone-500">
                                ID: {slide.id || `hs-${idx}`}
                              </span>
                            </div>

                            {/* Row 1: Title & Tag */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                  Slayt Ana Başlığı:
                                </label>
                                <input
                                  type="text"
                                  value={slide.title || ''}
                                  onChange={(e) => {
                                    const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                      i === idx ? { ...s, title: e.target.value } : s
                                    );
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="Örn: CNC Lake Kapı & Butik Ahşap"
                                  className="w-full bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-bold"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                  Rozet / Alt Başlık (Tag):
                                </label>
                                <input
                                  type="text"
                                  value={slide.tag || ''}
                                  onChange={(e) => {
                                    const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                      i === idx ? { ...s, tag: e.target.value } : s
                                    );
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="Örn: ÖZEL İMALAT / ATÖLYE"
                                  className="w-full bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Row 2: Image URL & Upload Button */}
                            <div>
                              <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                Slider Görsel / Video URL:
                              </label>
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <input
                                  type="text"
                                  value={slide.image || ''}
                                  onChange={(e) => {
                                    const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                      i === idx ? { ...s, image: e.target.value } : s
                                    );
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="https://... veya cihazdan yükleyin"
                                  className="flex-1 bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                                />

                                <label className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shrink-0">
                                  <Upload size={14} />
                                  <span>📁 Bilgisayardan Yükle (Foto/Video/GIF)</span>
                                  <input
                                    type="file"
                                    accept="image/*,video/*,.gif"
                                    onChange={(e) => handleHeroSlideFileUpload(e, idx)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            {/* Row 3: Description */}
                            <div>
                              <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                Açıklama Metni:
                              </label>
                              <textarea
                                rows={3}
                                value={slide.description || ''}
                                onChange={(e) => {
                                  const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, description: e.target.value } : s
                                  );
                                  setTempSettings({ ...tempSettings, heroSlides: updated });
                                }}
                                placeholder="Slayt altında görünecek açıklayıcı metin..."
                                className="w-full bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                              />
                            </div>

                            {/* Row 4: Buttons Configuration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                  Birinci Buton Metni:
                                </label>
                                <input
                                  type="text"
                                  value={slide.buttonText || ''}
                                  onChange={(e) => {
                                    const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                      i === idx ? { ...s, buttonText: e.target.value } : s
                                    );
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  placeholder="Örn: Özel Üretim Talebi"
                                  className="w-full bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                                  Birinci Buton Hedefi:
                                </label>
                                <select
                                  value={slide.buttonLink || 'custom-production'}
                                  onChange={(e) => {
                                    const updated = (tempSettings.heroSlides || []).map((s, i) =>
                                      i === idx ? { ...s, buttonLink: e.target.value } : s
                                    );
                                    setTempSettings({ ...tempSettings, heroSlides: updated });
                                  }}
                                  className="w-full bg-[#161616] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                                >
                                  <option value="custom-production">Özel Üretim Talebi (custom-production)</option>
                                  <option value="products">Tüm Ürün Kataloğu (products)</option>
                                  <option value="contact">İletişim Sayfası (contact)</option>
                                  <option value="whatsapp">WhatsApp Danışma (whatsapp)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Save All Slider Button */}
                <div className="pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSiteSettings(tempSettings);
                      showToast('Tüm slider değişiklikleri başarıyla kaydedildi ve yayınlandı!');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={16} />
                    <span>TÜM SLIDER DEĞİŞİKLİKLERİNİ KAYDET & YAYINLA</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-VIEW 2: ANA SAYFA TANITIM BÖLÜMÜ YÖNETİMİ (IMAGE 2)                   */}
            {/* ========================================================================= */}
            {contentSubTab === 'promo' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Bar */}
                <div className="bg-[#141414] border border-stone-800 p-5 rounded-2xl">
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span>ANA SAYFA TANITIM BÖLÜMÜ YÖNETİMİ</span>
                  </h2>
                </div>

                {/* Main 2-Column Content Box matching Image 2 */}
                <div className="bg-[#141414] border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Image & Upload Box */}
                    <div className="lg:col-span-5 space-y-4">
                      <label className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                        TANITIM BÖLÜMÜ GÖRSELİ
                      </label>
                      <div className="relative aspect-square max-w-[340px] mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-[#0d0d0d] border border-stone-800 shadow-xl group">
                        <img
                          src={
                            tempSettings.promoSection?.image ||
                            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'
                          }
                          alt="Tanıtım Bölümü Görseli"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                          <span className="text-[11px] font-bold text-stone-300">
                            Önizleme
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={tempSettings.promoSection?.image || ''}
                          onChange={(e) => {
                            setTempSettings({
                              ...tempSettings,
                              promoSection: {
                                ...(tempSettings.promoSection || {
                                  title: '',
                                  subtitle: '',
                                  description: '',
                                  image: '',
                                }),
                                image: e.target.value,
                              },
                            });
                          }}
                          placeholder="Görsel linki (https://...)"
                          className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-2.5 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />

                        <label className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md">
                          <Upload size={14} />
                          <span>📁 Bilgisayardan Yükle (Foto/Video/GIF)</span>
                          <input
                            type="file"
                            accept="image/*,video/*,.gif"
                            onChange={handlePromoImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Right: Text Fields matching Image 2 */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Subtitle / Slogan */}
                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          ÜST BAŞLIK / SLOGAN:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.promoSection?.subtitle || ''}
                          onChange={(e) => {
                            setTempSettings({
                              ...tempSettings,
                              promoSection: {
                                ...(tempSettings.promoSection || {
                                  title: '',
                                  subtitle: '',
                                  description: '',
                                  image: '',
                                }),
                                subtitle: e.target.value,
                              },
                            });
                          }}
                          placeholder="Örn: MERSİN'İN LOKAL DEĞERİ"
                          className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-bold"
                        />
                      </div>

                      {/* Main Title */}
                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          ANA TANITIM BAŞLIĞI:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.promoSection?.title || ''}
                          onChange={(e) => {
                            setTempSettings({
                              ...tempSettings,
                              promoSection: {
                                ...(tempSettings.promoSection || {
                                  title: '',
                                  subtitle: '',
                                  description: '',
                                  image: '',
                                }),
                                title: e.target.value,
                              },
                            });
                          }}
                          placeholder="Örn: Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri"
                          className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-bold"
                        />
                      </div>

                      {/* Owner Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                            Firma Sahibi Adı:
                          </label>
                          <input
                            type="text"
                            value={tempSettings.promoSection?.ownerName || tempSettings.ownerName || ''}
                            onChange={(e) => {
                              setTempSettings({
                                ...tempSettings,
                                ownerName: e.target.value,
                                promoSection: {
                                  ...(tempSettings.promoSection || {
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: '',
                                  }),
                                  ownerName: e.target.value,
                                },
                              });
                            }}
                            placeholder="Örn: Nuri Yanık"
                            className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                            İletişim / Telefon:
                          </label>
                          <input
                            type="text"
                            value={tempSettings.promoSection?.ownerPhone || tempSettings.phone || ''}
                            onChange={(e) => {
                              setTempSettings({
                                ...tempSettings,
                                phone: e.target.value,
                                promoSection: {
                                  ...(tempSettings.promoSection || {
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: '',
                                  }),
                                  ownerPhone: e.target.value,
                                },
                              });
                            }}
                            placeholder="Örn: 0535 219 47 89"
                            className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          AÇIKLAMA METNİ:
                        </label>
                        <textarea
                          rows={4}
                          value={tempSettings.promoSection?.description || ''}
                          onChange={(e) => {
                            setTempSettings({
                              ...tempSettings,
                              promoSection: {
                                ...(tempSettings.promoSection || {
                                  title: '',
                                  subtitle: '',
                                  description: '',
                                  image: '',
                                }),
                                description: e.target.value,
                              },
                            });
                          }}
                          placeholder="Çat Kapı ahşap üretim vizyonu ve atölye tanıtım açıklaması..."
                          className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                            Buton Metni:
                          </label>
                          <input
                            type="text"
                            value={tempSettings.promoSection?.buttonText || 'Nuri Usta İle İletişime Geç'}
                            onChange={(e) => {
                              setTempSettings({
                                ...tempSettings,
                                promoSection: {
                                  ...(tempSettings.promoSection || {
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: '',
                                  }),
                                  buttonText: e.target.value,
                                },
                              });
                            }}
                            className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                            Buton Bağlantısı:
                          </label>
                          <select
                            value={tempSettings.promoSection?.buttonLink || 'contact'}
                            onChange={(e) => {
                              setTempSettings({
                                ...tempSettings,
                                promoSection: {
                                  ...(tempSettings.promoSection || {
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: '',
                                  }),
                                  buttonLink: e.target.value,
                                },
                              });
                            }}
                            className="w-full bg-[#1a1a1a] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="contact">İletişim Sayfası (contact)</option>
                            <option value="whatsapp">WhatsApp Danışma (whatsapp)</option>
                            <option value="custom-production">Özel Üretim Talebi (custom-production)</option>
                            <option value="products">Ürün Kataloğu (products)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* İMALAT & KALİTE İLKELERİ (ANA SAYFA TANITIM KARTLARI) YÖNETİMİ */}
                <div className="bg-[#141414] border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400" />
                        <span>İMALAT & KALİTE İLKELERİ (ANA SAYFA TANITIM KARTLARI)</span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPrinciple}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>+ YENİ İLKE / MADDE EKLE</span>
                    </button>
                  </div>

                  {/* Principles List */}
                  <div className="space-y-3">
                    {(tempSettings.promoSection?.principles || []).length === 0 ? (
                      <div className="text-center py-8 px-4 bg-[#191919] rounded-2xl border border-dashed border-stone-800 text-stone-400 text-xs">
                        Henüz eklenmiş bir imalat / kalite ilkesi bulunmuyor. Yeni bir ilke eklemek için yukarıdaki butona tıklayabilirsiniz.
                      </div>
                    ) : (
                      (tempSettings.promoSection?.principles || []).map((principle, index) => (
                      <div
                        key={principle.id}
                        className="bg-[#191919] border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3.5 hover:border-stone-700 transition-colors"
                      >
                        {/* Index & Icon */}
                        <div className="flex items-center gap-2 md:w-52 shrink-0">
                          <span className="w-6 h-6 rounded-lg bg-stone-800 text-amber-400 text-xs font-bold flex items-center justify-center font-mono shrink-0">
                            {index + 1}
                          </span>
                          <select
                            value={principle.icon || 'sparkles'}
                            onChange={(e) => handleUpdatePrinciple(principle.id, 'icon', e.target.value)}
                            className="bg-[#121212] border border-stone-750 text-white text-xs font-bold p-2 rounded-xl outline-none w-full cursor-pointer"
                          >
                            <option value="sparkles" className="bg-stone-900 text-white">✨ Parıltı (Sparkles)</option>
                            <option value="shield" className="bg-stone-900 text-white">🛡️ Kalkan (Shield)</option>
                            <option value="compass" className="bg-stone-900 text-white">📐 Pergel / Ölçüm (Compass)</option>
                            <option value="check" className="bg-stone-900 text-white">✅ Onay / Garanti (Check)</option>
                            <option value="star" className="bg-stone-900 text-white">⭐ Yıldız (Star)</option>
                            <option value="hammer" className="bg-stone-900 text-white">🔨 İmalat / Çekiç (Hammer)</option>
                          </select>
                        </div>

                        {/* Title */}
                        <div className="md:w-64 shrink-0">
                          <input
                            type="text"
                            value={principle.title}
                            onChange={(e) => handleUpdatePrinciple(principle.id, 'title', e.target.value)}
                            placeholder="Başlık (örn: İpek Mat CNC Lake)"
                            className="w-full bg-[#121212] border border-stone-750 text-amber-400 font-extrabold text-xs p-2.5 rounded-xl outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={principle.description}
                            onChange={(e) => handleUpdatePrinciple(principle.id, 'description', e.target.value)}
                            placeholder="Açıklama metni..."
                            className="w-full bg-[#121212] border border-stone-750 text-stone-200 text-xs p-2.5 rounded-xl outline-none focus:border-amber-500 leading-relaxed"
                          />
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeletePrinciple(principle.id)}
                          className="p-2.5 rounded-xl bg-[#121212] border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/40 transition-colors self-end md:self-center cursor-pointer shrink-0"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )))}
                  </div>
                </div>

                {/* Save All Promo Button */}
                <div className="pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSiteSettings(tempSettings);
                      showToast('Tanıtım bölümü ve imalat kalite ilkeleri başarıyla kaydedildi ve yayınlandı!');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={16} />
                    <span>TÜM TANITIM BÖLÜMÜ BİLGİLERİNİ VE KALİTE İLKELERİNİ KAYDET & YAYINLA</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUB-VIEW 3: İLETİŞİM SAYFASI & HARİTA & SOSYAL MEDYA                      */}
            {/* ========================================================================= */}
            {contentSubTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Bar matching Image 3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-stone-800 p-5 rounded-2xl">
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>İLETİŞİM & HARİTA SAYFASI YÖNETİMİ</span>
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddContactRow}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>+ YENİ İLETİŞİM BİLGİSİ EKLE</span>
                  </button>
                </div>

                {/* Instant Instagram Sync Highlight Box */}
                <div className="bg-gradient-to-r from-pink-950/40 via-[#181818] to-purple-950/30 border border-pink-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        INSTAGRAM HESAP ADI (SAĞ ÜST VE TÜM SAYFALARDA)
                      </h4>
                      <p className="text-[11px] text-stone-400">
                        Buraya girdiğiniz kullanıcı adı sağ üst köşedeki ve tüm sayfalardaki Instagram linkine anında yansır.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:w-72">
                    <span className="text-sm font-mono font-bold text-pink-400">@</span>
                    <input
                      type="text"
                      value={tempSettings.instagram ? tempSettings.instagram.replace(/^@/, '') : 'catyapii'}
                      onChange={(e) => {
                        const val = e.target.value.trim().replace(/^@/, '');
                        setTempSettings({ ...tempSettings, instagram: val });
                        setContactRows((rows) =>
                          rows.map((r) => (r.type === 'instagram' ? { ...r, value: val } : r))
                        );
                      }}
                      placeholder="catyapii"
                      className="w-full bg-[#111111] border border-pink-500/40 text-pink-300 font-bold text-xs p-2.5 rounded-xl outline-none focus:border-pink-400 font-mono shadow-inner"
                    />
                  </div>
                </div>

                {/* Table of Contact Rows (Matching Image 3 table rows) */}
                <div className="bg-[#141414] border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe size={15} className="text-amber-400" />
                      <span>İLETİŞİM VE SOSYAL MEDYA KANALLARI LİSTESİ</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {contactRows.map((row) => (
                      <div
                        key={row.id}
                        className="bg-[#191919] border border-stone-800/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 hover:border-stone-700 transition-colors"
                      >
                        {/* Type Selector with Icon */}
                        <div className="flex items-center gap-2 sm:w-44 shrink-0 bg-[#121212] border border-stone-750 px-2.5 py-2 rounded-xl">
                          {getContactIcon(row.type)}
                          <select
                            value={row.type}
                            onChange={(e) =>
                              handleUpdateContactRow(row.id, 'type', e.target.value as any)
                            }
                            className="bg-transparent text-white text-xs font-bold outline-none w-full cursor-pointer"
                          >
                            <option value="instagram" className="bg-stone-900 text-white">Instagram</option>
                            <option value="whatsapp" className="bg-stone-900 text-white">WhatsApp</option>
                            <option value="phone" className="bg-stone-900 text-white">Telefon</option>
                            <option value="website" className="bg-stone-900 text-white">Web Sitesi</option>
                            <option value="facebook" className="bg-stone-900 text-white">Facebook</option>
                            <option value="tiktok" className="bg-stone-900 text-white">TikTok</option>
                            <option value="youtube" className="bg-stone-900 text-white">YouTube</option>
                            <option value="email" className="bg-stone-900 text-white">E-posta</option>
                            <option value="address" className="bg-stone-900 text-white">Adres</option>
                            <option value="owner" className="bg-stone-900 text-white">Firma Sahibi</option>
                            <option value="other" className="bg-stone-900 text-white">Diğer</option>
                          </select>
                        </div>

                        {/* Name / Title */}
                        <div className="sm:w-44 shrink-0">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleUpdateContactRow(row.id, 'name', e.target.value)}
                            placeholder="Başlık (örn. Instagram)"
                            className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-2.5 rounded-xl outline-none focus:border-amber-500 font-bold"
                          />
                        </div>

                        {/* Value / Link */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => handleUpdateContactRow(row.id, 'value', e.target.value)}
                            placeholder="Değer / Bağlantı (örn. catyapii, 0535 219 47 89)..."
                            className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-2.5 rounded-xl outline-none focus:border-amber-500 font-mono truncate"
                          />
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteContactRow(row.id)}
                          className="p-2.5 rounded-xl bg-[#121212] border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/40 transition-colors self-end sm:self-center cursor-pointer shrink-0"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* General Site Information Summary Grid */}
                  <div className="pt-6 border-t border-stone-800 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Phone size={15} className="text-amber-400" />
                      <span>TEMEL İLETİŞİM & ATÖLYE BİLGİLERİ</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Telefon & Arama Numarası:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.phone || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                          placeholder="0535 219 47 89"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          WhatsApp Numarası:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.whatsapp || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                          placeholder="0535 219 47 89"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          E-posta Adresi:
                        </label>
                        <input
                          type="email"
                          value={tempSettings.email || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                          placeholder="info@catkapi.com"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Firma Sahibi / Yetkili Adı:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.ownerName || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, ownerName: e.target.value })}
                          placeholder="Nuri Yanık"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Atölye / Showroom Adresi:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.address || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                          placeholder="Çay Mah. Cumhuriyet Blv. No:33/A Akdeniz / Mersin"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Çalışma Saatleri:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.workingHours || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, workingHours: e.target.value })}
                          placeholder="Pazartesi - Cumartesi: 08:30 - 19:00"
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* GOOGLE MAPS & HARİTA BİLGİLERİ (INTEGRATED DIRECTLY IN CONTACT TAB) */}
                  <div className="pt-6 border-t border-stone-800 space-y-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={15} className="text-amber-400" />
                      <span>GOOGLE MAPS & HARİTA BİLGİLERİ (GOOGLE SAYFAMIZ / YOL TARİFİ)</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Google Maps Yol Tarifi / Konum Bağlantısı:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.googleMapUrl || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, googleMapUrl: e.target.value })
                          }
                          placeholder="https://maps.google.com/?q=..."
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          Kullanıcılar "Google Haritada Aç" veya "Yol Tarifi Al" butonuna bastığında bu linke yönlendirilir.
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Google İşletme / Sayfamız Bağlantısı:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.googleBusinessUrl || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, googleBusinessUrl: e.target.value })
                          }
                          placeholder="https://g.page/r/... veya https://maps.google.com/..."
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          Google Benim İşletmem profilinizin bağlantısıdır.
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-stone-300 uppercase tracking-wider block mb-1.5">
                          Google Maps Iframe / Harita Embed URL:
                        </label>
                        <input
                          type="text"
                          value={tempSettings.googleMapEmbedUrl || ''}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, googleMapEmbedUrl: e.target.value })
                          }
                          placeholder="https://www.google.com/maps/embed?pb=..."
                          className="w-full bg-[#121212] border border-stone-750 text-white text-xs p-3 rounded-xl outline-none focus:border-amber-500 font-mono"
                        />
                        <p className="text-[10px] text-stone-500 mt-1">
                          İletişim sayfasında yer alan canlı harita kutusunda görüntülenecek Google Maps Embed iframe URL adresidir.
                        </p>
                      </div>

                      {/* Map Live Preview Box */}
                      <div className="bg-[#121212] border border-stone-750 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                            <MapPin size={13} className="text-amber-400" />
                            Canlı Harita Önizlemesi:
                          </span>
                          {tempSettings.googleMapUrl && (
                            <a
                              href={tempSettings.googleMapUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <span>Yeni Sekmede Aç</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <div className="w-full h-44 rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                          {tempSettings.googleMapEmbedUrl ? (
                            <iframe
                              src={tempSettings.googleMapEmbedUrl}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Google Harita Önizlemesi"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 text-xs">
                              <MapPin size={24} className="text-stone-600 mb-1" />
                              <span>Harita Embed URL girildiğinde burada önizlenir</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save All Contact & Social Button */}
                <div className="pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      // Construct updated socialLinks array from contactRows exactly as typed
                      const updatedSocialLinks: SocialLink[] = contactRows
                        .filter((r) => r.value.trim() !== '')
                        .map((r) => ({
                          id: r.id,
                          platform: r.type,
                          name: r.name,
                          url: r.value.trim(),
                        }));

                      const igRow = contactRows.find((r) => r.type === 'instagram');
                      const waRow = contactRows.find((r) => r.type === 'whatsapp');
                      const phoneRow = contactRows.find((r) => r.type === 'phone');
                      const emailRow = contactRows.find((r) => r.type === 'email');
                      const addrRow = contactRows.find((r) => r.type === 'address');

                      const finalSettings: SiteSettings = {
                        ...tempSettings,
                        instagram: igRow ? igRow.value.trim() : tempSettings.instagram,
                        whatsapp: waRow ? waRow.value.trim() : tempSettings.whatsapp,
                        phone: phoneRow ? phoneRow.value.trim() : tempSettings.phone,
                        email: emailRow ? emailRow.value.trim() : tempSettings.email,
                        address: addrRow ? addrRow.value.trim() : tempSettings.address,
                        socialLinks: updatedSocialLinks,
                      };

                      setTempSettings(finalSettings);
                      onUpdateSiteSettings(finalSettings);
                      showToast('İletişim, harita ve sosyal medya bilgileri başarıyla kaydedildi ve yayınlandı!');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={16} />
                    <span>İLETİŞİM, HARİTA VE SOSYAL MEDYA BİLGİLERİNİ KAYDET & YAYINLA</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: DEDICATED ARŞİV SİSTEMİ (GİZLENEN ÜRÜNLER, KATEGORİLER & ALTLAR)  */}
        {/* ========================================================================= */}
        {activeTab === 'archive' && (
          <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
            {/* Top Bar Header */}
            <div className="bg-[#141414] border border-stone-800 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
              <div>
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Archive size={18} className="text-amber-400" />
                  <span>ARŞİV SİSTEMİ & GİZLENEN İÇERİK YÖNETİMİ</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Gizlediğiniz ürünler, ana kategoriler ve alt kategoriler burada düzenli şekilde listelenir. Tek tıkla tekrar yayına alabilir veya kalıcı silebilirsiniz.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
                  Toplam {totalArchivedCount} Öğe Arşivde
                </span>
              </div>
            </div>

            {/* Sub-Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setArchiveSubFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  archiveSubFilter === 'all'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#141414] text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <span>Tüm Arşiv</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${archiveSubFilter === 'all' ? 'bg-black/30 text-black' : 'bg-stone-800 text-amber-400'}`}>
                  {totalArchivedCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setArchiveSubFilter('products')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  archiveSubFilter === 'products'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#141414] text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <Layers size={13} />
                <span>Gizlenen Ürünler</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${archiveSubFilter === 'products' ? 'bg-black/30 text-black' : 'bg-stone-800 text-amber-400'}`}>
                  {hiddenProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setArchiveSubFilter('categories')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  archiveSubFilter === 'categories'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#141414] text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <FolderTree size={13} />
                <span>Gizlenen Ana Kategoriler</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${archiveSubFilter === 'categories' ? 'bg-black/30 text-black' : 'bg-stone-800 text-amber-400'}`}>
                  {hiddenCategories.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setArchiveSubFilter('subcategories')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  archiveSubFilter === 'subcategories'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#141414] text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <Tag size={13} />
                <span>Gizlenen Alt Kategoriler</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${archiveSubFilter === 'subcategories' ? 'bg-black/30 text-black' : 'bg-stone-800 text-amber-400'}`}>
                  {hiddenSubCategories.length}
                </span>
              </button>
            </div>

            {totalArchivedCount === 0 ? (
              <div className="bg-[#141414] border border-stone-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mx-auto">
                  <Archive size={30} />
                </div>
                <h3 className="text-base font-extrabold text-white">Arşiv Boş</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Şu anda gizlenmiş veya arşive alınmış ürün veya kategori bulunmamaktadır. Ürün veya kategorilerin yanındaki "Gizle" butonuna bastığınızda burada listelenecektir.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. GİZLENEN ÜRÜNLER BÖLÜMÜ */}
                {(archiveSubFilter === 'all' || archiveSubFilter === 'products') && hiddenProducts.length > 0 && (
                  <div className="bg-[#141414] border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={15} />
                        <span>GİZLENEN / ARŞİVLENEN ÜRÜNLER ({hiddenProducts.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hiddenProducts.map((p) => {
                        const img = p.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600';
                        return (
                          <div
                            key={p.id}
                            className="bg-[#191919] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 flex gap-4 items-center transition-all"
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-stone-800 shrink-0 relative">
                              <img
                                src={img}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover opacity-75"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/80 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-500/30">
                                GİZLİ
                              </span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {p.category} {p.subCategory ? `• ${p.subCategory}` : ''}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-white truncate">{p.name || 'Başlıksız Ürün'}</h4>
                              <p className="text-[11px] text-stone-400 truncate">
                                {p.dimensions || 'Ölçü belirtilmedi'}
                              </p>
                              <div className="pt-2 flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleProductVisibility(p.id, e)}
                                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white font-bold text-[10px] rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                  title="Tekrar sitede yayına al"
                                >
                                  <Eye size={12} />
                                  <span>Yayına Al</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab('products');
                                    setSelectedProductId(p.id);
                                    setEditingProduct({ ...p });
                                    setIsCreatingNewProduct(false);
                                  }}
                                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-[10px] rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Ürün detaylarını düzenle"
                                >
                                  <Edit2 size={12} />
                                  <span>Düzenle</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                                  title="Kalıcı Olarak Sil"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. GİZLENEN ANA KATEGORİLER BÖLÜMÜ */}
                {(archiveSubFilter === 'all' || archiveSubFilter === 'categories') && hiddenCategories.length > 0 && (
                  <div className="bg-[#141414] border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <FolderTree size={15} />
                        <span>GİZLENEN ANA KATEGORİLER ({hiddenCategories.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hiddenCategories.map((cat) => {
                        const prodCount = products.filter((p) => p.category === cat.name).length;
                        return (
                          <div
                            key={cat.id}
                            className="bg-[#191919] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white truncate">{cat.name}</span>
                                <span className="text-[9px] font-black bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase">
                                  GİZLİ
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400">
                                {(cat.subCategories || []).length} Alt Kategori • {prodCount} Ürün
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleToggleCategoryVisibility(cat.id, e)}
                                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Yayına Al</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                                title="Kalıcı Olarak Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. GİZLENEN ALT KATEGORİLER BÖLÜMÜ */}
                {(archiveSubFilter === 'all' || archiveSubFilter === 'subcategories') && hiddenSubCategories.length > 0 && (
                  <div className="bg-[#141414] border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                        <Tag size={15} />
                        <span>GİZLENEN ALT KATEGORİLER ({hiddenSubCategories.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hiddenSubCategories.map((item) => {
                        const prodCount = products.filter(
                          (p) => p.category === item.parentName && p.subCategory === item.sub.name
                        ).length;

                        return (
                          <div
                            key={`${item.parentId}-${item.sub.id}`}
                            className="bg-[#191919] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white truncate">{item.sub.name}</span>
                                <span className="text-[9px] font-black bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase">
                                  GİZLİ
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400">
                                Ana Kategori: <strong className="text-stone-200">{item.parentName}</strong> ({prodCount} Ürün)
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => handleToggleSubCategoryVisibility(item.parentId, item.sub.id, e)}
                                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Yayına Al</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  askConfirmation(
                                    `'${item.sub.name}' alt kategorisini silmek istediğinize emin misiniz?`,
                                    () => {
                                      const updated = categories.map((c) =>
                                        c.id === item.parentId
                                          ? {
                                              ...c,
                                              subCategories: (c.subCategories || []).filter((s) => s.id !== item.sub.id),
                                            }
                                          : c
                                      );
                                      onUpdateCategories(updated);
                                      showToast(`'${item.sub.name}' alt kategorisi silindi.`);
                                    }
                                  );
                                }}
                                className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                                title="Kalıcı Olarak Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SUCCESS TOAST NOTIFICATION (Green, Top-Centered, 3s Auto-Dismiss) */}
      {toastMessage && (
        <div
          id="cms-success-toast"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] max-w-lg w-[92%] sm:w-auto bg-emerald-600 border-2 border-emerald-400 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl shadow-emerald-950/80 flex items-center justify-between gap-3.5 animate-in fade-in slide-in-from-top-4 duration-200"
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="leading-snug tracking-wide">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 ml-1.5"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div
          id="cms-delete-confirm-modal"
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        >
          <div
            className="bg-[#161616] border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">
                  {confirmModal.title || 'Silme Onayı'}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {confirmModal.message || 'Silmek istediğinize emin misiniz?'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-850">
              <button
                type="button"
                id="cms-confirm-cancel-btn"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-5 py-2.5 bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                İptal
              </button>

              <button
                type="button"
                id="cms-confirm-delete-btn"
                onClick={() => confirmModal.onConfirm()}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-950 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Sil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
