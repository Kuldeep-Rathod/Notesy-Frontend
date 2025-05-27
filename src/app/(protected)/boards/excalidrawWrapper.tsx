'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
    Excalidraw,
    convertToExcalidrawElements,
    exportToBlob,
} from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { Button } from '@/components/ui/button';
import {
    useCreateBoardMutation,
    useUpdateBoardMutation,
    useGetBoardQuery,
} from '@/redux/api/boardsAPI';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const ExcalidrawWrapper: React.FC = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [boardTitle, setBoardTitle] = useState<string>('Untitled Board');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const boardId = searchParams.get('id');

    const [createBoard] = useCreateBoardMutation();
    const [updateBoard] = useUpdateBoardMutation();

    // Use polling for immediate data updates
    const {
        data: board,
        isLoading,
        refetch,
    } = useGetBoardQuery(boardId || '', {
        skip: !boardId,
        pollingInterval: boardId ? 3000 : 0, // Poll every 3 seconds if we have a boardId
    });

    // Load board data if editing an existing board
    useEffect(() => {
        if (board && excalidrawAPI && !isDataLoaded) {
            setBoardTitle(board.title);

            try {
                // Create deep copies of the elements to avoid read-only issues
                const elements = JSON.parse(
                    JSON.stringify(board.data.elements || [])
                );
                const appState = JSON.parse(
                    JSON.stringify(board.data.appState || {})
                );

                // Update the scene with the cloned objects
                excalidrawAPI.updateScene({
                    elements: elements,
                    appState: appState,
                });

                setIsDataLoaded(true);
            } catch (error) {
                console.error('Error loading board data:', error);
                toast.error('Failed to load board data');
            }
        }
    }, [board, excalidrawAPI, isDataLoaded]);

    // Force refetch when boardId changes
    useEffect(() => {
        if (boardId) {
            setIsDataLoaded(false);
            refetch();
        }
    }, [boardId, refetch]);

    const handleSaveBoard = async () => {
        if (!excalidrawAPI) return;

        setIsSaving(true);

        try {
            // Get current elements and state from Excalidraw
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();

            // Create a deep copy to ensure we're not passing read-only objects
            const boardData = {
                elements: JSON.parse(JSON.stringify(elements)),
                appState: JSON.parse(JSON.stringify(appState)),
                files: JSON.parse(JSON.stringify(files || {})),
            };

            if (boardId) {
                // Update existing board
                const result = await updateBoard({
                    id: boardId,
                    title: boardTitle,
                    data: boardData,
                }).unwrap();

                toast.success('Board updated successfully');

                // Force refetch to get the latest data
                refetch();
            } else {
                // Create new board
                const result = await createBoard({
                    title: boardTitle,
                    data: boardData,
                }).unwrap();

                // Redirect to the board with ID
                router.push(`/boards?id=${result._id}`);
                toast.success('Board created successfully');
            }
        } catch (error) {
            console.error('Error saving board:', error);
            toast.error('Failed to save board');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
            }}
        >
            <div
                style={{
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <input
                    type='text'
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    style={{
                        padding: '8px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        width: '300px',
                    }}
                    placeholder='Board Title'
                />
                <div className='flex gap-2'>
                    {boardId && (
                        <Button
                            variant='outline'
                            onClick={() => {
                                setIsDataLoaded(false);
                                refetch();
                                toast.info('Refreshing board data...');
                            }}
                            disabled={isSaving || isLoading}
                        >
                            Refresh
                        </Button>
                    )}
                    <Button
                        onClick={handleSaveBoard}
                        disabled={isSaving}
                    >
                        {isSaving
                            ? 'Saving...'
                            : boardId
                            ? 'Update Board'
                            : 'Save Board'}
                    </Button>
                </div>
            </div>
            <div style={{ flex: 1 }}>
                {isLoading && !isDataLoaded ? (
                    <div className='flex items-center justify-center h-full'>
                        <div className='text-center'>
                            <div className='w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4'></div>
                            <p>Loading board...</p>
                        </div>
                    </div>
                ) : (
                    <Excalidraw
                        excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    />
                )}
            </div>
        </div>
    );
};

export default ExcalidrawWrapper;
