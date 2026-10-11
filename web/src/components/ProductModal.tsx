import { useState } from 'react';
import { productService, type Product } from '../services/services';
import toast from 'react-hot-toast';

interface Props {
  product: Product | null;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({ product, isNew, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    product_name: product?.product_name || '',
    tamil_name: product?.tamil_name || '',
    brand: product?.brand || '',
    size: product?.size?.toString() || '',
    unit: product?.unit || '',
    price: product?.price?.toString() || '',
    availability_status: product?.availability_status || 'AVAILABLE',
    notes: product?.notes || '',
    aliasInput: (product?.aliases || []).join(', '),
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.product_name.trim()) errs.product_name = 'பொருள் பெயர் தேவை.';
    if (!form.price || parseFloat(form.price) < 0) errs.price = 'சரியான விலை தேவை.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const aliases = form.aliasInput
        .split(',').map(a => a.trim()).filter(Boolean);

      const data = {
        product_name: form.product_name.trim(),
        tamil_name: form.tamil_name.trim() || undefined,
        brand: form.brand.trim() || undefined,
        size: form.size ? parseFloat(form.size) : undefined,
        unit: form.unit.trim() || undefined,
        price: parseFloat(form.price),
        availability_status: form.availability_status as 'AVAILABLE' | 'OUT_OF_STOCK',
        notes: form.notes.trim() || undefined,
        aliases,
      };

      if (isNew) {
        await productService.create(data);
        toast.success('புதிய பொருள் சேர்க்கப்பட்டது.');
      } else {
        await productService.update(product!.id, data);
        toast.success('பொருள் புதுப்பிக்கப்பட்டது.');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'சேமிக்க முடியவில்லை.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isNew ? '➕ புதிய பொருள்' : '✏️ பொருள் திருத்து'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">பொருள் பெயர் <span className="required">*</span></label>
                <input id="pname" className={`form-input ${errors.product_name ? 'error' : ''}`} value={form.product_name}
                  onChange={e => set('product_name', e.target.value)} placeholder="Sugar" />
                {errors.product_name && <div className="form-error">{errors.product_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">தமிழ் பெயர்</label>
                <input id="ptamil" className="form-input" value={form.tamil_name}
                  onChange={e => set('tamil_name', e.target.value)} placeholder="சர்க்கரை"
                  style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input id="pbrand" className="form-input" value={form.brand}
                  onChange={e => set('brand', e.target.value)} placeholder="Aavin, Fortune..." />
              </div>
              <div className="form-group">
                <label className="form-label">விலை (₹) <span className="required">*</span></label>
                <input id="pprice" type="number" step="0.01" min="0" className={`form-input ${errors.price ? 'error' : ''}`}
                  value={form.price} onChange={e => set('price', e.target.value)} placeholder="48.00" />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">அளவு (Size)</label>
                <input id="psize" type="number" step="0.001" min="0" className="form-input"
                  value={form.size} onChange={e => set('size', e.target.value)} placeholder="1, 500, 250..." />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select id="punit" className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                  <option value="">— தேர்ந்தெடு —</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="piece">piece</option>
                  <option value="packet">packet</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">நிலை</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {['AVAILABLE', 'OUT_OF_STOCK'].map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <input type="radio" name="status" value={s} checked={form.availability_status === s}
                      onChange={() => set('availability_status', s)} />
                    {s === 'AVAILABLE'
                      ? <span style={{ color: '#16a34a' }}>🟢 உள்ளது</span>
                      : <span style={{ color: '#ef4444' }}>🔴 இல்லை</span>}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Aliases (comma separated)</label>
              <input id="paliases" className="form-input" value={form.aliasInput}
                onChange={e => set('aliasInput', e.target.value)}
                placeholder="சுகர், Sugar, Sakkarai"
                style={{ fontFamily: 'Noto Sans Tamil, sans-serif' }} />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                இந்த பெயர்களால் voice search வேலை செய்யும்
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">குறிப்புகள்</label>
              <textarea id="pnotes" className="form-textarea" rows={2} value={form.notes}
                onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>ரத்து</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'சேமிக்கிறது...' : isNew ? '✓ சேர்க்க' : '✓ சேமிக்க'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
