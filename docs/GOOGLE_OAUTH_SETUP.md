# Google OAuth 2.0 setup (Sign in with Google)

This stack uses **Google Identity Services** on the Next.js app and **ID token verification** on Laravel (`POST /api/auth/google`). There is no server-side OAuth redirect dance; the SPA receives a JWT credential and the API verifies it with Google’s public keys.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable **Google+ API** / **People API** if prompted (Sign-In usually works with default APIs).
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins** (add every environment you use):
   - `http://localhost:3000` (local Next.js)
   - Your production frontend URL, for example `https://app.example.com`
6. **Authorized redirect URIs** are not required for the One Tap / button flow used by `@react-oauth/google`, but if you add redirect URIs later they must match exactly.
7. Copy the **Client ID** (looks like `123456789-abc.apps.googleusercontent.com`).

## 2. Frontend (`frontend`)

1. Copy `frontend/.env.example` to `frontend/.env.local` (if you have not already).
2. Set:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — same Web client ID from the console.
   - `NEXT_PUBLIC_API_URL` — Laravel API base, e.g. `http://localhost:8000/api`.

Restart `npm run dev` after changing env vars.

## 3. Backend (`backend`)

1. In `backend/.env`, set:
   - `GOOGLE_CLIENT_ID` — **the same** Web client ID (Laravel verifies tokens issued for this client).
2. Ensure `APP_URL` matches how you run Laravel (e.g. `http://localhost:8000`).

## 4. Roles

- The first user who signs in becomes **admin** if no admin exists yet (`AuthController`).
- Additional users default to **staff** until an admin changes their role via **Employees** (admin-only API).

## 5. Troubleshooting

- **Invalid token / 401**: Client IDs differ between frontend and backend, or the token is expired — sign in again.
- **CORS errors**: Serve the SPA and API from the origins you configured; set `NEXT_PUBLIC_API_URL` to the exact API prefix the browser calls.
- **“You need admin access”** on employee routes: sign in as an admin user or promote a user in the database.
