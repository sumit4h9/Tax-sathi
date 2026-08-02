'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { computeGst, lineSubtotal } from '@/lib/gstCalculator';

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function InvoiceTotalsPreview({ lines, taxMode, cgstPct, sgstPct, igstPct }) {
  const t = useTranslations('Invoices');

  const totals = useMemo(() => {
    const subtotal = lineSubtotal(lines);
    return computeGst(subtotal, taxMode, {
      cgst_percent: Number(cgstPct),
      sgst_percent: Number(sgstPct),
      igst_percent: Number(igstPct),
    });
  }, [lines, taxMode, cgstPct, sgstPct, igstPct]);

  return (
    <div
      className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-1 text-right text-sm"
    >
      <p>
        {t('subtotal')}: <span className="font-medium">{money.format(totals.subtotal)}</span>
      </p>
      {taxMode === 'intra_state' ? (
        <>
          <p>
            {t('cgstLine', { pct: cgstPct })}:{' '}
            <span className="font-medium">{money.format(totals.cgst)}</span>
          </p>
          <p>
            {t('sgstLine', { pct: sgstPct })}:{' '}
            <span className="font-medium">{money.format(totals.sgst)}</span>
          </p>
        </>
      ) : (
        <p>
          {t('igstLine', { pct: igstPct })}:{' '}
          <span className="font-medium">{money.format(totals.igst)}</span>
        </p>
      )}
      <p className="text-lg font-bold text-slate-900 dark:text-white pt-2">
        {t('total')}: {money.format(totals.total_amount)}
      </p>
    </div>
  );
}
