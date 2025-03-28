import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const discussionApi = createApi({
    reducerPath: 'discussion',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api'
    }),
    tagTypes: ['Notification', 'User'],
    endpoints(builder) {
        return {
            fetchDiscussion: builder.query({
                providesTags: ['vote', 'comment', 'subcomment', 'update-response', 'change-visibility'],
                query: (taskId) => {
                    return {
                        url: `/discussion/${taskId}`,
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
                    return {
                        url: `/discussion/${commentId}/subcomment`,
                        method: 'GET'
                    };
                },
            }),
            createNotification: builder.mutation({
                invalidatesTags: ['notification', 'User'],
                query: ({ postId, postType, notificationType, fromUser, toUser, task }) => {
                    //console.log("Api: ", postId, postType, fromUser, toUser, task)
                    return {
                        url: `/discussion/${postId}/notify`,
                        method: 'POST',
                        body: {postType, notificationType, fromUser, toUser, task}
                    };
                },
            }),
            fetchTaskNotifications: builder.query({
                providesTags: ['notification'],
                    query: ({ taskId }) => {
                        //console.log("API taskId", taskId)
                        return {
                            url: `/discussion/notifications/${taskId}`,
                            method: 'GET'
                        };
                    },
            }),
            updateComment: builder.mutation({
                invalidatesTags: ['update-response'],
                query: ({commentId, update, task}) => {
                    const {commentContent, notificationId, type} = update;
                    return {
                        url: `/discussion/update-comment/${commentId}`,
                        method: 'POST',
                        body: {commentContent, notificationId, type, task}
                    };
                },
            }),
            updateNotification: builder.mutation({
                invalidatesTags: ['Notification', 'User'],
                query: ({notificationId, newStatus}) => {
                    return {
                        url: `/discussion/notifications/update`,
                        method: 'POST',
                        body: {notificationId, newStatus}
                    };
                },
            }),
            fetchStudyResponse: builder.query({
                query: ({studyResponseId}) => {
                    console.log("fetchStudyResponse: ", studyResponseId);
                    return {
                        url: `/discussion/studyResponse/${studyResponseId}`,
                        method: 'GET',

                    };
                },
            }),
            hideComment: builder.mutation({
                invalidatesTags: ['change-visibility', 'subcomment'],
                query: ({commentId, state}) => {
                    return {
                        url: `/discussion/hide-comment/${commentId}`,
                        method: 'POST',
                        body: {state},
                    };
                },
            }),

        };

    }
});

export const {
    useFetchDiscussionQuery,
    useLazyFetchDiscussionQuery,
    useCreateVoteMutation,
    useCreateCommentMutation,
    useCreateCommentVoteMutation,
    useCreateSubCommentMutation,
    useFetchSubCommentsQuery,
    useCreateNotificationMutation,
    useFetchTaskNotificationsQuery,
    useUpdateCommentMutation,
    useUpdateNotificationMutation,
    useFetchStudyResponseQuery,
    useHideCommentMutation,
} = discussionApi;
export { discussionApi };