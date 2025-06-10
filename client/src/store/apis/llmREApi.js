import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const llmREApi = createApi({
    reducerPath: 'llmRE',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    //tagTypes: ['User', 'Notification'], 
    endpoints(builder){
        return{
            createEvaluation: builder.mutation({
                query: (values) => {
                    return {
                        url: '/llm-response-evaluation/create',
                        method: 'POST',
                        body: values,
                    };
                },
            }),
            fetchAllEvaluations: builder.query({
                query: () => {
                    return { 
                        url: '/llm-response-evaluation/all',
                        method: 'GET',
                    };
                },
            }),
            fetchEvaluation: builder.query({
                query: ({ evaluationId }) => {
                    return {
                        url: `/api/llm-response-evaluation/${evaluationId}`
                    }
                }
            })
        };
    }

});

export const { 
    useCreateEvaluationMutation,
    useFetchAllEvaluationsQuery,
    useFetchEvaluationQuery,
} = llmREApi;
export { llmREApi };