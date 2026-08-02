'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import api from '@/lib/axios';
import { unwrapApiData } from '@/lib/apiResponse';

export default function ContactPage() {
  const tc = useTranslations('Contact');
  const tNav = useTranslations('Index');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = tc('nameRequired');
    if (!email.trim()) next.email = tc('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = tc('emailInvalid');
    if (!message.trim()) next.message = tc('messageRequired');
    else if (message.trim().length < 10) next.message = tc('messageMin');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);
    try {
      const { data } = await api.post('/contact', {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      unwrapApiData(data);
      if (data?.email_notified) {
        toast.success(tc('success'));
      } else if (data?.email_hint) {
        toast.warning(`${tc('success')} ${data.email_hint}`);
      } else {
        toast.success(tc('success'));
      }
      setName('');
      setEmail('');
      setMessage('');
      setErrors({});
    } catch (err) {
      toast.error(err?.friendlyMessage || tc('fail'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-3">
          <Mail className="w-8 h-8 text-blue-600" />
          {tNav('contact')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{tc('subtitle')}</p>
      </header>

      <article className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <form className="space-y-6" onSubmit={submit} noValidate>
          <fieldset className="space-y-2">
            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {tc('name')}
            </label>
            <input
              id="contact-name"
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {tc('email')}
            </label>
            <input
              id="contact-email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </fieldset>

          <fieldset className="space-y-2">
            <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {tc('message')}
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[120px]"
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
          </fieldset>

          <button
            type="submit"
            disabled={sending}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {sending ? tc('sending') : tc('send')}
          </button>
        </form>
      </article>
    </div>
  );
}
