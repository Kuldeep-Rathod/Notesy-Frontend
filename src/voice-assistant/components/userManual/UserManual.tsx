'use client';

import { useGetCurrentUserQuery } from '@/redux/api/userAPI';
import { activateGesture } from '@/redux/reducer/gestureReducer';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Search, Volume2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CommandSectionProps, commandSections } from './commands';

interface VoiceCommandsManualProps {
    isOpen: boolean;
    onClose: () => void;
}

const VoiceCommandsManual: React.FC<VoiceCommandsManualProps> = ({
    isOpen,
    onClose,
}) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [activeSection, setActiveSection] =
        useState<string>('getting-started');

    const filteredSections = useMemo(() => {
        if (!searchTerm) return commandSections;

        const filtered: Record<string, CommandSectionProps> = {};
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

    const handleModalOpen = () => {
        dispatch(activateGesture());
    };

    const handleModalClose = () => {
        dispatch(activateGesture());
        onClose();
    };

    React.useEffect(() => {
        if (isOpen) {
            handleModalOpen();
        }
    }, [isOpen, dispatch]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className='fixed inset-0 w-full bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleModalClose}
            >
                <motion.div
                    className='bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex overflow-hidden'
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                >
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
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
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
                                    {
                                        filteredSections[activeSection]
                                            ?.description
                                    }
                                </p>
                            </div>
                            <button
                                onClick={handleModalClose}
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const UserManual: React.FC = () => {
    const dispatch = useDispatch();
    const { data: DbUser, isLoading: dbUserLoading } = useGetCurrentUserQuery();

    const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

    useEffect(() => {
        if (DbUser?.isPremium) {
            setIsManualOpen(true);
        }
    }, [DbUser]);

    const handleOpenManual = () => {
        dispatch(activateGesture());
        setIsManualOpen(true);
    };

    return (
        <>
            {!!DbUser && (
                <button
                    onClick={handleOpenManual}
                    className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer'
                >
                    <Mic className='w-5 h-5' />
                    Open Voice Commands Manual
                </button>
            )}

            <VoiceCommandsManual
                isOpen={isManualOpen}
                onClose={() => setIsManualOpen(false)}
            />
        </>
    );
};

export default UserManual;
