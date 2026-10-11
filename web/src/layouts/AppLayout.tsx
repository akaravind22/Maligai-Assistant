import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/products', label: 'பொருட்கள்', icon: '📦' },
  { to: '/import', label: 'Import / Export', icon: '📤' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('வெற்றிகரமாக வெளியேறினீர்கள்.');
    navigate('/login');
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>🌿 மளிகை உதவியாளர்</h1>
          <p>Maligai Assistant</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: 13, color: '#86efac', marginBottom: 10 }}>
            👤 {user?.name || user?.username}
          </div>
          <button className="btn btn-ghost" style={{ color: '#fca5a5', width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            🚪 வெளியேறு
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-title">🌿 மளிகை உதவியாளர்</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              👤 {user?.name || user?.username}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>வெளியேறு</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
