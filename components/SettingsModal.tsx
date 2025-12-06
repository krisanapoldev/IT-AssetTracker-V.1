
import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Check, Save, ExternalLink, Sheet, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSheetUrl, saveSheetUrl } from '../services/googleSheetsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdate: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigUpdate }) => {
  const { t, language } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) setApiKey(savedKey);
    
    const savedUrl = getSheetUrl();
    if (savedUrl) setSheetUrl(savedUrl);

    const savedAutoSync = localStorage.getItem('auto-sync-enabled') === 'true';
    setAutoSync(savedAutoSync);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    localStorage.setItem('auto-sync-enabled', String(autoSync));
    saveSheetUrl(sheetUrl);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onConfigUpdate(); // Update App state instantly without reload
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini-api-key');
    localStorage.removeItem('google-sheet-url');
    localStorage.removeItem('auto-sync-enabled');
    setApiKey('');
    setSheetUrl('');
    setAutoSync(false);
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onConfigUpdate();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-scaleUp overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
               <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <p className="text-xs text-slate-400">System Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Gemini API Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" />
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Gemini API Key"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-mono"
              />
              {apiKey && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'th' 
                ? 'จำเป็นสำหรับใช้งานฟีเจอร์ AI Assistant'
                : 'Required for AI Assistant features.'}
            </p>
             <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
             >
                Get API Key <ExternalLink className="w-3 h-3" />
             </a>
          </div>
          
          <div className="border-t border-slate-100 pt-4"></div>

          {/* Google Sheet Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Sheet className="w-4 h-4 text-emerald-600" />
              {t('gsUrlLabel')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-mono"
              />
              {sheetUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('gsUrlHint')}
            </p>
          </div>

          {/* Auto Sync Toggle */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
             <div className="flex items-center justify-between">
               <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                 <RefreshCw className="w-4 h-4 text-blue-500" />
                 {t('autoSyncSettings')}
               </label>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed">
               {t('autoSyncDesc')}
             </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
             <button
              onClick={handleClear}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                isSaved ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
