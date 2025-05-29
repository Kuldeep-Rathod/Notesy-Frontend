'use client';

import SidebarLink from '@/components/SidebarLink';
import TrialStatus from '@/components/TrialStatus';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import { cn } from '@/lib/utils';
import { useGetLabelsQuery } from '@/redux/api/labelsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import AuthGuard from '@/utils/authGuard';
import { axiosInstance } from '@/utils/axiosInstance';
import UserManual from '@/voice-assistant/components/userManual/UserManual';
import CircularProgress from '@mui/material/CircularProgress';
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
    Mic,
    Pencil,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdOutlineDraw } from 'react-icons/md';
import { toast } from 'sonner';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: labelsData = [], isLoading } = useGetLabelsQuery();
    const { data: DbUser, isLoading: dbUserLoading } = useGetCurrentUserQuery();
    const router = useRouter();

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    if (dbUserLoading) {
        return (
            <div className='flex justify-center items-center h-screen bg-gray-50'>
                <CircularProgress className='text-indigo-600' />
            </div>
        );
    }

    const handleManagePlan = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                toast.error('User not authenticated');
                return;
            }

            // If user is in free trial, redirect to upgrade page
            if (DbUser?.isInFreeTrial) {
                router.push('/upgrade');
                return;
            }

            const idToken = await user.getIdToken();

            const res = await axiosInstance.post(
                '/pay/create-portal-session',
                {},
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
            toast.error('Error accessing subscription management');
        }
    };

    return (
        <AuthGuard>
            <div className='flex h-screen bg-gray-50 overflow-hidden'>
                {/* Mobile overlay */}
                {mobileSidebarOpen && (
                    <div
                        className='fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300'
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed lg:relative z-50 w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm',
                        'transform lg:translate-x-0 h-full',
                        mobileSidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full',
                        isSidebarOpen ? 'lg:w-64' : 'lg:w-20'
                    )}
                >
                    {/* Sidebar header */}
                    <div className='flex items-center justify-between p-4 border-b border-gray-200 h-16 flex-shrink-0'>
                        <Link
                            href='/dashboard'
                            className='flex items-center'
                        >
                            {isSidebarOpen ? (
                                <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                                    <Mic className='w-5 h-5 text-white' />
                                </div>
                            ) : (
                                <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md'>
                                    <Mic className='w-5 h-5 text-white' />
                                </div>
                            )}
                            {isSidebarOpen && (
                                <span className='ml-3 text-xl font-semibold text-gray-800'>
                                    Notesy
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={toggleSidebar}
                            className='hidden lg:flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors'
                        >
                            {isSidebarOpen ? (
                                <ChevronLeft size={18} />
                            ) : (
                                <ChevronRight size={18} />
                            )}
                        </button>
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className='lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors'
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Sidebar navigation */}
                    <nav className='flex-1 overflow-y-auto p-3'>
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
                                title='Labels'
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
                                isPremium
                                disabled={!DbUser?.isPremium}
                            />

                            <SidebarLink
                                href='/boards'
                                title='Boards'
                                isSidebarOpen={isSidebarOpen}
                                icon={<MdOutlineDraw className='w-5 h-5' />}
                                isPremium
                                disabled={!DbUser?.isPremium}
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

                {/* Main content area */}
                <div className='flex-1 flex flex-col overflow-hidden'>
                    {/* Header */}
                    <header className='h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 shadow-sm'>
                        <div className='flex items-center'>
                            <button
                                onClick={() => setMobileSidebarOpen(true)}
                                className='lg:hidden p-2 mr-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors'
                            >
                                <Menu size={20} />
                            </button>
                        </div>

                        <div className='flex items-center space-x-4'>
                            <UserManual />
                            {DbUser?.isInFreeTrial ? (
                                <TrialStatus user={DbUser} />
                            ) : DbUser?.isPremium ? (
                                <Button
                                    onClick={handleManagePlan}
                                    className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-all duration-200 shadow-sm hover:shadow-md'
                                >
                                    Manage Plan
                                </Button>
                            ) : (
                                <Link href='/upgrade'>
                                    <Button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-all duration-200 shadow-sm hover:shadow-md'>
                                        Upgrade
                                    </Button>
                                </Link>
                            )}

                            <UserMenu />
                        </div>
                    </header>

                    {/* Main content */}
                    <main className='flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50'>
                        <div className='max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6'>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
