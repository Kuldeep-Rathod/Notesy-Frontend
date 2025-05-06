export interface AppUser {
    uid: string;
    email: string | null;
    fullName?: string;
    profilePicture?: string;
}

export interface AuthState {
    user: AppUser | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export interface DbUser {
    name: string;
    email: string;
    firebaseUid: string;
    labels: string[];
    photo: string | null;
    createdAt: string;
    updatedAt: string;
}
