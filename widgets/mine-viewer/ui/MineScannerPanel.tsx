
import React from 'react';
import { ChevronDown, Play, Loader2, AlertCircle, RotateCcw, Target } from 'lucide-react';
import { MINES_DICT, MineInfo } from '../../../entities/mine/model/types.ts';

interface MineScannerPanelProps {
  selectedMine: MineInfo;
  setSelectedMine: (m: MineInfo) => void;
  selectedFloors: number[];
  onToggleFloor: (f: number) => void;
  onReset: () => void;
  onScan: () => void;
  isLoading: boolean;
  error: string | null;
}

export const MineScannerPanel: React.FC<MineScannerPanelProps> = ({ 
  selectedMine, setSelectedMine, selectedFloors, onToggleFloor, onReset, onScan, isLoading, error 
}) => {
  return (
    <section className="bg-[#0a0d12] border border-slate-800/40 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
      {/* Декоративная сетка на фоне */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 relative z-10">
        {/* Выбор шахты */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3 w-3 text-blue-500 animate-pulse" />
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Локация сканирования </label>
          </div>
          <div className="relative">
            <select
              value={selectedMine.id}
              onChange={(e: any) => {
                const val = parseInt(e.target.value);
                const found = (MINES_DICT ).find((m) => m.id === val);

                setSelectedMine(found || MINES_DICT[0]);
              }}
              className="w-full bg-[#11161d] border border-slate-800 rounded-xl px-4 py-2.5 text-white font-unbounded text-[11px] appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all cursor-pointer shadow-inner"
            >
              {(MINES_DICT).map((mine) => (
                <option key={mine.id} value={mine.id}>{mine.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
          </div>
        </div>

        {/* Сетка этажей */}
        <div className="flex-[2] space-y-2">
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Активные уровни: <span className="text-blue-500 font-unbounded ml-1">{(selectedFloors as any).length}</span>
            </span>
            {isLoading && <span className="text-[8px] font-bold text-blue-400 animate-pulse">Инициализация сенсоров...</span>}
          </div>
          <div className="bg-[#06090f] p-2 rounded-xl border border-slate-800/30 grid grid-cols-10 sm:grid-cols-20 gap-1 shadow-inner">
            {((Array as any).from({ length: selectedMine.maxLevel || 40 }) as any).map((_: any, i: number) => {
              const floor = i + 1;
              const isSelected = (selectedFloors as any).indexOf(floor) !== -1;
              return (
                <button 
                  key={floor} 
                  onClick={() => onToggleFloor(floor)} 
                  className={`h-6 w-full flex items-center justify-center rounded-md text-[9px] font-black transition-all border ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)] scale-105 z-10' 
                      : 'bg-[#0d1117] border-slate-800/50 text-slate-700 hover:border-slate-600 hover:text-slate-400'
                  }`}
                >
                  {floor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Действия */}
        <div className="flex items-center gap-2 self-end">
          <button 
            onClick={onReset} 
            className="p-3 bg-[#11161d] hover:bg-[#1c2128] text-slate-500 hover:text-slate-300 rounded-xl transition-all border border-slate-800 active:scale-90"
            title="Сброс терминала"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button 
            onClick={onScan} 
            disabled={isLoading} 
            className={`px-8 py-3 rounded-xl font-unbounded text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 relative overflow-hidden shadow-2xl active:scale-95 disabled:opacity-50 ${
              isLoading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/20'
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />}
            <span>Запуск</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3 text-red-400 text-[9px] font-black uppercase tracking-widest animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}
    </section>
  );
};
