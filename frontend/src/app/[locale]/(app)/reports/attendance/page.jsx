'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { unwrapApiData } from '@/lib/apiResponse';
import AttendanceSummaryCards from '@/components/attendance/AttendanceSummaryCards';

export default function AttendanceReportsPage() {
  const t = useTranslations('Reports');
  const ti = useTranslations('Index');
  const ta = useTranslations('Attendance');
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/attendance?month=${month}&year=${year}`);
      setReport(unwrapApiData(data));
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        t('loadFail');
      toast.error(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [month, year, t]);

  useEffect(() => {
    load();
  }, [load]);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const employees = report?.employees ?? [];
  const totals = report?.totals ?? {
    total_present: report?.total_present,
    total_absent: report?.total_absent,
    total_half_day: report?.total_half_day,
    total_overtime: report?.total_overtime,
  };

  return (
    <div>
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('backToReports')}
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">{t('attendanceReport')}</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('month')}</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('year')}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? t('refreshing') : t('refresh')}
        </button>
      </div>

      {report && (
        <AttendanceSummaryCards
          summary={{
            total_present: totals.total_present,
            total_absent: totals.total_absent,
            total_half_days: totals.total_half_day,
            total_overtime: totals.total_overtime,
          }}
        />
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 font-medium">{ta('colEmployee')}</th>
                <th className="p-3 font-medium text-center">{ta('present')}</th>
                <th className="p-3 font-medium text-center">{ta('absent')}</th>
                <th className="p-3 font-medium text-center">{ta('halfDay')}</th>
                <th className="p-3 font-medium text-right">{ta('overtime')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {ti('loading')}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.employee_id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-3">
                      <Link
                        href={`/attendance/history/${emp.employee_id}`}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {emp.name}
                      </Link>
                    </td>
                    <td className="p-3 text-center">{emp.present}</td>
                    <td className="p-3 text-center">{emp.absent}</td>
                    <td className="p-3 text-center">{emp.half_day}</td>
                    <td className="p-3 text-right">{Number(emp.overtime_hours).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
