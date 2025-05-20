// components/GuestGuard.tsx
'use client';

import { app } from '@/lib/firebase';
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

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Redirect authenticated user to home or dashboard
                router.replace('/dashboard');
            } else {
                setLoading(false); // Show children (login/signup) if not logged in
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
}
