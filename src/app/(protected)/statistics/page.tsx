'use client';

import {
    BarChart,
    DoughnutChart,
    PieChart,
} from '@/components/statistics/Charts';
import { useNoteStatsQuery } from '@/redux/api/notesAPI';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CountUp from 'react-countup';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { CircularProgress } from '@mui/material';

const StatisticsPage = () => {
    const { data: statsData, isError, error, isLoading } = useNoteStatsQuery();
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const isPremium = userData?.isPremium;

    const router = useRouter();

    const stats = statsData?.data;

    if (userLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white'>
                <div className='text-xl font-medium text-primary animate-pulse'>
                    <div className='flex justify-center items-center h-screen'>
                        <CircularProgress />
                    </div>
                </div>
            </div>
        );
    }

    if (!isPremium) {
        toast.error('Upgrade to premium to access statistics');
        return router.push('/dashboard');
    }

    if (isError && error) {
        toast.error('Failed to fetch statistics');
        return router.push('/dashboard');
    }

    if (isLoading)
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white'>
                <div className='text-xl font-medium text-primary animate-pulse'>
                    <div className='flex flex-col justify-center items-center h-screen'>
                        <CircularProgress />
                        Loading stats...
                    </div>
                </div>
            </div>
        );

    if (!stats) {
        toast.error('No data available');
        return router.push('/dashboard');
    }

    const labels = Object.keys(stats.labelStats);
    const labelsData = Object.values(stats.labelStats);

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto space-y-12'>
                {/* Header */}
                <header className='text-center space-y-3'>
                    <h1 className='text-4xl font-bold bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent'>
                        Notes Analytics Dashboard
                    </h1>
                    <p className='text-gray-500 text-lg max-w-2xl mx-auto'>
                        Visual insights into your notes patterns and usage
                    </p>
                </header>

                {/* Stats Overview Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <StatCard
                        title='Total Notes'
                        value={stats.totalNotes}
                        icon='📝'
                        borderColor='#3b82f6'
                    />
                    <StatCard
                        title='Pinned'
                        value={stats.pinned}
                        icon='📌'
                        borderColor='#6366f1'
                    />
                    <StatCard
                        title='Archived'
                        value={stats.archived}
                        icon='🗄️'
                        borderColor='#8b5cf6'
                    />
                    <StatCard
                        title='Trashed'
                        value={stats.trashed}
                        icon='🗑️'
                        borderColor='#ec4899'
                    />
                </div>

                {/* Charts */}
                <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <ChartCard title='Checklist Completion'>
                        <PieChart
                            labels={['Completed', 'Incomplete']}
                            data={[
                                stats.checklistStats.completed,
                                stats.checklistStats.incomplete,
                            ]}
                            backgroundColor={['#10b981', '#ef4444']}
                            offset={[0, 0, 20]}
                        />
                        <LegendGroup>
                            <LegendItem
                                color='#10b981'
                                label='Completed'
                                value={stats.checklistStats.completed}
                            />
                            <LegendItem
                                color='#ef4444'
                                label='Incomplete'
                                value={stats.checklistStats.incomplete}
                            />
                        </LegendGroup>
                    </ChartCard>

                    <ChartCard title='Reminder Status'>
                        <DoughnutChart
                            labels={['Upcoming', 'Past']}
                            data={[
                                stats.reminderStats.upcoming,
                                stats.reminderStats.past,
                            ]}
                            backgroundColor={['#3b82f6', '#f59e0b']}
                            legends={false}
                            offset={[0, 0, 30]}
                        />
                        <LegendGroup>
                            <LegendItem
                                color='#3b82f6'
                                label='Upcoming'
                                value={stats.reminderStats.upcoming}
                            />
                            <LegendItem
                                color='#f59e0b'
                                label='Past'
                                value={stats.reminderStats.past}
                            />
                        </LegendGroup>
                    </ChartCard>

                    <ChartCard title='Note Status'>
                        <PieChart
                            labels={['Pinned', 'Archived', 'Trashed']}
                            data={[stats.pinned, stats.archived, stats.trashed]}
                            backgroundColor={['#6366f1', '#8b5cf6', '#ec4899']}
                            offset={[0, 0, 20]}
                        />
                        <LegendGroup>
                            <LegendItem
                                color='#6366f1'
                                label='Pinned'
                                value={stats.pinned}
                            />
                            <LegendItem
                                color='#8b5cf6'
                                label='Archived'
                                value={stats.archived}
                            />
                            <LegendItem
                                color='#ec4899'
                                label='Trashed'
                                value={stats.trashed}
                            />
                        </LegendGroup>
                    </ChartCard>
                </section>

                {/* Bar Charts */}
                <section className='space-y-8'>
                    <div
                        className={`rounded-xl shadow-sm border border-gray-100/50 p-6 transition-all hover:shadow-md bg-white/80 backdrop-blur-sm ${'w-full'}`}
                    >
                        <h2 className='text-lg font-semibold text-gray-800 mb-4'>
                            Labels Usage
                        </h2>
                        <div>
                            {' '}
                            <BarChart
                                data_1={labelsData}
                                title_1='Labels'
                                bgColor_1={['rgba(59, 130, 246, 0.8)']}
                                labels={labels}
                            />
                        </div>
                    </div>

                    <ChartCard
                        title='Color Preferences'
                        fullWidth
                    >
                        <BarChart
                            data_1={Object.values(stats.bgColorStats)}
                            title_1='Backgrounds'
                            bgColor_1={Object.keys(stats.bgColorStats)}
                            labels={Object.keys(stats.bgColorStats)}
                        />
                    </ChartCard>
                </section>
            </div>
        </div>
    );
};

export default StatisticsPage;

// ========================
// Reusable Components
// ========================

const ChartCard = ({
    title,
    children,
    fullWidth = false,
}: {
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}) => (
    <div
        className={`rounded-xl shadow-sm border border-gray-100/50 p-6 transition-all hover:shadow-md bg-white/80 backdrop-blur-sm ${
            fullWidth ? 'w-full' : 'h-full'
        }`}
    >
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>{title}</h2>
        <div>{children}</div>
    </div>
);

type StatCardProps = {
    title: string;
    value: number;
    icon: string;
    borderColor?: string;
};

const StatCard = ({
    title,
    value,
    icon,
    borderColor = '#3b82f6',
}: StatCardProps) => {
    return (
        <div
            className='bg-white/80 backdrop-blur-sm rounded-lg p-5 shadow-sm border border-gray-100/50 hover:shadow-md transition-all'
            style={{ borderLeft: `5px solid ${borderColor}` }}
        >
            <div className='flex justify-between items-start'>
                <div>
                    <p className='text-sm font-semibold text-gray-600 tracking-wide'>
                        {title}
                    </p>
                    <h3 className='text-3xl font-bold text-gray-800 mt-1'>
                        <CountUp
                            end={value}
                            duration={1.5}
                            separator=','
                        />
                    </h3>
                </div>
                <span className='text-3xl text-gray-500'>{icon}</span>
            </div>
        </div>
    );
};

const LegendItem = ({
    color,
    label,
    value,
}: {
    color: string;
    label: string;
    value: number;
}) => (
    <div className='flex items-center space-x-1'>
        <div
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: color }}
        />
        <span className='text-sm text-gray-600'>{label}:</span>
        <span className='text-sm font-medium'>{value}</span>
    </div>
);

const LegendGroup = ({ children }: { children: React.ReactNode }) => (
    <div className='flex flex-wrap justify-center gap-4 mt-4'>{children}</div>
);
