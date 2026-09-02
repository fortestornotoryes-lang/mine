
import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Swords } from 'lucide-react';

interface CharacterProfileProps {
    names: string[];
    isCompare: boolean;
}

const Monogram: React.FC<{ name: string; gradient: string }> = ({ name, gradient }) => (
    <div className="relative shrink-0">
        <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${gradient} opacity-70 blur-lg`} />
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] font-unbounded text-2xl font-black text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] backdrop-blur-xl sm:h-20 sm:w-20 sm:text-3xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
            <span className="relative">{(name?.charAt(0) || '?').toUpperCase()}</span>
        </div>
    </div>
);

/**
 * Стеклянный заголовок профиля персонажа или битвы сравнения.
 */
export const CharacterProfile: React.FC<CharacterProfileProps> = ({ names, isCompare }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-6 py-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:px-9 sm:py-7"
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-600/25 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-[90px]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {isCompare ? (
                <div className="relative flex items-center justify-center gap-5 sm:gap-10">
                    <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
                        <span className="truncate font-unbounded text-lg font-black uppercase tracking-tight text-white sm:text-2xl">
                            {names[0]}
                        </span>
                        <Monogram name={names[0]} gradient="from-blue-500 to-cyan-400" />
                    </div>

                    <div className="relative shrink-0">
                        <div className="absolute inset-0 scale-150 rounded-full bg-white/10 blur-2xl" />
                        <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl sm:h-14 sm:w-14">
                            <Swords className="h-5 w-5 animate-pulse text-slate-300 sm:h-6 sm:w-6" />
                        </div>
                    </div>

                    <div className="flex flex-1 items-center gap-3 sm:gap-4">
                        <Monogram name={names[1]} gradient="from-rose-500 to-orange-400" />
                        <span className="truncate font-unbounded text-lg font-black uppercase tracking-tight text-white sm:text-2xl">
                            {names[1]}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative flex items-center gap-5 sm:gap-6">
                    <Monogram name={names[0]} gradient="from-blue-500 to-cyan-400" />
                    <div className="min-w-0">
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.4em] text-blue-300 backdrop-blur-md">
                            Объект идентификации
                        </span>
                        <h1 className="mt-1.5 truncate font-unbounded text-2xl font-black uppercase tracking-tighter text-white sm:text-4xl">
                            {names[0]}
                        </h1>
                        <div className="mt-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400">
                            <Sparkles className="h-3 w-3 text-cyan-300" />
                            Аналитический профиль ChaosAge
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
