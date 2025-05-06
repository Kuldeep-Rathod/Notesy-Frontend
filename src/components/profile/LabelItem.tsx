import React from 'react';
import styles from '@/styles/components/profile/LabelItem.module.scss';

interface LabelItemProps {
    label: string;
    onDelete?: () => void;
    showDelete?: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
    label,
    onDelete,
    showDelete = true,
}) => {
    return (
        <div className={styles.labelItem}>
            <span>{label}</span>
            {showDelete && (
                <button
                    onClick={onDelete}
                    className={styles.deleteButton}
                    aria-label={`Delete label ${label}`}
                >
                    ×
                </button>
            )}
        </div>
    );
};

export default LabelItem;
