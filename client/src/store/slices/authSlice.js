import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const res = await axios.get("/api/current_user");
  return res.data;
});

export const createUser = createAsyncThunk("auth/createUser",
  async ({ values, navigate }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/auth/signup", values);
      navigate("/login");
      return res.data;
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data.error);
      }
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk("auth/loginUser",
  async ({ values, navigate }, { rejectWithValue }) => {
    try {
      //console.log("Auth Slice", values);
      const res = await axios.post("/auth/login", values);
      navigate("/");
      return res.data.user;
    } catch (err) {
      
      if (err.response) {
        return rejectWithValue(err.response.data.error.error);
      }
    
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload || false;
      })
      .addCase(createUser.rejected, (state, action) =>{
        state.error = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload || false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
