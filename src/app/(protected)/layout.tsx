'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, User2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from '../../../public/logo.svg';
import icon from '../../../public/favicon.svg';
import UserMenu from '@/components/UserMenu';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
        <div className='flex h-screen bg-white'>
            {mobileSidebarOpen && (
                <div
                    className='fixed inset-0 z-40 bg-black/50 lg:hidden'
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            <aside
                className={cn(
                    'fixed lg:relative z-50 w-64 bg-white border-r transition-all duration-300 ease-in-out',
                    'transform lg:translate-x-0 h-full',
                    mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
                )}
            >
                <div className='flex items-center justify-between p-4 border-b h-16'>
                    {isSidebarOpen ? (
                        <div className='text-lg font-semibold text-gray-900 whitespace-nowrap'>
                            <Image
                                alt='Company Logo'
                                src={logo}
                                width={32}
                                height={32}
                                className='h-8 w-auto'
                            />
                        </div>
                    ) : (
                        <Image
                            src={icon}
                            height={20}
                            width={20}
                            alt='icon'
                            className=''
                        />
                    )}
                    <button
                        onClick={toggleSidebar}
                        className='hidden lg:flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    >
                        {isSidebarOpen ? (
                            <ChevronLeft size={20} />
                        ) : (
                            <ChevronRight size={20} />
                        )}
                    </button>
                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className='lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100'
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className='space-y-1 mt-4 p-2'>
                    <Link
                        href='/dashboard'
                        className={cn(
                            'flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100',
                            'transition-colors duration-200',
                            pathname === '/dashboard'
                                ? 'bg-[#0004E8]/10 text-[#0004E8] font-medium'
                                : '',
                            isSidebarOpen ? 'justify-start' : 'justify-center'
                        )}
                        title='Dashboard'
                    >
                        <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M4 6h16M4 12h16M4 18h16'
                            />
                        </svg>
                        {isSidebarOpen && (
                            <span className='ml-3'>Dashboard</span>
                        )}
                    </Link>

                    <Link
                        href='/subscriptions'
                        className={cn(
                            'flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100',
                            'transition-colors duration-200',
                            pathname === '/subscriptions'
                                ? 'bg-[#0004E8]/10 text-[#0004E8] font-medium'
                                : '',
                            isSidebarOpen ? 'justify-start' : 'justify-center'
                        )}
                        title='Subscriptions'
                    >
                        <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='2'
                                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                        {isSidebarOpen && (
                            <span className='ml-3'>Subscriptions</span>
                        )}
                    </Link>

                    <Link
                        href='/profile'
                        className={cn(
                            'flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100',
                            'transition-colors duration-200',
                            pathname === '/profile'
                                ? 'bg-[#0004E8]/10 text-[#0004E8] font-medium'
                                : '',
                            isSidebarOpen ? 'justify-start' : 'justify-center'
                        )}
                        title='Profile'
                    >
                        <User2 className='w-5 h-5' />
                        {isSidebarOpen && <span className='ml-3'>Profile</span>}
                    </Link>
                </nav>
            </aside>

            <div className='flex-1 flex flex-col overflow-hidden'>
                <header className='h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6'>
                    <div className='flex items-center'>
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className='lg:hidden p-2 mr-2 rounded-md text-gray-500 hover:bg-gray-100'
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className='text-xl font-semibold text-gray-900'></h1>
                    </div>

                    <div className='flex items-center space-x-4'>
                        <Link href='/upgrade'>
                            <Button className='bg-[#0052CC] hover:bg-[#0052CC]/80 text-white px-4 py-2 text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md'>
                                Upgrade
                            </Button>
                        </Link>

                        <UserMenu />
                    </div>
                </header>

                <main className='flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50'>
                    <div className='max-w-7xl mx-auto'>{children}</div>
                </main>
            </div>
        </div>
    );
}
