'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function SendInvoiceEmailDialog({ invoiceId, open, onClose }) {
  const t = useTranslations('Invoices');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('emailRequired'));
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post(`/invoices/${invoiceId}/send-email`, { email: email.trim() });
      if (data?.delivered) {
        toast.success(t('emailSent'));
        setEmail('');
        onClose();
      } else {
        toast.warning(data?.hint || data?.message || t('emailFail'));
      }
    } catch (err) {
      toast.error(err?.friendlyMessage || t('emailFail'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5" /> {t('sendPdf')}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {sending ? t('sending') : t('send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
