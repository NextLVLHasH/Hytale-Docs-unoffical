"use client";

import * as React from "react";

interface UseCopyToClipboardResult {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Hook to copy text to clipboard with a copied state.
 * The `copied` state resets to false after 2 seconds.
 *
 * @returns Object containing copied state and copy function
 */
export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = React.useCallback(async (text: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset copied state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopied(false);
    }
  }, []);

  return { copied, copyToClipboard };
}
