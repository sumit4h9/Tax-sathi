'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import {
  bulkMarkAttendance,
  fetchAttendanceByDate,
  normalizeUserList,
} from '@/lib/attendanceApi';
import AttendanceTable from '@/components/attendance/AttendanceTable';

const defaultEntry = () => ({ status: 'present', overtime_hours: '0' });

export default function AttendancePage() {
  const tNav = useTranslations('Index');
  const tInv = useTranslations('Invoices');
  const t = useTranslations('Attendance');
  const [employees, setEmployees] = useState([]);
  const [entries, setEntries] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, attendancePayload] = await Promise.all([
        api.get('/team'),
        fetchAttendanceByDate(date),
      ]);

      const team = normalizeUserList(teamRes.data);
      setEmployees(team);

      const byUser = {};
      (attendancePayload?.records ?? []).forEach((rec) => {
        const uid = rec.employee_id ?? rec.user_id;
        byUser[uid] = {
          status: rec.status,
          overtime_hours: String(rec.overtime_hours ?? 0),
        };
      });

      const merged = {};
      team.forEach((emp) => {
        merged[emp.id] = byUser[emp.id] ?? defaultEntry();
      });
      setEntries(merged);
    } catch {
      toast.error(t('loadFail'));
      setEmployees([]);
      setEntries({});
    } finally {
      setLoading(false);
    }
  }, [date, t]);

  useEffect(() => {
    load();
  }, [load]);

  const tableRows = useMemo(
    () =>
      employees.map((emp) => ({
        id: emp.id,
        employeeId: emp.id,
        name: emp.name,
        role: emp.role,
        status: entries[emp.id]?.status ?? 'present',
        overtime_hours: entries[emp.id]?.overtime_hours ?? '0',
      })),
    [employees, entries]
  );

  const handleChange = (id, patch) => {
    setEntries((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (employees.length === 0) {
      toast.error(t('noEmployees'));
      return;
    }

    const records = employees.map((emp) => ({
      employee_id: String(emp.id),
      status: String(entries[emp.id]?.status ?? 'present')
        .toLowerCase()
        .replace(/_/g, '-'),
      overtime_hours:
        entries[emp.id]?.overtime_hours === '' || entries[emp.id]?.overtime_hours == null
          ? 0
          : Number(entries[emp.id].overtime_hours),
    }));

    setSaving(true);
    try {
      await bulkMarkAttendance(date, records);
      toast.success(t('saved'));
      await load();
    } catch (err) {
      toast.error(err?.message ?? t('saveFail'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{tNav('attendance')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{t('markAttendance')}</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-xs">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {tInv('date')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-800 dark:text-white">{t('markTitle')}</h2>
          </div>
          <AttendanceTable
            mode="mark"
            rows={tableRows}
            onChange={handleChange}
            loading={loading}
            showHistoryLink
          />
        </div>

        <button
          type="submit"
          disabled={saving || loading || employees.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t('saving') : t('submitMark')}
        </button>
      </form>
    </div>
  );
}
