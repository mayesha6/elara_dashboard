"use client";

import { useGetMeQuery } from "@/redux/api/authApi";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/authSlice";
import { useRouter, useParams, usePathname } from "next/navigation";
import { ShieldAlert, LogOut, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { slugify } from "@/utils/slugify";
import { getWebsiteUrl } from "@/config/env";
import { toast } from "sonner";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const orgSlug = params?.orgSlug as string;
  const dispatch = useDispatch();

  const landingPageUrl = getWebsiteUrl();
  const [hasSubscriptionError, setHasSubscriptionError] = useState(false);

  // Subscribe to custom 402/403 subscription and authorization events from baseApi
  useEffect(() => {
    const handleSubscriptionError = () => {
      setHasSubscriptionError(true);
    };

    const handleForbiddenError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const msg = detail?.data?.message || "Forbidden: You do not have permission to perform this action.";
      toast.error(msg);
    };

    window.addEventListener("subscription_required", handleSubscriptionError);
    window.addEventListener("authorization_forbidden", handleForbiddenError);
    return () => {
      window.removeEventListener("subscription_required", handleSubscriptionError);
      window.removeEventListener("authorization_forbidden", handleForbiddenError);
    };
  }, []);

  const { data: profileData, isLoading, error } = useGetMeQuery(undefined);
  const user = profileData?.data;

  // If unauthorized (401), redirect to login page
  useEffect(() => {
    if (error && "status" in error && error.status === 401) {
      dispatch(logout());
      window.location.href = `${landingPageUrl}/login?redirect=${encodeURIComponent(window.location.href)}`;
    }
  }, [error, dispatch, landingPageUrl]);

  const expectedSlug =
    user?.role === "ORGANIZATION_ADMIN"
      ? slugify(user.companyName || user.name || "")
      : user?.role === "DEPARTMENT_ADMIN"
      ? slugify(
          user.organizationId?.companyName ||
            user.organizationId?.name ||
            (typeof user.organizationId === "string" ? user.organizationId : "")
        )
      : "";

  useEffect(() => {
    if (user && expectedSlug) {
      if (user.role === "ORGANIZATION_ADMIN") {
        if (pathname.startsWith("/org-admin")) {
          const newPath = pathname.replace("/org-admin", `/${expectedSlug}`);
          router.replace(newPath);
        } else if (orgSlug && orgSlug.toLowerCase() !== expectedSlug.toLowerCase()) {
          const newPath = pathname.replace(new RegExp(`^/${orgSlug}`, 'i'), `/${expectedSlug}`);
          router.replace(newPath);
        }
      } else if (user.role === "DEPARTMENT_ADMIN") {
        if (pathname.startsWith("/dept-admin")) {
          const newPath = pathname.replace("/dept-admin", `/${expectedSlug}/dept-admin`);
          router.replace(newPath);
        } else if (orgSlug && orgSlug.toLowerCase() !== expectedSlug.toLowerCase()) {
          const newPath = pathname.replace(new RegExp(`^/${orgSlug}`, 'i'), `/${expectedSlug}`);
          router.replace(newPath);
        }
      }
    }
  }, [user, expectedSlug, pathname, orgSlug, router]);

  // Check if user is Org Admin and subscription is not active or trialing, or if API returned 402 Subscription Required
  const isOrgAdmin = user?.role === "ORGANIZATION_ADMIN";
  const isApiSubscriptionError =
    hasSubscriptionError ||
    (error && "status" in error && error.status === 402);

  const isSubscriptionInactive =
    isApiSubscriptionError ||
    (isOrgAdmin &&
      user?.subscriptionStatus !== "ACTIVE" &&
      user?.subscriptionStatus !== "TRIAL");

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = `${landingPageUrl}/login`;
  };

  const handleUpgrade = () => {
    // Safe upgrade navigation to landing page pricing without leaking tokens in URL parameters
    window.location.href = `${landingPageUrl}/pricing`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-2">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (isSubscriptionInactive) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
          {/* Warning Icon with premium animation */}
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-6 ring-8 ring-rose-50/50">
            <ShieldAlert size={32} className="animate-bounce" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Subscription Inactive</h2>

          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-[280px]">
            Organization subscription is not active. Please upgrade your plan to access the dashboard.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient hover:opacity-95 text-white py-3.5 rounded-xl font-medium text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Upgrade Plan
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium text-sm transition-all border border-gray-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
