import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { getAuthCookieOptions, clearGreetelyStorage } from "@/config/env";

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
  if (typeof window === "undefined") {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }

  const token = Cookies.get("accessToken") || null;

  const userStr = localStorage.getItem("user");
  let user: UserProfile | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setUser: (state, action: PayloadAction<{ token?: string; user: UserProfile }>) => {
      const cookieOptions = getAuthCookieOptions();

      if (action.payload.token) {
        state.token = action.payload.token;
        // Only set cookie if explicitly provided (e.g. non-HttpOnly dev mode fallback)
        Cookies.set("accessToken", action.payload.token, cookieOptions);
      }
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      const cookieOptions = getAuthCookieOptions();

      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      Cookies.remove("accessToken", cookieOptions);
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", cookieOptions);
      Cookies.remove("refreshToken", { path: "/" });
      clearGreetelyStorage();
    },
  },
  extraReducers: (builder) => {
    builder.addCase("persist/REHYDRATE", (state: AuthState, action: any) => {
      if (typeof window !== "undefined") {
        const cookieToken = Cookies.get("accessToken");
        if (!cookieToken) {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          try {
            localStorage.removeItem("user");
          } catch {}
        } else {
          const rehydratedToken = action.payload?.auth?.token || state.token;
          if (rehydratedToken && rehydratedToken !== cookieToken) {
            // Token changed (user switched account on landing page)
            state.token = cookieToken;
            state.user = null; // Clear stale user data
            state.isAuthenticated = true;
            try {
              localStorage.removeItem("user");
            } catch {}
          } else {
            state.token = cookieToken;
            state.isAuthenticated = true;
          }
        }
      }
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;