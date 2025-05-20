import { LabelI } from '@/interfaces/labels';
import {
    useAddLabelMutation,
    useAttachLabelsToNoteMutation,
} from '@/redux/api/labelsAPI';
import {
    selectNoteInput,
    setLabels,
    setSearchQuery,
    toggleLabel,
    toggleLabelMenu,
} from '@/redux/reducer/noteInputReducer';
import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface LabelMenuProps {
    isEditing: boolean;
    noteToEdit?: { _id?: string };
}

const LabelMenu: React.FC<LabelMenuProps> = ({ isEditing, noteToEdit }) => {
    const dispatch = useDispatch();

    const {
        labels,
        availableLabels,
        searchQuery,
    }: {
        labels: LabelI[];
        availableLabels: LabelI[];
        searchQuery: string;
    } = useSelector(selectNoteInput);

    const [addLabel] = useAddLabelMutation();
    const [attachLabelsToNote] = useAttachLabelsToNoteMutation();

    const labelSearchRef = useRef<HTMLInputElement>(
        null
    ) as React.RefObject<HTMLInputElement>;

    // Add new label
    const addNewLabel = async (): Promise<void> => {
        if (
            searchQuery.trim() &&
            !labels.some((label: LabelI) => label.name === searchQuery.trim())
        ) {
            try {
                await addLabel(searchQuery.trim()).unwrap();

                // Add the new label to the list
                const newLabel: LabelI = {
                    name: searchQuery.trim(),
                    added: true,
                };

                dispatch(setLabels([...labels, newLabel]));
                dispatch(setSearchQuery(''));
                if (labelSearchRef.current) {
                    labelSearchRef.current.value = '';
                }

                // If editing, attach the new label to the note
                if (isEditing && noteToEdit?._id) {
                    await attachLabelsToNote({
                        id: noteToEdit._id.toString(),
                        labels: searchQuery.trim(),
                    }).unwrap();
                }
            } catch (error) {
                console.error('Error adding new label:', error);
            }
        }
    };

    // Handle label search key down
    const handleLabelSearchKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ): void => {
        if (e.key === 'Enter') {
            addNewLabel();
        }
    };

    // Toggle label
    const handleToggleLabel = async (labelName: string): Promise<void> => {
        const label: LabelI | undefined = labels.find(
            (l: LabelI) => l.name === labelName
        );
        if (!label) return;

        try {
            if (!label.added) {
                // Attach label to note
                if (isEditing && noteToEdit?._id) {
                    await attachLabelsToNote({
                        id: noteToEdit._id.toString(),
                        labels: labelName,
                    }).unwrap();
                }
            }
            dispatch(toggleLabel(labelName));
        } catch (error) {
            console.error('Error toggling label:', error);
        }
    };

    return (
        <div
            className='absolute z-10 w-80 bg-white shadow-lg rounded-md p-4'
            data-tooltip='true'
            data-is-tooltip-open='true'
        >
            <div className='flex justify-between items-center border-b pb-2 mb-3'>
                <p className='text-lg font-medium'>Label note</p>
                <button
                    className='text-red-500 hover:text-red-700 text-xl'
                    onClick={() => {
                        dispatch(toggleLabelMenu());
                    }}
                >
                    ×
                </button>
            </div>

            <div className='flex items-center border rounded-md overflow-hidden mb-4'>
                <input
                    ref={labelSearchRef}
                    type='text'
                    maxLength={50}
                    placeholder='Enter label name'
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        dispatch(setSearchQuery(e.target.value))
                    }
                    onKeyDown={handleLabelSearchKeyDown}
                    className='w-full px-3 py-2 outline-none'
                />
                <div
                    className='px-3 py-2 cursor-pointer bg-blue-500 text-white hover:bg-blue-600'
                    onClick={addNewLabel}
                >
                    +
                </div>
            </div>

            <div className='max-h-60 overflow-y-auto space-y-2'>
                {labels
                    .filter(
                        (label: LabelI) =>
                            label.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                            searchQuery === ''
                    )
                    .map((label: LabelI) => (
                        <div
                            key={label.name}
                            className='flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-100'
                            onClick={() => handleToggleLabel(label.name)}
                        >
                            <input
                                type='checkbox'
                                checked={label.added}
                                onChange={() => handleToggleLabel(label.name)}
                                className='mr-2 cursor-pointer'
                            />
                            <span className='flex-1'>{label.name}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default LabelMenu;
