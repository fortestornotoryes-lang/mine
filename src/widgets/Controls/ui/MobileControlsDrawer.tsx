import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Settings } from 'lucide-react';
import { Controls } from './Controls';
import { PathfinderSettings, PathResult } from '@/entities/path/model/types';
import { Point } from '@/shared/types';

interface MobileControlsDrawerProps {
  settings: PathfinderSettings;
  setSettings: React.Dispatch<React.SetStateAction<PathfinderSettings>>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDownload: () => void;
  pathResult: PathResult | null;
  currentStart: Point | null;
  onStepHover: (index: number | null) => void;
  onStepClick: (index: number) => void;
  isDrawMode: boolean;
  setIsDrawMode: (isDraw: boolean) => void;
}

export const MobileControlsDrawer: React.FC<MobileControlsDrawerProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-20 bg-slate-800 border-t border-slate-700 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4.5rem)]'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-slate-400" />
          <span className="text-base font-semibold text-slate-200">
            {isOpen ? 'Скрыть настройки' : 'Показать настройки'}
          </span>
        </div>
        {isOpen ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>

      <div className="h-[60vh] overflow-y-auto">
        <Controls 
          {...props}
          isSettingsExpanded={isSettingsExpanded}
          setIsSettingsExpanded={setIsSettingsExpanded}
        />
      </div>
    </div>
  );
};
