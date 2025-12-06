
import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetStatus, BorrowRecord } from './types';
import { db } from './services/db';
import DashboardStats from './components/DashboardStats';
import AssetList from './components/AssetList';
import AssetForm from './components/AssetForm';
import AIChat from './components/AIChat';
import HistoryLog from './components/HistoryLog';
import SettingsModal from './components/SettingsModal';
import { LayoutDashboard, List, MessageSquare, Plus, Settings, CheckCircle2, AlertCircle, AlertTriangle, History, Menu, X, Languages, Loader2, Download, Upload, FileSpreadsheet, Cloud, CloudUpload, CloudDownload, RefreshCw } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { loadFromGoogleSheets, syncToGoogleSheets, getSheetUrl } from './services/googleSheetsService';

// Modern Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideInUp transition-all backdrop-blur-md ${
    type === 'success' ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
  }`}>
    <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    </div>
    <span className="font-semibold tracking-wide">{message}</span>
  </div>
);

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  
  // --- STATE ---
  
  // Data State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [historyLogs, setHistoryLogs] = useState<BorrowRecord[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // UI State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inventory' | 'history' | 'ai'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---

  // Initial Data Load from Database & Auto Sync Init
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [fetchedAssets, fetchedHistory] = await Promise.all([
          db.getAssets(),
          db.getHistory()
        ]);
        setAssets(fetchedAssets);
        setHistoryLogs(fetchedHistory);
      } catch (error) {
        console.error("Failed to load data", error);
        showNotification(t('error'), 'error');
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();

    // Check Auto Sync Setting
    handleConfigUpdate();
  }, [t]);

  // Update Config Helper
  const handleConfigUpdate = () => {
    const savedAutoSync = localStorage.getItem('auto-sync-enabled') === 'true';
    setAutoSyncEnabled(savedAutoSync);
  };

  // AUTO SYNC POLLING EFFECT
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (autoSyncEnabled && getSheetUrl()) {
      interval = setInterval(() => {
        // Prevent syncing if user is currently editing a form to avoid collisions
        if (!isFormOpen && !isSyncing) {
          console.log("Auto-Syncing...");
          handleLoadFromCloud(true); // silent mode
        }
      }, 60000); // 60 seconds interval
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSyncEnabled, isFormOpen, isSyncing]);

  // --- ACTIONS ---

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddAsset = async (newAsset: Asset) => {
    try {
      // 1. Logic for History Logging (Borrow/Return events)
      let updatedLogs = [...historyLogs];
      const todayStr = new Date().toISOString().split('T')[0];

      if (editingAsset) {
        const oldAsset = assets.find(a => a.id === newAsset.id);
        
        if (oldAsset) {
          // Case A: Item is being Borrowed (Status changed to BORROWED)
          if (oldAsset.status !== AssetStatus.BORROWED && newAsset.status === AssetStatus.BORROWED) {
            const newLog: BorrowRecord = {
              id: `LOG-${Date.now()}`,
              assetId: newAsset.id,
              assetName: newAsset.name,
              serialNumber: newAsset.serialNumber,
              assetImage: newAsset.image,
              borrowerName: newAsset.borrowerName || 'Unknown',
              borrowDate: newAsset.borrowDate || todayStr,
              status: 'BORROWED'
            };
            updatedLogs.push(newLog);
          }
          
          // Case B: Item is Returned (Status changed from BORROWED to something else)
          else if (oldAsset.status === AssetStatus.BORROWED && newAsset.status !== AssetStatus.BORROWED) {
            // Find the latest open log for this asset
            const openLogIndex = updatedLogs.findIndex(log => log.assetId === newAsset.id && log.status === 'BORROWED');
            if (openLogIndex !== -1) {
               updatedLogs[openLogIndex] = {
                 ...updatedLogs[openLogIndex],
                 status: 'RETURNED',
                 returnDate: todayStr
               };
            }
          }
        }
      } else {
        // New Asset Creation
        // If creating a new asset that is ALREADY borrowed, log it.
        if (newAsset.status === AssetStatus.BORROWED) {
           const newLog: BorrowRecord = {
              id: `LOG-${Date.now()}`,
              assetId: newAsset.id,
              assetName: newAsset.name,
              serialNumber: newAsset.serialNumber,
              assetImage: newAsset.image,
              borrowerName: newAsset.borrowerName || 'Unknown',
              borrowDate: newAsset.borrowDate || new Date().toISOString().split('T')[0],
              status: 'BORROWED'
            };
            updatedLogs.push(newLog);
        }
      }

      // 2. Perform Database Operations
      await db.saveAsset(newAsset);
      await db.updateHistoryLogs(updatedLogs);

      // 3. Update Local State (Optimistic or Refetch)
      // Here we refetch specifically or just update local state to match logic above
      const updatedAssets = await db.getAssets(); 
      const finalLogs = await db.getHistory();

      setAssets(updatedAssets);
      setHistoryLogs(finalLogs);

      showNotification(editingAsset ? t('updateSuccess') : t('createSuccess'));
      setEditingAsset(null);

      // Trigger Auto-Sync to Cloud if enabled
      if (autoSyncEnabled) {
        syncToGoogleSheets(updatedAssets, finalLogs).catch(err => console.error("Auto-Push Failed", err));
      }

    } catch (error) {
      console.error(error);
      showNotification(t('error'), 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await db.deleteAsset(deleteId);
        const newAssets = assets.filter(a => a.id !== deleteId);
        setAssets(newAssets);
        showNotification(t('deleteSuccess'));
        
        // Trigger Auto-Sync to Cloud if enabled
        if (autoSyncEnabled) {
          syncToGoogleSheets(newAssets, historyLogs).catch(err => console.error("Auto-Push Failed", err));
        }

      } catch (error) {
        showNotification(t('error'), 'error');
      } finally {
        setDeleteId(null);
      }
    }
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setEditingAsset(null);
    setIsFormOpen(true);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  // --- GOOGLE SHEET SYNC ---
  const handleSaveToCloud = async () => {
    if (!getSheetUrl()) {
      setIsSettingsOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      await syncToGoogleSheets(assets, historyLogs);
      showNotification(t('syncSuccess'));
    } catch (e) {
      showNotification(t('syncError'), 'error');
    } finally {
      setIsSyncing(false);
      setShowSyncOptions(false);
    }
  };

  const handleLoadFromCloud = async (silent = false) => {
    if (!getSheetUrl()) {
      if (!silent) setIsSettingsOpen(true);
      return;
    }
    if (!silent) setIsSyncing(true);
    try {
      const data = await loadFromGoogleSheets();
      // Update DB
      await db.restoreBackup(data);
      // Reload UI
      setAssets(data.assets);
      setHistoryLogs(data.history);
      if (!silent) showNotification(t('importSuccess'));
    } catch (e) {
      if (!silent) showNotification(t('syncError'), 'error');
    } finally {
      if (!silent) setIsSyncing(false);
      setShowSyncOptions(false);
    }
  };

  // --- EXPORT / IMPORT LOGIC ---
  const handleExportBackup = async () => {
    try {
      const data = await db.getBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `it-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      showNotification(t('error'), 'error');
    }
  };

  // Generic CSV Export function that supports Thai characters
  const exportToCSV = (headers: string[], rows: (string | number)[], filename: string) => {
    const csvContent = "\uFEFF" + [
      headers.join(','), 
      ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAssetsCSV = () => {
    const headers = ['ID', 'Name', 'Serial Number', 'Category', 'Location', 'Status', 'Condition', 'Is Vendor Loan', 'Vendor Name', 'Borrower', 'Return Due Date', 'Purchase Date', 'Warranty End Date', 'Notes'];
    const rows = assets.map(a => [
      a.id,
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.serialNumber.replace(/"/g, '""')}"`,
      a.category,
      a.location,
      a.status,
      a.condition,
      a.isVendorLoan ? 'Yes' : 'No',
      `"${(a.vendorName || '').replace(/"/g, '""')}"`,
      `"${(a.borrowerName || '').replace(/"/g, '""')}"`,
      a.returnDueDate || '',
      a.purchaseDate || '',
      a.warrantyEndDate || '',
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ].join(','));
    
    exportToCSV(headers, rows, `it-assets-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportHistoryCSV = () => {
    const headers = ['Log ID', 'Asset ID', 'Asset Name', 'Serial Number', 'Borrower', 'Borrow Date', 'Return Date', 'Status'];
    const rows = historyLogs.map(h => [
      h.id,
      h.assetId,
      `"${h.assetName.replace(/"/g, '""')}"`,
      `"${(h.serialNumber || '').replace(/"/g, '""')}"`,
      `"${h.borrowerName.replace(/"/g, '""')}"`,
      h.borrowDate,
      h.returnDate || '',
      h.status
    ].join(','));

    exportToCSV(headers, rows, `it-history-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        await db.restoreBackup(data);
        
        // Refresh State directly instead of Reloading Page
        const [newAssets, newHistory] = await Promise.all([db.getAssets(), db.getHistory()]);
        setAssets(newAssets);
        setHistoryLogs(newHistory);
        handleConfigUpdate(); // Restore AutoSync settings if they were in the backup
        
        showNotification(t('importSuccess'));

      } catch (error) {
        console.error("Import failed:", error);
        showNotification(t('importError'), 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = ''; 
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: typeof currentTab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentTab(tab);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        currentTab === tab 
          ? 'text-white shadow-lg shadow-indigo-900/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {currentTab === tab && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-100" />
      )}
      <Icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${currentTab === tab ? 'text-white' : ''}`} />
      <span className="font-medium tracking-wide relative z-10">{label}</span>
      {currentTab === tab && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full blur-sm" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-72 bg-slate-900 text-white flex-shrink-0 z-30 
        transition-transform duration-300 ease-out shadow-2xl flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
              IT
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">Tracker Pro</h1>
              <span className="text-xs text-slate-400 font-medium">Asset Management</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('menu')}</div>
          <NavButton tab="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
          <NavButton tab="inventory" icon={List} label={t('inventory')} />
          <NavButton tab="history" icon={History} label={t('history')} />
          
          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('tools')}</div>
          <NavButton tab="ai" icon={MessageSquare} label={t('aiAssistant')} />
          
          <div className="mt-8 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dataManagement')}</div>
          
          {/* Google Sync */}
           <div className="relative mb-2">
             <button 
               onClick={() => setShowSyncOptions(!showSyncOptions)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm group ${
                 autoSyncEnabled 
                   ? 'bg-blue-900/40 text-blue-300 ring-1 ring-blue-500/50 hover:bg-blue-900/60' 
                   : 'text-slate-400 hover:bg-slate-800/50 hover:text-emerald-400'
               }`}
             >
                {autoSyncEnabled ? (
                   <RefreshCw className="w-4 h-4 animate-spin text-blue-400" style={{ animationDuration: '3s' }} />
                ) : (
                   <Cloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{autoSyncEnabled ? t('autoSyncActive') : t('syncSheet')}</span>
             </button>
             {showSyncOptions && (
               <div className="mx-4 mt-1 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 animate-slideDown">
                  <button onClick={handleSaveToCloud} disabled={isSyncing} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-300 hover:bg-slate-700 hover:text-emerald-300 border-b border-slate-700/50">
                    {isSyncing ? <Loader2 className="w-3 h-3 animate-spin"/> : <CloudUpload className="w-3 h-3"/>} {t('saveToCloud')}
                  </button>
                  <button onClick={() => handleLoadFromCloud(false)} disabled={isSyncing} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-300 hover:bg-slate-700 hover:text-emerald-300">
                    {isSyncing ? <Loader2 className="w-3 h-3 animate-spin"/> : <CloudDownload className="w-3 h-3"/>} {t('loadFromCloud')}
                  </button>
               </div>
             )}
           </div>

          {/* CSV Exports */}
          <button onClick={handleExportAssetsCSV} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-emerald-400 transition-all text-sm group">
             <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span>{t('exportAssetsCSV')}</span>
          </button>

          <button onClick={handleExportHistoryCSV} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-emerald-400 transition-all text-sm group">
             <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span>{t('exportHistoryCSV')}</span>
          </button>

          <div className="my-2 border-t border-slate-700/50"></div>

          <button onClick={handleExportBackup} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-blue-400 transition-all text-sm group">
             <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span>{t('exportData')}</span>
          </button>
          
          <button onClick={handleImportClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-amber-400 transition-all text-sm group">
             <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
             <span>{t('importData')}</span>
          </button>
          
          {/* Hidden File Input for Import */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,.xlsx" 
            className="hidden" 
          />
        </nav>

        <div className="p-4 flex gap-2">
            <button 
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-xs font-semibold text-slate-300"
            >
              <Languages className="w-4 h-4" />
              {language === 'th' ? 'EN' : 'TH'}
            </button>
            <button 
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-slate-300"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 mt-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-sm font-medium text-slate-300">{t('systemStatus')}</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
            <div className="bg-emerald-500 h-1.5 rounded-full w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{t('online')}</span>
            <span>v2.3.2</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-auto min-w-0 transition-all duration-300 flex flex-col h-screen overflow-hidden relative">
        
        {/* Loading Overlay */}
        {isDataLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading Database...</p>
          </div>
        )}

        {/* Syncing Overlay (Only show if manual sync) */}
        {isSyncing && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex flex-col items-center justify-center text-white">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 flex flex-col items-center">
               <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
               <p className="font-bold text-lg">Syncing with Google Sheets...</p>
               <p className="text-sm text-slate-300">Please wait</p>
            </div>
          </div>
        )}

        {/* Sticky Header */}
        <header className="flex-shrink-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0 w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
              {currentTab === 'dashboard' && t('dashboardTitle')}
              {currentTab === 'inventory' && t('inventoryTitle')}
              {currentTab === 'history' && t('historyTitle')}
              {currentTab === 'ai' && t('aiTitle')}
            </h2>
            {autoSyncEnabled && (
               <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold animate-fadeIn">
                 <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                 Auto Sync On
               </div>
            )}
          </div>
          
          <button
            onClick={openCreateModal}
            className="group relative inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur"></div>
            <span className="relative flex items-center gap-2 font-medium">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t('addNew')}</span>
            </span>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fadeIn">
            {currentTab === 'dashboard' && (
              <>
                <DashboardStats assets={assets} />
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                      Recent Assets
                    </h3>
                    <button onClick={() => setCurrentTab('inventory')} className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 hover:underline decoration-2 underline-offset-4 transition-all">
                      View All Assets
                    </button>
                  </div>
                  <AssetList 
                    assets={assets.slice(0, 5)} 
                    onEdit={openEditModal} 
                    onDelete={handleDeleteClick} 
                  />
                </div>
              </>
            )}

            {currentTab === 'inventory' && (
              <AssetList 
                assets={assets} 
                onEdit={openEditModal} 
                onDelete={handleDeleteClick} 
              />
            )}

            {currentTab === 'history' && (
               <HistoryLog logs={historyLogs} />
            )}

            {currentTab === 'ai' && (
              <div className="max-w-4xl mx-auto h-[calc(100vh-180px)]">
                <AIChat assets={assets} history={historyLogs} />
              </div>
            )}
          </div>
        </div>
      </main>

      <AssetForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleAddAsset}
        initialData={editingAsset}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onConfigUpdate={handleConfigUpdate}
      />

      {/* Modern Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all scale-100 ring-1 ring-black/5">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-inner">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('confirmDelete')}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    {t('deleteWarning')}
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="flex-1 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5"
                    >
                        {t('deleteAsset')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default App;
