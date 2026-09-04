import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, CloudDownload, X } from 'lucide-react';

interface StairsSourceModalProps {
    open: boolean;
    onClose: () => void;
    onPickComputer: () => void;
    onPickServer: () => void;
}

export const StairsSourceModal: React.FC<StairsSourceModalProps> = ({ open, onClose, onPickComputer, onPickServer }) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-lg bg-[#0a0d12] border border-slate-800/60 rounded-3xl p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-slate-800/40 hover:bg-slate-700 text-slate-500 hover:text-white rounded-xl transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <h3 className="text-[13px] font-unbounded font-black text-white uppercase tracking-tight mb-1">
                            Редактор переходов
                        </h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-6">
                            Откуда загрузить карты этажей?
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={onPickComputer}
                                className="group flex flex-col items-center gap-3 p-6 bg-[#11161d] hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all"
                            >
                                <div className="h-12 w-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <FolderOpen className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">С компьютера</div>
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                                        JSON-файлы «Шахта(этаж)»<br />можно выбрать несколько
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={onPickServer}
                                className="group flex flex-col items-center gap-3 p-6 bg-[#11161d] hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all"
                            >
                                <div className="h-12 w-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                    <CloudDownload className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-white uppercase tracking-widest">С сервера</div>
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                                        Сканировать этажи<br />как обычно
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
