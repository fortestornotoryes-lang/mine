
import React from 'react';
import { GridCell } from '../types';

type FilterCategory = 'r0_9' | 'r10_24' | 'r25_49' | 'r50_74' | 'r75_100' | 'error' | null;

interface MapLegendProps {
  activeFilter: FilterCategory;
  onToggleFilter: (cat: FilterCategory) => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({ activeFilter, onToggleFilter }) => {
  const categories = [
    { id: 'r0_9', color: 'bg-emerald-400', label: '0-9% (Жила)', border: 'border-emerald-300' },
    { id: 'r10_24', color: 'bg-yellow-400', label: '10-24%', border: 'border-yellow-300' },
    { id: 'r25_49', color: 'bg-orange-500', label: '25-49%', border: 'border-orange-400' },
    { id: 'r50_74', color: 'bg-red-600', label: '50-74%', border: 'border-red-500' },
    { id: 'r75_100', color: 'bg-slate-800', label: '75%+ (Пусто)', border: 'border-slate-700' },
    { id: 'error', color: 'bg-fuchsia-600', label: 'Ошибка', border: 'border-fuchsia-400', animate: true }
  ];

  return (
    <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-1">
      {categories.map((item) => (
        <button 
          key={item.id}
          onClick={() => onToggleFilter(item.id as FilterCategory)}
          className={`group flex items-center space-x-3 p-4 rounded-2xl border transition-all ${
            activeFilter === item.id 
              ? 'bg-white/10 border-white shadow-2xl scale-105' 
              : 'bg-slate-900/40 border-slate-800 hover:bg-white/5'
          }`}
        >
          <div className={`w-4 h-4 rounded-lg ${item.color} border ${item.border} ${item.animate ? 'animate-pulse' : ''}`}></div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === item.id ? 'text-white' : 'text-slate-500'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};
