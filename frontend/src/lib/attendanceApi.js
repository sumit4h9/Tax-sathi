import api from '@/lib/axios';

function unwrap(responseBody) {
  if (responseBody && typeof responseBody.success === 'boolean') {
    if (!responseBody.success) {
      throw new Error(responseBody.message || 'Request failed');
    }
    return responseBody.data;
  }
  return responseBody;
}

function formatApiError(error) {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  return data?.message || error?.message || 'Request failed';
}

export async function fetchAttendanceByDate(date) {
  const { data } = await api.get('/attendance', { params: { date } });
  return unwrap(data);
}

export async function bulkMarkAttendance(date, records) {
  try {
    const { data } = await api.post('/attendance', { date, records });
    return unwrap(data);
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}

export async function fetchAttendanceHistory(employeeId) {
  const { data } = await api.get(`/attendance/history/${employeeId}`);
  return unwrap(data);
}

/** Normalize /team or /employees list responses. */
export function normalizeUserList(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}
