import { useGetAllUsersQuery } from '@/redux/api/userAPI';
import { useDispatch, useSelector } from 'react-redux';
import { selectNoteInput, toggleCollaboratorMenu, setCollaboratorSearchTerm, addCollaborator, removeCollaborator } from '@/redux/reducer/noteInputReducer';
import { useState } from 'react';
import { DbUser } from '@/types/reducer-types';

interface CollaboratorMenuProps {
    onClose: () => void;
}

export function CollaboratorMenu({ onClose }: CollaboratorMenuProps) {
    const dispatch = useDispatch();
    const { data: users = [] } = useGetAllUsersQuery();
    const [error, setError] = useState<string | null>(null);
    
    const {
        collaborators: { selectedUsers, searchTerm },
        tooltips: { collaboratorMenuOpen }
    } = useSelector(selectNoteInput);

    // Filter out current user and already shared users
    const filteredUsers = users.filter((user: DbUser) => {
        const isNotCurrentUser = user._id !== localStorage.getItem('userId');
        const isNotAlreadySelected = !selectedUsers.some(u => u.uid === user._id);
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return isNotCurrentUser && isNotAlreadySelected && matchesSearch;
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setCollaboratorSearchTerm(e.target.value));
        setError(null);
    };

    const handleUserSelect = (user: DbUser) => {
        if (selectedUsers.some(u => u.uid === user._id)) {
            dispatch(removeCollaborator(user._id));
        } else {
            dispatch(addCollaborator({
                uid: user._id,
                email: user.email,
                name: user.name || user.email
            }));
        }
        setError(null);
    };

    if (!collaboratorMenuOpen) return null;

    return (
        <div className="note-input__collaborator-menu">
            <div className="note-input__collaborator-header">
                <h3>Share with others</h3>
                <button 
                    className="note-input__collaborator-close"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="note-input__collaborator-search">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            {error && (
                <div className="note-input__collaborator-error">
                    {error}
                </div>
            )}

            <div className="note-input__collaborator-list">
                {filteredUsers.length === 0 ? (
                    <div className="note-input__collaborator-empty">
                        No users found
                    </div>
                ) : (
                    filteredUsers.map((user: DbUser) => (
                        <div
                            key={user._id}
                            className={`note-input__collaborator-item ${
                                selectedUsers.some(u => u.uid === user._id) ? 'selected' : ''
                            }`}
                            onClick={() => handleUserSelect(user)}
                        >
                            <div className="note-input__collaborator-avatar">
                                {user.name?.charAt(0) || user.email.charAt(0)}
                            </div>
                            <div className="note-input__collaborator-info">
                                <div className="note-input__collaborator-name">
                                    {user.name || user.email}
                                </div>
                                <div className="note-input__collaborator-email">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedUsers.length > 0 && (
                <div className="note-input__collaborator-selected">
                    <h4>Selected users:</h4>
                    {selectedUsers.map(user => (
                        <div key={user.uid} className="note-input__collaborator-selected-item">
                            <span>{user.name || user.email}</span>
                            <button 
                                onClick={() => dispatch(removeCollaborator(user.uid))}
                                className="note-input__collaborator-remove"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="note-input__collaborator-footer">
                <button
                    className="note-input__collaborator-done-btn"
                    onClick={onClose}
                >
                    Done
                </button>
            </div>
        </div>
    );
} 