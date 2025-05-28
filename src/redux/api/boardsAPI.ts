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
    keepUnusedDataFor: 60,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        getBoards: builder.query<Board[], void>({
            query: () => 'boards',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'Board' as const,
                              id: _id,
                          })),
                          { type: 'Board', id: 'LIST' },
                      ]
                    : [{ type: 'Board', id: 'LIST' }],
        }),

        getBoard: builder.query<Board, string>({
            query: (id) => `boards/${id}`,
            providesTags: (result, error, id) => [{ type: 'Board', id }],
        }),

        createBoard: builder.mutation<
            Board,
            { title: string; data: ExcalidrawData }
        >({
            query: (boardData) => ({
                url: 'boards',
                method: 'POST',
                body: boardData,
            }),
            invalidatesTags: [{ type: 'Board', id: 'LIST' }],
        }),

        updateBoard: builder.mutation<
            Board,
            { id: string; title: string; data: ExcalidrawData }
        >({
            query: ({ id, ...rest }) => ({
                url: `boards/${id}`,
                method: 'PUT',
                body: rest,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Board', id },
                { type: 'Board', id: 'LIST' },
            ],
        }),

        deleteBoard: builder.mutation<void, string>({
            query: (id) => ({
                url: `boards/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Board', id },
                { type: 'Board', id: 'LIST' },
            ],
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
