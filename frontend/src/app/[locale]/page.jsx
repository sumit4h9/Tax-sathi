'use client';

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import { Link, useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const { user, login, isLoading } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'super_admin') {
        router.push('/super-admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const respUser = await login(email, password);
      toast.success(t('loginSuccess'));
      if (respUser?.role === 'super_admin') {
        router.push('/super-admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        t('loginFailed');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-slate-50 dark:bg-slate-900">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-6 sm:px-20 text-center max-w-md mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-6">
          {t('loginTitle')}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-4 text-left"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
          >
            {submitting ? t('submitting') : t('loginButton')}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('blackpanther007');
              setPassword('7291915160');
            }}
            className="w-full mt-2 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2.5 transition-colors"
          >
            Super Admin Login
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              {t('registerLink')}
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
