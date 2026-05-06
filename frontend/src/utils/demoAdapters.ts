export function toDemoCompany(company: any) {
  return {
    id: company.id,
    name: company.name,
    short: company.short_name || company.name,
    role: company.role,
    color: '#0000ff',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    raw: company,
  };
}

export function toDemoJob(job: any) {
  return {
    id: job.id,
    num: job.job_number,
    client: job.client_name || 'Unknown Client',
    desc: job.title || job.description || '',
    co: job.primary_company_id,
    status: job.status,
    stage: job.status,
    value: Number(job.invoice_amount || job.quote_amount || 0),
    deadline: job.deadline,
    breakdown: job.costs || [],
    raw: job,
  };
}

export function toDemoJobs(jobs: any[]) {
  return jobs.map(toDemoJob);
}

export function toDemoCompanies(companies: any[]) {
  return companies.map(toDemoCompany);
}

export const DONE_STATUSES = ['invoiced', 'paid', 'completed', 'complete', 'cancelled'];

export const WIP_STATUSES = [
  'lead',
  'brief',
  'design',
  'quote_sent',
  'quote_approved',
  'deposit_received',
  'in_production',
  'installation',
];

export const STATUS_META: Record<string, { label: string }> = {
  lead: { label: 'Lead' },
  brief: { label: 'Brief' },
  design: { label: 'Design' },
  quote_sent: { label: 'Quote Sent' },
  quote_approved: { label: 'Quote Approved' },
  deposit_received: { label: 'Deposit Received' },
  in_production: { label: 'In Production' },
  installation: { label: 'Installation' },
  invoiced: { label: 'Invoiced' },
  paid: { label: 'Paid' },
  completed: { label: 'Completed' },
};
