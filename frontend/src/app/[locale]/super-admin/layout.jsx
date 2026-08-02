'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Bell, MessageSquare, LogOut } from 'lucide-react';

export default function SuperAdminLayout({ children }) {
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'super_admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">Loading Super Admin...</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/en/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/en/super-admin/users', icon: Users },
    { label: 'Messaging', href: '/en/super-admin/messaging', icon: Bell },
    { label: 'Contact Messages', href: '/en/super-admin/contact-messages', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            <span className="text-blue-500">TAX</span>SATHI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Super Admin</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <item.icon className="w-5 h-5 text-slate-400" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
