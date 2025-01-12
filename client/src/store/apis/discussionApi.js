import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const discussionApi = createApi({
    reducerPath: 'discussion',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    endpoints(builder) {
        return {
            fetchDiscussion: builder.query({
                query: (studyId) => {
                    return {
                        url: `/discussion/${studyId}`,
                        method: 'GET',
                    };
                },
            }),
        };

    }
});

export const {
    useFetchDiscussionQuery,
} = discussionApi;
export {discussionApi};