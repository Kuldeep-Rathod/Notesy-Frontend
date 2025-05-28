'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ExcalidrawClient from '@/components/boards/ExcalidrawClient';

const Page = () => {
    const searchParams = useSearchParams();
    const boardId = searchParams.get('id');

    return (
        <div className='flex flex-col h-[80vh] w-full min-h-[500px]'>
            
            <div className='flex-1'>
                <ExcalidrawClient />
            </div>
        </div>
    );
};

export default Page;
