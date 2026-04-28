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
import { DashboardData, GroupConsolidated } from '../types';
import { COMPANY_COLORS } from '../utils/constants';

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
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/overview'),
      api.get('/dashboard/pipeline'),
      api.get('/inventory').catch(() => ({ data: [] })),
    ])
      .then(([overviewRes, pipelineRes, inventoryRes]) => {
        setData(overviewRes.data);
        setPipeline(pipelineRes.data || []);
        setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lowStockCount = useMemo(() => {
    return inventory.filter((item) => {
      const qty = Number(item.quantity_on_hand ?? item.qty_on_hand ?? item.quantity ?? 0);
      const reorder = Number(item.reorder_level ?? item.min_stock ?? 0);
      return reorder > 0 && qty <= reorder;
    }).length;
  }, [inventory]);

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

  if (!data) {
    return <div className="p-6 text-red-600">Failed to load dashboard data.</div>;
  }

  const { kpis, jobs_by_status, group_consolidated } = data;

  const statusChartData = jobs_by_status.map((item: any, index: number) => ({
    name: prettyStatus(item.status),
    value: Number(item.count),
    color: STATUS_COLORS[index % STATUS_COLORS.length],
  }));

  const inQuoting =
    jobs_by_status
      .filter((item: any) =>
        ['lead', 'brief', 'design', 'quote_sent', 'quote_approved', 'quoting'].includes(
          String(item.status).toLowerCase()
        )
      )
      .reduce((sum: number, item: any) => sum + Number(item.count), 0) || 0;

  const recentJobs = pipeline.slice(0, 5);

  return (
    <div className="space-y-5 p-5">
      {/* Demo-style hero */}
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
                Live System
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

      {/* Demo-style KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Active Jobs</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{kpis.active_jobs}</div>
          <div className="text-sm text-gray-400">In pipeline</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Total Jobs</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{kpis.total_jobs}</div>
          <div className="text-sm text-gray-400">All companies</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">In Quoting</div>
          <div className="mt-2 text-3xl font-black text-[#0800c8]">{inQuoting}</div>
          <div className="text-sm text-gray-400">Needs follow-up</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Low Stock</div>
          <div className="mt-2 text-3xl font-black text-red-600">{lowStockCount}</div>
          <div className="text-sm text-gray-400">Inventory alerts</div>
        </div>
      </div>

      {/* Jobs by status */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-black text-[#08005f]">Jobs by Status</h2>

        {statusChartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  align="right"
                  verticalAlign="middle"
                  layout="vertical"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-gray-400">
            No jobs found
          </div>
        )}
      </div>

      {/* Company cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {group_consolidated.map((co: GroupConsolidated) => {
          const color = COMPANY_COLORS[co.company] || '#0800c8';

          return (
            <div
              key={co.company_id}
              className="rounded-2xl border-t-4 bg-white p-5 shadow-sm"
              style={{ borderTopColor: color }}
            >
              <div className="mb-3 h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <div className="text-sm font-bold text-gray-700">{co.company}</div>
              <div className="mt-2 text-2xl font-black">{co.total_jobs ?? 0}</div>
              <div className="text-sm text-gray-400">{co.total_jobs ?? 0} jobs</div>
            </div>
          );
        })}
      </div>

      {/* Recent jobs */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-[#07005f] px-5 py-4 text-sm font-black uppercase text-white">
          Recent Jobs
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-4 text-left">Job #</th>
              <th className="px-5 py-4 text-left">Client</th>
              <th className="px-5 py-4 text-left">Job</th>
              <th className="px-5 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                  No recent jobs found
                </td>
              </tr>
            )}

            {recentJobs.map((job) => (
              <tr key={job.id} className="border-b last:border-b-0">
                <td className="px-5 py-4 font-mono text-xs text-gray-600">
                  {job.job_number}
                </td>
                <td className="px-5 py-4 font-semibold text-gray-700">
                  {job.client_name}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {job.title}
                </td>
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
