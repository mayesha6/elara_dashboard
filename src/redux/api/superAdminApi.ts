import { baseApi } from "./baseApi";

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdminDashboard: builder.query<any, void>({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),
      providesTags: ["User", "Recognition", "Reward", "Claim"],
    }),

    deleteOrganization: builder.mutation<any, string | { id: string; reason?: string }>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const body = typeof arg === "object" && arg.reason ? { reason: arg.reason } : undefined;
        return {
          url: `/user/${id}`,
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),

    restoreOrganization: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/user/${id}/restore`,
        method: "POST",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["User"],
    }),

    updateOrganizationStatus: builder.mutation<any, { id: string; isActive: string }>({
      query: ({ id, isActive }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),

    approveOrganization: builder.mutation<any, string>({
      query: (id) => ({
        url: `/user/approve/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    rejectOrganization: builder.mutation<any, string>({
      query: (id) => ({
        url: `/user/reject/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetSuperAdminDashboardQuery,
  useDeleteOrganizationMutation,
  useRestoreOrganizationMutation,
  useUpdateOrganizationStatusMutation,
  useApproveOrganizationMutation,
  useRejectOrganizationMutation,
} = superAdminApi;
