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
