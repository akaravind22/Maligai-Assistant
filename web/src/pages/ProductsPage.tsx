import { useState, useEffect, useCallback } from 'react';
import { productService, type Product } from '../services/services';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ page, limit: LIMIT, search, status });
      setProducts(res.products);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('பொருட்களை பெற முடியவில்லை.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => { setPage(1); }, [search, status]);

  async function handleStatusToggle(p: Product) {
    const newStatus = p.availability_status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
    try {
      await productService.updateStatus(p.id, newStatus);
      toast.success(newStatus === 'AVAILABLE' ? 'உள்ளது என மாற்றப்பட்டது.' : 'இல்லை என மாற்றப்பட்டது.');
      load();
    } catch {
      toast.error('நிலை மாற்ற முடியவில்லை.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await productService.delete(id);
      toast.success('பொருள் நீக்கப்பட்டது.');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('நீக்க முடியவில்லை.');
    }
  }

  function openNew() { setEditProduct(null); setIsNew(true); setShowModal(true); }
  function openEdit(p: Product) { setEditProduct(p); setIsNew(false); setShowModal(true); }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>📦 பொருட்கள் ({total})</h2>
        <button id="add-product-btn" className="btn btn-primary" onClick={openNew}>
          ＋ புதிய பொருள்
        </button>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <div className="search-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            id="product-search"
            className="form-input search-input"
            placeholder="பொருளை தேடுங்கள்... (Sugar, சர்க்கரை, Aavin)"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="filter-tabs">
          {[['', 'அனைத்தும்'], ['AVAILABLE', '🟢 உள்ளது'], ['OUT_OF_STOCK', '🔴 இல்லை']].map(([val, label]) => (
            <button key={val} className={`filter-tab ${status === val ? 'active' : ''}`} onClick={() => { setStatus(val); setPage(1); }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">
              <svg className="spinner" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
              <h3>பொருட்கள் இல்லை</h3>
              <p>புதிய பொருள் சேர்க்கவும் அல்லது தேடலை மாற்றவும்.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>பொருள்</th>
                  <th>Brand</th>
                  <th>அளவு</th>
                  <th>விலை</th>
                  <th>நிலை</th>
                  <th>செயல்கள்</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.product_name}</div>
                      {p.tamil_name && <div className="tamil-text">{p.tamil_name}</div>}
                    </td>
                    <td>{p.brand || <span className="text-muted">—</span>}</td>
                    <td>{p.size ? `${parseFloat(String(p.size)) % 1 === 0 ? parseInt(String(p.size)) : p.size} ${p.unit}` : <span className="text-muted">—</span>}</td>
                    <td className="price-text">₹{parseFloat(String(p.price)).toFixed(2)}</td>
                    <td>
                      <button
                        className={`badge ${p.availability_status === 'AVAILABLE' ? 'badge-available' : 'badge-out'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => handleStatusToggle(p)}
                        title="நிலையை மாற்ற தொடவும்"
                      >
                        <span className="badge-dot"/>
                        {p.availability_status === 'AVAILABLE' ? 'உள்ளது' : 'இல்லை'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>✏️ திருத்து</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '16px 24px' }}>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">🗑️ நீக்க உறுதிப்படுத்தவும்</span></div>
            <div className="modal-body"><p>இந்த பொருளை நீக்க வேண்டுமா? இந்த செயல் மீட்க முடியாது.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>வேண்டாம்</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>ஆம், நீக்கு</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          isNew={isNew}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
