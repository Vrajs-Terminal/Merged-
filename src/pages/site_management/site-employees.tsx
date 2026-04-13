import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Trash2, Edit2, Search, X, Loader2, ChevronLeft, ChevronRight,
  CheckCircle, Calendar, UserCheck, Clock, Building2
} from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface SiteEmployee {
  id: number;
  site_id: number;
  user_id: number;
  role: string;
  shift_id?: number;
  join_date: string;
  exit_date?: string;
  status: string;
  user?: { id: number; name: string; employeeGrade?: { name: string }; designation?: { name: string } };
  site?: { id: number; name: string };
  shift?: { id: number; name: string; start_time: string; end_time: string };
}

interface Site { id: number; name: string; }
interface User { id: number; name: string; }
interface Shift { id: number; name: string; start_time: string; end_time: string; }

const ROLES = ["Worker", "Supervisor", "Engineer", "Manager", "Security", "Contractor", "Other"];

export default function SiteEmployees() {
  const [employees, setEmployees] = useState<SiteEmployee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<SiteEmployee | null>(null);
  const [search, setSearch] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_id: "", user_ids: [] as number[], role: "Worker", shift_id: "", join_date: "", status: "Active"
  });
  const [editForm, setEditForm] = useState({ role: "", shift_id: "", exit_date: "", status: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, sRes, uRes, shRes] = await Promise.all([
        fetch(`${API}/employees${filterSite ? `?site_id=${filterSite}` : ""}`),
        fetch(`${API}/sites`),
        fetch("/api/users?status=Active"),
        fetch("/api/shifts")
      ]);
      if (eRes.ok) setEmployees(await eRes.json());
      if (sRes.ok) setSites(await sRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (shRes.ok) setShifts(await shRes.json());
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [filterSite]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async () => {
    if (!form.site_id || form.user_ids.length === 0 || !form.join_date) {
      return toast.error("Site, employee(s) and join date are required");
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Assignment failed");
      toast.success(`${data.added.length} employee(s) assigned! ${data.skipped > 0 ? `(${data.skipped} skipped - already exists)` : ""}`);
      setDrawerOpen(false);
      setForm({ site_id: "", user_ids: [], role: "Worker", shift_id: "", join_date: "", status: "Active" });
      fetchData();
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/employees/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success("Updated successfully");
        setEditTarget(null);
        fetchData();
      } else {
        const d = await res.json();
        toast.error(d.message || "Update failed");
      }
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (id: number) => {
    if (!confirm("Remove this employee from site?")) return;
    try {
      const res = await fetch(`${API}/employees/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Removed"); fetchData(); }
      else { const d = await res.json(); toast.error(d.message || "Failed"); }
    } catch { toast.error("Server error"); }
  };

  const toggleUser = (id: number) =>
    setForm(p => ({ ...p, user_ids: p.user_ids.includes(id) ? p.user_ids.filter(x => x !== id) : [...p.user_ids, id] }));

  const filtered = employees.filter(e =>
    !search ||
    e.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    e.site?.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { Active: "active", Terminated: "inactive", Reassigned: "pending" };
    return <span className={`sm-badge sm-badge--${map[s] || "active"}`}>{s}</span>;
  };

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><Users size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Employees</h1>
            <p className="sm-header__sub">Assign and manage staff deployed at your sites</p>
          </div>
        </div>
        <div className="sm-header__actions">
          <button className="sm-btn sm-btn--primary" onClick={() => { setEditMode(false); setDrawerOpen(true); }}>
            <Plus size={16} /> Assign Employee
          </button>
        </div>
      </div>

      <div className="sm-stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="sm-stat"><span className="sm-stat__val">{employees.length}</span><span className="sm-stat__label">Total Assignments</span></div>
        <div className="sm-stat"><span className="sm-stat__val">{employees.filter(e => e.status === "Active").length}</span><span className="sm-stat__label">Active</span></div>
        <div className="sm-stat"><span className="sm-stat__val">{employees.filter(e => e.status === "Terminated").length}</span><span className="sm-stat__label">Terminated</span></div>
      </div>

      {/* Filters */}
      <div className="sm-controls">
        <div className="sm-controls__left">
          <label className="sm-select-wrap">
            Show <select className="sm-select" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
              <option>25</option><option>50</option><option>100</option>
            </select> entries
          </label>
          <select className="sm-select" value={filterSite} onChange={e => { setFilterSite(e.target.value); setPage(1); }}>
            <option value="">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="sm-search-wrap">
          <Search size={16} className="sm-search-icon" />
          <input className="sm-search" placeholder="Search by name, site, role..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button className="sm-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
      </div>

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Loading…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === paged.length && paged.length > 0}
                  onChange={() => setSelected(selected.length === paged.length ? [] : paged.map(e => e.id))} /></th>
                <th>#</th>
                <th>Employee</th>
                <th>Site</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Join Date</th>
                <th>Exit Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={10} className="sm-empty">No assignments found</td></tr>
              ) : paged.map((emp, i) => (
                <tr key={emp.id} className={selected.includes(emp.id) ? "sm-tr--selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleSelect(emp.id)} /></td>
                  <td className="sm-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td>
                    <div className="sm-site-name">{emp.user?.name || "—"}</div>
                    {emp.user?.designation?.name && <div className="sm-site-loc">{emp.user.designation.name}</div>}
                  </td>
                  <td>
                    <span style={{ color: "#c7d2fe", fontWeight: 500 }}>{emp.site?.name || "—"}</span>
                  </td>
                  <td><span className="sm-bearer sm-bearer--company">{emp.role}</span></td>
                  <td>
                    {emp.shift ? (
                      <span className="sm-area"><Clock size={12} /> {emp.shift.name} ({emp.shift.start_time}–{emp.shift.end_time})</span>
                    ) : "—"}
                  </td>
                  <td>{new Date(emp.join_date).toLocaleDateString()}</td>
                  <td>{emp.exit_date ? new Date(emp.exit_date).toLocaleDateString() : <span className="sm-text-dim">Active</span>}</td>
                  <td>{statusBadge(emp.status)}</td>
                  <td>
                    <div className="sm-actions">
                      <button className="sm-action-btn sm-action-btn--edit" title="Edit" onClick={() => {
                        setEditTarget(emp);
                        setEditForm({ role: emp.role, shift_id: String(emp.shift_id || ""), exit_date: emp.exit_date?.split("T")[0] || "", status: emp.status });
                      }}><Edit2 size={14} /></button>
                      <button className="sm-action-btn sm-action-btn--delete" title="Remove" onClick={() => handleRemove(emp.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="sm-pagination">
        <span className="sm-pag-info">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
        <div className="sm-pag-btns">
          <button className="sm-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`sm-pag-btn ${p === page ? "sm-pag-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="sm-pag-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Assign Drawer */}
      {drawerOpen && (
        <div className="sm-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="sm-drawer" onClick={e => e.stopPropagation()}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title"><UserCheck size={20} /> Assign Employee(s) to Site</div>
              <button className="sm-drawer__close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-section-label">Assignment Details</div>
              <div className="sm-field">
                <label>Select Site <span className="sm-req">*</span></label>
                <select value={form.site_id} onChange={e => setForm(p => ({ ...p, site_id: e.target.value }))}>
                  <option value="">Choose a site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Role</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Assign Shift</label>
                <select value={form.shift_id} onChange={e => setForm(p => ({ ...p, shift_id: e.target.value }))}>
                  <option value="">Default shift</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time}–{s.end_time})</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Join Date <span className="sm-req">*</span></label>
                <input type="date" value={form.join_date} onChange={e => setForm(p => ({ ...p, join_date: e.target.value }))} />
              </div>
              <div className="sm-section-label" style={{ marginTop: 16 }}>Select Employee(s) <span className="sm-req">*</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {users.map(u => (
                  <label key={u.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    background: form.user_ids.includes(u.id) ? "rgba(99,102,241,0.12)" : "var(--sm-surface-2)",
                    border: `1px solid ${form.user_ids.includes(u.id) ? "var(--sm-primary)" : "var(--sm-border)"}`,
                    borderRadius: 8, cursor: "pointer", transition: "all 0.2s", fontSize: 13
                  }}>
                    <input type="checkbox" checked={form.user_ids.includes(u.id)} onChange={() => toggleUser(u.id)} />
                    <span style={{ color: "var(--sm-text)" }}>{u.name}</span>
                  </label>
                ))}
              </div>
              {form.user_ids.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--sm-primary)" }}>
                  {form.user_ids.length} employee(s) selected for bulk assign
                </div>
              )}
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="sm-btn sm-btn--primary" onClick={handleAssign} disabled={saving}>
                {saving ? <><Loader2 className="sm-spin" size={16} /> Saving…</> : <><CheckCircle size={16} /> Assign</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="sm-overlay" onClick={() => setEditTarget(null)}>
          <div className="sm-drawer" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title"><Edit2 size={18} /> Update Assignment</div>
              <button className="sm-drawer__close" onClick={() => setEditTarget(null)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-field"><label>Role</label>
                <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}><label>Shift</label>
                <select value={editForm.shift_id} onChange={e => setEditForm(p => ({ ...p, shift_id: e.target.value }))}>
                  <option value="">Default</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}><label>Exit Date</label>
                <input type="date" value={editForm.exit_date} onChange={e => setEditForm(p => ({ ...p, exit_date: e.target.value }))} />
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}><label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  <option>Active</option><option>Reassigned</option><option>Terminated</option>
                </select>
              </div>
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="sm-btn sm-btn--primary" onClick={handleUpdate} disabled={saving}>
                {saving ? <Loader2 className="sm-spin" size={16} /> : <CheckCircle size={16} />} Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
