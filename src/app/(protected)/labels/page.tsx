'use client';

import {
    useAddLabelMutation,
    useDeleteLabelMutation,
    useEditLabelMutation,
    useGetLabelsQuery,
} from '@/redux/api/labelsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { useLabelPageCommands } from '@/voice-assistant/commands/label/labelPageCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { ArrowLeft, CirclePlus, Mic, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Label {
    id: string;
    name: string;
}

const EditLabelsPage = () => {
    const router = useRouter();

    // API hooks
    const {
        data: labelsData = [],
        isLoading,
        isError,
        refetch,
    } = useGetLabelsQuery();
    const [addLabel] = useAddLabelMutation();
    const [editLabel] = useEditLabelMutation();
    const [deleteLabel] = useDeleteLabelMutation();
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const isPremium = userData?.isPremium;

    const [labels, setLabels] = useState<Label[]>([]);
    const [newLabelName, setNewLabelName] = useState('');
    const [error, setError] = useState<{
        type: 'exists' | 'limit' | null;
        message: string;
    }>({ type: null, message: '' });

    // Convert labels data from API to local state format
    useEffect(() => {
        if (labelsData && Array.isArray(labelsData)) {
            setLabels(
                labelsData.map((name, index) => ({
                    id: index.toString(),
                    name,
                }))
            );
        }
    }, [labelsData]);

    const createLabel = async () => {
        const trimmedName = newLabelName.trim();

        if (!trimmedName) return;

        // Check if label already exists
        if (
            labels.some(
                (label) =>
                    label.name.toLowerCase() === trimmedName.toLowerCase()
            )
        ) {
            setError({ type: 'exists', message: 'Label already exists' });
            toast.error('Label already exists');
            return;
        }

        if (!isPremium) {
            if (labels.length >= 3) {
                setError({
                    type: 'limit',
                    message:
                        'Label limit reached for free users. Delete an existing label or upgrade to premium to create more.',
                });
                toast.error(
                    'Label limit reached. Upgrade to premium to create more labels.'
                );
                return;
            }
        }

        try {
            await addLabel(trimmedName).unwrap();
            setNewLabelName('');
            setError({ type: null, message: '' });
            refetch();
            toast.success(`Label "${trimmedName}" created`);
        } catch (err) {
            setError({
                type: 'exists',
                message: 'Failed to add label. It may already exist.',
            });
            toast.error('Failed to create label');
        }
    };

    const handleDeleteLabel = async (labelName: string) => {
        if (window.confirm('Are you sure you want to delete this label?')) {
            try {
                await deleteLabel(labelName).unwrap();
                refetch();
                toast.success(`Label "${labelName}" deleted`);
            } catch (err) {
                setError({
                    type: null,
                    message: 'Failed to delete label. Please try again.',
                });
                toast.error('Failed to delete label');
            }
        }
    };

    const handleRenameLabel = async (oldName: string, newName: string) => {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            toast.error('Label name cannot be empty');
            return;
        }

        if (
            labels.some(
                (label) =>
                    label.name !== oldName &&
                    label.name.toLowerCase() === trimmedName.toLowerCase()
            )
        ) {
            setError({ type: 'exists', message: 'Label already exists' });
            toast.error('Label already exists');
            return;
        }

        try {
            await editLabel({
                oldLabel: oldName,
                newLabel: trimmedName,
            }).unwrap();
            setError({ type: null, message: '' });
            refetch();
            toast.success(
                `Label renamed from "${oldName}" to "${trimmedName}"`
            );
        } catch (err) {
            setError({
                type: 'exists',
                message: 'Failed to rename label. It may already exist.',
            });
            toast.error('Failed to rename label');
        }
    };

    // Initialize voice commands
    const { isActive } = usePageVoiceCommands(
        {
            '/labels': useLabelPageCommands({
                labels: labels.map((label) => ({
                    id: parseInt(label.id) || undefined,
                    name: label.name,
                })),
                state: {
                    setNewLabelName,
                },
                handlers: {
                    createLabel,
                    handleDeleteLabel,
                    handleRenameLabel,
                },
            }),
        },
        { debug: true, requireWakeWord: true }
    );

    if (userLoading || isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-slate-50'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-slate-50'>
                <div className='text-red-500'>Error loading labels</div>
            </div>
        );
    }

    return (
        <div className='min-h-screen p-6'>
            <div className='max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden'>
                {/* Header */}
                <div className='p-6 border-b border-slate-200 flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                        <button
                            onClick={() => router.back()}
                            className='text-slate-600 hover:text-indigo-600 transition-colors'
                        >
                            <ArrowLeft className='w-6 h-6' />
                        </button>
                        <h1 className='text-2xl font-bold text-slate-800'>
                            Edit Labels
                        </h1>
                    </div>
                    {isActive && (
                        <div className='flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full'>
                            <Mic className='w-4 h-4' />
                            <span className='text-sm font-medium'>
                                Voice Active
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className='p-6'>
                    {/* Add Label Section */}
                    <div className='flex items-center space-x-3 mb-6 p-3'>
                        <input
                            type='text'
                            placeholder='Create new label'
                            className='flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all'
                            value={newLabelName}
                            onChange={(e) =>
                                setNewLabelName(e.target.value.toLowerCase())
                            }
                            onKeyDown={(e) =>
                                e.key === 'Enter' && createLabel()
                            }
                        />

                        <button
                            onClick={createLabel}
                            disabled={!newLabelName.trim()}
                            className='bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors'
                        >
                            <CirclePlus className='w-5 h-5' />
                        </button>
                    </div>

                    {error.type && (
                        <div
                            className={`mb-4 p-3 m-3 rounded-lg text-sm ${
                                error.type === 'limit'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-red-50 text-red-600'
                            }`}
                        >
                            {error.message}
                        </div>
                    )}

                    {/* Labels List */}
                    <div className='space-y-3'>
                        {labels.map((label) => (
                            <div
                                key={label.id}
                                className='flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors'
                            >
                                <input
                                    type='text'
                                    className='flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all'
                                    value={label.name}
                                    onChange={(e) => {
                                        const lowerCaseValue =
                                            e.target.value.toLowerCase();
                                        const updatedLabels = labels.map((l) =>
                                            l.id === label.id
                                                ? { ...l, name: lowerCaseValue }
                                                : l
                                        );
                                        setLabels(updatedLabels);
                                    }}
                                    onBlur={(e) =>
                                        handleRenameLabel(
                                            label.name,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleRenameLabel(
                                                label.name,
                                                e.currentTarget.value
                                            );
                                            e.currentTarget.blur();
                                        }
                                    }}
                                />
                                <button
                                    onClick={() =>
                                        handleDeleteLabel(label.name)
                                    }
                                    className='text-slate-500 hover:text-red-500 p-2 rounded-lg transition-colors'
                                >
                                    <Trash2 className='w-5 h-5' />
                                </button>
                            </div>
                        ))}
                    </div>

                    {!isPremium && labels.length >= 3 && (
                        <div className='mt-6 p-4 bg-indigo-50 rounded-lg text-center'>
                            <p className='text-indigo-800'>
                                You&apos;ve reached the limit for free users.
                                <Link
                                    href='/upgrade'
                                    className='ml-1 font-semibold text-indigo-600 hover:underline'
                                >
                                    Upgrade to premium
                                </Link>{' '}
                                for unlimited labels.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditLabelsPage;
