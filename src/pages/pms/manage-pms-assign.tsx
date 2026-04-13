import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Check, Loader2, ClipboardList, Users, Calendar, ChevronLeft, ChevronRight, Filter, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface Branch { id: number; name: string; }
interface Department { id: number; name: string; }
interface SubGroup { id: number; name: string; }
interface User { id: number; name: string; }
interface AssignedEmp { id: number; userId: number; evaluation_status: string; user: { id: number; name: string }; }
interface PmsAssign {
  id: number; pms_type: string; pms_date: string; status: string; description?: string;
  branch?: Branch; department?: Department; subGroup?: SubGroup;
  assignedEmployees: AssignedEmp[];
  createdAt: string;
}

const PMS_TYPES = ['Weekly', 'Monthly', 'Quarterly', 'Annual'];
const EMPTY_FORM = { pms_type: 'Monthly', pms_date: '', status: 'Active', description: '', branch_id: '', department_id: '', sub_group_id: '', employee_ids: [] as number[] };

export default function ManagePMSAssign() {
  const [assigns, setAssigns] = useState<PmsAssign[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>({ ...EMPTY_FORM });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const perPage = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterType) params.pms_type = filterType;
      if (filterBranch) params.branch_id = filterBranch;
      const [aRes, bRes, sRes, uRes] = await Promise.all([
        api.get('/pms/assign', { params }),
        api.get('/api/branches'),
        api.get('/pms/sub-groups'),
        api.get('/api/users?status=Active')
      ]);
      setAssigns(aRes.data); setBranches(bRes.data); setSubGroups(sRes.data); setUsers(uRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [filterType, filterBranch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchDepts = async (branchId: string) => {
    if (!branchId) return setDepartments([]);
    try { const r = await api.get(`/api/departments?branch_id=${branchId}`); setDepartments(r.data); }
    catch { /* silent */ }
  };

  const openAdd = () => { setEditItem({ ...EMPTY_FORM, pms_date: new Date().toISOString().split('T')[0] }); setEditMode(false); setDrawerOpen(true); };
  const openEdit = (a: PmsAssign) => {
    setEditItem({ pms_type: a.pms_type, pms_date: a.pms_date.split('T')[0], status: a.status, description: a.description || '', branch_id: String(a.branch?.id || ''), department_id: String(a.department?.id || ''), sub_group_id: String(a.subGroup?.id || ''), employee_ids: a.assignedEmployees.map(e => e.userId), id: a.id });
    if (a.branch?.id) fetchDepts(String(a.branch.id));
    setEditMode(true); setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!editItem.pms_type || !editItem.pms_date) return toast.error('Type and date are required');
    if (!editItem.employee_ids?.length) return toast.error('Select at least one employee');
    setSaving(true);
    try {
      const payload = { ...editItem, branch_id: editItem.branch_id || null, department_id: editItem.department_id || null, sub_group_id: editItem.sub_group_id || null };
      if (editMode && editItem.id) { await api.put(`/pms/assign/${editItem.id}`, payload); toast.success('Updated'); }
      else { await api.post('/pms/assign', payload); toast.success('PMS assigned!'); }
      setDrawerOpen(false); fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    try { await api.delete(`/pms/assign/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const toggleEmp = (uid: number) => setEditItem((p: any) => ({
    ...p, employee_ids: p.employee_ids.includes(uid) ? p.employee_ids.filter((x: number) => x !== uid) : [...p.employee_ids, uid]
  }));
  const selectAll = () => setEditItem((p: any) => ({ ...p, employee_ids: p.employee_ids.length === users.length ? [] : users.map(u => u.id) }));

  const paged = assigns.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(assigns.length / perPage);
  const toggleSel = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const completionPct = (a: PmsAssign) => {
    if (!a.assignedEmployees.length) return 0;
    return Math.round(a.assignedEmployees.filter(e => e.evaluation_status === 'Completed').length / a.assignedEmployees.length * 100);
  };

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><ClipboardList size={22} /></div>
            <div><h2>Manage PMS Assign</h2><p>Assign PMS cycles to employees for evaluation</p></div>
          </div>
          <div className="pms-header-actions">
            {selected.length > 0 && <button className="pms-btn pms-btn-danger pms-btn-sm" onClick={() => { if (confirm(`Delete ${selected.length}?`)) Promise.all(selected.map(id => api.delete(`/pms/assign/${id}`))).then(() => { toast.success('Deleted'); setSelected([]); fetchData(); }); }}><Trash2 size={14} /> Delete ({selected.length})</button>}
            <button className="pms-btn pms-btn-primary" onClick={openAdd}><Plus size={16} /> Assign PMS</button>
          </div>
        </div>

        <div className="pms-stats-grid">
          {[
            { label: 'Total Assignments', val: assigns.length, cls: 'blue' },
            { label: 'Active', val: assigns.filter(a => a.status === 'Active').length, cls: 'green' },
            { label: 'Monthly', val: assigns.filter(a => a.pms_type === 'Monthly').length, cls: 'purple' },
            { label: 'Weekly', val: assigns.filter(a => a.pms_type === 'Weekly').length, cls: 'amber' },
          ].map(s => (
            <div className="pms-stat-card" key={s.label}>
              <div className={`pms-stat-icon ${s.cls}`}><ClipboardList size={20} /></div>
              <div><p className="pms-stat-label">{s.label}</p><p className="pms-stat-value">{s.val}</p></div>
            </div>
          ))}
        </div>

        <div className="pms-filters">
          <div className="pms-field"><label>PMS Type</label>
            <select className="pms-select" value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>{PMS_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="pms-field"><label>Branch</label>
            <select className="pms-select" value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setPage(1); }}>
              <option value="">All Branches</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button className="pms-btn pms-btn-secondary" onClick={fetchData}><Filter size={15} /> Apply</button>
          <button className="pms-btn pms-btn-ghost" onClick={() => { setFilterType(''); setFilterBranch(''); }}><X size={14} /> Clear</button>
        </div>

        <div className="pms-table-wrap">
          <table className="pms-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={() => setSelected(selected.length === paged.length ? [] : paged.map(a => a.id))} /></th>
                <th>#</th><th>PMS Type</th><th>Date</th><th>Sub-Group</th><th>Employees</th><th>Completion</th><th>Branch/Dept</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="pms-loading"><Loader2 size={22} className="pms-spin" />Loading…</td></tr>
                : paged.length === 0 ? <tr><td colSpan={10} className="pms-empty">No assignments yet. Click Assign PMS to create one.</td></tr>
                : paged.map((a, i) => {
                  const pct = completionPct(a);
                  return (
                    <tr key={a.id} className={selected.includes(a.id) ? 'pms-tr-selected' : ''}>
                      <td><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSel(a.id)} /></td>
                      <td className="pms-td-sr">{(page - 1) * perPage + i + 1}</td>
                      <td>
                        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>
                          {a.pms_type}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: 13 }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />{new Date(a.pms_date).toLocaleDateString()}</div></td>
                      <td><div className="pms-name" style={{ fontSize: 13 }}>{a.subGroup?.name || <span style={{ color: '#94a3b8' }}>—</span>}</div></td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={13} style={{ color: '#64748b' }} /><span style={{ fontWeight: 600 }}>{a.assignedEmployees.length}</span></div></td>
                      <td>
                        <div className="pms-progress-wrap">
                          <div className="pms-progress-bar"><div className={`pms-progress-fill ${pct >= 80 ? 'green' : pct >= 40 ? 'amber' : ''}`} style={{ width: `${pct}%` }} /></div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 80 ? '#16a34a' : pct >= 40 ? '#ca8a04' : '#ef4444' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{a.branch?.name || '—'}{a.department ? ` / ${a.department.name}` : ''}</td>
                      <td><span className={`pms-badge ${a.status === 'Active' ? 'pms-badge-active' : a.status === 'Completed' ? 'pms-badge-completed' : 'pms-badge-inactive'}`}>{a.status}</span></td>
                      <td>
                        <div className="pms-actions">
                          <button className="pms-action-btn pms-action-edit" onClick={() => openEdit(a)}><Edit2 size={14} /></button>
                          <button className="pms-action-btn pms-action-delete" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="pms-pagination">
          <span className="pms-pag-info">Showing {Math.min((page - 1) * perPage + 1, assigns.length)}–{Math.min(page * perPage, assigns.length)} of {assigns.length}</span>
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
              <div className="pms-drawer-title"><ClipboardList size={18} /> {editMode ? 'Edit Assignment' : 'Assign PMS'}</div>
              <button className="pms-drawer-close" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            <div className="pms-drawer-body">
              <div className="pms-section-label">Cycle Details</div>
              <div className="pms-grid-2">
                <div className="pms-field"><label>PMS Type <span className="pms-req">*</span></label>
                  <select className="pms-select pms-input" value={editItem.pms_type} onChange={e => setEditItem((p: any) => ({ ...p, pms_type: e.target.value }))}>
                    {PMS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="pms-field"><label>PMS Date <span className="pms-req">*</span></label><input className="pms-input" type="date" value={editItem.pms_date} onChange={e => setEditItem((p: any) => ({ ...p, pms_date: e.target.value }))} /></div>
              </div>
              <div className="pms-field"><label>Dimension Sub-Group</label>
                <select className="pms-select pms-input" value={editItem.sub_group_id} onChange={e => setEditItem((p: any) => ({ ...p, sub_group_id: e.target.value }))}>
                  <option value="">— Select Sub-Group —</option>{subGroups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="pms-field"><label>Description</label><textarea className="pms-textarea pms-input" rows={2} value={editItem.description} onChange={e => setEditItem((p: any) => ({ ...p, description: e.target.value }))} /></div>

              <div className="pms-section-label">Filters</div>
              <div className="pms-grid-2">
                <div className="pms-field"><label>Branch</label>
                  <select className="pms-select pms-input" value={editItem.branch_id} onChange={e => { setEditItem((p: any) => ({ ...p, branch_id: e.target.value, department_id: '' })); fetchDepts(e.target.value); }}>
                    <option value="">All Branches</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="pms-field"><label>Department</label>
                  <select className="pms-select pms-input" value={editItem.department_id} onChange={e => setEditItem((p: any) => ({ ...p, department_id: e.target.value }))}>
                    <option value="">All Departments</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pms-field"><label>Status</label>
                <div className="pms-chip-group">
                  {['Active', 'Completed', 'Cancelled'].map(s => (
                    <button key={s} className={`pms-chip ${editItem.status === s ? 'pms-chip-active' : ''}`} onClick={() => setEditItem((p: any) => ({ ...p, status: s }))}>{editItem.status === s && <Check size={12} />} {s}</button>
                  ))}
                </div>
              </div>

              <div className="pms-section-label">
                Assign Employees <span className="pms-req">*</span>
                <span style={{ color: '#64748b', fontWeight: 400, textTransform: 'none', fontSize: 11 }}> — {editItem.employee_ids.length} selected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{users.length} employees available</span>
                <button className="pms-btn pms-btn-ghost pms-btn-sm" onClick={selectAll}>
                  <CheckCircle2 size={13} /> {editItem.employee_ids.length === users.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {users.map(u => {
                  const sel = editItem.employee_ids.includes(u.id);
                  return (
                    <div key={u.id} onClick={() => toggleEmp(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${sel ? '#bfdbfe' : '#e2e8f0'}`, background: sel ? '#eff6ff' : 'white', transition: '0.2s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? '#3b82f6' : '#cbd5e1'}`, background: sel ? '#3b82f6' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sel && <Check size={11} color="white" />}
                      </div>
                      <Users size={14} style={{ color: '#64748b' }} />
                      <span style={{ fontSize: 14, color: '#1e293b', fontWeight: sel ? 600 : 400 }}>{u.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pms-drawer-footer">
              <button className="pms-btn pms-btn-secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="pms-btn pms-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={15} className="pms-spin" /> Saving…</> : <><Check size={15} /> {editMode ? 'Save Changes' : `Assign to ${editItem.employee_ids.length} Employee${editItem.employee_ids.length !== 1 ? 's' : ''}`}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
