import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const studyApi = createApi({
    reducerPath: 'study',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder){
        return{
            createStudy: builder.mutation({
                query: (study) => {
                    return {
                        url: '/study/new',
                        method: 'POST',
                        body: study,
                    };
                },
            }),
        };
    }

});
export const { useCreateStudyMutation } = studyApi;
export { studyApi };