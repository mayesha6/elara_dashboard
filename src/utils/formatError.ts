export const formatErrorMessage = (error: unknown, defaultMessage: string = "Something went wrong."): string => {
  const errObj = error as { data?: { message?: string | object }; message?: string };
  const rawMsg = errObj?.data?.message || errObj?.message || defaultMessage;
  const errMsg = typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg);
  
  if (typeof errMsg === "string") {
    if (errMsg.includes("Incorrect API key") || errMsg.includes("invalid_api_key")) {
      return "AI service is temporarily unavailable due to an invalid API key configuration. Please contact support.";
    }
    if (errMsg.includes("insufficient_quota") || errMsg.includes("billing")) {
      return "AI service is temporarily unavailable due to insufficient balance/quota. Please check billing status.";
    }
    if (errMsg.includes("Rate limit") || errMsg.includes("rate_limit")) {
      return "AI service limit reached. Please try again after some time.";
    }

    if (errMsg.startsWith("[") && errMsg.endsWith("]")) {
      try {
        const parsed = JSON.parse(errMsg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: { message?: string }) => item.message || "").filter(Boolean).join(", ");
        }
      } catch {
        // ignore parsing error
      }
    }
  }
  
  return errMsg;
};
