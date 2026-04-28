import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '../utils/api';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';

const STATUS_COLORS = [
  '#0000ff',
  '#10b981',
  '#6366f1',
  '#f59e0b',
  '#06065c',
  '#06b6d4',
  '#ED0101',
  '#84cc16',
  '#64748b',
];

function getArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.companies)) return data.companies;
  if (Array.isArray(data?.materials)) return data.materials;
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

function prettyStatus(status: string) {
  return String(status || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function valueOfJob(job: any) {
  return Number(job.invoice_amount || job.quote_amount || 0);
}

function costOfJob(job: any) {
  return Number(
    job.total_cost ||
      job.cost_total ||
      job.material_cost ||
      job.production_cost ||
      job.purchase_cost ||
      0
  );
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs'),
      api.get('/companies'),
      api.get('/clients').catch(() => ({ data: [] })),
      api.get('/inventory/materials').catch(() =>
        api.get('/inventory').catch(() => ({ data: [] }))
      ),
    ])
      .then(([jobsRes, companiesRes, clientsRes, materialsRes]) => {
        setJobs(getArray(jobsRes.data));
        setCompanies(getArray(companiesRes.data));
        setClients(getArray(clientsRes.data));
        setMaterials(getArray(materialsRes.data));
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const clientMap = useMemo(() => {
    return new Map(clients.map((c) => [c.id, c]));
  }, [clients]);

  const companyMap = useMemo(() => {
    return new Map(companies.map((c) => [c.id, c]));
  }, [companies]);

  const visibleCompanies = useMemo(() => {
    return companies.filter((c) => String(c.role || '').toLowerCase() !== 'holding');
  }, [companies]);

  const visibleCompanyIds = useMemo(() => {
    return new Set(visibleCompanies.map((c) => c.id));
  }, [visibleCompanies]);

  const visibleJobs = useMemo(() => {
    return jobs.filter((j) => visibleCompanyIds.has(j.primary_company_id));
  }, [jobs, visibleCompanyIds]);

  const activeJobs = visibleJobs.filter(
    (j) => !['completed', 'complete', 'invoiced', 'paid', 'cancelled', 'lost'].includes(String(j.status).toLowerCase())
  );

  const invoicedJobs = visibleJobs.filter((j) =>
    ['invoiced', 'paid'].includes(String(j.status).toLowerCase())
  );

  const revenue = invoicedJobs.reduce((sum, job) => sum + valueOfJob(job), 0);
  const costs = invoicedJobs.reduce((sum, job) => sum + costOfJob(job), 0);
  const margin = revenue > 0 ? (((revenue - costs) / revenue) * 100).toFixed(1) : '0.0';

  const quoteJobs = visibleJobs.filter((j) =>
    ['lead', 'brief', 'design', 'quote_sent', 'quote_approved', 'quote'].includes(
      String(j.status).toLowerCase()
    )
  );

  const lowStock = materials.filter((item) => {
    const stock = Number(item.stock ?? item.stock_qty ?? item.quantity_on_hand ?? item.quantity ?? 0);
    const reorder = Number(item.reorder ?? item.reorder_level ?? item.min_stock ?? 0);
    return reorder > 0 && stock <= reorder;
  });

  const jobsByStatus = useMemo(() => {
    const grouped: Record<string, number> = {};

    visibleJobs.forEach((job) => {
      const status = job.status || 'unknown';
      grouped[status] = (grouped[status] || 0) + 1;
    });

    return Object.entries(grouped).map(([status, count], index) => ({
      name: prettyStatus(status),
      value: count,
      color: STATUS_COLORS[index % STATUS_COLORS.length],
    }));
  }, [visibleJobs]);

  const revenueChart = useMemo(() => {
    const grouped: Record<string, { month: string; revenue: number; costs: number }> = {};

    invoicedJobs.forEach((job) => {
      const rawDate = job.invoice_date || job.updated_at || job.created_at;
      const date = rawDate ? new Date(rawDate) : new Date();
      const key = date.toLocaleDateString('en-ZA', { month: 'short' });

      if (!grouped[key]) grouped[key] = { month: key, revenue: 0, costs: 0 };
      grouped[key].revenue += valueOfJob(job);
      grouped[key].costs += costOfJob(job);
    });

    const rows = Object.values(grouped);

    if (rows.length > 0) return rows.slice(-6);

    return [
      { month: 'Jan', revenue: 0, costs: 0 },
      { month: 'Feb', revenue: 0, costs: 0 },
      { month: 'Mar', revenue: 0, costs: 0 },
      { month: 'Apr', revenue: 0, costs: 0 },
      { month: 'May', revenue: 0, costs: 0 },
      { month: 'Jun', revenue: 0, costs: 0 },
    ];
  }, [invoicedJobs]);

  const recentJobs = visibleJobs.slice(0, 6);

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
    <div className="space-y-4 p-4">
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg,#06065c 0%,#0000ba 55%,#0000ff 100%)',
          minHeight: '140px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-18px',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '7rem',
            fontWeight: 900,
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.07)',
            letterSpacing: '0.04em',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          SIGNACORE
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ED0101' }} />

        <div className="relative z-10 flex items-center gap-6 px-7 py-6">
          <div
            style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '14px 18px',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div className="rounded bg-white px-5 py-3 text-center text-xl font-black text-red-600">
              SC
              <div className="text-[10px] font-black text-blue-800">SIGNACORE</div>
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: '1.8rem',
                fontWeight: 800,
                fontStyle: 'italic',
                color: 'white',
                letterSpacing: '0.06em',
                lineHeight: 1.1,
              }}
            >
              SNSG Holdings
            </p>
            <p style={{ color: 'rgba(200,210,255,0.8)', fontSize: '0.78rem', marginTop: '4px', letterSpacing: '0.03em' }}>
              Applied Graphics and Visual Displays · Reg. No. 2022/4307/44/07
            </p>
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <span style={{ background: '#ED0101', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Business Platform
              </span>
              <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard icon="💰" label="Monthly Revenue" value={zarK(revenue)} sub="All entities" accent="text-brand-500" />
        <KPICard icon="💼" label="Active Jobs" value={String(activeJobs.length)} sub="In pipeline" accent="text-brand-500" />
        <KPICard icon="📈" label="Gross Margin" value={`${margin}%`} sub="Invoiced jobs" accent="text-emerald-600" />
        <KPICard icon="⚠️" label="Low Stock" value={String(lowStock.length)} sub="Need reordering" accent="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-3">
          <h3 className="mb-3 text-sm font-bold" style={{ color: '#06065c' }}>
            Revenue vs Costs — Last 6 Months
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `R${(Number(v) / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => zar(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="#0000ff" radius={[5, 5, 0, 0]} />
                <Bar dataKey="costs" name="Costs" fill="#94a3b8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold" style={{ color: '#06065c' }}>
            Jobs by Status
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobsByStatus} dataKey="value" nameKey="name" innerRadius={65} outerRadius={90}>
                  {jobsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend align="right" verticalAlign="middle" layout="vertical" wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visibleCompanies.map((company) => {
          const companyJobs = visibleJobs.filter((j) => j.primary_company_id === company.id);
          const companyValue = companyJobs.reduce((sum, job) => sum + valueOfJob(job), 0);

          return (
            <div
              key={company.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
              style={{ borderTop: '3px solid #0000ff' }}
            >
              <div className="mb-2 h-3 w-3 rounded-full" style={{ background: '#0000ff' }} />
              <p className="text-xs font-bold text-gray-600">{company.short_name || company.name}</p>
              <p className="mt-1 text-xl font-black text-gray-900">{zarK(companyValue)}</p>
              <p className="text-xs text-gray-400">
                {companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3" style={{ background: '#06065c' }}>
          <h3
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em', fontSize: '0.95rem' }}
          >
            RECENT JOBS
          </h3>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Job #', 'Client', 'Status', 'Value'].map((h) => (
                  <th
                    key={h}
                    className={`py-2 text-xs font-semibold text-gray-400 ${h === 'Value' ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => {
                const client = clientMap.get(job.client_id);
                const clientName = client?.company_name || job.client_name || job.title || 'Unknown Client';

                return (
                  <tr key={job.id} className="border-b border-gray-50 hover:bg-blue-50">
                    <td className="py-2.5 text-xs font-mono text-gray-500">{job.job_number}</td>
                    <td className="py-2.5 text-xs font-medium text-gray-700">{clientName}</td>
                    <td className="py-2.5">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="py-2.5 text-right text-xs font-bold text-gray-800">{zar(valueOfJob(job))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden">{quoteJobs.length}</div>
    </div>
  );
}
