import { Download, Phone } from 'lucide-react';
import { useData } from '../context/DataContext';

const TODAY = new Date('2026-05-09');

function daysUntil(dateStr: string) {
  const exp  = new Date(dateStr);
  const diff = Math.floor((exp.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function ExpiryAlerts() {
  const { medicines, suppliers } = useData();

  const expired = medicines.filter(m => daysUntil(m.expiryDate) < 0);
  const in7     = medicines.filter(m => { const d = daysUntil(m.expiryDate); return d >= 0 && d <= 7; });
  const in30    = medicines.filter(m => { const d = daysUntil(m.expiryDate); return d > 7 && d <= 30; });

  function getSupplier(supplierId: string) {
    return suppliers.find(s => s.id === supplierId);
  }

  function overdueDays(dateStr: string) {
    return Math.abs(daysUntil(dateStr));
  }

  // ── Export all expiry alerts as CSV ──────────────────────────────────────
  function exportExpiryReport() {
    const allAlerts = [...expired, ...in7, ...in30];

    if (!allAlerts.length) {
      alert('No expiry alerts to export.');
      return;
    }

    const rows = allAlerts.map(m => {
      const days = daysUntil(m.expiryDate);
      const sup  = getSupplier(m.supplierId);
      return {
        Medicine:       m.name,
        Batch_No:       m.batchNo,
        Stock_Qty:      m.stockQty,
        Expiry_Date:    m.expiryDate,
        Days:           days,
        Urgency:        days < 0
                          ? 'EXPIRED'
                          : days <= 7
                          ? 'EXPIRING IN 7 DAYS'
                          : 'EXPIRING IN 30 DAYS',
        Supplier:       sup?.company  ?? '—',
        Supplier_Phone: sup?.phone    ?? '—',
      };
    });

    const headers    = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => {
          const val = String((row as Record<string, unknown>)[h] ?? '');
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `expiry_alerts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Section table component ───────────────────────────────────────────────
  function SectionTable({ items, rowBg }: { items: typeof medicines; rowBg: string }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
              {['Medicine', 'Batch', 'Stock', 'Expiry Date', 'Days', 'Supplier', 'Phone', 'Action'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(m => {
              const sup  = getSupplier(m.supplierId);
              const days = daysUntil(m.expiryDate);
              return (
                <tr
                  key={m.id}
                  className="border-t border-gray-100 dark:border-[#2D2B45]"
                  style={{ background: rowBg }}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{m.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{m.batchNo}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{m.stockQty}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {new Date(m.expiryDate).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {days < 0
                      ? <span className="text-xs font-bold text-red-700">{overdueDays(m.expiryDate)} days overdue</span>
                      : <span className="text-xs font-semibold text-amber-700">{days} days left</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{sup?.company ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                      <Phone size={11} />
                      {sup?.phone ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg transition-colors">
                      Reorder
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor medicine expiry dates and take timely action
          </p>
        </div>
        {/* ✅ Export button — now wired up */}
        <button
          onClick={exportExpiryReport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors btn-press">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border-l-4 border-red-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="text-3xl font-bold text-red-600 mb-1">{expired.length}</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Already Expired</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Immediate action required</div>
        </div>
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border-l-4 border-orange-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="text-3xl font-bold text-orange-600 mb-1">{in7.length}</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expiring in 7 Days</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Order replacement urgently</div>
        </div>
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border-l-4 border-yellow-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="text-3xl font-bold text-yellow-600 mb-1">{in30.length}</div>
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expiring in 30 Days</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Plan restock this month</div>
        </div>
      </div>

      {/* Section 1 — Expired */}
      {expired.length > 0 && (
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm overflow-hidden mb-5 border-l-4 border-l-red-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-6 py-3" style={{ background: '#FEF2F2' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">&#128308;</span>
              <span className="font-semibold text-red-800">
                Already Expired — {expired.length} medicine{expired.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-red-600 mt-0.5">
              Immediate action required — these medicines must be removed from stock
            </div>
          </div>
          <SectionTable items={expired} rowBg="#FFF5F5" />
        </div>
      )}

      {/* Section 2 — 7 days */}
      {in7.length > 0 && (
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm overflow-hidden mb-5 border-l-4 border-l-orange-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-6 py-3" style={{ background: '#FFF7ED' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">&#128992;</span>
              <span className="font-semibold text-orange-800">
                Expiring in 7 Days — {in7.length} medicine{in7.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-orange-600 mt-0.5">Order replacement stock urgently</div>
          </div>
          <SectionTable items={in7} rowBg="#FFFBEB" />
        </div>
      )}

      {/* Section 3 — 30 days */}
      {in30.length > 0 && (
        <div
          className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm overflow-hidden border-l-4 border-l-yellow-500"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-6 py-3" style={{ background: '#FEFCE8' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm">&#128993;</span>
              <span className="font-semibold text-yellow-800">
                Expiring in 30 Days — {in30.length} medicine{in30.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-yellow-700 mt-0.5">Plan restock within this month</div>
          </div>
          <SectionTable items={in30} rowBg="#FEFCE8" />
        </div>
      )}

      {/* Empty state */}
      {expired.length === 0 && in7.length === 0 && in30.length === 0 && (
        <div className="bg-white dark:bg-[#1A1730] rounded-xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-3">&#10003;</div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            All medicines are within expiry dates
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">No expiry alerts at this time</div>
        </div>
      )}
    </div>
  );
}