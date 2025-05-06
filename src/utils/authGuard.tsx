// components/AuthGuard.tsx
'use client';

import { app } from '@/lib/firebase';
import { setUser } from '@/redux/reducer/authReducer';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    // const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                dispatch(
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        fullName: firebaseUser.displayName ?? '',
                        profilePicture: firebaseUser.photoURL ?? '',
                    })
                );
            } else {
                dispatch(setUser(null));
                router.replace('/login'); // or '/sign-in'
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [dispatch, router]);

    if (loading) return <div>Loading...</div>;

    return <>{children}</>;
}
