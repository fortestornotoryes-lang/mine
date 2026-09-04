import { Variants }                                    from "motion";
import React, { useRef }                               from "react";
import { ChevronDown, Layers, LayoutGrid, Loader2, X,
         ChevronsUpDown, Eye, PencilRuler }            from "lucide-react";
import { AnimatePresence, motion }                     from "framer-motion"; // Исправил импорт для совместимости
import { LevelResult, MINES_DICT }                     from "@/entities/mine/model/types";
import { useMineScanner }                              from "../model/useMineScanner";
import { useStairsEditor }                             from "../model/useStairsEditor";
import { MineLegend }                                  from "./MineLegend";
import { MineMapGrid }                                 from "./MineMapGrid";
import { MineScannerPanel }                            from "./MineScannerPanel";
import { StairsEditorBar }                             from "./StairsEditorBar";
import { StairsSourceModal }                           from "./StairsSourceModal";

const cardVariants: Variants = {
    initial: { opacity: 0, scale: 0.98, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2 },
    },
};

export const MineViewer: React.FC = () => {
    const {
              selectedMine, setSelectedMine,
              selectedFloors, toggleFloor,
              results, removeLevel, loadLevels,
              isLoading, error,
              activeFilters, toggleFilter,
              collapsedFloors, toggleCollapse,
              startScan, scanAllFloors, reset,
          } = useMineScanner();

    const editor = useStairsEditor(selectedMine);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const enterEditor = () => {
        editor.setEditorMode(true);
        editor.setImportError(null);
        editor.setShowSourceModal(true);
    };

    const exitEditor = () => {
        editor.setEditorMode(false);
        editor.setShowSourceModal(false);
    };

    const handleFilesSelected = async (files: File[]) => {
        const res = await editor.importFiles(files);
        if (res.targetMineId === null) return;

        const mineChanged = res.targetMineId !== selectedMine.id;
        if (mineChanged) {
            const mine = MINES_DICT.find(m => m.id === res.targetMineId);
            if (mine) setSelectedMine(mine);
        }
        // Открываем карточки этажей вместе со снимком клеток из файлов
        loadLevels(res.floors.map(f => ({ level: f.level, data: f.cells })), mineChanged);
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-32">
            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                multiple
                className="hidden"
                onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    if (files.length > 0) await handleFilesSelected(files);
                }}
            />

            <StairsSourceModal
                open={editor.showSourceModal}
                onClose={() => editor.setShowSourceModal(false)}
                onPickComputer={() => {
                    editor.setShowSourceModal(false);
                    fileInputRef.current?.click();
                }}
                onPickServer={() => {
                    editor.setShowSourceModal(false);
                    scanAllFloors();
                }}
            />

            {/* Переключатель режима */}
            <div className="flex justify-end">
                <div className="flex p-1 bg-[#0a0d12] border border-slate-800/40 rounded-2xl shadow-xl">
                    <button
                        onClick={exitEditor}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            !editor.editorMode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Просмотр
                    </button>
                    <button
                        onClick={enterEditor}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                            editor.editorMode ? 'bg-orange-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <PencilRuler className="h-3.5 w-3.5" />
                        Редактор переходов
                    </button>
                </div>
            </div>

            {editor.editorMode && (
                <StairsEditorBar
                    tool={editor.tool}
                    onToolChange={editor.setTool}
                    onExport={() => editor.exportFloors(results)}
                    onImport={() => fileInputRef.current?.click()}
                    onExit={exitEditor}
                    totalMarkers={editor.totalMarkers}
                    importError={editor.importError}
                />
            )}

            <MineScannerPanel
                selectedMine={selectedMine}
                setSelectedMine={setSelectedMine}
                selectedFloors={selectedFloors}
                onToggleFloor={toggleFloor}
                onReset={reset}
                onScan={startScan}
                isLoading={isLoading}
                error={error}
            />

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {results.map((res: LevelResult) => {
                        const isCollapsed = collapsedFloors.includes(res.level);
                        const levelStairs = editor.stairs[res.level] || [];

                        return (
                            <motion.div
                                layout="position"
                                key={res.level}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="bg-[#0d1117] border border-slate-800/40 rounded-2xl overflow-hidden shadow-2xl relative"
                            >
                                {/* Эффект сканирующей линии (только при загрузке конкретного уровня) */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ left: "-100%" }}
                                        animate={{ left: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 z-0 pointer-events-none"
                                    />
                                )}

                                <div className="absolute top-4 right-8 text-8xl font-black text-white/[0.01] select-none pointer-events-none italic tracking-tighter">
                                    L-{res.level}
                                </div>

                                <div className="p-5 flex items-center justify-between relative z-10 border-b border-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            animate={isLoading ? { rotate: 360 } : {}}
                                            transition={isLoading ? { duration: 4, repeat: Infinity, ease: "linear" } : {}}
                                            className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-colors border ${
                                                isLoading
                                                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                                    : "bg-slate-800 text-slate-500 border-slate-700/30"
                                            }`}
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <h2 className="text-[13px] font-unbounded font-black text-white uppercase tracking-tight flex items-center gap-2">
                                                Уровень {res.level}
                                                {isLoading && (
                                                    <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30 font-bold">
                                                        Обновление...
                                                    </span>
                                                )}
                                                {levelStairs.length > 0 && (
                                                    <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/20 font-bold flex items-center gap-1">
                                                        <ChevronsUpDown className="h-3 w-3" />
                                                        {levelStairs.length}
                                                    </span>
                                                )}
                                            </h2>
                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.4em]">
                                                {selectedMine.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleCollapse(res.level)}
                                            className="p-3 bg-slate-800/40 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/30"
                                        >
                                            <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
                                                <ChevronDown className="h-4 w-4" />
                                            </motion.div>
                                        </button>

                                        <button
                                            onClick={() => removeLevel(res.level)}
                                            className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500/40 hover:text-white rounded-xl transition-all border border-red-500/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 flex flex-col items-center w-full relative z-10">
                                                <MineMapGrid
                                                    result={res}
                                                    activeFilters={activeFilters}
                                                    isLoading={isLoading}
                                                    editMode={editor.editorMode}
                                                    stairs={levelStairs}
                                                    onCellClick={(x, y) => editor.applyTool(res.level, x, y)}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {!isLoading && results.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/20 rounded-3xl bg-slate-900/5">
                        <LayoutGrid className="h-16 w-16 text-slate-800 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 text-center leading-loose">
                            Матрица данных пуста<br />Запустите сканирование этажей
                        </p>
                    </div>
                )}
            </div>

            <MineLegend activeFilters={activeFilters} onToggleFilter={toggleFilter} />
        </div>
    );
};
