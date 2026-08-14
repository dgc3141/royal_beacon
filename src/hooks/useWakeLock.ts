import { useEffect, useRef } from 'react';

export const useWakeLock = (): void => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return;
    }

    const requestLock = async () => {
      try {
        if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        }
      } catch {
        wakeLockRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestLock();
      }
    };

    requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);
};
