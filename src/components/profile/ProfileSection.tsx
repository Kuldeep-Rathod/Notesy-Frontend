import React, { ReactNode } from 'react';
import styles from '@/styles/components/profile/ProfileSection.module.scss';

interface ProfileSectionProps {
    title: string;
    children: ReactNode;
    onEdit?: () => void;
    className?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
    title,
    children,
    onEdit,
    className = '',
}) => {
    return (
        <div className={`${styles.section} ${className}`}>
            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{title}</h3>
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className={styles.editButton}
                    >
                        Edit
                    </button>
                )}
            </div>
            <div className={styles.sectionContent}>{children}</div>
        </div>
    );
};

export default ProfileSection;
