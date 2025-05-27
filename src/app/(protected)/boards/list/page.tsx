'use client';

import { useEffect } from 'react';
import { useGetBoardsQuery, useDeleteBoardMutation } from '@/redux/api/boardsAPI';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, RefreshCw } from 'lucide-react';

const BoardsListPage = () => {
    const { data: boards, isLoading, refetch, isFetching } = useGetBoardsQuery(undefined, {
        pollingInterval: 10000, // Poll every 10 seconds
    });
    
    const [deleteBoard, { isLoading: isDeleting }] = useDeleteBoardMutation();
    const router = useRouter();

    // Fetch boards on component mount
    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleCreateNew = () => {
        router.push('/boards');
    };

    const handleEditBoard = (id: string) => {
        router.push(`/boards?id=${id}`);
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-80">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading boards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Boards</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                    <Button onClick={handleCreateNew}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Board
                    </Button>
                </div>
            </div>

            {boards?.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You don&apos;t have any boards yet</p>
                    <Button onClick={handleCreateNew}>Create Your First Board</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boards?.map((board) => (
                        <div 
                            key={board._id} 
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold mb-2">{board.title}</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Last updated: {new Date(board.updatedAt).toLocaleString()}
                            </p>
                            <div className="flex justify-end space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditBoard(board._id)}
                                >
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteBoard(board._id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BoardsListPage;

