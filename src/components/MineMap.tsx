
import React, { useMemo, useState, useRef } from 'react';
import { MineData, GridCell } from '../types';
import { MapToolbar } from './MapToolbar';
import { MapLegend } from './MapLegend';
import { MapTooltip } from './MapTooltip';

interface MineMapProps {
  data: MineData | null;
  currentLevel: number;
  mineName?: string;
}

type FilterCategory = 'r0_9' | 'r10_24' | 'r25_49' | 'r50_74' | 'r75_100' | 'error' | null;

export const MineMap: React.FC<MineMapProps> = ({ data, currentLevel, mineName = 'Шахта' }) => {
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const [activeFilter, setActiveFilter] = useState<FilterCategory>(null);
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const getCategory = (val: number): FilterCategory => {
    if (val === -999 || val < 0 || val > 100) return 'error';
    if (val >= 0 && val <= 9) return 'r0_9';
    if (val >= 10 && val <= 24) return 'r10_24';
    if (val >= 25 && val <= 49) return 'r25_49';
    if (val >= 50 && val <= 74) return 'r50_74';
    return 'r75_100';
  };

  const handleToggleFilter = (cat: FilterCategory) => {
    setActiveFilter(prev => prev === cat ? null : cat);
  };

  const { cells } = useMemo(() => {
    const cellList: GridCell[] = [];
    if (!data) return { cells: [] };
    
    Object.entries(data).forEach(([colStr, rows]) => {
      const x = parseInt(colStr);
      if (isNaN(x)) return;
      Object.entries(rows).forEach(([rowStr, valStr]) => {
        const y = parseInt(rowStr);
        const val = parseInt(valStr);
        cellList.push({ x, y, value: isNaN(val) ? -999 : val });
      });
    });
    return { cells: cellList };
  }, [data]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(label);
      setIsCopyMenuOpen(false);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) { console.error(err); }
  };

  const handleCopyBest = () => {
    const best = cells.filter(c => c.value >= 0 && c.value <= 9).sort((a, b) => a.value - b.value);
    if (best.length === 0) return alert('Богатых секторов (0-9%) не обнаружено');
    copyToClipboard(`🔥 ${mineName} Lvl ${currentLevel}. TOP-точки (0-9%):\n${best.map(c => `[${c.x}:${c.y}] - ${c.value}%`).join('\n')}`, 'Скопировано!');
  };

  const handleCopyReport = () => {
    const validCells = cells.filter(c => c.value !== -999);
    if (validCells.length === 0) return;

    const total = validCells.length;
    const avg = Math.round(validCells.reduce((acc, c) => acc + c.value, 0) / total);
    
    const rich = validCells.filter(c => c.value <= 9);
    const good = validCells.filter(c => c.value > 9 && c.value <= 24);
    const medium = validCells.filter(c => c.value > 24 && c.value <= 49);
    const poor = validCells.filter(c => c.value > 49 && c.value <= 74);
    const empty = validCells.filter(c => c.value >= 75);

    const richPercent = ((rich.length / total) * 100).toFixed(1);
    
    let grade = "E (Пусто)";
    if (parseFloat(richPercent) > 20) grade = "S (Превосходно)";
    else if (parseFloat(richPercent) > 12) grade = "A (Отлично)";
    else if (parseFloat(richPercent) > 7) grade = "B (Хорошо)";
    else if (parseFloat(richPercent) > 3) grade = "C (Средне)";
    else if (parseFloat(richPercent) > 0) grade = "D (Бедно)";

    const bestPoints = [...validCells].sort((a, b) => a.value - b.value).slice(0, 15);
    const exhaustedPoints = [...validCells].filter(c => c.value > 50).sort((a, b) => b.value - a.value).slice(0, 5);

    const divider = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    
    const textReport = `
📡 ОТЧЕТ ГЛУБОКОГО СКАНИРОВАНИЯ: ${mineName.toUpperCase()}
📍 ОБЪЕКТ: ЭТАЖ ${currentLevel}
📊 СТАТУС ЭТАЖА: GRADE ${grade}
${divider}

📈 АНАЛИТИКА ЭФФЕКТИВНОСТИ:
• Ср. истощение этажа: ${avg}%
• Индекс насыщенности (0-9%): ${richPercent}%
• Площадь сканирования: ${total} секторов

🧬 РАСПРЕДЕЛЕНИЕ РЕСУРСОВ:
🟢 Жилы (0-9%)   : ${rich.length} сект.
🟡 Хорошо (10-24%): ${good.length} сект.
🟠 Средне (25-49%): ${medium.length} сект.
🔴 Бедно (50-74%) : ${poor.length} сект.
⚫ Пусто (75%+)   : ${empty.length} сект.

${divider}
🎯 ТОП-15 ЛУЧШИХ ТОЧЕК ДЛЯ ДОБЫЧИ:
${bestPoints.map((c, i) => `${(i + 1).toString().padStart(2, '0')}. [${c.x}:${c.y}] ➔ ${c.value}%`).join('\n')}

${exhaustedPoints.length > 0 ? `⚠️ КРИТИЧЕСКОЕ ИСТОЩЕНИЕ (ИЗБЕГАТЬ):
${exhaustedPoints.map(c => ` ✖ [${c.x}:${c.y}] ➔ ${c.value}%`).join('\n')}` : '✅ Зон критического истощения не выявлено.'}

${divider}
📅 Дата сканирования: ${new Date().toLocaleString('ru-RU')}
🚀 Сформировано системой Mines Explorer v3.5
${divider}
`.trim();

    copyToClipboard(textReport, 'Расширенный отчет скопирован!');
  };

  if (!data) return (
    <div className="h-80 flex flex-col items-center justify-center border-4 border-dashed border-gray-800 rounded-[3rem] bg-gray-900/20 text-gray-700 font-mono">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
      <p className="animate-pulse tracking-[0.5em] uppercase text-[10px] font-black text-indigo-500/40">Инициализация шлюза...</p>
    </div>
  );

  const getCellStyles = (val: number | undefined) => {
    if (val === undefined) return 'bg-slate-900/40 opacity-10';
    const cat = getCategory(val);
    const out = activeFilter !== null && activeFilter !== cat;
    
    // Уменьшен размер шрифта для более компактных клеток
    let base = "border font-black transition-all duration-300 flex items-center justify-center aspect-square text-[8px] sm:text-[10px] rounded-sm cursor-pointer select-none";
    
    if (out) base += " opacity-10 grayscale blur-[1px]";
    else if (activeFilter !== null) base += " scale-110 z-10 brightness-110 ring-2 ring-white/40 shadow-2xl";
    
    const darkText = "text-slate-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]";
    const lightText = "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]";

    if (cat === 'error') return `${base} bg-fuchsia-600 border-fuchsia-300 ${lightText} animate-pulse`;
    if (cat === 'r0_9') return `${base} bg-emerald-400 border-emerald-700 ${darkText}`;
    if (cat === 'r10_24') return `${base} bg-yellow-400 border-yellow-700 ${darkText}`;
    if (cat === 'r25_49') return `${base} bg-orange-500 border-orange-800 ${darkText}`;
    if (cat === 'r50_74') return `${base} bg-red-600 border-red-900 ${lightText}`;
    
    return `${base} bg-slate-900 border-black text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`;
  };

  const colHeaders = Array.from({ length: 21 }, (_, i) => i + 1);
  const rowHeaders = Array.from({ length: 13 }, (_, i) => 13 - i);
  // Уменьшен размер шрифта заголовков
  const hStyle = "flex items-center justify-center aspect-square bg-slate-800/80 border border-slate-700 text-slate-300 font-mono font-black text-[8px] sm:text-[10px] backdrop-blur-sm z-20";

  return (
    <div className="relative w-full" ref={containerRef} onMouseMove={handleMouseMove}>
      <MapToolbar 
        onCopyBest={handleCopyBest} 
        onCopyReport={handleCopyReport} 
        isOpen={isCopyMenuOpen} 
        setIsOpen={setIsCopyMenuOpen} 
        feedback={copyFeedback} 
      />

      <div className="w-full bg-slate-950 p-1.5 rounded-[2rem] border-2 border-slate-800/80 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden max-w-5xl mx-auto">
        <div className="grid grid-cols-[repeat(22,1fr)] gap-[1px] sm:gap-[2px]">
          <div className={`${hStyle} !bg-indigo-600 !text-white !border-indigo-400 rounded-tl-xl`}>{currentLevel}</div>
          {colHeaders.map(x => <div key={x} className={`${hStyle} ${x === 21 ? 'rounded-tr-xl' : ''}`}>{x}</div>)}
          {rowHeaders.map((y, ri) => (
            <React.Fragment key={y}>
              <div className={`${hStyle} ${ri === 12 ? 'rounded-bl-xl' : ''}`}>{y}</div>
              {colHeaders.map((x, ci) => {
                const c = cells.find(cl => cl.x === x && cl.y === y);
                return (
                  <div key={`${x}-${y}`} onMouseEnter={() => c && setHoveredCell(c)} onMouseLeave={() => setHoveredCell(null)} className={`${getCellStyles(c?.value)} ${ri === 12 && ci === 20 ? 'rounded-br-xl' : ''}`}>
                    {c ? (c.value === -999 ? '!!' : c.value) : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <MapLegend activeFilter={activeFilter} onToggleFilter={handleToggleFilter} />
      <MapTooltip cell={hoveredCell} pos={mousePos} />
    </div>
  );
};
