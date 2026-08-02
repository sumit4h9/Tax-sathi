/**
 * Normalize API bodies that may use { success, data, message } or legacy flat shapes.
 */
export function unwrapApiData(body) {
  if (body && typeof body.success === 'boolean') {
    if (!body.success) {
      throw new Error(body.message || 'Request failed');
    }
    return body.data ?? body;
  }
  return body;
}
