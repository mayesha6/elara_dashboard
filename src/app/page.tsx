"use client";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { slugify } from "@/utils/slugify";
import { getWebsiteUrl, clearGreetelyStorage } from "@/config/env";
import { decodeJwtPayload, removeAuthCookies } from "@/redux/features/authSlice";

export default function HomePage() {
  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (!token) {
      const landingPageUrl = getWebsiteUrl();
      window.location.href = `${landingPageUrl}/login`;
      return;
    }

    try {
      const payload = decodeJwtPayload(token);
      if (!payload || !payload.role) {
        removeAuthCookies();
        clearGreetelyStorage();
        window.location.href = `${getWebsiteUrl()}/login`;
        return;
      }

      const role = payload.role;

      let dashboardPath = "/user/dashboard";
      if (role === "SUPER_ADMIN") {
        dashboardPath = "/super-admin";
      } else if (role === "ORGANIZATION_ADMIN") {
        let orgName = "";
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (!payload.email || !parsed.email || payload.email.toLowerCase() === parsed.email.toLowerCase()) {
              orgName = parsed.companyName || parsed.name || "";
            }
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage:", e);
        }

        if (orgName) {
          dashboardPath = `/${slugify(orgName)}`;
        } else {
          dashboardPath = "/org-admin";
        }
      } else if (role === "DEPARTMENT_ADMIN") {
        let orgName = "";
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (!payload.email || !parsed.email || payload.email.toLowerCase() === parsed.email.toLowerCase()) {
              const orgObj = parsed.organizationId;
              orgName = orgObj?.companyName || orgObj?.name || (typeof orgObj === "string" ? orgObj : "");
            }
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage:", e);
        }

        if (orgName) {
          dashboardPath = `/${slugify(orgName)}/dept-admin/dashboard`;
        } else {
          dashboardPath = "/dept-admin/dashboard";
        }
      } else if (role === "USER") {
        dashboardPath = "/user/dashboard";
      }

      window.location.href = dashboardPath;
    } catch (err) {
      console.error("Token decoding failed:", err);
      window.location.href = "/user/dashboard";
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col items-center p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border border-slate-100 max-w-sm w-full text-center space-y-6">
        {/* Animated premium spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-400 animate-spin"></div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Opening Workspace</h2>
          <p className="text-sm text-slate-500 animate-pulse">Redirecting you to your dashboard...</p>
        </div>
      </div>
    </main>
  );
}