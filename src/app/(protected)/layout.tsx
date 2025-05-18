'use client';

import SidebarLink from '@/components/SidebarLink';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import { cn } from '@/lib/utils';
import { useGetLabelsQuery } from '@/redux/api/labelsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import AuthGuard from '@/utils/authGuard';
import { axiosInstance } from '@/utils/axiosInstance';
import { getAuth } from 'firebase/auth';
import {
    Archive,
    Bell,
    ChartPie,
    ChevronLeft,
    ChevronRight,
    CircleUserRound,
    LayoutDashboard,
    Menu,
    Pencil,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { default as icon, default as logo } from '../../../public/logo.svg';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: labelsData = [], isLoading } = useGetLabelsQuery();
    const { data: DbUser } = useGetCurrentUserQuery();

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const handleManagePlan = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                toast.error('User not authenticated');
                return;
            }

            const idToken = await user.getIdToken(); // ✅ await here

            const res = await axiosInstance.post(
                '/pay/create-portal-session',
                {}, // no body needed
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            window.location.href = res.data.url;
        } catch (err) {
            console.error('Error redirecting to Stripe portal:', err);
            toast.error('Error redirecting to Stripe portal');
        }
    };

    return (
        <AuthGuard>
            <div className='flex h-screen bg-white overflow-hidden'>
                {mobileSidebarOpen && (
                    <div
                        className='fixed inset-0 z-40 bg-black/50 lg:hidden'
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}
                <aside
                    className={cn(
                        'fixed lg:relative z-50 w-64 bg-white border-r transition-all duration-300 ease-in-out flex flex-col',
                        'transform lg:translate-x-0 h-full',
                        mobileSidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full',
                        isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
                    )}
                >
                    <div className='flex items-center justify-between p-4 border-b h-16 flex-shrink-0'>
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

                    <nav className='flex-1 overflow-y-auto p-2'>
                        <div className='space-y-1'>
                            <SidebarLink
                                href='/dashboard'
                                title='Dashboard'
                                isSidebarOpen={isSidebarOpen}
                                icon={<LayoutDashboard className='w-5 h-5' />}
                            />

                            <SidebarLink
                                href='/reminders'
                                title='Reminders'
                                isSidebarOpen={isSidebarOpen}
                                icon={<Bell className='w-5 h-5' />}
                            />

                            {labelsData.map((name, index) => (
                                <SidebarLink
                                    key={index}
                                    href={`/${name}`}
                                    title={isLoading ? 'Loading...' : name}
                                    isSidebarOpen={isSidebarOpen}
                                    icon={<Tag className='w-5 h-5' />}
                                />
                            ))}

                            <SidebarLink
                                href='/labels'
                                title='Edit labels'
                                isSidebarOpen={isSidebarOpen}
                                icon={<Pencil className='w-5 h-5' />}
                            />

                            <SidebarLink
                                href='/archive'
                                title='Archive'
                                isSidebarOpen={isSidebarOpen}
                                icon={<Archive className='w-5 h-5' />}
                            />

                            <SidebarLink
                                href='/trash'
                                title='Trash'
                                isSidebarOpen={isSidebarOpen}
                                icon={<Trash2 className='w-5 h-5' />}
                            />
                            <SidebarLink
                                href='/statistics'
                                title='Statistics'
                                isSidebarOpen={isSidebarOpen}
                                icon={<ChartPie className='w-5 h-5' />}
                            />

                            <SidebarLink
                                href='/profile'
                                title='Profile'
                                isSidebarOpen={isSidebarOpen}
                                icon={<CircleUserRound className='w-5 h-5' />}
                            />
                        </div>
                    </nav>
                </aside>

                <div className='flex-1 flex flex-col overflow-hidden'>
                    <header className='h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 flex-shrink-0'>
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
                            {DbUser?.isPremium ? (
                                <Button
                                    onClick={handleManagePlan}
                                    className='bg-[#0052CC] hover:bg-[#0052CC]/80 text-white px-4 py-2 text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md'
                                >
                                    Manage Plan
                                </Button>
                            ) : (
                                <Link href='/upgrade'>
                                    <Button className='bg-[#0052CC] hover:bg-[#0052CC]/80 text-white px-4 py-2 text-sm hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md'>
                                        Upgrade
                                    </Button>
                                </Link>
                            )}

                            <UserMenu />
                        </div>
                    </header>

                    <main className='flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50'>
                        <div className='max-w-7xl mx-auto'>{children}</div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
