import { useEffect, useState } from 'react';
import { productService } from '../services/services';
import toast from 'react-hot-toast';

interface Stats {
  total_products: number;
  available_count: number;
  out_of_stock_count: number;
}

interface Update {
  id: number;
  product_name: string;
  tamil_name: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  source: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await productService.getStats();
      setStats(data.stats);
      setUpdates(data.recentUpdates || []);
    } catch {
      toast.error('புள்ளிவிவரங்களை பெற முடியவில்லை.');
    } finally {
      setLoading(false);
    }
  }

  function fieldLabel(field: string) {
    const map: Record<string, string> = {
      price: 'விலை',
      availability_status: 'நிலை',
      product_name: 'பொருள் பெயர்',
      CREATED: 'சேர்க்கப்பட்டது',
    };
    return map[field] || field;
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleString('ta-IN', { dateStyle: 'short', timeStyle: 'short' });
  }

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <svg className="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📊 Dashboard</h2>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">மொத்த பொருட்கள்</div>
            <div className="stat-value">{stats?.total_products ?? 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">உள்ளது</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{stats?.available_count ?? 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">இல்லை</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{stats?.out_of_stock_count ?? 0}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <div className="stat-label">கையிருப்பு %</div>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {stats?.total_products ? Math.round((stats.available_count / stats.total_products) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">🕐 சமீபத்திய மாற்றங்கள்</span>
          <button className="btn btn-ghost btn-sm" onClick={loadData}>புதுப்பி</button>
        </div>
        <div className="table-wrap">
          {updates.length === 0 ? (
            <div className="empty-state"><p>இன்னும் மாற்றங்கள் இல்லை.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>பொருள்</th>
                  <th>மாற்றம்</th>
                  <th>பழைய மதிப்பு</th>
                  <th>புதிய மதிப்பு</th>
                  <th>ஆதாரம்</th>
                  <th>நேரம்</th>
                </tr>
              </thead>
              <tbody>
                {updates.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.product_name}</div>
                      {u.tamil_name && <div className="tamil-text">{u.tamil_name}</div>}
                    </td>
                    <td><span style={{ background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{fieldLabel(u.field_changed)}</span></td>
                    <td style={{ color: '#6b7280' }}>{u.old_value || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{u.new_value || '—'}</td>
                    <td>
                      <span style={{ fontSize: 11, background: u.source === 'MOBILE' ? '#dbeafe' : u.source === 'IMPORT' ? '#fef3c7' : '#dcfce7',
                        color: u.source === 'MOBILE' ? '#1d4ed8' : u.source === 'IMPORT' ? '#92400e' : '#15803d',
                        padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        {u.source}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: 12 }}>{formatTime(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
