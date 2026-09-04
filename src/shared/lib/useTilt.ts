import type React from 'react';
import { useMotionTemplate, useMotionValue, useSpring } from 'motion/react';

interface TiltOptions {
    max?: number;   // максимальный угол наклона, градусы
    glare?: boolean;
}

/**
 * 3D-наклон элемента к позиции курсора + скользящий блик.
 * Возвращает пропсы для motion-элемента и стиль блика.
 */
export const useTilt = ({ max = 9 }: TiltOptions = {}) => {
    const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.4 });
    const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.4 });
    const glareX = useMotionValue(50);
    const glareY = useMotionValue(50);
    const glareBackground = useMotionTemplate`radial-gradient(200px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.16), transparent 60%)`;

    const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rotateY.set((px - 0.5) * 2 * max);
        rotateX.set(-(py - 0.5) * 2 * max);
        glareX.set(px * 100);
        glareY.set(py * 100);
    };

    const onMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        glareX.set(50);
        glareY.set(50);
    };

    return {
        tiltProps: {
            onMouseMove,
            onMouseLeave,
            style: { rotateX, rotateY, transformStyle: 'preserve-3d' as const },
        },
        glareBackground,
    };
};
