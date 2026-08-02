'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import InvoiceGenerator from '@/components/invoices/InvoiceGenerator';

export default function CreateInvoicePage() {
  const t = useTranslations('Invoices');
  const ti = useTranslations('Index');

  const handleSubmit = async (payload) => {
    try {
      const { data } = await api.post('/invoices', payload);
      toast.success(t('invoiceCreated'));
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

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')} ({ti('invoices')})
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('createTitle')}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{t('createSubtitle')}</p>
      </div>
      <InvoiceGenerator onSubmit={handleSubmit} submitLabel={t('submitCreate')} />
    </div>
  );
}
