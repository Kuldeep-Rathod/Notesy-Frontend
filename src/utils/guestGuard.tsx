'use client';

import { app } from '@/lib/firebase';
import CircularProgress from '@mui/material/CircularProgress';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GuestGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);

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

    // Prevent hydration mismatch
    if (!hasMounted) return null;

    if (loading) return <CircularProgress />;

    return <>{children}</>;
}
