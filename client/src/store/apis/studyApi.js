import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'study',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    tagTypes: ['Study'],
    endpoints(builder) {
        return {
            createStudy: builder.mutation({
                invalidatesTags: ['Study'],
                query: (study) => {
                    return {
                        url: '/study/new',
                        method: 'POST',
                        body: study,
                    };
                },
            }),
            fetchStudies: builder.query({
                providesTags: ['Study'],
                query: (user) => {
                    return {
                        url: '/study/my_studies',
                        method: 'GET',
                    };
                },
            }),
            createStudyResponse: builder.mutation({
                invalidatesTags: ['Study'],
                query: (response) => {
                    return {
                        url: '/study/response',
                        method: 'POST',
                        body: response
                    };
                },
            }),
            fetchStudy: builder.query({
                query: (studyId) => {
                    return {
                        url: `/study/${studyId}`,
                        method: 'GET'
                    };
                },
            }),
            fetchStudyComments: builder.query({
                query: (studyId) => {
                    return {
                        url: `/study/${studyId}/comments`,
                        method: 'GET'
                    };
                },
            }),
            fetchTask: builder.query({
                query: (taskId) => {
                    return {
                        url: `/study/task/${taskId}`,
                        method: 'GET'
                    };
                },
            }),
            fetchStudyTasks: builder.query({
                query: (studyId) => {
                    return {
                        url: `/study/tasks/${studyId}`,
                        method: 'GET'
                    };
                },
            }),
            fetchAllStudyResponses: builder.query({
                query: (studyId) => {
                    return {
                        url: `/study/download-responses/${studyId}`,
                        method: 'GET'
                    };
                },
            }),
            fetchAllStudies: builder.query({
                providesTags: ['Study'],
                query: () => {
                    return {
                        url: '/study/fetch-all',
                        method: 'GET'
                    };
                },
            }),
            assignParticipant: builder.mutation({
                query: ({ studyId, userId, taskIds }) => ({
                    url: `/study/${studyId}/assign-participant`,
                    method: 'POST',
                    body: { userId, taskIds }
                }),
                invalidatesTags: ['Study']
            }),
        };
    }

});
export const {
    useCreateStudyMutation,
    useFetchStudiesQuery,
    useCreateStudyResponseMutation,
    useFetchStudyQuery,
    useFetchStudyCommentsQuery,
    useFetchTaskQuery,
    useFetchStudyTasksQuery,
    useLazyFetchAllStudyResponsesQuery,
    useFetchAllStudiesQuery,
    useAssignParticipantMutation
} = studyApi;
export { studyApi };