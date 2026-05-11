import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { Medicine } from '../data/sampleData';
import { getMedicineStatus } from '../data/sampleData';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

type SortKey = keyof Medicine;
type SortDir = 'asc' | 'desc';

const CATEGORIES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Cream', 'Drop', 'Powder', 'Sachet'];
const STATUSES = ['In Stock', 'Low Stock', 'Expired', 'Out of Stock'];

const emptyForm = (): Omit<Medicine, 'id' | 'status'> => ({
  name: '', category: 'Tablet', manufacturer: '', supplierId: '',
  dosageForm: 'Tablet', strength: '', unitPrice: 0, stockQty: 0,
  lowStockThreshold: 20, expiryDate: '', batchNo: '', description: '',
});

export default function Medicines() {
  const { medicines, suppliers, addMedicine, updateMedicine, deleteMedicine } = useData();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [viewMed, setViewMed] = useState<Medicine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let list = [...medicines];
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase()) || m.manufacturer.toLowerCase().includes(search.toLowerCase()));
    if (catFilter) list = list.filter(m => m.category === catFilter);
    if (statusFilter) list = list.filter(m => m.status === statusFilter);
    list.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [medicines, search, catFilter, statusFilter, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#7C3AED]" /> : <ChevronDown size={12} className="text-[#7C3AED]" />;
  }

  function openAdd() { setForm(emptyForm()); setEditMed(null); setErrors({}); setShowModal(true); }
  function openEdit(m: Medicine) { setForm({ ...m }); setEditMed(m); setErrors({}); setShowModal(true); }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.manufacturer.trim()) e.manufacturer = 'Required';
    if (!form.unitPrice || form.unitPrice <= 0) e.unitPrice = 'Must be > 0';
    if (form.stockQty < 0) e.stockQty = 'Cannot be negative';
    if (!form.expiryDate) e.expiryDate = 'Required';
    if (!form.batchNo.trim()) e.batchNo = 'Required';
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const status = getMedicineStatus(form as Omit<Medicine, 'status'>);
    if (editMed) updateMedicine({ ...form, id: editMed.id, status } as Medicine);
    else addMedicine({ ...form, status } as Omit<Medicine, 'id'>);
    setShowModal(false);
  }

  const inStock = medicines.filter(m => m.status === 'In Stock').length;
  const lowStock = medicines.filter(m => m.status === 'Low Stock').length;
  const expired = medicines.filter(m => m.status === 'Expired').length;

  return (
    <div>
      {/* Mini stats */}
      <div className="flex gap-4 mb-5">
        {[
          { label: 'Total', value: medicines.length, color: '#7C3AED' },
          { label: 'In Stock', value: inStock, color: '#059669' },
          { label: 'Low Stock', value: lowStock, color: '#D97706' },
          { label: 'Expired', value: expired, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 bg-white dark:bg-[#1A1730] rounded-xl px-4 py-3 shadow-sm border border-transparent dark:border-[#2D2B45]">
            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{s.label}:</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, category..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
                {[
                  { label: '#', key: 'id' }, { label: 'Medicine', key: 'name' },
                  { label: 'Category', key: 'category' }, { label: 'Manufacturer', key: 'manufacturer' },
                  { label: 'Price', key: 'unitPrice' }, { label: 'Stock', key: 'stockQty' },
                  { label: 'Threshold', key: 'lowStockThreshold' }, { label: 'Expiry', key: 'expiryDate' },
                  { label: 'Status', key: 'status' }, { label: 'Actions', key: null },
                ].map(({ label, key }) => (
                  <th key={label}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${key ? 'cursor-pointer select-none hover:text-[#7C3AED]' : ''}`}
                    onClick={() => key && sort(key as SortKey)}>
                    <div className="flex items-center gap-1">
                      {label} {key && <SortIcon k={key as SortKey} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((m, i) => (
                <tr key={m.id}
                  className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                  style={{
                    background: m.status === 'Expired' ? '#FFF5F5' : i % 2 === 1 ? 'rgba(245,243,255,0.4)' : 'transparent',
                  }}>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.category}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.manufacturer}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Rs.{m.unitPrice}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${m.stockQty <= m.lowStockThreshold ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {m.stockQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.lowStockThreshold}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(m.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewMed(m)} className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#2D2B45] transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(m)} className="p-1.5 rounded text-[#7C3AED] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 dark:border-[#2D2B45]">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#2D2B45] rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Previous
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${p === page ? 'bg-[#7C3AED] text-white' : 'border border-gray-200 dark:border-[#2D2B45] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252240]'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#2D2B45] rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editMed ? 'Edit Medicine' : 'Add New Medicine'} onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Medicine Name', key: 'name', type: 'text', required: true },
              { label: 'Batch No', key: 'batchNo', type: 'text', required: true },
              { label: 'Manufacturer', key: 'manufacturer', type: 'text', required: true },
              { label: 'Strength', key: 'strength', type: 'text' },
              { label: 'Unit Price (Rs.)', key: 'unitPrice', type: 'number', required: true },
              { label: 'Stock Quantity', key: 'stockQty', type: 'number', required: true },
              { label: 'Low Stock Threshold', key: 'lowStockThreshold', type: 'number' },
              { label: 'Expiry Date', key: 'expiryDate', type: 'date', required: true },
            ].map(({ label, key, type, required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input type={type} value={(form as Record<string, unknown>)[key] as string}
                  onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${errors[key] ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`} />
                {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
              <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.company}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none" />
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 dark:border-[#2D2B45]">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2D2B45] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="px-5 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press">
              {editMed ? 'Save Changes' : 'Save Medicine'}
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {viewMed && (
        <Modal title="Medicine Details" onClose={() => setViewMed(null)}>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Name', viewMed.name], ['Category', viewMed.category], ['Manufacturer', viewMed.manufacturer],
              ['Batch No', viewMed.batchNo], ['Unit Price', `Rs.${viewMed.unitPrice}`],
              ['Stock Qty', viewMed.stockQty], ['Low Stock Threshold', viewMed.lowStockThreshold],
              ['Expiry Date', viewMed.expiryDate], ['Dosage Form', viewMed.dosageForm], ['Strength', viewMed.strength],
            ].map(([label, value]) => (
              <div key={label as string} className="text-sm">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-gray-800 dark:text-gray-200 font-medium">{String(value) || '—'}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Status</div>
            <StatusBadge status={viewMed.status} />
          </div>
          {viewMed.description && (
            <div className="mt-3 text-sm">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Description</div>
              <div className="text-gray-700 dark:text-gray-300">{viewMed.description}</div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Medicine"
          message="Are you sure you want to delete this medicine? This action cannot be undone."
          onConfirm={() => { deleteMedicine(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
}
