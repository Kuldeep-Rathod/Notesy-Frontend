'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SuccessPage = () => {
    const router = useRouter();
    const [showContent, setShowContent] = useState(true);
    const [showTick, setShowTick] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setShowTick(true);
        }, 300);

        const timer2 = setTimeout(() => {
            setShowContent(false);
            router.push('/dashboard');
        }, 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [router]);

    return (
        <div className='min-h-screen flex items-center justify-center px-4'>
            {showContent && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                >
                    <Card className='border-green-300 shadow-xl w-full max-w-md rounded-2xl'>
                        <CardContent className='p-8 flex flex-col items-center text-center space-y-4'>
                            <div className='relative'>
                                <motion.div
                                    className='rounded-full bg-green-300 p-4'
                                    initial={{ scale: 1 }}
                                    animate={{ scale: showTick ? 0 : 1 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: 'easeOut',
                                    }}
                                >
                                    <div className='h-16 w-16'></div>
                                </motion.div>
                                {showTick && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: 'easeOut',
                                        }}
                                        className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center'
                                    >
                                        <CheckCircle className='h-16 w-16 text-green-600' />
                                    </motion.div>
                                )}
                            </div>
                            <h1 className='text-3xl font-bold'>
                                Payment Successful!
                            </h1>
                            <p className='text-sm text-black'>
                                Thank you for subscribing to Subsight.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default SuccessPage;
