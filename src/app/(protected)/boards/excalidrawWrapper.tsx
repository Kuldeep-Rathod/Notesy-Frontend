'use client';

import { Button } from '@/components/ui/button';
import {
    useCreateBoardMutation,
    useGetBoardQuery,
    useUpdateBoardMutation,
} from '@/redux/api/boardsAPI';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const ExcalidrawWrapper: React.FC = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [boardTitle, setBoardTitle] = useState<string>('Untitled Board');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Use refs to track loading state and prevent multiple loads
    const hasLoadedData = useRef<boolean>(false);
    const currentBoardId = useRef<string | null>(null);
    const isLoadingRef = useRef<boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const boardId = searchParams.get('id');

    const [createBoard] = useCreateBoardMutation();
    const [updateBoard] = useUpdateBoardMutation();

    const {
        data: board,
        isLoading,
        refetch,
    } = useGetBoardQuery(boardId || '', {
        skip: !boardId,
        refetchOnMountOrArgChange: true,
    });

    useEffect(() => {
        if (currentBoardId.current !== boardId) {
            currentBoardId.current = boardId;
            hasLoadedData.current = false;
            setIsInitialized(false);
            setBoardTitle(boardId ? 'Loading...' : 'Untitled Board');
        }
    }, [boardId]);

    const createMutableCopy = useCallback((obj: any) => {
        if (!obj) return obj;
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.warn('Failed to clone object:', error);
            return obj;
        }
    }, []);

    const loadBoardData = useCallback(async () => {
        if (
            !excalidrawAPI ||
            !board ||
            hasLoadedData.current ||
            isLoadingRef.current
        ) {
            return;
        }

        // Prevent multiple simultaneous loads
        isLoadingRef.current = true;

        try {
            setBoardTitle(board.title || 'Untitled Board');

            const elements = createMutableCopy(board.data?.elements || []);
            const appState = createMutableCopy(board.data?.appState || {});
            const files = createMutableCopy(board.data?.files || {});

            const sceneData = {
                elements: elements,
                appState: {
                    ...appState,
                    // Ensure essential appState properties
                    viewBackgroundColor:
                        appState?.viewBackgroundColor || '#ffffff',
                    zoom: appState?.zoom || { value: 1 },
                    scrollX: appState?.scrollX || 0,
                    scrollY: appState?.scrollY || 0,
                },
                files: files,
            };

            await new Promise((resolve) => setTimeout(resolve, 100));

            excalidrawAPI.updateScene(sceneData);

            hasLoadedData.current = true;
            setIsInitialized(true);
        } catch (error) {
            console.error('Error loading board data:', error);
            toast.error('Failed to load board data');
        } finally {
            isLoadingRef.current = false;
        }
    }, [excalidrawAPI, board, createMutableCopy]);

    useEffect(() => {
        if (excalidrawAPI && board && !hasLoadedData.current) {
            loadBoardData();
        }
    }, [excalidrawAPI, board, loadBoardData]);

    const handleRefresh = useCallback(async () => {
        hasLoadedData.current = false;
        setIsInitialized(false);
        isLoadingRef.current = false;

        toast.info('Refreshing board data...');

        try {
            await refetch();
        } catch (error) {
            console.error('Error refreshing:', error);
            toast.error('Failed to refresh board data');
        }
    }, [refetch]);

    const handleSaveBoard = async () => {
        if (!excalidrawAPI) {
            toast.error('Drawing canvas not ready');
            return;
        }

        setIsSaving(true);

        try {
            const elements = excalidrawAPI.getSceneElements();
            const appState = excalidrawAPI.getAppState();
            const files = excalidrawAPI.getFiles();

            if (!elements || !appState) {
                throw new Error('No drawing data to save');
            }

            const elementsToSave = createMutableCopy(elements);
            const appStateToSave = createMutableCopy(appState);
            const filesToSave = createMutableCopy(files || {});

            const boardData = {
                elements: elementsToSave,
                appState: {
                    viewBackgroundColor: appStateToSave.viewBackgroundColor,
                    zoom: appStateToSave.zoom,
                    scrollX: appStateToSave.scrollX,
                    scrollY: appStateToSave.scrollY,
                },
                files: filesToSave,
            };

            if (boardId) {
                await updateBoard({
                    id: boardId,
                    title: boardTitle,
                    data: boardData,
                }).unwrap();

                toast.success('Board updated successfully');

                await refetch();
            } else {
                const result = await createBoard({
                    title: boardTitle,
                    data: boardData,
                }).unwrap();

                router.push(`/boards?id=${result._id}`);
                toast.success('Board created successfully');
            }
        } catch (error) {
            console.error('Error saving board:', error);
            toast.error('Failed to save board. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExcalidrawAPI = useCallback((api: any) => {
        setExcalidrawAPI(api);
    }, []);

    return (
        <div className='flex flex-col h-full w-full'>
            <div className='p-2 flex justify-between items-center border-b border-gray-200 bg-gray-50'>
                <input
                    type='text'
                    value={boardTitle}
                    onChange={(e) => setBoardTitle(e.target.value)}
                    className='px-3 py-2 text-base border border-gray-300 rounded-md w-72 outline-none'
                    placeholder='Board Title'
                    disabled={isLoading && !isInitialized}
                />

                <div className='flex gap-2 items-center'>
                    {(isLoading || !isInitialized) && boardId && (
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <div className='w-4 h-4 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin'></div>
                            Loading...
                        </div>
                    )}

                    {boardId && (
                        <Button
                            variant='outline'
                            onClick={handleRefresh}
                            disabled={isSaving || (isLoading && !isInitialized)}
                            size='sm'
                        >
                            Refresh
                        </Button>
                    )}

                    <Button
                        onClick={handleSaveBoard}
                        disabled={isSaving || !excalidrawAPI}
                        size='sm'
                    >
                        {isSaving
                            ? 'Saving...'
                            : boardId
                            ? 'Update Board'
                            : 'Save Board'}
                    </Button>
                </div>
            </div>

            <div className='flex-1 relative'>
                {isLoading && !isInitialized ? (
                    <div className='absolute inset-0 flex items-center justify-center bg-white z-10'>
                        <div className='text-center'>
                            <div className='w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4'></div>
                            <p className='text-gray-600'>Loading board...</p>
                        </div>
                    </div>
                ) : (
                    <Excalidraw
                        excalidrawAPI={handleExcalidrawAPI}
                        initialData={{
                            elements: [],
                            appState: {
                                viewBackgroundColor: '#ffffff',
                            },
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ExcalidrawWrapper;
