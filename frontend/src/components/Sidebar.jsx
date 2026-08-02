'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Mail,
  LogOut,
  Menu,
  UserCog,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRole } from '@/hooks/useRole';

export default function Sidebar() {
  const t = useTranslations('Index');
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { isAdmin } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = useMemo(() => {
    const items = [
      { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      { href: '/invoices', label: t('invoices'), icon: FileText },
      { href: '/attendance', label: t('attendance'), icon: Users },
    ];
    if (isAdmin) {
      items.push({ href: '/reports', label: t('reports'), icon: BarChart3 });
      items.push({ href: '/employees', label: t('employees'), icon: UserCog });
    }
    items.push({ href: '/contact', label: t('contact'), icon: Mail });
    return items;
  }, [t, isAdmin]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md dark:bg-slate-800"
      >
        <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <header className="p-6 space-y-3">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('brand')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAdmin ? t('roleAdmin') : t('roleStaff')}
            </p>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-slate-500">{t('language')}</span>
              <LanguageSwitcher />
            </div>
          </header>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <footer className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
}
