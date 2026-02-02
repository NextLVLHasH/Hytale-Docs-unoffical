"use client";

import * as React from "react";

interface UseDismissibleBannerResult {
  isVisible: boolean;
  dismiss: () => void;
}

/**
 * Hook to manage dismissible banners with sessionStorage persistence.
 * Once dismissed, the banner stays hidden for the entire session.
 *
 * @param storageKey - Unique key for sessionStorage
 * @returns Object containing visibility state and dismiss function
 */
export function useDismissibleBanner(storageKey: string): UseDismissibleBannerResult {
  const [isVisible, setIsVisible] = React.useState(false);

  // Check sessionStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const isDismissed = sessionStorage.getItem(storageKey) === "dismissed";
    setIsVisible(!isDismissed);
  }, [storageKey]);

  const dismiss = React.useCallback(() => {
    if (typeof window === "undefined") return;

    sessionStorage.setItem(storageKey, "dismissed");
    setIsVisible(false);
  }, [storageKey]);

  return { isVisible, dismiss };
}
