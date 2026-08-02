'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Send, Users } from 'lucide-react';

export default function MessagingPage() {
  const [users, setUsers] = useState([]);
  const [target, setTarget] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/super-admin/users');
        setUsers(res.data.data);
      } catch (e) {
        toast.error('Failed to load users');
      }
    }
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (target !== 'all' && selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSending(true);
    try {
      await api.post('/super-admin/notifications', {
        title: title.trim(),
        message: message.trim(),
        target,
        user_ids: selectedUsers,
      });
      toast.success('Notification sent successfully');
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (e) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const toggleUser = (id) => {
    setSelectedUsers((prev) => 
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Send className="w-8 h-8 text-blue-600" /> Messaging Center
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Send custom notifications to users</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <form onSubmit={handleSend} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">1. Select Recipients</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="target" 
                  value="all" 
                  checked={target === 'all'} 
                  onChange={() => setTarget('all')} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">All Users ({users.length})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="target" 
                  value="specific" 
                  checked={target === 'specific'} 
                  onChange={() => setTarget('specific')} 
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Specific Users</span>
              </label>
            </div>

            {target === 'specific' && (
              <div className="mt-3 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                {users.map((u) => (
                  <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded cursor-pointer transition">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">2. Compose Message</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Your subscription expires in 3 days."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
              <textarea 
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={sending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
