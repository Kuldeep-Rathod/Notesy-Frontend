'use client';

import { app } from '@/lib/firebase';
import { setUser } from '@/redux/reducer/authReducer';
import { CircularProgress } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

interface AuthGuardProps {
    children: React.ReactNode;
    loginPath?: string;
}

export default function AuthGuard({
    children,
    loginPath = '/login',
}: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

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
                setLoading(false);
            } else {
                dispatch(setUser(null));
                if (pathname !== loginPath) {
                    router.replace(loginPath);
                }
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [dispatch, router, loginPath, pathname]);

    if (loading)
        return (
            <div className='flex justify-center items-center h-screen'>
                <CircularProgress />
            </div>
        );

    return <>{children}</>;
}
