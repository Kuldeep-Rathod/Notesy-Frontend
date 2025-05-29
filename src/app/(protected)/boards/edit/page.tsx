'use client';

import ExcalidrawClient from '@/components/boards/ExcalidrawClient';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { CircularProgress } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const Page = () => {
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const isPremium = userData?.isPremium;

    const router = useRouter();

    const searchParams = useSearchParams();
    const boardId = searchParams.get('id');

    if (userLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white'>
                <div className='text-xl font-medium text-primary animate-pulse'>
                    <div className='flex justify-center items-center h-screen'>
                        <CircularProgress />
                    </div>
                </div>
            </div>
        );
    }

    if (!isPremium) {
        toast.error('Upgrade to premium to access whiteboard');
        return router.push('/dashboard');
    }

    return (
        <div className='flex flex-col h-[80vh] w-full min-h-[500px]'>
            <div className='flex-1'>
                <ExcalidrawClient />
            </div>
        </div>
    );
};

export default Page;
