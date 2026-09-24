/**
 * Centralized Configuration & Environment Helper for Greetely Dashboard
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
  }
  return "https://greetely.com";
};

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://api.greetely.com/api/v1";
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
  return {
    domain: isProd ? ".greetely.com" : undefined,
    secure: isProd,
    sameSite: "Lax" as const,
    path: "/",
  };
};

/**
 * Clear ONLY Greetely-specific storage keys on logout to prevent wiping
 * unrelated browser state/preferences for other applications.
 */
export const GREETELY_STORAGE_KEYS = [
  "user",
  "token",
  "refreshToken",
  "accessToken",
  "greetely_theme",
  "greetely_session",
  "persist:auth",
];

export const clearGreetelyStorage = () => {
  if (typeof window === "undefined") return;
  GREETELY_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage access errors gracefully
    }
  });
};
