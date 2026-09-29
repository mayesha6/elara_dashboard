import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearGreetelyStorage } from "@/config/env";

export interface UserProfile {
  _id?: string;
  id?: string;
  email: string | null;
  name?: string;
  role: string | null;
  companyName?: string;
  organizationId?: any;
  subscriptionStatus?: string;
  picture?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  return {
    token: null,
    user: null,
    isAuthenticated: false,
  };
};

export const removeAuthCookies = () => {
  if (typeof window === "undefined") return;
  // Expire cookies via document.cookie without requiring js-cookie dependency
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action: PayloadAction<{ token?: string; user: UserProfile }>) => {
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      removeAuthCookies();
      clearGreetelyStorage();
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;