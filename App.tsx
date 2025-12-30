
import React from 'react';
import { HomePage } from './pages/home/HomePage.tsx';

/**
 * Главный компонент приложения.
 * В данном случае мы просто рендерим домашнюю страницу, так как приложение одностраничное.
 */
const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomePage />
    </div>
  );
};

export default App;
