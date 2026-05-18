import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Pill, Truck, ShoppingCart,
  ClipboardList, AlertTriangle, BarChart2, Settings, LogOut, Cross
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Orders' },
  { to: '/prescriptions', icon: ClipboardList, label: 'Prescriptions & Dispense' },
  { to: '/expiry-alerts', icon: AlertTriangle, label: 'Expiry Alerts', badge: '4' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      className="fixed left-0 top-0 h-full w-[260px] flex flex-col z-30"
      style={{ background: '#1E1B4B' }}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          {/** Try to load a project logo at /logo.png (place in frontend public/). Falls back to icon. */}
          <LogoArea />
          <div>
            <div className="text-white font-bold text-base leading-tight">PharmaCare</div>
            <div className="text-[11px] leading-tight" style={{ color: '#C4B5FD' }}>Hospital Management System</div>
          </div>
        </div>
      </div>

function LogoArea() {
  const [err, setErr] = useState(false);
  return (
    <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center overflow-hidden">
      {!err ? (
        <img src="/logo.png" alt="PharmaCare" className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Cross size={18} className="text-white" />
        </div>
      )}
    </div>
  );
}

      {/* Nav */}
      <nav className="flex-1 px-2 pb-4 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-widest font-semibold px-3 mb-2" style={{ color: '#6D5BA6' }}>
          Navigation
        </div>
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mx-1 my-0.5 text-sm font-medium group relative sidebar-item"
              style={{
                background: isActive ? '#7C3AED' : 'transparent',
                color: isActive ? '#FFFFFF' : '#C4B5FD',
                borderLeft: isActive ? '3px solid #C4B5FD' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.2)';
                  (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#C4B5FD';
                }
              }}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {badge && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 pb-5">
        <div className="border-t mb-4" style={{ borderColor: '#312E81' }} />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">MH</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium leading-tight">Muhammad Hussain</div>
            <div className="text-[11px]" style={{ color: '#C4B5FD' }}>Pharmacist</div>
          </div>
          <button className="text-[#C4B5FD] hover:text-white p-1 rounded transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
