import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения Tailwind-классов с разрешением конфликтов.
 * Позволяет писать: cn('base-class', isTrue && 'active-class', className)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}