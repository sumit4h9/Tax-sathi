'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/useAuthStore';
import { FileText, Users, CalendarCheck, IndianRupee, Plus, UserPlus, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { unwrapApiData } from '@/lib/apiResponse';
import RecentInvoicesTable from '@/components/dashboard/RecentInvoicesTable';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import { useRole } from '@/hooks/useRole';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const ti = useTranslations('Index');
  const { user } = useAuthStore();
  const { isAdmin } = useRole();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/dashboard/summary');
        if (!cancelled) setStats(unwrapApiData(data));
      } catch {
        if (!cancelled) {
          setStats({
            total_invoices: 0,
            total_employees: 0,
            attendance_percentage_this_month: 0,
            total_revenue: 0,
            recent_invoices: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: t('totalInvoices'),
      value: stats ? String(stats.total_invoices) : '—',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: t('totalEmployees'),
      value: stats ? String(stats.total_employees) : '—',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: t('attendancePercent'),
      value: stats ? `${stats.attendance_percentage_this_month}%` : '—',
      icon: CalendarCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      title: t('revenue'),
      value: stats ? money.format(Number(stats.total_revenue)) : '—',
      icon: IndianRupee,
      color: 'text-violet-600',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
    },
  ];

  if (isAdmin) {
    cards.push(
      {
        title: 'Completed Jobs',
        value: stats ? String(stats.completed_jobs) : '—',
        icon: CalendarCheck,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      },
      {
        title: 'In Progress Jobs',
        value: stats ? String(stats.in_progress_jobs) : '—',
        icon: ClipboardList,
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
      },
      {
        title: 'Total Payroll',
        value: stats ? money.format(Number(stats.total_payroll)) : '—',
        icon: IndianRupee,
        color: 'text-indigo-600',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      },
      {
        title: 'Total Overtime',
        value: stats ? money.format(Number(stats.total_overtime_payments)) : '—',
        icon: IndianRupee,
        color: 'text-orange-600',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
      },
      {
        title: 'Total Deductions',
        value: stats ? money.format(Number(stats.total_deductions)) : '—',
        icon: IndianRupee,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/30',
      }
    );
  }

  const quickActions = [
    { href: '/invoices/create', label: t('createInvoice'), icon: Plus },
    { href: '/employees', label: t('addEmployee'), icon: UserPlus, adminOnly: true },
    { href: '/attendance', label: t('markAttendance'), icon: ClipboardList },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          {ti('welcome')}, {user?.name}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{ti('overviewSubtitle')}</p>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4"
          >
            <div className={`p-4 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions
            .filter((a) => !a.adminOnly || isAdmin)
            .map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </Link>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white">{t('recentInvoices')}</h2>
          <Link href="/invoices" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {t('viewAll')}
          </Link>
        </div>
        <RecentInvoicesTable invoices={stats?.recent_invoices ?? []} loading={loading} />
      </div>
    </div>
  );
}
