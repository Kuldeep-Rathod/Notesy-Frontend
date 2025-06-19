import { axiosInstance } from '@/utils/axiosInstance';
import { User } from 'firebase/auth';

export async function createMongoUser(firebaseUser: User) {
    try {
        const userData = {
            email: firebaseUser.email,
            name:
                firebaseUser.displayName ||
                firebaseUser.email?.split('@')[0] ||
                'User',
            photo: firebaseUser.photoURL || null,
            firebaseUid: firebaseUser.uid,
        };

        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating MongoDB user:', error);
        throw error;
    }
}
