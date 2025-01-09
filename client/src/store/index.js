import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./apis/authApi";
import { studyApi } from "./apis/studyApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [studyApi.reducerPath]: studyApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(studyApi.middleware);
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
} from './apis/authApi';

export {
  useCreateStudyMutation,
  useFetchFacilitatorStudiesQuery,
} from './apis/studyApi';