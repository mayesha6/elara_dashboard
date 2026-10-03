import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../features/authSlice";
import { getApiBaseUrl } from "@/config/env";

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: "include",
  prepareHeaders: (headers) => {
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
      const refreshTokenReq = await fetch(
        getApiBaseUrl() + "/auth/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (refreshTokenReq.ok) {
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } catch {
      api.dispatch(logout());
    }
  }

  if (result?.error?.status === 402) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("subscription_required", { detail: result.error })
      );
    }
  } else if (result?.error?.status === 403) {
    const errorData = result.error?.data as { code?: string; type?: string } | undefined;
    const errCode = (errorData?.code || errorData?.type || "").toUpperCase();
    const isSubError =
      errCode === "SUBSCRIPTION_REQUIRED" ||
      errCode === "SUBSCRIPTION_EXPIRED" ||
      errCode === "PAYMENT_REQUIRED";

    if (typeof window !== "undefined") {
      if (isSubError) {
        window.dispatchEvent(
          new CustomEvent("subscription_required", { detail: result.error })
        );
      } else {
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
