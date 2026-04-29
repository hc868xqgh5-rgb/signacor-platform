import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Client } from '../types';

interface NewClientForm {
  company_name: string;
  trading_name: string;
  contact_person: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  vat_no: string;
  payment_terms: string;
  notes: string;
}

const EMPTY: NewClientForm = {
  company_name: '',
  trading_name: '',
  contact_person: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  province: '',
  postal_code: '',
  vat_no: '',
  payment_terms: '30',
  notes: '',
};

function getArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.clients)) return data.clients;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<NewClientForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', {
        params: { search: search || undefined, limit: 500 },
      });
      setClients(getArray(res.data));
    } catch (e) {
      console.error('Clients load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowNew(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      company_name: client.company_name || '',
      trading_name: client.trading_name || '',
      contact_person: client.contact_person || '',
      email: client.email || '',
      phone: client.phone || '',
      mobile: client.mobile || '',
      address: client.address || '',
      city: client.city || '',
      province: client.province || '',
      postal_code: client.postal_code || '',
      vat_no: client.vat_no || '',
      payment_terms: String(client.payment_terms || '30'),
      notes: client.notes || '',
    });
    setShowNew(true);
  };

  const handleSave = async () => {
    if (!form.company_name.trim()) return;

    setSaving(true);

    try {
      const payload = {
        ...form,
        company_name: form.company_name.trim(),
        payment_terms: parseInt(form.payment_terms || '30', 10),
      };

      if (editing) {
        await api.put(`/clients/${editing.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }

      setShowNew(false);
      setEditing(null);
      setForm(EMPTY);
      await fetchClients();
    } catch (e) {
      console.error('Save client error:', e);
      alert('Could not save customer.');
    } finally {
      setSaving(false);
    }
  };

  const f =
    (k: keyof NewClientForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      String(c.company_name || '').toLowerCase().includes(q) ||
      String(c.trading_name || '').toLowerCase().includes(q) ||
      String(c.contact_person || '').toLowerCase().includes(q) ||
      String(c.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Customers</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            {clients.length} customer{clients.length !== 1 ? 's' : ''} on file
          </p>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-xl bg-[#0000ff] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#06065c]"
        >
          🏢 New Customer
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by company, contact or email…"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mb-3 text-4xl">🏢</div>
          <p className="font-semibold text-gray-500">
            {clients.length === 0 ? 'No customers yet' : 'No matches found'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {clients.length === 0
              ? 'Click "New Customer" to add your first client.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-sm font-black text-blue-700">
                  {(c.company_name || '?').substring(0, 1).toUpperCase()}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800">{c.company_name}</p>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  {c.contact_person && (
                    <span className="text-xs text-gray-500">👤 {c.contact_person}</span>
                  )}
                  {c.email && <span className="text-xs text-gray-500">✉️ {c.email}</span>}
                  {c.phone && <span className="text-xs text-gray-500">📞 {c.phone}</span>}
                  {c.mobile && <span className="text-xs text-gray-500">📱 {c.mobile}</span>}
                  {c.vat_no && <span className="text-xs text-gray-400">VAT: {c.vat_no}</span>}
                </div>

                {c.address && (
                  <p className="mt-0.5 truncate text-xs text-gray-400">📍 {c.address}</p>
                )}

                {c.notes && (
                  <p className="mt-0.5 truncate text-xs text-amber-600">💬 {c.notes}</p>
                )}
              </div>

              <button
                onClick={() => openEdit(c)}
                className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editing ? 'Edit Customer' : 'New Customer'}
                </h2>
                <p className="text-xs text-gray-400">
                  {editing ? 'Update customer details' : 'Add a new customer record'}
                </p>
              </div>

              <button
                onClick={() => setShowNew(false)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Company Information
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  value={form.company_name}
                  onChange={f('company_name')}
                  className="input"
                  placeholder="ABC Motors (Pty) Ltd"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Trading Name
                </label>
                <input
                  value={form.trading_name}
                  onChange={f('trading_name')}
                  className="input"
                  placeholder="ABC Motors"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  VAT Number
                </label>
                <input
                  value={form.vat_no}
                  onChange={f('vat_no')}
                  className="input"
                  placeholder="4123456789"
                />
              </div>

              <div className="col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contact Details
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  value={form.contact_person}
                  onChange={f('contact_person')}
                  className="input"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={f('email')}
                  className="input"
                  placeholder="john@abcmotors.co.za"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={f('phone')}
                  className="input"
                  placeholder="044 123 4567"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mobile
                </label>
                <input
                  value={form.mobile}
                  onChange={f('mobile')}
                  className="input"
                  placeholder="082 123 4567"
                />
              </div>

              <div className="col-span-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Address
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  value={form.address}
                  onChange={f('address')}
                  className="input"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input
                  value={form.city}
                  onChange={f('city')}
                  className="input"
                  placeholder="George"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Province
                </label>
                <select value={form.province} onChange={f('province')} className="input">
                  <option value="">Select province…</option>
                  {[
                    'Western Cape',
                    'Eastern Cape',
                    'Northern Cape',
                    'KwaZulu-Natal',
                    'Gauteng',
                    'Limpopo',
                    'Mpumalanga',
                    'North West',
                    'Free State',
                  ].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Postal Code
                </label>
                <input
                  value={form.postal_code}
                  onChange={f('postal_code')}
                  className="input"
                  placeholder="6530"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Terms
                </label>
                <select value={form.payment_terms} onChange={f('payment_terms')} className="input">
                  {['0', '7', '14', '21', '30', '45', '60'].map((d) => (
                    <option key={d} value={d}>
                      Net {d} days
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={f('notes')}
                  rows={3}
                  className="input"
                  placeholder="Any notes about this customer…"
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <button onClick={() => setShowNew(false)} className="btn-secondary">
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !form.company_name}
                className="btn-primary"
              >
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
