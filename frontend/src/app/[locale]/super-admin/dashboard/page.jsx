'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, UserX, UserCheck, Receipt, DollarSign, MessageSquare, Calendar } from 'lucide-react';

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/super-admin/analytics');
        setData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-red-500">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Super Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registered Users" value={data.total_users} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Active Users" value={data.active_users} icon={UserCheck} colorClass="bg-green-500" />
        <StatCard title="Blocked Users" value={data.blocked_users} icon={UserX} colorClass="bg-red-500" />
        <StatCard title="New Users Today" value={data.new_users_today} icon={Calendar} colorClass="bg-indigo-500" />
        <StatCard title="New Users This Month" value={data.new_users_this_month} icon={Calendar} colorClass="bg-purple-500" />
        <StatCard title="Total Invoices" value={data.total_invoices} icon={Receipt} colorClass="bg-teal-500" />
        <StatCard title="Total Revenue" value={`₹${data.total_revenue}`} icon={DollarSign} colorClass="bg-emerald-500" />
        <StatCard title="Contact Messages" value={data.total_contact_messages} icon={MessageSquare} colorClass="bg-orange-500" />
      </div>
    </div>
  );
}
