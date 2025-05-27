import { DbUser } from '@/types/reducer-types';
import { differenceInDays } from 'date-fns';
import { Timer } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

interface TrialStatusProps {
    user: DbUser;
}

const TrialStatus: React.FC<TrialStatusProps> = ({ user }) => {
    if (!user.isInFreeTrial) return null;

    const trialEndDate = new Date(user.freeTrialEndDate ?? '');
    const daysRemaining = differenceInDays(trialEndDate, new Date());

    return (
        <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-2 rounded-full inline-flex items-center'>
                <Timer className='h-4 w-4 mr-1' />
                Trial ends in {daysRemaining} days
            </span>
            <Link
                href='/upgrade'
                className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 text-sm transition-all duration-200 shadow-sm hover:shadow-md rounded-lg'
            >
                Upgrade
            </Link>
        </div>
    );
};

export default TrialStatus;
