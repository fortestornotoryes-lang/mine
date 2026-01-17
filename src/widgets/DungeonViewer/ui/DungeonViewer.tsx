import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Eye, EyeOff, AlertTriangle, Grid, SlidersHorizontal, PenTool, MousePointer2, Eraser, HelpCircle, ArrowUp, ArrowDown, MapPin, Box, Skull, ShieldAlert, Grid3x3, Check, X } from 'lucide-react';
import { Point } from '@/shared/types';
import { RawDungeonCell, CellType } from '@/entities/dungeon/model/types';
import { CELL_CONFIG }              from "@/entities/dungeon/config";
import { CellIcon }                 from "@/entities/dungeon/ui/CellIcon.tsx";
import { PathResult }  from "@/entities/path/model/types.ts";

interface DungeonViewerProps {
  grid: RawDungeonCell[][];
  setGrid: React.Dispatch<React.SetStateAction<RawDungeonCell[][]>>;
  pathResult: PathResult | null;
  startPoint: Point | null;
  onCellClick: (p: Point) => void;
  hoveredStepIndex: number | null;
  nextTarget?: Point | null;
  isDrawMode: boolean;
  setIsDrawMode: (value: boolean) => void;
}

const LegendItem = ({ label, color, icon }: { label: string, color: string, icon: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className={`w-6 h-6 rounded-sm flex items-center justify-center shrink-0 ${color} shadow-sm border border-white/5`}>
      <div className="text-white/90">
        {icon}
      </div>
    </div>
    <span className="text-xs text-slate-300">{label}</span>
  </div>
);

export const DungeonViewer: React.FC<DungeonViewerProps> = ({
  grid: initialGrid,
  setGrid: setInitialGrid,
  pathResult,
  startPoint,
  onCellClick,
  hoveredStepIndex,
  nextTarget,
  isDrawMode,
  setIsDrawMode
}) => {
  const [tempGrid, setTempGrid] = useState<RawDungeonCell[][]>(initialGrid);
  
  useEffect(() => {
    if (!isDrawMode) {
      setTempGrid(initialGrid);
    }
  }, [initialGrid, isDrawMode]);

  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showPathDetails, setShowPathDetails] = useState(true);
  
  const [viewSettings, setViewSettings] = useState({ cellSize: 24, gap: 1 });
  const [showViewSettings, setShowViewSettings] = useState(false);
  
  const [selectedBrush, setSelectedBrush] = useState<number>(CellType.Empty);
  const [isPainting, setIsPainting] = useState(false);

  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cell: Point } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 }); 
  const isPanOperation = useRef(false);

  const gridToRender = isDrawMode ? tempGrid : initialGrid;
  const rows = gridToRender.length;
  const cols = gridToRender[0]?.length || 0;
  
  const { cellSize, gap } = viewSettings;

  const handleCellUpdate = (p: Point, type: number) => {
    const gridUpdater = isDrawMode ? setTempGrid : setInitialGrid;
    gridUpdater(prev => {
        if (prev[p.y]?.[p.x]?.f === type) return prev;
        const newGrid = prev.map(row => [...row]);
        newGrid[p.y][p.x] = { ...prev[p.y][p.x], f: type };
        return newGrid;
    });
  };

  const handleApplyChanges = () => {
    setInitialGrid(tempGrid);
    setIsDrawMode(false);
  };

  const handleDiscardChanges = () => {
    setTempGrid(initialGrid);
    setIsDrawMode(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, transform.scale + scaleAmount), 5);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawMode && e.button === 0) {
        setIsPainting(true);
        return;
    }
    if (e.button === 0 && !contextMenu) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      isPanOperation.current = false;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isPanOperation.current = true;
      setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPainting(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPainting(false);
  }

  const handleCellMouseEnter = (p: Point) => {
      if (isPainting && isDrawMode) {
          handleCellUpdate(p, selectedBrush);
      }
  };

  const handleCellMouseDown = (p: Point) => {
      if (isDrawMode) {
          handleCellUpdate(p, selectedBrush);
          setIsPainting(true);
      }
  };

  const handleSafeCellClick = (p: Point) => {
      if (isDrawMode) return;
      if (isPanOperation.current) {
          isPanOperation.current = false;
          return;
      }
      onCellClick(p);
  };

  const fitToScreen = () => {
    if (!containerRef.current || rows === 0 || cols === 0) {
      setTransform({ scale: 1, x: 0, y: 0 });
      return;
    }

    const container = containerRef.current;
    const { clientWidth: containerWidth, clientHeight: containerHeight } = container;

    if (containerWidth === 0 || containerHeight === 0) return;

    const gridPadding = 32; // p-4 on grid container
    const gridWidth = cols * cellSize + (cols > 0 ? (cols - 1) * gap : 0) + gridPadding;
    const gridHeight = rows * cellSize + (rows > 0 ? (rows - 1) * gap : 0) + gridPadding;

    if (gridWidth <= 0 || gridHeight <= 0) return;

    const scaleX = containerWidth / gridWidth;
    const scaleY = containerHeight / gridHeight;
    
    const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave a small margin

    setTransform({
      scale: Math.min(Math.max(0.1, newScale), 5), // Clamp scale
      x: 0,
      y: 0,
    });
  };

  const handleCellContextMenu = (e: React.MouseEvent, p: Point) => {
    if (isPainting) return; 
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, cell: p });
  };

  const handleTypeSelect = (type: number) => {
    if (contextMenu) {
        handleCellUpdate(contextMenu.cell, type);
        setContextMenu(null);
    }
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    if (contextMenu) window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);

  useLayoutEffect(() => {
    fitToScreen();
  }, [rows, cols, cellSize, gap]);

  const getPointsPathD = (points: Point[]) => {
     if (!points || points.length === 0) return '';
      const toPx = (n: number) => n * (cellSize + gap) + cellSize / 2;
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toPx(p.x)} ${toPx(p.y)}`).join(' ');
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none">
      
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none"> 
         
          <div className="flex flex-col gap-2 bg-slate-800/90 p-2 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm pointer-events-auto">
            <button 
                onClick={() => setIsDrawMode(!isDrawMode)}
                className={`p-2 rounded transition-all duration-300 ${isDrawMode ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-800' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                title={isDrawMode ? "Выйти из режима рисования" : "Режим рисования"}
            >
                {isDrawMode ? <PenTool size={18} /> : <MousePointer2 size={18} />}
            </button>
            
            <div className="h-px bg-slate-700 my-1" />

            <button onClick={() => setTransform(p => ({ ...p, scale: Math.min(p.scale + 0.2, 5) }))} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors" title="Приблизить"><ZoomIn size={18} /></button>
            <button onClick={() => setTransform(p => ({ ...p, scale: Math.max(p.scale - 0.2, 0.1) }))} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors" title="Отдалить"><ZoomOut size={18} /></button>
            <button onClick={fitToScreen} className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors" title="Вписать в экран"><Maximize size={18} /></button>
            <div className="h-px bg-slate-700 my-1" />
            <button onClick={() => setShowPathDetails(!showPathDetails)} className={`p-2 rounded transition-colors ${showPathDetails ? 'text-blue-400 bg-slate-700/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="Показать/Скрыть детали пути">{showPathDetails ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <button onClick={() => setShowViewSettings(!showViewSettings)} className={`p-2 rounded transition-colors ${showViewSettings ? 'text-blue-400 bg-slate-700/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="Настройки сетки"><SlidersHorizontal size={18} /></button>
            <button onClick={() => setIsLegendOpen(!isLegendOpen)} className={`p-2 rounded transition-colors ${isLegendOpen ? 'text-blue-400 bg-slate-700/50' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="Легенда карты"><HelpCircle size={18} /></button>
          </div>

          {isDrawMode && (
              <div className="bg-slate-800/90 p-2 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 mt-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-1">
                      {Object.entries(CELL_CONFIG).map(([key, config]) => {
                          const typeId = parseInt(key);
                          const isActive = selectedBrush === typeId;
                          return (
                              <button key={key} onClick={() => setSelectedBrush(typeId)} className={`flex items-center gap-2 p-1.5 rounded text-xs transition-colors ${isActive ? 'bg-slate-600 text-white ring-1 ring-white/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title={config.label}>
                                  <div className={`w-4 h-4 rounded-sm shrink-0 ${config.color} border border-white/10 flex items-center justify-center`}>
                                      <div className="scale-75"><CellIcon type={typeId} className="text-white/90" /></div>
                                  </div>
                                  <span className="truncate max-w-[100px]">{config.label}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>
          )}

          {showViewSettings && (
             <div className="bg-slate-800/90 p-4 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm w-48 animate-in slide-in-from-right-2 fade-in duration-200 pointer-events-auto mt-2">
                 <div className="space-y-4">
                     <div>
                         <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Размер ячейки</span><span className="text-white font-mono">{cellSize}px</span></div>
                         <input type="range" min="10" max="64" value={cellSize} onChange={(e) => setViewSettings(p => ({...p, cellSize: Number(e.target.value)}))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                     </div>
                     <div>
                         <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Отступ</span><span className="text-white font-mono">{gap}px</span></div>
                         <input type="range" min="0" max="10" value={gap} onChange={(e) => setViewSettings(p => ({...p, gap: Number(e.target.value)}))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                     </div>
                 </div>
             </div>
          )}
      </div>

      {isLegendOpen && (
          <div className="absolute bottom-4 right-4 z-40 w-64 bg-slate-800/95 p-4 rounded-lg border border-slate-700 shadow-2xl backdrop-blur pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
             <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                 <h3 className="text-sm font-bold text-white flex items-center gap-2"><HelpCircle size={14} className="text-blue-400" />Легенда карты</h3>
                 <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-white transition-colors text-xs">Закрыть</button>
             </div>
             <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
               <LegendItem color="bg-green-700" icon={<ArrowDown size={14} />} label="Вход" /><LegendItem color="bg-blue-500" icon={<ArrowUp size={14} />} label="Лестница Вверх" /><LegendItem color="bg-emerald-600" icon={<ArrowDown size={14} />} label="Лестница Вниз" /><LegendItem color="bg-red-600" icon={<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />} label="Кнопка (Цель)" /><LegendItem color="bg-red-900" icon={<div className="w-2 h-2 rounded-full bg-red-900" />} label="Кнопка (Нажата)" /><LegendItem color="bg-purple-900" icon={<MapPin size={12} />} label="Тупик (Цель)" /><LegendItem color="bg-yellow-500" icon={<Box size={14} />} label="Сундук" /><LegendItem color="bg-orange-600" icon={<Skull size={14} />} label="Ловушка" /><LegendItem color="bg-rose-900" icon={<ShieldAlert size={14} />} label="Охранник" /><LegendItem color="bg-slate-800" icon={<Grid3x3 size={14} className="text-slate-400" />} label="Решетка" /><LegendItem color="bg-slate-700" icon={null} label="Дорога" /><LegendItem color="bg-slate-900" icon={null} label="Стена" />
            </div>
          </div>
      )}

      {isDrawMode && (
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <div className="bg-blue-600/90 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <PenTool size={12} />
                  РЕЖИМ РИСОВАНИЯ
              </div>
              <div className="mt-2 bg-slate-800/90 p-2 rounded-lg border border-slate-700 shadow-xl backdrop-blur-sm pointer-events-auto flex items-center gap-2">
                  <button onClick={handleApplyChanges} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs transition-colors"><Check size={14} />Применить</button>
                  <button onClick={handleDiscardChanges} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition-colors"><X size={14} />Отменить</button>
              </div>
          </div>
      )}

      <div 
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center ${isDrawMode ? 'cursor-crosshair' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div 
            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: isDragging ? 'none' : 'transform 0.1s ease-out', transformOrigin: 'center' }}
            className="relative"
        >
            <div 
                className={`relative bg-black/40 p-4 rounded-xl border border-slate-800/50 shadow-2xl ${isDrawMode ? 'ring-2 ring-blue-500/30' : ''}`}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: `${gap}px`, width: 'fit-content' }}
            >
                {gridToRender.map((row, y) => (
                row.map((cell, x) => {
                    const isStart = startPoint?.x === x && startPoint?.y === y;
                    const isNextTarget = nextTarget?.x === x && nextTarget?.y === y;
                    const config = CELL_CONFIG[cell.f] || CELL_CONFIG[CellType.Empty];
                    const isUnreachable = pathResult?.unreachableObjectives.some(u => u.x === x && u.y === y);
                    
                    const activeButtons = gridToRender.flat().filter(c => c.f === CellType.Button);
                    const isGrateOpen = activeButtons.length === 0;
                    
                    const isChestLocked = cell.f === CellType.Chest && activeButtons.length > 0;
                    
                    return (
                    <div
                        key={`${x}-${y}`}
                        onMouseDown={(e) => { if(isDrawMode) e.stopPropagation(); handleCellMouseDown({ x, y }); }}
                        onMouseEnter={() => handleCellMouseEnter({ x, y })}
                        onClick={() => handleSafeCellClick({ x, y })}
                        onContextMenu={(e) => handleCellContextMenu(e, { x, y })}
                        title={`[${x},${y}] ${config.label}`}
                        className={`flex items-center justify-center rounded-sm transition-all duration-200 ${isStart ? 'ring-2 ring-white z-10' : ''} ${isNextTarget ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 z-20 shadow-lg shadow-yellow-500/30' : ''} ${isUnreachable ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900 z-10' : ''} ${config.color} ${isDrawMode ? 'hover:brightness-125' : 'hover:brightness-110'} ${isChestLocked ? 'opacity-50' : ''} relative`}
                        style={{ width: cellSize, height: cellSize }}
                    >
                        <div style={{ transform: `scale(${Math.max(0.5, cellSize / 24)})` }}><CellIcon type={cell.f} className="text-white/90" isGrateOpen={isGrateOpen} isNextTarget={isNextTarget} /></div>
                        {isChestLocked && (<div className="absolute inset-.0 flex items-center justify-center pointer-events-none"><Grid3x3 size={cellSize * 0.6} className="text-slate-400 opacity-60" /></div>)}
                        {isUnreachable && !isDrawMode && (<div className="absolute -top-1 -right-1 bg-slate-900 rounded-full scale-75"><AlertTriangle size={12} className="text-red-500 animate-bounce" /></div>)}
                    </div>
                    );
                })
                ))}

                {pathResult && (
                <svg 
                    className={`absolute top-0 left-0 w-full h-full pointer-events-none z-20 transition-opacity ${isDrawMode ? 'opacity-30' : 'opacity-100'}`}
                    style={{ width: cols * (cellSize + gap) - gap, height: rows * (cellSize + gap) - gap, top: '16px', left: '16px' }} 
                >
                    <defs>
                        <marker id="arrowhead-blue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#38bdf8" /></marker>
                        <marker id="arrowhead-highlight" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="#facc15" /></marker>
                    </defs>
                    <style>{` @keyframes flow { to { stroke-dashoffset: -20; } } `}</style>
                    
                    {pathResult.steps.map((step, index) => {
                        const isHovered = hoveredStepIndex === index;
                        const isAnyHovered = hoveredStepIndex !== null;
                        const isNextStep = index === 0;
                        const isHighlighted = isHovered || (hoveredStepIndex === null && isNextStep);
                        
                        const showDetails = showPathDetails;
                        const opacity = isHighlighted ? 1 : (isAnyHovered ? 0.1 : 0.8);
                        const strokeColor = isHighlighted ? "#facc15" : "#38bdf8";
                        const baseStrokeWidth = Math.max(1, cellSize / 8);
                        const strokeWidth = isHighlighted ? baseStrokeWidth * 2 : (showDetails ? baseStrokeWidth * 1.5 : baseStrokeWidth);
                        const zIndex = isHighlighted ? 100 : 1;
                        const d = getPointsPathD(step.pathSegment);
                        const markerId = isHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead-blue)";
                        const showMarker = showDetails || isHighlighted;

                        return (
                            <g key={index} style={{ opacity, transition: 'opacity 0.2s', zIndex }}>
                                {(showDetails || isHighlighted) && (<path d={d} fill="none" stroke="#0f172a" strokeWidth={strokeWidth + baseStrokeWidth} strokeLinecap="round" strokeLinejoin="round" className="opacity-70" />)}
                                <path d={d} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" markerEnd={showMarker ? markerId : undefined} />
                                {(showDetails && (!isAnyHovered || isHighlighted)) && (<path d={d} fill="none" stroke="white" strokeWidth={isHighlighted ? 2 : 1} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${baseStrokeWidth * 2} ${baseStrokeWidth * 4}`} className="opacity-40" style={{ animation: 'flow 1s linear infinite' }} />)}
                            </g>
                        );
                    })}
                    
                    {pathResult.path[0] && (<circle cx={pathResult.path[0].x * (cellSize + gap) + cellSize/2} cy={pathResult.path[0].y * (cellSize + gap) + cellSize/2} r={cellSize / 6} fill="white" className="drop-shadow-md" />)}
                </svg>
                )}
            </div>
        </div>
      </div>

      {contextMenu && (
        <div 
            className="fixed z-50 bg-slate-800 border border-slate-700 shadow-2xl rounded-lg py-1 w-56 overflow-hidden"
            style={{ top: Math.min(contextMenu.y, window.innerHeight - 300), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
        >
            <div className="px-3 py-2 border-b border-slate-700 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">Установить тип</div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {Object.entries(CELL_CONFIG).map(([key, config]) => {
                    const typeId = parseInt(key);
                    return (
                        <button key={key} onClick={() => handleTypeSelect(typeId)} className="w-full text-left px-3 py-2 hover:bg-slate-700 flex items-center gap-3 transition-colors">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${config.color} border border-white/10`} />
                            <span className="text-sm text-slate-200 truncate">{config.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};
