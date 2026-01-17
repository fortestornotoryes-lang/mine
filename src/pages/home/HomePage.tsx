
import { DungeonPage } from "@/widgets/DungeonViewer/ui/DungeonPage.tsx";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { CharacterViewer } from '@/widgets/character-viewer/ui/CharacterViewer.tsx';
import { MineViewer } from '@/widgets/mine-viewer/ui/MineViewer.tsx';
import { Pickaxe, Users } from 'lucide-react';

type TabType = 'mines' | 'characters' | 'dungeon';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('activeChaosageTab') as TabType;
    return savedTab && ['mines', 'characters', 'dungeon'].includes(savedTab) ? savedTab : 'mines';
  });

  useEffect(() => {
    localStorage.setItem('activeChaosageTab', activeTab);

    if (activeTab === 'dungeon') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeTab]);

  const navButtonClasses = "flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3 sm:px-10 rounded-full text-xs sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em] transition-colors duration-500 relative z-10 group";

  return (
    <div className={`flex flex-col mx-auto px-4 py-2 ${activeTab === 'dungeon' ? 'h-screen w-screen max-w-none' : 'flex-1 w-full max-w-7xl'}`}>
      {/* Навигация с анимированным фоном (layoutId) */}
      <div className="flex-none flex justify-center mb-2">
        <nav className="flex flex-col sm:flex-row p-1.5 bg-[#0a0c10]/80 backdrop-blur-3xl rounded-[2rem] border border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <button
            onClick={() => setActiveTab('mines')}
            className={`${navButtonClasses} ${
              activeTab === 'mines' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'mines' && (
              <motion.div 
                layoutId="nav-bg"
                className="absolute inset-0 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                style={{ borderRadius: '9999px' }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Pickaxe className={`h-4 w-4 relative z-10 transition-transform duration-500 ${activeTab === 'mines' ? 'scale-110' : 'group-hover:rotate-12'}`} />
            <span className="relative z-10">Шахты</span>
          </button>
          
          <button
            onClick={() => setActiveTab('characters')}
            className={`${navButtonClasses} ${
              activeTab === 'characters' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'characters' && (
              <motion.div 
                layoutId="nav-bg"
                className="absolute inset-0 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                style={{ borderRadius: '9999px' }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Users className={`h-4 w-4 relative z-10 transition-transform duration-500 ${activeTab === 'characters' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="relative z-10">Герои</span>
          </button>
          <button
            onClick={() => setActiveTab('dungeon')}
            className={`${navButtonClasses} ${
              activeTab === 'dungeon' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === 'dungeon' && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                style={{ borderRadius: '9999px' }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Users className={`h-4 w-4 relative z-10 transition-transform duration-500 ${activeTab === 'dungeon' ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="relative z-10">Карта </span>
          </button>
        </nav>
      </div>

      {/* Основной контент с анимацией смены (AnimatePresence) */}
      <main className={`relative ${activeTab === 'dungeon' ? 'flex-1 overflow-hidden' : 'min-h-[60vh]'}`}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={activeTab === 'dungeon' ? 'h-full' : ''}
          >
              {activeTab === "mines" ? <MineViewer /> : activeTab === "characters" ? <CharacterViewer /> :
                  <DungeonPage />}
          </motion.div>
        </AnimatePresence>
      </main>


    </div>
  );
};
