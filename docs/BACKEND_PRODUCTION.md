# Laravel backend — production notes

## Folder structure (API-focused)

| Path | Role |
|------|------|
| `app/Http/Controllers/API/` | REST controllers (thin; delegate to services / FormRequests) |
| `app/Http/Requests/` | Input validation (`Store*`, `Update*`, `GoogleLogin`, `SendInvoiceEmail`, …) |
| `app/Http/Resources/` | Stable JSON shapes for invoices, users, firms, attendance |
| `app/Http/Middleware/` | `EnsureRole` for admin-only routes |
| `app/Services/` | `GstCalculator`, `InvoiceService` (transactions + line items + tax) |
| `app/Mail/` | Queue-backed mailables (`InvoiceGeneratedMail`, `ContactSubmittedMail`) |
| `app/Models/` | Eloquent models, casts, relations, dashboard cache invalidation hooks |
| `routes/api.php` | Versionless REST surface consumed by Next.js |
| `routes/web.php` | Ops, health, previews, admin utilities (see [WEB_ROUTES.md](WEB_ROUTES.md)) |
| `app/Http/Controllers/Web/` | Web layer controllers (`System`, `Health`, `Preview`, …) |
| `database/migrations/` | Schema, FKs, indexes |

**Employee domain:** Team members are `users` rows (`role` = `admin` | `staff`). A separate `employees` table was **not** introduced to avoid breaking `attendances.user_id`, `/team`, and `/employees` contracts.

## API list (summary)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/google` | No | Throttle `auth-google`; body `{ token }` (Google ID JWT) |
| POST | `/api/contact` | No | Throttle `contact-form` |
| GET | `/api/user` | Sanctum | Current user (`UserResource`) |
| POST | `/api/auth/logout` | Sanctum | Revokes current token |
| GET | `/api/team` | Sanctum | All users (compact fields) |
| GET/POST | `/api/firms` | Sanctum | List / create |
| CRUD | `/api/employees` | Sanctum + admin | Paginated list |
| CRUD | `/api/invoices` | Sanctum | Filters: `firm_id`, `month`+`year`, `direction`; paginated index |
| POST | `/api/invoices/{id}/send-email` | Sanctum | Queued mailable; PDF built inside job |
| CRUD | `/api/attendances` | Sanctum | `user_id` filter; store uses `updateOrCreate` (one row per user per day) |
| GET | `/api/reports/dashboard` | Sanctum | Cached ~45s; invalidated on invoice/attendance/user writes |
| GET | `/api/reports/attendance` | Sanctum | Monthly summary + `records` |
| GET | `/api/reports/attendance/yearly` | Sanctum | Buckets by month |
| GET | `/api/reports/invoices` | Sanctum | Totals + inbound/outbound + `records` |

## Frontend integration

- **JsonResource::withoutWrapping()** keeps single-resource responses flat (`GET /invoices/{id}`, `GET /firms` as array, `GET /team` as array) while **paginated** responses keep Laravel’s `data`, `links`, `meta`.
- **Queues:** Set `QUEUE_CONNECTION=database` (or `redis`) and run `php artisan queue:work --queue=mail` in production so invoice/contact emails send. Use `sync` locally for immediate delivery.
- **Google:** `GOOGLE_CLIENT_ID` must match the SPA’s `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (see `config/services.php`).

## Security

- Per-route throttling: `auth-google`, `contact-form`, authenticated `api` bucket.
- Sanctum bearer tokens; admin-only `employees` via `role:admin`.
- Google token max length validated; misconfiguration returns 503 without exposing internals.
- Production error messages for invoice mutations are generic unless `APP_DEBUG=true`.

## Performance

- Composite / single-column indexes on `invoices(firm_id, date)`, `invoices(date)`, `attendances(date)`.
- Eager loading + constrained user columns on attendance lists/reports.
- Short-lived dashboard aggregate cache with automatic invalidation.

## Deployment (minimal)

1. PHP 8.2+, Composer, MySQL, Redis (optional for cache/queue).
2. `cp .env.example .env` — set `APP_URL`, `DB_*`, `GOOGLE_CLIENT_ID`, `MAIL_*`, `QUEUE_CONNECTION`.
3. `php artisan key:generate`, `php artisan migrate --force`, `php artisan config:cache`, `php artisan route:cache`.
4. Run queue worker(s) for the `mail` queue; scheduler optional.
5. Point Next.js `NEXT_PUBLIC_API_URL` at this app’s `/api` prefix.

## Production readiness checklist

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] Strong `APP_KEY`; HTTPS termination
- [ ] MySQL backups; run migrations
- [ ] Mail DNS (SPF/DKIM) for `MAIL_FROM_ADDRESS`
- [ ] Queue workers supervised (Supervisor/systemd)
- [ ] Log aggregation / monitoring (e.g. `LOG_CHANNEL=stack` → external sink)
- [ ] Rate limits tuned for your traffic
- [ ] CORS / Sanctum domain allowlist if moving beyond bearer tokens

See also: `docs/BACKEND_AUDIT_AND_ROADMAP.md`, `docs/GOOGLE_OAUTH_SETUP.md`, `docs/EMAIL_CONFIGURATION.md`, `docs/openapi.yaml`, `docs/GST_Invoice_API.postman_collection.json`.
