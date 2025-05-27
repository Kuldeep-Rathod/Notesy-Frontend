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
    _id: string;
    name: string;
    email: string;
    firebaseUid: string;
    labels: string[];
    photo: string | null;
    stripeSubscriptionId?: string;
    isPremium?: boolean;
    planType?: 'monthly' | 'quarterly' | 'biannual' | 'annual';
    premiumExpiresAt?: Date | null;
    isInFreeTrial: boolean;
    freeTrialEndDate?: string;
    createdAt: string;
    updatedAt: string;
}
