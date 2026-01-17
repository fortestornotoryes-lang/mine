
import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Анимированный компонент карточки.
 * Использует spring-анимацию для плавного появления.
 */
export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        damping: 25,
        stiffness: 120
      }}
      className={` border  rounded-2xl shadow-2xl backdrop-blur-sm  duration-300  relative ${className}`}
    >
      {title && (
        <div className="px-5 py-3.5 border-b border-slate-800/40 bg-slate-900/20 rounded-t-2xl">
          <h3 className=" font-black text-slate-500 uppercase tracking-[0.25em]">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
};
