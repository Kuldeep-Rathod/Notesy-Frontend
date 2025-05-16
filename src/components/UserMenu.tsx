'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useLogoutMutation } from '@/redux/api/authAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { LogOut, User2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UserMenu() {
    const router = useRouter();
    const { data: user } = useGetCurrentUserQuery();
    const [logout] = useLogoutMutation();
    const [open, setOpen] = useState(false);

    if (!user) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <span className='text-gray-500'>Loading...</span>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            toast.success('User Logged out');
            await router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleClose = () => setOpen(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    variant='ghost'
                    className='p-0 rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#0004E8]'
                >
                    <Avatar className='h-9 w-9 border border-gray-200 overflow-hidden'>
                        <AvatarImage
                            src={user.photo || ''}
                            alt='User Avatar'
                            className='h-full w-full object-cover'
                        />
                        <AvatarFallback className='bg-[#0004E8]/10 text-[#0004E8]'>
                            {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className='w-48 p-2'
                align='end'
            >
                <div className='space-y-1'>
                    <Link
                        href='/profile'
                        onClick={handleClose} // 👈 Close on profile click
                        className='w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100'
                    >
                        <User2 className='mr-2 h-4 w-4' />
                        <span>View Profile</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className='w-full flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100'
                    >
                        <LogOut className='mr-2 h-4 w-4' />
                        <span>Logout</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
