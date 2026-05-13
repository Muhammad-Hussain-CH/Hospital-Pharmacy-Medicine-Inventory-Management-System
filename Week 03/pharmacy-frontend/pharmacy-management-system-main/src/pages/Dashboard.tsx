import { useState, useEffect } from 'react';
import { getDashboardStats, getStockLevels, getRecentDispenses } from '../api/services';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';
import { Pill, AlertTriangle, XCircle, Clock, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#0891B2'];

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm">
      <div className="skeleton h-4 w-32 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, trendUp }: {
  title: string; value: number; icon: React.ElementType; color: string;
  trend: string; trendUp?: boolean;
}) {
  const count = useCountUp(value);
  return (
    <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm card-hover relative overflow-hidden border border-transparent dark:border-[#2D2B45]"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{count}</div>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {trendUp !== undefined && (
          trendUp
            ? <ArrowUp size={12} className="text-emerald-600" />
            : <ArrowDown size={12} className="text-emerald-600" />
        )}
        <span className={trendUp !== undefined ? (trendUp ? 'text-red-500' : 'text-emerald-600') : 'text-gray-500 dark:text-gray-400'}>
          {trend}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
    </div>
  );
}

const expiryAlerts = [
  { name: 'Brufen 400mg',      badge: 'EXPIRED', badgeColor: '#DC2626', badgeBg: '#FEE2E2', days: '' },
  { name: 'Ventolin Inhaler',  badge: 'EXPIRED', badgeColor: '#DC2626', badgeBg: '#FEE2E2', days: '' },
  { name: 'Disprin 300mg',     badge: '3 days',  badgeColor: '#D97706', badgeBg: '#FEF3C7', days: '' },
  { name: 'Amoxicillin 250mg', badge: '18 days', badgeColor: '#CA8A04', badgeBg: '#FEF9C3', days: '' },
  { name: 'Metformin 500mg',   badge: '25 days', badgeColor: '#CA8A04', badgeBg: '#FEF9C3', days: '' },
  { name: 'Cough Syrup 100ml', badge: '28 days', badgeColor: '#CA8A04', badgeBg: '#FEF9C3', days: '' },
];

// Fallback static data (used if API fails)
const stockDataFallback = [
  { name: 'Panadol',    qty: 150 }, { name: 'Amoxicil.', qty: 8   },
  { name: 'ORS',        qty: 200 }, { name: 'Metformin', qty: 12  },
  { name: 'Brufen',     qty: 90  }, { name: 'Flagyl',    qty: 75  },
  { name: 'Vit C',      qty: 300 }, { name: 'Ringer',    qty: 60  },
  { name: 'Cough Syr.', qty: 5   }, { name: 'Augmentin', qty: 45  },
  { name: 'Lipitor',    qty: 80  },
];

const pieData = [
  { name: 'Tablet',    value: 6 }, { name: 'Capsule',   value: 2 },
  { name: 'Syrup',     value: 1 }, { name: 'Injection', value: 1 },
  { name: 'Inhaler',   value: 1 }, { name: 'Other',     value: 4 },
];

const lineData = [
  { month: 'Dec', dispenses: 18 }, { month: 'Jan', dispenses: 24 },
  { month: 'Feb', dispenses: 20 }, { month: 'Mar', dispenses: 28 },
  { month: 'Apr', dispenses: 22 }, { month: 'May', dispenses: 30 },
];

// Fallback static dispenses (used if API fails)
const recentDispensesFallback = [
  { patient: 'Muhammad Ali',  doctor: 'Dr. Ahmed Raza',    medicine: 'Panadol 500mg',    qty: 10, date: '28-Apr-26', by: 'M. Hussain' },
  { patient: 'Zainab Bibi',   doctor: 'Dr. Fatima Malik',  medicine: 'Lipitor 20mg',     qty: 30, date: '29-Apr-26', by: 'Ali Ahmed'  },
  { patient: 'Tariq Jameel',  doctor: 'Dr. Usman Tariq',   medicine: 'Augmentin 625mg',  qty: 14, date: '30-Apr-26', by: 'M. Hussain' },
  { patient: 'Ayesha Khan',   doctor: 'Dr. Sadia Hussain', medicine: 'Metformin 500mg',  qty: 30, date: '01-May-26', by: 'Ali Ahmed'  },
  { patient: 'Hassan Nawaz',  doctor: 'Dr. Ahmed Raza',    medicine: 'Cough Syrup 100ml',qty: 1,  date: '02-May-26', by: 'M. Hussain' },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1A1730] border border-gray-100 dark:border-[#2D2B45] rounded-lg px-3 py-2 shadow-lg text-xs">
        <div className="font-semibold text-gray-800 dark:text-white">{label}</div>
        <div className="text-[#7C3AED]">Stock: {payload[0].value} units</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  // ── Real MySQL data states ─────────────────────────────────────────────────
  const [dbStats, setDbStats] = useState<{
    total_medicines:   number;
    expired_medicines: number;
    low_stock_items:   number;
    pending_orders:    number;
  } | null>(null);

  const [dbStockData, setDbStockData] = useState<
    { name: string; qty: number }[]
  >([]);

  const [dbRecentDispenses, setDbRecentDispenses] = useState<{
    patient_name:  string;
    doctor_name:   string;
    medicine_name: string;
    quantity:      number;
    dispensed_at:  string;
    dispensed_by:  string;
  }[]>([]);

  // ── localStorage fallback states ───────────────────────────────────────────
  const { medicines, orders } = useData();
  const lowStock      = medicines.filter(m => m.status === 'Low Stock').length;
  const expired       = medicines.filter(m => m.status === 'Expired').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  // ── Fetch real data from MySQL via API ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, stockRes, dispensesRes] = await Promise.all([
          getDashboardStats(),
          getStockLevels(),
          getRecentDispenses(),
        ]);
        setDbStats(statsRes.data);
        setDbStockData(
          stockRes.data.map((row: { name: string; quantity: number }) => ({
            name: row.name.split(' ')[0],
            qty:  row.quantity,
          }))
        );
        setDbRecentDispenses(dispensesRes.data);
      } catch (err) {
        console.error('API error — using localStorage fallback', err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
  }, []);

  // ── Build display rows for recent dispenses table ──────────────────────────
  const displayDispenses = dbRecentDispenses.length
    ? dbRecentDispenses.map(d => ({
        patient:  d.patient_name,
        doctor:   d.doctor_name,
        medicine: d.medicine_name,
        qty:      d.quantity,
        date:     new Date(d.dispensed_at).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: '2-digit'
                  }),
        by:       d.dispensed_by,
      }))
    : recentDispensesFallback;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="grid grid-cols-4 gap-5 mb-6">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="col-span-2 bg-white dark:bg-[#1A1730] rounded-xl p-5">
            <div className="skeleton h-5 w-40 mb-4" />
            <div className="skeleton h-64 w-full" />
          </div>
          <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5">
            <div className="skeleton h-5 w-32 mb-4" />
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-8 w-full mb-2" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard
          title="Total Medicines"
          value={dbStats?.total_medicines ?? medicines.length}
          icon={Pill} color="#7C3AED"
          trend="+2 this month" trendUp={false}
        />
        <StatCard
          title="Low Stock Alerts"
          value={dbStats?.low_stock_items ?? lowStock}
          icon={AlertTriangle} color="#D97706"
          trend="+1 since yesterday" trendUp={true}
        />
        <StatCard
          title="Expired Medicines"
          value={dbStats?.expired_medicines ?? expired}
          icon={XCircle} color="#DC2626"
          trend="Needs immediate action"
        />
        <StatCard
          title="Pending Orders"
          value={dbStats?.pending_orders ?? pendingOrders}
          icon={Clock} color="#2563EB"
          trend="Expected by May 12"
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-3 gap-5 mb-6">

        {/* Bar chart — real MySQL stock data */}
        <div className="col-span-2 bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border border-transparent dark:border-[#2D2B45]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="mb-4">
            <div className="text-base font-semibold text-gray-900 dark:text-white">Medicine Stock Overview</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Current inventory levels across all medicines</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={dbStockData.length ? dbStockData : stockDataFallback}
              margin={{ top: 5, right: 10, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" fill="#7C3AED" radius={[4, 4, 0, 0]} animationDuration={1200} animationEasing="ease-in-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expiry alerts panel */}
        <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border border-transparent dark:border-[#2D2B45]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <div className="text-base font-semibold text-gray-900 dark:text-white">Expiry Alerts</div>
          </div>
          <div className="space-y-2">
            {expiryAlerts.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate pr-2">{item.name}</span>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: item.badgeBg, color: item.badgeColor }}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
          <Link to="/expiry-alerts"
            className="mt-4 flex items-center gap-1 text-xs font-medium text-[#7C3AED] hover:text-[#5B21B6] transition-colors">
            <Eye size={12} /> View All Alerts
          </Link>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-2 gap-5 mb-6">

        {/* Pie chart */}
        <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border border-transparent dark:border-[#2D2B45]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="mb-2">
            <div className="text-base font-semibold text-gray-900 dark:text-white">Medicines by Category</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={100}
                dataKey="value" animationDuration={1200} animationEasing="ease-in-out">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(value) => (
                <span style={{ color: '#6B7280', fontSize: 12 }}>{value}</span>
              )} />
              <Tooltip formatter={(v) => [`${v} medicines`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-white dark:bg-[#1A1730] rounded-xl p-5 shadow-sm border border-transparent dark:border-[#2D2B45]"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
          <div className="mb-2">
            <div className="text-base font-semibold text-gray-900 dark:text-white">Monthly Dispense Activity</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Last 6 months</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dispenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip />
              <Area type="monotone" dataKey="dispenses" stroke="#7C3AED" strokeWidth={2}
                fill="url(#dispenseGrad)" animationDuration={1200} animationEasing="ease-in-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recent Dispense Table — real MySQL data ── */}
      <div className="bg-white dark:bg-[#1A1730] rounded-xl shadow-sm border border-transparent dark:border-[#2D2B45] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(124,58,237,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-[#2D2B45]">
          <div className="text-base font-semibold text-gray-900 dark:text-white">Recent Dispense Records</div>
          <Link to="/prescriptions"
            className="text-xs font-medium text-[#7C3AED] hover:text-[#5B21B6] transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F5F3FF' }} className="dark:bg-[#1F1C35]">
                {['#', 'Patient', 'Doctor', 'Medicine', 'Qty', 'Date', 'By', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayDispenses.map((row, i) => (
                <tr key={i}
                  className="border-t border-gray-50 dark:border-[#2D2B45] hover:bg-[#FAF5FF] dark:hover:bg-[#252240] transition-colors"
                  style={{ background: i % 2 === 1 ? 'rgba(245,243,255,0.5)' : 'transparent' }}>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{row.patient}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.doctor}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.medicine}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.qty}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.date}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.by}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: '#DCFCE7', color: '#166534' }}>
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}