/**
 * Promise-based confirm dialog (uses native confirm for simplicity).
 */
export function confirmAction(message) {
  if (typeof window === 'undefined') return false;
  return window.confirm(message);
}
