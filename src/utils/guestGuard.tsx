'use client';

import { app } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GuestGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                router.replace('/dashboard');
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) return <CircularProgress />;

    return <>{children}</>;
}
