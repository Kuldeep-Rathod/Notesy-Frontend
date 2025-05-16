'use client';

import styles from '@/styles/components/profile/index.module.scss';
import React, { useEffect, useState } from 'react';
import { UserProfile, UserStats } from '../../types/profile';
import ProfileHeader from './ProfileHeader';
import ProfileSection from './ProfileSection';
import StatCard from './StatCard';
import {
    useGetCurrentUserQuery,
    useUpdateUserProfileMutation,
} from '@/redux/api/userAPI';
import { DbUser } from '@/types/reducer-types';
import { toast } from 'sonner';

interface ProfileProps {
    stats: UserStats;
    activeSection?: 'profile' | 'preferences' | 'stats';
    onSectionChange?: (section: 'profile' | 'preferences' | 'stats') => void;
}

const Profile: React.FC<ProfileProps> = ({
    stats,
    activeSection = 'profile',
    onSectionChange,
}) => {
    const [localActiveSection, setLocalActiveSection] = useState<
        'profile' | 'preferences' | 'stats'
    >(activeSection);

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

    useEffect(() => {
        setLocalActiveSection(activeSection);
    }, [activeSection]);

    useEffect(() => {
        if (userData) {
            setEditableName(userData.name);
            // Reset local photo URL when userData changes
            setLocalPhotoUrl(null);
        }
    }, [userData]);

    // Effect to handle auto-saving of name changes
    useEffect(() => {
        if (nameChanged && userData && editableName !== userData.name) {
            // Clear any existing timer
            if (nameUpdateTimer) {
                clearTimeout(nameUpdateTimer);
            }

            // Set a new timer
            const timer = setTimeout(() => {
                handleProfileUpdate(false);
            }, 2000); // Wait 2 seconds after last change

            setNameUpdateTimer(timer);

            // Cleanup on unmount
            return () => {
                if (timer) clearTimeout(timer);
            };
        }
    }, [editableName, nameChanged]);

    // Clean up the timer on component unmount
    useEffect(() => {
        return () => {
            if (nameUpdateTimer) {
                clearTimeout(nameUpdateTimer);
            }
        };
    }, []);

    const handleSectionChange = (
        section: 'profile' | 'preferences' | 'stats'
    ) => {
        setLocalActiveSection(section);
        if (onSectionChange) {
            onSectionChange(section);
        }
    };

    const effectiveSection = localActiveSection;

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
            console.log('Profile updated:', updatedUser);

            // Refetch user data to ensure UI is up to date
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

    // Convert DbUser to UserProfile format for the ProfileHeader
    const userProfile: UserProfile = {
        name: userData.name,
        email: userData.email,
        // Use local photo URL if available (for immediate display after selection)
        photoUrl: localPhotoUrl || userData.photo || '',
        createdAt: userData.createdAt,
        lastLogin: new Date().toISOString(), // This would normally come from the backend
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

            {/* Activity Insights */}
            <ProfileSection title='Your Activity Insights'>
                <div className={styles.statsGrid}>
                    <StatCard
                        title='Total Notes Created'
                        value={stats.totalNotes}
                    />
                    <StatCard
                        title='Total Checklists'
                        value={stats.totalChecklists}
                    />
                    <StatCard
                        title='Reminders Set'
                        value={stats.totalReminders}
                    />
                    <StatCard
                        title='Archived Notes'
                        value={stats.archivedNotes}
                    />
                    <StatCard
                        title='Trashed Notes'
                        value={stats.trashedNotes}
                    />
                </div>
            </ProfileSection>

            {/* Account Settings */}
            <ProfileSection title='Account Settings'>
                <div className={styles.accountAction}>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                    >
                        Change Password
                    </button>
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
                    >
                        Delete Account
                    </button>
                </div>
            </ProfileSection>
        </div>
    );
};

export default Profile;
