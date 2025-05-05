import { createApi } from '@reduxjs/toolkit/query/react';
import { NoteI } from '@/interfaces/notes';
import customBaseQuery from './customBaseQuery';

export const notesAPI = createApi({
    reducerPath: 'notesApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Note'],
    endpoints: (builder) => ({
        createNote: builder.mutation<NoteI, Partial<NoteI>>({
            query: (noteData) => ({
                url: 'note',
                method: 'POST',
                body: noteData,
            }),
            invalidatesTags: ['Note'],
        }),
        updateNote: builder.mutation<
            NoteI,
            { id: string; data: Partial<NoteI> }
        >({
            query: ({ id, data }) => ({
                url: `note/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }],
        }),
        getAllNotes: builder.query<NoteI[], string>({
            query: (firebaseUid) => `note/${firebaseUid}`,
        }),
        // Add other endpoints as needed
    }),
});

export const {
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useGetAllNotesQuery,
} = notesAPI;
