"use client";

import { useEffect } from "react";
import { getRefreshToken, refreshAccessToken } from "@/lib/api-client";

/**
 * AuthSessionWatcher proactively refreshes the JWT access token in the background
 * every 10 minutes (backend access token expires at 15 minutes) and on window focus.
 * This guarantees the user is NEVER unexpectedly logged out while using or returning to the app.
 */
export function AuthSessionWatcher() {
  useEffect(() => {
    // Proactive refresh helper
    const attemptSilentRefresh = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return;
      try {
        await refreshAccessToken();
      } catch {
        // Silently ignore background refresh errors if offline; apiFetch will retry on demand
      }
    };

    // Periodic interval: every 9 minutes (540,000 ms)
    const intervalId = setInterval(attemptSilentRefresh, 9 * 60 * 1000);

    // Refresh on window focus when user returns to tab
    const handleFocus = () => {
      attemptSilentRefresh();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return null;
}
