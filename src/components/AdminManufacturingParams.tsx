import React, { useState } from 'react';
import { Sliders, Save, Plus, Trash2, ShieldCheck, Check } from 'lucide-react';
import { ManufacturingParams } from '../types';
import { INITIAL_MANUFACTURING_PARAMS } from '../data/mockData';

interface AdminManufacturingParamsProps {
  onNotify?: (msg: string) => void;
}

export const AdminManufacturingParams: React.FC<AdminManufacturingParamsProps> = ({ onNotify }) => {
  const [params, setParams] = useState<ManufacturingParams>(() => {
    try {
      const saved = localStorage.getItem('catkapi_manufacturing_params_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MANUFACTURING_PARAMS;
  });

  const [newMaterial, setNewMaterial] = useState('');
  const [newColor, setNewColor] = useState('');

  const handleSave = () => {
    try {
      localStorage.setItem('catkapi_manufacturing_params_v1', JSON.stringify(params));
      if (onNotify) onNotify('İmalat & Malzeme Parametreleri başarıyla kaydedildi!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMaterial = () => {
    const val = newMaterial.trim();
    if (!val) return;
    if (val.toLowerCase().includes('suntalam')) {
      alert('Suntalam Çat Kapı imalat standartlarına aykırı olduğu için listeye eklenemez!');
      return;
    }
    if (params.materials.some((m) => m.toLowerCase() === val.toLowerCase())) {
      alert('Bu malzeme zaten listede mevcut.');
      return;
    }
    setParams({ ...params, materials: [...params.materials, val] });
    setNewMaterial('');
  };

  const handleRemoveMaterial = (idx: number) => {
    setParams({
      ...params,
      materials: params.materials.filter((_, i) => i !== idx),
    });
  };

  const handleAddColor = () => {
    const val = newColor.trim();
    if (!val) return;
    if (params.colors.includes(val)) return;
    setParams({ ...params, colors: [...params.colors, val] });
    setNewColor('');
  };

  const handleRemoveColor = (idx: number) => {
    setParams({
      ...params,
      colors: params.colors.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6 bg-[#121212] p-6 rounded-2xl border border-stone-850">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181818] p-4 rounded-2xl border border-stone-800">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sliders className="text-amber-500" size={20} />
            <span>İmalat & Malzeme Parametreleri Yönetimi</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1">
            Özel Üretim formundaki malzemeler, renkler ve birim maliyet değerlerini buradan güncelleyebilirsiniz.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save size={16} />
          <span>Parametreleri Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Materials List */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="text-amber-500" size={16} />
              <span>Ürün Malzemeleri ({params.materials.length})</span>
            </h4>
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Suntalam Yasaklı
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Malzeme Ekle (Örn: Masif Meşe, Marin Kontrplak...)"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddMaterial}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {params.materials.map((mat, idx) => (
              <span
                key={idx}
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs px-3 py-1 rounded-xl flex items-center gap-2"
              >
                <span>{mat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(idx)}
                  className="text-stone-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Colors & Finishes */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Check className="text-amber-500" size={16} />
              <span>Cila & Renk / Parlaklık Seçenekleri ({params.colors.length})</span>
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Renk / Cila Tipi Ekle..."
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
            {params.colors.map((color, idx) => (
              <span
                key={idx}
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs px-3 py-1 rounded-xl flex items-center gap-2"
              >
                <span>{color}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(idx)}
                  className="text-stone-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
