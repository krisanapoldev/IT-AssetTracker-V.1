
import React from 'react';
import { Asset, AssetStatus, AssetCondition } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Box, Wrench, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getStatusDisplay } from '../services/translations';

interface DashboardStatsProps {
  assets: Asset[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#EF4444', '#4B5563'];

const DashboardStats: React.FC<DashboardStatsProps> = ({ assets }) => {
  const { t, language } = useLanguage();
  
  // Prepare Status Data
  const statusCounts = Object.values(AssetStatus).map(status => ({
    name: getStatusDisplay(status, language),
    value: assets.filter(a => a.status === status).length
  })).filter(item => item.value > 0);

  // Prepare Location Data
  const locationCounts = assets.reduce((acc: any, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + 1;
    return acc;
  }, {});
  const locationData = Object.keys(locationCounts).map(key => ({
    name: key.length > 8 ? key.substring(0, 8) + '..' : key,
    fullName: key,
    value: locationCounts[key]
  }));

  const totalAssets = assets.length;
  const damagedCount = assets.filter(a => a.condition === AssetCondition.DAMAGED || a.status === AssetStatus.BROKEN).length;
  const vendorLoanCount = assets.filter(a => a.isVendorLoan).length;
  const availableCount = assets.filter(a => a.status === AssetStatus.AVAILABLE).length;

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
               <TrendingUp className="w-3 h-3" /> +{trend} {t('thisMonth')}
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bgClass} ${colorClass}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* KPI Cards */}
      <StatCard 
        title={t('totalAssets')} 
        value={totalAssets} 
        icon={Box} 
        colorClass="text-blue-600" 
        bgClass="bg-blue-50"
      />

      <StatCard 
        title={t('available')} 
        value={availableCount} 
        icon={CheckCircle} 
        colorClass="text-emerald-600" 
        bgClass="bg-emerald-50"
      />

      <StatCard 
        title={t('damagedRepair')} 
        value={damagedCount} 
        icon={Wrench} 
        colorClass="text-rose-600" 
        bgClass="bg-rose-50"
      />

      <StatCard 
        title={t('vendorLoans')} 
        value={vendorLoanCount} 
        icon={AlertTriangle} 
        colorClass="text-indigo-600" 
        bgClass="bg-indigo-50"
      />

      {/* Charts */}
      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-100 h-96 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-bold text-slate-800">{t('statusDist')}</h3>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {statusCounts.map((entry, index) => (
            <div key={entry.name} className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md">
              <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name} <span className="ml-1 text-slate-400">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-100 h-96 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{t('locationDist')}</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748B'}} dy={10} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#64748B'}} allowDecimals={false} />
              <Tooltip 
                 cursor={{fill: '#F1F5F9'}} 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
