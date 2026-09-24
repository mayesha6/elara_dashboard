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
    setUser: (state, action: PayloadAction<{ token: string; user: UserProfile }>) => {
      const cookieOptions = getAuthCookieOptions();

      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      Cookies.set("accessToken", action.payload.token, cookieOptions);
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
    builder.addCase("persist/REHYDRATE", (state: AuthState) => {
      if (typeof window !== "undefined") {
        const token = Cookies.get("accessToken");
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      }
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;