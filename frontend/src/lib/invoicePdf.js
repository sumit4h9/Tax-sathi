import api from '@/lib/axios';

/** Download invoice PDF via authenticated API. */
export async function downloadInvoicePdf(invoiceId, filename = 'invoice.pdf') {
  // First, get the response without forcing blob to see if it's a JSON S3 URL
  const response = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob' // We request blob, but check if it's actually JSON
  });
  
  const isJson = response.data.type === 'application/json';
  
  if (isJson) {
    const text = await response.data.text();
    const json = JSON.parse(text);
    if (json.download_url) {
      window.open(json.download_url, '_blank');
      return;
    }
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
