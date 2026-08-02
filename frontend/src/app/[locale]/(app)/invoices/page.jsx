'use client';

import { useTranslations } from 'next-intl';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2, Mail } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import SendInvoiceEmailDialog from '@/components/invoices/SendInvoiceEmailDialog';
import { useRole } from '@/hooks/useRole';
import { confirmAction } from '@/components/ui/confirm';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function InvoicesPage() {
  const t = useTranslations('Invoices');
  const ti = useTranslations('Index');
  const tn = useTranslations('NoData');
  const { isAdmin } = useRole();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [firms, setFirms] = useState([]);
  const [firmId, setFirmId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [direction, setDirection] = useState('');
  const [emailTarget, setEmailTarget] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/firms');
        setFirms(data);
      } catch {
        setFirms([]);
      }
    })();
  }, []);

  const load = useCallback(
    async (p) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (firmId) params.set('firm_id', firmId);
        if (month) params.set('month', month);
        if (year) params.set('year', year);
        if (direction) params.set('direction', direction);
        const { data } = await api.get(`/invoices?${params.toString()}`);
        setRows(data.data);
        setLastPage(data.meta?.last_page ?? 1);
        setPage(data.meta?.current_page ?? p);
      } finally {
        setLoading(false);
      }
    },
    [firmId, month, year, direction]
  );

  useEffect(() => {
    setPage(1);
  }, [firmId, month, year, direction]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.invoice_number.toLowerCase().includes(s) ||
        (r.firm?.name ?? '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  const dirLabel = (d) =>
    d === 'inbound' ? t('inbound') : d === 'outbound' ? t('outbound') : '—';

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  }, []);

  const remove = async (row) => {
    if (!confirmAction(t('deleteConfirm'))) return;
    try {
      await api.delete(`/invoices/${row.id}`);
      toast.success(t('invoiceDeleted'));
      load(page);
    } catch {
      toast.error(t('deleteFail'));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{ti('invoices')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>

        {isAdmin && (
          <Link
            href="/invoices/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>{t('create')}</span>
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('filterFirm')}</label>
              <select
                value={firmId}
                onChange={(e) => setFirmId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm min-w-[140px]"
              >
                <option value="">{t('allFirms')}</option>
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('filterMonth')}</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
              >
                <option value="">{t('anyMonth')}</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('filterYear')}</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm"
              >
                <option value="">{t('anyYear')}</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t('filterDirection')}</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm min-w-[140px]"
              >
                <option value="">{t('allDirections')}</option>
                <option value="outbound">{t('outbound')}</option>
                <option value="inbound">{t('inbound')}</option>
              </select>
            </div>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium">{t('colNumber')}</th>
                <th className="p-4 font-medium">{t('colDate')}</th>
                <th className="p-4 font-medium">{t('colDirection')}</th>
                <th className="p-4 font-medium">{t('colFirm')}</th>
                <th className="p-4 font-medium">{t('colAmount')}</th>
                <th className="p-4 font-medium text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <TableSkeleton rows={4} cols={3} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState title={tn('noInvoices')} description={tn('noInvoicesHint')} icon={FileText} />
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {r.invoice_number}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(r.date).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{dirLabel(r.direction)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{r.firm?.name ?? '—'}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {money.format(Number(r.total_amount))}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/invoices/${r.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs sm:text-sm"
                        >
                          {t('view')}
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href={`/invoices/${r.id}/edit`}
                              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs sm:text-sm"
                            >
                              <Pencil className="w-3.5 h-3.5" /> {t('edit')}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEmailTarget(r)}
                              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs sm:text-sm"
                            >
                              <Mail className="w-3.5 h-3.5" /> {t('email')}
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(r)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-xs sm:text-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lastPage > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> {t('prev')}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {t('pageOf', { page, total: lastPage })}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40"
            >
              {t('next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <SendInvoiceEmailDialog
        invoiceId={emailTarget?.id}
        open={Boolean(emailTarget)}
        onClose={() => setEmailTarget(null)}
      />
    </div>
  );
}
