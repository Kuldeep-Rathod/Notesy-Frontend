import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { User2, LogOut } from 'lucide-react';
import { useLogoutMutation } from '@/redux/api/authAPI';

export default function UserMenu() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);

    const [logout] = useLogoutMutation();

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
            // Optional: redirect or update UI
            console.log('User logged out');
            toast.success('User Logged out');
            await router.push('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='ghost'
                    className='p-0 rounded-full hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-[#0004E8]'
                >
                    <Avatar className='h-9 w-9 border border-gray-200'>
                        <AvatarImage
                            src={user?.profilePicture}
                            alt='User Avatar'
                        />
                        <AvatarFallback className='bg-[#0004E8]/10 text-[#0004E8]'>
                            {user?.fullName?.charAt(0).toUpperCase()}
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
