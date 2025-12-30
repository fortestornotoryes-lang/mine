
import React from 'react';

interface StatRowProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  icon?: React.ReactNode;
  color?: string;
  compareValue?: string | number;
  better?: 'first' | 'second' | 'none';
  charNames?: [string, string];
  lowerIsBetter?: boolean;
}

/**
 * Строка параметра персонажа с поддержкой сравнения и тултипов.
 */
export const StatRow: React.FC<StatRowProps> = ({ 
  label, 
  value, 
  subValue, 
  icon, 
  color ,
  compareValue,
  better = 'none',
  charNames,
  lowerIsBetter = false
}) => {
  const isComparing = compareValue !== undefined;
  
  const getComparisonDetails = () => {
    if (!isComparing) return null;

    const v1 = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    const v2 = parseFloat(String(compareValue).replace(/[^0-9.-]/g, ''));

    if (isNaN(v1) || isNaN(v2)) return null;

    const delta = v1 - v2;
    const absDelta = Math.abs(delta).toFixed(2).replace(/\.00$/, '');
    const percentDelta = v2 !== 0 ? ((Math.abs(delta) / v2) * 100).toFixed(1) : '100';
    const isPositiveForFirst = lowerIsBetter ? delta < 0 : delta > 0;

    return { delta: absDelta, percent: percentDelta, isPositiveForFirst, v1, v2, rawDelta: delta };
  };

  const details = getComparisonDetails();

  return (
    <div className="relative flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 group transition-all hover:bg-white/[0.01] px-1 rounded-sm">
      <div className={`${color} flex items-center gap-3 min-w-0 flex-1`}>
        {icon && (
          <div className={`  group-hover:text-blue-400 shrink-0 scale-90`}>
            {icon}
          </div>
        )}
        <span className="text-slate-500 text-[10px] font-bold truncate pr-2 uppercase tracking-tight group-hover:text-slate-300 ">
          {label}
        </span>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end">
          <span className={`font-unbounded text-[10px] transition-all duration-300 ${
            better === 'first' 
              ? 'text-emerald-400 font-bold scale-105 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
              : better === 'second' ? 'text-red-400' : color
          }`}>
            {value}
          </span>
          {subValue && !isComparing && (
            <span className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">+{subValue}</span>
          )}
        </div>

        {isComparing && (
          <>
            <div className="w-[1px] h-3.5 bg-slate-800 rotate-12" />
            <div className="flex flex-col items-end">
              <span className={`font-unbounded text-[10px] transition-all duration-300 ${
                better === 'second' 
                  ? 'text-emerald-400 font-bold scale-105 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' 
                  : better === 'first' ? 'text-red-400' : color
              }`}>
                {compareValue}
              </span>
            </div>
          </>
        )}
      </div>

      {isComparing && details && (
        <div className="absolute z-[200] bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 p-4 bg-[#0a0c10]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none transform group-hover:-translate-y-2">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-3 border-b border-white/5 pb-2 flex justify-between items-center">
            <span>Дельта-анализ</span>
            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[7px]">SAPI v2</span>
          </p>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 truncate max-w-[110px] italic font-medium">{charNames?.[0] || 'Персонаж 1'}</span>
              <span className="text-white font-unbounded">{details.v1}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 truncate max-w-[110px] italic font-medium">{charNames?.[1] || 'Персонаж 2'}</span>
              <span className="text-white font-unbounded">{details.v2}</span>
            </div>
            
            <div className={`mt-3 pt-3 border-t border-white/5 flex flex-col items-center ${
              details.v1 === details.v2 ? 'text-slate-500' : details.isPositiveForFirst ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                 <span className="text-sm font-unbounded font-black">
                    {details.v1 === details.v2 ? 'EQUALS' : `${details.rawDelta > 0 ? '+' : ''}${details.rawDelta.toFixed(2).replace(/\.00$/, '')}`}
                 </span>
                 <span className="text-[9px] font-black px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 shadow-inner">
                    {details.percent}%
                 </span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-50">относительное отклонение</span>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-[#0a0c10]/98" />
        </div>
      )}
    </div>
  );
};
