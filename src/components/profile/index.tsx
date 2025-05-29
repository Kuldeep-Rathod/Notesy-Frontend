'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth } from '@/lib/firebase';
import {
    useChangePasswordMutation,
    useDeleteAccountMutation,
} from '@/redux/api/authAPI';
import {
    useGetCurrentUserQuery,
    useUpdateUserProfileMutation,
} from '@/redux/api/userAPI';
import styles from '@/styles/components/profile/index.module.scss';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserProfile } from '../../types/profile';
import ProfileHeader from './ProfileHeader';
import ProfileSection from './ProfileSection';

const Profile: React.FC = () => {
    const router = useRouter();

    const {
        data: userData,
        error,
        isLoading,
        refetch,
    } = useGetCurrentUserQuery();

    const [editableName, setEditableName] = useState('');
    const [nameChanged, setNameChanged] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
    const [updateUserProfile, { isLoading: isUpdating }] =
        useUpdateUserProfileMutation();
    const [nameUpdateTimer, setNameUpdateTimer] =
        useState<NodeJS.Timeout | null>(null);

    // Password change state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [changePassword, { isLoading: isChangingPassword }] =
        useChangePasswordMutation();

    // Delete account state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [confirmDeletePassword, setConfirmDeletePassword] = useState('');
    const [deleteAccount, { isLoading: isDeleting }] =
        useDeleteAccountMutation();

    // Check if user is authenticated with email/password
    const [isEmailPasswordAuth, setIsEmailPasswordAuth] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated with email/password
        const checkAuthProvider = () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const providerData = currentUser.providerData || [];
                const emailPasswordProvider = providerData.find(
                    (provider) => provider.providerId === 'password'
                );
                setIsEmailPasswordAuth(!!emailPasswordProvider);
            }
        };

        checkAuthProvider();
    }, []);

    useEffect(() => {
        if (userData) {
            setEditableName(userData.name);
            setLocalPhotoUrl(null);
        }
    }, [userData]);

    useEffect(() => {
        if (nameChanged && userData && editableName !== userData.name) {
            if (nameUpdateTimer) {
                clearTimeout(nameUpdateTimer);
            }

            const timer = setTimeout(() => {
                handleProfileUpdate(false);
            }, 2000);

            setNameUpdateTimer(timer);

            return () => {
                if (timer) clearTimeout(timer);
            };
        }
    }, [editableName, nameChanged]);

    useEffect(() => {
        return () => {
            if (nameUpdateTimer) {
                clearTimeout(nameUpdateTimer);
            }
        };
    }, []);

    const handleEditPhoto = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const file = target.files[0];
                setPhotoFile(file);

                // Create a local URL for immediate display
                const localUrl = URL.createObjectURL(file);
                setLocalPhotoUrl(localUrl);

                // Auto-save when photo is selected
                handleProfileUpdate(true, file);

                // Show toast for photo selection
                toast.info('Uploading your new profile photo...');
            }
        };
        input.click();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditableName(e.target.value);
        setNameChanged(true);
    };

    const handleProfileUpdate = async (
        isPhotoUpdate = false,
        newPhotoFile: File | null = null
    ) => {
        if (!userData) return;

        const formData = new FormData();
        formData.append('name', editableName);

        const fileToUpload = newPhotoFile || photoFile;
        if (fileToUpload) {
            formData.append('photo', fileToUpload);
        }

        try {
            const updatedUser = await updateUserProfile(formData).unwrap();

            await refetch();

            if (isPhotoUpdate) {
                toast.success('Profile photo updated!');
            } else {
                toast.success('Profile name updated!');
            }
            setNameChanged(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError(null);

        if (!currentPassword) {
            setPasswordError('Current password is required');
            return;
        }

        if (!newPassword) {
            setPasswordError('New password is required');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            await changePassword({
                currentPassword,
                newPassword,
            }).unwrap();

            toast.success('Password changed successfully');
            setPasswordDialogOpen(false);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error('Password change failed:', error);
            setPasswordError(error.message || 'Failed to change password');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            if (isEmailPasswordAuth && !confirmDeletePassword) {
                toast.error('Please enter your password to confirm deletion');
                return;
            }

            await deleteAccount({
                password: isEmailPasswordAuth
                    ? confirmDeletePassword
                    : undefined,
            }).unwrap();

            toast.success('Your account has been deleted');
            router.push('/login');
        } catch (error: any) {
            console.error('Account deletion failed:', error);

            if (error.status === 401) {
                toast.error(
                    'Authorization failed. Please log out and log back in before trying again.'
                );
            } else if (
                error.message === 'auth/wrong-password' ||
                error.message === 'auth/invalid-credential'
            ) {
                toast.error('The password you entered is incorrect.');
                setConfirmDeletePassword(''); // Clear password field
            } else if (error.message === 'auth/requires-recent-login') {
                toast.error(
                    'For security reasons, please log out and log back in before deleting your account.'
                );
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error(
                    'Failed to delete account. Please try again later.'
                );
            }
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingState}>Loading your profile...</div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                Error loading profile. Please try again.
            </div>
        );
    }

    if (!userData) {
        return <div className={styles.errorState}>No user data available.</div>;
    }

    const userProfile: UserProfile = {
        name: userData.name,
        email: userData.email,
        photoUrl: localPhotoUrl || userData.photo || '',
        createdAt: userData.createdAt,
        lastLogin: new Date().toISOString(),
    };

    return (
        <div className={styles.profileContainer}>
            <header className={styles.profilePageHeader}>
                <h1 className={styles.profileTitle}>Your Profile</h1>
            </header>

            <ProfileHeader
                user={userProfile}
                onEditPhoto={handleEditPhoto}
            />

            {/* Core User Info */}
            <ProfileSection
                title='Core User Info'
                onEdit={() => console.log('Edit core info')}
            >
                <div className={styles.preferenceItem}>
                    <span>Name</span>
                    <input
                        type='text'
                        value={editableName}
                        onChange={handleNameChange}
                        className={styles.editableInput}
                    />
                </div>
                <div className={styles.preferenceItem}>
                    <span>Email</span>
                    <span>{userData.email}</span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Account Creation Date</span>
                    <span>
                        {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className={styles.preferenceItem}>
                    <span>Last Updated</span>
                    <span>
                        {new Date(userData.updatedAt).toLocaleDateString()}
                    </span>
                </div>
                {nameChanged && nameUpdateTimer && (
                    <div className={styles.saveIndicator}>
                        Auto-saving changes...
                    </div>
                )}
                {isUpdating && (
                    <div className={styles.saveIndicator}>
                        Updating profile...
                    </div>
                )}
            </ProfileSection>

            {/* Account Settings */}
            <ProfileSection title='Account Settings'>
                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={() => setPasswordDialogOpen(true)}
                        disabled={!isEmailPasswordAuth}
                    >
                        Change Password
                    </button>
                    {!isEmailPasswordAuth && (
                        <div className={styles.helperText}>
                            Password change is only available for accounts
                            created with email and password
                        </div>
                    )}
                </div>
                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.outlineButton}`}
                    >
                        Export My Data
                    </button>
                </div>

                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.dangerButton}`}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete Account
                    </button>
                </div>
            </ProfileSection>

            {/* Change Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Your Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one.
                        </DialogDescription>
                    </DialogHeader>

                    {passwordError && (
                        <div className={styles.formError}>{passwordError}</div>
                    )}

                    <div className={styles.formGroup}>
                        <Label htmlFor='currentPassword'>
                            Current Password
                        </Label>
                        <Input
                            id='currentPassword'
                            type='password'
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder='••••••••'
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <Label htmlFor='newPassword'>New Password</Label>
                        <Input
                            id='newPassword'
                            type='password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder='••••••••'
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <Label htmlFor='confirmPassword'>
                            Confirm New Password
                        </Label>
                        <Input
                            id='confirmPassword'
                            type='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='••••••••'
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant='secondary'
                            onClick={() => setPasswordDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword
                                ? 'Changing...'
                                : 'Change Password'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Your Account</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All your data will be
                            permanently deleted.
                        </DialogDescription>
                    </DialogHeader>

                    {isEmailPasswordAuth && (
                        <div className={styles.formGroup}>
                            <Label htmlFor='confirmDeletePassword'>
                                Enter your password to confirm
                            </Label>
                            <Input
                                id='confirmDeletePassword'
                                type='password'
                                value={confirmDeletePassword}
                                onChange={(e) =>
                                    setConfirmDeletePassword(e.target.value)
                                }
                                placeholder='••••••••'
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant='secondary'
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Profile;
