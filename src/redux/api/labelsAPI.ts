import { NoteI } from '@/interfaces/notes';
import { createApi } from '@reduxjs/toolkit/query/react';
import customBaseQuery from './customBaseQuery';

export const labelsAPI = createApi({
    reducerPath: 'labelsApi',
    baseQuery: customBaseQuery,
    tagTypes: ['Label', 'Note'],
    endpoints: (builder) => ({
        getLabels: builder.query<string[], void>({
            query: () => 'labels/all',
            providesTags: ['Label'],
        }),

        addLabel: builder.mutation<
            { message: string; labels: string[] },
            string
        >({
            query: (label) => ({
                url: 'labels/add',
                method: 'POST',
                body: { label },
            }),
            invalidatesTags: ['Label'],
        }),

        editLabel: builder.mutation<
            { message: string; labels: string[] },
            { oldLabel: string; newLabel: string }
        >({
            query: ({ oldLabel, newLabel }) => ({
                url: 'labels/edit',
                method: 'PUT',
                body: { oldLabel, newLabel },
            }),
            invalidatesTags: ['Label', 'Note'],
        }),

        deleteLabel: builder.mutation<
            { message: string; labels: string[] },
            string
        >({
            query: (label) => ({
                url: `labels/delete/${label}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Label', 'Note'],
        }),

        attachLabelsToNote: builder.mutation<
            NoteI,
            { id: string; labels: string | string[] }
        >({
            query: ({ id, labels }) => ({
                url: `labels/add/note/${id}`,
                method: 'PUT',
                body: { labels },
            }),
            invalidatesTags: ['Note', 'Label'],
        }),
    }),
});

export const {
    useGetLabelsQuery,
    useAddLabelMutation,
    useEditLabelMutation,
    useDeleteLabelMutation,
    useAttachLabelsToNoteMutation,
} = labelsAPI;
