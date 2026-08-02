'use client';

import { useTranslations } from 'next-intl';
import { UserCheck, UserX, Clock, CalendarDays } from 'lucide-react';

export default function AttendanceSummaryCards({ summary }) {
  const t = useTranslations('Attendance');

  const cards = [
    {
      label: t('totalPresent'),
      value: summary?.total_present ?? 0,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: t('totalAbsent'),
      value: summary?.total_absent ?? 0,
      icon: UserX,
      color: 'text-red-600',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: t('totalHalfDays'),
      value: summary?.total_half_days ?? 0,
      icon: CalendarDays,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: t('totalOvertime'),
      value: summary?.total_overtime ?? 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className={`p-3 rounded-lg ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
