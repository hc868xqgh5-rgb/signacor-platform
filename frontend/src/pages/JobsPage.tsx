import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import {
  DONE_STATUSES,
  STATUS_META,
  WIP_STATUSES,
  toDemoCompanies,
  toDemoJobs,
} from '../utils/demoAdapters';

function getArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.clients)) return data.clients;
  if (Array.isArray(data?.companies)) return data.companies;
  return [];
}

function zar(value: number) {
  return `R ${Number(value || 0).toLocaleString('en-ZA', {
    maximumFractionDigits: 0,
  })}`;
}

function zarK(value: number) {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `R ${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `R ${(amount / 1000).toFixed(0)}k`;
  return zar(amount);
}

function stageIndex(status: string) {
  const stages = [
    'lead',
    'brief',
    'design',
    'quote_sent',
    'quote_approved',
    'deposit_received',
    'in_production',
    'installation',
    'invoiced',
    'paid',
  ];

  const index = stages.indexOf(String(status || '').toLowerCase());
  return index < 0 ? 0 : index;
}

function StageBar({ status }: { status: string }) {
  const current = stageIndex(status);
  const total = 9;
  const percentage = Math.min(100, Math.max(8, (current / total) * 100));

  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100">
      <div
        className="h-1.5 rounded-full bg-[#0000ff]"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface NewJobForm {
  title: string;
  client_id: string;
  primary_company_id: string;
  description: string;
  location: string;
  deadline: string;
  quote_amount: string;
}

const EMPTY_FORM: NewJobForm = {
  title: '',
  client_id: '',
  primary_company_id: '',
  description: '',
  location: '',
  deadline: '',
  quote_amount: '',
};

export default function JobsPage() {
  const navigate = useNavigate();

  const [jobsRaw, setJobsRaw] = useState<any[]>([]);
  const [companiesRaw, setCompaniesRaw] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [jobTab, setJobTab] = useState<'active' | 'completed'>('active');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewJobForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [jobsRes, companiesRes, clientsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/companies'),
        api.get('/clients', { params: { limit: 500 } }).catch(() => ({ data: [] })),
      ]);

      const jobs = getArray(jobsRes.data);
      const companies = getArray(companiesRes.data);
      const clientList = getArray(clientsRes.data);

      const clientMap = new Map(clientList.map((c: any) => [c.id, c]));

      const jobsWithClientNames = jobs.map((job: any) => ({
        ...job,
        client_name:
          job.client_name ||
          (clientMap.get(job.client_id) as any)?.company_name ||
          (clientMap.get(job.client_id) as any)?.trading_name ||
          'Unknown Client',
      }));

      setJobsRaw(jobsWithClientNames);
      setCompaniesRaw(companies);
      setClients(clientList);

      const firstOperatingCompany = companies.find(
        (c: any) => String(c.role || '').toLowerCase() !== 'holding'
      );

      setForm((prev) => ({
        ...prev,
        primary_company_id: prev.primary_company_id || firstOperatingCompany?.id || '',
      }));
    } catch (err) {
      console.error('Jobs load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const jobs = useMemo(() => toDemoJobs(jobsRaw), [jobsRaw]);
  const companies = useMemo(() => toDemoCompanies(companiesRaw), [companiesRaw]);

  const visibleCompanies = companies.filter(
    (company) => String(company.role || '').toLowerCase() !== 'holding'
  );

  const visibleCompanyIds = new Set(visibleCompanies.map((company) => company.id));

  const visibleJobs = jobs.filter((job) => visibleCompanyIds.has(job.co));

  const activeJobs = visibleJobs.filter(
    (job) => !DONE_STATUSES.includes(String(job.status).toLowerCase())
  );

  const completedJobs = visibleJobs.filter((job) =>
    DONE_STATUSES.includes(String(job.status).toLowerCase())
  );

  const tabJobs = jobTab === 'active' ? activeJobs : completedJobs;

  const statusOptions = jobTab === 'active' ? WIP_STATUSES : DONE_STATUSES;

  const filtered = tabJobs.filter((job) => {
    if (entityFilter && job.co !== entityFilter) return false;
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;

    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      String(job.client || '').toLowerCase().includes(q) ||
      String(job.num || '').toLowerCase().includes(q) ||
      String(job.desc || '').toLowerCase().includes(q)
    );
  });

  const activeEntity = entityFilter
    ? visibleCompanies.find((company) => company.id === entityFilter)
    : null;

  const switchTab = (tab: 'active' | 'completed') => {
    setJobTab(tab);
    setStatusFilter('all');
  };

  const handleCreate = async () => {
    if (!form.title || !form.client_id || !form.primary_company_id) {
      alert('Please complete job title, client and company.');
      return;
    }

    setSaving(true);

    try {
      const res = await api.post('/jobs', {
        title: form.title,
        client_id: form.client_id,
        primary_company_id: form.primary_company_id,
        description: form.description,
        location: form.location,
        deadline: form.deadline || null,
        quote_amount: Number(form.quote_amount || 0),
      });

      setShowAdd(false);
      setForm({
        ...EMPTY_FORM,
        primary_company_id: form.primary_company_id,
      });

      await fetchData();

      if (res.data?.id) {
        navigate(`/jobs/${res.data.id}`);
      }
    } catch (err) {
      console.error('Create job error:', err);
      alert('Could not create job.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading jobs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">New Job</h2>
                <p className="text-xs text-gray-400">Create a new live job record</p>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">Job Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. ERESA Signage Rollout"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">Client</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select client…</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.trading_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">Company</label>
                <select
                  value={form.primary_company_id}
                  onChange={(e) => setForm({ ...form, primary_company_id: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                >
                  {visibleCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.short}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="min-h-[90px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">Quote Amount</label>
                  <input
                    type="number"
                    value={form.quote_amount}
                    onChange={(e) => setForm({ ...form, quote_amount: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Create Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => switchTab('active')}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
            jobTab === 'active'
              ? 'border-[#0000ff] bg-[#0000ff] text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
          }`}
        >
          💼 Work in Progress
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-black ${
              jobTab === 'active' ? 'bg-white/30 text-white' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {activeJobs.length}
          </span>
        </button>

        <button
          onClick={() => switchTab('completed')}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
            jobTab === 'completed'
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
          }`}
        >
          ✅ Completed Jobs
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs font-black ${
              jobTab === 'completed'
                ? 'bg-white/30 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {completedJobs.length}
          </span>
        </button>

        <button
          onClick={() => setShowAdd(true)}
          className="ml-auto flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm font-bold text-white hover:bg-gray-900"
        >
          ＋ New Job
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setEntityFilter(null)}
          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
            entityFilter === null
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
          }`}
        >
          All Entities
        </button>

        {visibleCompanies.map((company) => (
          <button
            key={company.id}
            onClick={() => setEntityFilter(company.id)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              entityFilter === company.id
                ? 'border-transparent bg-[#0000ff] text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
            }`}
          >
            {company.short}
          </button>
        ))}

        {activeEntity && <span className="text-xs text-gray-400">— {activeEntity.short}</span>}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client, job number or description…"
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">
            All {jobTab === 'active' ? 'WIP' : 'Completed'} Statuses
          </option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status]?.label || status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-3 text-center">
          <p className="text-xl font-black text-gray-800">{filtered.length}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {jobTab === 'active' ? 'In Progress' : 'Completed'}
            {activeEntity ? ` · ${activeEntity.short}` : ''}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-3 text-center">
          <p className="text-lg font-black text-[#0000ff]">
            {zarK(filtered.reduce((sum, job) => sum + Number(job.value || 0), 0))}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {jobTab === 'active' ? 'Pipeline Value' : 'Completed Value'}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-3 text-center">
          {jobTab === 'active' ? (
            <>
              <p className="text-xl font-black text-emerald-600">
                {
                  filtered.filter((job) =>
                    ['in_production', 'installation'].includes(String(job.status))
                  ).length
                }
              </p>
              <p className="mt-0.5 text-xs text-gray-400">On the Floor</p>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-teal-600">
                {filtered.filter((job) => job.status === 'invoiced').length}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">Invoiced</p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-400">
            <p className="text-sm">
              {jobTab === 'active'
                ? 'No active jobs match your filters.'
                : 'No completed jobs yet.'}
            </p>
            {jobTab === 'active' && (
              <button
                onClick={() => setShowAdd(true)}
                className="mx-auto mt-3 block text-sm font-semibold text-blue-600"
              >
                + Add a job
              </button>
            )}
          </div>
        )}

        {filtered.map((job) => {
          const company = companies.find((c) => c.id === job.co);
          const raw = job.raw || {};
          const cost = Number(raw.total_cost || raw.cost_total || 0);
          const margin =
            cost > 0 && job.value > 0 ? (((job.value - cost) / job.value) * 100).toFixed(0) : null;

          return (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className={`block w-full cursor-pointer rounded-2xl border bg-white p-4 text-left transition-all hover:shadow-md ${
                jobTab === 'completed'
                  ? 'border-emerald-100 hover:border-emerald-300'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-400">{job.num}</span>
                    <StatusBadge status={job.status} size="sm" />
                    {company && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {company.short}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-gray-800">{job.client}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{job.desc}</p>

                  <div className="mt-2">
                    <StageBar status={job.status} />
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-black text-gray-800">{zar(job.value)}</p>
                  {margin !== null && (
                    <p
                      className={`mt-0.5 text-xs ${
                        Number(margin) > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {margin}% margin
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-300">tap to view →</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
