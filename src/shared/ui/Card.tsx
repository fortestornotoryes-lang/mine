
import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import { useTilt } from '@/shared/lib/useTilt';

/**
 * Палитра акцентов карточек. Классы прописаны литерально —
 * иначе Tailwind не соберёт их при сканировании исходников.
 */
const ACCENTS = {
    blue:    { bar: 'from-blue-400/70',    text: 'text-blue-300',    dot: 'bg-blue-400',    ring: 'group-hover/card:border-blue-400/25',    glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(59,130,246,0.6)]',  aura: 'bg-blue-500/20' },
    orange:  { bar: 'from-orange-400/70',  text: 'text-orange-300',  dot: 'bg-orange-400',  ring: 'group-hover/card:border-orange-400/25',  glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(249,115,22,0.6)]',  aura: 'bg-orange-500/20' },
    emerald: { bar: 'from-emerald-400/70', text: 'text-emerald-300', dot: 'bg-emerald-400', ring: 'group-hover/card:border-emerald-400/25', glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(16,185,129,0.6)]',  aura: 'bg-emerald-500/20' },
    red:     { bar: 'from-rose-400/70',    text: 'text-rose-300',    dot: 'bg-rose-400',    ring: 'group-hover/card:border-rose-400/25',    glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(244,63,94,0.6)]',   aura: 'bg-rose-500/20' },
    violet:  { bar: 'from-violet-400/70',  text: 'text-violet-300',  dot: 'bg-violet-400',  ring: 'group-hover/card:border-violet-400/25',  glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(139,92,246,0.6)]',  aura: 'bg-violet-500/20' },
    amber:   { bar: 'from-amber-400/70',   text: 'text-amber-300',   dot: 'bg-amber-400',   ring: 'group-hover/card:border-amber-400/25',   glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(245,158,11,0.6)]',  aura: 'bg-amber-500/20' },
    purple:  { bar: 'from-purple-400/70',  text: 'text-purple-300',  dot: 'bg-purple-400',  ring: 'group-hover/card:border-purple-400/25',  glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(168,85,247,0.6)]',  aura: 'bg-purple-500/20' },
    pink:    { bar: 'from-pink-400/70',    text: 'text-pink-300',    dot: 'bg-pink-400',    ring: 'group-hover/card:border-pink-400/25',    glow: 'group-hover/card:shadow-[0_25px_70px_-25px_rgba(236,72,153,0.5)]',  aura: 'bg-pink-500/20' },
} as const;

export type AccentKey = keyof typeof ACCENTS;

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    accent?: AccentKey;
}

/**
 * Стеклянная карточка (glassmorphism) с 3D-наклоном к курсору:
 * при наведении на угол карточка разворачивается в перспективе,
 * по поверхности скользит блик.
 */
export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, icon, accent = 'blue' }) => {
    const a = ACCENTS[accent] ?? ACCENTS.blue;
    const { tiltProps, glareBackground } = useTilt({ max: 9 });

    return (
        <div className="[perspective:1200px]">
            <motion.div
                {...tiltProps}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={cn(
                    'group/card relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]',
                    'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)]',
                    'backdrop-blur-2xl transition-[box-shadow,border-color] duration-500 will-change-transform',
                    a.ring,
                    a.glow,
                    className,
                )}
            >
                {/* Диагональный стеклянный блик */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] via-transparent to-transparent" />
                {/* Блик, следящий за курсором */}
                <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                    style={{ background: glareBackground }}
                />
                {/* Верхняя световая кромка с акцентом */}
                <div className={cn('pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r to-transparent', a.bar)} />
                {/* Цветная аура */}
                <div className={cn('pointer-events-none absolute -right-20 -top-24 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover/card:opacity-50', a.aura)} />

                {title && (
                    <div className="relative flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3.5">
                        {icon ? (
                            <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 [&>svg]:h-3.5 [&>svg]:w-3.5', a.text)}>
                                {icon}
                            </span>
                        ) : (
                            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', a.dot)} />
                        )}
                        <div className="min-w-0">
                            <h3 className="truncate text-[10px] font-black uppercase tracking-[0.25em] text-slate-200">{title}</h3>
                            {subtitle && (
                                <p className="truncate text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="relative p-4">{children}</div>
            </motion.div>
        </div>
    );
};
