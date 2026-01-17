import React from 'react';
import { ArrowDown, ArrowUp, MapPin, Box, Skull, ShieldAlert } from 'lucide-react';
import { CellType } from '../model/types';

interface CellIconProps {
  type: number;
  className?: string;
}

export const CellIcon: React.FC<CellIconProps> = ({ type, className }) => {
  switch (type) {
    case CellType.stairsDown: return <ArrowDown size={14} className={className} />;
    case CellType.stairsUp: return <ArrowUp size={14} className={className} />;
    case CellType.Button: return <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />;
    case CellType.ButtonPressed: return <div className="w-2 h-2 rounded-full bg-red-900" />;
    case CellType.UnexploredDeadlock: return <MapPin size={12} className={className} />;
    case CellType.Chest: return <Box size={14} className={className} />;
    case CellType.Trap: return <Skull size={14} className={className} />;
    case CellType.Guard: return <ShieldAlert size={14} className={className} />;
    case CellType.Enter: return <ArrowDown size={14} className={className} />;
    default: return null;
  }
};
