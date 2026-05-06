import { JobStatus, PaymentStatus } from '../types';
import { JOB_STATUSES } from '../utils/constants';

interface StatusBadgeProps {
  status: JobStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

<<<<<<< HEAD
const PAYMENT_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  partial:   'bg-blue-100 text-blue-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const jobStatus = JOB_STATUSES.find((s) => s.value === status);
  const color = jobStatus?.color || PAYMENT_COLORS[status] || 'bg-gray-100 text-gray-700';
  const label = jobStatus?.label || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}`}>
=======
const FALLBACK_STATUS: Record<string, { label: string; cls: string }> = {
  lead: { label: 'Lead', cls: 'bg-blue-100 text-blue-700' },
  brief: { label: 'Brief', cls: 'bg-indigo-100 text-indigo-700' },
  design: { label: 'Design', cls: 'bg-purple-100 text-purple-700' },
  quote: { label: 'Quote', cls: 'bg-yellow-100 text-yellow-700' },
  quote_sent: { label: 'Quote Sent', cls: 'bg-yellow-100 text-yellow-700' },
  quote_approved: { label: 'Quote Approved', cls: 'bg-cyan-100 text-cyan-700' },
  in_production: { label: 'In Production', cls: 'bg-blue-100 text-blue-700' },
  production: { label: 'Production', cls: 'bg-blue-100 text-blue-700' },
  installation: { label: 'Installation', cls: 'bg-emerald-100 text-emerald-700' },
  installed: { label: 'Installed', cls: 'bg-green-100 text-green-700' },
  invoiced: { label: 'Invoiced', cls: 'bg-orange-100 text-orange-700' },
  paid: { label: 'Paid', cls: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700' },
  partial: { label: 'Partial', cls: 'bg-blue-100 text-blue-700' },
  overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
};

function prettyLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const key = String(status || '').toLowerCase();
  const jobStatus = JOB_STATUSES.find((s) => s.value === status);
  const fallback = FALLBACK_STATUS[key];

  const color = jobStatus?.color || fallback?.cls || 'bg-gray-100 text-gray-700';
  const label = jobStatus?.label || fallback?.label || prettyLabel(String(status || 'Unknown'));

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${color} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
      {label}
    </span>
  );
}
