
import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, AssetCondition } from '../types';
import { CATEGORIES, LOCATIONS } from '../services/mockData';
import { X, Image as ImageIcon, Upload, Calendar, Hash, Type, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getStatusDisplay, getConditionDisplay } from '../services/translations';

interface AssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (asset: Asset) => void;
  initialData?: Asset | null;
}

interface InputGroupProps {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {icon && React.createElement(icon, { className: "w-4 h-4 text-indigo-500" })}
      {label}
    </label>
    {children}
  </div>
);

const AssetForm: React.FC<AssetFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t, language } = useLanguage();

  const defaultAsset: Asset = {
    id: '',
    name: '',
    serialNumber: '',
    category: CATEGORIES[0],
    location: LOCATIONS[0],
    status: AssetStatus.AVAILABLE,
    condition: AssetCondition.NEW,
    isVendorLoan: false,
    image: `https://picsum.photos/200/200?random=${Date.now()}`
  };

  const [formData, setFormData] = useState<Asset>(defaultAsset);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageSizeWarning, setImageSizeWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.image?.startsWith('data:')) {
        setImageMode('upload');
      } else {
        setImageMode('url');
      }
    } else {
      setFormData({
        ...defaultAsset, 
        id: `AST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      });
      setImageMode('url');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit input file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }
      
      setIsProcessingImage(true);
      setImageSizeWarning(null);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize Logic - Optimized for Storage
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Reduce Max dimension to 600px to keep storage usage low and compatible with Sheets
          const MAX_SIZE = 600;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to highly compressed JPEG (0.6 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          
          // Check resulting size
          const sizeInKB = Math.round((dataUrl.length * 0.75) / 1024);
          if (sizeInKB > 100) {
             setImageSizeWarning(`Note: Image is large (~${sizeInKB}KB). It may slow down syncing.`);
          }

          setFormData(prev => ({ ...prev, image: dataUrl }));
          setIsProcessingImage(false);
        };
        img.src = event.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.purchaseDate && formData.warrantyEndDate) {
      if (new Date(formData.warrantyEndDate) <= new Date(formData.purchaseDate)) {
        alert("Warranty End Date must be after Purchase Date");
        return;
      }
    }
    onSubmit(formData);
    onClose();
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? t('editHeader') : t('newHeader')}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{t('fillDetails')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Image Upload Section */}
          <div className="col-span-2 flex flex-col sm:flex-row gap-6 items-start p-4 rounded-2xl bg-slate-50/50 border border-slate-100 mb-2">
            <div className="w-32 h-32 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group">
                {isProcessingImage ? (
                   <div className="w-full h-full flex items-center justify-center text-indigo-500">
                     <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                   </div>
                ) : formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
            </div>
            
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-semibold text-slate-700">{t('imageLabel')}</label>
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {t('imageUrl')}
                </button>
                <button 
                   type="button"
                   onClick={() => setImageMode('upload')}
                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${imageMode === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {t('uploadFile')}
                </button>
              </div>

              {imageMode === 'url' ? (
                <input
                  type="text"
                  name="image"
                  value={formData.image || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={inputClass}
                />
              ) : (
                 <>
                   <label className="flex items-center justify-center w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600">
                         <Upload className="w-4 h-4" />
                         <span className="text-xs font-semibold">{t('uploadHint')}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {imageSizeWarning && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{imageSizeWarning}</span>
                    </div>
                  )}
                 </>
              )}
            </div>
          </div>

          <InputGroup label={t('assetName')} icon={Type}>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. MacBook Pro M3"
            />
          </InputGroup>

          <InputGroup label={t('serialNumber')} icon={Hash}>
            <input
              type="text"
              name="serialNumber"
              required
              value={formData.serialNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. C02XY..."
            />
          </InputGroup>

          <InputGroup label={t('purchaseDate')} icon={Calendar}>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </InputGroup>

          <InputGroup label={t('warrantyEnds')} icon={Calendar}>
            <input
              type="date"
              name="warrantyEndDate"
              value={formData.warrantyEndDate || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </InputGroup>

          <div className="col-span-2 md:col-span-1">
             <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('category')}</label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
             <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('location')}</label>
             <div className="relative">
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
             <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('currentStatus')}</label>
             <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  {Object.values(AssetStatus).map(s => <option key={s} value={s}>{getStatusDisplay(s, language)}</option>)}
                </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('condition')}</label>
            <div className="relative">
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {Object.values(AssetCondition).map(c => <option key={c} value={c}>{getConditionDisplay(c, language)}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Conditional Fields Area */}
          <div className="col-span-2 space-y-4">
            
            {/* Vendor Toggle */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="isVendorLoan"
                  name="isVendorLoan"
                  checked={formData.isVendorLoan}
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400"
                />
                 <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <label htmlFor="isVendorLoan" className="text-sm font-medium text-slate-700 cursor-pointer flex-1 select-none">
                {t('isVendorLoan')}
              </label>
            </div>

            {formData.isVendorLoan && (
              <div className="animate-slideDown pl-4 border-l-2 border-indigo-200">
                <label className="text-sm font-semibold text-indigo-900 mb-1.5 block">{t('vendorName')}</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-indigo-50 border-none ring-1 ring-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm placeholder:text-indigo-300"
                  placeholder="e.g., Dell Thailand, Cisco Systems"
                />
              </div>
            )}

            {(formData.status === AssetStatus.BORROWED || formData.status === AssetStatus.IN_USE) && (
               <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 animate-slideDown">
                 <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {t('borrowingDetails')}
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 block">{t('borrowerName')}</label>
                      <input
                        type="text"
                        name="borrowerName"
                        value={formData.borrowerName || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-white border-none ring-1 ring-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Who has this?"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5 block">{t('returnDue')}</label>
                      <input
                        type="date"
                        name="returnDueDate"
                        value={formData.returnDueDate || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-white border-none ring-1 ring-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                   </div>
                 </div>
               </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t('notes')}</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Additional details..."
            ></textarea>
          </div>

          <div className="col-span-2 pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingImage ? 'Processing...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
