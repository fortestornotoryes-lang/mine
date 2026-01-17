
import React from 'react';

interface MapToolbarProps {
  onCopyBest: () => void;
  onCopyReport: () => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  feedback: string | null;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({ onCopyBest, onCopyReport, isOpen, setIsOpen, feedback }) => (
  <div className="absolute top-0 left-0 -mt-3 -ml-3 z-[60] flex items-center space-x-3">
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl border-2 border-indigo-400 transition-all active:scale-90"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-14 left-0 w-72 bg-slate-950 border border-slate-700 rounded-3xl shadow-2xl py-5 animate-in fade-in zoom-in-95 origin-top-left z-[70] ring-1 ring-white/10">
          <div className="px-6 py-1 text-[9px] font-black uppercase text-indigo-400 tracking-[0.3em] border-b border-slate-800 mb-3">Экспорт данных</div>
          <button onClick={onCopyBest} className="w-full text-left px-7 py-3.5 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-all flex items-center group">
            <span className="mr-4 group-hover:scale-125 transition-transform">💎</span> Только ТОП-точки
          </button>
          <button onClick={onCopyReport} className="w-full text-left px-7 py-3.5 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-all flex items-center group">
            <span className="mr-4 group-hover:scale-125 transition-transform">📋</span> Текстовый отчет
          </button>
        </div>
      )}
    </div>

    {feedback && (
      <div className="bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 shadow-2xl ring-2 ring-white/20">
        {feedback}
      </div>
    )}
  </div>
);
