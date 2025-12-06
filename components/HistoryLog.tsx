
import React, { useState } from 'react';
import { BorrowRecord } from '../types';
import { History, Search, ArrowDownLeft, ArrowUpRight, Calendar, User, Package, Hash } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryLogProps {
  logs: BorrowRecord[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ logs }) => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Sort by date descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
  );

  const filteredLogs = sortedLogs.filter(log => 
    log.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.serialNumber && log.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
             <History className="w-5 h-5" />
           </div>
           {t('historyTitle')}
        </h2>
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder={t('searchHistory')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-50 border-none ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm shadow-sm z-10">
            <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="p-5 pl-6 border-b border-slate-200/60">{t('activity')}</th>
              <th className="p-5 border-b border-slate-200/60">{t('assetDetails')}</th>
              <th className="p-5 border-b border-slate-200/60">{t('borrower')}</th>
              <th className="p-5 border-b border-slate-200/60">{t('borrowedDate')}</th>
              <th className="p-5 border-b border-slate-200/60">{t('returnedDate')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <History className="w-8 h-8 text-slate-300" />
                     </div>
                     <span className="font-medium">{t('noHistory')}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 pl-6">
                    {log.status === 'BORROWED' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 ring-1 ring-amber-600/10">
                        <ArrowUpRight className="w-3.5 h-3.5" /> {t('statusBorrowed')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/10">
                        <ArrowDownLeft className="w-3.5 h-3.5" /> {t('statusReturned')}
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-slate-400" /> {log.assetName}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                          ID: {log.assetId}
                        </span>
                        {log.serialNumber && (
                           <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1 font-mono">
                             <Hash className="w-3 h-3 text-slate-400" /> {log.serialNumber}
                           </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm bg-slate-50 px-3 py-1.5 rounded-lg w-fit group-hover:bg-white group-hover:shadow-sm transition-all">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                      {log.borrowerName}
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(log.borrowDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { year: '2-digit', month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 text-sm">
                    {log.returnDate ? (
                       <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.returnDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { year: '2-digit', month: 'short', day: 'numeric' })}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic pl-2">{t('pending')}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryLog;
