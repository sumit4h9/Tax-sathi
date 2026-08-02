'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

function isChunkLoadError(reason) {
  const message =
    reason?.message ||
    reason?.toString?.() ||
    (typeof reason === 'string' ? reason : '');

  return (
    reason?.name === 'ChunkLoadError' ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to fetch dynamically imported module')
  );
}

export default function Providers({ children }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const reloadOnce = () => {
      const key = 'chunk_reload';
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        return;
      }
      sessionStorage.setItem(key, '1');
      window.location.reload();
    };

    const onError = (event) => {
      if (isChunkLoadError(event.error || event.message)) {
        reloadOnce();
      }
    };

    const onRejection = (event) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return children;
}
