'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRole } from '@/hooks/useRole';
import { isAdminOnlyPath } from '@/lib/roles';

export default function RoleGuard({ children }) {
  const { isAdmin } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Role');

  useEffect(() => {
    if (!isAdmin && isAdminOnlyPath(pathname)) {
      toast.error(t('unauthorized'));
      router.replace('/dashboard');
    }
  }, [isAdmin, pathname, router, t]);

  if (!isAdmin && isAdminOnlyPath(pathname)) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        {t('unauthorized')}
      </div>
    );
  }

  return children;
}
