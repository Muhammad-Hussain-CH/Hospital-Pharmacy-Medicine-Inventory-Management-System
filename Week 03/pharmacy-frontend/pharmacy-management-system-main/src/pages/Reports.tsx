import { useState } from 'react';
import { FileText, AlertTriangle, Truck, Calendar, Download, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Reports() {
  const { medicines, dispenses, orders } = useData();
  const [fromDate, setFromDate] = useState('2026-05-01');
  const [toDate,   setToDate]   = useState('2026-05-31');

  // ── Aggregate dispense data for preview table ───────────────────────────
  const filteredDispenses = dispenses.filter(d => {
    const date = new Date(d.date);
    return date >= new Date(fromDate) && date <= new Date(toDate + 'T23:59:59');
  });

  const aggregated = filteredDispenses.reduce<Record<string, {
    medicineName: string;
    category:     string;
    totalQty:     number;
    times:        number;
    unitPrice:    number;
  }>>((acc, d) => {
    if (!acc[d.medicineId]) {
      const med = medicines.find(m => m.id === d.medicineId);
      acc[d.medicineId] = {
        medicineName: d.medicineName,
        category:     med?.category ?? '',
        totalQty:     0,
        times:        0,
        unitPrice:    med?.unitPrice ?? 0,
      };
    }
    acc[d.medicineId].totalQty += d.qty;
    acc[d.medicineId].times    += 1;
    return acc;
  }, {});

  const reportRows = Object.values(aggregated);

  // ── Report card definitions ─────────────────────────────────────────────
  const reportCards = [
    {
      icon:        FileText,
      title:       'Monthly Dispense Report',
      description: 'All medicines dispensed this month with patient and doctor details',
      color:       '#7C3AED',
    },
    {
      icon:        AlertTriangle,
      title:       'Low Stock Report',
      description: 'All medicines below minimum stock threshold requiring reorder',
      color:       '#D97706',
    },
    {
      icon:        Truck,
      title:       'Supplier Order History',
      description: 'Complete purchase order history per supplier with delivery status',
      color:       '#2563EB',
    },
    {
      icon:        Calendar,
      title:       'Expiry Summary Report',
      description: 'All medicines grouped by expiry urgency with supplier contacts',
      color:       '#DC2626',
    },
  ];

  // ── Generic CSV download helper ─────────────────────────────────────────
  function exportCSV(rows: object[], filename: string) {
    if (!rows.length) { alert('No data to export.'); return; }

    const headers    = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => {
          const val = String((row as Record<string, unknown>)[h] ?? '');
          return val.includes(',') || val.includes('\n') ? `"${val}"` : val;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ── Individual report export functions ─────────────────────────────────
  function exportDispenseCSV() {
    const rows = dispenses.map(d => ({
      Patient:      d.patientName,
      Doctor:       d.doctorName,
      Medicine:     d.medicineName,
      Quantity:     d.qty,
      Date:         new Date(d.date).toLocaleDateString('en-GB'),
      Dispensed_By: d.dispensedBy,
    }));
    exportCSV(rows, 'monthly_dispense_report');
  }

  function exportLowStockCSV() {
    const rows = medicines
      .filter(m => m.stockQty < m.lowStockThreshold)
      .map(m => ({
        Medicine:      m.name,
        Category:      m.category,
        Manufacturer:  m.manufacturer,
        Current_Stock: m.stockQty,
        Threshold:     m.lowStockThreshold,
        Status:        m.status,
      }));
    exportCSV(rows, 'low_stock_report');
  }

  function exportSupplierOrdersCSV() {
    const rows = orders.map(o => ({
      Order_ID:          o.id,
      Supplier:          o.supplierName,
      Order_Date:        o.orderDate,
      Expected_Delivery: o.expectedDelivery,
      Actual_Delivery:   o.actualDelivery || '—',
      Status:            o.status,
      Total_Value:       `Rs.${o.totalValue.toLocaleString()}`,
    }));
    exportCSV(rows, 'supplier_order_history');
  }

  function exportExpiryCSV() {
    const today = Date.now();
    const rows  = medicines
      .filter(m => {
        const days = Math.floor(
          (new Date(m.expiryDate).getTime() - today) / (1000 * 60 * 60 * 24)
        );
        return days <= 30;
      })
      .map(m => {
        const days = Math.floor(
          (new Date(m.expiryDate).getTime() - today) / (1000 * 60 * 60 * 24)
        );
        return {
          Medicine:    m.name,
          Category:    m.category,
          Expiry_Date: m.expiryDate,
          Days_Left:   days,
          Stock_Qty:   m.stockQty,
          Urgency:     days < 0 ? 'EXPIRED' : days <= 7 ? 'EXPIRING IN 7 DAYS' : 'EXPIRING IN 30 DAYS',
          Status:      m.status,
        };
      });
    exportCSV(rows, 'expiry_summary_report');
  }

  // Map report title to its export function
  function handleGenerate(title: string) {
    if (title === 'Monthly Dispense Report')  exportDispenseCSV();
    else if (title === 'Low Stock Report')     exportLowStockCSV();
    else if (title === 'Supplier Order History') exportSupplierOrdersCSV();
    else if (title === 'Expiry Summary Report')  exportExpiryCSV();
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Report Cards */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {reportCards.map(({ icon: Icon, title, description, color }) => (
          <div
            key={title}
            className="bg-white dark:bg-[#1A1730] rounded-xl p-6 shadow-sm border border-transparent dark:border-[#2D2B45] card-hover"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color + '18' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                <div className="flex items-center gap-3 mt-4">
                  {/* Generate + Export CSV */}
                  <button
                    onClick={() => handleGenerate(title)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white rounded-lg transition-colors btn-press"
                    style={{ background: color }}>
                    <Download size={13} /> Generate & Export CSV
                  </button>
                  {/* Print */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border rounded-lg transition-colors btn-press"
                    style={{ borderColor: color, color }}>
                    <Printer size={13} /> Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      <div
        className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-[#2D2B45]">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Monthly Dispense Report — May 2026
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Aggregated dispense data for selected date range
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range filters */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
              <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 dark:border-[#2D2B45] rounded-lg bg-white dark:bg-[#252240] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              />
            </div>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2D2B45] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252240] transition-colors">
              <Printer size={13} /> Print
            </button>

            {/* Export CSV button */}
            <button
              onClick={() => exportCSV(
                reportRows.map(r => ({
                  Medicine:         r.medicineName,
                  Category:         r.category,
                  Total_Dispensed:  r.totalQty,
                  Times_Dispensed:  r.times,
                  Avg_per_Dispense: (r.totalQty / r.times).toFixed(1),
                  Total_Value:      `Rs.${(r.totalQty * r.unitPrice).toLocaleString()}`,
                })),
                'monthly_dispense_report'
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#7C3AED] hover:bg-[#5B21B6] rounded-lg transition-colors">
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
                {['Medicine', 'Category', 'Total Dispensed', 'Times Dispensed', 'Avg per Dispense', 'Total Value'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No dispense records found for the selected date range.
                  </td>
                </tr>
              ) : reportRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                  style={{ background: i % 2 === 1 ? 'rgba(245,243,255,0.4)' : 'transparent' }}>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{row.medicineName}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.category}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{row.totalQty}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.times}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{(row.totalQty / row.times).toFixed(1)}</td>
                  <td className="px-4 py-3 font-semibold text-[#7C3AED]">
                    Rs.{(row.totalQty * row.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            {reportRows.length > 0 && (
              <tfoot>
                <tr
                  className="border-t-2 border-gray-200 dark:border-[#2D2B45]"
                  style={{ background: '#F5F3FF' }}>
                  <td colSpan={2} className="px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                    Total
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {reportRows.reduce((s, r) => s + r.totalQty, 0)}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    {reportRows.reduce((s, r) => s + r.times, 0)}
                  </td>
                  <td />
                  <td className="px-4 py-3 font-bold text-[#7C3AED]">
                    Rs.{reportRows.reduce((s, r) => s + r.totalQty * r.unitPrice, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}