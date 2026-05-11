import { useState, useMemo } from 'react';
import { Search, Plus, Eye, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import type { PurchaseOrder, OrderItem } from '../data/sampleData';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

export default function PurchaseOrders() {
  const { orders, suppliers, medicines, addOrder, markOrderDelivered } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<keyof PurchaseOrder>('orderDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDeliverId, setConfirmDeliverId] = useState<string | null>(null);

  // Create order form
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    items: [] as OrderItem[],
  });
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search) list = list.filter(o =>
      o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) list = list.filter(o => o.status === statusFilter);
    list.sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  function sort(key: keyof PurchaseOrder) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ k }: { k: keyof PurchaseOrder }) {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#7C3AED]" /> : <ChevronDown size={12} className="text-[#7C3AED]" />;
  }

  function addItemRow() {
    setNewOrder(o => ({ ...o, items: [...o.items, { medicineId: '', medicineName: '', qty: 1, unitPrice: 0 }] }));
  }

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setNewOrder(o => {
      const items = [...o.items];
      if (field === 'medicineId') {
        const med = medicines.find(m => m.id === value);
        items[idx] = { ...items[idx], medicineId: String(value), medicineName: med?.name ?? '', unitPrice: med?.unitPrice ?? 0 };
      } else {
        (items[idx] as unknown as Record<string, unknown>)[field] = value;
      }
      return { ...o, items };
    });
  }

  function removeItem(idx: number) {
    setNewOrder(o => ({ ...o, items: o.items.filter((_, i) => i !== idx) }));
  }

  function validateOrder() {
    const e: Record<string, string> = {};
    if (!newOrder.supplierId) e.supplierId = 'Required';
    if (!newOrder.expectedDelivery) e.expectedDelivery = 'Required';
    if (!newOrder.items.length) e.items = 'Add at least one item';
    return e;
  }

  function handleCreate() {
    const e = validateOrder();
    if (Object.keys(e).length) { setOrderErrors(e); return; }
    const supplier = suppliers.find(s => s.id === newOrder.supplierId);
    const totalValue = newOrder.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
    addOrder({
      supplierId: newOrder.supplierId,
      supplierName: supplier?.company ?? '',
      orderDate: newOrder.orderDate,
      expectedDelivery: newOrder.expectedDelivery,
      actualDelivery: '',
      status: 'Pending',
      totalValue,
      items: newOrder.items,
    });
    setShowCreate(false);
    setNewOrder({ supplierId: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', items: [] });
    setOrderErrors({});
  }

  const pending = orders.filter(o => o.status === 'Pending').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const cancelled = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-4 mb-5">
        {[
          { label: 'Pending', value: pending, color: '#D97706' },
          { label: 'Delivered', value: delivered, color: '#059669' },
          { label: 'Cancelled', value: cancelled, color: '#DC2626' },
          { label: 'Total', value: orders.length, color: '#7C3AED' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by supplier or order ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] placeholder-gray-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#1A1730] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
          <option value="">All Status</option>
          <option>Pending</option><option>Delivered</option><option>Cancelled</option>
        </select>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press">
          <Plus size={16} /> Create Order
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
                  { label: 'Order ID', key: 'id' }, { label: 'Supplier', key: 'supplierName' },
                  { label: 'Order Date', key: 'orderDate' }, { label: 'Expected Delivery', key: 'expectedDelivery' },
                  { label: 'Actual Delivery', key: 'actualDelivery' }, { label: 'Status', key: 'status' },
                  { label: 'Total Value', key: 'totalValue' }, { label: 'Actions', key: null },
                ].map(({ label, key }) => (
                  <th key={label} onClick={() => key && sort(key as keyof PurchaseOrder)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap ${key ? 'cursor-pointer hover:text-[#7C3AED]' : ''}`}>
                    <div className="flex items-center gap-1">
                      {label} {key && <SortIcon k={key as keyof PurchaseOrder} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}
                  className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                  style={{ opacity: o.status === 'Cancelled' ? 0.7 : 1 }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#7C3AED]">
                    <span style={{ textDecoration: o.status === 'Cancelled' ? 'line-through' : 'none' }}>{o.id}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{o.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(o.orderDate).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(o.expectedDelivery).toLocaleDateString('en-GB')}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.actualDelivery ? new Date(o.actualDelivery).toLocaleDateString('en-GB') : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">Rs.{o.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewOrder(o)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2D2B45] rounded hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
                        <Eye size={12} /> View
                      </button>
                      {o.status === 'Pending' && (
                        <button onClick={() => setConfirmDeliverId(o.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#059669] hover:bg-emerald-700 rounded transition-colors">
                          <CheckCircle size={12} /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Modal */}
      {viewOrder && (
        <Modal title={`Order ${viewOrder.id} — Details`} onClose={() => setViewOrder(null)}>
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Supplier</span><span className="font-medium text-gray-800 dark:text-white">{viewOrder.supplierName}</span></div>
            <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Status</span><StatusBadge status={viewOrder.status} /></div>
            <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Order Date</span><span className="text-gray-700 dark:text-gray-300">{viewOrder.orderDate}</span></div>
            <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Expected Delivery</span><span className="text-gray-700 dark:text-gray-300">{viewOrder.expectedDelivery}</span></div>
            {viewOrder.actualDelivery && <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Actual Delivery</span><span className="text-gray-700 dark:text-gray-300">{viewOrder.actualDelivery}</span></div>}
            <div><span className="text-xs text-gray-500 dark:text-gray-400 uppercase block mb-0.5">Total Value</span><span className="font-bold text-gray-900 dark:text-white">Rs.{viewOrder.totalValue.toLocaleString()}</span></div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Order Items</div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-[#1F1C35]">
                {['Medicine', 'Qty', 'Unit Price', 'Total'].map(h => <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 dark:text-gray-400">{h}</th>)}
              </tr></thead>
              <tbody>
                {viewOrder.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-50 dark:border-[#2D2B45]">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.medicineName}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.qty}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">Rs.{item.unitPrice}</td>
                    <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200">Rs.{(item.qty * item.unitPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <Modal title="Create Purchase Order" onClose={() => setShowCreate(false)}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Supplier <span className="text-red-500">*</span></label>
              <select value={newOrder.supplierId} onChange={e => setNewOrder(o => ({ ...o, supplierId: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${orderErrors.supplierId ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`}>
                <option value="">Select Supplier</option>
                {suppliers.filter(s => s.status === 'Active').map(s => <option key={s.id} value={s.id}>{s.company}</option>)}
              </select>
              {orderErrors.supplierId && <p className="text-xs text-red-500 mt-0.5">{orderErrors.supplierId}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Order Date</label>
              <input type="date" value={newOrder.orderDate} onChange={e => setNewOrder(o => ({ ...o, orderDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expected Delivery <span className="text-red-500">*</span></label>
              <input type="date" value={newOrder.expectedDelivery} onChange={e => setNewOrder(o => ({ ...o, expectedDelivery: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] ${orderErrors.expectedDelivery ? 'border-red-400' : 'border-gray-200 dark:border-[#2D2B45]'}`} />
              {orderErrors.expectedDelivery && <p className="text-xs text-red-500 mt-0.5">{orderErrors.expectedDelivery}</p>}
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Order Items <span className="text-red-500">*</span></span>
              <button onClick={addItemRow} className="text-xs font-medium text-[#7C3AED] hover:text-[#5B21B6]">+ Add Item</button>
            </div>
            {orderErrors.items && <p className="text-xs text-red-500 mb-2">{orderErrors.items}</p>}
            {newOrder.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                <div className="col-span-2">
                  <select value={item.medicineId} onChange={e => updateItem(idx, 'medicineId', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-[#2D2B45] rounded bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]">
                    <option value="">Select Medicine</option>
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <input type="number" min="1" value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} placeholder="Qty"
                  className="px-2 py-1.5 text-xs border border-gray-200 dark:border-[#2D2B45] rounded bg-white dark:bg-[#252240] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Rs.{(item.qty * item.unitPrice).toLocaleString()}</span>
                  <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 ml-auto">×</button>
                </div>
              </div>
            ))}
            {newOrder.items.length > 0 && (
              <div className="text-right text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
                Total: Rs.{newOrder.items.reduce((s, i) => s + i.qty * i.unitPrice, 0).toLocaleString()}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 dark:border-[#2D2B45]">
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2D2B45] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate}
              className="px-5 py-2 text-sm font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg shadow-sm transition-colors btn-press">
              Create Order
            </button>
          </div>
        </Modal>
      )}

      {confirmDeliverId && (
        <ConfirmDialog
          title="Mark Order as Delivered"
          message="Confirm that this order has been received and delivered?"
          onConfirm={() => { markOrderDelivered(confirmDeliverId); setConfirmDeliverId(null); }}
          onCancel={() => setConfirmDeliverId(null)}
          confirmLabel="Mark Delivered"
          danger={false}
        />
      )}
    </div>
  );
}
