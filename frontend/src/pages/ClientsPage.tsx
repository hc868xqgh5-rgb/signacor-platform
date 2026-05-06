import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Client } from '../types';
import { formatDate } from '../utils/format';

interface NewClientForm {
  company_name: string; trading_name: string; contact_person: string;
  email: string; phone: string; mobile: string; address: string;
  city: string; province: string; postal_code: string;
  vat_no: string; payment_terms: string; notes: string;
}
const EMPTY: NewClientForm = {
  company_name: '', trading_name: '', contact_person: '',
  email: '', phone: '', mobile: '', address: '',
  city: '', province: '', postal_code: '',
  vat_no: '', payment_terms: '30', notes: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<NewClientForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3

  const fetchClients = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const res = await api.get('/clients', { params: { search: search || undefined, limit: 100 } });
      setClients(res.data.clients || []);
      setTotal(res.data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, [search]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await api.post('/clients', { ...form, payment_terms: parseInt(form.payment_terms) });
      setShowNew(false); setForm(EMPTY);
      navigate(`/clients/${res.data.id}`);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const f = (k: keyof NewClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} clients on record</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary">+ New Client</button>
      </div>

      <input
        type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by company name, contact or email…"
        className="input max-w-md"
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
      />

      {loading ? (
        <div className="flex justify-center py-16">
<<<<<<< HEAD
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-gray-500">No clients found. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(c => (
            <Link key={c.id} to={`/clients/${c.id}`}
              className="card p-5 hover:shadow-md hover:border-brand-300 transition-all block">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-700 font-bold text-sm">
                    {c.company_name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.company_name}</p>
                  {c.trading_name && <p className="text-xs text-gray-400">t/a {c.trading_name}</p>}
                  {c.contact_person && <p className="text-sm text-gray-600 mt-1">{c.contact_person}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {c.email && <span>✉ {c.email}</span>}
                    {c.phone && <span>☎ {c.phone}</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {c.city && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.city}</span>}
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Net {c.payment_terms} days</span>
                    {c.vat_no && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">VAT</span>}
                  </div>
                </div>
              </div>
            </Link>
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* New Client Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">New Client</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Company info */}
              <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Company Information</div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={form.company_name} onChange={f('company_name')} className="input" placeholder="ABC Motors (Pty) Ltd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trading Name</label>
                <input value={form.trading_name} onChange={f('trading_name')} className="input" placeholder="ABC Motors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VAT Number</label>
                <input value={form.vat_no} onChange={f('vat_no')} className="input" placeholder="4123456789" />
              </div>

              {/* Contact */}
              <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Contact Details</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input value={form.contact_person} onChange={f('contact_person')} className="input" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={f('email')} className="input" placeholder="john@abcmotors.co.za" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={f('phone')} className="input" placeholder="044 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input value={form.mobile} onChange={f('mobile')} className="input" placeholder="082 123 4567" />
              </div>

              {/* Address */}
              <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Address</div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input value={form.address} onChange={f('address')} className="input" placeholder="123 Main Street" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input value={form.city} onChange={f('city')} className="input" placeholder="George" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <select value={form.province} onChange={f('province')} className="input">
                  <option value="">Select province…</option>
                  {['Western Cape','Eastern Cape','Northern Cape','KwaZulu-Natal','Gauteng','Limpopo','Mpumalanga','North West','Free State'].map(p => (
=======
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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
<<<<<<< HEAD
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input value={form.postal_code} onChange={f('postal_code')} className="input" placeholder="6530" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (days)</label>
                <select value={form.payment_terms} onChange={f('payment_terms')} className="input">
                  {['0','7','14','21','30','45','60'].map(d => <option key={d} value={d}>Net {d} days</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={f('notes')} rows={3} className="input" placeholder="Any notes about this client…" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.company_name} className="btn-primary">
                {saving ? 'Creating…' : 'Create Client'}
=======

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
>>>>>>> 92d9217743a805f7dde9d718392ab63cc36c3be3
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
