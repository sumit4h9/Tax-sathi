/**
 * Mirrors backend App\Services\GstCalculator for live invoice previews.
 * @param {number} subtotal
 * @param {'intra_state'|'inter_state'} taxMode
 * @param {{ cgst_percent?: number, sgst_percent?: number, igst_percent?: number }} rates
 */
export function computeGst(subtotal, taxMode, rates = {}) {
  const base = Number(subtotal) || 0;
  const cgstPct = Number(rates.cgst_percent ?? 9);
  const sgstPct = Number(rates.sgst_percent ?? 9);
  const igstPct = Number(rates.igst_percent ?? 18);

  if (taxMode === 'inter_state') {
    const igst = Math.round(base * (igstPct / 100) * 100) / 100;
    return {
      subtotal: base,
      cgst: 0,
      sgst: 0,
      igst,
      total_amount: Math.round((base + igst) * 100) / 100,
    };
  }

  const cgst = Math.round(base * (cgstPct / 100) * 100) / 100;
  const sgst = Math.round(base * (sgstPct / 100) * 100) / 100;

  return {
    subtotal: base,
    cgst,
    sgst,
    igst: 0,
    total_amount: Math.round((base + cgst + sgst) * 100) / 100,
  };
}

/** @param {{ quantity: number, rate: number }[]} lines */
export function lineSubtotal(lines) {
  return lines.reduce((sum, row) => {
    const qty = Number(row.quantity) || 0;
    const rate = Number(row.rate) || 0;
    return sum + qty * rate;
  }, 0);
}
