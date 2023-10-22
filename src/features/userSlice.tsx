import {createSlice} from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {uid: "", displayName: "", phoneNumber: "", email: ""},
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = {uid: "", displayName: "", phoneNumber: "", email: ""};
    },
    updateUserProfile: (state, action) => {
      state.user.displayName = action.payload.displayName;
      state.user.phoneNumber = action.payload.phoneNumber;
    },
  },
});

export const {login, logout, updateUserProfile} = userSlice.actions;

export const selectUser = (state: any) => state.user.user;

export default userSlice.reducer;
