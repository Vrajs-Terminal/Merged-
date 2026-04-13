import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Loader2, Activity, Layers, Hash, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface Dimension {
  id: number; name: string; code: string; description?: string; status: string;
  createdBy?: { id: number; name: string };
  createdAt: string;
}

const autoCode = async (): Promise<string> => {
  const res = await api.get('/pms/dimensions');
  return `DIM-${String(res.data.length + 1).padStart(3, '0')}`;
};

const EMPTY_FORM = { name: '', code: '', description: '', status: 'Active' };

export default function DimensionName() {
  const [dims, setDims] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Dimension> | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const perPage = 25;

  const fetchDims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/pms/dimensions');
      setDims(res.data);
    } catch { toast.error('Failed to load dimensions'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDims(); }, [fetchDims]);

  const openAdd = () => { setEditItem({ ...EMPTY_FORM }); setDrawerOpen(true); };
  const openEdit = (d: Dimension) => { setEditItem({ ...d }); setDrawerOpen(true); };

  const handleSave = async () => {
    if (!editItem?.name) return toast.error('Dimension name is required');
    setSaving(true);
    try {
      if (editItem.id) {
        await api.put(`/pms/dimensions/${editItem.id}`, editItem);
        toast.success('Dimension updated');
      } else {
        const code = editItem.code?.trim() || await autoCode();
        await api.post('/pms/dimensions', { ...editItem, code });
        toast.success('Dimension created');
      }
      setDrawerOpen(false);
      fetchDims();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this dimension?')) return;
    try { await api.delete(`/pms/dimensions/${id}`); toast.success('Deleted'); fetchDims(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (d: Dimension) => {
    try { await api.patch(`/pms/dimensions/${d.id}/toggle`); toast.success(`Marked ${d.status === 'Active' ? 'Inactive' : 'Active'}`); fetchDims(); }
    catch { toast.error('Toggle failed'); }
  };

  const filtered = dims.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const toggleSel = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const stats = { total: dims.length, active: dims.filter(d => d.status === 'Active').length, inactive: dims.filter(d => d.status === 'Inactive').length };

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><Layers size={22} /></div>
            <div>
              <h2>Dimension Name</h2>
              <p>Define performance KPIs — Punctuality, Quality, Productivity</p>
            </div>
          </div>
          <div className="pms-header-actions">
            <button className="pms-btn pms-btn-primary" onClick={openAdd}><Plus size={16} /> Add Dimension</button>
          </div>
        </div>

        <div className="pms-stats-grid">
          {[
            { label: 'Total Dimensions', val: stats.total, cls: 'blue', Icon: Layers },
            { label: 'Active', val: stats.active, cls: 'green', Icon: Activity },
            { label: 'Inactive', val: stats.inactive, cls: 'amber', Icon: ToggleLeft },
          ].map(s => (
            <div className="pms-stat-card" key={s.label}>
              <div className={`pms-stat-icon ${s.cls}`}><s.Icon size={20} /></div>
              <div><p className="pms-stat-label">{s.label}</p><p className="pms-stat-value">{s.val}</p></div>
            </div>
          ))}
        </div>

        <div className="pms-controls">
          <div className="pms-controls-left">
            {selected.length > 0 && (
              <button className="pms-btn pms-btn-danger pms-btn-sm" onClick={() => {
                if (confirm(`Delete ${selected.length} dimensions?`)) {
                  Promise.all(selected.map(id => api.delete(`/pms/dimensions/${id}`))).then(() => { toast.success('Deleted'); setSelected([]); fetchDims(); });
                }
              }}><Trash2 size={14} /> Delete ({selected.length})</button>
            )}
            <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} records</span>
          </div>
          <div className="pms-search-wrap">
            <Search size={16} className="pms-search-icon" />
            <input className="pms-input" placeholder="Search name or code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            {search && <button className="pms-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
        </div>

        <div className="pms-table-wrap">
          <table className="pms-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={() => setSelected(selected.length === paged.length ? [] : paged.map(d => d.id))} /></th>
                <th>#</th><th>Code</th><th>Dimension Name</th><th>Status</th><th>Created By</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="pms-loading"><Loader2 size={22} className="pms-spin" /><span>Loading…</span></td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="pms-empty">No dimensions found. Click Add Dimension to get started.</td></tr>
              ) : paged.map((d, i) => (
                <tr key={d.id} className={selected.includes(d.id) ? 'pms-tr-selected' : ''}>
                  <td><input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggleSel(d.id)} /></td>
                  <td className="pms-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td><span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: 12, color: '#0f172a', border: '1px solid #e2e8f0' }}>{d.code}</span></td>
                  <td><div className="pms-name">{d.name}</div>{d.description && <div className="pms-sub">{d.description}</div>}</td>
                  <td>
                    <span className={`pms-toggle ${d.status === 'Active' ? 'pms-toggle-active' : 'pms-toggle-inactive'}`} onClick={() => handleToggle(d)}>
                      {d.status === 'Active' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />} {d.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{d.createdBy?.name || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="pms-actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="pms-action-btn pms-action-edit" onClick={() => openEdit(d)}><Edit2 size={14} /></button>
                      <button className="pms-action-btn pms-action-delete" onClick={() => handleDelete(d.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pms-pagination">
          <span className="pms-pag-info">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div className="pms-pag-btns">
            <button className="pms-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pms-pag-btn ${p === page ? 'pms-pag-btn-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="pms-pag-btn" disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {drawerOpen && editItem && (
        <div className="pms-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="pms-drawer" onClick={e => e.stopPropagation()}>
            <div className="pms-drawer-header">
              <div className="pms-drawer-title"><Layers size={18} /> {editItem.id ? 'Edit Dimension' : 'New Dimension'}</div>
              <button className="pms-drawer-close" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            <div className="pms-drawer-body">
              <div className="pms-section-label">Basic Info</div>
              <div className="pms-field">
                <label>Dimension Name <span className="pms-req">*</span></label>
                <input className="pms-input" placeholder="e.g. Punctuality, Quality, Productivity" value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="pms-field">
                <label>Code {!editItem.id && <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 400 }}>— leave blank for auto (DIM-001)</span>}</label>
                <input className="pms-input" placeholder="e.g. DIM-001" value={editItem.code || ''} onChange={e => setEditItem(p => ({ ...p, code: e.target.value.toUpperCase() }))} disabled={!!editItem.id} />
              </div>
              <div className="pms-field">
                <label>Description</label>
                <textarea className="pms-textarea pms-input" rows={3} placeholder="Optional description..." value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="pms-field">
                <label>Status</label>
                <div className="pms-chip-group">
                  {['Active', 'Inactive'].map(s => (
                    <button key={s} className={`pms-chip ${editItem.status === s ? 'pms-chip-active' : ''}`} onClick={() => setEditItem(p => ({ ...p, status: s }))}>
                      {editItem.status === s && <Check size={13} />} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pms-drawer-footer">
              <button className="pms-btn pms-btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="pms-btn pms-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="pms-spin" /> Saving…</> : <><Check size={15} /> {editItem.id ? 'Save Changes' : 'Create'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
