import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'study',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
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
        };
    }

});
export const { 
    useCreateStudyMutation, 
    useFetchStudiesQuery,
    useCreateStudyResponseMutation, 
    useFetchStudyQuery,
    useFetchStudyCommentsQuery
} = studyApi;
export { studyApi };