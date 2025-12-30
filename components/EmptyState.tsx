
import React from 'react';

export const EmptyState: React.FC = () => (
  <div className="py-32 text-center border-4 border-dotted border-gray-800/50 rounded-[4rem] bg-gray-900/5 group">
    <div className="text-8xl mb-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">🧭</div>
    <h3 className="text-2xl font-black text-gray-700 uppercase tracking-[0.3em]">Ожидание данных</h3>
    <p className="text-[10px] text-gray-800 mt-4 font-black uppercase tracking-widest">Выберите шахту и этажи в панели управления</p>
  </div>
);
