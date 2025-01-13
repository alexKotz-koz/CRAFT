import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const discussionApi = createApi({
    reducerPath: 'discussion',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder) {
        return {
            fetchDiscussion: builder.query({
                providesTags: ['vote'],
                query: (studyId) => {
                    return {
                        url: `/discussion/${studyId}`,
                        method: 'GET',
                    };
                },
            }),
            createVote: builder.mutation({
                invalidatesTags: ['vote'],
                query: ({ studyId, promptId, responseId, voteType }) => {
                    return {
                        url: `/discussion/${studyId}/${promptId}/${responseId}`,
                        method: 'POST',
                        body: { voteType },
                    };
                },
            }),
        };

    }
});

export const {
    useFetchDiscussionQuery,
    useCreateVoteMutation,
} = discussionApi;
export { discussionApi };