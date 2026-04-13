import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Check, Loader2, Award, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface ScoreBand { id: number; from_score: number; to_score: number; rating: string; grade: string; remark?: string; status: string; createdAt: string; }

const RATINGS = ['Outstanding', 'Excellent', 'Good', 'Average', 'Poor'];
const GRADES = ['A+', 'A', 'B', 'C', 'D'];
const GRADE_COLOR: Record<string, string> = { 'A+': 'pms-grade-a-plus', A: 'pms-grade-a', B: 'pms-grade-b', C: 'pms-grade-c', D: 'pms-grade-d' };
const RATING_COLOR: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: '#fef3c7', text: '#92400e' }, Excellent: { bg: '#dcfce7', text: '#166534' },
  Good: { bg: '#eff6ff', text: '#1e40af' }, Average: { bg: '#faf5ff', text: '#6b21a8' }, Poor: { bg: '#fef2f2', text: '#991b1b' }
};
const EMPTY = { from_score: '', to_score: '', rating: 'Good', grade: 'B', remark: '', status: 'Active' };

export default function ScoreBandMaster() {
  const [bands, setBands] = useState<ScoreBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const fetchBands = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/pms/score-bands'); setBands(r.data); }
    catch { toast.error('Failed to load score bands'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBands(); }, [fetchBands]);

  const openAdd = () => { setEditItem({ ...EMPTY }); setDrawerOpen(true); };
  const openEdit = (b: ScoreBand) => { setEditItem({ ...b, from_score: String(b.from_score), to_score: String(b.to_score) }); setDrawerOpen(true); };

  const handleSave = async () => {
    const { from_score, to_score, rating, grade } = editItem;
    if (from_score === '' || to_score === '' || !rating || !grade) return toast.error('All required fields must be filled');
    if (Number(from_score) >= Number(to_score)) return toast.error('From score must be less than To score');
    setSaving(true);
    try {
      if (editItem.id) { await api.put(`/pms/score-bands/${editItem.id}`, editItem); toast.success('Band updated'); }
      else { await api.post('/pms/score-bands', editItem); toast.success('Band created'); }
      setDrawerOpen(false); fetchBands();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this score band?')) return;
    try { await api.delete(`/pms/score-bands/${id}`); toast.success('Deleted'); fetchBands(); }
    catch { toast.error('Failed'); }
  };

  const totalRange = bands.length > 0 ? Math.max(...bands.map(b => b.to_score)) : 100;

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><Award size={22} /></div>
            <div><h2>Score Band Master</h2><p>Define performance rating tiers by score ranges</p></div>
          </div>
          <div className="pms-header-actions">
            <button className="pms-btn pms-btn-primary" onClick={openAdd}><Plus size={16} /> Add Score Band</button>
          </div>
        </div>

        <div className="pms-stats-grid">
          {RATINGS.map(r => {
            const band = bands.find(b => b.rating === r && b.status === 'Active');
            const { bg, text } = RATING_COLOR[r] || { bg: '#f1f5f9', text: '#475569' };
            return (
              <div className="pms-stat-card" key={r} style={{ borderLeft: `4px solid ${text}` }}>
                <div style={{ flex: 1 }}>
                  <p className="pms-stat-label">{r}</p>
                  <p className="pms-stat-value" style={{ fontSize: 16, color: text }}>
                    {band ? `${band.from_score}–${band.to_score}` : 'Not set'}
                  </p>
                </div>
                {band && <span className={`pms-grade-badge ${GRADE_COLOR[band.grade]}`}>{band.grade}</span>}
              </div>
            );
          })}
        </div>

        {/* Visual band chart */}
        {bands.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, color: '#1e293b', fontSize: 14 }}>Score Range Visualization</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...bands].sort((a, b) => a.from_score - b.from_score).map(b => {
                const width = ((b.to_score - b.from_score) / totalRange) * 100;
                const { bg, text } = RATING_COLOR[b.rating] || { bg: '#e2e8f0', text: '#475569' };
                return (
                  <div className="pms-band-row" key={b.id}>
                    <span className="pms-band-range">{b.from_score} – {b.to_score}</span>
                    <div className="pms-band-fill">
                      <div className="pms-band-inner" style={{ width: `${width}%`, background: text }} />
                    </div>
                    <span style={{ color: text, fontWeight: 700, fontSize: 13, minWidth: 80 }}>{b.rating}</span>
                    <span className={`pms-grade-badge ${GRADE_COLOR[b.grade]}`}>{b.grade}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pms-table-wrap">
          <table className="pms-table">
            <thead>
              <tr><th>#</th><th>From Score</th><th>To Score</th><th>Rating</th><th>Grade</th><th>Remark</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="pms-loading"><Loader2 size={22} className="pms-spin" />Loading…</td></tr>
                : bands.length === 0 ? <tr><td colSpan={8} className="pms-empty">No score bands yet. Add your first band above.</td></tr>
                : [...bands].sort((a, b) => b.from_score - a.from_score).map((b, i) => {
                  const { bg, text } = RATING_COLOR[b.rating] || { bg: '#f1f5f9', text: '#64748b' };
                  return (
                    <tr key={b.id}>
                      <td className="pms-td-sr">{i + 1}</td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e293b', fontWeight: 700 }}><ArrowUp size={14} style={{ color: '#22c55e' }} />{b.from_score}</div></td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e293b', fontWeight: 700 }}><ArrowDown size={14} style={{ color: '#ef4444' }} />{b.to_score}</div></td>
                      <td><span style={{ background: bg, color: text, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{b.rating}</span></td>
                      <td><span className={`pms-grade-badge ${GRADE_COLOR[b.grade]}`}>{b.grade}</span></td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{b.remark || '—'}</td>
                      <td><span className={`pms-badge ${b.status === 'Active' ? 'pms-badge-active' : 'pms-badge-inactive'}`}>{b.status}</span></td>
                      <td>
                        <div className="pms-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="pms-action-btn pms-action-edit" onClick={() => openEdit(b)}><Edit2 size={14} /></button>
                          <button className="pms-action-btn pms-action-delete" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {drawerOpen && (
        <div className="pms-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="pms-drawer" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="pms-drawer-header">
              <div className="pms-drawer-title"><Award size={18} /> {editItem.id ? 'Edit Score Band' : 'New Score Band'}</div>
              <button className="pms-drawer-close" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            <div className="pms-drawer-body">
              <div className="pms-section-label">Score Range</div>
              <div className="pms-grid-2">
                <div className="pms-field"><label>From Score <span className="pms-req">*</span></label><input className="pms-input" type="number" min="0" max="100" placeholder="e.g. 75" value={editItem.from_score} onChange={e => setEditItem((p: any) => ({ ...p, from_score: e.target.value }))} /></div>
                <div className="pms-field"><label>To Score <span className="pms-req">*</span></label><input className="pms-input" type="number" min="0" max="100" placeholder="e.g. 89" value={editItem.to_score} onChange={e => setEditItem((p: any) => ({ ...p, to_score: e.target.value }))} /></div>
              </div>
              <div className="pms-section-label">Performance Rating</div>
              <div className="pms-field"><label>Rating <span className="pms-req">*</span></label>
                <div className="pms-chip-group">
                  {RATINGS.map(r => {
                    const { bg, text } = RATING_COLOR[r] || { bg: '#f1f5f9', text: '#64748b' };
                    return (
                      <button key={r} className={`pms-chip ${editItem.rating === r ? 'pms-chip-active' : ''}`}
                        style={editItem.rating === r ? { background: bg, borderColor: text, color: text } : {}}
                        onClick={() => setEditItem((p: any) => ({ ...p, rating: r }))}>
                        {editItem.rating === r && <Check size={12} />} {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pms-field"><label>Grade <span className="pms-req">*</span></label>
                <div className="pms-chip-group">
                  {GRADES.map(g => (
                    <button key={g} className={`pms-chip ${editItem.grade === g ? 'pms-chip-active' : ''}`} onClick={() => setEditItem((p: any) => ({ ...p, grade: g }))}>
                      {editItem.grade === g && <Check size={12} />} {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pms-field"><label>Remark</label><input className="pms-input" placeholder="e.g. Exceeds expectations" value={editItem.remark || ''} onChange={e => setEditItem((p: any) => ({ ...p, remark: e.target.value }))} /></div>
              <div className="pms-field"><label>Status</label>
                <div className="pms-chip-group">
                  {['Active', 'Inactive'].map(s => (
                    <button key={s} className={`pms-chip ${editItem.status === s ? 'pms-chip-active' : ''}`} onClick={() => setEditItem((p: any) => ({ ...p, status: s }))}>{editItem.status === s && <Check size={12} />} {s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pms-drawer-footer">
              <button className="pms-btn pms-btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="pms-btn pms-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="pms-spin" /> Saving…</> : <><Check size={15} /> {editItem.id ? 'Update' : 'Create'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
