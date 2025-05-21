'use client';

import {
    useAddLabelMutation,
    useDeleteLabelMutation,
    useEditLabelMutation,
    useGetLabelsQuery,
} from '@/redux/api/labelsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import styles from '@/styles/app/EditLabelsPage.module.scss';
import { useLabelPageCommands } from '@/voice-assistant/commands/label/labelPageCommands';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import { ArrowLeftCircle, CirclePlus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
                    id: index.toString(), // Use index as ID since API returns string array
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
            return;
        }

        if (!isPremium) {
            if (labels.length >= 3) {
                setError({
                    type: 'limit',
                    message:
                        'Label limit reached for free users. Delete an existing label or upgrade to premium to create more.',
                });
                return;
            }
        }

        try {
            // Add new label via API
            await addLabel(trimmedName).unwrap();
            setNewLabelName('');
            setError({ type: null, message: '' });
            refetch(); // Refresh labels list
        } catch (err) {
            setError({
                type: 'exists',
                message: 'Failed to add label. It may already exist.',
            });
        }
    };

    const handleDeleteLabel = async (labelName: string) => {
        if (window.confirm('Are you sure you want to delete this label?')) {
            try {
                await deleteLabel(labelName).unwrap();
                refetch(); // Refresh labels list
            } catch (err) {
                setError({
                    type: null,
                    message: 'Failed to delete label. Please try again.',
                });
            }
        }
    };

    const handleRenameLabel = async (oldName: string, newName: string) => {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            alert('Label name cannot be empty');
            return;
        }

        // Check if new name already exists
        if (
            labels.some(
                (label) =>
                    label.name !== oldName &&
                    label.name.toLowerCase() === trimmedName.toLowerCase()
            )
        ) {
            setError({ type: 'exists', message: 'Label already exists' });
            return;
        }

        try {
            await editLabel({
                oldLabel: oldName,
                newLabel: trimmedName,
            }).unwrap();
            setError({ type: null, message: '' });
            refetch(); // Refresh labels list
        } catch (err) {
            setError({
                type: 'exists',
                message: 'Failed to rename label. It may already exist.',
            });
        }
    };

    // Initialize voice commands for note input
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

    if (userLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white'>
                <div className='text-xl font-medium text-primary animate-pulse'>
                    Loading user...
                </div>
            </div>
        );
    }

    if (isLoading)
        return <div className={styles.editLabelsPage}>Loading...</div>;
    if (isError)
        return (
            <div className={styles.editLabelsPage}>Error loading labels</div>
        );

    return (
        <div className={styles.editLabelsPage}>
            <div className={styles.pageHeader}>
                <button
                    className={styles.backButton}
                    onClick={() => router.back()}
                >
                    <ArrowLeftCircle />
                </button>
                <h1>Edit Labels</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.inputSection}>
                    <input
                        type='text'
                        placeholder='Create new label'
                        aria-label='Create new label'
                        maxLength={50}
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && createLabel()}
                    />
                    <button
                        className={styles.addButton}
                        onClick={createLabel}
                        disabled={!newLabelName.trim()}
                    >
                        <CirclePlus />
                    </button>
                </div>

                {error.type && (
                    <div className={styles.errorMessage}>{error.message}</div>
                )}

                <div className={styles.labelsList}>
                    {labels.map((label) => (
                        <div
                            key={label.id}
                            className={styles.labelEditRow}
                        >
                            <input
                                type='text'
                                placeholder='Enter label name'
                                aria-label='Enter label name'
                                maxLength={50}
                                value={label.name}
                                onChange={(e) => {
                                    const updatedLabels = labels.map((l) =>
                                        l.id === label.id
                                            ? {
                                                  ...l,
                                                  name: e.target.value,
                                              }
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
                                className={styles.deleteButton}
                                onClick={() => handleDeleteLabel(label.name)}
                            >
                                <Trash2 />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            {isActive && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 100,
                    }}
                >
                    Labels voice commands active
                </div>
            )}
        </div>
    );
};

export default EditLabelsPage;
