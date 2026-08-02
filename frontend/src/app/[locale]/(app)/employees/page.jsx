'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { normalizeUserList } from '@/lib/attendanceApi';
import { Trash2, Pencil, X, UserPlus, Save } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function EmployeesPage() {
  const t = useTranslations('Employees');
  const { user, isLoading: authLoading } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [absentDeduction, setAbsentDeduction] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  // Edit Employee Form State
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('staff');
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editAbsentDeduction, setEditAbsentDeduction] = useState('');
  const [editOvertimeRate, setEditOvertimeRate] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');

  const load = useCallback(async () => {
    if (user?.role !== 'admin') {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setRows(normalizeUserList(data));
    } catch (err) {
      toast.error(err?.friendlyMessage || t('loadFail'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t, user?.role]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [load, authLoading]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', {
        name: name.trim(),
        email: email.trim(),
        role,
        employee_id: employeeId.trim(),
        department: department.trim(),
        designation: designation.trim(),
        salary: Number(salary),
        absent_deduction_per_day: Number(absentDeduction),
        overtime_rate_per_hour: Number(overtimeRate),
        joining_date: joiningDate,
      });
      toast.success(t('added'));
      setName('');
      setEmail('');
      setRole('staff');
      setEmployeeId('');
      setDepartment('');
      setDesignation('');
      setSalary('');
      setAbsentDeduction('');
      setOvertimeRate('');
      setJoiningDate('');
      load();
    } catch (err) {
      toast.error(err?.friendlyMessage || t('loadFail'));
    }
  };

  const startEdit = (emp) => {
    setEditingEmployee(emp);
    setEditName(emp.name || '');
    setEditEmail(emp.email || '');
    setEditRole(emp.role || 'staff');
    setEditEmployeeId(emp.employee_id || '');
    setEditDepartment(emp.department || '');
    setEditDesignation(emp.designation || '');
    setEditSalary(emp.salary ? String(emp.salary) : '');
    setEditAbsentDeduction(emp.absent_deduction_per_day ? String(emp.absent_deduction_per_day) : '');
    setEditOvertimeRate(emp.overtime_rate_per_hour ? String(emp.overtime_rate_per_hour) : '');
    setEditJoiningDate(emp.joining_date || '');
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${editingEmployee.id}`, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        employee_id: editEmployeeId.trim(),
        department: editDepartment.trim(),
        designation: editDesignation.trim(),
        salary: Number(editSalary),
        absent_deduction_per_day: Number(editAbsentDeduction),
        overtime_rate_per_hour: Number(editOvertimeRate),
        joining_date: editJoiningDate,
      });
      toast.success(t('updated'));
      setEditingEmployee(null);
      load();
    } catch (err) {
      toast.error(err?.friendlyMessage || t('loadFail'));
    }
  };

  const remove = async (id) => {
    if (!confirm(t('removeConfirm'))) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success(t('removed'));
      load();
    } catch (err) {
      toast.error(err?.friendlyMessage || t('deleteFail'));
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('forbidden')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('title')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
      </div>

      {/* Add Employee Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          {t('addTitle')}
        </h2>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('employeeId')} *</label>
            <input
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. EMP001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name')} *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('email')} *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('department')} *</label>
            <input
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Engineering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('designation')} *</label>
            <input
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('joiningDate')} *</label>
            <input
              required
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('salary')} (₹) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('absentDeduction')} (₹) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={absentDeduction}
              onChange={(e) => setAbsentDeduction(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 1500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('overtimeRate')} (₹/hr) *</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={overtimeRate}
              onChange={(e) => setOvertimeRate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('role')}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="staff">{t('staff')}</option>
              <option value="admin">{t('admin')}</option>
            </select>
          </div>
          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              {t('addButton')}
            </button>
          </div>
        </form>
      </div>

      {/* Employee Listing Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 font-semibold">{t('employeeId')}</th>
                <th className="p-3 font-semibold">{t('colName')}</th>
                <th className="p-3 font-semibold">{t('colEmail')}</th>
                <th className="p-3 font-semibold">{t('department')}</th>
                <th className="p-3 font-semibold">{t('designation')}</th>
                <th className="p-3 font-semibold">{t('salary')}</th>
                <th className="p-3 font-semibold">{t('joiningDate')}</th>
                <th className="p-3 font-semibold">{t('colRole')}</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    …
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    —
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition">
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{r.employee_id || '—'}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{r.email}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{r.department || '—'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{r.designation || '—'}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-white">
                      {r.salary != null ? `₹${Number(r.salary).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3 text-slate-500">
                      {r.joining_date ? new Date(r.joining_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        r.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {r.role === 'admin' ? t('admin') : t('staff')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="p-2 text-slate-600 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          aria-label={t('edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(r.id)}
                          disabled={String(r.id) === String(user?.id)}
                          className="p-2 text-red-600 disabled:opacity-30 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                          aria-label={t('remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                {t('editTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            <form onSubmit={submitEdit} className="p-6 overflow-y-auto space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('employeeId')} *</label>
                  <input
                    required
                    value={editEmployeeId}
                    onChange={(e) => setEditEmployeeId(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('name')} *</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('email')} *</label>
                  <input
                    required
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('department')} *</label>
                  <input
                    required
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('designation')} *</label>
                  <input
                    required
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('joiningDate')} *</label>
                  <input
                    required
                    type="date"
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('salary')} (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editSalary}
                    onChange={(e) => setEditSalary(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('absentDeduction')} (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editAbsentDeduction}
                    onChange={(e) => setEditAbsentDeduction(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('overtimeRate')} (₹/hr) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={editOvertimeRate}
                    onChange={(e) => setEditOvertimeRate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('role')}</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="staff">{t('staff')}</option>
                    <option value="admin">{t('admin')}</option>
                  </select>
                </div>
              </div>
              <footer className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {t('saveButton')}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
