// components/SidebarLink.tsx
import { cn } from '@/lib/utils';
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
        <Link
            href={href}
            className={cn(
                'flex items-center p-3 rounded-full text-gray-700 hover:bg-[#3b83f618] transition-colors duration-200',
                isActive ? 'bg-[#3b83f618] text-[#156ffff6] font-medium' : '',
                isSidebarOpen ? 'justify-start' : 'justify-center'
            )}
            title={title}
        >
            <span className='w-5 h-5'>{icon}</span>
            {isSidebarOpen && <span className='ml-3'>{title}</span>}
        </Link>
    );
};

export default SidebarLink;
