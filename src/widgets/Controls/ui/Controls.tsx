import React from 'react';
import { 
  Settings, Upload, Save, PlayCircle, AlertTriangle, 
  Footprints, MousePointerClick, MapPin, Box, LogOut, ArrowRight,
  ArrowUp, ArrowDown, Zap, BrainCircuit, Dna, Flame, Target, ListOrdered,
  ChevronDown, ChevronUp, Construction, Paintbrush
} from 'lucide-react';
import { Point } from '@/shared/types';
import { PathfinderSettings, PathResult, PathStep } from '@/entities/path/model/types';

interface ControlsProps {
  settings: PathfinderSettings;
  setSettings: React.Dispatch<React.SetStateAction<PathfinderSettings>>;
  isSettingsExpanded: boolean;
  setIsSettingsExpanded: (expanded: boolean) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDownload: () => void;
  pathResult: PathResult | null;
  currentStart: Point | null;
  onStepHover: (index: number | null) => void;
  onStepClick: (index: number) => void;
  isDrawMode: boolean;
  setIsDrawMode: (isDraw: boolean) => void;
}

const StepIcon = ({ action }: { action: PathStep['action'] }) => {
  const iconProps = { size: 14, className: "shrink-0" };
  switch (action) {
    case 'press': return <MousePointerClick {...iconProps} className="text-red-400" />;
    case 'explore': return <MapPin {...iconProps} className="text-purple-400" />;
    case 'loot': return <Box {...iconProps} className="text-yellow-400" />;
    case 'exit': return <LogOut {...iconProps} className="text-emerald-400" />;
    case 'move': return <Footprints {...iconProps} className="text-blue-400" />;
    default: return <Footprints {...iconProps} className="text-slate-500" />;
  }
};

const StepDescription = ({ action }: { action: PathStep['action'] }) => {
    switch(action) {
        case 'press': return <span className="text-red-300">Нажать кнопку</span>;
        case 'explore': return <span className="text-purple-300">Исследовать</span>;
        case 'loot': return <span className="text-yellow-300">Забрать сундук</span>;
        case 'exit': return <span className="text-emerald-300">Выйти</span>;
        case 'move': return <span className="text-blue-300">Идти</span>;
        default: return <span className="text-slate-300">{action}</span>;
    }
}

const AlgorithmButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode; colorClass: string;}> = 
({ active, onClick, label, icon, colorClass }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-2 px-1 rounded text-xs flex flex-col items-center gap-1.5 transition-all ${active ? `${colorClass} text-white shadow-lg` : 'bg-slate-800 hover:bg-slate-700/70 text-slate-300'}`}
    >
        {icon}
        <span className="text-[10px] font-bold text-center leading-none">{label}</span>
    </button>
);

export const Controls: React.FC<ControlsProps> = ({
  settings,
  setSettings,
  isSettingsExpanded,
  setIsSettingsExpanded,
  onFileUpload,
  onFileDownload,
  pathResult,
  currentStart,
  onStepHover,
  onStepClick,
  isDrawMode,
  setIsDrawMode,
}) => {
  const algorithmInfo = {
      'greedy': 'Быстро, но не всегда оптимально. Идет к ближайшей цели.',
      'optimal': 'Полный перебор (DP). Гарантирует идеальный путь. Медленно при >18 целях.',
      'genetic': 'Эволюционный подход. Хорош для больших карт. Быстрый и качественный.',
      'simulated_annealing': 'Метод отжига. Вероятностный поиск. Хорошо выходит из локальных ловушек.',
  };

  return (
    <div className="w-full bg-slate-800 p-4 sm:p-6 flex flex-col gap-6 h-full overflow-y-auto dungeon-scroll">

      {/* Файл и Редактирование */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <label className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex flex-col items-center justify-center gap-1.5 cursor-pointer group hover:bg-slate-700 transition-colors text-center">
            <Upload className="text-blue-400 group-hover:text-blue-300 transition-colors" size={20} />
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-none">Загрузить</span>
            <input type="file" accept=".json" onChange={onFileUpload} className="hidden" />
        </label>
        <button onClick={onFileDownload} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex flex-col items-center justify-center gap-1.5 group hover:bg-slate-700 transition-colors text-center">
            <Save className="text-emerald-400 group-hover:text-emerald-300 transition-colors" size={20} />
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wider leading-none">Сохранить</span>
        </button>
        <button onClick={() => setIsDrawMode(!isDrawMode)} className={`${isDrawMode ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300'} p-3 rounded-lg border ${isDrawMode ? 'border-blue-500' : 'border-slate-600'} flex flex-col items-center justify-center gap-1.5 group hover:bg-slate-700 transition-colors text-center`}>
            <Paintbrush className={isDrawMode ? '' : 'text-orange-400'} size={20} />
            <span className="text-[10px] font-bold group-hover:text-white uppercase tracking-wider leading-none">{isDrawMode ? 'Вкл' : 'Выкл'}</span>
        </button>
      </div>

      {/* Настройки */}
      <div className="space-y-4 shrink-0">
        <button 
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between group hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} /> Настройки пути
          </div>
          {isSettingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {isSettingsExpanded && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/70 transition">
                <input type="checkbox" checked={settings.avoidTraps} onChange={(e) => setSettings(prev => ({ ...prev, avoidTraps: e.target.checked }))} className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500 bg-slate-900 focus:ring-offset-slate-800" />
                <span className="text-xs text-slate-200">Без ловушек</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-700/40 rounded-lg cursor-pointer hover:bg-slate-700/70 transition">
                <input type="checkbox" checked={settings.avoidGuards} onChange={(e) => setSettings(prev => ({ ...prev, avoidGuards: e.target.checked }))} className="w-4 h-4 rounded border-slate-500 text-blue-500 bg-slate-900 focus:ring-blue-500 focus:ring-offset-slate-800" />
                <span className="text-xs text-slate-200">Без охраны</span>
                </label>
            </div>

            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                <label className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 mb-1.5">
                    <Construction size={12} /> Макс. отступ тупиков
                </label>
                <div className="flex items-center gap-2">
                    <input type="number" min="0" placeholder="Все" value={settings.maxDeadlockOffset ?? ''} onChange={(e) => setSettings(prev => ({ ...prev, maxDeadlockOffset: e.target.value === '' ? undefined : parseInt(e.target.value) }))} className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors" />
                    {settings.maxDeadlockOffset !== undefined && <button onClick={() => setSettings(prev => ({ ...prev, maxDeadlockOffset: undefined }))} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-1">Сброс</button>}
                </div>
            </div>
            
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                 <label className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 mb-1.5">
                     <ListOrdered size={12} /> Приоритет
                 </label>
                 <div className="grid grid-cols-3 gap-1">
                     <button onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'mixed' }))} className={`py-1.5 text-[10px] rounded transition-colors ${settings.objectivePriority === 'mixed' ? 'bg-slate-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Без приоритета</button>
                     <button onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'buttons_first' }))} className={`py-1.5 text-[10px] rounded transition-colors ${settings.objectivePriority === 'buttons_first' ? 'bg-red-900/80 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Сначала кнопки</button>
                     <button onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'deadlocks_first' }))} className={`py-1.5 text-[10px] rounded transition-colors ${settings.objectivePriority === 'deadlocks_first' ? 'bg-purple-900/80 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Сначала тупики</button>
                 </div>
            </div>

            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
                 <label className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 mb-1.5">
                     <Target size={12} /> Цель выхода
                 </label>
                 <div className="grid grid-cols-2 gap-1">
                     <button onClick={() => setSettings(prev => ({ ...prev, exitMode: 'stairs_up' }))} className={`px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1.5 ${settings.exitMode === 'stairs_up' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><ArrowUp size={12} /> Вверх</button>
                     <button onClick={() => setSettings(prev => ({ ...prev, exitMode: 'stairs_down' }))} className={`px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1.5 ${settings.exitMode === 'stairs_down' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}><ArrowDown size={12} /> Вниз</button>
                 </div>
            </div>

            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
               <label className="text-xs text-slate-400 mb-2 font-semibold uppercase flex items-center gap-1.5">
                 <BrainCircuit size={14} /> Алгоритм
               </label>
               <div className="grid grid-cols-2 gap-2">
                  <AlgorithmButton active={settings.algorithm === 'greedy'} onClick={() => setSettings(p => ({...p, algorithm: 'greedy'}))} label="Жадный + 2Opt" icon={<Zap size={16} />} colorClass="bg-blue-600" />
                  <AlgorithmButton active={settings.algorithm === 'optimal'} onClick={() => setSettings(p => ({...p, algorithm: 'optimal'}))} label="Оптимальный" icon={<BrainCircuit size={16} />} colorClass="bg-purple-600" />
                  <AlgorithmButton active={settings.algorithm === 'genetic'} onClick={() => setSettings(p => ({...p, algorithm: 'genetic'}))} label="Генетический" icon={<Dna size={16} />} colorClass="bg-green-600" />
                  <AlgorithmButton active={settings.algorithm === 'simulated_annealing'} onClick={() => setSettings(p => ({...p, algorithm: 'simulated_annealing'}))} label="Отжиг" icon={<Flame size={16} />} colorClass="bg-orange-600" />
               </div>
               <p className="text-[10px] text-slate-400 mt-2.5 leading-tight bg-slate-800/50 p-2 rounded border border-white/5">{algorithmInfo[settings.algorithm]}</p>
            </div>
          </div>
        )}
      </div>

      {/* Статус */}
      <div className="space-y-4 border-t border-slate-700 pt-4 shrink-0">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <PlayCircle size={14} /> Статус
        </h2>
        {currentStart ? <div className="text-xs text-slate-400">Старт: <span className="text-white font-mono">[{currentStart.x}, {currentStart.y}]</span></div> : <div className="text-xs text-yellow-500">Точка старта не определена.</div>}
        {pathResult ? (
          <div className="space-y-3">
             <div className={`p-3 rounded-lg border ${pathResult.isSolvable ? 'bg-green-900/30 border-green-800' : 'bg-red-900/30 border-red-800'}`}>
                <div className={`font-bold text-sm ${pathResult.isSolvable ? 'text-green-400' : 'text-red-400'}`}>{pathResult.isSolvable ? 'Путь найден!' : 'Неразрешимо'}</div>
                <div className="text-slate-300 text-xs mt-1">Дистанция: {pathResult.totalDistance} шагов</div>
             </div>
             <div className="bg-slate-900/70 p-3 rounded-lg text-xs space-y-1.5 border border-slate-700/50">
                <div className="flex justify-between"><span className="text-slate-400">Цели:</span><span className="text-white">{pathResult.visitedObjectives.length}</span></div>
                {pathResult.unreachableObjectives.length > 0 && <div className="flex justify-between text-red-400"><span>Недостижимо:</span><span>{pathResult.unreachableObjectives.length}</span></div>}
             </div>
          </div>
        ) : <div className="text-slate-500 text-sm italic">Загрузите карту для статистики.</div>}
      </div>

      {/* Список шагов */}
      {pathResult && pathResult.steps.length > 0 && (
        <div className="space-y-2 border-t border-slate-700 pt-4">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Маршрут</h3>
              <span className="text-[10px] text-slate-500 text-right">Наведите для подсветки</span>
           </div>
           <div className="space-y-2 pb-4">
             {pathResult.steps.map((step, i) => (
               <div key={i} onClick={() => onStepClick(i)} onMouseEnter={() => onStepHover(i)} onMouseLeave={() => onStepHover(null)} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/70 flex gap-3 relative hover:bg-blue-900/30 hover:border-blue-700 transition-colors group cursor-pointer">
                  <div className="mt-1 shrink-0"><StepIcon action={step.action} /></div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm truncate"><StepDescription action={step.action} /></span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-800 px-1.5 py-0.5 rounded ml-2 group-hover:bg-slate-900">{(step.pathSegment.length - 1)}м</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <span className="text-slate-400">[{step.from.x},{step.from.y}]</span>
                          <ArrowRight size={10} className="text-slate-600 group-hover:text-slate-400" />
                          <span className="text-white">[{step.to.x},{step.to.y}]</span>
                      </div>
                  </div>
                  <div className="absolute top-1.5 right-1.5 text-[10px] font-bold text-slate-700 group-hover:text-blue-500/80 pointer-events-none select-none">#{i + 1}</div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Футер */}
      <div className="mt-auto pt-4 border-t border-slate-700 shrink-0">
         <div className="bg-slate-900/50 p-3 rounded-lg text-xs text-slate-400 flex items-start gap-2 border border-slate-700/50">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-yellow-600" />
            <p>Кликните по любой ячейке на сетке, чтобы принудительно задать точку старта.</p>
         </div>
      </div>
    </div>
  );
};
