import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Check, Loader2, Target, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface Dimension { id: number; name: string; code: string; status: string; }
interface SubGroupDim { dimensionId: number; weightage: number; dimension?: Dimension; }
interface SubGroup {
  id: number; name: string; weightage_type: string; total_weightage: number;
  description?: string; status: string; createdAt: string;
  dimensions: SubGroupDim[];
}

const EMPTY_FORM: Partial<SubGroup> & { dimLinks: SubGroupDim[] } = {
  name: '', weightage_type: 'Percentage', total_weightage: 100, description: '', status: 'Active', dimLinks: []
};

export default function DimensionSubGroup() {
  const [groups, setGroups] = useState<SubGroup[]>([]);
  const [allDims, setAllDims] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, dRes] = await Promise.all([api.get('/pms/sub-groups'), api.get('/pms/dimensions')]);
      setGroups(gRes.data);
      setAllDims(dRes.data.filter((d: Dimension) => d.status === 'Active'));
    } catch { toast.error('Failed to load sub-groups'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditItem({ ...EMPTY_FORM, dimLinks: [] });
    setDrawerOpen(true);
  };

  const openEdit = (g: SubGroup) => {
    setEditItem({
      ...g,
      dimLinks: g.dimensions.map(dl => ({ dimensionId: dl.dimensionId, weightage: dl.weightage }))
    });
    setDrawerOpen(true);
  };

  const toggleDim = (dim: Dimension) => {
    setEditItem(prev => {
      const links = prev.dimLinks || [];
      if (links.some(l => l.dimensionId === dim.id)) {
        return { ...prev, dimLinks: links.filter(l => l.dimensionId !== dim.id) };
      }
      return { ...prev, dimLinks: [...links, { dimensionId: dim.id, weightage: 0 }] };
    });
  };

  const setWeightage = (dimId: number, val: string) => {
    setEditItem(prev => ({
      ...prev,
      dimLinks: (prev.dimLinks || []).map(l => l.dimensionId === dimId ? { ...l, weightage: Number(val) } : l)
    }));
  };

  const weightTotal = (editItem.dimLinks || []).reduce((s, l) => s + Number(l.weightage), 0);

  const handleSave = async () => {
    if (!editItem.name) return toast.error('Group name is required');
    if (editItem.weightage_type === 'Percentage' && Math.abs(weightTotal - 100) > 0.5 && (editItem.dimLinks || []).length > 0) {
      return toast.error(`Weightages must sum to 100% (currently ${weightTotal}%)`);
    }
    setSaving(true);
    try {
      const payload = {
        name: editItem.name, weightage_type: editItem.weightage_type,
        total_weightage: editItem.total_weightage, description: editItem.description,
        status: editItem.status,
        dimensions: editItem.dimLinks?.map(l => ({ dimensionId: l.dimensionId, weightage: l.weightage }))
      };
      if (editItem.id) { await api.put(`/pms/sub-groups/${editItem.id}`, payload); toast.success('Group updated'); }
      else { await api.post('/pms/sub-groups', payload); toast.success('Group created'); }
      setDrawerOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sub-group?')) return;
    try { await api.delete(`/pms/sub-groups/${id}`); toast.success('Deleted'); fetchData(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const filtered = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><Target size={22} /></div>
            <div><h2>Dimension Sub-Groups</h2><p>Group KPIs with weightage for structured evaluation</p></div>
          </div>
          <div className="pms-header-actions">
            <button className="pms-btn pms-btn-primary" onClick={openAdd}><Plus size={16} /> Add Sub-Group</button>
          </div>
        </div>

        <div className="pms-stats-grid">
          {[
            { label: 'Total Groups', val: groups.length, cls: 'blue' },
            { label: 'Active', val: groups.filter(g => g.status === 'Active').length, cls: 'green' },
            { label: 'Percentage Type', val: groups.filter(g => g.weightage_type === 'Percentage').length, cls: 'purple' },
          ].map(s => (
            <div className="pms-stat-card" key={s.label}>
              <div className={`pms-stat-icon ${s.cls}`}><Target size={20} /></div>
              <div><p className="pms-stat-label">{s.label}</p><p className="pms-stat-value">{s.val}</p></div>
            </div>
          ))}
        </div>

        <div className="pms-controls">
          <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} groups</span>
          <div className="pms-search-wrap" style={{ maxWidth: 280 }}>
            <Target size={15} className="pms-search-icon" />
            <input className="pms-input" placeholder="Search groups..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            {search && <button className="pms-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
        </div>

        <div className="pms-table-wrap">
          <table className="pms-table">
            <thead>
              <tr><th>#</th><th>Group Name</th><th>Dimensions</th><th>Weightage Type</th><th>Total Weightage</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="pms-loading"><Loader2 size={22} className="pms-spin" />Loading…</td></tr>
                : paged.length === 0 ? <tr><td colSpan={7} className="pms-empty">No sub-groups found. Add one to start grouping dimensions.</td></tr>
                : paged.map((g, i) => (
                  <tr key={g.id}>
                    <td className="pms-td-sr">{(page - 1) * perPage + i + 1}</td>
                    <td><div className="pms-name">{g.name}</div>{g.description && <div className="pms-sub">{g.description}</div>}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {g.dimensions.slice(0, 3).map(dl => (
                          <span key={dl.dimensionId} style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                            {dl.dimension?.name || `ID:${dl.dimensionId}`}
                            {g.weightage_type === 'Percentage' ? ` (${dl.weightage}%)` : ''}
                          </span>
                        ))}
                        {g.dimensions.length > 3 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{g.dimensions.length - 3} more</span>}
                        {g.dimensions.length === 0 && <span style={{ color: '#94a3b8', fontSize: 12 }}>None linked</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: g.weightage_type === 'Percentage' ? '#eff6ff' : '#faf5ff', color: g.weightage_type === 'Percentage' ? '#3b82f6' : '#9333ea', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {g.weightage_type}
                      </span>
                    </td>
                    <td style={{ color: '#0f172a', fontWeight: 700 }}>{g.total_weightage}%</td>
                    <td><span className={`pms-badge ${g.status === 'Active' ? 'pms-badge-active' : 'pms-badge-inactive'}`}>{g.status}</span></td>
                    <td>
                      <div className="pms-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="pms-action-btn pms-action-edit" onClick={() => openEdit(g)}><Edit2 size={14} /></button>
                        <button className="pms-action-btn pms-action-delete" onClick={() => handleDelete(g.id)}><Trash2 size={14} /></button>
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

      {drawerOpen && (
        <div className="pms-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="pms-drawer" onClick={e => e.stopPropagation()}>
            <div className="pms-drawer-header">
              <div className="pms-drawer-title"><Target size={18} /> {editItem.id ? 'Edit Sub-Group' : 'New Sub-Group'}</div>
              <button className="pms-drawer-close" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            <div className="pms-drawer-body">
              <div className="pms-section-label">Group Details</div>
              <div className="pms-field"><label>Group Name <span className="pms-req">*</span></label><input className="pms-input" placeholder="e.g. Technical Skills" value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="pms-field"><label>Description</label><textarea className="pms-textarea pms-input" rows={2} placeholder="Optional…" value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} /></div>

              <div className="pms-section-label">Weightage Settings</div>
              <div className="pms-field"><label>Weightage Type</label>
                <div className="pms-chip-group">
                  {['Percentage', 'Fixed'].map(t => (
                    <button key={t} className={`pms-chip ${editItem.weightage_type === t ? 'pms-chip-active' : ''}`} onClick={() => setEditItem(p => ({ ...p, weightage_type: t }))}>
                      {editItem.weightage_type === t && <Check size={13} />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pms-field"><label>Status</label>
                <div className="pms-chip-group">
                  {['Active', 'Inactive'].map(s => (
                    <button key={s} className={`pms-chip ${editItem.status === s ? 'pms-chip-active' : ''}`} onClick={() => setEditItem(p => ({ ...p, status: s }))}>
                      {editItem.status === s && <Check size={13} />} {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pms-section-label">Link Dimensions {(editItem.dimLinks || []).length > 0 && <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none', fontSize: 11 }}> — Total: {weightTotal}%</span>}</div>

              {editItem.weightage_type === 'Percentage' && (editItem.dimLinks || []).length > 0 && Math.abs(weightTotal - 100) > 0.5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, color: '#ef4444', fontSize: 13 }}>
                  <Info size={14} /> Weightages should sum to 100% (currently {weightTotal}%)
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allDims.map(dim => {
                  const linked = (editItem.dimLinks || []).find(l => l.dimensionId === dim.id);
                  return (
                    <div key={dim.id} className="pms-dim-row" style={{ borderColor: linked ? '#bfdbfe' : '#e2e8f0', background: linked ? '#eff6ff' : '#f8fafc' }}>
                      <input type="checkbox" checked={!!linked} onChange={() => toggleDim(dim)} />
                      <span className="pms-dim-row-name">{dim.name} <span style={{ color: '#94a3b8', fontSize: 11 }}>{dim.code}</span></span>
                      {linked && editItem.weightage_type === 'Percentage' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input className="pms-input" type="number" min="0" max="100" style={{ width: 70 }} value={linked.weightage} onChange={e => setWeightage(dim.id, e.target.value)} />
                          <span style={{ fontSize: 12, color: '#64748b' }}>%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {allDims.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No active dimensions. Create dimensions first.</p>}
              </div>
            </div>
            <div className="pms-drawer-footer">
              <button className="pms-btn pms-btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="pms-btn pms-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="pms-spin" /> Saving…</> : <><Check size={15} /> {editItem.id ? 'Save Changes' : 'Create Group'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
