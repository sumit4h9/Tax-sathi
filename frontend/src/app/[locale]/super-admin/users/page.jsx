'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { confirmAction } from '@/components/ui/confirm';
import Link from 'next/link';
import { Shield, ShieldOff, Trash2, Eye } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/users');
      setUsers(res.data.data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const blockUser = async (id) => {
    if (!await confirmAction('Are you sure you want to block this user?')) return;
    try {
      await api.post(`/super-admin/users/${id}/block`, { reason: 'Violated terms of service' });
      toast.success('User blocked');
      load();
    } catch (e) {
      toast.error('Failed to block user');
    }
  };

  const unblockUser = async (id) => {
    if (!await confirmAction('Are you sure you want to unblock this user?')) return;
    try {
      await api.post(`/super-admin/users/${id}/unblock`);
      toast.success('User unblocked');
      load();
    } catch (e) {
      toast.error('Failed to unblock user');
    }
  };

  const deleteUser = async (id) => {
    if (!await confirmAction('Are you sure you want to delete this user permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/super-admin/users/${id}`);
      toast.success('User deleted permanently');
      load();
    } catch (e) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage all registered users</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium">User Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Joined Date</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Invoices</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {new Date(u.joined_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 uppercase">{u.plan}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{u.total_invoices}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/en/super-admin/users/${u.id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {u.status === 'active' ? (
                        <button onClick={() => blockUser(u.id)} className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition" title="Block User">
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => unblockUser(u.id)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition" title="Unblock User">
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition" title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
