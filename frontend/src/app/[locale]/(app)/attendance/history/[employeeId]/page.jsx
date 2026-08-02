'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { fetchAttendanceHistory } from '@/lib/attendanceApi';
import AttendanceSummaryCards from '@/components/attendance/AttendanceSummaryCards';
import AttendanceTable from '@/components/attendance/AttendanceTable';

export default function AttendanceHistoryPage() {
  const t = useTranslations('Attendance');
  const ti = useTranslations('Index');
  const params = useParams();
  const employeeId = params?.employeeId;

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const data = await fetchAttendanceHistory(employeeId);
      setPayload(data);
    } catch {
      toast.error(t('historyLoadFail'));
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const tableRows = useMemo(
    () =>
      (payload?.records ?? []).map((rec) => ({
        id: rec.id,
        dateLabel: new Date(rec.date).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        status: rec.status,
        overtime_hours: rec.overtime_hours ?? 0,
      })),
    [payload]
  );

  const employee = payload?.employee;

  return (
    <div>
      <Link
        href="/attendance"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('backToMark')}
      </Link>

      {loading ? (
        <p className="py-20 text-center text-slate-500">{ti('loading')}</p>
      ) : !employee ? (
        <p className="text-slate-600">{t('employeeNotFound')}</p>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('attendanceHistory')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{employee.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{employee.email}</p>
          </div>

          <AttendanceSummaryCards summary={payload?.summary} />

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-semibold text-slate-800 dark:text-white">{t('historyTableTitle')}</h2>
            </div>
            {tableRows.length === 0 ? (
              <p className="p-8 text-center text-slate-500">{t('empty')}</p>
            ) : (
              <AttendanceTable mode="history" rows={tableRows} readOnly showHistoryLink={false} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
