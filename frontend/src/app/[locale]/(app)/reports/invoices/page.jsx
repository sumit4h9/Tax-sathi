'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { unwrapApiData } from '@/lib/apiResponse';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function InvoiceReportsPage() {
  const t = useTranslations('Reports');
  const ti = useTranslations('Index');
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [firmId, setFirmId] = useState('');
  const [firms, setFirms] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/firms');
        setFirms(Array.isArray(data) ? data : data?.data ?? []);
      } catch {
        setFirms([]);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month, year });
      if (firmId) params.set('firm_id', firmId);
      const { data } = await api.get(`/reports/invoices?${params.toString()}`);
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
  }, [month, year, firmId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const rows = report?.invoices ?? report?.records ?? [];

  return (
    <div>
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('backToReports')}
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">{t('invoiceReport')}</h1>

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
        <div>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{t('firmFilter')}</label>
          <select
            value={firmId}
            onChange={(e) => setFirmId(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 min-w-[160px]"
          >
            <option value="">{t('allFirms')}</option>
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
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
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-500">{t('totalRevenue')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {money.format(Number(report.total_revenue ?? report.total_amount ?? 0))}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm text-slate-500">{t('totalTax')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
              {money.format(Number(report.total_tax ?? 0))}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 font-medium">{t('colInvoiceNo')}</th>
                <th className="p-3 font-medium">{t('colFirm')}</th>
                <th className="p-3 font-medium text-right">{t('colAmount')}</th>
                <th className="p-3 font-medium text-right">{t('colTax')}</th>
                <th className="p-3 font-medium">{t('colDate')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {ti('loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const tax =
                    Number(r.cgst ?? 0) + Number(r.sgst ?? 0) + Number(r.igst ?? 0);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-3 font-medium">{r.invoice_number}</td>
                      <td className="p-3">{r.firm?.name ?? '—'}</td>
                      <td className="p-3 text-right">{money.format(Number(r.total_amount))}</td>
                      <td className="p-3 text-right">{money.format(tax)}</td>
                      <td className="p-3 text-slate-600">{r.date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
