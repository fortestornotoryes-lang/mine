
import { CharacterParams } from '@/entities/character/model/types.ts';
import { MineDepletionData } from '@/entities/mine/model/types.ts';

/**
 * Определение типов для прокси-функций.
 */
type ProxyMapper = (url: string) => string;

const PROXY_LIST: ProxyMapper[] = [
    (url: string) => `https://cors-get-proxy.sirjosh.workers.dev/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Интерфейс для глобальных объектов в обход ограничений среды.
 */
interface GlobalEnv extends Window {
    // Исправление: используем any, так как AbortController может отсутствовать в глобальных типах
    AbortController: any;
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
}

const env = globalThis as unknown as GlobalEnv;

export class ChaosApiService {
    private static readonly BASE_URL = 'https://chaosage.ru/sAPI2.php';
    private static readonly DEPLETION_URL = 'https://chaosage.ru/sAPI.php';

    /**
     * Generic метод для выполнения типизированных запросов.
     * Исправление: возвращаем any, так как Promise может не определяться в старых средах.
     */
    private static async fetchViaProxy<T>(targetUrl: string): any {
        const urlWithCache = `${targetUrl}${targetUrl.indexOf('?') !== -1 ? '&' : '?'}_t=${Date.now()}`;

        const attemptFetch = async (proxyIndex: number, attempt: number): any => {
            const getProxyUrl = PROXY_LIST[proxyIndex];

            if (!getProxyUrl) {
                throw new Error('Сбой всех доступных сетевых шлюзов');
            }

            const proxyUrl = getProxyUrl(urlWithCache);
            // Исправление: используем env.AbortController
            const controller = new env.AbortController();
            const timeoutId = env.setTimeout(() => controller.abort(), 12000);

            try {
                // Исправление: используем fetch из globalThis
                const res = await (globalThis as any).fetch(proxyUrl, {
                    signal: controller.signal
                });

                env.clearTimeout(timeoutId);

                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

                const data = await res.json();

                // Бизнес-валидация для параметров персонажа
                if (targetUrl.indexOf('user_params') !== -1) {
                    // Исправление: используем any вместо Partial, если он недоступен
                    const params = data as any;
                    if (!params || !params.maxHP) {
                        throw new Error('Персонаж не найден в базе ChaosAge');
                    }
                }

                return data as T;
            } catch (error: unknown) {
                env.clearTimeout(timeoutId);

                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                if (errorMessage === 'Персонаж не найден в базе ChaosAge') throw error;

                // Логика повторных попыток
                if (attempt < 2) {
                    await new (globalThis as any).Promise((resolve: any) => env.setTimeout(resolve, 800));
                    return attemptFetch(proxyIndex, attempt + 1);
                } else {
                    return attemptFetch(proxyIndex + 1, 1);
                }
            }
        };

        return attemptFetch(0, 1);
    }

    // Исправление: возвращаем any для обхода ошибок Promise
    public static getCharacterParams(userName: string): any {
        if (!userName.trim()) return (globalThis as any).Promise.reject(new Error('Имя пользователя не может быть пустым'));
        const url = `${this.BASE_URL}?request=user_params&user_name=${encodeURIComponent(userName)}`;
        return this.fetchViaProxy<CharacterParams>(url);
    }

    public static getMineDepletion(mineId: number, level: number): any {
        const url = `${this.DEPLETION_URL}?request=mineDepletion&mine=${mineId}&level=${level}`;
        return this.fetchViaProxy<MineDepletionData>(url);
    }
}
