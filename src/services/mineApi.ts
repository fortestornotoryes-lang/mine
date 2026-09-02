
import { MineData } from '../types';

/**
 * Список публичных CORS-прокси для обеспечения отказоустойчивости.
 * Если один упадет или будет тормозить, попробуем другой.
 */
const PROXY_LIST = [
  (url: string) => `https://cors-get-proxy.sirjosh.workers.dev/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Получает данные о шахте с механизмом повторных попыток и перебором прокси.
 */
export async function fetchMineData(mineId: number, level: number): Promise<MineData> {
  // Добавляем timestamp для обхода кэширования на стороне прокси
  const targetUrl = `https://chaosage.ru/sAPI.php?request=mineDepletion&mine=${mineId}&level=${level}&_cache=${Date.now()}`;
  
  let lastError: Error | null = null;

  // Пробуем каждый прокси из списка
  for (const getProxyUrl of PROXY_LIST) {
    const proxyUrl = getProxyUrl(targetUrl);
    
    // Делаем до 2 попыток на каждый прокси
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Попытка ${attempt} через ${new URL(proxyUrl).hostname}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Таймаут 8 секунд

        const response = await fetch(proxyUrl, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Проверка на пустой или некорректный ответ (иногда прокси возвращают мусор)
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          return data as MineData;
        } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
          // Если пришел пустой объект {}, возможно это корректный ответ для пустой шахты,
          // но в контексте жалоб пользователя - скорее всего ошибка парсинга или пустой ответ сервера.
          return data as MineData;
        }
        
        throw new Error('Некорректный формат JSON');
      } catch (error: any) {
        lastError = error;
        console.warn(`Ошибка при попытке ${attempt}: ${error.message}`);
        
        // Пауза перед следующей попыткой
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }
  
  throw lastError || new Error('Все доступные шлюзы (прокси) не смогли получить данные от сервера');
}
