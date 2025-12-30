
import React, { useState, useEffect, useRef } from 'react';
import { MINES_DICT, DEFAULT_MAX_LEVEL } from '../constants';

interface ControlsProps {
  selectedMine: number;
  selectedLevels: number[];
  onMineChange: (id: number) => void;
  onLevelsChange: (levels: number[]) => void;
  onFetch: () => void;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedMine,
  selectedLevels,
  onMineChange,
  onLevelsChange,
  onFetch,
  isLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Находим информацию о текущей шахте для получения её макс. уровня
  const currentMineInfo = MINES_DICT.find(m => m.id === selectedMine);
  const maxLevel = currentMineInfo?.maxLevel || DEFAULT_MAX_LEVEL;

  // Глобальный обработчик завершения перетаскивания
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleLevelInteraction = (lvl: number, isStart: boolean = false) => {
    const isCurrentlySelected = selectedLevels.includes(lvl);
    
    if (isStart) {
      setIsDragging(true);
      const newMode = isCurrentlySelected ? 'deselect' : 'select';
      setDragMode(newMode);
      
      // Немедленное действие при первом клике
      if (newMode === 'select') {
        onLevelsChange([...selectedLevels, lvl].sort((a, b) => a - b));
      } else {
        onLevelsChange(selectedLevels.filter(l => l !== lvl));
      }
    } else if (isDragging && dragMode) {
      // Действие при перетаскивании (только если кнопка мыши зажата)
      if (dragMode === 'select' && !isCurrentlySelected) {
        onLevelsChange([...selectedLevels, lvl].sort((a, b) => a - b));
      } else if (dragMode === 'deselect' && isCurrentlySelected) {
        onLevelsChange(selectedLevels.filter(l => l !== lvl));
      }
    }
  };

  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800/80 p-6 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-8 select-none ring-1 ring-white/5">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
        {/* Выбор шахты */}
        <div className="w-full md:w-80">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 block px-1">Объект сканирования</label>
          <div className="relative group">
            <select 
              value={selectedMine}
              onChange={(e) => onMineChange(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer hover:border-indigo-500/50 appearance-none font-bold text-lg shadow-inner"
            >
              {MINES_DICT.map(mine => (
                <option key={mine.id} value={mine.id}>{mine.name}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 transition-transform group-hover:translate-y-[-40%]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => onLevelsChange([])}
            className="flex-1 md:flex-none px-6 py-4 text-[11px] font-black uppercase tracking-widest bg-slate-800/50 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 rounded-2xl transition-all duration-300"
          >
            Сброс
          </button>
          <button 
            onClick={onFetch}
            disabled={isLoading || selectedLevels.length === 0}
            className={`flex-1 md:flex-none px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-500 shadow-2xl flex items-center justify-center space-x-3 group relative overflow-hidden
              ${isLoading || selectedLevels.length === 0
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700 opacity-50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 ring-2 ring-indigo-400/30 shadow-indigo-500/20'
              }`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span className="relative z-10">{isLoading ? 'Идет поиск...' : 'Запустить сканер'}</span>
            {!isLoading && selectedLevels.length > 0 && (
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></span>
            )}
          </button>
        </div>
      </div>

      {/* Сетка выбора этажей */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center">
            Этажи для анализа ({currentMineInfo?.name})
            <span className={`ml-4 px-2 py-0.5 rounded-full text-[10px] transition-all ${selectedLevels.length > 0 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              {selectedLevels.length} выбрано
            </span>
          </label>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline-block">
            Кликните и ведите для массового выбора
          </span>
        </div>
        
        <div 
          ref={gridRef}
          className="grid grid-cols-5 xs:grid-cols-8 sm:grid-cols-10 md:grid-cols-20 gap-2 p-4 bg-slate-950/80 rounded-[2rem] border border-slate-800/80 shadow-inner group/grid"
        >
          {levels.map(lvl => {
            const isSelected = selectedLevels.includes(lvl);
            return (
              <button
                key={lvl}
                onMouseDown={(e) => {
                  e.preventDefault(); // Предотвращаем выделение текста при драге
                  handleLevelInteraction(lvl, true);
                }}
                onMouseEnter={() => handleLevelInteraction(lvl, false)}
                className={`group relative h-10 w-full rounded-xl text-[11px] font-black transition-all duration-300 border overflow-hidden
                  ${isSelected 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-[1.08] z-10 ring-2 ring-white/10' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:scale-[1.05] hover:bg-slate-800/80'}`}
              >
                {!isSelected && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
                )}
                
                {isSelected && (
                  <div className="absolute inset-0 bg-white/20 animate-ping opacity-10 rounded-xl"></div>
                )}
                
                <span className="relative z-10">{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
