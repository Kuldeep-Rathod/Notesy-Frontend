import { Board } from '@/redux/api/boardsAPI';
import { speak } from '../VoiceRouter';

interface BoardsContainerCommandsParams {
    handlers: {
        handleCreateNew: () => void;
        handleEditBoard: (boardId: string) => void;
        handleDeleteBoard: (boardId: string) => void;
        handleRefresh: () => void;
    };
    boards: Board[];
}

export const getBoardsContainerCommands = ({
    handlers,
    boards,
}: BoardsContainerCommandsParams) => [
    {
        command: ['create new board', 'new board', 'add board'],
        callback: () => {
            handlers.handleCreateNew();
            speak('Creating a new board.');
        },
        isFuzzyMatch: true,
    },
    {
        command: ['refresh boards', 'reload boards', 'update boards'],
        callback: () => {
            handlers.handleRefresh();
            speak('Refreshing boards.');
        },
        isFuzzyMatch: true,
    },
    {
        command: ['edit board *', 'modify board *'],
        callback: (title: string) => {
            if (!title?.trim() || !boards?.length) return;

            const normalizedTitle = title.toLowerCase().trim();
            const matchingBoard = boards.find((board) =>
                board.title?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingBoard && matchingBoard._id) {
                handlers.handleEditBoard(matchingBoard._id);
            }
            speak(`Editing board: ${matchingBoard?.title || 'Untitled board'}`);
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },
    {
        command: ['delete board *', 'remove board *'],
        callback: (title: string) => {
            if (!title?.trim() || !boards?.length) return;

            const normalizedTitle = title.toLowerCase().trim();
            const matchingBoard = boards.find((board) =>
                board.title?.toLowerCase().includes(normalizedTitle)
            );

            if (matchingBoard && matchingBoard._id) {
                handlers.handleDeleteBoard(matchingBoard._id);
            }
            speak(
                `Deleting board: ${matchingBoard?.title || 'Untitled board'}`
            );
        },
        isFuzzyMatch: false,
        matchInterim: false,
    },
];
