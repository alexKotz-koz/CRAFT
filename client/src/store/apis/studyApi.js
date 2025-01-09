import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'study',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder) {
        return {
            invalidatesTags: ['facilitatorStudies'],
            createStudy: builder.mutation({
                query: (study) => {
                    return {
                        url: '/study/new',
                        method: 'POST',
                        body: study,
                    };
                },
            }),
            fetchFacilitatorStudies: builder.query({
                providesTags: ['facilitatorStudies'],
                query: (user) => {
                    return {
                        url: '/study/my_studies',
                        method: 'GET',
                    }
                }
            }),
        };
    }

});
export const { 
    useCreateStudyMutation, 
    useFetchFacilitatorStudiesQuery 
} = studyApi;
export { studyApi };