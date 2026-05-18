import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  getSuppliers,
  createSupplier,
  updateSupplier as updateSupplierAPI,
  deleteSupplier as deleteSupplierAPI,
} from '../api/services';
import type { Supplier } from '../data/sampleData';
import Modal         from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge   from '../components/StatusBadge';

type SortKey = keyof Supplier;

const emptyForm = (): Omit<Supplier, 'id'> => ({
  company: '', contactPerson: '', phone: '',
  email: '', city: '', address: '', status: 'Active',
});

export default function Suppliers() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search,    setSearch]    = useState('');
  const [sortKey,   setSortKey]   = useState<SortKey>('company');
  const [sortDir,   setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [page,      setPage]      = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editSup,   setEditSup]   = useState<Supplier | null>(null);
  const [deleteId,  setDeleteId]  = useState<string | null>(null);
  const [form,      setForm]      = useState(emptyForm());
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);

  const PER_PAGE = 10;

  // ── Fetch suppliers from MySQL ─────────────────────────────────────────────
  async function refreshSuppliers() {
    try {
      const res = await getSuppliers();
      // Map MySQL snake_case to frontend camelCase Supplier interface
      const mapped: Supplier[] = res.data.map((s: {
        supplier_id:    number;
        company_name:   string;
        contact_person: string;
        phone:          string;
        email:          string;
        city:           string;
        address:        string;
        is_active:      number | boolean;
      }) => ({
        id:            String(s.supplier_id),
        company:       s.company_name,
        contactPerson: s.contact_person,
        phone:         s.phone,
        email:         s.email,
        city:          s.city,
        address:       s.address ?? '',
        status:        s.is_active ? 'Active' : 'Inactive',
      }));
      setSuppliers(mapped);
    } catch (err) {
      console.error('Failed to load suppliers from MySQL:', err);
    }
  }

  useEffect(() => {
    refreshSuppliers();
  }, []);

  // ── Filtering & sorting ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...suppliers];
    if (search) list = list.filter(s =>
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [suppliers, search, sortKey, sortDir]);

  const pages     = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Sort helper ───────────────────────────────────────────────────────────
  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp   size={12} className="text-[#7C3AED]" />
      : <ChevronDown size={12} className="text-[#7C3AED]" />;
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAdd()             { setForm(emptyForm()); setEditSup(null); setErrors({}); setShowModal(true); }
  function openEdit(s: Supplier) { setForm({ ...s });    setEditSup(s);    setErrors({}); setShowModal(true); }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!form.company.trim())       e.company       = 'Required';
    if (!form.contactPerson.trim()) e.contactPerson = 'Required';
    if (!form.phone.trim())         e.phone         = 'Required';
    if (!form.email.trim())         e.email         = 'Required';
    if (!form.city.trim())          e.city          = 'Required';
    return e;
  }

  // ── Save — INSERT or UPDATE to MySQL ──────────────────────────────────────
  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      if (editSup) {
        // UPDATE — PUT /api/suppliers/:id
        await updateSupplierAPI(Number(editSup.id), {
          company_name:   form.company,
          contact_person: form.contactPerson,
          phone:          form.phone,
          email:          form.email,
          city:           form.city,
          address:        form.address,
          is_active:      form.status === 'Active' ? 1 : 0,
        });
      } else {
        // INSERT — POST /api/suppliers
        await createSupplier({
          company_name:   form.company,
          contact_person: form.contactPerson,
          phone:          form.phone,
          email:          form.email,
          city:           form.city,
          address:        form.address,
        });
      }
      // Refresh table from MySQL after save
      await refreshSuppliers();
      setShowModal(false);
    } catch (err) {
      console.error('Save supplier failed:', err);
      alert('Failed to save supplier. Check browser console for details.');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete from MySQL ─────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteSupplierAPI(Number(deleteId));
      await refreshSuppliers();
    } catch (err) {
      console.error('Delete supplier failed:', err);
      alert('Failed to delete supplier. It may be linked to existing medicines or orders.');
    } finally {
      setDeleteId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search suppliers..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Table */}
      <div
        className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
                {[
                  { label: '#',              key: null            },
                  { label: 'Company',        key: 'company'       },
                  { label: 'Contact Person', key: 'contactPerson' },
                  { label: 'Phone',          key: 'phone'         },
                  { label: 'Email',          key: 'email'         },
                  { label: 'City',           key: 'city'          },
                  { label: 'Status',         key: 'status'        },
                  { label: 'Actions',        key: null            },
                ].map(({ label, key }) => (
                  <th
                    key={label}
                    onClick={() => key && sort(key as SortKey)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${key ? 'cursor-pointer hover:text-[#7C3AED]' : ''}`}>
                    <div className="flex items-center gap-1">
                      {label} {key && <SortIcon k={key as SortKey} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    Loading suppliers from database...
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                  style={{ opacity: s.status === 'Inactive' ? 0.7 : 1 }}>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{s.company}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.contactPerson}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 rounded text-[#7C3AED] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#2D2B45] rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Previous
            </button>
            <button
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-[#2D2B45] rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editSup ? 'Edit Supplier' : 'Add Supplier'}
          onClose={() => setShowModal(false)}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Company Name',   key: 'company',       required: true  },
              { label: 'Contact Person', key: 'contactPerson', required: true  },
              { label: 'Phone',          key: 'phone',         required: true  },
              { label: 'Email',          key: 'email',         required: true  },
              { label: 'City',           key: 'city',          required: true  },
              { label: 'Address',        key: 'address',       required: false },
            ].map(({ label, key, required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${errors[key] ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`}
                />
                {errors[key] && <p className="text-xs text-red-500 mt-0.5">{errors[key]}</p>}
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Supplier['status'] }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 dark:border-[#2D2B45]">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2D2B45] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press disabled:opacity-60">
              {saving ? 'Saving...' : editSup ? 'Save Changes' : 'Save Supplier'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <ConfirmDialog
          title="Delete Supplier"
          message="Are you sure you want to delete this supplier? This may affect linked medicines and orders."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
}