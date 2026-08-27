import React from 'react';
import {
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Mail,
  MapPin,
  ExternalLink,
  Search,
  User,
  Share2,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ContactSectionProps {
  siteSettings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  const masterName = siteSettings?.ownerName || siteSettings?.promoSection?.ownerName || 'Nuri Yanık';
  const masterPhone = siteSettings?.phone || siteSettings?.promoSection?.ownerPhone || '0535 219 47 89';
  const rawPhone = masterPhone.replace(/\s+/g, '');
  const rawWhatsApp = (siteSettings?.whatsapp || masterPhone).replace(/[^0-9]/g, '');

  const whatsappDirectLink = siteSettings?.whatsapp
    ? siteSettings.whatsapp.startsWith('http')
      ? siteSettings.whatsapp
      : `https://wa.me/${rawWhatsApp || '905352194789'}`
    : `https://wa.me/${rawWhatsApp || '905352194789'}`;

  // Helper for dynamic channel styling & icons
  const getChannelMeta = (platform: string, name: string, url: string) => {
    const p = platform.toLowerCase();
    if (p === 'instagram' || name.toLowerCase().includes('instagram')) {
      const cleanIg = url.startsWith('http') ? url : `https://instagram.com/${url.replace(/^@/, '').trim()}`;
      return {
        icon: <Instagram size={20} />,
        label: 'INSTAGRAM',
        displayVal: url,
        link: cleanIg,
        iconBg: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
        hoverBorder: 'hover:border-pink-500/50 hover:text-pink-400',
      };
    }
    if (p === 'whatsapp' || name.toLowerCase().includes('whatsapp')) {
      const cleanWa = url.startsWith('http') ? url : `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
      return {
        icon: <MessageCircle size={20} />,
        label: 'WHATSAPP',
        displayVal: url,
        link: cleanWa,
        iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        hoverBorder: 'hover:border-emerald-500/50 hover:text-emerald-400',
      };
    }
    if (p === 'facebook' || name.toLowerCase().includes('facebook')) {
      return {
        icon: <Facebook size={20} />,
        label: 'FACEBOOK',
        displayVal: url,
        link: url.startsWith('http') ? url : `https://${url}`,
        iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        hoverBorder: 'hover:border-blue-500/50 hover:text-blue-400',
      };
    }
    if (p === 'youtube' || name.toLowerCase().includes('youtube')) {
      return {
        icon: <Youtube size={20} />,
        label: 'YOUTUBE',
        displayVal: url,
        link: url.startsWith('http') ? url : `https://${url}`,
        iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
        hoverBorder: 'hover:border-red-500/50 hover:text-red-400',
      };
    }
    if (p === 'tiktok' || name.toLowerCase().includes('tiktok')) {
      return {
        icon: <Share2 size={20} />,
        label: 'TIKTOK',
        displayVal: url,
        link: url.startsWith('http') ? url : `https://${url}`,
        iconBg: 'bg-stone-500/10 border-stone-500/20 text-white',
        hoverBorder: 'hover:border-stone-400 hover:text-stone-300',
      };
    }
    if (p === 'email' || name.toLowerCase().includes('posta') || name.toLowerCase().includes('mail')) {
      return {
        icon: <Mail size={20} />,
        label: 'E-POSTA',
        displayVal: url,
        link: `mailto:${url}`,
        iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        hoverBorder: 'hover:border-purple-500/50 hover:text-purple-400',
      };
    }
    if (p === 'phone' || name.toLowerCase().includes('telefon') || name.toLowerCase().includes('arama')) {
      return {
        icon: <Phone size={20} />,
        label: name.toUpperCase() || 'TELEFON',
        displayVal: url,
        link: `tel:${url.replace(/\s+/g, '')}`,
        iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        hoverBorder: 'hover:border-amber-500/50 hover:text-amber-400',
      };
    }
    if (p === 'address' || name.toLowerCase().includes('adres')) {
      return {
        icon: <MapPin size={20} />,
        label: name.toUpperCase() || 'ADRES',
        displayVal: url,
        link: siteSettings?.googleMapUrl || 'https://maps.google.com',
        iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        hoverBorder: 'hover:border-amber-500/50 hover:text-amber-400',
      };
    }
    if (p === 'owner' || name.toLowerCase().includes('sahibi') || name.toLowerCase().includes('usta')) {
      return {
        icon: <User size={20} />,
        label: name.toUpperCase() || 'FİRMA SAHİBİ',
        displayVal: url,
        link: `tel:${rawPhone}`,
        iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        hoverBorder: 'hover:border-amber-500/50 hover:text-amber-400',
      };
    }

    // Default website / generic link
    return {
      icon: <Globe size={20} />,
      label: (name || 'WEB SİTESİ').toUpperCase(),
      displayVal: url,
      link: url.startsWith('http') ? url : `https://${url}`,
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      hoverBorder: 'hover:border-amber-500/50 hover:text-amber-400',
    };
  };

  // Get active list of social / contact channels from settings
  const dynamicChannels =
    siteSettings?.socialLinks && siteSettings.socialLinks.length > 0
      ? siteSettings.socialLinks
      : [
          {
            id: 'c-ig',
            platform: 'instagram',
            name: 'Instagram',
            url: siteSettings?.instagram
              ? siteSettings.instagram.startsWith('http')
                ? siteSettings.instagram
                : `https://instagram.com/${siteSettings.instagram.replace(/^@/, '')}`
              : 'https://instagram.com/catyapii',
          },
          {
            id: 'c-wa',
            platform: 'whatsapp',
            name: 'WhatsApp',
            url: whatsappDirectLink,
          },
          {
            id: 'c-fb',
            platform: 'facebook',
            name: 'Facebook',
            url: 'https://facebook.com',
          },
          {
            id: 'c-yt',
            platform: 'youtube',
            name: 'YouTube',
            url: 'https://youtube.com',
          },
        ];

  const addressText = siteSettings?.address || 'Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A Akdeniz / Mersin';
  const googleMapUrl = siteSettings?.googleMapUrl || 'https://maps.google.com/?q=Akdeniz+Mersin+Cat+Kapi';
  const googleBusinessUrl = siteSettings?.googleBusinessUrl || 'https://www.google.com/search?q=Çat+Kapı+Mersin+Ahşap+Akdeniz';
  const googleMapEmbedUrl =
    siteSettings?.googleMapEmbedUrl ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102379.84542289453!2d34.56847253579047!3d36.80918073574971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f39b6b7a5e95%3A0x6b1d408fbc8d31b0!2sAkdeniz%2C%20Mersin!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str';

  return (
    <section id="contact-section-wrapper" className="w-full bg-[#0d0d0d] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Monospace Centered Amber Title */}
        <div className="text-center">
          <h2 className="text-amber-500 font-mono font-bold text-xs sm:text-sm tracking-widest uppercase">
            İLETİŞİM BİLGİLERİMİZ
          </h2>
        </div>

        {/* MAIN BIG CARD CONTAINER */}
        <div className="bg-[#141414] border border-stone-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-7">
          {/* Dynamic Social & Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dynamicChannels.map((chan) => {
              const meta = getChannelMeta(chan.platform, chan.name, chan.url);
              return (
                <a
                  key={chan.id || chan.name}
                  href={meta.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-stone-800 ${meta.hoverBorder} hover:bg-[#1e1e1e] transition-all cursor-pointer shadow-md`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${meta.iconBg}`}
                  >
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider block">
                      {chan.name ? chan.name.toUpperCase() : meta.label}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-white transition-colors truncate block">
                      {meta.displayVal || chan.url}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Middle Row: Direct Call & WhatsApp Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Direct Call Button */}
            <a
              id="contact-call-master-btn"
              href={`tel:${rawPhone}`}
              className="flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-[#1b1b1b] hover:bg-[#242424] border border-stone-750 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:border-amber-500/50"
            >
              <Phone size={17} className="text-amber-400" />
              <span>{masterName.toUpperCase()} 'I HEMEN ARA</span>
            </a>

            {/* WhatsApp Direct Button */}
            <a
              id="contact-whatsapp-direct-btn"
              href={whatsappDirectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-[#00A859] hover:bg-[#008f4c] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-900/30"
            >
              <MessageCircle size={18} className="text-white" />
              <span>WHATSAPP İLE İLETİŞİME GEÇ</span>
            </a>
          </div>

          {/* Bottom Section: ADRES & Google Map Embed */}
          <div className="space-y-3.5 pt-4 border-t border-stone-850">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-500">
                <MapPin size={16} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  ATÖLYE & SHOWROOM ADRESİ
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                {addressText}
              </p>
            </div>

            {/* Interactive Embedded Google Map Preview */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-stone-800 bg-[#1e1e1e] shadow-inner">
              <iframe
                title="Çat Kapı Ahşap ve Mimari Konum"
                src={googleMapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale-[25%] contrast-[105%]"
              />
            </div>

            {/* Bottom Links under the Map */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono text-stone-400">
              <a
                href={googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <MapPin size={13} className="text-amber-500" />
                <span>Google Maps'te Aç</span>
                <ExternalLink size={11} />
              </a>

              <a
                href={googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Search size={13} className="text-blue-400" />
                <span>Google Sayfamız</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

