import React from 'react';
import { motion } from 'framer-motion';
import { ChevronsUp, ChevronsDown, Eraser, Download, Upload, AlertCircle, X } from 'lucide-react';
import { StairTool } from '../model/useStairsEditor';
import { cn } from '@/shared/lib/utils';

interface StairsEditorBarProps {
    tool: StairTool;
    onToolChange: (tool: StairTool) => void;
    onExport: () => void;
    onImport: () => void;
    onExit: () => void;
    totalMarkers: number;
    importError: string | null;
}

const TOOLS: { id: StairTool; label: string; icon: React.ReactNode; activeClass: string }[] = [
    { id: 'down', label: 'Спуск', icon: <ChevronsDown className="h-4 w-4" />, activeClass: 'bg-orange-500 border-orange-300 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' },
    { id: 'up', label: 'Подъём', icon: <ChevronsUp className="h-4 w-4" />, activeClass: 'bg-cyan-500 border-cyan-300 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' },
    { id: 'erase', label: 'Ластик', icon: <Eraser className="h-4 w-4" />, activeClass: 'bg-slate-200 border-white text-black shadow-[0_0_12px_rgba(255,255,255,0.2)]' },
];

export const StairsEditorBar: React.FC<StairsEditorBarProps> = ({
    tool, onToolChange, onExport, onImport, onExit, totalMarkers, importError,
}) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0d12] border border-blue-500/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden"
        >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mr-1">Инструмент</span>
                    {TOOLS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onToolChange(t.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95",
                                tool === t.id
                                    ? t.activeClass
                                    : "bg-[#11161d] border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600"
                            )}
                        >
                            {t.icon}
                            <span className="hidden md:inline">{t.label}</span>
                        </button>
                    ))}
                </div>

                <div className="hidden sm:block h-8 w-px bg-slate-800/60" />

                <div className="flex items-center gap-2 flex-1">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#11161d] hover:bg-emerald-600/10 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                        title="Скачать карты этажей файлами «Шахта(этаж).json»"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden md:inline">Сохранить</span>
                    </button>
                    <button
                        onClick={onImport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#11161d] hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                        title="Загрузить карты этажей из файлов (можно несколько)"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="hidden md:inline">Загрузить</span>
                    </button>

                    <span className="ml-auto text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Меток: <span className="text-blue-400 font-unbounded">{totalMarkers}</span>
                    </span>
                </div>

                <button
                    onClick={onExit}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/5 hover:bg-red-500 border border-red-500/10 text-red-500/60 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                    <X className="h-4 w-4" />
                    Выйти
                </button>
            </div>

            {importError && (
                <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3 text-red-400 text-[9px] font-black uppercase tracking-widest">
                    <AlertCircle className="h-4 w-4 shrink-0" />{importError}
                </div>
            )}
        </motion.section>
    );
};
