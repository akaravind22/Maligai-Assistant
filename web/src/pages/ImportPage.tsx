import { useState, useRef } from 'react';
import { importService } from '../services/services';
import toast from 'react-hot-toast';

interface PreviewResult {
  importId: number;
  filePath: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  validRows: Array<{ rowIndex: number; data: Record<string, unknown>; duplicateInFile?: boolean }>;
  errorRows: Array<{ rowIndex: number; errors: string[]; rawData: Record<string, unknown> }>;
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePreview(f: File) {
    setLoading(true);
    setPreview(null);
    setDone(false);
    try {
      const res = await importService.preview(f);
      setPreview(res);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'கோப்பை படிக்க முடியவில்லை.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); handlePreview(f); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); handlePreview(f); }
  }

  async function handleConfirmImport() {
    if (!preview) return;
    setImporting(true);
    try {
      const res = await importService.confirm(preview.importId, preview.filePath, file?.name || 'import');
      setImportedCount(res.importedCount);
      setDone(true);
      toast.success(`${res.importedCount} பொருட்கள் இறக்குமதி செய்யப்பட்டன!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'இறக்குமதி தோல்வியடைந்தது.');
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setFile(null); setPreview(null); setDone(false); setImportedCount(0);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>📤 Excel/CSV இறக்குமதி</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={importService.downloadTemplate}>
            ⬇️ Template பதிவிறக்கம்
          </button>
          <button className="btn btn-outline" onClick={importService.exportInventory}>
            📊 Inventory ஏற்றுமதி
          </button>
        </div>
      </div>

      {done ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', marginBottom: 8 }}>
            {importedCount} பொருட்கள் இறக்குமதி செய்யப்பட்டன!
          </h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Inventory புதுப்பிக்கப்பட்டது.</p>
          <button className="btn btn-primary" onClick={reset}>மீண்டும் இறக்குமதி செய்ய</button>
        </div>
      ) : (
        <>
          {/* Upload zone */}
          {!preview && (
            <div className="card card-body" style={{ marginBottom: 24 }}>
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Excel அல்லது CSV கோப்பை இங்கே இழுக்கவும்</p>
                <p style={{ color: '#9ca3af', fontSize: 13 }}>.xlsx, .xls, .csv கோப்புகள் ஆதரவு • அதிகபட்சம் 10MB</p>
                {loading && <div style={{ marginTop: 12, color: '#16a34a', fontWeight: 600 }}>கோப்பை படிக்கிறது...</div>}
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              <div style={{ marginTop: 16, padding: '14px 18px', background: '#f0fdf4', borderRadius: 10, fontSize: 13 }}>
                <strong>📋 தேவையான columns:</strong> Product Name, Tamil Name, Brand, Size, Unit, Price, Status, Aliases (pipe-separated), Notes<br/>
                <strong>Status values:</strong> AVAILABLE / OUT_OF_STOCK
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && !done && (
            <div>
              <div className="stat-grid" style={{ marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-icon blue"><span style={{ fontSize: 22 }}>📄</span></div>
                  <div><div className="stat-label">மொத்த வரிசைகள்</div><div className="stat-value">{preview.totalRows}</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green"><span style={{ fontSize: 22 }}>✅</span></div>
                  <div><div className="stat-label">சரியான வரிசைகள்</div><div className="stat-value" style={{ color: '#16a34a' }}>{preview.validCount}</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon red"><span style={{ fontSize: 22 }}>❌</span></div>
                  <div><div className="stat-label">பிழை வரிசைகள்</div><div className="stat-value" style={{ color: '#ef4444' }}>{preview.errorCount}</div></div>
                </div>
              </div>

              {/* Errors */}
              {preview.errorRows.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header"><span className="card-title" style={{ color: '#ef4444' }}>⚠️ பிழை வரிசைகள்</span></div>
                  <div className="card-body">
                    {preview.errorRows.slice(0, 10).map((r, i) => (
                      <div key={i} className="alert alert-error" style={{ marginBottom: 8 }}>
                        <strong>வரிசை {r.rowIndex}:</strong> {r.errors.join(', ')}
                      </div>
                    ))}
                    {preview.errorRows.length > 10 && <p style={{ color: '#9ca3af', fontSize: 13 }}>மேலும் {preview.errorRows.length - 10} பிழைகள்...</p>}
                  </div>
                </div>
              )}

              {/* Valid preview */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">✅ சரியான பொருட்கள் (முன்னோட்டம்)</span></div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>#</th><th>பொருள்</th><th>Tamil</th><th>Brand</th><th>Size</th><th>விலை</th><th>நிலை</th></tr>
                    </thead>
                    <tbody>
                      {preview.validRows.slice(0, 20).map((r, i) => (
                        <tr key={i} style={{ opacity: r.duplicateInFile ? 0.5 : 1 }}>
                          <td style={{ color: '#9ca3af' }}>{r.rowIndex}</td>
                          <td style={{ fontWeight: 600 }}>{String(r.data.product_name)}{r.duplicateInFile && <span style={{ color: '#f59e0b', fontSize: 11, marginLeft: 6 }}>dup</span>}</td>
                          <td className="tamil-text">{String(r.data.tamil_name || '')}</td>
                          <td>{String(r.data.brand || '—')}</td>
                          <td>{r.data.size ? `${r.data.size} ${r.data.unit}` : '—'}</td>
                          <td className="price-text">₹{String(r.data.price)}</td>
                          <td><span className={`badge ${r.data.availability_status === 'AVAILABLE' ? 'badge-available' : 'badge-out'}`}>{String(r.data.availability_status)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.validRows.length > 20 && (
                    <div style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>
                      ...மேலும் {preview.validRows.length - 20} பொருட்கள்
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={reset}>ரத்து</button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmImport}
                  disabled={importing || preview.validCount === 0}
                >
                  {importing ? 'இறக்குமதி ஆகிறது...' : `✓ ${preview.validCount} பொருட்களை இறக்குமதி செய்`}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
