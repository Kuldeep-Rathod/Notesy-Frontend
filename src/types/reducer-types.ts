interface User {
    fullName: string;
    profilePicture: string;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}
