import { Category, Product, GalleryItem, VideoItem, CatalogPdf, SiteSettings, ManufacturingParams } from "../types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    "id": "yatak-odasi",
    "name": "Yatak Odası",
    "isActive": true,
    "subCategories": [
      {
        "id": "yatak-odasi-takimi",
        "name": "Yatak Odası Takımı",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Gardırop",
          "Karyola & Başlık",
          "Aynalı Şifonyer",
          "2 Komodin"
        ]
      },
      {
        "id": "gardirop",
        "name": "Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "surgulu-gardirop",
        "name": "Sürgülü Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "kapakli-gardirop",
        "name": "Kapaklı Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "sifonyer",
        "name": "Şifonyer",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "komodin",
        "name": "Komodin",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "makyaj-masasi",
        "name": "Makyaj Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "bazali-karyola",
        "name": "Bazalı Karyola",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "karyola-basligi",
        "name": "Karyola Başlığı",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "aynali-dolap",
        "name": "Aynalı Dolap",
        "meshType": "bath-mirror",
        "isActive": true
      },
      {
        "id": "giyinme-odasi",
        "name": "Giyinme Odası",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "kose-gardirop",
        "name": "Köşe Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      }
    ]
  },
  {
    "id": "genc-odasi",
    "name": "Genç Odası",
    "isActive": true,
    "subCategories": [
      {
        "id": "genc-odasi-takimi",
        "name": "Genç Odası Takımı",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Gardırop",
          "Çalışma Masası",
          "Karyola",
          "Kitaplık"
        ]
      },
      {
        "id": "gardirop-genc",
        "name": "Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "calisma-masasi-genc",
        "name": "Çalışma Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "kitaplik-genc",
        "name": "Kitaplık",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "sifonyer-genc",
        "name": "Şifonyer",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "komodin-genc",
        "name": "Komodin",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "karyola-genc",
        "name": "Karyola",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "ranza-genc",
        "name": "Ranza",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "raf-sistemleri-genc",
        "name": "Raf Sistemleri",
        "meshType": "bookshelf",
        "isActive": true
      }
    ]
  },
  {
    "id": "cocuk-odasi",
    "name": "Çocuk Odası",
    "isActive": true,
    "subCategories": [
      {
        "id": "cocuk-odasi-takimi",
        "name": "Çocuk Odası Takımı",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Gardırop",
          "Montessori Yatak",
          "Oyuncak Dolabı"
        ]
      },
      {
        "id": "montessori-yatak",
        "name": "Montessori Yatak",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "gardirop-cocuk",
        "name": "Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "calisma-masasi-cocuk",
        "name": "Çalışma Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "kitaplik-cocuk",
        "name": "Kitaplık",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "sifonyer-cocuk",
        "name": "Şifonyer",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "oyuncak-dolabi",
        "name": "Oyuncak Dolabı",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "ranza-cocuk",
        "name": "Ranza",
        "meshType": "wardrobe",
        "isActive": true
      }
    ]
  },
  {
    "id": "salon",
    "name": "Salon",
    "isActive": true,
    "subCategories": [
      {
        "id": "tv-unitesi",
        "name": "TV Ünitesi",
        "meshType": "tv-unit",
        "isActive": true
      },
      {
        "id": "konsol-salon",
        "name": "Konsol",
        "meshType": "tv-unit",
        "isActive": true
      },
      {
        "id": "vitrin-salon",
        "name": "Vitrin",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "kitaplik-salon",
        "name": "Kitaplık",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "orta-sehpa",
        "name": "Orta Sehpa",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "yan-sehpa",
        "name": "Yan Sehpa",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "dresuar-salon",
        "name": "Dresuar",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "raf-sistemleri-salon",
        "name": "Raf Sistemleri",
        "meshType": "bookshelf",
        "isActive": true
      }
    ]
  },
  {
    "id": "yemek-odasi",
    "name": "Yemek Odası",
    "isActive": true,
    "subCategories": [
      {
        "id": "yemek-odasi-takimi",
        "name": "Yemek Odası Takımı",
        "meshType": "desk",
        "isActive": true,
        "itemsIncluded": [
          "Yemek Masası",
          "Konsol",
          "Vitrin",
          "6 Sandalye"
        ]
      },
      {
        "id": "yemek-masasi",
        "name": "Yemek Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "konsol-yemek",
        "name": "Konsol",
        "meshType": "tv-unit",
        "isActive": true
      },
      {
        "id": "vitrin-yemek",
        "name": "Vitrin",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "sandalye",
        "name": "Sandalye",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "bench",
        "name": "Bench",
        "meshType": "desk",
        "isActive": true
      }
    ]
  },
  {
    "id": "mutfak",
    "name": "Mutfak",
    "isActive": true,
    "subCategories": [
      {
        "id": "mutfak-dolabi",
        "name": "Mutfak Dolabı",
        "meshType": "kitchen",
        "isActive": true
      },
      {
        "id": "ada-mutfak",
        "name": "Ada Mutfak",
        "meshType": "kitchen",
        "isActive": true
      },
      {
        "id": "kahve-kosesi",
        "name": "Kahve Köşesi",
        "meshType": "coffee-corner",
        "isActive": true
      },
      {
        "id": "kiler-dolabi",
        "name": "Kiler Dolabı",
        "meshType": "pantry",
        "isActive": true
      },
      {
        "id": "erzak-dolabi",
        "name": "Erzak Dolabı",
        "meshType": "pantry",
        "isActive": true
      },
      {
        "id": "ankastre-dolabi",
        "name": "Ankastre Dolabı",
        "meshType": "kitchen",
        "isActive": true
      },
      {
        "id": "kuvars-tezgah",
        "name": "Kuvars Tezgâh",
        "meshType": "countertop",
        "isActive": true
      },
      {
        "id": "mermer-tezgah",
        "name": "Mermer Tezgâh",
        "meshType": "countertop",
        "isActive": true
      },
      {
        "id": "evye-dolabi",
        "name": "Evye Dolabı",
        "meshType": "kitchen",
        "isActive": true
      }
    ]
  },
  {
    "id": "banyo",
    "name": "Banyo",
    "isActive": true,
    "subCategories": [
      {
        "id": "banyo-dolabi",
        "name": "Banyo Dolabı",
        "meshType": "bathroom",
        "isActive": true
      },
      {
        "id": "lavabo",
        "name": "Lavabo",
        "meshType": "sink",
        "isActive": true
      },
      {
        "id": "lavabo-dolabi",
        "name": "Lavabo Dolabı",
        "meshType": "bathroom",
        "isActive": true
      },
      {
        "id": "banyo-aynasi",
        "name": "Banyo Aynası",
        "meshType": "bath-mirror",
        "isActive": true
      },
      {
        "id": "aynali-dolap-banyo",
        "name": "Aynalı Dolap",
        "meshType": "bath-mirror",
        "isActive": true
      },
      {
        "id": "boy-dolabi",
        "name": "Boy Dolabı",
        "meshType": "pantry",
        "isActive": true
      },
      {
        "id": "dusakabin",
        "name": "Duşakabin",
        "meshType": "shower",
        "isActive": true
      },
      {
        "id": "klozet",
        "name": "Klozet",
        "meshType": "toilet",
        "isActive": true
      },
      {
        "id": "gomme-rezervuar",
        "name": "Gömme Rezervuar",
        "meshType": "toilet",
        "isActive": true
      }
    ]
  },
  {
    "id": "antre-hol",
    "name": "Antre ve Hol",
    "isActive": true,
    "subCategories": [
      {
        "id": "vestiyer",
        "name": "Vestiyer",
        "meshType": "vestiyer",
        "isActive": true
      },
      {
        "id": "ayakkabilik",
        "name": "Ayakkabılık",
        "meshType": "shoe-rack",
        "isActive": true
      },
      {
        "id": "portmanto",
        "name": "Portmanto",
        "meshType": "vestiyer",
        "isActive": true
      },
      {
        "id": "dresuar-antre",
        "name": "Dresuar",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "askilik",
        "name": "Askılık",
        "meshType": "vestiyer",
        "isActive": true
      },
      {
        "id": "hol-dolabi",
        "name": "Hol Dolabı",
        "meshType": "vestiyer",
        "isActive": true
      }
    ]
  },
  {
    "id": "kapilar",
    "name": "Kapılar",
    "isActive": true,
    "subCategories": [
      {
        "id": "celik-kapi",
        "name": "Çelik Kapı",
        "meshType": "steel-door",
        "isActive": true
      },
      {
        "id": "ic-oda-kapisi",
        "name": "İç Oda Kapısı",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "amerikan-panel-kapi",
        "name": "Amerikan Panel Kapı",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "lake-kapi",
        "name": "Lake Kapı",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "camli-kapi",
        "name": "Camlı Kapı",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "surgulu-kapi",
        "name": "Sürgülü Kapı",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "katlanir-kapi",
        "name": "Katlanır Kapı",
        "meshType": "door",
        "isActive": true
      }
    ]
  },
  {
    "id": "yapi-malzemeleri",
    "name": "Yapı Malzemeleri",
    "isActive": true,
    "subCategories": [
      {
        "id": "fayans",
        "name": "Fayans",
        "meshType": "flooring",
        "isActive": true
      },
      {
        "id": "seramik",
        "name": "Seramik",
        "meshType": "flooring",
        "isActive": true
      },
      {
        "id": "parke",
        "name": "Parke",
        "meshType": "flooring",
        "isActive": true
      },
      {
        "id": "mermer",
        "name": "Mermer",
        "meshType": "countertop",
        "isActive": true
      },
      {
        "id": "kuvars",
        "name": "Kuvars",
        "meshType": "countertop",
        "isActive": true
      },
      {
        "id": "supurgelik",
        "name": "Süpürgelik",
        "meshType": "flooring",
        "isActive": true
      },
      {
        "id": "duvar-paneli",
        "name": "Duvar Paneli",
        "meshType": "flooring",
        "isActive": true
      }
    ]
  },
  {
    "id": "ofis-mobilyalari",
    "name": "Ofis Mobilyaları",
    "isActive": true,
    "subCategories": [
      {
        "id": "mudur-masasi",
        "name": "Müdür Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "personel-masasi",
        "name": "Personel Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "calisma-masasi-ofis",
        "name": "Çalışma Masası",
        "meshType": "desk",
        "isActive": true
      },
      {
        "id": "kitaplik-ofis",
        "name": "Kitaplık",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "dosya-dolabi",
        "name": "Dosya Dolabı",
        "meshType": "pantry",
        "isActive": true
      },
      {
        "id": "toplanti-masasi",
        "name": "Toplantı Masası",
        "meshType": "desk",
        "isActive": true
      }
    ]
  },
  {
    "id": "dugun-paketleri",
    "name": "Düğün Paketleri",
    "isActive": true,
    "subCategories": [
      {
        "id": "ekonomik-paket",
        "name": "Ekonomik Paket",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Yatak Odası Takımı",
          "Yemek Odası Takımı",
          "TV Ünitesi",
          "Gardırop"
        ]
      },
      {
        "id": "standart-paket",
        "name": "Standart Paket",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Sürgülü Yatak Odası",
          "Açılır Yemek Masası",
          "Vitrin",
          "TV Ünitesi"
        ]
      },
      {
        "id": "premium-paket",
        "name": "Premium Paket",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "6 Kapak Lake Gardırop",
          "Karyola Baza",
          "Yemek Masası",
          "Konsol"
        ]
      },
      {
        "id": "luks-paket",
        "name": "Lüks Paket",
        "meshType": "wardrobe",
        "isActive": true,
        "itemsIncluded": [
          "Cam Kapak LED Gardırop",
          "Saray Yemek Odası",
          "Şömineli TV Ünitesi"
        ]
      }
    ]
  },
  {
    "id": "ozel-uretim",
    "name": "Özel Üretim",
    "isActive": true,
    "subCategories": [
      {
        "id": "ozel-olcu-mutfak",
        "name": "Özel Ölçü Mutfak",
        "meshType": "kitchen",
        "isActive": true
      },
      {
        "id": "ozel-olcu-gardirop",
        "name": "Özel Ölçü Gardırop",
        "meshType": "wardrobe",
        "isActive": true
      },
      {
        "id": "ozel-olcu-vestiyer",
        "name": "Özel Ölçü Vestiyer",
        "meshType": "vestiyer",
        "isActive": true
      },
      {
        "id": "ozel-olcu-tv-unitesi",
        "name": "Özel Ölçü TV Ünitesi",
        "meshType": "tv-unit",
        "isActive": true
      },
      {
        "id": "ozel-olcu-kitaplik",
        "name": "Özel Ölçü Kitaplık",
        "meshType": "bookshelf",
        "isActive": true
      },
      {
        "id": "cnc-kesim",
        "name": "CNC Kesim",
        "meshType": "door",
        "isActive": true
      },
      {
        "id": "projeye-ozel-uretim",
        "name": "Projeye Özel Üretim",
        "meshType": "wardrobe",
        "isActive": true
      }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-yatak-1",
    "name": "Milano Lüks Yatak Odası Takımı",
    "category": "Yatak Odası",
    "subCategory": "Yatak Odası Takımı",
    "description": "Sürgülü füme camlı gardırop, kapitone başlık bazalı karyola, aynalı şifonyer ve 2 komodin içeren komple set.",
    "extendedDescription": "Mersin imalat atölyemizde fırınlanmış Sayerlack ipek mat lake ile hazırlanan Milano Takımı; 6 kapak genişliğindeki füme cam gardırop, sensörlü LED giysi askılığı, kadife takılık çekmeceleri ve çift komodin ünitelerinden oluşur.",
    "images": [
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200"
    ],
    "coverImageIndex": 0,
    "startingPrice": 68500,
    "isCustomProduction": true,
    "isCampaign": true,
    "isNew": true,
    "stockStatus": "Sipariş Üzerine Üretiliyor",
    "materials": [
      "Sayerlack İpek Mat Lake",
      "Temperli Füme Cam",
      "Çelik Baza Şasisi"
    ],
    "keyFeatures": [
      "Sensörlü LED Aydınlatmalı Askılıklar",
      "Blum Frenli Ray ve Menteşe",
      "Kadife Çekmece İçi İçi Bölmeler"
    ],
    "specs": {
      "Gardırop Ölçüsü": "260x220x62 cm",
      "Karyola Ölçüsü": "160x200 cm Standart Yatak Uyumlu",
      "Şifonyer": "4 Çekmeceli Aynalı Konsol"
    }
  },
  {
    "id": "prod-yemek-1",
    "name": "Saray Klasik Açılır Yemek Odası Takımı",
    "category": "Yemek Odası",
    "subCategory": "Yemek Odası Takımı",
    "description": "Mermer desenli açılır masası, 6 sünger sandalyesi, aynalı konsolu ve vitrini ile eksiksiz salon yemek takımı.",
    "extendedDescription": "Aileniz ve misafirleriniz için görkemli bir akşam yemeği ortamı sunar. Masası kolay mekanizmayla 8 kişilik kapasiteye ulaşır.",
    "images": [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200"
    ],
    "coverImageIndex": 0,
    "startingPrice": 48900,
    "isCustomProduction": true,
    "isCampaign": true,
    "isNew": false,
    "stockStatus": "Sipariş Üzerine Üretiliyor",
    "materials": [
      "Mermer Efektli Kuvars Masa",
      "İpek Mat Lake Konsol"
    ],
    "keyFeatures": [
      "Kolay Açılır Raylı Masa",
      "Leke Tutmaz Tay Tüyü Sandalyeler"
    ],
    "specs": {
      "Masa Kapalı": "180x90 cm",
      "Masa Açık": "220x90 cm"
    }
  },
  {
    "id": "prod-kapi-1",
    "name": "Grand Avangarde Lake İç Oda Kapısı",
    "category": "Kapılar",
    "subCategory": "İç Oda Kapısı",
    "description": "CNC oymalı, 8 mm dökme panel gövdeli, ipek mat fırın lake boyalı, çift pervazlı oda kapısı.",
    "extendedDescription": "Mersin Akdeniz atölyemizde el işçiliğiyle rötüşlanan Grand Avangarde serisi, masif ahşap karkas ve manyetik kilit ile üretilir.",
    "images": [
      "https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=1200",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200"
    ],
    "coverImageIndex": 0,
    "startingPrice": 6800,
    "isCustomProduction": true,
    "isCampaign": true,
    "isNew": false,
    "stockStatus": "Sipariş Üzerine Üretiliyor",
    "materials": [
      "İpek Mat Lake",
      "Masif Karkas",
      "MDF"
    ],
    "keyFeatures": [
      "Yüksek Ses Yalıtımı",
      "Sararmayan Lake",
      "Sessiz Manyetik Kilit"
    ],
    "specs": {
      "Kanat Ölçüsü": "80x200 cm (Özel Ölçü)",
      "Pervaz": "L Ayarlanabilir Pervaz"
    }
  },
  {
    "id": "prod-kapi-2",
    "name": "Armor Zırhlı Monoblok Çelik Kapı",
    "category": "Kapılar",
    "subCategory": "Çelik Kapı",
    "description": "2 mm yekpare çelik şasili, Kale 6 mermi kilitli, taşyünü yalıtımlı güvenlik kapısı.",
    "extendedDescription": "Nuri Yanık imzalı zırhlı çelik kapı. Taşyünü dolgusu sayesinde dış gürültüyü ve ısı kaybını engeller.",
    "images": [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200"
    ],
    "coverImageIndex": 0,
    "startingPrice": 18500,
    "isCustomProduction": true,
    "isCampaign": false,
    "isNew": false,
    "stockStatus": "Stokta Var",
    "materials": [
      "2.0 mm Galvaniz Çelik",
      "Taşyünü",
      "Marine Ahşap"
    ],
    "keyFeatures": [
      "Kale Monoblok Kilit",
      "Geniş Kameralı Dürbün"
    ],
    "specs": {
      "Çelik Gövde": "2 mm Yekpare Sac"
    }
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    "id": "gal-1",
    "category": "İç Oda Kapıları",
    "imageUrl": "https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=1200",
    "title": "Mersin Villa Beyaz Fırın Lake Kapı Uygulamamız",
    "description": "Akdeniz atölyemizde imal edilip montajı yapılan CNC işlemeli özel lake kapı."
  },
  {
    "id": "gal-2",
    "category": "Mutfak Dolapları",
    "imageUrl": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200",
    "title": "Lüks Ada Mutfak & Kuvars Tezgah Projemiz",
    "description": "Frenli Blum mekanizmalı shaker kapak ada mutfak montajı."
  },
  {
    "id": "gal-3",
    "category": "Gardıroplar",
    "imageUrl": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200",
    "title": "Füme Camlı LED Aydınlatmalı Giyinme Odası",
    "description": "Pirinç kulp detaylı ve entegre sensörlü giyinme dolabı."
  },
  {
    "id": "gal-4",
    "category": "Banyo Dolapları",
    "imageUrl": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200",
    "title": "Saten Lake Asma Banyo Konsolu",
    "description": "Suya ve buhara dayanıklı akrilik fırın lake banyo dolabı."
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    "id": "vid-1",
    "title": "Nuri Usta İle Atölyede Fırın Lake Kapı İmalatı",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "category": "Atölye ve İmalat",
    "description": "Mersin Akdeniz zanaat tezgahlarımızda ahşabın fırınlanması ve CNC hassas oyması."
  },
  {
    "id": "vid-2",
    "title": "Mutfak Dolabı Yerinde Hassas Montaj Süreci",
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "category": "Montaj ve Keşif",
    "description": "Lazer ölçüm sonrası villada gerçekleştirdiğimiz milimetrik montaj aşamaları."
  }
];

export const INITIAL_CATALOGS: CatalogPdf[] = [
  {
    "id": "cat-pdf-1",
    "title": "Çat Kapı 2026 Kurumsal İmalat Kataloğu (PDF)",
    "pdfUrl": "#",
    "description": "İç oda kapıları, çelik kapılar, mutfak ve banyo ürün grubumuzun 2026 koleksiyonu.",
    "coverImage": "https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=600"
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  "contactTitle": "İLETİŞİM BİLGİLERİMİZ",
  "companyName": "Çat Kapı Ahşap & Lüks Mimari Çözümleri",
  "ownerName": "Nuri Yanık",
  "phone": "0535 219 47 89",
  "whatsapp": "0535 219 47 89",
  "email": "info@catkapi.com",
  "instagram": "@catyapii",
  "address": "Mersin, Akdeniz İlçesi, Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A",
  "googleMapUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12798.117011406567!2d34.629334584218635!3d36.80525164472856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f3af0c000001%3A0xc341cbd7ff74301!2sAkdeniz%2C%20Mersin!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str",
  "workingHours": "Pazartesi - Cumartesi: 08:00 - 19:00 | Pazar: Kapalı",
  "logoUrl": "",
  "heroSlides": [
    {
      "id": "hs-1",
      "title": "Kapıdan Mobilyaya Özel Üretim Çözümler",
      "subtitle": "",
      "description": "",
      "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      "tag": "",
      "buttonText": "Özel Üretim Talebi",
      "buttonLink": "custom-production",
      "secondaryButtonText": "Tüm Ürün Kataloğu",
      "secondaryButtonLink": "products",
      "isHidden": false
    },
    {
      "id": "hs-2",
      "title": "Hayalinizdeki Tasarımı Üretiyoruz",
      "subtitle": "",
      "description": "",
      "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
      "tag": "",
      "buttonText": "Özel Üretim Talebi",
      "buttonLink": "custom-production",
      "secondaryButtonText": "Tüm Ürün Kataloğu",
      "secondaryButtonLink": "products",
      "isHidden": false
    },
    {
      "id": "hs-3",
      "title": "Kaliteli Yaşam Alanları",
      "subtitle": "",
      "description": "",
      "image": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200",
      "tag": "",
      "buttonText": "Özel Üretim Talebi",
      "buttonLink": "custom-production",
      "secondaryButtonText": "Tüm Ürün Kataloğu",
      "secondaryButtonLink": "products",
      "isHidden": false
    }
  ],
  "promoSection": {
    "title": "Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri",
    "subtitle": "MERSİN'İN LOKAL DEĞERİ",
    "description": "ÇAT KAPI, Mersin Akdeniz'deki modern imalat tesisinde, Nuri Yanık liderliğinde, sıradan fabrikasyon yapı market algısını yıkmak; evine hak ettiği sıcaklığı ve lüksü kazandırmak isteyen seçkin müşterilerimiz için butik üretim yapmaktadır.",
    "image": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
    "buttonText": "Nuri Usta İle İletişime Geç",
    "buttonLink": "contact",
    "whatsappButtonText": "WhatsApp'tan Yaz",
    "ownerName": "Nuri Yanık",
    "ownerPhone": "0535 219 47 89",
    "principles": [
      {
        "id": "pr-1",
        "title": "İpek Mat CNC Lake",
        "description": "Sarılaşmayan İtalyan Sayerlack boya ve CNC hassas oyma işçiliği.",
        "icon": "sparkles"
      },
      {
        "id": "pr-2",
        "title": "Sıfır Suntalam Prensibi",
        "description": "Gövde ve kapaklarda yalnızca 1. Sınıf MDF Lam, Marin ve Lake kullanılır.",
        "icon": "shield"
      },
      {
        "id": "pr-3",
        "title": "Lazer Ölçüm & 3D Onay",
        "description": "Mersin geneli mimari keşif ve üretime geçmeden önce 3D görselleştirme.",
        "icon": "compass"
      },
      {
        "id": "pr-4",
        "title": "2 Yıl İmalat Garantisi",
        "description": "Blum & Hafele frenli ray sistemleri ile ömürlük sorunsuz kullanım.",
        "icon": "check"
      }
    ]
  },
  "socialLinks": [
    {
      "id": "soc-1",
      "platform": "instagram",
      "name": "Instagram",
      "url": "https://instagram.com/catyapii"
    },
    {
      "id": "soc-2",
      "platform": "whatsapp",
      "name": "WhatsApp",
      "url": "https://wa.me/905352194789"
    },
    {
      "id": "soc-3",
      "platform": "facebook",
      "name": "Facebook",
      "url": "https://facebook.com"
    },
    {
      "id": "soc-4",
      "platform": "youtube",
      "name": "YouTube",
      "url": "https://youtube.com"
    }
  ],
  "contactCards": [
    {
      "id": "cc-instagram",
      "title": "Instagram",
      "subtitle": "@catyapii",
      "description": "Atölyemizden yeni teslimatlar, lake kapı modelleri ve montaj videolarımız",
      "buttonText": "Instagram'da İncele",
      "actionUrl": "https://instagram.com/catyapii",
      "iconType": "instagram",
      "isActive": true
    },
    {
      "id": "cc-whatsapp",
      "title": "WhatsApp Danışma",
      "subtitle": "0535 219 47 89",
      "description": "Nuri Usta ile doğrudan görüşün, görsel atın veya anında keşif talep edin",
      "buttonText": "WhatsApp'tan Yaz",
      "actionUrl": "https://wa.me/905352194789?text=Merhaba%20Nuri%20Usta,%20Çat%20Kapı%20web%20sitenizden%20ulaşıyorum.",
      "iconType": "whatsapp",
      "isActive": true
    },
    {
      "id": "cc-address",
      "title": "Adres ve Konum",
      "subtitle": "Mersin / Akdeniz",
      "description": "Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A Akdeniz / Mersin",
      "buttonText": "Google Maps'te Aç",
      "actionUrl": "https://maps.google.com/?q=Akdeniz+Mersin+Cat+Kapi",
      "iconType": "map",
      "isActive": true
    },
    {
      "id": "cc-google-page",
      "title": "Google Sayfamız",
      "subtitle": "Çat Kapı Ahşap & Mimari",
      "description": "İşletme profilimizi görüntüleyin, yol tarifi alın ve müşteri yorumlarını inceleyin",
      "buttonText": "Google Sayfamızı Ziyaret Et",
      "actionUrl": "https://www.google.com/search?q=Çat+Kapı+Mersin+Ahşap+Akdeniz",
      "iconType": "google",
      "isActive": true
    },
    {
      "id": "cc-phone",
      "title": "Telefon Hattı",
      "subtitle": "0535 219 47 89",
      "description": "İmalat, sipariş durumu ve teknik detaylar için hemen arayın",
      "buttonText": "Hemen Ara",
      "actionUrl": "tel:05352194789",
      "iconType": "phone",
      "isActive": true
    }
  ],
  "seoTitle": "Çat Kapı | Mersin Özel Ahşap İmalatı, Kapı ve Mutfak Showroomu",
  "seoDescription": "Mersin Akdeniz özel üretim iç oda kapısı, çelik kapı, mutfak dolabı ve gardırop imalat atölyesi. Nuri Yanık güvencesiyle.",
  "seoKeywords": "Mersin kapı, lake kapı, mutfak dolabı, Akdeniz mobilya, özel üretim gardırop, Nuri Yanık, Çat Kapı",
  "aiPromptInstruction": "Sen Mersin Çat Kapı atölyesinin uzman ahşap mimarı ve müşteri danışmanısın. Nuri Yanık kurucumuzun imalat kalitesini ve malzeme avantajlarını samimi, profesyonel bir dille anlat."
};

export const INITIAL_MANUFACTURING_PARAMS: ManufacturingParams = {
  "materials": [
    "MDF Lam",
    "Lake MDF",
    "Akrilik Kapak",
    "High Gloss",
    "Membran Kapak",
    "Masif Ahşap",
    "Kontrplak",
    "Marin Kontrplak",
    "Compact Laminat",
    "PVC Kaplama",
    "Cam Kapak",
    "Alüminyum Çerçeveli Kapak",
    "Lake Cam",
    "Ahşap Kaplama",
    "Doğal Ahşap",
    "Ceviz Kaplama",
    "Meşe Kaplama",
    "Mat Saten Yüzey",
    "Parlak Yüzey",
    "Soft Touch Yüzey"
  ],
  "materialTypes": [
    "Gövde Malzemesi",
    "Kapak Malzemesi",
    "Tezgâh Malzemesi",
    "Aksesuar / Menteşe"
  ],
  "colors": [
    "Mat Saten (%10 Parlaklık) - Kadifemsi Dokulu",
    "Yarım Mat (%30 Parlaklık) - Modern Parıltı",
    "Tam Parlak (%90 Fırınlanmış Glossy)",
    "Doğal Kadife Dokulu Cila",
    "İpek Mat Beyaz",
    "Antrasit Mat",
    "Krem Saten",
    "Ceviz Dokulu"
  ],
  "units": [
    "cm",
    "m²",
    "metre tül",
    "adet"
  ],
  "dimensionLimits": {
    "minWidth": 40,
    "maxWidth": 1200,
    "defaultWidth": 240,
    "minHeight": 70,
    "maxHeight": 350,
    "defaultHeight": 220,
    "minDepth": 10,
    "maxDepth": 150,
    "defaultDepth": 60,
    "unitName": "cm"
  },
  "pricingValues": {
    "baseM2UnitPrice": 4500,
    "baseLinearUnitPrice": 3800,
    "lacquerMultiplier": 1.25,
    "acrylicMultiplier": 1.35,
    "hardwareCost": 1200,
    "vatRatePercent": 20
  }
};
