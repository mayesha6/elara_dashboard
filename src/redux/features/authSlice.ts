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

export const decodeJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

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
    const payload = decodeJwtPayload(token);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const payloadEmail = payload?.email || payload?.userEmail;
        const payloadRole = payload?.role;

        const emailMatches = !payloadEmail || !parsed.email || payloadEmail.toLowerCase() === parsed.email.toLowerCase();
        const roleMatches = !payloadRole || !parsed.role || payloadRole === parsed.role;

        if (emailMatches && roleMatches) {
          user = parsed;
        } else {
          clearGreetelyStorage();
        }
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
          clearGreetelyStorage();
        } else {
          const payload = decodeJwtPayload(cookieToken);
          const rehydratedUser = action.payload?.auth?.user || state.user;
          const rehydratedToken = action.payload?.auth?.token || state.token;

          let isMatch = true;
          if (rehydratedUser && payload) {
            const payloadEmail = payload?.email || payload?.userEmail;
            const payloadRole = payload?.role;
            if (payloadEmail && rehydratedUser.email && payloadEmail.toLowerCase() !== rehydratedUser.email.toLowerCase()) {
              isMatch = false;
            }
            if (payloadRole && rehydratedUser.role && payloadRole !== rehydratedUser.role) {
              isMatch = false;
            }
          }

          if (!isMatch || (rehydratedToken && rehydratedToken !== cookieToken)) {
            // Token or user info mismatched!
            state.token = cookieToken;
            state.user = null; // Clear stale user data
            state.isAuthenticated = true;
            clearGreetelyStorage();
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