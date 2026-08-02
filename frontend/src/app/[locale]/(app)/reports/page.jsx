'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FileText, Users } from 'lucide-react';

export default function ReportsHubPage() {
  const t = useTranslations('Reports');
  const ti = useTranslations('Index');

  const cards = [
    {
      href: '/reports/invoices',
      title: t('invoiceReport'),
      description: t('invoiceReportDesc'),
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      href: '/reports/attendance',
      title: t('attendanceReport'),
      description: t('attendanceReportDesc'),
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      href: '/reports/salary',
      title: t('salaryReport'),
      description: t('salaryReportDesc'),
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{ti('reports')}</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">{t('hubSubtitle')}</p>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition shadow-sm group"
          >
            <div className={`inline-flex p-3 rounded-lg ${card.bg} mb-4`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white group-hover:text-blue-600">
              {card.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
