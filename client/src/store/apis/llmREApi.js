import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const llmREApi = createApi({
    reducerPath: 'llmRE',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    tagTypes: ['Evaluation', 'Response', 'Assignment'],
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
                query: () => ({
                    url: '/llm-response-evaluation/all',
                    method: 'GET',
                }),
                providesTags: ['Evaluation'],
            }),
            fetchEvaluation: builder.query({
                query: ({ evaluationId }) => {
                    return {
                        url: `/llm-response-evaluation/${evaluationId}`
                    }
                }
            }),
            createEvaluationResponse: builder.mutation({
                query: ({ evaluationId, ...body }) => ({
                    url: `/llm-response-evaluation/${evaluationId}/response`,
                    method: 'POST',
                    body,
                }),
                invalidatesTags: ['Evaluation', 'Response'], 
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
                query: () => ({
                    url: '/llm-response-evaluation/responses/all',
                    method: 'GET',
                }),
                providesTags: ['Response'],
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
                query: ({ userId, evaluationId }) => ({
                    url: `llm-response-evaluation/${evaluationId}/assign-participant`,
                    method: 'POST',
                    body: { userId }
                }),
                invalidatesTags: ['Assignment', 'User']
            }),
            removeAssignment: builder.mutation({
                query: ({ userId, evaluationId }) => ({
                    url: `/llm-response-evaluation/${evaluationId}/remove-assignment`,
                    method: 'POST',
                    body: { userId }
                }),
            }),
            fetchEvaluationResponseById: builder.query({
                query: ({ responseId }) => ({
                    url: `/llm-response-evaluation/response/${responseId}`,
                    method: 'GET',
                }),
            }),
            editEvaluation: builder.mutation({
                query: ({ evaluationId, evaluationEdits }) => ({
                    url: `/llm-response-evaluation/${evaluationId}/edit`,
                    method: 'POST',
                    body: {evaluationEdits}
                })
            })
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
    useRemoveAssignmentMutation,
    useFetchEvaluationResponseByIdQuery,
    useEditEvaluationMutation
} = llmREApi;
export { llmREApi };