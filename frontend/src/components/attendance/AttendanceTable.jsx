'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { History } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'present', key: 'present' },
  { value: 'absent', key: 'absent' },
  { value: 'half-day', key: 'halfDay' },
];

/**
 * @param {{
 *   mode?: 'mark' | 'history',
 *   rows: Array<Record<string, unknown>>,
 *   onChange?: (id: number, patch: object) => void,
 *   readOnly?: boolean,
 *   showHistoryLink?: boolean,
 *   loading?: boolean,
 * }} props
 */
export default function AttendanceTable({
  mode = 'mark',
  rows,
  onChange,
  readOnly = false,
  showHistoryLink = true,
  loading = false,
}) {
  const t = useTranslations('Attendance');
  const ti = useTranslations('Index');
  const tInv = useTranslations('Invoices');

  if (loading) {
    return <p className="py-16 text-center text-slate-500 dark:text-slate-400">{ti('loading')}</p>;
  }

  if (rows.length === 0) {
    return <p className="py-16 text-center text-slate-500 dark:text-slate-400">{t('noEmployees')}</p>;
  }

  const isHistory = mode === 'history';
  const firstColLabel = isHistory ? tInv('colDate') : t('colEmployee');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <th className="p-4 font-medium">{firstColLabel}</th>
            <th className="p-4 font-medium">{t('status')}</th>
            <th className="p-4 font-medium">{t('overtime')}</th>
            {!isHistory && showHistoryLink && (
              <th className="p-4 font-medium text-right">{t('colActions')}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
            >
              <td className="p-4">
                {isHistory ? (
                  <span className="text-slate-800 dark:text-slate-200">{row.dateLabel}</span>
                ) : (
                  <>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{row.name}</p>
                    {row.role && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{row.role}</p>
                    )}
                  </>
                )}
              </td>
              <td className="p-4">
                {readOnly || isHistory ? (
                  <span className="capitalize text-slate-700 dark:text-slate-300">
                    {statusLabel(row.status, t)}
                  </span>
                ) : (
                  <select
                    value={row.status}
                    onChange={(e) => onChange?.(row.id, { status: e.target.value })}
                    className="w-full min-w-[120px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {t(opt.key)}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td className="p-4">
                {readOnly || isHistory ? (
                  <span className="text-slate-700 dark:text-slate-300">{row.overtime_hours ?? 0}</span>
                ) : (
                  <input
                    type="number"
                    min={0}
                    step="0.25"
                    value={row.overtime_hours}
                    onChange={(e) => onChange?.(row.id, { overtime_hours: e.target.value })}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    aria-label={t('overtime')}
                  />
                )}
              </td>
              {!isHistory && showHistoryLink && (
                <td className="p-4 text-right">
                  <Link
                    href={`/attendance/history/${row.employeeId ?? row.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    <History className="w-4 h-4" />
                    {t('attendanceHistory')}
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusLabel(status, t) {
  if (status === 'present') return t('present');
  if (status === 'absent') return t('absent');
  if (status === 'half-day') return t('halfDay');
  return status;
}
