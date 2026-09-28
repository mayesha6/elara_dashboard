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
  let user: UserProfile | null = null;

  if (token) {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        clearGreetelyStorage();
      }
    }
  } else {
    clearGreetelyStorage();
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
  };
};

export const removeAuthCookies = () => {
  if (typeof window === "undefined") return;
  const cookieOptions = getAuthCookieOptions();

  // Remove host-only cookie
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("refreshToken", { path: "/" });

  // Remove root domain cookie
  if (cookieOptions.domain) {
    Cookies.remove("accessToken", { path: "/", domain: cookieOptions.domain });
    Cookies.remove("refreshToken", { path: "/", domain: cookieOptions.domain });
  }

  // Fallback for greetely.com
  Cookies.remove("accessToken", { path: "/", domain: ".greetely.com" });
  Cookies.remove("refreshToken", { path: "/", domain: ".greetely.com" });
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
      try {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.user.role) {
          localStorage.setItem("role", action.payload.user.role);
        }
      } catch {}
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      removeAuthCookies();
      clearGreetelyStorage();
    },
  },
  extraReducers: (builder) => {
    builder.addCase("persist/REHYDRATE" as string, (state: AuthState, action: PayloadAction<{ auth?: AuthState } | undefined>) => {
      if (typeof window !== "undefined") {
        const cookieToken = Cookies.get("accessToken");
        if (!cookieToken) {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
          clearGreetelyStorage();
        } else {
          state.token = cookieToken;
          state.user = action.payload?.auth?.user || state.user;
          state.isAuthenticated = true;
        }
      }
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;