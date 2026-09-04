import { CharacterParams } from "@/entities/character/model/types";
import { ProgressBar }     from "@/entities/character/ui/ProgressBar";
import { StatRow }         from "@/entities/character/ui/StatRow";
import { SearchForm }      from "@/features/search-character/ui/SearchForm";
import { Card, type AccentKey } from "@/shared/ui/Card";
import { motion }          from "framer-motion";
import {
    Activity,
    Axe,
    Biohazard,
    Brain,
    Droplets,
    Flame,
    FlaskConical, HeartPulse,
    Move,
    RefreshCw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    ShieldX,
    Skull,
    Sparkles,
    Star,
    Sword,
    Swords,
    Target,
    Timer,
    Wind,
    Zap,
} from "lucide-react";
import React, { useMemo }  from "react";

import { useTilt }            from "@/shared/lib/useTilt";

import { useCharacterSearch } from "../model/useCharacterSearch";
import { CharacterProfile }   from "./CharacterProfile";

/**
 * Хелперы для конфига
 */
const toPercent     = (v: string) => `${(parseFloat(v) || 0)}%`;
const toManaSavings = (v: string) => `${((parseFloat(v) || 0) * 100).toFixed(1)}%`;
const toMana        = (v: string) => `-${(parseFloat(v) || 0).toFixed(1)}%`;
const toFactor      = (v: string) => `${((parseFloat(v) || 0) * 100).toFixed(0)}%`;

/**
 * Описание типа для конфига
 */
interface StatConfig {
    key: keyof CharacterParams;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    formatter?: (c: CharacterParams) => string; // Если нужно комбинировать поля (напр. урон)
    valueFormatter?: (v: string) => string;     // Если нужно просто изменить одно значение (напр. % или фактор)
}

const STAT_GROUPS: { title: string; accent: AccentKey; icon: React.ReactNode; color: string; textColor: string; stats: StatConfig[] }[] = [
    {
        title:     "Атака",
        accent:    "orange",
        icon:      <Sword />,
        color:     "border-orange-500/50",
        textColor: "text-orange-700",
        stats:     [
            {
                key:   "attack",
                label: "Атака",
                icon:  <Sword className="text-orange-400" />,
            },
            {
                key:       "minDamage",
                label:     "Урон",
                icon:      <Swords className="text-red-400" />,
                formatter: (c) => `${c.minDamage} — ${c.maxDamage}`,
            },
            {
                key:            "bleedingChance",
                label:          "Шанс. кровот",
                icon:           <Droplets className="text-red-600" />,
                valueFormatter: toPercent,
            },
            {
                key:   "critical",
                label: "Крит. Шанс",
                icon:  <Target className="text-yellow-500" />,
            },
            {
                key:            "criticalDamage",
                label:          "Крит. Урон",
                icon:           <Zap className="text-yellow-400" />,
                valueFormatter: toPercent,
            },
            {
                key:   "pierce",
                label: "Пробой брони",
                icon:  <Axe className="text-cyan-400" />,
            },
            {
                key:   "fastness",
                label: "Устойчивость",
                icon:  <ShieldAlert className="text-emerald-500" />,
            },
            {
                key:   "reaction",
                label: "Реакция",
                icon:  <Timer className="text-blue-400" />,
            },
            {
                key:   "rage_gain",
                label: "Стартовая ярость",
                icon:  <Flame className="text-orange-600" />,
            },
            {
                key: "vamp_magical",
                label: "Магический вампиризм",
                icon: <Droplets className="text-blue-400" />, // Синие капли (кража маны/жизни магией)
                valueFormatter: toPercent,
            },
            {
                key: "vamp_physical",
                label: "Физический вампиризм",
                icon: <HeartPulse className="text-red-500" />, // Пульсация сердца (кража жизни ударом)
                valueFormatter: toPercent,
            },
            {
                key: "dualHit",
                label: "Двойной удар",
                icon: <Swords className="text-slate-300" />, // Два меча (символ парного оружия или доп. атаки)
                valueFormatter: toPercent,
            },
            {
                key: "armorShieldAuxDamage",
                label: "Урон физ. щита",
                icon: <ShieldAlert className="text-orange-400" />, // Щит с предупреждением (контратака/урон)
                valueFormatter: toPercent,
            },
        ],
    },
    {
        title:     "Защита",
        accent:    "emerald",
        icon:      <ShieldCheck />,
        color:     "border-emerald-500/50",
        textColor: "text-emerald-700",

        stats: [
            {
                key:   "defence",
                label: "Защита",
                icon:  <ShieldCheck className="text-emerald-500" />,
            },

            {
                key:       "armor",
                label:     "Броня ( Щит )",
                icon:      <Shield className="text-blue-500" />,
                formatter: (c) => `${c.armor} ( ${c.armorShield} )`,

            },
            {
                key:       "resistance",
                label:     "Сопротивление ( Щит )",
                icon:      <Sparkles className="text-purple-400" />,
                formatter: (c) => `${c.armorShield} ( ${c.resistanceShield} )`,

            },


            {
                key:            "absorbtion",
                label:          "Поглощение урона",
                icon:           <RefreshCw className="text-indigo-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "reflectionResist",
                label:          "Сопр. отражению",
                icon:           <RefreshCw className="text-indigo-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "poisonResist",
                label:          "Сопр. врем. эффектам",
                icon:           <Biohazard className="text-emerald-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "poisonResist_pierce",
                label:          "Пробой яда",
                icon:           <Wind className="text-emerald-600" />,
                valueFormatter: toPercent,
            },

            {
                key:   "parry",
                label: "Парирование",
                icon:  <Swords className="text-slate-400" />,
            },

            {
                key:            "resistance_pierce_abs",
                label:          "Абс. сопр. пробою",
                icon:           <ShieldX className="text-rose-400" />,
                valueFormatter: toPercent,
            },
            {
                key:   "evasion",
                label: "Уклонение",
                icon:  <Move className="text-cyan-400" />,
            },
            {
                key:            "reflectionPhysical",
                label:          "Уклонение от ударов",
                icon:           <ShieldX className="text-rose-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "reflectionMagic",
                label:          "Уклонение от магии",
                icon:           <ShieldX className="text-rose-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "shieldBlock",
                label:          "Блок щитом",
                icon:           <ShieldX className="text-rose-400" />,
                valueFormatter: toPercent,
            },
            {
                key:            "resistanceShieldAuxDamage",
                label:          "Доп. урон щита",
                icon:           <Zap className="text-purple-300" />,
                valueFormatter: toPercent,
            },
        ],
    },
    {
        title:     "Магия",
        accent:    "red",
        icon:      <Flame />,
        color:     "border-red-500/50",
        textColor: "text-red-700",

        stats: [
            { key: "charmFactor", label: "Заклинатель", icon: <Brain />, valueFormatter: toFactor },
            { key: "damageFactor", label: "Разрушитель", icon: <Flame />, valueFormatter: toFactor },
            { key: "summonFactor", label: "Призыватель", icon: <Skull />, valueFormatter: toFactor },
            { key: "defiler", label: "Осквернитель", icon: <Biohazard />, valueFormatter: toFactor },
            { key: "faith", label: "Вера", icon: <Activity /> },
        ],
    },
    {
        title:     "Сохранение маны",
        accent:    "blue",
        icon:      <Droplets />,
        color:     "border-blue-500/50",
        textColor: "text-blue-700",

        stats: [
            { key: "manaExpDecrease_elem", label: "Стихии", icon: <Flame />, valueFormatter: toManaSavings },
            { key: "manaExpDecrease_mind", label: "Разум", icon: <Brain />, valueFormatter: toManaSavings },
            { key: "manaExpDecrease_light", label: "Свет", icon: <Star />, valueFormatter: toManaSavings },
            { key: "manaExpDecrease_dark", label: "Тьма", icon: <Skull />, valueFormatter: toManaSavings },
            { key: "manaExpDecrease_faith", label: "Вера", icon: <Activity />, valueFormatter: toManaSavings },
            { key:              "manaExpDecrease_plague",
                label:          "Осквернитель",
                icon:           <Biohazard />,
                valueFormatter: toManaSavings,
            },
            { key: "manaExpDecrease_alch", label: "Алхимия", icon: <FlaskConical />, valueFormatter: toManaSavings },
        ],
    },
    {
        title:     "Алхимия",
        accent:    "amber",
        icon:      <FlaskConical />,
        color:     "border-amber-500/50",
        textColor: "text-amber-700",

        stats: [
            { key: "alchemyDamageFactor", label: "Урон алхим. зелий", icon: <Flame />, valueFormatter: toManaSavings },
            { key:              "alchemyReactionsPower",
                label:          "Сила алхим. реакций",
                icon:           <Brain />,
                valueFormatter: toManaSavings,
            },
            { key: "alchemyCharmFactor", label: "alchemyCharmFactor", icon: <Star />, valueFormatter: toManaSavings },
            { key:              "alchemyPotionsSaveChance",
                label:          "Экономия алхим. зелий",
                icon:           <Skull />,
                valueFormatter: toManaSavings,
            },
            { key:              "manaExpDecrease_faith",
                label:          "manaExpDecrease_faith",
                icon:           <Activity />,
                valueFormatter: toManaSavings,
            },
            { key:              "manaExpDecrease_plague",
                label:          "manaExpDecrease_plague",
                icon:           <Biohazard />,
                valueFormatter: toManaSavings,
            },
            { key:              "manaExpDecrease_alch",
                label:          "Сохранения маны на банках",
                icon:           <FlaskConical />,
                valueFormatter: toManaSavings,
            },

        ],
    },
    {
        title:     "Призыв",
        accent:    "purple",
        icon:      <Skull />,
        color:     "border-purple-500/50",
        textColor: "text-purple-700",

        stats: [
            { key: "summons_ap_start", label: "Старт од у призыва", icon: <Flame /> },
            { key:              "summons_ap_perc",
                label:          "Минус процентного од у призыва",
                icon:           <Brain />,
                valueFormatter: toPercent,
            },
            { key: "summons_ap_abs", label: "Минус од у призыва", icon: <Star /> },

        ],
    },
];

const HANDLED_KEYS = new Set([
    "maxHP", "maxMP", "recoveryHP", "recoveryMP", "name", "maxDamage", "armorShield", "maxWeight", "currentWeight", "rage", "currentHP", "currentMP", "maxAP", "currentMP", "resistanceShield", "baseAP", "baseAP", "baseAP",
    ...STAT_GROUPS.flatMap(g => g.stats.map(s => s.key)),
]);

export const CharacterViewer: React.FC = () => {
    const { chars, isLoading, error, searchCharacters } = useCharacterSearch();

    const viewData = useMemo(() => {
        if (!chars || chars.length === 0) return null;
        const c1          = chars[0].data;
        const c2          = chars[1]?.data || null;
        const isCompare   = !!c2;
        const charNames   = chars.map(c => c.name) as [string, string];
        const allKeys     = Object.keys(c1) as (keyof CharacterParams)[];
        const unknownKeys = allKeys.filter(k => !HANDLED_KEYS.has(k));

        return { c1, c2, isCompare, charNames, unknownKeys };
    }, [chars]);

    const determineBetter = (v1: any, v2: any, lower = false) => {
        if (!v1 || !v2) return "none";
        const n1 = parseFloat(String(v1).replace(/[^0-9.-]/g, "")) || 0;
        const n2 = parseFloat(String(v2).replace(/[^0-9.-]/g, "")) || 0;
        if (n1 === n2) return "none";
        return (lower ? n1 < n2 : n1 > n2) ? "first" : "second";
    };

    if (!viewData) return <InitialState onSearch={searchCharacters} isLoading={isLoading} />;

    const { c1, c2, isCompare, charNames, unknownKeys } = viewData;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative space-y-6 max-w-[1600px] mx-auto px-4 pb-24">
            {/* Атмосферный фон для эффекта стекла */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-20 top-10 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-[130px]" />
                <div className="absolute right-0 top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-600/20 blur-[130px]" />
                <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-500/10 blur-[130px]" />
                <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '44px 44px',
                    }}
                />
            </div>

            <div className="max-w-3xl mx-auto"><SearchForm onSearch={searchCharacters} isLoading={isLoading} /></div>

            <CharacterProfile names={chars.map(c => c.name)} isCompare={isCompare} />

            <HeroHighlights c1={c1} c2={c2} charNames={charNames} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {STAT_GROUPS.map(group => (
                            <Card key={group.title} title={group.title} accent={group.accent} icon={group.icon}>
                                {group.stats.map(stat => {
                                    // Логика получения значения: formatter (весь объект) > valueFormatter (поле) > сырое значение
                                    const val1 = stat.formatter ? stat.formatter(c1) : (stat.valueFormatter ? stat.valueFormatter(c1[stat.key]) : c1[stat.key]);
                                    const val2 = c2 ? (stat.formatter ? stat.formatter(c2) : (stat.valueFormatter ? stat.valueFormatter(c2[stat.key]) : c2[stat.key])) : undefined;

                                    return (
                                        <StatRow
                                            key={stat.key}
                                            label={stat.label}
                                            color={group.textColor}
                                            icon={stat.icon}
                                            value={val1}
                                            compareValue={val2}
                                            better={determineBetter(c1[stat.key], c2?.[stat.key])}
                                            charNames={charNames}
                                        />
                                    );
                                })}
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card title="Главное" accent="red" icon={<HeartPulse />}>
                        <ProgressBar label="HP" current={parseInt(c1.currentHP)} max={parseInt(c1.maxHP)}
                                     color="bg-red-500" compareCurrent={c2 ? parseInt(c2.currentHP) : undefined}
                                     compareMax={c2 ? parseInt(c2.maxWeight) : undefined} />
                        <StatRow label="Регенерация HP" value={c1.recoveryHP} compareValue={c2?.recoveryHP}
                                 icon={<RefreshCw className="h-3 w-3" />} charNames={charNames} />
                        <div className="h-6" />
                        <ProgressBar label="MP" current={parseInt(c1.currentMP)} max={parseInt(c1.maxMP)}
                                     color="bg-blue-500" compareCurrent={c2 ? parseInt(c2.currentMP) : undefined}
                                     compareMax={c2 ? parseInt(c2.maxWeight) : undefined} />
                        <StatRow label="Регенерация MP" value={c1.recoveryMP} compareValue={c2?.recoveryMP}
                                 icon={<RefreshCw className="h-3 w-3" />} charNames={charNames} />
                        <div className="h-px w-full bg-slate-800 my-4"></div>
                        <StatRow label="ОД на действие" value={c1.baseAP} compareValue={c2?.baseAP}
                                 charNames={charNames} />
                        <StatRow label="Стартовый ОД" value={c1.ap_start} compareValue={c2?.ap_start}
                                 charNames={charNames} />
                        <StatRow label="Базовый ОД" value={c1.maxAP} compareValue={c2?.maxAP} charNames={charNames} />
                        <div className="h-px w-full bg-slate-800 my-4"></div>
                        <ProgressBar
                            label="Вес"
                            current={parseInt(c1.currentWeight)}
                            max={parseInt(c1.maxWeight)}
                            color="bg-slate-500" // Для веса обычно используют нейтральный цвет
                            compareCurrent={c2 ? parseInt(c2.currentWeight) : undefined}
                            compareMax={c2 ? parseInt(c2.maxWeight) : undefined} // Важно добавить и это
                        />
                    </Card>

                    {unknownKeys.length > 0 && (
                        <Card title="Доп. сигнатуры" accent="pink" className="opacity-70">
                            <div className="space-y-1">
                                {unknownKeys.map(key => (
                                    <StatRow key={key} label={String(key)} value={c1[key]} compareValue={c2?.[key]}
                                             charNames={charNames} />
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const HIGHLIGHTS: { key: keyof CharacterParams; label: string; icon: React.ReactNode; glow: string; text: string }[] = [
    { key: "attack",  label: "Атака",    icon: <Sword className="h-4 w-4" />,       glow: "bg-orange-500/25",  text: "text-orange-300" },
    { key: "defence", label: "Защита",   icon: <ShieldCheck className="h-4 w-4" />, glow: "bg-emerald-500/25", text: "text-emerald-300" },
    { key: "maxHP",   label: "Здоровье", icon: <HeartPulse className="h-4 w-4" />,  glow: "bg-rose-500/25",    text: "text-rose-300" },
    { key: "maxMP",   label: "Мана",     icon: <Droplets className="h-4 w-4" />,    glow: "bg-blue-500/25",    text: "text-blue-300" },
];

const KpiTile: React.FC<{ h: (typeof HIGHLIGHTS)[number]; i: number; v1: number; v2: number | null; otherName: string }> = ({ h, i, v1, v2, otherName }) => {
    const { tiltProps, glareBackground } = useTilt({ max: 12 });
    return (
        <div className="[perspective:900px]">
            <motion.div
                {...tiltProps}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.3, ease: "easeOut" }}
                className="group/kpi relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-colors duration-500 will-change-transform hover:border-white/20"
            >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.10] to-transparent" />
                <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100" style={{ background: glareBackground }} />
                <div className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-3xl transition-opacity duration-500 group-hover/kpi:opacity-80 ${h.glow}`} />
                <div className="relative flex items-center gap-2">
                    <span className={`grid h-6 w-6 place-items-center rounded-lg border border-white/10 bg-white/5 ${h.text}`}>{h.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{h.label}</span>
                </div>
                <div className="relative mt-2 flex items-baseline gap-2">
                    <span className="font-unbounded text-xl font-black text-white">{v1.toLocaleString()}</span>
                    {v2 !== null && (
                        <span
                            className={`font-unbounded text-xs font-black ${
                                v1 === v2 ? "text-slate-500" : v1 > v2 ? "text-emerald-400" : "text-rose-400"
                            }`}
                            title={`${otherName}: ${v2.toLocaleString()}`}
                        >
                            {v1 === v2 ? "=" : `${v1 > v2 ? "+" : ""}${(v1 - v2).toLocaleString()}`}
                        </span>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const HeroHighlights: React.FC<{ c1: CharacterParams; c2: CharacterParams | null; charNames: [string, string] }> = ({ c1, c2, charNames }) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HIGHLIGHTS.map((h, i) => {
            const v1 = parseFloat(String(c1[h.key]).replace(/[^0-9.-]/g, "")) || 0;
            const v2 = c2 ? parseFloat(String(c2[h.key]).replace(/[^0-9.-]/g, "")) || 0 : null;
            return <KpiTile key={h.key} h={h} i={i} v1={v1} v2={v2} otherName={charNames[1]} />;
        })}
    </div>
);

const InitialState = ({ onSearch, isLoading }: { onSearch: (n: string[]) => void, isLoading: boolean }) => (
    <div className="max-w-3xl mx-auto px-4 py-10">
        <SearchForm onSearch={onSearch} isLoading={isLoading} />
        <div className="mt-24 flex flex-col items-center opacity-20">
            <Shield className="h-24 w-24 animate-pulse mb-8 text-slate-500" />
            <p className="font-unbounded text-[10px] tracking-[0.5em] uppercase text-center text-slate-400">Аналитический
                модуль ChaosAge</p>
        </div>
    </div>
);