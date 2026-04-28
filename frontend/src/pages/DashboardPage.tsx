import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const statusData = [
  { name: 'In Production', value: 4, color: '#0500ff' },
  { name: 'Installation', value: 3, color: '#14b88a' },
  { name: 'Lead', value: 3, color: '#6366f1' },
  { name: 'Design', value: 2, color: '#f59e0b' },
  { name: 'Brief', value: 1, color: '#05005f' },
  { name: 'Quote Approved', value: 1, color: '#06b6d4' },
];

const recentJobs = [
  { job: 'SNS-00001', client: 'ERESA', status: 'In Production' },
  { job: 'SNS-00002', client: 'Garden Route Mall', status: 'Installation' },
  { job: 'SNS-00003', client: 'PNA George', status: 'Lead' },
];

export default function DashboardPage() {
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
              Applied Graphics and Visual Displays&nbsp;&nbsp; • &nbsp;&nbsp;Reg. No. 2022/4307/44/07
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

          <div className="ml-auto select-none text-7xl font-black italic tracking-tighter text-white/10">
            SIGNACORE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Active Jobs</div>
          <div className="mt-2 text-2xl font-black text-[#0800c8]">14</div>
          <div className="text-sm text-gray-400">In pipeline</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">Total Jobs</div>
          <div className="mt-2 text-2xl font-black text-[#0800c8]">14</div>
          <div className="text-sm text-gray-400">All companies</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="text-xs font-black uppercase tracking-wide text-gray-400">In Quoting</div>
          <div className="mt-2 text-2xl font-black text-[#0800c8]">6</div>
          <div className="text-sm text-gray-400">Needs follow-up</div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-black text-[#08005f]">Jobs by Status</h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={0}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                align="right"
                verticalAlign="middle"
                layout="vertical"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border-t-4 border-[#0500ff] bg-white p-5 shadow-sm">
          <div className="mb-3 h-3 w-3 rounded-full bg-[#0500ff]" />
          <div className="text-sm font-bold text-gray-700">Signacore</div>
          <div className="mt-2 text-2xl font-black">2</div>
          <div className="text-sm text-gray-400">2 jobs</div>
        </div>

        <div className="rounded-2xl border-t-4 border-purple-500 bg-white p-5 shadow-sm">
          <div className="mb-3 h-3 w-3 rounded-full bg-purple-500" />
          <div className="text-sm font-bold text-gray-700">Cover X</div>
          <div className="mt-2 text-2xl font-black">0</div>
          <div className="text-sm text-gray-400">0 jobs</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-[#07005f] px-5 py-4 text-sm font-black uppercase text-white">
          Recent Jobs
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wide text-gray-400">
              <th className="px-5 py-4 text-left">Job #</th>
              <th className="px-5 py-4 text-left">Client</th>
              <th className="px-5 py-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((job) => (
              <tr key={job.job} className="border-b last:border-b-0">
                <td className="px-5 py-4 font-mono text-xs text-gray-600">{job.job}</td>
                <td className="px-5 py-4 font-semibold text-gray-700">{job.client}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
