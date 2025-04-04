import { createAsyncThunk } from "@reduxjs/toolkit";
import { resetStore } from ".";
import { authApi } from "./apis/authApi";

export const logoutAndRedirect = createAsyncThunk(
  'auth/logoutAndRedirect',
  async (_, { dispatch }) => {
    try {
      await dispatch(authApi.endpoints.logoutUser.initiate()).unwrap();
      
      dispatch(resetStore());
      
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }
);