import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout, setUser } from "../features/authSlice";
import Cookies from "js-cookie";
import { getApiBaseUrl } from "@/config/env";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = Cookies.get("accessToken");

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
    const refreshTokenVal = Cookies.get("refreshToken");
    try {
      const refreshTokenReq = await fetch(
        `${getApiBaseUrl()}/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken: refreshTokenVal }),
          credentials: "include",
        }
      );
      const refreshToken = await refreshTokenReq.json();

      if (refreshToken?.data?.accessToken) {
        const user = (api.getState() as RootState).auth.user;
        if (user) {
          api.dispatch(setUser({ user, token: refreshToken?.data?.accessToken }));
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
    const errorData = result.error.data as { message?: string; code?: string; type?: string } | undefined;
    const errMsg = (errorData?.message || "").toLowerCase();
    const errCode = (errorData?.code || "").toLowerCase();
    const isSubError = errCode.includes("subscription") || errMsg.includes("subscription") || errMsg.includes("plan");

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

