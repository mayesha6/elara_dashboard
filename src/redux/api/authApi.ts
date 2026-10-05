import { baseApi } from "./baseApi";
import { setUser } from "../features/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    getMe: builder.query({
      query: () => ({ url: "/user/me" }),
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            dispatch(setUser({ user: data.data }));
          }
        } catch {
          // Ignore errors
        }
      },
    }),

    changePassword: builder.mutation({
        query: (payload) => {
            return {
                url: "/auth/change-password",
                method: "POST",
                body: payload
            }
        }
    }),

    updateMyProfile: builder.mutation({
      query: (data) => ({
        url: "/user/update-my-profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

  }),
});

export const { useGetMeQuery, useLogoutUserMutation, useChangePasswordMutation, useUpdateMyProfileMutation } = authApi;