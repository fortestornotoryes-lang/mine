
import React, { useState, useCallback } from 'react';
import { Controls } from './components/Controls';
import { MineMap } from './components/MineMap';
import { EmptyState } from './components/EmptyState';
import { LevelCard } from './components/LevelCard';
import { fetchMineData } from './services/mineApi';
import { MultiLevelData } from './types';
import { MINES_DICT, DEFAULT_MAX_LEVEL } from './constants';

const App: React.FC = () => {
  const [mineId, setMineId] = useState<number>(MINES_DICT[0].id);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [collapsedLevels, setCollapsedLevels] = useState<number[]>([]);
  const [multiData, setMultiData] = useState<MultiLevelData>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    if (selectedLevels.length === 0) return;
    setIsLoading(true);
    setError(null);
    const newMultiData: MultiLevelData = { ...multiData };
    try {
      const results = await Promise.all(selectedLevels.map(async (lvl) => {
        try {
          const result = await fetchMineData(mineId, lvl);
          return { lvl, result };
        } catch (e) {
          return { lvl, result: null, error: true };
        }
      }));
      results.forEach(({ lvl, result, error }) => { if (!error) newMultiData[lvl] = result; });
      setMultiData(newMultiData);
      if (results.some(r => r.error)) setError('Некоторые этажи не загрузились. Попробуйте еще раз.');
    } catch (err) { setError('Критическая ошибка связи.'); }
    finally { setIsLoading(false); }
  }, [mineId, selectedLevels, multiData]);

  const removeLevel = (lvl: number) => {
    setSelectedLevels(prev => prev.filter(l => l !== lvl));
    setCollapsedLevels(prev => prev.filter(l => l !== lvl));
    const nextData = { ...multiData };
    delete nextData[lvl];
    setMultiData(nextData);
  };

  const toggleCollapse = (lvl: number) => {
    setCollapsedLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  };

  const handleMineChange = (id: number) => {
    const mine = MINES_DICT.find(m => m.id === id);
    setMineId(id);
    setMultiData({});
    setCollapsedLevels([]);
    setSelectedLevels(prev => prev.filter(lvl => lvl <= (mine?.maxLevel || DEFAULT_MAX_LEVEL)));
  };

  const selectedMineName = MINES_DICT.find(m => m.id === mineId)?.name || 'Шахта';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-12 pt-8">
      <main className="container mx-auto px-4 max-w-7xl">

        <div className="flex flex-col space-y-10">
          <Controls 
            selectedMine={mineId} 
            selectedLevels={selectedLevels} 
            onMineChange={handleMineChange} 
            onLevelsChange={setSelectedLevels} 
            onFetch={handleFetch} 
            isLoading={isLoading} 
          />

          {error && (
            <div className="bg-rose-950/30 border border-rose-500/50 p-5 rounded-2xl text-rose-200 text-xs font-bold flex items-center justify-between shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white">⚠️</div>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="hover:text-white transition-colors">ЗАКРЫТЬ</button>
            </div>
          )}

          <div className="space-y-8">
            {selectedLevels.length === 0 ? (
              <EmptyState />
            ) : (
              selectedLevels.map(lvl => (
                <LevelCard 
                  key={lvl}
                  level={lvl}
                  mineName={selectedMineName}
                  isCollapsed={collapsedLevels.includes(lvl)}
                  onToggle={() => toggleCollapse(lvl)}
                  onRemove={() => removeLevel(lvl)}
                >
                  <MineMap data={multiData[lvl] || null} currentLevel={lvl} mineName={selectedMineName} />
                </LevelCard>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
