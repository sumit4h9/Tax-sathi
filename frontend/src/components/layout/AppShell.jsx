'use client';

import Sidebar from '@/components/Sidebar';
import RoleGuard from '@/components/auth/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AppShell({ children }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Index');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <RoleGuard>{children}</RoleGuard>
        </div>
      </div>
    </div>
  );
}
