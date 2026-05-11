import { useState, useMemo } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { useData } from '../context/DataContext';

const DOCTORS = ['Dr. Ahmed Raza', 'Dr. Fatima Malik', 'Dr. Usman Tariq', 'Dr. Sadia Hussain', 'Dr. Bilal Chaudhry'];

export default function Prescriptions() {
  const { medicines, dispenses, addDispense } = useData();
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    patientName: '',
    patientId: '',
    doctorName: '',
    medicineId: '',
    qty: 1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMed = medicines.find(m => m.id === form.medicineId);

  const qtyExceedsStock = selectedMed ? form.qty > selectedMed.stockQty : false;

  const filteredDispenses = useMemo(() => {
    if (!search) return [...dispenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const q = search.toLowerCase();
    return [...dispenses].filter(d =>
      d.patientName.toLowerCase().includes(q) ||
      d.medicineName.toLowerCase().includes(q) ||
      d.doctorName.toLowerCase().includes(q)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dispenses, search]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.patientName.trim()) e.patientName = 'Required';
    if (!form.doctorName) e.doctorName = 'Required';
    if (!form.medicineId) e.medicineId = 'Required';
    if (!form.qty || form.qty < 1) e.qty = 'Must be at least 1';
    if (qtyExceedsStock) e.qty = 'Exceeds available stock';
    if (selectedMed?.status === 'Expired') e.medicineId = 'Cannot dispense expired medicine';
    return e;
  }

  function handleDispense() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    addDispense({
      patientName: form.patientName,
      patientId: form.patientId,
      doctorName: form.doctorName,
      medicineId: form.medicineId,
      medicineName: selectedMed?.name ?? '',
      qty: form.qty,
      date: new Date().toISOString(),
      dispensedBy: 'M. Hussain',
      notes: form.notes,
    });
    setForm({ patientName: '', patientId: '', doctorName: '', medicineId: '', qty: 1, notes: '' });
    setErrors({});
  }

  function formatDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) +
      ' ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Dispense Form */}
      <div className="col-span-2">
        <div className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="px-6 py-4" style={{ background: '#7C3AED' }}>
            <h2 className="text-base font-semibold text-white">Dispense Medicine</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                placeholder="Enter patient name"
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400 ${errors.patientName ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`} />
              {errors.patientName && <p className="text-xs text-red-500 mt-0.5">{errors.patientName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Patient ID</label>
              <input type="text" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                placeholder="e.g. PT-001"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <select value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${errors.doctorName ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`}>
                <option value="">Select Doctor</option>
                {DOCTORS.map(d => <option key={d}>{d}</option>)}
              </select>
              {errors.doctorName && <p className="text-xs text-red-500 mt-0.5">{errors.doctorName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Select Medicine <span className="text-red-500">*</span>
              </label>
              <select value={form.medicineId} onChange={e => setForm(f => ({ ...f, medicineId: e.target.value, qty: 1 }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${errors.medicineId ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`}>
                <option value="">Select Medicine</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id} disabled={m.status === 'Expired' || m.status === 'Out of Stock'}
                    style={{ color: m.status === 'Expired' ? '#9CA3AF' : undefined }}>
                    {m.name} (Stock: {m.stockQty}){m.status === 'Expired' ? ' — EXPIRED' : m.status === 'Out of Stock' ? ' — OUT OF STOCK' : ''}
                  </option>
                ))}
              </select>
              {errors.medicineId && <p className="text-xs text-red-500 mt-0.5">{errors.medicineId}</p>}
              {selectedMed && (
                <p className={`text-xs mt-1 font-medium ${selectedMed.stockQty === 0 ? 'text-red-500' : selectedMed.stockQty <= selectedMed.lowStockThreshold ? 'text-amber-600' : 'text-emerald-600'}`}>
                  Available: {selectedMed.stockQty} units
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: Number(e.target.value) }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${errors.qty || qtyExceedsStock ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`} />
              {qtyExceedsStock && <p className="text-xs text-red-500 mt-0.5">Exceeds available stock ({selectedMed?.stockQty} units)</p>}
              {errors.qty && !qtyExceedsStock && <p className="text-xs text-red-500 mt-0.5">{errors.qty}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400 resize-none" />
            </div>

            <button onClick={handleDispense}
              disabled={!form.patientName || !form.doctorName || !form.medicineId || form.qty < 1 || qtyExceedsStock}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press disabled:opacity-50 disabled:cursor-not-allowed">
              Dispense Medicine
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="col-span-3">
        <div className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-[#2D2B45]">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[#7C3AED]" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Dispense History</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                {dispenses.length} records
              </span>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-gray-50 dark:border-[#2D2B45]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient, medicine, doctor..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
                  {['ID', 'Patient', 'Doctor', 'Medicine', 'Qty', 'Date & Time', 'By'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDispenses.map((d, i) => (
                  <tr key={d.id}
                    className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                    style={{ background: i % 2 === 1 ? 'rgba(245,243,255,0.4)' : 'transparent' }}>
                    <td className="px-3 py-2.5 font-mono text-xs text-[#7C3AED]">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{d.patientName}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">{d.doctorName}</td>
                    <td className="px-3 py-2.5 text-gray-700 dark:text-gray-300">{d.medicineName}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-800 dark:text-gray-200">{d.qty}</td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{formatDate(d.date)}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">{d.dispensedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
