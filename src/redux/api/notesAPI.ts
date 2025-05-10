// features/api/notesApiSlice.ts
import { NoteI } from '@/interfaces/notes';
import { createApi } from '@reduxjs/toolkit/query/react';
import customBaseQuery from './customBaseQuery';

export const notesAPI = createApi({
    reducerPath: 'notesApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Note', 'TrashedNote', 'ArchivedNote', 'SharedNote'],
    endpoints: (builder) => ({
        createNote: builder.mutation<NoteI, Partial<NoteI>>({
            query: (noteData) => ({
                url: 'notes',
                method: 'POST',
                body: noteData,
            }),
            invalidatesTags: ['Note'],
        }),

        getUserNotes: builder.query<NoteI[], void>({
            query: () => `notes`,
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
            query: () => 'notes/trashed',
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
            query: () => 'notes/archived',
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
                url: `notes/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Note', 'TrashedNote'],
        }),

        moveNoteToBin: builder.mutation<NoteI, string>({
            query: (id) => ({
                url: `notes/${id}/trash`,
                method: 'PUT',
            }),
            invalidatesTags: ['Note', 'TrashedNote'],
        }),

        deleteNote: builder.mutation<void, string>({
            query: (id) => ({
                url: `notes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Note', 'TrashedNote'],
        }),

        restoreNote: builder.mutation<NoteI, string>({
            query: (id) => ({
                url: `notes/${id}/restore`,
                method: 'PUT',
            }),
            invalidatesTags: ['Note', 'TrashedNote'],
        }),

        // 🆕 Share Note Mutation
        shareNote: builder.mutation<
            NoteI,
            { noteId: string; emails: string[] }
        >({
            query: (data) => ({
                url: 'notes/share',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Note'],
        }),

        // 🆕 Get Notes Shared With Me
        getNotesSharedWithMe: builder.query<NoteI[], void>({
            query: () => 'notes/shared-with-me',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ _id }) => ({
                              type: 'SharedNote' as const,
                              _id,
                          })),
                          { type: 'SharedNote', id: 'LIST' },
                      ]
                    : [{ type: 'SharedNote', id: 'LIST' }],
        }),

        // 🆕 Get collaborators of a note
        getCollaborators: builder.query<
            {
                success: boolean;
                collaborators: {
                    uid: string;
                    email: string;
                    name: string;
                    photo: string | null;
                }[];
                ownerId: string;
            },
            string // noteId
        >({
            query: (noteId) => `notes/${noteId}/collaborators`,
            providesTags: ['SharedNote'],
        }),

        // 🆕 Remove a collaborator from a note
        removeCollaborator: builder.mutation<
            { success: boolean; message: string; sharedWith: string[] },
            { noteId: string; userId: string }
        >({
            query: (data) => ({
                url: 'notes/remove-collaborator',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SharedNote'],
        }),

        // 🆕 Leave a shared note
        leaveSharedNote: builder.mutation<
            { success: boolean; message: string },
            { noteId: string }
        >({
            query: (data) => ({
                url: 'notes/leave-shared-note',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SharedNote'],
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
    useRestoreNoteMutation,
    useShareNoteMutation,
    useGetNotesSharedWithMeQuery,
    useGetCollaboratorsQuery,
    useRemoveCollaboratorMutation,
    useLeaveSharedNoteMutation,
} = notesAPI;
