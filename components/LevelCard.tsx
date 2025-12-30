
import React from 'react';

interface LevelCardProps {
  level: number;
  mineName: string;
  isCollapsed: boolean;
  onToggle: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

export const LevelCard: React.FC<LevelCardProps> = ({ 
  level, mineName, isCollapsed, onToggle, onRemove, children 
}) => (
  <div className={`bg-gray-900/40 rounded-[3rem] border border-gray-800/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-700 ${isCollapsed ? 'p-5' : 'p-10'}`}>
    <div className="absolute -top-10 -right-10 text-[15rem] font-black text-white/5 pointer-events-none select-none italic leading-none">{level}</div>

    <div className={`flex items-center justify-between relative z-10 ${isCollapsed ? 'mb-0' : 'mb-12'}`}>
      <div className="flex items-center space-x-6">
        <div className={`transition-all duration-700 ${isCollapsed ? 'w-12 h-12 rounded-2xl' : 'w-20 h-20 rounded-[2rem]'} bg-indigo-600 flex items-center justify-center border-2 border-indigo-400 shadow-[0_15px_30px_rgba(79,70,229,0.5)]`}>
          <span className={`${isCollapsed ? 'text-xl' : 'text-4xl'} font-black italic text-white`}>{level}</span>
        </div>
        <div>
          <h2 className={`${isCollapsed ? 'text-xl' : 'text-3xl'} font-black text-white uppercase tracking-tight`}>{mineName}</h2>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggle}
          className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-xl active:scale-95 ${isCollapsed ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}
        >
          {isCollapsed ? 'Развернуть' : 'Свернуть'}
        </button>
        <button 
          onClick={onRemove}
          className="w-12 h-12 flex items-center justify-center bg-rose-500/5 hover:bg-rose-500/20 text-gray-700 hover:text-rose-500 rounded-2xl transition-all border border-transparent hover:border-rose-500/30 group/close"
        >
          <span className="text-2xl font-light group-hover/close:rotate-90 transition-transform">✕</span>
        </button>
      </div>
    </div>

    <div className={`transition-all duration-1000 origin-top relative z-10 ${isCollapsed ? 'h-0 opacity-0 scale-y-0 overflow-hidden' : 'h-auto opacity-100 scale-y-100 mt-8'}`}>
      {children}
    </div>
  </div>
);
