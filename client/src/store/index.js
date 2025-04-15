import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./apis/authApi";
import { studyApi } from "./apis/studyApi";
import { discussionApi } from "./apis/discussionApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [studyApi.reducerPath]: studyApi.reducer,
    [discussionApi.reducerPath]: discussionApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(studyApi.middleware)
      .concat(discussionApi.middleware);
  }
});

setupListeners(store.dispatch);


export { 
  useFetchAllUsersQuery, 
  useFetchUserQuery, 
  useCreateUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useFetchUsernameQuery,
  useLazyFetchUsernameQuery,
  usePasswordResetMutation, 
  useSudoPasswordResetMutation,
  useLazyCheckUsernameAvailabilityQuery,
  useUpdateUserMutation,
  useLazyGetUserByIdQuery
} from './apis/authApi';

export {
  useCreateStudyMutation,
  useFetchStudiesQuery,
  useCreateStudyResponseMutation,
  useFetchStudyQuery,
  useFetchStudyCommentsQuery,
  useFetchTaskQuery,
  useFetchStudyTasksQuery,
  useLazyFetchAllStudyResponsesQuery,
  useFetchAllStudiesQuery,
  useAssignParticipantMutation
} from './apis/studyApi';

export {
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
  useFetchCommentForClarificationQuery,
  useLazyFindDiscussionQuery,
  useLazyFetchCompleteDiscussionQuery
} from './apis/discussionApi';