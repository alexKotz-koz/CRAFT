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
  useFetchUsernameQuery,
  useLazyFetchUsernameQuery,
  usePasswordResetMutation, 
  useLazyCheckUsernameAvailabilityQuery
} from './apis/authApi';

export {
  useCreateStudyMutation,
  useFetchStudiesQuery,
  useCreateStudyResponseMutation,
  useFetchStudyQuery,
  useFetchStudyCommentsQuery,
  useFetchTaskQuery,
  useFetchStudyTasksQuery
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
  useUpdateNotificationMutation
} from './apis/discussionApi';