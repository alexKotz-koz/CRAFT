import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'study',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder) {
        return {
            invalidatesTags: ['Study'],
            createStudy: builder.mutation({
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
                query: (response) => {
                    console.log("api response: ", response)
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
        };
    }

});
export const { 
    useCreateStudyMutation, 
    useFetchStudiesQuery,
    useCreateStudyResponseMutation, 
    useFetchStudyQuery,
} = studyApi;
export { studyApi };