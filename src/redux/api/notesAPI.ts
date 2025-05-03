// features/api/notesApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { NoteI } from '@/interfaces/notes';

export const notesAPI = createApi({
    reducerPath: 'notesApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3005/api/v1/' }),
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
