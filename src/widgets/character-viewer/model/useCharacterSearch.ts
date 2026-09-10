import { useState, useCallback, useEffect, useRef } from 'react';
import { ChaosApiService } from '@/shared/api/chaosApi'; // Используем алиасы из твоего конфига
import { CharacterInfo, CharacterParams } from '@/entities/character/model/types';

export interface CharacterState {
    name: string;
    data: CharacterParams;
    info: CharacterInfo | null;
}

const LS_KEY = 'chaosage:lastSearch';

const readLastSearch = (): string[] => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((n): n is string => typeof n === 'string' && !!n.trim()) : [];
    } catch {
        return [];
    }
};

const writeLastSearch = (names: string[]) => {
    try {
        if (names.length) localStorage.setItem(LS_KEY, JSON.stringify(names));
        else localStorage.removeItem(LS_KEY);
    } catch {
        /* localStorage может быть недоступен (приватный режим) — молча игнорируем */
    }
};

/**
 * Хук для поиска и управления состоянием персонажей.
 */
export const useCharacterSearch = () => {
    const [chars, setChars] = useState<CharacterState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchCharacters = useCallback(async (names: string[]): Promise<CharacterState[]> => {
        if (!names.length) {
            setChars([]);
            return [];
        }

        setIsLoading(true);
        setError(null);

        try {
            const promises = names.map(async (name) => {
                const [data, info] = await Promise.all([
                    ChaosApiService.getCharacterParams(name),
                    // Публичный профиль опционален — его сбой не должен ронять основную загрузку
                    ChaosApiService.getCharacterInfo(name).catch(() => null),
                ]);
                return { name, data, info };
            });

            const results = await Promise.all(promises);
            setChars(results);
            writeLastSearch(results.map((r) => r.name));
            return results;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ошибка загрузки данных';
            setError(message);
            // В Senior-коде мы либо обрабатываем ошибку, либо пробрасываем типизированный Error
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearCharacters = useCallback(() => {
        setChars([]);
        setError(null);
        writeLastSearch([]);
    }, []);

    // При открытии / перезагрузке страницы — восстанавливаем последний успешный поиск
    const restoredRef = useRef(false);
    useEffect(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;

        const last = readLastSearch();
        if (last.length) {
            searchCharacters(last).catch(() => {
                /* ошибку покажет состояние error, LS не трогаем */
            });
        }
    }, [searchCharacters]);

    return {
        chars,
        isLoading,
        error,
        searchCharacters,
        clearCharacters
    };
};
