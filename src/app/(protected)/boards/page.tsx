'use client';

import BoardPreview from '@/components/boards/BoardPreview';
import { Button } from '@/components/ui/button';
import {
    useDeleteBoardMutation,
    useGetBoardsQuery,
} from '@/redux/api/boardsAPI';
import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { getBoardsContainerCommands } from '@/voice-assistant/commands/boardsCommand';
import usePageVoiceCommands from '@/voice-assistant/hooks/usePageVoiceCommands';
import VoiceTranscriptOverlay from '@/voice-assistant/hooks/VoiceTranscriptOverlay';
import { Calendar, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

const BoardsListPage = () => {
    const {
        data: boards,
        isLoading,
        refetch,
        isFetching,
    } = useGetBoardsQuery(undefined, {
        pollingInterval: 10000, // Poll every 10 seconds
    });

    const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();
    const { data: userData, isLoading: userLoading } = useGetCurrentUserQuery();
    const isPremium = userData?.isPremium;

    const router = useRouter();

    // Fetch boards on component mount
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleCreateNew = () => {
        router.push('/boards/edit');
    };

    const handleEditBoard = (id: string) => {
        router.push(`/boards/edit?id=${id}`);
    };

    const handleDeleteBoard = async (id: string) => {
        if (confirm('Are you sure you want to delete this board?')) {
            try {
                await deleteBoard(id).unwrap();
                toast.success('Board deleted successfully');
                refetch();
            } catch (error) {
                console.error('Error deleting board:', error);
                toast.error('Failed to delete board');
            }
        }
    };

    const handleRefresh = () => {
        refetch();
        toast.info('Refreshing boards...');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getElementsCount = (elements: any[]) => {
        if (!Array.isArray(elements)) return 0;
        return elements.length;
    };

    const boardsContainerCommands = getBoardsContainerCommands({
        handlers: {
            handleCreateNew,
            handleEditBoard,
            handleDeleteBoard,
            handleRefresh,
        },
        boards: boards || [],
    });

    // Voice command integration
    usePageVoiceCommands(
        {
            '/boards': boardsContainerCommands,
        },
        {
            debug: true,
            requireWakeWord: true,
        }
    );

    if (!isPremium) {
        toast.error('Upgrade to premium to access whiteboard');
        return router.push('/dashboard');
    }

    if (isLoading || userLoading) {
        return (
            <div className='flex justify-center items-center h-80'>
                <div className='text-center'>
                    <div className='w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-600'>Loading boards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto p-4 max-w-7xl'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        My Boards
                    </h1>
                    <p className='text-gray-600 mt-1'>
                        {boards?.length || 0} board
                        {boards?.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        onClick={handleRefresh}
                        disabled={isFetching}
                        className='flex items-center gap-2'
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isFetching ? 'animate-spin' : ''
                            }`}
                        />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleCreateNew}
                        className='flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600'
                    >
                        <Plus className='h-4 w-4' />
                        Create New Board
                    </Button>
                </div>
            </div>
            {boards?.length === 0 ? (
                <div className='text-center py-16'>
                    <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <Plus className='w-12 h-12 text-gray-400' />
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                        No boards yet
                    </h3>
                    <p className='text-gray-500 mb-6 max-w-sm mx-auto'>
                        Create your first board to start drawing and
                        collaborating
                    </p>
                    <Button
                        onClick={handleCreateNew}
                        size='lg'
                    >
                        <Plus className='mr-2 h-5 w-5' />
                        Create Your First Board
                    </Button>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {boards?.map((board) => (
                        <div
                            key={board._id}
                            className='bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group'
                        >
                            {/* Preview Section */}
                            <div className='relative'>
                                <BoardPreview
                                    elements={board.data.elements}
                                    appState={board.data.appState}
                                    files={board.data.files}
                                />
                            </div>

                            {/* Content Section */}
                            <div className='p-4'>
                                <div className='mb-3'>
                                    <h3
                                        className='text-lg font-semibold text-gray-900 truncate'
                                        title={board.title}
                                    >
                                        {board.title}
                                    </h3>
                                    <div className='flex items-center gap-3 mt-2 text-sm text-gray-500'>
                                        <div className='flex items-center gap-1'>
                                            <Calendar className='h-3 w-3' />
                                            {formatDate(board.createdAt)}
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                                            {getElementsCount(
                                                board.data?.elements
                                            )}{' '}
                                            elements
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='flex gap-2'>
                                    <Button
                                        variant='default'
                                        size='sm'
                                        onClick={() =>
                                            handleEditBoard(board._id)
                                        }
                                        className='flex-1 bg-indigo-500 hover:bg-indigo-600'
                                    >
                                        <Pencil className='h-3 w-3 mr-1' />
                                        Edit
                                    </Button>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            handleDeleteBoard(board._id)
                                        }
                                        disabled={isDeleting}
                                        className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                    >
                                        <Trash2 className='h-3 w-3' />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}{' '}
            <VoiceTranscriptOverlay pageCommands={getBoardsContainerCommands} />
        </div>
    );
};

export default BoardsListPage;
