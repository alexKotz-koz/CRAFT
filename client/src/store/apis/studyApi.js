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
                    console.log("createStudyAPI study: ", study);
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
                    return{
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
                    console.log("api studyId", studyId)
                    return {
                        url: `/study/tasks/${studyId}`,
                        method: 'GET'
                    }
                }
            })
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
    useFetchStudyTasksQuery
} = studyApi;
export { studyApi };