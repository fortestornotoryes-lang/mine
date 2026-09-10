import { CharacterAttribute, CharacterInfo } from '@/entities/character/model/types';

/**
 * Порядок меток в блоке <div name="params"> страницы showInfo.php.
 * Значение поля — это текст между его меткой и меткой следующего известного поля.
 */
const LABELS = [
    'Раса', 'Уровень', 'Дата регистрации', 'Побед', 'Поражений',
    'Гильдия', 'Профессия', 'Клан', 'Религия', 'Фракция', 'Рефералов',
    'Сила', 'Телосложение', 'Ловкость', 'Интеллект', 'Выносливость', 'Воля',
    'Здоровье', 'Мана', 'Временные эффекты', 'Сейчас находится',
] as const;

const toNum = (v: string): number => {
    const n = parseInt(String(v).replace(/[^\d-]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
};

/** «Джинн(48)» -> { name: 'Джинн', level: 48 } */
const parseNameLevel = (raw: string): { name: string; level: number } => {
    const m = raw.match(/^\s*(.+?)\s*\((\d+)\)\s*$/);
    return m ? { name: m[1].trim(), level: toNum(m[2]) } : { name: raw.trim(), level: 0 };
};

/** «26(5+21)» -> { total: 26, base: 5, bonus: 21 } */
const parseAttr = (raw: string): CharacterAttribute => {
    const m = raw.match(/(-?\d+)\s*\(\s*(-?\d+)\s*\+\s*(-?\d+)\s*\)/);
    if (m) return { total: toNum(m[1]), base: toNum(m[2]), bonus: toNum(m[3]) };
    const n = toNum(raw);
    return { total: n, base: n, bonus: 0 };
};

/**
 * Разбирает HTML публичного профиля персонажа (showInfo.php).
 */
export const parseCharacterInfo = (html: string): CharacterInfo => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const params = doc.querySelector('[name="params"]');
    const text = (params?.textContent || html)
        .replace(/ /g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const fields: Record<string, string> = {};
    LABELS.forEach((label, i) => {
        const start = text.indexOf(`${label}:`);
        if (start === -1) return;
        const valStart = start + label.length + 1;
        let end = text.length;
        for (let j = i + 1; j < LABELS.length; j++) {
            const next = text.indexOf(`${LABELS[j]}:`, valStart);
            if (next !== -1) { end = next; break; }
        }
        fields[label] = text.slice(valStart, end).trim();
    });

    const race = parseNameLevel(fields['Раса'] || '');
    const profession = parseNameLevel(fields['Профессия'] || '');

    return {
        race: race.name,
        raceLevel: race.level,
        level: toNum(fields['Уровень'] || ''),
        profession: profession.name,
        professionLevel: profession.level,
        guild: fields['Гильдия'] || undefined,
        clan: fields['Клан'] || undefined,
        religion: fields['Религия'] || undefined,
        faction: fields['Фракция'] || undefined,
        location: fields['Сейчас находится'] || undefined,
        registeredAt: fields['Дата регистрации'] || undefined,
        wins: fields['Побед'] !== undefined ? toNum(fields['Побед']) : undefined,
        losses: fields['Поражений'] !== undefined ? toNum(fields['Поражений']) : undefined,
        attributes: {
            strength:     parseAttr(fields['Сила'] || ''),
            constitution: parseAttr(fields['Телосложение'] || ''),
            dexterity:    parseAttr(fields['Ловкость'] || ''),
            intelligence: parseAttr(fields['Интеллект'] || ''),
            endurance:    parseAttr(fields['Выносливость'] || ''),
            will:         parseAttr(fields['Воля'] || ''),
        },
    };
};
