# Laravel backend audit & roadmap (GST Invoice & Employee Management)

## Audit summary (pre-change)

### What already existed

- REST routes under `routes/api.php` with Sanctum and `role:admin` for employees.
- Models: `User`, `Firm`, `Invoice`, `InvoiceItem`, `Attendance`, `ContactMessage` with basic relationships; migrations with FKs and `attendances(user_id, date)` unique (duplicate day prevention via `updateOrCreate` on store).
- GST math in `App\Services\GstCalculator`; invoice CRUD with transactions; DomPDF + `InvoiceGeneratedMail`.
- Form requests for invoices and employees; `EnsureRole` middleware.
- Reports: dashboard, attendance (monthly + yearly buckets), invoice summary with inbound/outbound splits.

### Gaps identified

- No API `JsonResource` layer; inconsistent serialization and harder evolution.
- Invoice create/update logic duplicated in `InvoiceController` (should live in a service).
- `AuthController` used `env()` directly; no dedicated login FormRequest; no auth rate limit.
- `AttendanceController` used inline validation; index used `has('user_id')` (empty string mis-filters); update could violate unique `(user_id, date)` without clear validation.
- No global API rate limits; no explicit JSON exception strategy for `/api/*`.
- `InvoiceGeneratedMail` / `ContactSubmittedMail` were synchronous; PDF built in controller (not ideal for queues).
- `ReportController::dashboard` uncached; `attendance` report loaded all rows into memory.
- Missing DB indexes for common filters (`invoices.date`, `firm_id` + `date`, `attendances.date`).
- No `User::attendances()` relationship; `Employee` as separate table would break existing `user_id` + `/employees` + `/team` contracts — **employees remain `User` records** (documented).

### Design choices (backward compatibility)

- Next.js expects: bare invoice object from `GET /invoices/{id}` (`setInv(data)`), paginated Laravel shape for lists, `GET /firms` as a **JSON array**, `POST /auth/google` → `{ user, token }`, invoice create → `{ message, invoice }`.  
- Applied `JsonResource::withoutWrapping()` so single-resource responses stay unwrapped while paginated collections keep Laravel’s `data` / `meta` / `links` structure.

### Implementation status

Delivered in code (this session): services, resources, form requests, rate limits, queued mailables (PDF generated inside mailable), dashboard cache, report query optimization, indexes migration, `config/services.php` for Google, API-friendly exception rendering, and backend documentation files.
