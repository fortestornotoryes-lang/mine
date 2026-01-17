import React from 'react';
import { 
  Settings, Upload, Map as MapIcon, PlayCircle, AlertTriangle, 
  Footprints, MousePointerClick, MapPin, Box, LogOut, ArrowRight,
  ArrowUp, ArrowDown, Zap, BrainCircuit, Dna, Flame, Save, Target, ListOrdered,
  ChevronDown, ChevronUp, Construction
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
}

const StepIcon = ({ action }: { action: PathStep['action'] }) => {
  switch (action) {
    case 'press': return <MousePointerClick size={14} className="text-red-400" />;
    case 'explore': return <MapPin size={14} className="text-purple-400" />;
    case 'loot': return <Box size={14} className="text-yellow-400" />;
    case 'exit': return <LogOut size={14} className="text-emerald-400" />;
    case 'move': return <Footprints size={14} className="text-blue-400" />;
    default: return <Footprints size={14} className="text-slate-500" />;
  }
};

const StepDescription = ({ action }: { action: PathStep['action'] }) => {
    switch(action) {
        case 'press': return <span className="text-red-200">Нажать кнопку</span>;
        case 'explore': return <span className="text-purple-200">Исследовать тупик</span>;
        case 'loot': return <span className="text-yellow-200">Забрать сундук</span>;
        case 'exit': return <span className="text-emerald-200">Выйти</span>;
        case 'move': return <span className="text-blue-200">Идти</span>;
        default: return <span className="text-slate-200">{action}</span>;
    }
}

const AlgorithmButton = ({ 
    active, 
    onClick, 
    label, 
    icon,
    colorClass
}: { 
    active: boolean; 
    onClick: () => void; 
    label: string; 
    icon: React.ReactNode;
    colorClass: string;
}) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-2 px-2 rounded text-xs flex flex-col items-center gap-1 transition-all ${active ? `${colorClass} text-white shadow` : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
    >
        {icon}
        <span className="text-[10px] font-medium text-center leading-none mt-1">{label}</span>
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
}) => {
  const algorithmInfo = {
      'greedy': 'Быстро, но не всегда оптимально. Идет к ближайшей цели.',
      'optimal': 'Полный перебор (DP). Гарантирует идеальный путь. Медленно при >18 целях.',
      'genetic': 'Эволюционный подход. Хорош для больших карт. Быстрый и качественный.',
      'simulated_annealing': 'Метод отжига. Вероятностный поиск. Хорошо выходит из локальных ловушек.',
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-6 flex flex-col gap-6 shadow-xl h-full overflow-y-auto custom-scrollbar">

      {/* Файл: Загрузка и Сохранение */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <label className="flex flex-col items-center gap-1 cursor-pointer group w-full">
            <Upload className="text-blue-400 group-hover:text-blue-300 transition-colors" size={20} />
            <span className="text-[10px] font-medium text-slate-300 group-hover:text-white uppercase tracking-wider">Загрузить</span>
            <input 
                type="file" 
                accept=".json" 
                onChange={onFileUpload} 
                className="hidden" 
            />
            </label>
        </div>
        <button 
            onClick={onFileDownload}
            className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex flex-col items-center gap-1 hover:bg-slate-700 transition-colors group"
        >
            <Save className="text-emerald-400 group-hover:text-emerald-300 transition-colors" size={20} />
            <span className="text-[10px] font-medium text-slate-300 group-hover:text-white uppercase tracking-wider">Сохранить</span>
        </button>
      </div>

      {/* Настройки */}
      <div className="space-y-4 shrink-0">
        <button 
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between group hover:text-slate-200 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} /> Настройки пути
          </div>
          {isSettingsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {isSettingsExpanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Чекбоксы */}
            <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
                <input
                    type="checkbox"
                    checked={settings.avoidTraps}
                    onChange={(e) => setSettings(prev => ({ ...prev, avoidTraps: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-200">Избегать ловушек</span>
                </label>

                <label className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition">
                <input
                    type="checkbox"
                    checked={settings.avoidGuards}
                    onChange={(e) => setSettings(prev => ({ ...prev, avoidGuards: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                />
                <span className="text-sm text-slate-200">Избегать охраны</span>
                </label>
            </div>

            {/* Максимальный отступ тупиков */}
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
                <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase flex items-center gap-1">
                    <Construction size={10} /> Макс. отступ тупиков
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        placeholder="Все"
                        value={settings.maxDeadlockOffset ?? ''}
                        onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseInt(e.target.value);
                            setSettings(prev => ({ ...prev, maxDeadlockOffset: val }));
                        }}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {settings.maxDeadlockOffset !== undefined && (
                        <button 
                            onClick={() => setSettings(prev => ({ ...prev, maxDeadlockOffset: undefined }))}
                            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-1"
                        >
                            Сброс
                        </button>
                    )}
                </div>
                <p className="text-[9px] text-slate-500 mt-1 leading-tight">
                    Игнорировать тупики дальше N шагов от основного пути. Пусто — лутать всё.
                </p>
            </div>
            
            {/* Выбор приоритета */}
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
                 <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase flex items-center gap-1">
                     <ListOrdered size={10} /> Приоритет
                 </div>
                 <div className="grid grid-cols-3 gap-1">
                     <button
                        onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'mixed' }))}
                        className={`px-1 py-1.5 text-[10px] rounded transition-colors flex flex-col items-center justify-center gap-1 leading-none ${settings.objectivePriority === 'mixed' ? 'bg-slate-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                         <span>Без приоритета</span>
                     </button>
                     <button
                        onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'buttons_first' }))}
                        className={`px-1 py-1.5 text-[10px] rounded transition-colors flex flex-col items-center justify-center gap-1 leading-none ${settings.objectivePriority === 'buttons_first' ? 'bg-red-900/80 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                         <span>Сначала кнопки</span>
                     </button>
                     <button
                        onClick={() => setSettings(prev => ({ ...prev, objectivePriority: 'deadlocks_first' }))}
                        className={`px-1 py-1.5 text-[10px] rounded transition-colors flex flex-col items-center justify-center gap-1 leading-none ${settings.objectivePriority === 'deadlocks_first' ? 'bg-purple-900/80 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                         <span>Сначала тупики</span>
                     </button>
                 </div>
            </div>

            {/* Выбор цели выхода */}
            <div className="bg-slate-700/30 p-2 rounded-lg border border-slate-700/50">
                 <div className="text-[10px] text-slate-400 mb-1 font-semibold uppercase flex items-center gap-1">
                     <Target size={10} /> Цель выхода
                 </div>
                 <div className="grid grid-cols-2 gap-1">
                     <button
                        onClick={() => setSettings(prev => ({ ...prev, exitMode: 'stairs_up' }))}
                        className={`px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1 ${settings.exitMode === 'stairs_up' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                         <ArrowUp size={12} /> Лестница Вверх
                     </button>
                     <button
                        onClick={() => setSettings(prev => ({ ...prev, exitMode: 'stairs_down' }))}
                        className={`px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1 ${settings.exitMode === 'stairs_down' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                         <ArrowDown size={12} /> Лестница Вниз
                     </button>
                 </div>
            </div>

            {/* Выбор алгоритма */}
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700/50">
               <div className="text-xs text-slate-400 mb-2 font-semibold uppercase">Алгоритм</div>
               <div className="grid grid-cols-2 gap-2">
                  <AlgorithmButton 
                    active={settings.algorithm === 'greedy'} 
                    onClick={() => setSettings(p => ({...p, algorithm: 'greedy'}))} 
                    label="Жадный + 2Opt" 
                    icon={<Zap size={14} />} 
                    colorClass="bg-blue-600"
                  />
                  <AlgorithmButton 
                    active={settings.algorithm === 'optimal'} 
                    onClick={() => setSettings(p => ({...p, algorithm: 'optimal'}))} 
                    label="Оптимальный" 
                    icon={<BrainCircuit size={14} />} 
                    colorClass="bg-purple-600"
                  />
                  <AlgorithmButton 
                    active={settings.algorithm === 'genetic'} 
                    onClick={() => setSettings(p => ({...p, algorithm: 'genetic'}))} 
                    label="Генетический" 
                    icon={<Dna size={14} />} 
                    colorClass="bg-green-600"
                  />
                  <AlgorithmButton 
                    active={settings.algorithm === 'simulated_annealing'} 
                    onClick={() => setSettings(p => ({...p, algorithm: 'simulated_annealing'}))} 
                    label="Отжиг" 
                    icon={<Flame size={14} />} 
                    colorClass="bg-orange-600"
                  />
               </div>
               <p className="text-[10px] text-slate-400 mt-2 leading-tight bg-slate-800/50 p-2 rounded border border-white/5">
                 {algorithmInfo[settings.algorithm]}
               </p>
            </div>
          </div>
        )}
      </div>

      {/* Статус */}
      <div className="space-y-4 border-t border-slate-700 pt-4 shrink-0">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <PlayCircle size={14} /> Статус миссии
        </h2>

        {currentStart ? (
           <div className="text-xs text-slate-400">
             Старт: <span className="text-white font-mono">[{currentStart.x}, {currentStart.y}]</span>
           </div>
        ) : (
          <div className="text-xs text-yellow-500">Точка старта не определена.</div>
        )}

        {pathResult ? (
          <div className="space-y-3">
             <div className={`p-3 rounded border ${pathResult.isSolvable ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                <div className={`font-bold ${pathResult.isSolvable ? 'text-green-400' : 'text-red-400'}`}>
                  {pathResult.isSolvable ? 'Путь найден!' : 'Неразрешимо'}
                </div>
                <div className="text-slate-300 text-sm mt-1">
                   Дистанция: {pathResult.totalDistance} шагов
                </div>
             </div>

             <div className="bg-slate-900 p-3 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Цели:</span>
                  <span className="text-white">{pathResult.visitedObjectives.length} посещено</span>
                </div>
                {pathResult.unreachableObjectives.length > 0 && (
                   <div className="flex justify-between text-red-400">
                     <span>Недостижимо:</span>
                     <span>{pathResult.unreachableObjectives.length}</span>
                   </div>
                )}
             </div>
          </div>
        ) : (
          <div className="text-slate-500 text-sm italic">
            Загрузите карту для статистики.
          </div>
        )}
      </div>

      {/* Список шагов */}
      {pathResult && pathResult.steps.length > 0 && (
        <div className="space-y-2 border-t border-slate-700 pt-4">
           <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Маршрут</h3>
              <span className="text-[10px] text-slate-500">Наведите для подсветки / Клик для перехода</span>
           </div>
           
           <div className="space-y-2 pb-4">
             {pathResult.steps.map((step, i) => (
               <div 
                 key={i} 
                 onClick={() => onStepClick(i)}
                 onMouseEnter={() => onStepHover(i)}
                 onMouseLeave={() => onStepHover(null)}
                 className="bg-slate-900/40 p-3 rounded border border-slate-700/50 flex gap-3 relative hover:bg-blue-900/30 hover:border-blue-700 transition-colors group cursor-pointer"
               >
                  <div className="mt-1 shrink-0 p-1.5 bg-slate-800 rounded-full border border-slate-700 group-hover:border-blue-600 group-hover:bg-blue-900/50 transition-colors">
                      <StepIcon action={step.action} />
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm truncate"><StepDescription action={step.action} /></span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0 bg-slate-800 px-1.5 py-0.5 rounded ml-2 group-hover:bg-slate-900">
                             {(step.pathSegment.length - 1)}м
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <span className="text-slate-400">[{step.from.x},{step.from.y}]</span>
                          <ArrowRight size={10} className="text-slate-600 group-hover:text-slate-400" />
                          <span className="text-white">[{step.to.x},{step.to.y}]</span>
                      </div>
                  </div>
                  
                  {/* Номер шага */}
                  <div className="absolute top-2 right-2 text-[10px] font-bold text-slate-700/50 group-hover:text-blue-500/50 pointer-events-none select-none">
                     #{i + 1}
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Футер */}
      <div className="mt-auto pt-4 border-t border-slate-700 shrink-0">
         <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-400 flex items-start gap-2">
            <AlertTriangle size={12} className="shrink-0 mt-0.5 text-yellow-600" />
            <p>Кликните по любой ячейке на сетке, чтобы принудительно задать точку старта.</p>
         </div>
      </div>
    </div>
  );
};
