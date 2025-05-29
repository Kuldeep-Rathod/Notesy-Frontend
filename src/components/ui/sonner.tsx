'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ position = 'top-center', ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme='light'
            position={position}
            className='toaster group'
            richColors
            style={
                {
                    '--normal-bg': '#ffffff',
                    '--normal-text': '#000000',
                    '--normal-border': '#e0e0e0',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };

