/** Routes that require admin role (pathname without locale prefix). */
export const ADMIN_ONLY_ROUTES = [
  '/employees',
  '/invoices/create',
  '/reports',
];

export function isAdminOnlyPath(pathname) {
  const path = pathname.replace(/^\/(en|hi)/, '') || pathname;
  if (ADMIN_ONLY_ROUTES.some((r) => path === r || path.startsWith(`${r}/`))) {
    return true;
  }
  if (path.match(/^\/invoices\/\d+\/edit$/)) {
    return true;
  }
  return false;
}
