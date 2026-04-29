import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { toDemoJob } from '../utils/demoAdapters';

function zar(value: number) {
  return `R ${Number(value || 0).toLocaleString('en-ZA')}`;
}

function prettyDate(date?: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-ZA');
}

const STAGES = [
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

export default function JobDetailPage() {
  const { id } = useParams();

  const [jobRaw, setJobRaw] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        const job = jobRes.data;

        setJobRaw(job);

        const [clientRes, companyRes] = await Promise.all([
          api.get(`/clients/${job.client_id}`).catch(() => null),
          api.get(`/companies/${job.primary_company_id}`).catch(() => null),
        ]);

        setClient(clientRes?.data || null);
        setCompany(companyRes?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const job = useMemo(() => (jobRaw ? toDemoJob(jobRaw) : null), [jobRaw]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-400">Loading job…</div>;
  }

  if (!job) {
    return <div className="p-6 text-red-500">Job not found</div>;
  }

  const cost = Number(jobRaw.total_cost || jobRaw.cost_total || 0);
  const value = Number(job.value || 0);
  const margin =
    value > 0 ? (((value - cost) / value) * 100).toFixed(1) : '0';

  const currentStageIndex = STAGES.indexOf(String(job.status));

  return (
    <div className="space-y-5 p-5">
      {/* Header */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 font-mono">{job.num}</p>
            <h1 className="text-xl font-black text-gray-900">{job.client}</h1>
            <p className="text-sm text-gray-500 mt-1">{job.desc}</p>
          </div>

          <StatusBadge status={job.status} />
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <p className="text-sm font-bold text-gray-700 mb-3">Job Progress</p>

        <div className="flex flex-wrap gap-2">
          {STAGES.map((stage, index) => (
            <div
              key={stage}
              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                index <= currentStageIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stage.replace('_', ' ')}
            </div>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border">
          <p className="text-xs text-gray-400">Quote Value</p>
          <p className="text-lg font-black">
            {zar(jobRaw.quote_amount)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border">
          <p className="text-xs text-gray-400">Invoice Value</p>
          <p className="text-lg font-black">
            {zar(jobRaw.invoice_amount)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border">
          <p className="text-xs text-gray-400">Margin</p>
          <p className="text-lg font-black text-green-600">
            {margin}%
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl bg-white p-5 shadow-sm border">
        <p className="text-sm font-bold mb-3">Timeline</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>Lead: {prettyDate(jobRaw.lead_date)}</div>
          <div>Quote: {prettyDate(jobRaw.quote_date)}</div>
          <div>Approved: {prettyDate(jobRaw.quote_approved_date)}</div>
          <div>Production: {prettyDate(jobRaw.production_start)}</div>
          <div>Install: {prettyDate(jobRaw.installation_date)}</div>
          <div>Invoice: {prettyDate(jobRaw.invoice_date)}</div>
        </div>
      </div>

      {/* Client + Company */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-4 border">
          <p className="text-xs text-gray-400">Client</p>
          <p className="font-bold">
            {client?.company_name || client?.trading_name || 'Unknown'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 border">
          <p className="text-xs text-gray-400">Company</p>
          <p className="font-bold">
            {company?.name || company?.short_name}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl bg-white p-5 border">
        <p className="text-sm font-bold mb-2">Description</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {jobRaw.description || 'No description'}
        </p>
      </div>

      {/* Notes */}
      <div className="rounded-2xl bg-white p-5 border">
        <p className="text-sm font-bold mb-2">Internal Notes</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {jobRaw.internal_notes || 'No notes'}
        </p>
      </div>
    </div>
  );
}
