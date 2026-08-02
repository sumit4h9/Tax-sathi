'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function RecentInvoicesTable({ invoices = [], loading }) {
  const t = useTranslations('Dashboard');
  const ti = useTranslations('Index');

  if (loading) {
    return <p className="p-8 text-center text-slate-500">{ti('loading')}</p>;
  }

  if (!invoices.length) {
    return <p className="p-8 text-center text-slate-500">{t('noRecentInvoices')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="p-3 font-medium">{t('colInvoiceNo')}</th>
            <th className="p-3 font-medium">{t('colClient')}</th>
            <th className="p-3 font-medium text-right">{t('colAmount')}</th>
            <th className="p-3 font-medium">{t('colDate')}</th>
            <th className="p-3 font-medium text-right">{t('colAction')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{inv.invoice_number}</td>
              <td className="p-3 text-slate-600 dark:text-slate-400">{inv.firm?.name ?? '—'}</td>
              <td className="p-3 text-right font-medium">{money.format(Number(inv.total_amount))}</td>
              <td className="p-3 text-slate-600 dark:text-slate-400">
                {new Date(inv.date).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="p-3 text-right">
                <Link
                  href={`/invoices/${inv.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t('view')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
