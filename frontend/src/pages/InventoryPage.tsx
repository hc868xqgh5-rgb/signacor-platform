import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

function getArray(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.materials)) return data.materials;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<'stock' | 'products'>('stock');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/inventory/materials', {
        params: { limit: 500 },
      });
      setItems(getArray(res.data));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const filtered = items.filter(i => {
    if (category && i.category !== category) return false;
    const q = search.toLowerCase();
    return (
      !q ||
      i.name?.toLowerCase().includes(q) ||
      i.sku?.toLowerCase().includes(q)
    );
  });

  const lowStock = items.filter(
    i => (i.reorder_level ?? 0) > 0 && (i.stock_qty ?? 0) <= (i.reorder_level ?? 0)
  );

  return (
    <div className="p-4 space-y-4">

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('stock')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === 'stock'
              ? 'bg-[#0000ff] text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          📦 Stock Items
        </button>

        <button
          onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-xl text-sm font-bold ${
            tab === 'products'
              ? 'bg-[#0000ff] text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          🧱 Complete Products
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
        <b>Stock View — Read Only</b><br />
        You can see stock levels and reorder status. Pricing and editing are restricted to admin.
      </div>

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          ⚠ Low Stock — {lowStock.length} items below reorder level
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-gray-400">Total SKUs</p>
          <p className="text-lg font-black">{items.length}</p>
        </div>

        <div className="bg-white border rounded-xl p-3">
          <p className="text-xs text-gray-400">Low Stock</p>
          <p className="text-lg font-black text-red-500">{lowStock.length}</p>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by item name, SKU..."
        className="w-full border rounded-xl px-3 py-2 text-sm"
      />

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={`px-3 py-1 text-xs rounded-full ${
            category === null ? 'bg-black text-white' : 'bg-gray-100'
          }`}
        >
          All
        </button>

        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 text-xs rounded-full ${
              category === c ? 'bg-[#0000ff] text-white' : 'bg-gray-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Reorder</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(item => {
              const low =
                (item.reorder_level ?? 0) > 0 &&
                (item.stock_qty ?? 0) <= item.reorder_level;

              return (
                <tr key={item.id} className="border-t">
                  <td className="p-2 font-medium">{item.name}</td>
                  <td className="p-2 text-gray-400">{item.sku}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.stock_qty}</td>
                  <td className="p-2">{item.reorder_level}</td>
                  <td className="p-2">
                    {low ? (
                      <span className="text-red-500 font-bold">
                        Reorder
                      </span>
                    ) : (
                      <span className="text-green-600">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Loading inventory...
        </div>
      )}
    </div>
  );
}
