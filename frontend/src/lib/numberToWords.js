const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

export function numberToWords(num) {
  if (num === 0) return 'Zero';
  let words = '';
  if (num >= 10000000) {
    words += `${numberToWords(Math.floor(num / 10000000))} Crore `;
    num %= 10000000;
  }
  if (num >= 100000) {
    words += `${numberToWords(Math.floor(num / 100000))} Lakh `;
    num %= 100000;
  }
  if (num >= 1000) {
    words += `${numberToWords(Math.floor(num / 1000))} Thousand `;
    num %= 1000;
  }
  if (num >= 100) {
    words += `${ONES[Math.floor(num / 100)]} Hundred `;
    num %= 100;
  }
  if (num >= 20) {
    words += `${TENS[Math.floor(num / 10)]} `;
    num %= 10;
  }
  if (num >= 10) {
    words += `${TEENS[num - 10]} `;
    return words.trim();
  }
  if (num > 0) {
    words += `${ONES[num]} `;
  }
  return words.trim();
}

export function rupeesInWords(amount) {
  return `${numberToWords(Math.round(amount))} Only`;
}
