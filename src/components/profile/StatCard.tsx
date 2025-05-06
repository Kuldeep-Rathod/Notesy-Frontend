import React from 'react';
import styles from '@/styles/components/profile/StatCard.module.scss';

interface StatCardProps {
    title: string;
    value: string | number;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    className = '',
}) => {
    return (
        <div className={`${styles.statCard} ${className}`}>
            <h4 className={styles.statTitle}>{title}</h4>
            <p className={styles.statValue}>{value}</p>
        </div>
    );
};

export default StatCard;
