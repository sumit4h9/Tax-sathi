'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Search, FileText, Download, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { unwrapApiData } from '@/lib/apiResponse';

export default function SalaryReportsPage() {
  const t = useTranslations('Reports');
  const ti = useTranslations('Index');
  
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [search, setSearch] = useState('');
  
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'management'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/salaries?month=${month}&year=${year}&search=${search}`);
      const payload = unwrapApiData(data);
      setRecords(payload.records || []);
      setStats(payload.stats || null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || t('loadFail');
      toast.error(message);
      setRecords([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [month, year, search, t]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleJobStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.put(`/salaries/${id}`, { job_status: newStatus });
      toast.success(t('statusUpdated', { status: newStatus }));
      load();
    } catch (err) {
      toast.error(t('updateFail') || 'Failed to update status');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/salaries/export/pdf?month=${month}&year=${year}`, { responseType: 'blob' });
      
      const isJson = response.data.type === 'application/json';
      if (isJson) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        if (json.download_url) {
          window.open(json.download_url, '_blank');
          return;
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Salary_Report_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get(`/salaries/export/excel?month=${month}&year=${year}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Salary_Report_${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to export Excel');
    }
  };

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];
  const completedRecords = records.filter(r => r.job_status === 'Completed');

  return (
    <div>
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t('backToReports')}
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('salaryReport') || 'Monthly Salary Report'}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('salaryReportDesc') || 'View and manage monthly salaries'}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-end bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('month')}</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('year')}</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full sm:w-32 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ti('search')}</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name, ID..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? t('refreshing') : ti('search')}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Employees</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total_employees}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Payroll</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{stats.total_payroll.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Overtime Payments</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{stats.total_overtime_payments.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Deductions</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">₹{stats.total_deductions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'report'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Salary Report (Completed)
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'management'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            Salary Management (All)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium text-right">Base Salary</th>
                <th className="p-4 font-medium text-center">Absent Days</th>
                <th className="p-4 font-medium text-center">Overtime (Hrs)</th>
                <th className="p-4 font-medium text-right">Final Salary</th>
                {activeTab === 'management' && <th className="p-4 font-medium text-center">Status</th>}
                <th className="p-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'management' ? 8 : 7} className="p-8 text-center text-slate-500">
                    {ti('loading')}
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'management' ? 8 : 7} className="p-8 text-center text-slate-500">
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                (activeTab === 'report' ? completedRecords : records).map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {rec.employee?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {rec.employee?.employee_id || 'No ID'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {rec.employee?.department || '—'}
                    </td>
                    <td className="p-4 text-right font-medium">
                      ₹{parseFloat(rec.employee?.salary || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${rec.absent_days > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {Number(rec.absent_days).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${rec.overtime_hours > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {Number(rec.overtime_hours).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{parseFloat(rec.final_salary).toLocaleString()}
                      </span>
                    </td>
                    {activeTab === 'management' && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleJobStatus(rec.id, rec.job_status)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            rec.job_status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                          }`}
                        >
                          {rec.job_status === 'Completed' ? 'Completed' : 'In Progress'}
                        </button>
                      </td>
                    )}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedEmployee(rec)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Salary Details</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Employee Name</span>
                <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.employee?.name}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Base Salary</span>
                <span className="font-medium text-slate-900 dark:text-white">₹{parseFloat(selectedEmployee.employee?.salary || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">
                  Deductions ({selectedEmployee.absent_days} days × ₹{selectedEmployee.employee?.absent_deduction_per_day || 0})
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  - ₹{(selectedEmployee.absent_days * parseFloat(selectedEmployee.employee?.absent_deduction_per_day || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">
                  Overtime ({selectedEmployee.overtime_hours} hrs × ₹{selectedEmployee.employee?.overtime_rate_per_hour || 0})
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  + ₹{(selectedEmployee.overtime_hours * parseFloat(selectedEmployee.employee?.overtime_rate_per_hour || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Final Salary</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{parseFloat(selectedEmployee.final_salary).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
