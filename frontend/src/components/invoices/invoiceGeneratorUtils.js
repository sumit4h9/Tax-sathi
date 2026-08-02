const SELLER_STORAGE_KEY = 'taxsathi_invoice_seller';

export const defaultSeller = {
  name: '',
  gst: '',
  pan: '',
  address1: '',
  address2: '',
  address3: '',
  state: '',
  stateCode: '',
  phone: '',
  email: '',
  bank: '',
  branch: '',
  accountNo: '',
  ifsc: '',
};

export function loadSellerFromStorage() {
  if (typeof window === 'undefined') return defaultSeller;
  try {
    const raw = localStorage.getItem(SELLER_STORAGE_KEY);
    if (!raw) return defaultSeller;
    return { ...defaultSeller, ...JSON.parse(raw) };
  } catch {
    return defaultSeller;
  }
}

export function saveSellerToStorage(seller) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SELLER_STORAGE_KEY, JSON.stringify(seller));
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

export function toIsoDate(displayDate) {
  if (!displayDate) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate;
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return displayDate;
}

export function formatAmount(qty, rate) {
  const calcAmount = (parseFloat(qty || 0) * parseFloat(rate || 0)).toFixed(2);
  return parseFloat(calcAmount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseAmount(str) {
  return parseFloat(String(str || '0').replace(/,/g, '')) || 0;
}

export function emptyItem(id) {
  return {
    id,
    sno: String(id),
    description: '',
    pl: '0.00',
    th: '0.00',
    hrs: '0.00',
    set: '0.00',
    totalHrs: '0.00',
    hsnSac: '-',
    qty: '1.00',
    rate: '0.000',
    amount: '0.00',
  };
}

export function invoiceToFormState(invoice) {
  const meta = invoice.meta ?? {};
  const customer = invoice.customer ?? {};
  const seller = invoice.seller ?? loadSellerFromStorage();

  return {
    seller: {
      name: seller.name ?? '',
      gst: seller.gst ?? '',
      pan: seller.pan ?? '',
      address1: seller.address1 ?? '',
      address2: seller.address2 ?? '',
      address3: seller.address3 ?? '',
      state: seller.state ?? '',
      stateCode: seller.state_code ?? seller.stateCode ?? '',
      phone: seller.phone ?? '',
      email: seller.email ?? '',
      bank: seller.bank ?? '',
      branch: seller.branch ?? '',
      accountNo: seller.account_no ?? seller.accountNo ?? '',
      ifsc: seller.ifsc ?? '',
    },
    firmId: String(invoice.firm_id ?? ''),
    invoiceNumber: invoice.invoice_number ?? '',
    meta: {
      date: meta.display_date ?? formatDisplayDate(invoice.date),
      time: meta.time ?? '',
      vendorCode: meta.vendor_code ?? '',
      dateTimePrepare: meta.date_time_prepare ?? '',
      dateTimeRemoval: meta.date_time_removal ?? '',
      partyChNo: meta.party_ch_no ?? '',
      partyChDate: meta.party_ch_date ?? '',
      poNo: meta.po_no ?? '',
      poDate: meta.po_date ?? '',
      transport: meta.transport ?? '',
      vehicleNo: meta.vehicle_no ?? '',
      apxWeight: meta.apx_weight ?? '0.00',
      eWayNo: meta.e_way_no ?? '',
      cartons: meta.cartons ?? '',
      freight: String(invoice.freight ?? meta.freight ?? '0.00'),
      cuttingCharges: String(invoice.cutting_charges ?? meta.cutting_charges ?? '0.00'),
    },
    customer: {
      name: customer.name ?? invoice.firm?.name ?? '',
      address1: customer.address1 ?? '',
      address2: customer.address2 ?? '',
      address3: customer.address3 ?? '',
      state: customer.state ?? '',
      stateCode: customer.state_code ?? '',
      gst: customer.gst ?? invoice.firm?.gstin ?? '',
      pan: customer.pan ?? '',
    },
    taxRates: {
      cgst: invoice.cgst_percent ?? 9,
      sgst: invoice.sgst_percent ?? 9,
      igst: invoice.igst_percent ?? 0,
    },
    taxMode: invoice.tax_mode ?? 'intra_state',
    items: (invoice.items ?? []).map((row, i) => ({
      id: row.id ?? i + 1,
      sno: String(row.sno ?? i + 1),
      description: row.description ?? '',
      pl: String(row.pl ?? '0.00'),
      th: String(row.th ?? '0.00'),
      hrs: String(row.hrs ?? '0.00'),
      set: String(row.set ?? '0.00'),
      totalHrs: String(row.total_hrs ?? '0.00'),
      hsnSac: row.hsn_sac ?? '-',
      qty: String(row.quantity ?? '1.00'),
      rate: String(row.rate ?? '0.000'),
      amount: parseFloat(row.amount ?? 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    })),
  };
}

export function buildApiPayload({ firmId, invoiceNumber, meta, seller, customer, items, taxRates, taxMode }) {
  const apiItems = items
    .filter((item) => item.description.trim())
    .map((item, index) => ({
      sno: parseInt(item.sno, 10) || index + 1,
      description: item.description.trim(),
      quantity: parseFloat(item.qty || 0),
      rate: parseFloat(item.rate || 0),
      pl: parseFloat(item.pl || 0),
      th: parseFloat(item.th || 0),
      hrs: parseFloat(item.hrs || 0),
      set: parseFloat(item.set || 0),
      total_hrs: parseFloat(item.totalHrs || 0),
      hsn_sac: item.hsnSac || '-',
    }));

  const payload = {
    firm_id: firmId,
    invoice_number: invoiceNumber.trim(),
    date: toIsoDate(meta.date),
    tax_mode: taxMode,
    direction: 'outbound',
    freight: parseFloat(meta.freight || 0),
    cutting_charges: parseFloat(meta.cuttingCharges || 0),
    seller: {
      name: seller.name,
      gst: seller.gst,
      pan: seller.pan,
      address1: seller.address1,
      address2: seller.address2,
      address3: seller.address3,
      state: seller.state,
      state_code: seller.stateCode,
      phone: seller.phone,
      email: seller.email,
      bank: seller.bank,
      branch: seller.branch,
      account_no: seller.accountNo,
      ifsc: seller.ifsc,
    },
    customer: {
      name: customer.name,
      gst: customer.gst,
      pan: customer.pan,
      address1: customer.address1,
      address2: customer.address2,
      address3: customer.address3,
      state: customer.state,
      state_code: customer.stateCode,
    },
    meta: {
      display_date: meta.date,
      time: meta.time,
      vendor_code: meta.vendorCode,
      date_time_prepare: meta.dateTimePrepare,
      date_time_removal: meta.dateTimeRemoval,
      party_ch_no: meta.partyChNo,
      party_ch_date: meta.partyChDate,
      po_no: meta.poNo,
      po_date: meta.poDate,
      transport: meta.transport,
      vehicle_no: meta.vehicleNo,
      apx_weight: meta.apxWeight,
      e_way_no: meta.eWayNo,
      cartons: meta.cartons,
    },
    items: apiItems,
  };

  if (taxMode === 'inter_state') {
    payload.igst_percent = taxRates.igst;
  } else {
    payload.cgst_percent = taxRates.cgst;
    payload.sgst_percent = taxRates.sgst;
  }

  return payload;
}
