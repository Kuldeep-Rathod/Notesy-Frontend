// components/SidebarLink.tsx
import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinkProps {
    href: string;
    title: string;
    icon: React.ReactNode;
    isSidebarOpen: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
    href,
    title,
    icon,
    isSidebarOpen,
}) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Link
                        href={href}
                        className={cn(
                            'flex items-center p-3 rounded-full text-gray-700 hover:bg-[#3b83f618] transition-colors duration-200',
                            isActive
                                ? 'bg-[#3b83f618] text-[#156ffff6] font-medium'
                                : '',
                            isSidebarOpen ? 'justify-start' : 'justify-center'
                        )}
                    >
                        <span className='w-5 h-5'>{icon}</span>
                        {isSidebarOpen && <span className='ml-3'>{title}</span>}
                    </Link>
                </Tooltip.Trigger>
                {!isSidebarOpen && (
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side='right'
                            sideOffset={10}
                            className='z-50 px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md shadow-sm animate-in fade-in-0 zoom-in-95'
                        >
                            {title}
                            <Tooltip.Arrow className='fill-gray-600' />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                )}
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default SidebarLink;
