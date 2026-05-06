<<<<<<< HEAD
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
} from 'recharts';
import api from '../utils/api';
import KPICard from '../components/KPICard';
import StatusBadge from '../components/StatusBadge';
<<<<<<< HEAD
import { DashboardData, GroupConsolidated } from '../types';
import { formatZAR, formatPercent, formatDate, marginColor } from '../utils/format';
import { COMPANY_COLORS } from '../utils/constants';

const STATUS_COLORS = [
  '#6b7280','#7c3aed','#2563eb','#4f46e5','#0891b2',
  '#0d9488','#ea580c','#d97706','#65a30d','#16a34a','#059669','#dc2626'
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
=======

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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
<<<<<<< HEAD
      api.get('/dashboard/overview'),
      api.get('/dashboard/pipeline'),
    ]).then(([overviewRes, pipelineRes]) => {
      setData(overviewRes.data);
      setPipeline(pipelineRes.data.slice(0, 8));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
          <p className="mt-3 text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (!data) return <div className="p-6 text-red-600">Failed to load dashboard data.</div>;

  const { kpis, jobs_by_status, monthly_revenue, top_jobs, group_consolidated } = data;

  // Format monthly data for chart
  const chartData = monthly_revenue.map(m => ({
    month: new Date(m.month).toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
    Revenue: Math.round(Number(m.revenue)),
    Profit: Math.round(Number(m.profit)),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Group Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Consolidated view across all four entities</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={formatZAR(kpis.total_revenue, { compact: true })} icon="💰" color="blue" />
        <KPICard label="Gross Profit" value={formatZAR(kpis.gross_profit, { compact: true })} icon="📈" color="green"
          subValue={`${formatPercent(kpis.avg_margin)} avg margin`} />
        <KPICard label="Active Jobs" value={String(kpis.active_jobs)} icon="📋" subValue={`${kpis.total_jobs} total`} />
        <KPICard label="Outstanding" value={formatZAR(Number(kpis.total_revenue) - Number(kpis.total_collected), { compact: true })} icon="⏳" color="orange" />
      </div>

      {/* Group entity cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Group Companies</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {group_consolidated.map((co: GroupConsolidated) => (
            <div key={co.company_id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{co.company}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{co.role.replace('_', '/')}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: COMPANY_COLORS[co.company] || '#9ca3af' }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-medium">{formatZAR(co.total_revenue, { compact: true })}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Profit</span>
                  <span className={`font-medium ${marginColor(Number(co.margin_percent))}`}>
                    {formatZAR(co.gross_profit, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Margin</span>
                  <span className={`font-bold ${marginColor(Number(co.margin_percent))}`}>
                    {formatPercent(co.margin_percent)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-brand-500"
                    style={{ width: `${Math.min(Number(co.margin_percent), 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue & Profit — Last 12 Months</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatZAR(v)} />
                <Area type="monotone" dataKey="Revenue" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" fill="url(#profGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              No invoiced jobs yet
            </div>
          )}
        </div>

        {/* Jobs by status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Jobs by Stage</h3>
          {jobs_by_status.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={jobs_by_status} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80}>
                  {jobs_by_status.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => value.replace(/_/g, ' ')}
                  wrapperStyle={{ fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No jobs yet</div>
          )}
        </div>
      </div>

      {/* Pipeline table + top jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Active Pipeline</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {pipeline.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No active jobs</p>
            )}
            {pipeline.map(job => (
              <div key={job.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 truncate">{job.client_name} · {job.job_number}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={job.status} size="sm" />
                  {job.deadline && (
                    <span className="text-xs text-gray-400">{formatDate(job.deadline)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top jobs by revenue */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Top Jobs by Revenue</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {top_jobs.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No invoiced jobs yet</p>
            )}
            {top_jobs.slice(0, 6).map((job, i) => (
              <div key={job.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.client_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatZAR(job.invoice_amount, { compact: true })}</p>
                  {job.margin_percent != null && (
                    <p className={`text-xs font-medium ${marginColor(Number(job.margin_percent))}`}>
                      {formatPercent(job.margin_percent)} margin
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
    </div>
  );
}
