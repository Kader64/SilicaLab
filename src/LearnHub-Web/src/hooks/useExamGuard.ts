import { useEffect, useRef, useState } from "react";
import { useNavigationGuard } from "./useNavigationGuard";

/**
 * Watches the page while an exam is running:
 *  - counts how many times the student leaves it (switching tab or window),
 *  - calls `onLimitReached` when `limit` warnings are reached,
 *  - asks before in-app navigation and before the tab is closed. Leaving is allowed,
 *    but the attempt then counts as failed.
 *
 * A tab or window switch is counted once, until the student comes back.
 * The browser can only detect this, not prevent it, so the server must enforce
 * the limit too (report each leave to the API and cancel the attempt there).
 */
export function useExamGuard(active: boolean, limit: number, onLimitReached: () => void) {
  const [warnings, setWarnings] = useState(0);
  const [warningOpen, setWarningOpen] = useState(false);
  const onLimitRef = useRef(onLimitReached);
  const count = useRef(0);
  const navigation = useNavigationGuard(active);

  useEffect(() => {
    onLimitRef.current = onLimitReached;
  });

  useEffect(() => {
    if (!active) return;
    let away = false;

    const leave = () => {
      if (away) return;
      away = true;
      count.current += 1;
      setWarnings(count.current);
      // TODO API: POST /api/attempts/{id}/focus-loss
      if (count.current >= limit) onLimitRef.current();
      else setWarningOpen(true);
    };
    const back = () => {
      away = false;
    };
    const onVisibility = () => (document.hidden ? leave() : back());

    window.addEventListener("blur", leave);
    window.addEventListener("focus", back);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", leave);
      window.removeEventListener("focus", back);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, limit]);

  return {
    warnings,
    warningOpen: warningOpen && warnings < limit,
    dismissWarning: () => setWarningOpen(false),
    leaveDialogOpen: navigation.blocked,
    stay: navigation.stay,
    allowLeaving: navigation.allowLeaving,
    /** TODO API: POST /api/attempts/{id}/abandon (status Cancelled, Passed = false) */
    leaveAnyway: navigation.leave,
  };
}
