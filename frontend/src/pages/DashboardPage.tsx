import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLORS = [
  '#0800c8',
  '#16a34a',
  '#6366f1',
  '#f59e0b',
  '#0891b2',
  '#dc2626',
  '#7c3aed',
  '#ea580c',
];

function prettyStatus(status: string) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.companies)) return data.companies;
  if (Array.isArray(data?.materials)) return data.materials;
  return [];
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/companies'),
      api.get('/inventory/materials').catch(() => api.get('/inventory').catch(() => ({ data: [] }))),
    ])
      .then(([jobsRes, companiesRes, materialsRes]) => {
        setJobs(getArray(jobsRes.data));
        setCompanies(getArray(companiesRes.data));
        setMaterials(getArray(materialsRes.data));
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeJobs = jobs.filter((job) => {
    const status = String(job.status || '').toLowerCase();
    return !['paid', 'complete', 'completed', 'cancelled', 'lost'].includes(status);
  });

  const inQuoting = jobs.filter((job) => {
    const status = String(job.status || '').toLowerCase();
    return ['lead', 'brief', 'design', 'quote', 'quote_sent', 'quote_approved', 'quoting'].includes(status);
  });

  const lowStock = materials.filter((item) => {
    const qty = Number(item.stock_qty ?? item.quantity_on_hand ?? item.qty_on_hand ?? item.quantity ?? 0);
    const reorder = Number(item.reorder_level ?? item.min_stock ?? 0);
    return reorder > 0 && qty <= reorder;
  });

  const jobsByStatus = useMemo(() => {
    const grouped: Record<string, number> = {};

    jobs.forEach((job) => {
      const status = job.status || 'unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });

    return Object.entries(grouped).map(([status, count], index) => ({
      name: prettyStatus(status),
      value: count,
      color: STATUS_COLORS[index % STATUS_COLORS.length],
    }));
  }, [jobs]);

  const companyJobCounts = useMemo(() => {
    return companies
      .filter((company) => String(company.role || '').toLowerCase() !== 'holding')
      .map((company) => {
        const count = jobs.filter((job) => job.primary_company_id === company.id).length;
        return { ...company, job_count: count };
      });
  }, [companies, jobs]);

  const recentJobs = [...jobs]
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div className="overflow-hidden rounded-2xl border-t-4 border-red-600 bg-[#0800c8] p-6 text-white shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-32 items-center justify-center rounded-xl border border-white/25 bg-white/10">
            <div className="rounded bg-white px-4 py-3 text-center text-lg font-black text-red-600">
              SC
              <div className="text-[10px] font-bold text-blue-800">SIGNACORE</div>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black italic tracking-wide">SNSG Holdings</h1>
            <p className="mt-1 text-sm text-blue-100">
              Applied Graphics and Visual Displays · Business Management Platform
            </p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase">
                Business Platform
              </span>
              <span className="rounded-full bg-white/25 px-3 py-1 text-[10px] font-black uppercase">
                Dashboard
              </span>
            </div>
          </div>

          <div className="ml-auto hidden select-none text-7xl font-black italic tracking-tighter text-white/10 lg:block">
            SIGNACORE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Active Jobs</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{activeJobs.length}</div>
          <div className="text-sm text-gray-400">In pipeline</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Total Jobs</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{jobs.length}</div>
          <div className="text-sm text-gray-400">All companies</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">In Quoting</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{inQuoting.length}</div>
          <div className="text-sm text-gray-400">Needs follow-up</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Low Stock</div>
          <div className="mt-2 text-3xl font-black text-red-600">{lowStock.length}</div>
          <div className="text-sm text-gray-400">Inventory alerts</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-black text-[#08005f]">Jobs by Status</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={jobsByStatus} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                {jobsByStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {companyJobCounts.map((company) => (
          <div key={company.id} className="rounded-2xl border-t-4 border-[#0800c8] bg-white p-5 shadow-sm">
            <div className="mb-3 h-3 w-3 rounded-full bg-[#0800c8]" />
            <div className="text-sm font-bold text-gray-700">{company.name}</div>
            <div className="text-xs text-gray-400">{company.short_name}</div>
            <div className="mt-2 text-2xl font-black">{company.job_count}</div>
            <div className="text-sm text-gray-400">{company.job_count} jobs</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-[#07005f] px-5 py-4 text-sm font-black uppercase text-white">
          Recent Jobs
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-4 text-left">Job #</th>
              <th className="px-5 py-4 text-left">Job</th>
              <th className="px-5 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((job) => (
              <tr key={job.id} className="border-b last:border-b-0">
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{job.job_number}</td>
                <td className="px-5 py-4 font-semibold text-gray-700">{job.title}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={job.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
