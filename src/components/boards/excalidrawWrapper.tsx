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
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { debounce } from 'lodash-es';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ExcalidrawWrapper: React.FC = () => {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [boardTitle, setBoardTitle] = useState<string>('Untitled Board');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Use refs to track loading state and prevent multiple loads
    const hasLoadedData = useRef<boolean>(false);
    const currentBoardId = useRef<string | null>(null);
    const isLoadingRef = useRef<boolean>(false);
    const isAutoSavingRef = useRef<boolean>(false);

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

    // Auto-save configuration
    const AUTO_SAVE_DELAY = 2000;

    useEffect(() => {
        if (currentBoardId.current !== boardId) {
            currentBoardId.current = boardId;
            hasLoadedData.current = false;
            setIsInitialized(false);
            setBoardTitle(boardId ? 'Loading...' : 'Untitled Board');
            setLastSaved(null);
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

    const performSave = useCallback(
        async (isAutoSave = false) => {
            if (!excalidrawAPI) {
                if (!isAutoSave) {
                    toast.error('Drawing canvas not ready');
                }
                return false;
            }

            // Prevent multiple simultaneous saves
            if (isAutoSavingRef.current) {
                return false;
            }

            isAutoSavingRef.current = true;

            if (isAutoSave) {
                setIsAutoSaving(true);
            } else {
                setIsSaving(true);
            }

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

                    if (!isAutoSave) {
                        toast.success('Board updated successfully');
                    }
                    setLastSaved(new Date());

                    await refetch();
                } else {
                    const result = await createBoard({
                        title: boardTitle,
                        data: boardData,
                    }).unwrap();

                    router.push(`/boards?id=${result._id}`);
                    if (!isAutoSave) {
                        toast.success('Board created successfully');
                    }
                    setLastSaved(new Date());
                }

                return true;
            } catch (error) {
                console.error('Error saving board:', error);
                if (!isAutoSave) {
                    toast.error('Failed to save board. Please try again.');
                }
                return false;
            } finally {
                isAutoSavingRef.current = false;
                if (isAutoSave) {
                    setIsAutoSaving(false);
                } else {
                    setIsSaving(false);
                }
            }
        },
        [
            excalidrawAPI,
            boardId,
            boardTitle,
            createMutableCopy,
            updateBoard,
            createBoard,
            refetch,
            router,
        ]
    );

    // Create debounced auto-save function using lodash
    const debouncedAutoSave = useMemo(
        () =>
            debounce(() => {
                // Only auto-save for existing boards and when initialized
                if (boardId && isInitialized) {
                    performSave(true);
                }
            }, AUTO_SAVE_DELAY),
        [boardId, isInitialized, performSave, AUTO_SAVE_DELAY]
    );

    // Create debounced title save function
    const debouncedTitleSave = useMemo(
        () =>
            debounce(() => {
                if (boardId && isInitialized) {
                    performSave(true);
                }
            }, AUTO_SAVE_DELAY),
        [boardId, isInitialized, performSave, AUTO_SAVE_DELAY]
    );

    // Handle changes in the drawing
    const handleChange = useCallback(
        (elements: any, appState: any, files: any) => {
            if (!isInitialized) return;

            // Trigger debounced auto-save
            debouncedAutoSave();
        },
        [isInitialized, debouncedAutoSave]
    );

    // Handle title changes
    const handleTitleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setBoardTitle(e.target.value);

            // Trigger debounced auto-save for title changes
            debouncedTitleSave();
        },
        [debouncedTitleSave]
    );

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
            setLastSaved(new Date(board.updatedAt || board.createdAt));
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

    // Manual save handler
    const handleSaveBoard = useCallback(async () => {
        // Cancel pending debounced saves since we're doing manual save
        debouncedAutoSave.cancel();
        debouncedTitleSave.cancel();

        await performSave(false);
    }, [performSave, debouncedAutoSave, debouncedTitleSave]);

    const handleExcalidrawAPI = useCallback((api: any) => {
        setExcalidrawAPI(api);
    }, []);

    // Cleanup debounced functions on unmount
    useEffect(() => {
        return () => {
            debouncedAutoSave.cancel();
            debouncedTitleSave.cancel();
        };
    }, [debouncedAutoSave, debouncedTitleSave]);

    // Format last saved time
    const formatLastSaved = useCallback((date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) {
            return 'just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else {
            const hours = Math.floor(minutes / 60);
            return `${hours}h ago`;
        }
    }, []);

    return (
        <div className='flex flex-col h-full w-full'>
            <div className='p-2 flex justify-between items-center border-b border-gray-200 bg-gray-50'>
                <div className='mb-2 ml-2'>
                    <Link href='/boards'>
                        <Button
                            variant='ghost'
                            size='sm'
                        >
                            <ArrowLeft className='h-4 w-4 mr-1' /> Back to
                            Boards
                        </Button>
                    </Link>
                </div>
                <input
                    type='text'
                    value={boardTitle}
                    onChange={handleTitleChange}
                    className='px-3 py-2 text-base border border-gray-300 rounded-md w-72 outline-none'
                    placeholder='Board Title'
                    disabled={isLoading && !isInitialized}
                />

                <div className='flex gap-2 items-center'>
                    {/* Auto-save status */}
                    {isAutoSaving && (
                        <div className='flex items-center gap-2 text-sm text-blue-600'>
                            <div className='w-3 h-3 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin'></div>
                            Auto-saving...
                        </div>
                    )}

                    {/* Last saved indicator */}
                    {lastSaved && !isAutoSaving && !isSaving && (
                        <div className='text-sm text-gray-500'>
                            Saved {formatLastSaved(lastSaved)}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {(isLoading || !isInitialized) && boardId && (
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                            <div className='w-4 h-4 border-2 border-t-blue-500 border-gray-200 rounded-full animate-spin'></div>
                            Loading...
                        </div>
                    )}

                    <Button
                        onClick={handleSaveBoard}
                        disabled={isSaving || !excalidrawAPI}
                        size='sm'
                    >
                        {isSaving
                            ? 'Saving...'
                            : boardId
                            ? 'Save Now'
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
                        onChange={handleChange}
                    />
                )}
            </div>
        </div>
    );
};

export default ExcalidrawWrapper;
