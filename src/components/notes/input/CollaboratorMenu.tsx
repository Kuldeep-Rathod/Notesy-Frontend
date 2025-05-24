import { useGetAllUsersQuery } from '@/redux/api/userAPI';
import {
    addCollaborator,
    removeCollaborator,
    selectNoteInput,
    setCollaboratorSearchTerm,
} from '@/redux/reducer/noteInputReducer';
import { DbUser } from '@/types/reducer-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface CollaboratorMenuProps {
    onClose: (e: React.MouseEvent) => void;
}

export function CollaboratorMenu({ onClose }: CollaboratorMenuProps) {
    const dispatch = useDispatch();
    const { data: users = [] } = useGetAllUsersQuery();
    const [error, setError] = useState<string | null>(null);

    const {
        collaborators: { selectedUsers, searchTerm },
    } = useSelector(selectNoteInput);

    // Filter out current user and already shared users
    const filteredUsers = users.filter((user: DbUser) => {
        const isNotCurrentUser = user._id !== localStorage.getItem('userId');
        const isNotAlreadySelected = !selectedUsers.some(
            (u) => u.uid === user._id
        );
        const matchesSearch =
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return isNotCurrentUser && isNotAlreadySelected && matchesSearch;
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setCollaboratorSearchTerm(e.target.value));
        setError(null);
    };

    const handleUserSelect = (user: DbUser) => {
        if (selectedUsers.some((u) => u.uid === user._id)) {
            dispatch(removeCollaborator(user._id));
        } else {
            dispatch(
                addCollaborator({
                    uid: user._id,
                    email: user.email,
                    name: user.name || user.email,
                })
            );
        }
        setError(null);
    };

    return (
        <div className='w-[300px] p-4 space-y-4'>
            <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>
                    Share with others
                </h3>
                <button
                    className='text-gray-400 hover:text-gray-500'
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose(e);
                    }}
                >
                    ×
                </button>
            </div>

            <div className='relative'>
                <input
                    type='text'
                    placeholder='Search users...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                />
            </div>

            {error && (
                <div className='p-2 text-sm text-red-600 bg-red-50 rounded-md'>
                    {error}
                </div>
            )}

            <div className='space-y-2 max-h-[200px] overflow-y-auto'>
                {filteredUsers.length === 0 ? (
                    <div className='text-sm text-gray-500 text-center py-2'>
                        No users found
                    </div>
                ) : (
                    filteredUsers.map((user: DbUser) => (
                        <div
                            key={user._id}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUserSelect(user);
                            }}
                            className='flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer'
                        >
                            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center'>
                                {user.name?.charAt(0) || user.email.charAt(0)}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-gray-900 truncate'>
                                    {user.name || user.email}
                                </p>
                                <p className='text-sm text-gray-500 truncate'>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedUsers.length > 0 && (
                <div className='border-t pt-3'>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Selected users:
                    </h4>
                    <div className='space-y-2'>
                        {selectedUsers.map((user) => (
                            <div
                                key={user.uid}
                                className='flex items-center justify-between bg-gray-50 px-2 py-1 rounded'
                            >
                                <span className='text-sm text-gray-700'>
                                    {user.name || user.email}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        dispatch(removeCollaborator(user.uid));
                                    }}
                                    className='text-gray-400 hover:text-gray-500'
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
