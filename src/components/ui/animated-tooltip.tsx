'use client';

import React, { useState } from 'react';
import {
    motion,
    useTransform,
    AnimatePresence,
    useMotionValue,
    useSpring,
} from 'framer-motion';
import Image from 'next/image';
import { User } from 'lucide-react';

export const AnimatedTooltip = ({
    items,
}: {
    items: {
        id: number;
        name: string;
        designation: string;
        image: string;
    }[];
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const springConfig = { stiffness: 100, damping: 5 };
    const x = useMotionValue(0);
    const rotate = useSpring(
        useTransform(x, [-100, 100], [-45, 45]),
        springConfig
    );
    const translateX = useSpring(
        useTransform(x, [-100, 100], [-50, 50]),
        springConfig
    );
    const handleMouseMove = (event: React.MouseEvent) => {
        const target = event.currentTarget as HTMLElement;
        const halfWidth = target.offsetWidth / 2;
        x.set(event.nativeEvent.offsetX - halfWidth);
    };

    // Only show first 3 items and a "+X" indicator if there are more
    const visibleItems = items.slice(0, 5);
    const remainingCount = items.length > 5 ? items.length - 5 : 0;

    return (
        <div
            className='flex items-center'
            title={`Shared with ${items.length} ${
                items.length === 1 ? 'person' : 'people'
            }`}
        >
            <div className='flex'>
                {visibleItems.map((item, index) => (
                    <div
                        className='group relative -mr-4 transition-all duration-300 hover:-translate-y-1'
                        key={item.id}
                        onMouseEnter={() => setHoveredIndex(item.id)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            zIndex: visibleItems.length - index,
                        }}
                    >
                        <AnimatePresence mode='wait'>
                            {hoveredIndex === item.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, scale: 0.6 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 10,
                                        },
                                    }}
                                    exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                    style={{
                                        translateX: translateX,
                                        rotate: rotate,
                                        whiteSpace: 'nowrap',
                                    }}
                                    className='absolute -top-16 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3 text-center shadow-xl'
                                >
                                    <div className='absolute inset-x-10 -bottom-px z-30 h-px w-1/5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent' />
                                    <div className='absolute -bottom-px left-10 z-30 h-px w-2/5 bg-gradient-to-r from-transparent via-sky-500 to-transparent' />
                                    <div className='absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-gray-900'></div>
                                    <div className='relative z-30 text-sm font-bold text-white'>
                                        {item.name}
                                    </div>
                                    <div className='text-xs text-gray-300'>
                                        {item.designation}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div
                            className='relative cursor-pointer overflow-hidden rounded-full border-2 border-white bg-gray-200 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-lg'
                            title={item.name}
                            onMouseMove={handleMouseMove}
                        >
                            {item.image ? (
                                <Image
                                    width={100}
                                    height={100}
                                    src={item.image}
                                    alt={item.name}
                                    className='h-8 w-8 object-cover object-center transition duration-500 group-hover:scale-110'
                                />
                            ) : (
                                <div className='flex h-8 w-8 items-center justify-center bg-gray-300'>
                                    <User
                                        size={20}
                                        className='text-gray-600'
                                    />
                                </div>
                            )}
                            <motion.div
                                className='absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20'
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {remainingCount > 0 && (
                <div className='relative z-0 ml-[6px] flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600 ring-2 ring-white transition-all duration-300 hover:-translate-y-1 hover:bg-gray-200 hover:shadow-md'>
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};
