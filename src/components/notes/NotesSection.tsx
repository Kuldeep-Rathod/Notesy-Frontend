import { NoteI } from '@/interfaces/notes';
import { Masonry } from '@mui/lab';
import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard';

interface NotesSectionProps {
    title: string;
    icon: string;
    notes: NoteI[];
    viewType: 'grid' | 'list';
    onPinToggle: (noteId: string) => void;
    onArchiveToggle: (noteId: string) => void;
    onTrash: (noteId: string) => void;
    onEdit: (note: NoteI) => void;
    onChangeColor: (noteId: string, color: string) => void;
    onClone: (noteId: string) => void;
    onRestore?: (noteId: string) => void;
    onDelete?: (noteId: string) => void;
}

const NotesSection = ({
    title,
    icon,
    notes,
    viewType,
    onPinToggle,
    onArchiveToggle,
    onTrash,
    onEdit,
    onChangeColor,
    onClone,
    onRestore,
    onDelete,
}: NotesSectionProps) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 24 },
        },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    if (notes.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.section
                variants={itemVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
                className='bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden'
            >
                <div className='flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-3'>
                    <h3 className='text-gray-800 dark:text-gray-200 font-medium flex items-center gap-2'>
                        <span>
                            {icon} {title}
                        </span>
                        <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-0.5 rounded-full'>
                            {notes.length}
                        </span>
                    </h3>
                </div>

                <div className='p-4'>
                    {viewType === 'grid' ? (
                        <Masonry
                            columns={{
                                xs: 1,
                                sm: 3,
                                md: 4,
                                xl: 5,
                            }}
                            spacing={2}
                        >
                            <AnimatePresence mode='popLayout'>
                                {notes.map((note: NoteI) => (
                                    <motion.div
                                        key={note._id}
                                        layout
                                        initial='hidden'
                                        animate='visible'
                                        exit='exit'
                                        variants={itemVariants}
                                    >
                                        <NoteCard
                                            note={note}
                                            onPinToggle={onPinToggle}
                                            onArchiveToggle={onArchiveToggle}
                                            onTrash={onTrash}
                                            onEdit={onEdit}
                                            onChangeColor={onChangeColor}
                                            onClone={onClone}
                                            onRestore={onRestore}
                                            onDelete={onDelete}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </Masonry>
                    ) : (
                        <div className='flex flex-col w-full md:w-1/2 gap-4 mx-auto'>
                            <AnimatePresence mode='popLayout'>
                                {notes.map((note: NoteI) => (
                                    <motion.div
                                        key={note._id}
                                        layout
                                        initial='hidden'
                                        animate='visible'
                                        exit='exit'
                                        variants={itemVariants}
                                    >
                                        <NoteCard
                                            note={note}
                                            onPinToggle={onPinToggle}
                                            onArchiveToggle={onArchiveToggle}
                                            onTrash={onTrash}
                                            onEdit={onEdit}
                                            onChangeColor={onChangeColor}
                                            onClone={onClone}
                                            onRestore={onRestore}
                                            onDelete={onDelete}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.section>
        </AnimatePresence>
    );
};

export default NotesSection;
