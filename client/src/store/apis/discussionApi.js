import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const discussionApi = createApi({
    reducerPath: 'discussion',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder) {
        return {
            fetchDiscussion: builder.query({
                providesTags: ['vote', 'comment', 'subcomment'],
                query: (studyId) => {
                    return {
                        url: `/discussion/${studyId}`,
                        method: 'GET',
                    };
                },
            }),
            createVote: builder.mutation({
                invalidatesTags: ['vote'],
                query: ({ promptId, responseId, voteType }) => {
                    return {
                        url: `/discussion/${promptId}/${responseId}/vote`,
                        method: 'POST',
                        body: { voteType },
                    };
                },
            }),
            createCommentVote: builder.mutation({
                invalidatesTags: ['vote', 'subcomment'],
                query: ({ commentId, voteType }) => {
                    return {
                        url: `/discussion/${commentId}/vote`,
                        method: 'POST',
                        body: { voteType },
                    };
                }
            }),
            createComment: builder.mutation({
                invalidatesTags: ['comment'],
                query: ({ promptId, responseId, content, studyId }) => {
                    return {
                        url: `/discussion/${promptId}/${responseId}/comment`,
                        method: 'POST',
                        body: { content, studyId },
                    };
                },
            }),
            createSubComment: builder.mutation({
                invalidatesTags: ['subcomment'],
                query: ({ commentId, content, studyId }) => {
                    return {
                        url: `/discussion/${commentId}/subcomment`,
                        method: 'POST',
                        body: { content, studyId }
                    };
                },
            }),
            fetchSubComments: builder.query({
                providesTags: ['subcomment'],
                query: ({ commentId }) => {
                    console.log("API comment", commentId)
                    return {
                        url: `/discussion/${commentId}/subcomment`,
                        method: 'GET'
                    };
                },
            }),
        };

    }
});

export const {
    useFetchDiscussionQuery,
    useCreateVoteMutation,
    useCreateCommentMutation,
    useCreateCommentVoteMutation,
    useCreateSubCommentMutation,
    useFetchSubCommentsQuery
} = discussionApi;
export { discussionApi };