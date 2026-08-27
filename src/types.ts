export interface SubCategory {
  id: string;
  name: string;
  meshType?: string;
  isActive: boolean;
  itemsIncluded?: string[];
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  subCategories: SubCategory[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  description: string;
  extendedDescription?: string;
  dimensions?: string;
  images: string[];
  coverImageIndex?: number;
  startingPrice: number;
  campaignPrice?: number;
  priceDisplayMode?: 'normal' | 'get_quote' | 'campaign';
  isCustomProduction: boolean;
  isCampaign: boolean;
  isNew: boolean;
  isHidden?: boolean;
  stockStatus: string;
  materials: string[];
  keyFeatures: string[];
  specs: Record<string, string>;
}

export interface GalleryItem {
  id: string;
  category: string;
  imageUrl: string;
  title: string;
  description: string;
}

export interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
  category: string;
  description: string;
}

export interface CatalogPdf {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
  coverImage: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  isHidden?: boolean;
}

export interface QualityPrinciple {
  id: string;
  title: string;
  description: string;
  icon?: 'sparkles' | 'shield' | 'compass' | 'check' | 'star' | 'hammer';
}

export interface PromoSection {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  whatsappButtonText?: string;
  ownerName: string;
  ownerTitle?: string;
  ownerPhone?: string;
  principles?: QualityPrinciple[];
}

export interface SocialLink {
  id: string;
  platform: string;
  name: string;
  url: string;
}

export type ContactCardIconType = 'instagram' | 'whatsapp' | 'map' | 'google' | 'phone' | 'mail' | 'link';

export interface ContactCardItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText: string;
  actionUrl: string;
  iconType: ContactCardIconType;
  isActive: boolean;
}

export interface SiteSettings {
  contactTitle: string;
  companyName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  googleMapUrl: string;
  googleMapEmbedUrl?: string;
  googleBusinessUrl?: string;
  workingHours: string;
  logoUrl: string;
  heroSlides: HeroSlide[];
  promoSection: PromoSection;
  socialLinks: SocialLink[];
  contactCards?: ContactCardItem[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  aiPromptInstruction: string;
}

export interface ManufacturingParams {
  materials: string[];
  materialTypes: string[];
  colors: string[];
  units: string[];
  dimensionLimits: {
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
    minHeight: number;
    maxHeight: number;
    defaultHeight: number;
    minDepth: number;
    maxDepth: number;
    defaultDepth: number;
    unitName: string;
  };
  pricingValues: {
    baseM2UnitPrice: number;
    baseLinearUnitPrice: number;
    lacquerMultiplier: number;
    acrylicMultiplier: number;
    hardwareCost: number;
    vatRatePercent: number;
  };
}

export type MainTabType = 'home' | 'products' | 'custom-production' | 'contact';
