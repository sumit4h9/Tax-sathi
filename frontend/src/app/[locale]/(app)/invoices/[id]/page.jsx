'use client';

import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { ArrowLeft, Mail, Trash2, Download, Pencil } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { downloadInvoicePdf } from '@/lib/invoicePdf';
import { useRole } from '@/hooks/useRole';
import { confirmAction } from '@/components/ui/confirm';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function InvoiceDetailPage() {
  const t = useTranslations('Invoices');
  const ti = useTranslations('Index');
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { isAdmin } = useRole();
  const [inv, setInv] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInv(data);
    } catch {
      toast.error(t('notFound'));
      setInv(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const sendMail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('emailRequired'));
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post(`/invoices/${id}/send-email`, { email: email.trim() });
      if (data?.delivered) {
        toast.success(t('emailSent'));
      } else {
        toast.warning(data?.hint || data?.message || t('emailFail'));
      }
    } catch (err) {
      toast.error(err?.friendlyMessage || t('emailFail'));
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(id, inv?.invoice_number ?? 'invoice');
      toast.success(t('pdfDownloaded'));
    } catch {
      toast.error(t('pdfFail'));
    } finally {
      setDownloading(false);
    }
  };

  const remove = async () => {
    if (!confirmAction(t('deleteConfirm'))) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success(t('invoiceDeleted'));
      router.push('/invoices');
    } catch (err) {
      toast.error(err?.friendlyMessage || t('deleteFail'));
    }
  };

  if (loading) {
    return <p className="py-20 text-center text-slate-500">{ti('loading')}</p>;
  }

  if (!inv) {
    return (
      <section className="space-y-4">
        <Link href="/invoices" className="text-blue-600 text-sm">
          ← {t('detailBack')}
        </Link>
        <p className="text-slate-600">{t('notFound')}</p>
      </section>
    );
  }

  const taxMode = inv.tax_mode ?? 'intra_state';
  const cgstPct = inv.cgst_percent ?? 9;
  const sgstPct = inv.sgst_percent ?? 9;
  const igstPct = inv.igst_percent ?? 18;

  return (
    <section className="max-w-3xl">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('detailBack')}
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{inv.invoice_number}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {new Date(inv.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {inv.firm && (
            <address className="mt-4 text-sm text-slate-700 dark:text-slate-300 not-italic">
              <p className="font-semibold">{inv.firm.name}</p>
              {inv.firm.gstin && <p>GSTIN: {inv.firm.gstin}</p>}
              {inv.firm.address && <p className="whitespace-pre-line">{inv.firm.address}</p>}
              {inv.firm.phone && <p>{inv.firm.phone}</p>}
            </address>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Link
              href={`/invoices/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
            >
              <Pencil className="w-4 h-4" /> {t('edit')}
            </Link>
          )}
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? t('downloading') : t('downloadPdf')}
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={remove}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-sm"
            >
              <Trash2 className="w-4 h-4" /> {t('delete')}
            </button>
          )}
        </div>
      </header>

      <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500">
            <tr>
              <th className="text-left p-3">{t('description')}</th>
              <th className="text-right p-3">{t('qty')}</th>
              <th className="text-right p-3">{t('rate')}</th>
              <th className="text-right p-3">{t('amount')}</th>
            </tr>
          </thead>
          <tbody>
            {(inv.items ?? []).map((row) => (
              <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3 text-slate-800 dark:text-slate-200">{row.description}</td>
                <td className="p-3 text-right">{row.quantity}</td>
                <td className="p-3 text-right">{money.format(Number(row.rate))}</td>
                <td className="p-3 text-right font-medium">{money.format(Number(row.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-1 text-right text-sm">
          <p>
            {t('subtotal')}: <span className="font-medium">{money.format(Number(inv.subtotal))}</span>
          </p>
          {taxMode === 'intra_state' ? (
            <>
              <p>
                {t('cgstLine', { pct: cgstPct })}:{' '}
                <span className="font-medium">{money.format(Number(inv.cgst))}</span>
              </p>
              <p>
                {t('sgstLine', { pct: sgstPct })}:{' '}
                <span className="font-medium">{money.format(Number(inv.sgst))}</span>
              </p>
            </>
          ) : (
            <p>
              {t('igstLine', { pct: igstPct })}:{' '}
              <span className="font-medium">{money.format(Number(inv.igst))}</span>
            </p>
          )}
          <p className="text-lg font-bold text-slate-900 dark:text-white pt-2">
            {t('total')}: {money.format(Number(inv.total_amount))}
          </p>
        </footer>
      </article>

      {isAdmin && (
        <article className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5" /> {t('sendPdf')}
          </h2>
          <form onSubmit={sendMail} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {sending ? t('sending') : t('send')}
            </button>
          </form>
        </article>
      )}
    </section>
  );
}
