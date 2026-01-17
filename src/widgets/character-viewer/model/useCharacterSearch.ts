import { useState, useCallback } from 'react';
import { ChaosApiService } from '@/shared/api/chaosApi'; // Используем алиасы из твоего конфига
import { CharacterParams } from '@/entities/character/model/types';

export interface CharacterState {
    name: string;
    data: CharacterParams;
}

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
                const data = await ChaosApiService.getCharacterParams(name);
                return { name, data };
            });

            const results = await Promise.all(promises);
            setChars(results);
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
    }, []);

    return {
        chars,
        isLoading,
        error,
        searchCharacters,
        clearCharacters
    };
};