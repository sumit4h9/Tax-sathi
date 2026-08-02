# Web routes (`routes/web.php`)

This document describes the **HTTP web layer** (non-`/api/*`) added for operations, health checks, PDF/mail previews, and guarded admin utilities. **Next.js API usage is unchanged** (`routes/api.php`).

## 1. `web.php` structure (groups)

| Group | Middleware | Purpose |
|-------|--------------|---------|
| Public | `web` (default), inline `throttle` | `/`, `/login`, `/health/*`, `/storage-link-check` |
| Authenticated | `auth:sanctum` + `role:*` + throttles | PDF preview, mail previews, queue status, system Blade, admin POST utilities |
| Fallback | `web` | Unknown paths → JSON `404` |

All routes use **named routes** (see `php artisan route:list`).

## 2. Route list summary

| Method | URI | Name | Auth |
|--------|-----|------|------|
| GET | `/` | `home` | Public |
| GET | `/login` | `login` | Public (401 helper for guests) |
| GET | `/health` | `health.index` | Public |
| GET | `/health/db` | `health.db` | Public |
| GET | `/health/queue` | `health.queue` | Public |
| GET | `/health/storage` | `health.storage` | Public |
| GET | `/storage-link-check` | `storage-link-check` | Public |
| GET | `/queue/status` | `queue.status` | Sanctum + admin |
| GET | `/system/status` | `system.status` | Sanctum + admin |
| GET | `/preview/invoice/{invoice}` | `preview.invoice` | Sanctum + admin **or** staff |
| GET | `/preview/mail/invoice/{invoice}` | `preview.mail.invoice` | Sanctum + admin + mail preview gate |
| GET | `/preview/mail/contact` | `preview.mail.contact` | Sanctum + admin + mail preview gate |
| POST | `/admin/utilities/*` | `admin.utilities.*` | Sanctum + admin + production gate |
| * | *(unmatched)* | `web.fallback` | Public → JSON 404 |

Framework routes (`/up`, `sanctum/csrf-cookie`, `storage/{path}`) remain as shipped.

## 3. Middleware map

| Alias | Class | Role |
|-------|--------|------|
| `auth:sanctum` | Laravel Sanctum | Bearer token (or SPA session if configured) |
| `role:…` | `EnsureRole` | Admin-only or `admin,staff` lists |
| `admin.web` | `EnsureAdminWebUtilitiesEnabled` | **404 in production** unless `ALLOW_ADMIN_WEB_UTILITIES=true` |
| `mail.preview` | `EnsureMailWebPreviewsEnabled` | **404** unless `app()->isLocal()` **or** `ALLOW_MAIL_WEB_PREVIEWS=true` |
| `throttle:*` | Laravel | Per-route rate limits |

**CSRF:** `bootstrap/app.php` calls `validateCsrfTokens(except: ['admin/utilities/*'])` so **POST** admin utilities work with **Bearer** tokens from tools like Postman without a session CSRF cookie.

**Guests:** `redirectGuestsTo(route('login'))` — JSON clients get `401` JSON from `LoginController` when `Accept: application/json`.

## 4. Security protections

- No `APP_KEY`, passwords, or mail secrets in JSON payloads (`SystemStatusService` only exposes safe summaries).
- Mail previews: **local by default**; extra flag off by default.
- Admin Artisan web triggers: **404 in production** unless `ALLOW_ADMIN_WEB_UTILITIES=true` (off by default). Still require **admin** + **Sanctum**.
- Throttling on health, previews, admin utilities, and queue status.
- `route:cache` supported: **no route closures** (login + fallback use controllers).

## 5. Production vs local behavior

| Feature | Local | Production |
|---------|-------|------------|
| `/health*` | Full JSON checks | Same (no secrets) |
| `/preview/mail/*` | Allowed with admin + local (or `ALLOW_MAIL_WEB_PREVIEWS`) | **404** unless explicitly allowed |
| `/admin/utilities/*` | Allowed if admin + `ALLOW_ADMIN_WEB_UTILITIES` **or** not production | **404** unless `ALLOW_ADMIN_WEB_UTILITIES=true` |
| `/preview/invoice/{id}` | PDF stream with Sanctum + staff/admin | Same (protect invoice data) |

## 6. Frontend implications

- **No change** to existing `/api/*` contracts.
- Optional: open PDF preview with `fetch(url, { headers: { Authorization: `Bearer ${token}` }})` then blob URL (browser navigation alone cannot send Bearer).
- Admin utilities are **POST**; call from internal tools with `Authorization: Bearer` + `Accept: application/json`.

## 7. Suggested next improvements

- Laravel **Telescope** (composer `require-dev`) for local request/query inspection.
- **Horizon** if you move queues to Redis and want a dashboard.
- **Signed URLs** for time-limited PDF download links without exposing long-lived tokens in query strings.
- **Policies** on `Invoice` for preview routes (currently any authenticated staff can open any invoice PDF).

## Controllers (MVC)

| Controller | Responsibility |
|------------|----------------|
| `Web\SystemController` | `/` overview, `/system/status` Blade/JSON |
| `Web\HealthController` | `/health/*`, `/storage-link-check` |
| `Web\QueueMonitorController` | `/queue/status` (admin) |
| `Web\PreviewController` | PDF stream + mail HTML previews |
| `Web\AdminUtilityController` | POST Artisan utilities |
| `Web\LoginController` | Guest auth helper |
| `Web\FallbackController` | JSON 404 |

Supporting service: `App\Services\SystemStatusService`.

Run `php artisan route:list` after changes. Use `php artisan route:cache` in production **after** deploy (closures removed).
