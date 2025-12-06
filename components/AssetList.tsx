
import React, { useState } from 'react';
import { Asset, AssetStatus, AssetCondition } from '../types';
import { Edit, Trash2, MapPin, User, Package, CalendarClock, Tag, ChevronDown, Calendar, ShieldCheck, FileText, AlertCircle, Search, Filter, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getStatusDisplay, getConditionDisplay } from '../services/translations';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetList: React.FC<AssetListProps> = ({ assets, onEdit, onDelete }) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCondition, setFilterCondition] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    const matchesCondition = filterCondition === 'All' || asset.condition === filterCondition;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getStatusStyle = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20';
      case AssetStatus.IN_USE: return 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20';
      case AssetStatus.BORROWED: return 'bg-violet-100 text-violet-700 ring-1 ring-violet-600/20';
      case AssetStatus.REPAIR: return 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20';
      case AssetStatus.BROKEN: return 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20';
      case AssetStatus.LOST: return 'bg-slate-800 text-slate-200 ring-1 ring-slate-600/50';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const returnDate = new Date(dateString);
    return returnDate < today;
  };

  const isWarrantyExpired = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const warrantyDate = new Date(dateString);
    return warrantyDate < today;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
             <Package className="w-5 h-5" />
          </div>
          {t('inventoryTitle')} <span className="text-slate-400 font-normal text-sm ml-1">({filteredAssets.length})</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full sm:w-64 transition-all"
            />
          </div>
          <div className="relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="All">{t('allStatus')}</option>
              {Object.values(AssetStatus).map(status => (
                <option key={status} value={status}>{getStatusDisplay(status, language)}</option>
              ))}
            </select>
          </div>
          <div className="relative">
             <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none cursor-pointer transition-all"
            >
              <option value="All">{t('allConditions')}</option>
              {Object.values(AssetCondition).map(condition => (
                <option key={condition} value={condition}>{getConditionDisplay(condition, language)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
              <th className="p-5 pl-6">{t('assetColumn')}</th>
              <th className="p-5">{t('statusCondition')}</th>
              <th className="p-5">{t('location')}</th>
              <th className="p-5">{t('holder')}</th>
              <th className="p-5 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <span className="font-medium">{t('noAssets')}</span>
                    <span className="text-xs text-slate-400">{t('tryAdjust')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const overdue = asset.status === AssetStatus.BORROWED && isOverdue(asset.returnDueDate);
                const isExpanded = expandedId === asset.id;
                const warrantyExpired = isWarrantyExpired(asset.warrantyEndDate);
                
                return (
                  <React.Fragment key={asset.id}>
                    <tr 
                      className={`group transition-all cursor-pointer ${isExpanded ? 'bg-slate-50/80' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleExpand(asset.id)}
                    >
                      <td className="p-5 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden relative ring-1 ring-slate-200 group-hover:ring-indigo-200 transition-all shadow-sm group-hover:shadow-md group-hover:scale-105">
                            <img src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">{asset.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                               <HashIcon /> {asset.serialNumber}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                {asset.category}
                              </span>
                              {asset.isVendorLoan && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-bold flex items-center gap-1">
                                  <Tag className="w-2.5 h-2.5" /> {t('vendorLoanTag')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2 items-start">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusStyle(asset.status)}`}>
                            {getStatusDisplay(asset.status, language)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 ml-1">
                            {t('condition')}: 
                            <span className={`font-semibold ${
                              asset.condition === AssetCondition.DAMAGED || asset.condition === AssetCondition.POOR 
                              ? 'text-rose-500' 
                              : 'text-emerald-600'
                            }`}>{getConditionDisplay(asset.condition, language)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-slate-600">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-transparent group-hover:bg-white group-hover:shadow-sm w-fit transition-all">
                          <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                          <span className="font-medium">{asset.location}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-slate-600">
                        {asset.borrowerName ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-indigo-700 font-semibold bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                              <User className="w-3.5 h-3.5" /> {asset.borrowerName}
                            </div>
                            {asset.returnDueDate && (
                              <div className={`flex items-center gap-1.5 text-xs ml-1 mt-0.5 ${overdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                <CalendarClock className="w-3.5 h-3.5" /> 
                                {overdue ? t('overdue') : t('due')} {new Date(asset.returnDueDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
                              </div>
                            )}
                          </div>
                        ) : asset.isVendorLoan ? (
                          <div className="flex flex-col">
                            <div className="text-indigo-900 font-semibold">{asset.vendorName}</div>
                            <span className="text-[10px] text-indigo-400 font-medium tracking-wide">OWNER</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic pl-2">{t('emptyHolder')}</span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 mr-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                title={t('editAsset')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                title={t('deleteAsset')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                          <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'text-slate-300 group-hover:text-slate-500'}`}>
                             <ChevronDown className="w-5 h-5"/>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Collapsible Detail Section */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0 border-b border-slate-100">
                          <div className="bg-slate-50/50 p-4 sm:p-6 overflow-hidden animate-slideDown">
                            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                              
                              {/* Column 1: Dates & Warranty */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                  <Calendar className="w-4 h-4" /> {t('datesWarranty')}
                                </h4>
                                <div className="space-y-3 text-sm">
                                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                     <span className="text-slate-500">{t('purchaseDate')}</span>
                                     <span className="font-semibold text-slate-900">
                                       {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'long' }) : '-'}
                                     </span>
                                   </div>
                                   <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                     <span className="text-slate-500">{t('warrantyEnds')}</span>
                                     <span className={`font-semibold ${warrantyExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                       {asset.warrantyEndDate ? new Date(asset.warrantyEndDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'long' }) : '-'}
                                     </span>
                                   </div>
                                   {asset.warrantyEndDate && (
                                     <div className={`text-xs p-2 rounded-lg flex items-center justify-center gap-2 font-medium ${warrantyExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                       {warrantyExpired ? <AlertCircle className="w-3.5 h-3.5"/> : <ShieldCheck className="w-3.5 h-3.5"/>}
                                       {warrantyExpired ? t('warrantyExpired') : t('activeWarranty')}
                                     </div>
                                   )}
                                </div>
                              </div>

                              {/* Column 2: Detailed Ownership Info */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                  <User className="w-4 h-4" /> {t('custodyDetails')}
                                </h4>
                                <div className="space-y-3 text-sm">
                                  {asset.borrowerName ? (
                                    <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                                      <div className="flex justify-between mb-2">
                                        <span className="text-slate-500 text-xs">{t('currentUser')}</span>
                                        <span className="font-bold text-indigo-700">{asset.borrowerName}</span>
                                      </div>
                                      <div className="flex justify-between mb-2">
                                        <span className="text-slate-500 text-xs">{t('borrowedOn')}</span>
                                        <span className="font-medium">
                                          {asset.borrowDate ? new Date(asset.borrowDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB') : '-'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t border-indigo-100">
                                        <span className="text-slate-500 text-xs">{t('returnDue')}</span>
                                        <span className={`font-medium ${overdue ? 'text-rose-600 font-bold' : ''}`}>
                                          {asset.returnDueDate ? new Date(asset.returnDueDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB') : '-'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : asset.isVendorLoan ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wide">{t('vendorInfo')}</div>
                                      <div className="font-bold text-slate-800 text-lg">{asset.vendorName}</div>
                                      <p className="text-xs text-slate-400 mt-1">{t('propertyOfVendor')}</p>
                                    </div>
                                  ) : (
                                    <div className="text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                      {t('inStorage')}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Column 3: Notes & Actions */}
                              <div className="space-y-4 flex flex-col h-full">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                                  <FileText className="w-4 h-4" /> {t('notes')}
                                </h4>
                                <div className="bg-yellow-50/50 rounded-xl p-4 text-sm text-slate-600 flex-1 border border-yellow-100 relative">
                                  <div className="absolute top-0 right-0 p-2 opacity-10">
                                      <FileText className="w-12 h-12" />
                                  </div>
                                  {asset.notes ? (
                                    <p className="relative z-10 leading-relaxed">{asset.notes}</p>
                                  ) : (
                                    <span className="text-slate-400 italic relative z-10">{t('noNotes')}</span>
                                  )}
                                </div>
                                <div className="flex justify-end gap-3 pt-2 sm:hidden">
                                   <button 
                                    onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                                    className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100"
                                   >
                                     {t('editAsset')}
                                   </button>
                                   <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                                    className="flex-1 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100"
                                   >
                                     {t('deleteAsset')}
                                   </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Tiny helper component
const HashIcon = () => (
  <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

export default AssetList;
