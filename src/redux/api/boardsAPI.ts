import { createApi } from '@reduxjs/toolkit/query/react';
import customBaseQuery from './customBaseQuery';

export interface ExcalidrawData {
    elements: any[];
    appState: any;
    files: any;
}

export interface Board {
    _id: string;
    title: string;
    data: ExcalidrawData;
    createdAt: string;
    updatedAt: string;
}

export const boardsAPI = createApi({
    reducerPath: 'boardsApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Board'],
    endpoints: (builder) => ({
        // Fetch all boards
        getBoards: builder.query<Board[], void>({
            query: () => 'boards',
            providesTags: ['Board'],
        }),

        // Fetch a single board
        getBoard: builder.query<Board, string>({
            query: (id) => `boards/${id}`,
            providesTags: (result, error, id) => [{ type: 'Board', id }],
        }),

        // Create a new board
        createBoard: builder.mutation<
            Board,
            { title: string; data: ExcalidrawData }
        >({
            query: (boardData) => ({
                url: 'boards',
                method: 'POST',
                body: boardData,
            }),
            invalidatesTags: ['Board'],
        }),

        // Update a board
        updateBoard: builder.mutation<
            Board,
            { id: string; title: string; data: ExcalidrawData }
        >({
            query: ({ id, ...rest }) => ({
                url: `boards/${id}`,
                method: 'PUT',
                body: rest,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Board', id }],
        }),

        // Delete a board
        deleteBoard: builder.mutation<void, string>({
            query: (id) => ({
                url: `boards/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Board'],
        }),
    }),
});

export const {
    useGetBoardsQuery,
    useGetBoardQuery,
    useCreateBoardMutation,
    useUpdateBoardMutation,
    useDeleteBoardMutation,
} = boardsAPI;
