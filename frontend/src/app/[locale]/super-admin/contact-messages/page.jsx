'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { MessageSquare, Trash2, CheckCircle, Mail } from 'lucide-react';
import { confirmAction } from '@/components/ui/confirm';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/super-admin/contact-messages');
      setMessages(res.data.data);
    } catch (e) {
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/super-admin/contact-messages/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const deleteMessage = async (id) => {
    if (!await confirmAction('Delete this message permanently?')) return;
    try {
      await api.delete(`/super-admin/contact-messages/${id}`);
      toast.success('Message deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete message');
    }
  };

  const reply = async (id) => {
    const text = window.prompt("Enter your reply (it will mark the message as resolved):");
    if (!text) return;
    try {
      await api.post(`/super-admin/contact-messages/${id}/reply`, { reply: text });
      toast.success('Reply sent successfully');
      load();
    } catch (e) {
      toast.error('Failed to send reply');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-orange-500" /> Contact Messages
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage user contact requests</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="p-4 font-medium w-1/4">Name & Email</th>
                <th className="p-4 font-medium w-1/4">Subject</th>
                <th className="p-4 font-medium w-1/3">Message</th>
                <th className="p-4 font-medium whitespace-nowrap">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No contact messages yet.</td></tr>
              ) : messages.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{m.subject || 'No Subject'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    <div className="max-w-xs break-words">{m.message}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      m.status === 'read' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {m.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {m.status !== 'resolved' && (
                        <>
                          <button onClick={() => updateStatus(m.id, 'read')} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition" title="Mark as Read">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => reply(m.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition" title="Reply & Resolve">
                            <Mail className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteMessage(m.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition" title="Delete">
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
