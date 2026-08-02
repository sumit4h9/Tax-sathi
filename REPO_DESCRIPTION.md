# TaxSathi — Detailed Repository Analysis & Documentation

## 1. Executive Summary

**TaxSathi** is a modern, enterprise-grade **Tax, GST Invoicing, Payroll, and Workforce Management SaaS Platform** designed for Indian businesses, accounting firms, and SMEs. The platform handles end-to-end GST compliant invoicing, multi-firm management, employee management, attendance tracking, automated salary payout calculations, multi-lingual interface support, and Super-Admin system governance.

The repository is organized as a **Decoupled Monorepo** featuring a modern REST API backend powered by **Laravel 12** and a fast, internationalized frontend built with **Next.js 15**.

---

## 2. Technology Stack & Key Dependencies

### Backend Stack
- **Framework:** [Laravel 12](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/README.md) (PHP 8.2+)
- **Authentication:** Laravel Sanctum (Bearer Token Authentication)
- **Database & ORM:** Eloquent ORM with dual SQL & MongoDB support ([mongodb/laravel-mongodb 5.7](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/composer.json))
- **PDF Generation:** DomPDF ([barryvdh/laravel-dompdf](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/composer.json))
- **Email Delivery:** Resend API integration ([resend/resend-laravel](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/composer.json))
- **Containerization:** Docker ([backend/Dockerfile](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/Dockerfile))

### Frontend Stack
- **Framework:** [Next.js 15.5](file:///c:/Users/suraj/Desktop/TaxSathi-main/frontend/package.json) (App Router, Server & Client Components)
- **UI & Component Engine:** React 19, TailwindCSS v4, Lucide React icons
- **State Management:** Zustand 5.0 ([useAuthStore.js](file:///c:/Users/suraj/Desktop/TaxSathi-main/frontend/src/store/useAuthStore.js))
- **Internationalization:** `next-intl` (English `en.json` & Hindi `hi.json`)
- **Form Management & Validation:** React Hook Form + Zod
- **HTTP Client:** Axios with bearer token interceptors ([axios.js](file:///c:/Users/suraj/Desktop/TaxSathi-main/frontend/src/lib/axios.js))
- **Notifications:** Sonner toast notifications

---

## 3. Architecture & Project Structure

```
TaxSathi-main/
├── backend/                  # Laravel 12 API & Management Engine
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # API & Web Controllers
│   │   │   ├── Middleware/   # Role & Rate-limiting Middleware
│   │   │   └── Resources/    # API JsonResource Converters
│   │   ├── Models/           # Eloquent Data Models
│   │   └── Services/         # Core Domain Services (GST, Mail, Status)
│   ├── config/               # Application configuration
│   ├── database/             # Migrations, Seeders, Factories
│   ├── routes/               # API & Web route definitions
│   └── tests/                # PHPUnit automated tests
├── frontend/                 # Next.js 15 Web Application
│   ├── messages/             # i18n Translation dictionaries (en, hi)
│   ├── src/
│   │   ├── app/              # Next.js App Router ([locale] localized routes)
│   │   ├── components/       # UI Components & Modules
│   │   ├── hooks/            # Custom React Hooks
│   │   ├── lib/              # API Clients & Utility functions
│   │   └── store/            # Zustand global stores
├── docs/                     # System architecture & deployment docs
```

---

## 4. Key Functional Modules

### 4.1. GST Invoicing Engine
- **Tax Math Calculation:** Handled by [GstCalculator.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Services/GstCalculator.php) and mirrored on frontend with [gstCalculator.js](file:///c:/Users/suraj/Desktop/TaxSathi-main/frontend/src/lib/gstCalculator.js).
- **Tax Types:** Calculates CGST, SGST (intra-state), and IGST (inter-state) dynamically based on firm and client locations.
- **PDF Generation & Emailing:** Invoices are compiled into clean PDF documents using DomPDF and can be automatically emailed to clients via Resend ([InvoiceService.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Services/InvoiceService.php)).
- **Number-to-Words Conversion:** Converts final monetary totals into Indian rupees in words ([numberToWords.js](file:///c:/Users/suraj/Desktop/TaxSathi-main/frontend/src/lib/numberToWords.js)).

### 4.2. Firm & Multi-Business Management
- Business profiles store GSTIN, PAN, registered office address, bank details, contact information, and logo.
- Supports managing multiple business entities under an administrative profile.

### 4.3. Employee & Workforce Management
- **User Models:** Integrated `User` and `Employee` structures ([User.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Models/User.php)).
- **Role System:** 
  - `super_admin`: Platform owner with full global control.
  - `admin`: Business owner/manager managing firms, invoices, employees, and salaries.
  - `staff`: Regular employee viewing attendance and company invoices.

### 4.4. Attendance Tracking System
- Daily attendance logging with status options (Present, Absent, Half-Day, Paid Leave).
- Bulk attendance entry endpoint (`POST /api/attendance`).
- History tracking per employee ([AttendanceController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/AttendanceController.php)) and monthly/yearly rollups.

### 4.5. Payroll & Salary Management
- Automated salary record generation ([SalaryRecord.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Models/SalaryRecord.php)).
- Tracks base salary, extra allowances, deductions, net payables, and payment statuses (Pending, Processed, Paid).
- Export capabilities to **PDF** and **Excel** spreadsheets ([SalaryController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/SalaryController.php)).

### 4.6. Analytics & Dashboard Reports
- Cached high-performance dashboard analytics ([DashboardController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/DashboardController.php)).
- Metrics include: total revenue, tax collections, outbound vs inbound invoice ratios, active workforce count, and attendance statistics.

### 4.7. Super Admin System Governance
- Global platform analytics and user management ([SuperAdmin/UserController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/SuperAdmin/UserController.php)).
- Account status controls (Block / Unblock / Delete users).
- Subscription plan tier updates ([SubscriptionController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/SuperAdmin/SubscriptionController.php)).
- Global system broadcast notifications ([NotificationController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/SuperAdmin/NotificationController.php)).
- Inbound contact message support desk handling ([ContactMessageController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/API/SuperAdmin/ContactMessageController.php)).

### 4.8. Operations & System Health Layer (`web.php`)
- Built-in operational monitoring endpoints ([HealthController.php](file:///c:/Users/suraj/Desktop/TaxSathi-main/backend/app/Http/Controllers/Web/HealthController.php)):
  - `/health/db` — Verifies database connection.
  - `/health/queue` — Checks queue listener status.
  - `/health/storage` — Ensures storage symlinks & permissions are healthy.
- Maintenance & preview utilities gated safely by environment flags ([WEB_ROUTES.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/WEB_ROUTES.md)).

---

## 5. Security & Performance Optimizations

1. **Token Authentication:** Secure API access via Sanctum Bearer Tokens.
2. **Rate Limiting Throttles:** Dedicated rate limiters configured for sensitive endpoints (`auth-login`, `contact-form`, `api`).
3. **Database Indexing:** Indexed queries on frequent filter combinations (`invoices.date`, `firm_id + date`, `attendances.date`).
4. **Queued Mailables:** PDF creation and email dispatching offloaded to background queues for responsive API performance.
5. **Multi-Language Support (i18n):** Full localization in English and Hindi via Next.js middleware and `next-intl`.

---

## 6. Comprehensive Documentation Directory

The repository includes dedicated documentation files in the [docs](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs) folder:
- [BACKEND_AUDIT_AND_ROADMAP.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/BACKEND_AUDIT_AND_ROADMAP.md) — Architecture audit, response shapes, and optimization history.
- [WEB_ROUTES.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/WEB_ROUTES.md) — HTTP web operations, health routes, and admin utility gates.
- [BACKEND_PRODUCTION.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/BACKEND_PRODUCTION.md) — Production deployment guidelines and server configuration.
- [EMAIL_CONFIGURATION.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/EMAIL_CONFIGURATION.md) — Setup instructions for Resend email provider.
- [GOOGLE_OAUTH_SETUP.md](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/GOOGLE_OAUTH_SETUP.md) — Configuration guide for Google Social Authentication.
- [GST_Invoice_API.postman_collection.json](file:///c:/Users/suraj/Desktop/TaxSathi-main/docs/GST_Invoice_API.postman_collection.json) — Ready-to-use Postman collection for API testing.
