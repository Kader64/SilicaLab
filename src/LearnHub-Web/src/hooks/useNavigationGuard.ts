import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Blocks leaving the page while `active` is true: in-app navigation (links, back button)
 * through the router and closing or reloading the tab through the browser prompt.
 * Show a dialog while `blocked` is true and answer with `stay` or `leave`.
 * Call `allowLeaving` right before a navigation the page starts itself (save, submit).
 *
 * Needs a data router (createBrowserRouter) because of useBlocker.
 */
export function useNavigationGuard(active: boolean) {
  const bypass = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      active && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);

  const blocked = blocker.state === "blocked";

  return {
    blocked,
    stay() {
      if (blocker.state === "blocked") blocker.reset();
    },
    leave() {
      bypass.current = true;
      if (blocker.state === "blocked") blocker.proceed();
    },
    allowLeaving() {
      bypass.current = true;
    },
  };
}
