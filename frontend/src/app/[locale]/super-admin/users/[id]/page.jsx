'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { User, Receipt, Users, Briefcase, Calendar, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { confirmAction } from '@/components/ui/confirm';

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/super-admin/users/${id}`);
      setData(res.data.data);
    } catch (e) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  const updatePlan = async (action, plan = null, days = null) => {
    if (!await confirmAction(`Are you sure you want to ${action} this subscription?`)) return;
    try {
      await api.post(`/super-admin/users/${id}/subscription`, { action, plan, validity_days: days });
      toast.success(`Subscription ${action} successful`);
      load();
    } catch (e) {
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading user profile...</div>;
  }

  if (!data) return null;

  const { profile, stats } = data;

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <Link href="/en/super-admin/users" className="text-blue-600 text-sm hover:underline mb-2 inline-block">
            ← Back to Users
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <User className="w-8 h-8 text-slate-400" />
            {profile.name}
            {profile.is_blocked && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> BLOCKED
              </span>
            )}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Receipt className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-sm text-slate-500">Total Invoices</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_invoices}</h3>
          <p className="text-xs text-slate-400 mt-1">Revenue: ₹{stats.total_revenue}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Briefcase className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-sm text-slate-500">Total Clients (Firms)</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_clients}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Users className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-sm text-slate-500">Total Employees</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total_employees}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-6 h-6 text-teal-500 mb-2" />
          <p className="text-sm text-slate-500">Joined Date</p>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1">
            {new Date(stats.registration_date).toLocaleDateString()}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Last login: {stats.last_login_date ? new Date(stats.last_login_date).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Subscription Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current Plan</p>
            <p className="text-2xl font-bold uppercase text-blue-600 mt-1">{stats.current_plan}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Expires: {stats.subscription_expires_at ? new Date(stats.subscription_expires_at).toLocaleDateString() : 'Lifetime / Free'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updatePlan('upgrade', 'premium', 30)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
                Upgrade to Premium (30 days)
              </button>
              <button onClick={() => updatePlan('upgrade', 'enterprise', 365)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
                Upgrade to Enterprise (1 year)
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updatePlan('extend', stats.current_plan, 30)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium">
                Extend Plan by 30 days
              </button>
              <button onClick={() => updatePlan('expire')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium">
                Expire Plan Manually
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
