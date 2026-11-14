/**
 * Centralized Configuration & Environment Helper for Elara Dashboard
 */

export const getWebsiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WEBSITE_URL) {
    return process.env.NEXT_PUBLIC_WEBSITE_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("localhost")) {
      return "http://localhost:3041";
    }
    if (hostname.includes("127.0.0.1")) {
      return "http://127.0.0.1:3041";
    }
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join(".");
      return `${window.location.protocol}//${rootDomain}`;
    }
  }
  return "https://elara.com";
};

export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.includes("elara.com")) {
      return "https://api.elara.com/api/v1";
    }
  }
  return "https://api.elara.com/api/v1";
};

export const isProductionEnvironment = (): boolean => {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "production";
  }
  const hostname = window.location.hostname;
  return (
    process.env.NODE_ENV === "production" &&
    !hostname.includes("localhost") &&
    !hostname.includes("127.0.0.1")
  );
};

export const getAuthCookieOptions = () => {
  const isProd = isProductionEnvironment();
  let domain: string | undefined = undefined;

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (!hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        domain = "." + parts.slice(-2).join(".");
      }
    }
  }

  return {
    domain,
    secure: isProd,
    sameSite: "Lax" as const,
    path: "/",
  };
};

/**
 * Clear ONLY Elara-specific storage keys on logout to prevent wiping
 * unrelated browser state/preferences for other applications.
 */
export const ELARA_STORAGE_KEYS = [
  "user",
  "role",
  "token",
  "refreshToken",
  "accessToken",
  "elara_theme",
  "elara_session",
  "persist:auth",
  "persist:root",
];

export const clearElaraStorage = () => {
  if (typeof window === "undefined") return;
  ELARA_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage access errors gracefully
    }
  });
};
