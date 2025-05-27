'use client';

import {
    Archive,
    CheckSquare,
    Clock,
    Edit,
    Home,
    Mic,
    Navigation,
    Palette,
    Search,
    Tag,
    Trash2,
    Users,
    Volume2,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface CommandItem {
    primary: string;
    alternatives: string[];
    description: string;
    example: string;
}

interface CommandCategory {
    category: string;
    items: CommandItem[];
}

interface CommandSection {
    title: string;
    icon: React.ReactNode;
    description: string;
    commands: CommandCategory[];
}

interface VoiceCommandsManualProps {
    isOpen: boolean;
    onClose: () => void;
}

const VoiceCommandsManual: React.FC<VoiceCommandsManualProps> = ({
    isOpen,
    onClose,
}) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeSection, setActiveSection] =
        useState<string>('getting-started');

    const commandSections: Record<string, CommandSection> = {
        'getting-started': {
            title: 'Getting Started',
            icon: <Home className='w-5 h-5' />,
            description: 'Learn how to activate and use voice commands',
            commands: [
                {
                    category: 'Activation',
                    items: [
                        {
                            primary: 'Hey Assistant',
                            alternatives: ['Hey Notsy'],
                            description:
                                'Activate voice assistant (Premium feature)',
                            example: 'Say "Hey Assistant" to start',
                        },
                        {
                            primary: 'Never Mind',
                            alternatives: [],
                            description: 'Deactivate voice assistant',
                            example: 'Say "Never mind" to stop listening',
                        },
                    ],
                },
            ],
        },
        navigation: {
            title: 'Navigation',
            icon: <Navigation className='w-5 h-5' />,
            description: 'Navigate between different pages and sections',
            commands: [
                {
                    category: 'Page Navigation',
                    items: [
                        {
                            primary: 'Go to *',
                            alternatives: ['Navigate to *', 'Hey app go to *'],
                            description:
                                'Navigate to any page (dashboard, archive, trash, profile, labels, reminders, statistics)',
                            example: 'Go to dashboard, Navigate to archive',
                        },
                    ],
                },
                {
                    category: 'Account Management',
                    items: [
                        {
                            primary: 'Logout User',
                            alternatives: [
                                'Signout user',
                                'Sign out',
                                'Log out',
                            ],
                            description: 'Sign out of your account',
                            example: 'Logout user',
                        },
                        {
                            primary: 'Manage Plans',
                            alternatives: [
                                'Manage subscription',
                                'Subscription',
                                'Manage billing',
                            ],
                            description:
                                'Access billing and subscription management',
                            example: 'Manage subscription',
                        },
                    ],
                },
            ],
        },
        'note-editing': {
            title: 'Note Editing',
            icon: <Edit className='w-5 h-5' />,
            description: 'Create and edit notes with voice commands',
            commands: [
                {
                    category: 'Note Creation',
                    items: [
                        {
                            primary: 'Create Note',
                            alternatives: ['New note', 'Add note'],
                            description: 'Create a new note',
                            example: 'Create note',
                        },
                    ],
                },
                {
                    category: 'Title Management',
                    items: [
                        {
                            primary: 'Focus Title',
                            alternatives: [
                                'Edit title',
                                'Change title',
                                'Go to title',
                                'Set title',
                            ],
                            description: 'Focus on the note title field',
                            example: 'Focus title',
                        },
                        {
                            primary: 'Set Title *',
                            alternatives: [
                                'Title is *',
                                'Make title *',
                                'Write title *',
                            ],
                            description: 'Set the note title to specific text',
                            example: 'Set title Meeting Notes',
                        },
                    ],
                },
                {
                    category: 'Content Management',
                    items: [
                        {
                            primary: 'Focus Body',
                            alternatives: [
                                'Edit content',
                                'Write note',
                                'Go to description',
                                'Set description',
                            ],
                            description: 'Focus on the note content area',
                            example: 'Focus body',
                        },
                        {
                            primary: 'Set Content *',
                            alternatives: [
                                'Set body *',
                                'Write content *',
                                'Write body *',
                                'Content is *',
                                'Body is *',
                            ],
                            description:
                                'Set the note content to specific text',
                            example: 'Set content This is my note content',
                        },
                        {
                            primary: 'Append Content *',
                            alternatives: [
                                'Add content *',
                                'Continue writing *',
                                'Add to body *',
                            ],
                            description:
                                'Add text to the end of existing content',
                            example: 'Append content Additional information',
                        },
                    ],
                },
                {
                    category: 'Note Actions',
                    items: [
                        {
                            primary: 'Pin Note',
                            alternatives: [
                                'Pin this',
                                'Make important',
                                'Unpin note',
                                'Remove pin',
                            ],
                            description: 'Toggle pin status of the note',
                            example: 'Pin note',
                        },
                        {
                            primary: 'Save Note',
                            alternatives: [
                                'Save changes',
                                'Store note',
                                'Keep note',
                            ],
                            description: 'Save the current note',
                            example: 'Save note',
                        },
                        {
                            primary: 'Close Note',
                            alternatives: ['Discard changes'],
                            description: 'Close the note editor',
                            example: 'Close note',
                        },
                    ],
                },
            ],
        },
        reminders: {
            title: 'Reminders',
            icon: <Clock className='w-5 h-5' />,
            description: 'Set and manage note reminders',
            commands: [
                {
                    category: 'Reminder Management',
                    items: [
                        {
                            primary: 'Set Reminder',
                            alternatives: ['Add reminder', 'Schedule reminder'],
                            description: 'Open reminder menu',
                            example: 'Set reminder',
                        },
                        {
                            primary: 'Remind Me Today',
                            alternatives: [
                                'Later today',
                                'Remind me later today',
                                'Today reminder',
                            ],
                            description: 'Set reminder for later today',
                            example: 'Remind me today',
                        },
                        {
                            primary: 'Remind Tomorrow',
                            alternatives: [
                                'Tomorrow reminder',
                                'Next day reminder',
                            ],
                            description: 'Set reminder for tomorrow',
                            example: 'Remind tomorrow',
                        },
                        {
                            primary: 'Remind Next Week',
                            alternatives: [
                                'Next week reminder',
                                'Week reminder',
                            ],
                            description: 'Set reminder for next week',
                            example: 'Remind next week',
                        },
                        {
                            primary: 'Remove Reminder',
                            alternatives: ['Clear reminder', 'Delete reminder'],
                            description: 'Remove existing reminder',
                            example: 'Remove reminder',
                        },
                    ],
                },
            ],
        },
        collaboration: {
            title: 'Collaboration',
            icon: <Users className='w-5 h-5' />,
            description: 'Share notes and manage collaborators',
            commands: [
                {
                    category: 'Collaborator Management',
                    items: [
                        {
                            primary: 'Add Collaborator',
                            alternatives: [
                                'Share note',
                                'Invite people',
                                'Manage sharing',
                            ],
                            description: 'Open collaborator menu',
                            example: 'Add collaborator',
                        },
                        {
                            primary: 'User Find *',
                            alternatives: [
                                'User search *',
                                'User search for *',
                                'Look up user *',
                            ],
                            description: 'Search for users to collaborate with',
                            example: 'User find john@example.com',
                        },
                        {
                            primary: 'Add User *',
                            alternatives: [
                                'Share with *',
                                'Invite *',
                                'Collaborator *',
                            ],
                            description: 'Add a specific user as collaborator',
                            example: 'Add user john@example.com',
                        },
                        {
                            primary: 'Remove User *',
                            alternatives: [
                                'Unshare with *',
                                'Delete collaborator *',
                            ],
                            description: 'Remove a collaborator',
                            example: 'Remove user john@example.com',
                        },
                        {
                            primary: 'Clear User Search',
                            alternatives: [
                                'Reset user search',
                                'Cancel user search',
                            ],
                            description: 'Clear the user search field',
                            example: 'Clear user search',
                        },
                    ],
                },
            ],
        },
        labels: {
            title: 'Labels & Tags',
            icon: <Tag className='w-5 h-5' />,
            description: 'Organize notes with labels and tags',
            commands: [
                {
                    category: 'Label Management',
                    items: [
                        {
                            primary: 'Open Labels',
                            alternatives: [
                                'Manage labels',
                                'Manage tags',
                                'Show labels',
                                'Edit tags',
                            ],
                            description: 'Open the labels menu',
                            example: 'Open labels',
                        },
                        {
                            primary: 'Take Search *',
                            alternatives: ['Label find *', 'Look for label *'],
                            description: 'Search for existing labels',
                            example: 'Take search work',
                        },
                        {
                            primary: 'New Label',
                            alternatives: ['Make label', 'Add new tag'],
                            description: 'Create a new label',
                            example: 'New label',
                        },
                        {
                            primary: 'Label With *',
                            alternatives: [
                                'Tag with *',
                                'Take with *',
                                'Label as *',
                            ],
                            description: 'Apply a label to the note',
                            example: 'Label with work',
                        },
                        {
                            primary: 'Clear Label Search',
                            alternatives: [
                                'Reset label search',
                                'Clear tag search',
                                'Reset tag search',
                            ],
                            description: 'Clear the label search field',
                            example: 'Clear label search',
                        },
                    ],
                },
                {
                    category: 'Label Page Commands',
                    items: [
                        {
                            primary: 'New Label *',
                            alternatives: ['New tag *'],
                            description:
                                'Create a new label with specific name',
                            example: 'New label Important',
                        },
                        {
                            primary: 'Create Label',
                            alternatives: ['Create tag', 'Create'],
                            description: 'Confirm label creation',
                            example: 'Create label',
                        },
                        {
                            primary: 'Delete Label *',
                            alternatives: [
                                'Remove label *',
                                'Delete tag *',
                                'Remove tag *',
                            ],
                            description: 'Delete a specific label',
                            example: 'Delete label work',
                        },
                        {
                            primary: 'Rename Label * to *',
                            alternatives: [
                                'Change label * to *',
                                'Rename tag * to *',
                                'Change tag * to *',
                            ],
                            description: 'Rename an existing label',
                            example: 'Rename label work to office',
                        },
                    ],
                },
            ],
        },
        checklists: {
            title: 'Checklists',
            icon: <CheckSquare className='w-5 h-5' />,
            description: 'Create and manage task lists within notes',
            commands: [
                {
                    category: 'Checkbox Management',
                    items: [
                        {
                            primary: 'Show Checkboxes',
                            alternatives: ['Show checklist', 'Show tasks'],
                            description: 'Enable checkbox mode for the note',
                            example: 'Show checkboxes',
                        },
                        {
                            primary: 'Add Item *',
                            alternatives: ['New task *', 'Create checklist *'],
                            description: 'Add a new checklist item',
                            example: 'Add item Buy groceries',
                        },
                        {
                            primary: 'Complete *',
                            alternatives: [
                                'Check *',
                                'Mark * as done',
                                'Uncheck *',
                                'Toggle *',
                            ],
                            description:
                                'Toggle completion status of a checklist item',
                            example: 'Complete Buy groceries',
                        },
                    ],
                },
            ],
        },
        appearance: {
            title: 'Appearance',
            icon: <Palette className='w-5 h-5' />,
            description: 'Customize note colors and appearance',
            commands: [
                {
                    category: 'Color Management',
                    items: [
                        {
                            primary: 'Change Colour',
                            alternatives: [
                                'Show colours',
                                'Colour options',
                                'Close colour options',
                            ],
                            description: 'Open color picker menu',
                            example: 'Change colour',
                        },
                        {
                            primary: 'Set Colour *',
                            alternatives: [
                                'Make *',
                                'Colour *',
                                'Background *',
                            ],
                            description:
                                'Set note background to specific color',
                            example: 'Set colour blue',
                        },
                    ],
                },
                {
                    category: 'View Options',
                    items: [
                        {
                            primary: 'Grid View',
                            alternatives: [
                                'Grade view',
                                'Switch to grid',
                                'Switch to grade',
                                'Show grid',
                                'Show grade',
                            ],
                            description: 'Switch to grid layout',
                            example: 'Grid view',
                        },
                        {
                            primary: 'List View',
                            alternatives: ['Switch to list', 'Show list'],
                            description: 'Switch to list layout',
                            example: 'List view',
                        },
                    ],
                },
            ],
        },
        'note-management': {
            title: 'Note Management',
            icon: <Archive className='w-5 h-5' />,
            description: 'Manage, organize, and find your notes',
            commands: [
                {
                    category: 'Search & Navigation',
                    items: [
                        {
                            primary: 'Search *',
                            alternatives: ['Find *', 'Look for *'],
                            description: 'Search for notes by content or title',
                            example: 'Search meeting notes',
                        },
                        {
                            primary: 'Clear Search',
                            alternatives: ['Reset search'],
                            description: 'Clear the search field',
                            example: 'Clear search',
                        },
                    ],
                },
                {
                    category: 'Note Actions',
                    items: [
                        {
                            primary: 'Open Note *',
                            alternatives: [
                                'Edit not *',
                                'Open the note *',
                                'Edit the note *',
                            ],
                            description: 'Open a specific note for editing',
                            example: 'Open note meeting agenda',
                        },
                        {
                            primary: 'Delete Note *',
                            alternatives: ['Delete not *', 'Delete the note *'],
                            description: 'Move a note to trash',
                            example: 'Delete note old draft',
                        },
                        {
                            primary: 'Archive Note *',
                            alternatives: [
                                'Archive *',
                                'Archive the note *',
                                'Toggle archive *',
                                'Toggle archive note',
                            ],
                            description: 'Archive or unarchive a note',
                            example: 'Archive note completed project',
                        },
                        {
                            primary: 'Copy Not *',
                            alternatives: ['Clone not *', 'Clone the note *'],
                            description: 'Create a copy of an existing note',
                            example: 'Copy note template',
                        },
                        {
                            primary: 'Pin the Note *',
                            alternatives: ['Pin not *', 'Pin a note *'],
                            description: 'Pin or unpin a specific note',
                            example: 'Pin the note important reminders',
                        },
                        {
                            primary: 'Archive Current Note',
                            alternatives: [
                                'Archive note',
                                'Archive this note',
                                'Archive this not',
                            ],
                            description: 'Archive the currently open note',
                            example: 'Archive current note',
                        },
                    ],
                },
            ],
        },
        'trash-management': {
            title: 'Trash Management',
            icon: <Trash2 className='w-5 h-5' />,
            description: 'Manage deleted notes and permanent deletion',
            commands: [
                {
                    category: 'Trash Actions',
                    items: [
                        {
                            primary: 'Restore Note *',
                            alternatives: [
                                'Restore *',
                                'Bring back note *',
                                'Bring back *',
                                'Recover note *',
                                'Recover *',
                                'Move note * back',
                                'Move * back',
                                'Put back note *',
                                'Put back *',
                            ],
                            description: 'Restore a note from trash',
                            example: 'Restore note meeting minutes',
                        },
                        {
                            primary: 'Delete Forever Note *',
                            alternatives: [
                                'Delete forever *',
                                'Permanently delete note *',
                                'Permanently delete *',
                            ],
                            description:
                                'Permanently delete a note (cannot be undone)',
                            example: 'Delete forever note old draft',
                        },
                    ],
                },
            ],
        },
    };

    const filteredSections = useMemo(() => {
        if (!searchTerm) return commandSections;

        const filtered: Record<string, CommandSection> = {};
        Object.entries(commandSections).forEach(([key, section]) => {
            const matchingCommands = section.commands
                .map((category) => ({
                    ...category,
                    items: category.items.filter(
                        (item) =>
                            item.primary
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                            item.alternatives.some((alt) =>
                                alt
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                            ) ||
                            item.description
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                    ),
                }))
                .filter((category) => category.items.length > 0);

            if (matchingCommands.length > 0) {
                filtered[key] = { ...section, commands: matchingCommands };
            }
        });

        return filtered;
    }, [searchTerm, commandSections]);

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden'>
                {/* Sidebar */}
                <div className='w-80 bg-gray-50 border-r overflow-y-auto'>
                    <div className='p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
                        <div className='flex items-center gap-3 mb-4'>
                            <Mic className='w-8 h-8' />
                            <div>
                                <h2 className='text-xl font-bold'>
                                    Voice Commands
                                </h2>
                                <p className='text-blue-100 text-sm'>
                                    Complete User Manual
                                </p>
                            </div>
                        </div>

                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Search commands...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className='w-full pl-10 pr-4 py-2 rounded-lg border-0 bg-white/20 text-white placeholder-blue-200 focus:bg-white/30 focus:outline-none'
                            />
                        </div>
                    </div>

                    <nav className='p-4'>
                        {Object.entries(filteredSections).map(
                            ([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors mb-2 ${
                                        activeSection === key
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                            : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {section.icon}
                                    <div>
                                        <div className='font-medium'>
                                            {section.title}
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                            {section.description}
                                        </div>
                                    </div>
                                </button>
                            )
                        )}
                    </nav>
                </div>

                {/* Main Content */}
                <div className='flex-1 flex flex-col'>
                    <div className='flex items-center justify-between p-6 border-b bg-white'>
                        <div>
                            <h3 className='text-2xl font-bold text-gray-800'>
                                {filteredSections[activeSection]?.title ||
                                    'Commands'}
                            </h3>
                            <p className='text-gray-600 mt-1'>
                                {filteredSections[activeSection]?.description}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                        >
                            <X className='w-6 h-6' />
                        </button>
                    </div>

                    <div className='flex-1 overflow-y-auto p-6'>
                        {filteredSections[activeSection]?.commands.map(
                            (category, categoryIndex) => (
                                <div
                                    key={categoryIndex}
                                    className='mb-8'
                                >
                                    <h4 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                        {category.category}
                                    </h4>

                                    <div className='grid gap-4'>
                                        {category.items.map(
                                            (command, commandIndex) => (
                                                <div
                                                    key={commandIndex}
                                                    className='bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500'
                                                >
                                                    <div className='flex items-start gap-4'>
                                                        <Volume2 className='w-5 h-5 text-blue-500 mt-1 flex-shrink-0' />
                                                        <div className='flex-1'>
                                                            <div className='flex flex-wrap gap-2 mb-2'>
                                                                <code className='bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold text-sm'>
                                                                    &quot;
                                                                    {
                                                                        command.primary
                                                                    }
                                                                    &quot;
                                                                </code>
                                                                {command.alternatives.map(
                                                                    (
                                                                        alt,
                                                                        altIndex
                                                                    ) => (
                                                                        <code
                                                                            key={
                                                                                altIndex
                                                                            }
                                                                            className='bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs'
                                                                        >
                                                                            &quot;
                                                                            {
                                                                                alt
                                                                            }
                                                                            &quot;
                                                                        </code>
                                                                    )
                                                                )}
                                                            </div>

                                                            <p className='text-gray-700 mb-2'>
                                                                {
                                                                    command.description
                                                                }
                                                            </p>

                                                            <div className='bg-green-50 border border-green-200 rounded p-2'>
                                                                <span className='text-green-700 text-sm font-medium'>
                                                                    Example:{' '}
                                                                </span>
                                                                <span className='text-green-600 text-sm font-mono'>
                                                                    &quot;
                                                                    {
                                                                        command.example
                                                                    }
                                                                    &quot;
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}

                        {Object.keys(filteredSections).length === 0 && (
                            <div className='text-center py-12'>
                                <Search className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                                <h3 className='text-lg font-medium text-gray-500 mb-2'>
                                    No commands found
                                </h3>
                                <p className='text-gray-400'>
                                    Try adjusting your search terms
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='border-t bg-gray-50 p-4'>
                        <div className='flex items-center justify-between text-sm text-gray-600'>
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                <span>
                                    Voice assistant requires Premium
                                    subscription
                                </span>
                            </div>
                            <div className='text-xs'>
                                Say{' '}
                                <code className='bg-gray-200 px-1 rounded'>
                                    &quot;Hey Assistant&quot;
                                </code>{' '}
                                to activate
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Example usage component
const UserManual: React.FC = () => {
    const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

    return (
        <>
            <button
                onClick={() => setIsManualOpen(true)}
                className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer'
            >
                <Mic className='w-5 h-5' />
                Open Voice Commands Manual
            </button>

            <VoiceCommandsManual
                isOpen={isManualOpen}
                onClose={() => setIsManualOpen(false)}
            />
        </>
    );
};

export default UserManual;
