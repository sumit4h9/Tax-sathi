'use client';

import { rupeesInWords } from '@/lib/numberToWords';

function fmt(n, decimals = 2) {
  return Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function InvoicePrintLayout({ seller, customer, meta, items, taxRates, totals, invoiceNumber }) {
  const amountInWords = rupeesInWords(totals.finalTotal);
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.qty || 0), 0);

  return (
    <div style={{ padding: '10mm', fontFamily: 'Arial, sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', marginBottom: 0 }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px 10px', width: '30%', fontSize: '9px', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold' }}>GST No. : {seller.gst}</div>
              <div style={{ fontWeight: 'bold' }}>PAN No : {seller.pan}</div>
            </td>
            <td style={{ border: '1px solid black', padding: '4px 10px', width: '40%', textAlign: 'center', verticalAlign: 'middle' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '2px' }}>TAX INVOICE</div>
              <div style={{ fontSize: '9px', marginBottom: '2px' }}>(Invoice Under GST Rule-7,Section-31)</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Original for Recipient</div>
            </td>
            <td style={{ border: '1px solid black', padding: '8px 10px', width: '30%', fontSize: '9px', textAlign: 'right', verticalAlign: 'top' }}>
              <div style={{ fontWeight: 'bold' }}>State : {seller.state}</div>
              <div style={{ fontWeight: 'bold' }}>State Code : {seller.stateCode}</div>
            </td>
          </tr>

          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '2px' }}>{seller.name}</div>
              {seller.address1 && <div style={{ fontSize: '9px' }}>{seller.address1}</div>}
              {seller.address2 && <div style={{ fontSize: '9px' }}>{seller.address2}</div>}
              {seller.address3 && <div style={{ fontSize: '9px', marginBottom: '2px' }}>{seller.address3}</div>}
              {(seller.phone || seller.email) && (
                <div style={{ fontSize: '9px' }}>
                  {seller.phone && <>Ph. No. : {seller.phone} </>}
                  {seller.email && <>Email : {seller.email}</>}
                </div>
              )}
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ border: '1px solid black', padding: '8px 10px', width: '55%', verticalAlign: 'top', fontSize: '9px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>CUSTOMER&apos;S NAME &amp; ADDRESS</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{customer.name}</div>
              {customer.address1 && <div>{customer.address1}</div>}
              {customer.address2 && <div>{customer.address2}</div>}
              {customer.address3 && <div style={{ marginBottom: '4px' }}>{customer.address3}</div>}
              <div><span style={{ fontWeight: 'bold' }}>GST No.</span> : {customer.gst}</div>
              <div><span style={{ fontWeight: 'bold' }}>PAN No.</span> : {customer.pan}</div>
              <div>
                <span style={{ fontWeight: 'bold' }}>State</span> : {customer.state}{' '}
                <span style={{ fontWeight: 'bold' }}>State Code :</span> {customer.stateCode}
              </div>
            </td>
            <td style={{ border: '1px solid black', padding: '8px 10px', width: '45%', verticalAlign: 'top', fontSize: '9px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr><td style={{ paddingBottom: '3px' }}><b>INVOICE NO.:</b></td><td style={{ paddingBottom: '3px' }}>{invoiceNumber}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Date :</b></td><td style={{ paddingBottom: '3px' }}>{meta.date}</td><td style={{ textAlign: 'right', paddingBottom: '3px' }}>{meta.time}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Vendor Code :</b></td><td colSpan={2} style={{ paddingBottom: '3px' }}>{meta.vendorCode}</td></tr>
                  <tr><td colSpan={3} style={{ paddingBottom: '3px' }}><b>Date / Time of Prepare :</b> {meta.dateTimePrepare}</td></tr>
                  <tr><td colSpan={3} style={{ paddingBottom: '3px' }}><b>Date /Time of Removal :</b> {meta.dateTimeRemoval}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Party Ch. No. :</b></td><td style={{ paddingBottom: '3px' }}>{meta.partyChNo}</td><td style={{ textAlign: 'right', paddingBottom: '3px' }}>{meta.partyChDate}</td></tr>
                  <tr><td colSpan={2} style={{ paddingBottom: '3px' }}><b>PO No. &amp; Date :</b> {meta.poNo}</td><td style={{ textAlign: 'right', paddingBottom: '3px' }}>{meta.poDate}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Transport :</b></td><td colSpan={2} style={{ paddingBottom: '3px' }}>{meta.transport}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Vehicle No. :</b></td><td colSpan={2} style={{ paddingBottom: '3px' }}>{meta.vehicleNo}</td></tr>
                  <tr><td style={{ paddingBottom: '3px' }}><b>Apx Weight :</b></td><td colSpan={2} style={{ paddingBottom: '3px' }}>{meta.apxWeight}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center' }}>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '4%' }}>S.NO.</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '20%' }}>DESCRIPTION OF GOODS</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '7%' }}>PL</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '7%' }}>TH</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '7%' }}>HRS</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '6%' }}>SET</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '8%' }}>Total HRS</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '9%' }}>HSN / SAC</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '6%' }}>QTY</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '10%' }}>RATE</th>
                    <th style={{ border: '1px solid black', padding: '4px 2px', width: '12%' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ fontSize: '8px' }}>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'center' }}>{item.sno}</td>
                      <td style={{ border: '1px solid black', padding: '4px 4px', fontSize: '7px', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{item.description}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.pl}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.th}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.hrs}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.set}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.totalHrs}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'center' }}>{item.hsnSac}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.rate}</td>
                      <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{item.amount}</td>
                    </tr>
                  ))}
                  <tr style={{ fontSize: '9px', fontWeight: 'bold' }}>
                    <td colSpan={2} style={{ border: '1px solid black', padding: '4px 4px' }}>JOB WORK ONLY</td>
                    <td colSpan={6} style={{ border: '1px solid black', padding: '4px 2px' }} />
                    <td colSpan={2} style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>TOTAL : {totalQty.toFixed(2)}</td>
                    <td style={{ border: '1px solid black', padding: '4px 2px', textAlign: 'right' }}>{fmt(totals.taxableAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={2} style={{ border: '1px solid black', padding: '8px 10px', width: '55%', verticalAlign: 'top', fontSize: '9px' }}>
              <div style={{ marginBottom: '4px' }}><b>E-Way Form No. :</b> {meta.eWayNo}</div>
              <div style={{ marginBottom: '8px' }}><b>No. of Cartons :</b> {meta.cartons}</div>
              <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>Total Invoice Value (in words) Rs.</div>
              <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '10px' }}>{amountInWords}</div>
              {seller.bank && <div style={{ marginBottom: '1px' }}><b>Bank :</b> {seller.bank}</div>}
              {seller.branch && <div style={{ marginBottom: '1px' }}><b>Branch :</b> {seller.branch}</div>}
              {seller.accountNo && <div style={{ marginBottom: '1px' }}><b>A/c No :</b> {seller.accountNo}</div>}
              {seller.ifsc && <div><b>IFSC Code :</b> {seller.ifsc}</div>}
            </td>
            <td style={{ border: '1px solid black', padding: '8px 10px', width: '45%', verticalAlign: 'top', fontSize: '9px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr><td style={{ paddingBottom: '2px' }}>Freight</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{meta.freight}</td></tr>
                  <tr><td style={{ paddingBottom: '2px' }}>Cutting / Other Charges</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{meta.cuttingCharges}</td></tr>
                  <tr><td style={{ paddingBottom: '2px' }}>Taxable Amount</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{totals.taxableAmount.toFixed(2)}</td></tr>
                  <tr><td style={{ paddingBottom: '2px' }}>CGST @ {taxRates.cgst}%</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{totals.cgstAmount.toFixed(2)}</td></tr>
                  <tr><td style={{ paddingBottom: '2px' }}>SGST @ {taxRates.sgst}%</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{totals.sgstAmount.toFixed(2)}</td></tr>
                  <tr><td style={{ paddingBottom: '2px' }}>IGST @ {taxRates.igst}%</td><td style={{ textAlign: 'right', paddingBottom: '2px' }}>{totals.igstAmount.toFixed(2)}</td></tr>
                  <tr><td style={{ paddingBottom: '4px' }}>Round off</td><td style={{ textAlign: 'right', paddingBottom: '4px' }}>{totals.roundOff.toFixed(2)}</td></tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid black' }}>
                    <td style={{ paddingTop: '4px' }}>Grand Total (Rs.)</td>
                    <td style={{ textAlign: 'right', paddingTop: '4px' }}>{fmt(totals.finalTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={3} style={{ border: '1px solid black', padding: '8px 10px', fontSize: '7.5px' }}>
              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>TERMS &amp; CONDITIONS :</div>
                <div>1. Interest @18% P.A. will be charged extra on all the bills outstanding if payment made after due date.</div>
                <div>2. Our Responsibility ceases as the goods leave our premises</div>
                <div>3. All Disputes subject to FARIDABAD Jurisdiction only</div>
              </div>
              <div style={{ marginBottom: '6px' }}><b>Tax Payable on Reverse Charges :</b> N. A.</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '60%' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>DECLARATION :</div>
                  <div>Certified that Particulrars given above are true &amp; correct under GST Act 2017 and amount indicated represent the price actualy charged and that there is no flow of additional consideration directly or indirectly from buyer.</div>
                </div>
                <div style={{ width: '35%', textAlign: 'right', fontSize: '9px' }}>
                  <div style={{ marginBottom: '30px' }}>Authorised Signatory</div>
                  <div style={{ fontWeight: 'bold' }}>For {seller.name}</div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
