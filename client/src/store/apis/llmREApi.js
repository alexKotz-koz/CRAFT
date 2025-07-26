import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const llmREApi = createApi({
    reducerPath: 'llmRE',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    //tagTypes: ['User', 'Notification'], 
    endpoints(builder) {
        return {
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
                        url: `/llm-response-evaluation/${evaluationId}`
                    }
                }
            }),
            createEvaluationResponse: builder.mutation({
                query: ({ evaluationId, ...body }) => {
                    return {
                        url: `/llm-response-evaluation/${evaluationId}/response`,
                        method: 'POST',
                        body,
                    };
                },
            }),
            fetchUserEvaluationResponse: builder.query({
                query: ({ evaluationId }) => {
                    return {
                        url: `/llm-response-evaluation/${evaluationId}/response/me`,
                        method: 'GET',
                    };
                },
            }),
            fetchAllUserEvaluationResponses: builder.query({
                query: () => {
                    return {
                        url: '/llm-response-evaluation/responses/all',
                        method: 'GET',
                    };
                },
            }),
            fetchUserResponsesForDownload: builder.query({
                query: ({ evaluationId, participantIds }) => {
                    return {
                        url: `/llm-response-evaluation/prepare-download/${evaluationId}/${participantIds.join(',')}`,
                        method: 'GET',
                    };
                },
            }),
            assignParticipantLLMRE: builder.mutation({
                query: ({ userId, evaluationId }) => {
                    return {
                        url: `llm-response-evaluation/${evaluationId}/assign-participant`,
                        method: 'POST',
                        body: { userId }
                    }
                }
            }),
            fetchEvaluationResponseById: builder.query({
                query: ({ responseId }) => ({
                    url: `/llm-response-evaluation/response/${responseId}`,
                    method: 'GET',
                }),
            }),
        };
    }

});

export const {
    useCreateEvaluationMutation,
    useFetchAllEvaluationsQuery,
    useFetchEvaluationQuery,
    useCreateEvaluationResponseMutation,
    useFetchUserEvaluationResponseQuery,
    useFetchAllUserEvaluationResponsesQuery,
    useLazyFetchUserResponsesForDownloadQuery,
    useAssignParticipantLLMREMutation,
    useFetchEvaluationResponseByIdQuery
} = llmREApi;
export { llmREApi };