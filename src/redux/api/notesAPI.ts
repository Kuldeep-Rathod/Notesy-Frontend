// features/api/notesApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NoteI } from '@/interfaces/notes';
import customBaseQuery from './customBaseQuery';

export const notesAPI = createApi({
    reducerPath: 'notesApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Note', 'TrashedNote', 'ArchivedNote'],
    endpoints: (builder) => ({
        createNote: builder.mutation<NoteI, Partial<NoteI>>({
            query: (noteData) => ({
                url: 'note',
                method: 'POST',
                body: noteData,
            }),
            invalidatesTags: ['Note'],
        }),

        getUserNotes: builder.query<NoteI[], string>({
            query: (firebaseUid) => `note/${firebaseUid}`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'Note' as const,
                              _id,
                          })),
                          { type: 'Note', id: 'LIST' },
                      ]
                    : [{ type: 'Note', id: 'LIST' }],
        }),

        getTrashedNotes: builder.query<NoteI[], void>({
            query: () => 'note/trashed',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'TrashedNote' as const,
                              _id,
                          })),
                          { type: 'TrashedNote', id: 'LIST' },
                      ]
                    : [{ type: 'TrashedNote', id: 'LIST' }],
        }),

        getArchivedNotes: builder.query<NoteI[], void>({
            query: () => 'note/archived',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'ArchivedNote' as const,
                              _id,
                          })),
                          { type: 'ArchivedNote', id: 'LIST' },
                      ]
                    : [{ type: 'ArchivedNote', id: 'LIST' }],
        }),

        updateNote: builder.mutation<
            NoteI,
            { id: string; updates: Partial<NoteI> }
        >({
            query: ({ id, updates }) => ({
                url: `note/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Note', id },
                { type: 'TrashedNote', id },
            ],
        }),

        moveNoteToBin: builder.mutation<NoteI, string>({
            query: (id) => ({
                url: `note/${id}/trash`,
                method: 'PUT',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Note', id },
                { type: 'TrashedNote', id },
            ],
        }),

        deleteNote: builder.mutation<void, string>({
            query: (id) => ({
                url: `note/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Note', id },
                { type: 'TrashedNote', id },
            ],
        }),
    }),
});

export const {
    useCreateNoteMutation,
    useGetUserNotesQuery,
    useGetTrashedNotesQuery,
    useGetArchivedNotesQuery,
    useUpdateNoteMutation,
    useMoveNoteToBinMutation,
    useDeleteNoteMutation,
} = notesAPI;
