
import React from 'react';
import { Swords } from 'lucide-react';
import { CharacterParams } from '@/entities/character/model/types.ts';

interface CharacterProfileProps {
  names: string[];
  isCompare: boolean;
}

/**
 * Рендерит визуальный заголовок профиля персонажа или битвы сравнения.
 */
export const CharacterProfile: React.FC<CharacterProfileProps> = ({ names, isCompare }) => {
  if (isCompare) {
    return (
      <div className="flex items-center gap-12 p-6 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 justify-center">
        <div className="flex ">
           <span className="font-unbounded font-black text-white text-2xl">{names[0]}</span>
        </div>
        <div className="flex ">
           <div className="relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-150" />
             <Swords className="h-8 w-8 text-slate-600 relative z-10 animate-pulse" />
           </div>
        </div>
        <div className="flex ">
           <span className="font-unbounded font-black text-white text-2xl">{names[1]}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-default animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative px-10 py-4 bg-[#0d1014] rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center">
         <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em] mb-2">Объект идентификации</span>
         <h1 className="font-unbounded font-black text-4xl tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors duration-500">
           {names[0]}
         </h1>
      </div>
    </div>
  );
};
