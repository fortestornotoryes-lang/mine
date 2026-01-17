
import React from 'react';
import { GridCell } from '../types';

interface MapTooltipProps {
  cell: GridCell | null;
  pos: { x: number, y: number };
}

export const MapTooltip: React.FC<MapTooltipProps> = ({ cell, pos }) => {
  if (!cell) return null;

  return (
    <div 
      className="absolute pointer-events-none bg-slate-950/95 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl border-2 border-indigo-500/50 backdrop-blur-3xl z-[100] flex items-center space-x-10 whitespace-nowrap"
      style={{ 
        left: pos.x, 
        top: pos.y - 10,
        transform: 'translate(-50%, -100%)' 
      }}
    >
       <div className="flex flex-col pr-10 border-r-2 border-slate-800">
          <span className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Координаты</span>
          <span className="text-2xl font-mono font-black tracking-tighter">[{cell.x}:{cell.y}]</span>
       </div>
       <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-widest">Истощение</span>
          <span className="text-2xl font-mono font-black">{cell.value === -999 ? 'ERROR' : `${cell.value}%`}</span>
       </div>
    </div>
  );
};
