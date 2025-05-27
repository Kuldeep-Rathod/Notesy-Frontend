'use client';

import { useSearchParams } from 'next/navigation';
import ExcalidrawClient from './ExcalidrawClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const Page = () => {
    const searchParams = useSearchParams();
    const boardId = searchParams.get('id');

    return (
        <div className='flex flex-col h-[80vh] w-full min-h-[500px]'>
            <div className='mb-2 ml-2'>
                <Link href='/boards/list'>
                    <Button
                        variant='ghost'
                        size='sm'
                    >
                        <ArrowLeft className='h-4 w-4 mr-1' /> Back to Boards
                    </Button>
                </Link>
            </div>
            <div className='flex-1'>
                <ExcalidrawClient />
            </div>
        </div>
    );
};

export default Page;
