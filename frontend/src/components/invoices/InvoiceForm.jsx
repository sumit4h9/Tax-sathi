'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import InvoiceTotalsPreview from '@/components/invoices/InvoiceTotalsPreview';

const emptyLine = () => ({ description: '', quantity: 1, rate: 0 });

export default function InvoiceForm({ initialInvoice, onSubmit, submitLabel, cancelHref = '/invoices' }) {
  const t = useTranslations('Invoices');
  const isEdit = Boolean(initialInvoice?.id);

  const [firms, setFirms] = useState([]);
  const [firmId, setFirmId] = useState(initialInvoice ? String(initialInvoice.firm_id) : '');
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoice_number ?? '');
  const [date, setDate] = useState(initialInvoice?.date ?? new Date().toISOString().slice(0, 10));
  const [direction, setDirection] = useState(initialInvoice?.direction ?? 'outbound');
  const [taxMode, setTaxMode] = useState(initialInvoice?.tax_mode ?? 'intra_state');
  const [cgstPct, setCgstPct] = useState(String(initialInvoice?.cgst_percent ?? '9'));
  const [sgstPct, setSgstPct] = useState(String(initialInvoice?.sgst_percent ?? '9'));
  const [igstPct, setIgstPct] = useState(String(initialInvoice?.igst_percent ?? '18'));
  const [lines, setLines] = useState(
    initialInvoice?.items?.length
      ? initialInvoice.items.map((row) => ({
          description: row.description,
          quantity: row.quantity,
          rate: Number(row.rate),
        }))
      : [emptyLine()]
  );
  const [saving, setSaving] = useState(false);
  const [newFirm, setNewFirm] = useState({ name: '', gstin: '', phone: '', address: '' });
  const [showFirmForm, setShowFirmForm] = useState(false);

  const loadFirms = useCallback(async () => {
    const { data } = await api.get('/firms');
    setFirms(Array.isArray(data) ? data : data?.data ?? []);
  }, []);

  useEffect(() => {
    loadFirms();
    if (!isEdit && !invoiceNumber) {
      const y = new Date().getFullYear();
      setInvoiceNumber(`INV-${y}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
    }
  }, [loadFirms, isEdit, invoiceNumber]);

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (i) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i, patch) => {
    setLines((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  };

  const submitFirm = async (e) => {
    e.preventDefault();
    if (!newFirm.name.trim()) {
      toast.error(t('firmNameRequired'));
      return;
    }
    try {
      const { data } = await api.post('/firms', {
        name: newFirm.name.trim(),
        gstin: newFirm.gstin || null,
        phone: newFirm.phone || null,
        address: newFirm.address || null,
      });
      toast.success(t('firmSaved'));
      const created = data?.data ?? data;
      setFirms((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setFirmId(String(created.id));
      setNewFirm({ name: '', gstin: '', phone: '', address: '' });
      setShowFirmForm(false);
    } catch {
      toast.error(t('firmSaveError'));
    }
  };

  const buildPayload = () => {
    const items = lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity),
        rate: Number(l.rate),
      }));
    const payload = {
      firm_id: firmId,
      invoice_number: invoiceNumber.trim(),
      date,
      direction,
      tax_mode: taxMode,
      items,
    };
    if (taxMode === 'intra_state') {
      payload.cgst_percent = Number(cgstPct);
      payload.sgst_percent = Number(sgstPct);
    } else {
      payload.igst_percent = Number(igstPct);
    }
    return payload;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!firmId) {
      toast.error(t('selectFirmError'));
      return;
    }
    const payload = buildPayload();
    if (payload.items.length === 0) {
      toast.error(t('lineItemsError'));
      return;
    }
    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  };

  const selectedFirm = firms.find((f) => String(f.id) === firmId);

  return (
    <form onSubmit={submit} className="space-y-8 max-w-4xl">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('firm')}</label>
            <select
              required
              value={firmId}
              onChange={(e) => setFirmId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="">{t('selectFirm')}</option>
              {firms.map((f) => (
                <option key={f.id} value={String(f.id)}>
                  {f.name}
                </option>
              ))}
            </select>
            {selectedFirm?.gstin && <p className="text-xs text-slate-500">GSTIN: {selectedFirm.gstin}</p>}
          </div>
          <button
            type="button"
            onClick={() => setShowFirmForm((v) => !v)}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium"
          >
            {showFirmForm ? t('hideNewFirm') : t('newFirm')}
          </button>
        </div>

        {showFirmForm && (
          <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('addFirmTitle')}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder={t('firmNamePlaceholder')}
                value={newFirm.name}
                onChange={(e) => setNewFirm((s) => ({ ...s, name: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                placeholder="GSTIN"
                value={newFirm.gstin}
                onChange={(e) => setNewFirm((s) => ({ ...s, gstin: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                placeholder={t('phonePlaceholder')}
                value={newFirm.phone}
                onChange={(e) => setNewFirm((s) => ({ ...s, phone: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                placeholder={t('addressPlaceholder')}
                value={newFirm.address}
                onChange={(e) => setNewFirm((s) => ({ ...s, address: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 sm:col-span-2"
              />
            </div>
            <button
              type="button"
              onClick={submitFirm}
              className="px-4 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-sm font-medium"
            >
              {t('saveFirm')}
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('invoiceNumber')}</label>
            <input
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('date')}</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('directionLabel')}</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            >
              <option value="outbound">{t('outbound')}</option>
              <option value="inbound">{t('inbound')}</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('taxMode')}</label>
            <select
              value={taxMode}
              onChange={(e) => setTaxMode(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            >
              <option value="intra_state">{t('intraState')}</option>
              <option value="inter_state">{t('interState')}</option>
            </select>
          </div>
        </div>

        {taxMode === 'intra_state' ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('cgstPct')}</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={cgstPct}
                onChange={(e) => setCgstPct(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('sgstPct')}</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={sgstPct}
                onChange={(e) => setSgstPct(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-xs">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('igstPct')}</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={igstPct}
              onChange={(e) => setIgstPct(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-white">{t('linesTitle')}</h2>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium"
          >
            <Plus className="w-4 h-4" /> {t('addLine')}
          </button>
        </div>
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-end">
              <input
                placeholder={t('description')}
                value={line.description}
                onChange={(e) => updateLine(i, { description: e.target.value })}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
              <input
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                aria-label={t('qty')}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={line.rate}
                onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                className="w-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                aria-label={t('rate')}
              />
              <button
                type="button"
                disabled={lines.length <= 1}
                onClick={() => removeLine(i)}
                className="p-2 text-red-600 disabled:opacity-30"
                aria-label={t('delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <InvoiceTotalsPreview
          lines={lines}
          taxMode={taxMode}
          cgstPct={cgstPct}
          sgstPct={sgstPct}
          igstPct={igstPct}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t('saving') : submitLabel}
        </button>
        <Link href={cancelHref} className="px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg">
          {t('cancel')}
        </Link>
      </div>
    </form>
  );
}
