import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_ROLES = ['admin', 'accounts', 'assistant'];

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊', roles: ALL_ROLES, end: true },
  { to: '/jobs', label: 'Jobs', icon: '💼', roles: ALL_ROLES },
  { to: '/clients', label: 'Customers', icon: '🏢', roles: ALL_ROLES },
  { to: '/calculators', label: 'Calculators', icon: '🧮', roles: ALL_ROLES },
  { to: '/inventory', label: 'Inventory', icon: '📦', roles: ALL_ROLES },
  { to: '/imports', label: 'Import Costing', icon: '🚢', roles: ['admin', 'accounts'] },
  { to: '/intercompany', label: 'Intercompany', icon: '🔄', roles: ['admin', 'accounts'] },
  { to: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'accounts'] },

  // Demo modules not wired yet — added for visual shell parity later
  { to: '/purchase-orders', label: 'Purchase Orders', icon: '🛒', roles: ALL_ROLES, disabled: true },
  { to: '/suppliers', label: 'Suppliers', icon: '🏭', roles: ALL_ROLES, disabled: true },
  { to: '/accounting', label: 'Accounting', icon: '🏦', roles: ALL_ROLES, disabled: true },
  { to: '/assets', label: 'Assets', icon: '🚗', roles: ALL_ROLES, disabled: true },
  { to: '/hr', label: 'HR', icon: '👥', roles: ALL_ROLES, disabled: true },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/clients': 'Customers',
  '/calculators': 'Calculators & Costing',
  '/inventory': 'Inventory',
  '/imports': 'Import Costing',
  '/intercompany': 'Intercompany',
  '/reports': 'Reports',
};

function initials(first?: string, last?: string) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'U';
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || 'assistant';
  const nav = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const isAssistant = role === 'assistant';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const title =
    PAGE_TITLES[location.pathname] ||
    PAGE_TITLES[`/${location.pathname.split('/')[1]}`] ||
    'SNSG Holdings';

  const today = new Date().toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#06065c' }}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-red-600">
            SC
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-black tracking-[0.08em] text-white"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              SNSG Holdings
            </p>
            <p className="text-xs text-blue-300 opacity-70">Business Platform</p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            if (item.disabled) {
              return (
                <button
                  key={item.to}
                  type="button"
                  disabled
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-blue-200/40"
                  title="Module to be ported from demo"
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: 'rgba(0,0,255,0.45)', borderLeft: '3px solid #ED0101' }
                    : undefined
                }
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isAssistant ? 'bg-red-500' : 'bg-blue-600'
              }`}
            >
              <span className="text-xs font-bold text-white">
                {initials(user?.first_name, user?.last_name)}
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs capitalize text-gray-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="flex shrink-0 items-center gap-3 border-b bg-white px-4 py-2.5"
          style={{
            borderBottomWidth: '2px',
            borderImage: 'linear-gradient(90deg,#06065c 0%,#0000ff 60%,transparent 100%) 1',
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 hover:bg-gray-100 lg:hidden"
            style={{ color: '#06065c' }}
          >
            ☰
          </button>

          <h1
            className="flex-1 text-base font-bold uppercase tracking-[0.05em]"
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              color: '#06065c',
            }}
          >
            {title}
          </h1>

          <span className="hidden text-xs text-gray-400 sm:block">{today}</span>

          {isAssistant && (
            <span
              className="hidden items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold sm:inline-flex"
              style={{
                background: '#e6e6ff',
                border: '1px solid #9999ff',
                color: '#06065c',
              }}
            >
              👤 Assistant
            </span>
          )}

          <span className="hidden items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-bold text-green-700 sm:inline-flex">
            ● Live
          </span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
