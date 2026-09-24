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
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || Cookies.get("accessToken");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

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

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
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

