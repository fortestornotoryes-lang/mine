import React from 'react';
import { ArrowDown, ArrowUp, MapPin, Box, Skull, ShieldAlert, Grid3x3 } from 'lucide-react';
import { CellType } from '../model/types';

interface CellIconProps {
  type: number;
  className?: string;
  isGrateOpen?: boolean;
  isNextTarget?: boolean;
}

export const CellIcon: React.FC<CellIconProps> = ({ type, className, isGrateOpen, isNextTarget }) => {
  const targetClass = isNextTarget ? 'text-yellow-400 animate-pulse' : '';

  switch (type) {
    case CellType.stairsDown: return <ArrowDown size={14} className={`${className} ${targetClass}`} />;
    case CellType.stairsUp: return <ArrowUp size={14} className={`${className} ${targetClass}`} />;
    case CellType.Button: return <div className={`w-2 h-2 rounded-full bg-red-500 ${isNextTarget ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-red-500 animate-pulse' : 'animate-pulse'}`} />;
    case CellType.ButtonPressed: return <div className="w-2 h-2 rounded-full bg-red-900" />;
    case CellType.UnexploredDeadlock: return <MapPin size={12} className={`${className} ${targetClass}`} />;
    case CellType.Chest: return <Box size={14} className={`${className} ${targetClass}`} />;
    case CellType.Trap: return <Skull size={14} className={`${className} ${targetClass}`} />;
    case CellType.Guard: return <ShieldAlert size={14} className={`${className} ${targetClass}`} />;
    case CellType.Enter: return <ArrowDown size={14} className={`${className} ${targetClass}`} />;
    case CellType.Grate: return <Grid3x3 size={14} className={`${className} ${isGrateOpen ? 'opacity-20 transition-opacity duration-500' : 'text-slate-400'} ${targetClass}`} />;
    default: return null;
  }
};
