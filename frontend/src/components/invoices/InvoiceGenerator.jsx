'use client';

import { useTranslations } from 'next-intl';
import { Plus, Trash2, Download, Mail } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { downloadInvoicePdf } from '@/lib/invoicePdf';
import { rupeesInWords } from '@/lib/numberToWords';
import InvoicePrintLayout from '@/components/invoices/InvoicePrintLayout';
import {
  buildApiPayload,
  emptyItem,
  formatAmount,
  formatDisplayDate,
  invoiceToFormState,
  loadSellerFromStorage,
  parseAmount,
  saveSellerToStorage,
} from '@/components/invoices/invoiceGeneratorUtils';

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-600 dark:bg-slate-900 dark:text-white';
const labelClass = 'block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300';

function todayDisplay() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} HRS`;
}

export default function InvoiceGenerator({ initialInvoice, onSubmit, submitLabel }) {
  const t = useTranslations('Invoices');
  const isEdit = Boolean(initialInvoice?.id);
  const [savedId, setSavedId] = useState(initialInvoice?.id ?? null);

  const [firms, setFirms] = useState([]);
  const [firmId, setFirmId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [seller, setSeller] = useState(loadSellerFromStorage);
  const [customer, setCustomer] = useState({
    name: '',
    address1: '',
    address2: '',
    address3: '',
    state: '',
    stateCode: '',
    gst: '',
    pan: '',
  });
  const [meta, setMeta] = useState({
    date: todayDisplay(),
    time: nowTime(),
    vendorCode: '',
    dateTimePrepare: todayDisplay(),
    dateTimeRemoval: todayDisplay(),
    partyChNo: '',
    partyChDate: '',
    poNo: '',
    poDate: '',
    transport: '',
    vehicleNo: '',
    apxWeight: '0.00',
    eWayNo: '',
    cartons: '',
    freight: '0.00',
    cuttingCharges: '0.00',
  });
  const [items, setItems] = useState([emptyItem(1)]);
  const [taxRates, setTaxRates] = useState({ cgst: 9, sgst: 9, igst: 0 });
  const [taxMode, setTaxMode] = useState('intra_state');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadFirms = useCallback(async () => {
    const { data } = await api.get('/firms');
    setFirms(Array.isArray(data) ? data : data?.data ?? []);
  }, []);

  useEffect(() => {
    loadFirms();
  }, [loadFirms]);

  useEffect(() => {
    if (initialInvoice) {
      const state = invoiceToFormState(initialInvoice);
      setSeller(state.seller);
      setFirmId(state.firmId);
      setInvoiceNumber(state.invoiceNumber);
      setMeta(state.meta);
      setCustomer(state.customer);
      setTaxRates(state.taxRates);
      setTaxMode(state.taxMode);
      setItems(state.items.length ? state.items : [emptyItem(1)]);
      setSavedId(initialInvoice.id);
    } else if (!invoiceNumber) {
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
    }
  }, [initialInvoice, invoiceNumber]);

  useEffect(() => {
    const firm = firms.find((f) => String(f.id) === firmId);
    if (!firm) return;
    setCustomer((prev) => ({
      ...prev,
      name: prev.name || firm.name || '',
      gst: prev.gst || firm.gstin || '',
      address1: prev.address1 || firm.address || '',
      pan: prev.pan,
    }));
  }, [firmId, firms]);

  const [newFirm, setNewFirm] = useState({ name: '', gstin: '', phone: '', address: '' });
  const [showFirmForm, setShowFirmForm] = useState(false);

  const submitFirm = async (e) => {
    e.preventDefault();
    if (!newFirm.name.trim()) {
      toast.error('Firm name is required');
      return;
    }
    try {
      const { data } = await api.post('/firms', {
        name: newFirm.name.trim(),
        gstin: newFirm.gstin || null,
        phone: newFirm.phone || null,
        address: newFirm.address || null,
      });
      toast.success(t('firmSaved') || 'Firm saved successfully');
      const created = data?.data ?? data;
      setFirms((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setFirmId(String(created.id));
      setNewFirm({ name: '', gstin: '', phone: '', address: '' });
      setShowFirmForm(false);
    } catch {
      toast.error(t('firmSaveError') || 'Failed to save firm');
    }
  };

  const totals = useMemo(() => {
    const taxableAmount = items.reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const cgstAmount = (taxableAmount * taxRates.cgst) / 100;
    const sgstAmount = (taxableAmount * taxRates.sgst) / 100;
    const igstAmount = (taxableAmount * taxRates.igst) / 100;
    const freight = parseFloat(meta.freight) || 0;
    const cutting = parseFloat(meta.cuttingCharges) || 0;
    const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount + freight + cutting;
    const roundOff = Math.round(grandTotal) - grandTotal;
    const finalTotal = Math.round(grandTotal);
    return { taxableAmount, cgstAmount, sgstAmount, igstAmount, grandTotal, roundOff, finalTotal };
  }, [items, taxRates, meta.freight, meta.cuttingCharges]);

  const addItem = () => {
    const nextId = items.length + 1;
    setItems([...items, emptyItem(nextId)]);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    const renumbered = items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, id: index + 1, sno: String(index + 1) }));
    setItems(renumbered);
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          updated.amount = formatAmount(updated.qty, updated.rate);
        }
        return updated;
      })
    );
  };

  const validateBeforeSave = () => {
    if (!seller.name.trim()) {
      toast.error('Enter your business / firm name');
      return false;
    }
    if (!firmId) {
      toast.error(t('selectFirmError'));
      return false;
    }
    if (!customer.name.trim()) {
      toast.error('Enter customer name');
      return false;
    }
    const payload = buildApiPayload({ firmId, invoiceNumber, meta, seller, customer, items, taxRates, taxMode });
    if (payload.items.length === 0) {
      toast.error(t('lineItemsError'));
      return false;
    }
    return true;
  };

  const saveInvoice = async () => {
    if (!validateBeforeSave()) return;
    const payload = buildApiPayload({ firmId, invoiceNumber, meta, seller, customer, items, taxRates, taxMode });
    saveSellerToStorage(seller);
    setSaving(true);
    try {
      if (onSubmit) {
        const result = await onSubmit(payload);
        if (result?.id) setSavedId(result.id);
      } else {
        const { data } = await api.post('/invoices', payload);
        setSavedId(data.invoice.id);
        toast.success(t('invoiceCreated'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? t('firmSaveError');
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('emailRequired'));
      return;
    }
    if (!savedId) {
      toast.error('Save the invoice first before sending email');
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post(`/invoices/${savedId}/send-email`, { email: email.trim() });
      if (data?.delivered) {
        toast.success(t('emailSent'));
        setEmail('');
      } else {
        toast.warning(data?.hint || data?.message || t('emailFail'));
      }
    } catch (err) {
      toast.error(err?.friendlyMessage || t('emailFail'));
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!savedId) {
      toast.error('Save the invoice first to download PDF');
      return;
    }
    setDownloading(true);
    try {
      await downloadInvoicePdf(savedId, invoiceNumber);
      toast.success(t('pdfDownloaded'));
    } catch {
      toast.error(t('pdfFail'));
    } finally {
      setDownloading(false);
    }
  };

  const amountInWords = rupeesInWords(totals.finalTotal);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4">
      <div className="max-w-[210mm] mx-auto bg-white dark:bg-slate-800">
        <div className="hidden print:block invoice-print-area">
          <InvoicePrintLayout
            seller={seller}
            customer={customer}
            meta={meta}
            items={items}
            taxRates={taxRates}
            totals={totals}
            invoiceNumber={invoiceNumber}
          />
        </div>

        <div className="print:hidden p-6">
          <div className="flex flex-wrap gap-4 mb-6 sticky top-4 z-10 bg-gray-100 dark:bg-slate-900 p-4 rounded-xl shadow-md">
            <button
              type="button"
              onClick={saveInvoice}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-50"
            >
              {saving ? t('saving') : submitLabel || '💾 Save Invoice'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading || !savedId}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
            >
              <Download size={18} />
              {downloading ? t('downloading') : t('downloadPdf')}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg transition"
            >
              <Download size={20} /> Print Invoice
            </button>
          </div>

          <Section title="Your Business (Seller)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Business / Firm Name *" value={seller.name} onChange={(v) => setSeller({ ...seller, name: v })} />
              <Field label="GST No." value={seller.gst} onChange={(v) => setSeller({ ...seller, gst: v })} />
              <Field label="PAN No." value={seller.pan} onChange={(v) => setSeller({ ...seller, pan: v })} />
              <Field label="Phone" value={seller.phone} onChange={(v) => setSeller({ ...seller, phone: v })} />
              <Field label="Email" value={seller.email} onChange={(v) => setSeller({ ...seller, email: v })} />
              <Field label="State" value={seller.state} onChange={(v) => setSeller({ ...seller, state: v })} />
              <Field label="State Code" value={seller.stateCode} onChange={(v) => setSeller({ ...seller, stateCode: v })} />
              <Field label="Address Line 1" value={seller.address1} onChange={(v) => setSeller({ ...seller, address1: v })} />
              <Field label="Address Line 2" value={seller.address2} onChange={(v) => setSeller({ ...seller, address2: v })} />
              <Field label="Address Line 3" value={seller.address3} onChange={(v) => setSeller({ ...seller, address3: v })} />
              <Field label="Bank" value={seller.bank} onChange={(v) => setSeller({ ...seller, bank: v })} />
              <Field label="Branch" value={seller.branch} onChange={(v) => setSeller({ ...seller, branch: v })} />
              <Field label="Account No." value={seller.accountNo} onChange={(v) => setSeller({ ...seller, accountNo: v })} />
              <Field label="IFSC Code" value={seller.ifsc} onChange={(v) => setSeller({ ...seller, ifsc: v })} />
            </div>
          </Section>

          <Section title="Invoice Details">
            {showFirmForm && (
              <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 mb-4 space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('addFirmTitle') || 'Add New Firm'}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    placeholder={t('firmNamePlaceholder') || 'Firm Name *'}
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
                    placeholder={t('phonePlaceholder') || 'Phone'}
                    value={newFirm.phone}
                    onChange={(e) => setNewFirm((s) => ({ ...s, phone: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                  />
                  <input
                    placeholder={t('addressPlaceholder') || 'Address'}
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
                  {t('saveFirm') || 'Save Firm'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">{t('firm')}</label>
                  <button
                    type="button"
                    onClick={() => setShowFirmForm((v) => !v)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {showFirmForm ? (t('hideNewFirm') || 'Cancel') : (t('newFirm') || '+ New Firm')}
                  </button>
                </div>
                <select required value={firmId} onChange={(e) => setFirmId(e.target.value)} className={inputClass}>
                  <option value="">{t('selectFirm')}</option>
                  {firms.map((f) => (
                    <option key={f.id} value={String(f.id)}>{f.name}</option>
                  ))}
                </select>
              </div>
              <Field label={t('invoiceNumber')} value={invoiceNumber} onChange={setInvoiceNumber} />
              <Field label="Date (DD/MM/YYYY)" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} />
              <Field label="Time" value={meta.time} onChange={(v) => setMeta({ ...meta, time: v })} />
              <Field label="Vendor Code" value={meta.vendorCode} onChange={(v) => setMeta({ ...meta, vendorCode: v })} />
              <Field label="Date/Time of Prepare" value={meta.dateTimePrepare} onChange={(v) => setMeta({ ...meta, dateTimePrepare: v })} />
              <Field label="Date/Time of Removal" value={meta.dateTimeRemoval} onChange={(v) => setMeta({ ...meta, dateTimeRemoval: v })} />
              <Field label="PO No." value={meta.poNo} onChange={(v) => setMeta({ ...meta, poNo: v })} />
              <Field label="PO Date" value={meta.poDate} onChange={(v) => setMeta({ ...meta, poDate: v })} />
            </div>
          </Section>

          <Section title="Customer Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Customer Name" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} />
              <Field label="Customer GST No." value={customer.gst} onChange={(v) => setCustomer({ ...customer, gst: v })} />
              <Field label="Address Line 1" value={customer.address1} onChange={(v) => setCustomer({ ...customer, address1: v })} />
              <Field label="Address Line 2" value={customer.address2} onChange={(v) => setCustomer({ ...customer, address2: v })} />
              <Field label="Address Line 3" value={customer.address3} onChange={(v) => setCustomer({ ...customer, address3: v })} />
              <Field label="State" value={customer.state} onChange={(v) => setCustomer({ ...customer, state: v })} />
              <Field label="State Code" value={customer.stateCode} onChange={(v) => setCustomer({ ...customer, stateCode: v })} />
              <Field label="PAN No." value={customer.pan} onChange={(v) => setCustomer({ ...customer, pan: v })} />
            </div>
          </Section>

          <Section
            title="Items"
            action={
              <button type="button" onClick={addItem} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <Plus size={18} /> Add Item
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 dark:border-slate-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-slate-300">
                    {['#', 'Description', 'PL', 'TH', 'HRS', 'SET', 'Total HRS', 'HSN/SAC', 'Qty', 'Rate', 'Amount', 'Action'].map((h) => (
                      <th key={h} className="p-3 text-left font-semibold border-r border-gray-300 dark:border-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-slate-700">
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600">{index + 1}</td>
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600">
                        <textarea value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900" rows={3} />
                      </td>
                      {['pl', 'th', 'hrs', 'set', 'totalHrs'].map((field) => (
                        <td key={field} className="p-3 border-r border-gray-300 dark:border-slate-600">
                          <input type="number" step="0.01" value={item[field]} onChange={(e) => updateItem(item.id, field, e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                        </td>
                      ))}
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600">
                        <input type="text" value={item.hsnSac} onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                      </td>
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600">
                        <input type="number" step="0.01" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-20 border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                      </td>
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600">
                        <input type="number" step="0.001" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value)} className="w-24 border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900" />
                      </td>
                      <td className="p-3 border-r border-gray-300 dark:border-slate-600 font-medium">{item.amount}</td>
                      <td className="p-3">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800" title="Remove item">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Additional Details">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Party Ch. No." value={meta.partyChNo} onChange={(v) => setMeta({ ...meta, partyChNo: v })} />
              <Field label="Party Ch. Date" value={meta.partyChDate} onChange={(v) => setMeta({ ...meta, partyChDate: v })} />
              <Field label="Transport" value={meta.transport} onChange={(v) => setMeta({ ...meta, transport: v })} />
              <Field label="Vehicle No." value={meta.vehicleNo} onChange={(v) => setMeta({ ...meta, vehicleNo: v })} />
              <Field label="Apx Weight" value={meta.apxWeight} onChange={(v) => setMeta({ ...meta, apxWeight: v })} />
              <Field label="E-Way Form No." value={meta.eWayNo} onChange={(v) => setMeta({ ...meta, eWayNo: v })} />
              <Field label="No. of Cartons" value={meta.cartons} onChange={(v) => setMeta({ ...meta, cartons: v })} />
              <Field label="Freight" type="number" value={meta.freight} onChange={(v) => setMeta({ ...meta, freight: v })} />
              <Field label="Cutting/Other Charges" type="number" value={meta.cuttingCharges} onChange={(v) => setMeta({ ...meta, cuttingCharges: v })} />
            </div>
          </Section>

          <Section title="Tax Configuration">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className={labelClass}>{t('taxMode')}</label>
                <select value={taxMode} onChange={(e) => setTaxMode(e.target.value)} className={inputClass}>
                  <option value="intra_state">{t('intraState')}</option>
                  <option value="inter_state">{t('interState')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="CGST %" type="number" value={taxRates.cgst} onChange={(v) => setTaxRates({ ...taxRates, cgst: parseFloat(v) || 0 })} />
              <Field label="SGST %" type="number" value={taxRates.sgst} onChange={(v) => setTaxRates({ ...taxRates, sgst: parseFloat(v) || 0 })} />
              <Field label="IGST %" type="number" value={taxRates.igst} onChange={(v) => setTaxRates({ ...taxRates, igst: parseFloat(v) || 0 })} />
            </div>
          </Section>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-300 dark:border-blue-700">Invoice Summary</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Taxable Amount" value={`₹${totals.taxableAmount.toFixed(2)}`} />
              <SummaryRow label={`CGST (${taxRates.cgst}%)`} value={`₹${totals.cgstAmount.toFixed(2)}`} />
              <SummaryRow label={`SGST (${taxRates.sgst}%)`} value={`₹${totals.sgstAmount.toFixed(2)}`} />
              <SummaryRow label={`IGST (${taxRates.igst}%)`} value={`₹${totals.igstAmount.toFixed(2)}`} />
              <SummaryRow label="Freight" value={`₹${meta.freight}`} />
              <SummaryRow label="Cutting/Other Charges" value={`₹${meta.cuttingCharges}`} />
              <SummaryRow label="Round Off" value={`₹${totals.roundOff.toFixed(2)}`} />
              <div className="flex justify-between text-lg font-bold border-t-2 border-blue-300 dark:border-blue-700 pt-3">
                <span>Grand Total</span>
                <span>₹{totals.finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400 mt-2 p-2 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
                <span className="font-medium">In Words: </span> {amountInWords}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center gap-2">
              <Mail size={20} /> {t('sendPdf')}
            </h2>
            {!savedId && !isEdit && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">Save the invoice first to enable email delivery with PDF attachment.</p>
            )}
            <form onSubmit={sendEmail} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <button
                type="submit"
                disabled={sending || !savedId}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {sending ? t('sending') : t('send')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-area,
          .invoice-print-area * {
            visibility: visible;
          }
          .invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            background: white;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input type={type} step={type === 'number' ? '0.01' : undefined} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-700 dark:text-slate-300">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
