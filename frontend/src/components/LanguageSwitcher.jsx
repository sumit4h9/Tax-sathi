'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const btn = (code, label) => (
    <Link
      href={pathname}
      locale={code}
      className={`px-2 py-1 rounded text-xs font-medium transition ${
        locale === code
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-900/50">
      {btn('en', 'EN')}
      {btn('hi', 'हि')}
    </span>
  );
}
