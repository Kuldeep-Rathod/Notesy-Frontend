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
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <Link
                        href={href}
                        className={cn(
                            'flex items-center p-3 rounded-lg text-slate-600 hover:bg-indigo-50 transition-all duration-200',
                            'group relative overflow-hidden',
                            isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'hover:text-indigo-500',
                            isSidebarOpen
                                ? 'w-full justify-start gap-3'
                                : 'w-10 justify-center'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span
                            className={cn(
                                'w-5 h-5 flex-shrink-0',
                                isActive
                                    ? 'text-indigo-600'
                                    : 'text-slate-500 group-hover:text-indigo-500'
                            )}
                        >
                            {icon}
                        </span>

                        {isSidebarOpen && (
                            <span
                                className={cn(
                                    'transition-opacity duration-200',
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                )}
                            >
                                {title}
                            </span>
                        )}

                        {/* Active indicator */}
                        {isActive && (
                            <span
                                className='absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600'
                                aria-hidden='true'
                            />
                        )}
                    </Link>
                </Tooltip.Trigger>

                {!isSidebarOpen && (
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side='right'
                            sideOffset={8}
                            className={cn(
                                'z-50 px-3 py-1.5 text-sm font-medium rounded-md shadow-md',
                                'bg-slate-800 text-white',
                                'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
                            )}
                        >
                            {title}
                            <Tooltip.Arrow className='fill-slate-800' />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                )}
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default SidebarLink;
