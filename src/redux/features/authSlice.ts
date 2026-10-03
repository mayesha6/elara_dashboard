import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearGreetelyStorage, getApiBaseUrl } from "@/config/env";

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
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  return {
    user: null,
    isAuthenticated: false,
  };
};

export const removeAuthCookies = () => {
  if (typeof window === "undefined") return;
};

export const logoutBackendSession = async () => {
  if (typeof window === "undefined") return;
  try {
    await fetch(getApiBaseUrl() + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore network failure on logout
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action: PayloadAction<{ user: UserProfile }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      logoutBackendSession();
      clearGreetelyStorage();
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
