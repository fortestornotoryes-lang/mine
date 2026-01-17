
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 shadow-lg mb-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center shadow-inner">
            <span className="text-2xl font-bold">⛏️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ChaosAge Mine Explorer
            </h1>
            <p className="text-xs text-gray-400 font-medium">Мониторинг истощения ресурсов</p>
          </div>
        </div>

      </div>
    </header>
  );
};
