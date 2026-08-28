import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, ArrowLeft, ArrowRight, Star, Video, Film, Upload } from 'lucide-react';

interface MediaGalleryUploaderProps {
  mediaList: string[];
  onChange: (newList: string[]) => void;
  maxFiles?: number;
  title?: string;
  coverIndex?: number;
  onCoverIndexChange?: (index: number) => void;
}

export const MediaGalleryUploader: React.FC<MediaGalleryUploaderProps> = ({
  mediaList = [],
  onChange,
  maxFiles = 30,
  title = '1. ÜRÜN FOTOĞRAF & MEDYA GALERİ (FOTOĞRAF, VİDEO, GIF)',
  coverIndex = 0,
  onCoverIndexChange,
}) => {
  const [inputUrl, setInputUrl] = useState('');

  const isVideoUrl = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith('data:video') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.mov') ||
      url.includes('youtube.com') ||
      url.includes('vimeo.com')
    );
  };

  // Compress and resize image files before saving as data URL to prevent payload overflow
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // If it is a video or animated gif or svg, don't canvas compress
      if (!file.type.startsWith('image/') || file.type.includes('gif') || file.type.includes('svg')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
            resolve(compressedDataUrl);
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaList.length + files.length > maxFiles) {
      alert(`En fazla ${maxFiles} adet medya (fotoğraf, video, GIF) yüklenebilir!`);
      return;
    }

    const fileList: File[] = Array.from(files);
    try {
      const readers = fileList.map((file) => compressImage(file));
      const newUrls = await Promise.all(readers);
      const validUrls = newUrls.filter((u) => u && u.length > 0);
      onChange([...mediaList, ...validUrls]);
    } catch (err) {
      console.error('Fotoğraf yükleme hatası:', err);
    }

    e.target.value = '';
  };

  const handleAddUrl = () => {
    const url = inputUrl.trim();
    if (!url) return;
    if (mediaList.length >= maxFiles) {
      alert(`En fazla ${maxFiles} adet medya eklenebilir!`);
      return;
    }
    onChange([...mediaList, url]);
    setInputUrl('');
  };

  const handleRemove = (index: number) => {
    const next = mediaList.filter((_, i) => i !== index);
    onChange(next);
    if (onCoverIndexChange && coverIndex >= next.length) {
      onCoverIndexChange(Math.max(0, next.length - 1));
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;

    const copy = [...mediaList];
    const item = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = item;
    onChange(copy);

    if (onCoverIndexChange) {
      if (coverIndex === index) onCoverIndexChange(targetIndex);
      else if (coverIndex === targetIndex) onCoverIndexChange(index);
    }
  };

  const safeCoverIndex = coverIndex < mediaList.length ? coverIndex : 0;
  const currentCoverMedia = mediaList[safeCoverIndex] || mediaList[0];

  return (
    <div className="bg-[#121212] p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Film size={16} className="text-amber-400" />
          <span>{title}</span>
        </span>
        <span
          className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
            mediaList.length >= maxFiles
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          {mediaList.length} / {maxFiles} Medya (Max 30)
        </span>
      </div>

      {/* Büyük Ana Kapak Medyası Önizlemesi (Görsel 1 & 2'deki gibi) */}
      {currentCoverMedia ? (
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-black border-2 border-stone-800 flex items-center justify-center">
          {isVideoUrl(currentCoverMedia) ? (
            <video
              src={currentCoverMedia}
              controls
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <img
              src={currentCoverMedia}
              alt="Ana Kapak Medyası"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Kapak Rozeti */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 z-10">
            <Star size={13} fill="currentColor" />
            <span>★ ANA KAPAK MEDYASI</span>
          </div>

          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur rounded-lg text-[10px] font-mono text-stone-300 border border-stone-800">
            Kapak No: {safeCoverIndex + 1} / {mediaList.length}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#161616] rounded-2xl border border-dashed border-stone-800 text-stone-400 text-xs">
          Henüz fotoğraf, video veya GIF eklenmedi. Aşağıdaki butondan bilgisayarınızdan en fazla 30 adet dosya seçebilirsiniz.
        </div>
      )}

      {/* Küçük Thumbnail Galerisi */}
      {mediaList.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Yüklenen Medyalar ({mediaList.length}):
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-48 overflow-y-auto p-1 bg-[#0d0d0d] rounded-xl border border-stone-850">
            {mediaList.map((media, idx) => {
              const isCover = idx === safeCoverIndex;
              const isVideo = isVideoUrl(media);
              return (
                <div
                  key={idx}
                  onClick={() => onCoverIndexChange && onCoverIndexChange(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-stone-900 border-2 group cursor-pointer transition-all ${
                    isCover ? 'border-amber-500 scale-95 shadow-md shadow-amber-950' : 'border-stone-800 hover:border-stone-600 opacity-75 hover:opacity-100'
                  }`}
                >
                  {isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-stone-950 text-amber-400">
                      <Video size={20} />
                    </div>
                  ) : (
                    <img
                      src={media}
                      alt={`Medya ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Kapak rozeti */}
                  {isCover && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1 py-0.5 rounded shadow flex items-center gap-0.5">
                      <Star size={8} fill="currentColor" />
                    </span>
                  )}

                  {/* Kontroller */}
                  <div
                    className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center">
                      {onCoverIndexChange && !isCover && (
                        <button
                          type="button"
                          onClick={() => onCoverIndexChange(idx)}
                          className="px-1.5 py-0.5 bg-amber-500 text-black rounded text-[8px] font-bold cursor-pointer"
                          title="Kapak Yap"
                        >
                          Kapak
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 bg-red-600 hover:bg-red-500 text-white rounded cursor-pointer ml-auto"
                        title="Sil"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'left')}
                        className="p-0.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-20 text-white rounded cursor-pointer"
                      >
                        <ArrowLeft size={11} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === mediaList.length - 1}
                        onClick={() => handleMove(idx, 'right')}
                        className="p-0.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-20 text-white rounded cursor-pointer"
                      >
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yükleme Bölümü (Görsel 1 & 2'deki MEDYA YÜKLE / EKLE) */}
      <div className="bg-[#181818] p-3.5 rounded-xl border border-stone-800 space-y-2.5">
        <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
          MEDYA YÜKLE / EKLE (FOTOĞRAF, VİDEO, GIF)
        </span>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Cihaz / Galeriden Yükle */}
          <label className="px-4 py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-amber-500/50 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-all shadow-sm">
            <Upload size={15} className="text-amber-400" />
            <span>Cihaz / Galeriden Yükle</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*,.gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* URL ile Ekle */}
          <div className="flex flex-1 gap-1.5">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="YouTube, Vimeo, MP4 video veya Fotoğraf URL adresi yapıştırın..."
              className="w-full bg-[#111111] border border-stone-750 text-xs px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 placeholder:text-stone-500"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0 transition-all"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400">
          <span>✓ <strong>Sınırsız Fotoğraf:</strong> Cihazınızdan istediğiniz kadar mobilya fotoğrafı seçip yükleyebilirsiniz.</span>
          <span>✓ <strong>Video Desteği:</strong> YouTube (Shorts dahil), Vimeo veya doğrudan .mp4 video linklerini yapıştırarak ürüne video ekleyebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
};
