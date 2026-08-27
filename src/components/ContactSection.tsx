import React from 'react';
import {
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  MapPin,
  ExternalLink,
  Search,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ContactSectionProps {
  siteSettings: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  const masterName = siteSettings?.ownerName || siteSettings?.promoSection?.ownerName || 'Nuri Yanık';
  const masterPhone = siteSettings?.promoSection?.ownerPhone || siteSettings?.phone || '0535 219 47 89';
  const rawPhone = masterPhone.replace(/\s+/g, '');
  const rawWhatsApp = (siteSettings?.whatsapp || masterPhone).replace(/[^0-9]/g, '');

  // Social Links with fallbacks
  const instagramLink =
    siteSettings?.socialLinks?.find((s) => s.platform === 'instagram')?.url ||
    (siteSettings?.instagram
      ? siteSettings.instagram.startsWith('http')
        ? siteSettings.instagram
        : `https://instagram.com/${siteSettings.instagram.replace(/^@/, '')}`
      : 'https://instagram.com/catyapii');

  const whatsappLink =
    siteSettings?.socialLinks?.find((s) => s.platform === 'whatsapp')?.url ||
    `https://wa.me/${rawWhatsApp || '905352194789'}`;

  const facebookLink =
    siteSettings?.socialLinks?.find((s) => s.platform === 'facebook')?.url ||
    'https://facebook.com';

  const youtubeLink =
    siteSettings?.socialLinks?.find((s) => s.platform === 'youtube')?.url ||
    'https://youtube.com';

  const addressText = siteSettings?.address || 'Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A Akdeniz / Mersin';
  const googleMapUrl = siteSettings?.googleMapUrl || 'https://maps.google.com/?q=Akdeniz+Mersin+Cat+Kapi';
  const googleBusinessUrl = siteSettings?.googleBusinessUrl || 'https://www.google.com/search?q=Çat+Kapı+Mersin+Ahşap+Akdeniz';

  return (
    <section id="contact-section-wrapper" className="w-full bg-[#0d0d0d] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Monospace Centered Amber Title matching reference */}
        <div className="text-center">
          <h2 className="text-amber-500 font-mono font-bold text-xs sm:text-sm tracking-widest uppercase">
            İLETİŞİM BİLGİLERİMİZ
          </h2>
        </div>

        {/* MAIN BIG CARD CONTAINER */}
        <div className="bg-[#141414] border border-stone-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-7">
          {/* Top 4 Social / Contact Boxes (2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* INSTAGRAM */}
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-stone-800 hover:border-pink-500/50 hover:bg-[#1e1e1e] transition-all cursor-pointer shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform shrink-0">
                <Instagram size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider block">
                  INSTAGRAM
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-pink-400 transition-colors truncate block">
                  {instagramLink}
                </span>
              </div>
            </a>

            {/* WHATSAPP */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-stone-800 hover:border-emerald-500/50 hover:bg-[#1e1e1e] transition-all cursor-pointer shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider block">
                  WHATSAPP
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate block">
                  {whatsappLink}
                </span>
              </div>
            </a>

            {/* FACEBOOK */}
            <a
              href={facebookLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-stone-800 hover:border-blue-500/50 hover:bg-[#1e1e1e] transition-all cursor-pointer shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                <Facebook size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider block">
                  FACEBOOK
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-blue-400 transition-colors truncate block">
                  {facebookLink}
                </span>
              </div>
            </a>

            {/* YOUTUBE */}
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 rounded-2xl bg-[#1a1a1a] border border-stone-800 hover:border-red-500/50 hover:bg-[#1e1e1e] transition-all cursor-pointer shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0">
                <Youtube size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-black text-stone-400 uppercase tracking-wider block">
                  YOUTUBE
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-red-400 transition-colors truncate block">
                  {youtubeLink}
                </span>
              </div>
            </a>
          </div>

          {/* Middle Row: Two Prominent Action Buttons Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Direct Call Button (Dark with phone icon) */}
            <a
              id="contact-call-master-btn"
              href={`tel:${rawPhone}`}
              className="flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-[#1b1b1b] hover:bg-[#242424] border border-stone-750 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg hover:border-amber-500/50"
            >
              <Phone size={17} className="text-amber-400" />
              <span>{masterName.toUpperCase()} 'I HEMEN ARA</span>
            </a>

            {/* WhatsApp Direct Button (Green) */}
            <a
              id="contact-whatsapp-direct-btn"
              href={whatsappLink}
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
                src={
                  siteSettings?.googleMapEmbedUrl ||
                  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d102379.84542289453!2d34.56847253579047!3d36.80918073574971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f39b6b7a5e95%3A0x6b1d408fbc8d31b0!2sAkdeniz%2C%20Mersin!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str'
                }
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
