import { useEffect, useRef, useState } from "react";

/** Milliseconds left until `expiresAt` (a timestamp). Calls `onExpire` once the time is up. */
export function useCountdown(expiresAt: number, active: boolean, onExpire: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!active || expiresAt <= 0) return;

    const sync = () => setNow(Date.now());
    const firstTick = setTimeout(sync, 0);
    const tick = setInterval(sync, 1000);
    const expire = setTimeout(() => {
      sync();
      onExpireRef.current();
    }, Math.max(0, expiresAt - Date.now()));

    return () => {
      clearTimeout(firstTick);
      clearInterval(tick);
      clearTimeout(expire);
    };
  }, [active, expiresAt]);

  return active ? Math.max(0, expiresAt - now) : 0;
}
