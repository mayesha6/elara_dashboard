import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setUser } from "../features/authSlice";
import { getApiBaseUrl } from "@/config/env";
import { getCookie } from "@/utils/cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // Check Redux state first, then fallback to cookies/localStorage
    let token = (getState() as RootState)?.auth?.token;
    if (!token && typeof window !== "undefined") {
      token =
        getCookie("accessToken") ||
        getCookie("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");
    }

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // Prevent browser HTTP caching for all API queries
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");

    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    try {
      const refreshTokenVal = typeof window !== "undefined"
        ? (getCookie("refreshToken") || localStorage.getItem("refreshToken"))
        : null;

      const refreshTokenReq = await fetch(
        `${getApiBaseUrl()}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: refreshTokenVal ? JSON.stringify({ refreshToken: refreshTokenVal }) : undefined,
          credentials: "include",
        }
      );

      const refreshData = await refreshTokenReq.json().catch(() => null);

      if (refreshTokenReq.ok || refreshData?.data?.accessToken) {
        if (refreshData?.data?.accessToken) {
          const user = (api.getState() as RootState).auth.user;
          api.dispatch(
            setUser({
              token: refreshData.data.accessToken,
              user: user || { email: null, role: null },
            })
          );
        }
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } catch {
      api.dispatch(logout());
    }
  }

  // Intercept 402 Payment Required or 403 Forbidden specifically related to subscription
  if (result?.error?.status === 402) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("subscription_required", { detail: result.error })
      );
    }
  } else if (result?.error?.status === 403) {
    const errorData = result.error.data as { code?: string; type?: string } | undefined;
    const errCode = (errorData?.code || errorData?.type || "").toUpperCase();
    const isSubError = errCode === "SUBSCRIPTION_REQUIRED" || errCode === "SUBSCRIPTION_EXPIRED" || errCode === "PAYMENT_REQUIRED";

    if (typeof window !== "undefined") {
      if (isSubError) {
        window.dispatchEvent(
          new CustomEvent("subscription_required", { detail: result.error })
        );
      } else {
        // Dispatch custom event for 403 Authorization / Cross-Org violation
        window.dispatchEvent(
          new CustomEvent("authorization_forbidden", { detail: result.error })
        );
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  refetchOnMountOrArgChange: true,
  tagTypes: [
    "User",
    "Recognition",
    "Reward",
    "Claim",
    "Notification",
    "SupportTicket",
    "Wallet",
    "Category",
    "Tone",
    "RecognitionValue",
  ],
  baseQuery: baseQueryWithRefreshToken,
  endpoints: () => ({}),
});

