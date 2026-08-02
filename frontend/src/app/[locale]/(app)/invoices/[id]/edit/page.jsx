'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import InvoiceGenerator from '@/components/invoices/InvoiceGenerator';

export default function EditInvoicePage() {
  const t = useTranslations('Invoices');
  const ti = useTranslations('Index');
  const params = useParams();
  const id = params?.id;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data);
    } catch {
      toast.error(t('notFound'));
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (payload) => {
    try {
      const { data } = await api.put(`/invoices/${id}`, payload);
      toast.success(t('invoiceUpdated'));
      return data.invoice;
    } catch (err) {
      const msg =
        err?.response?.data?.message != null
          ? String(err.response.data.message)
          : String(err?.message ?? '');
      toast.error(msg || t('firmSaveError'));
      throw err;
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">{ti('loading')}</div>;
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Link href="/invoices" className="text-blue-600 text-sm">
          ← {t('detailBack')}
        </Link>
        <p className="text-slate-600">{t('notFound')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/invoices/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('editTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{invoice.invoice_number}</p>
      </div>
      <InvoiceGenerator initialInvoice={invoice} onSubmit={handleSubmit} submitLabel={t('submitUpdate')} />
    </div>
  );
}
