import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./apis/authApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware()
      .concat(authApi.middleware);
  }
});

setupListeners(store.dispatch);

window.store =store;

export { 
  useFetchAllUsersQuery, 
  useFetchUserQuery, 
  useCreateUserMutation,
  useLoginUserMutation 
} from './apis/authApi';
