import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Edit2, Eye, Search, X, Building2, Phone, MapPin,
  Percent, ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertCircle,
  Calendar, FileText, DollarSign, Users, Filter, Download
} from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface Site {
  id: number;
  name: string;
  contact_name: string;
  mobile_no: string;
  email?: string;
  area: string;
  address?: string;
  city_state?: string;
  revenue_share_pct: number;
  commission_bearer: string;
  status: string;
  agreement_start?: string;
  agreement_end?: string;
  document_url?: string;
  branch_id: number;
  department_id?: number;
  reporting_manager_id?: number;
  createdAt: string;
  branch?: { id: number; name: string; code: string };
  department?: { id: number; name: string };
  reportingManager?: { id: number; name: string };
  _count?: { siteEmployees: number };
}

interface Branch { id: number; name: string; code: string; }
interface Department { id: number; name: string; }
interface User { id: number; name: string; }

const EMPTY_FORM = {
  name: "", contact_name: "", mobile_no: "", email: "", area: "",
  address: "", city_state: "", revenue_share_pct: "", commission_bearer: "Company",
  status: "Active", agreement_start: "", agreement_end: "", document_url: "",
  branch_id: "", department_id: "", reporting_manager_id: ""
};

export default function ManageSite() {
  const [sites, setSites] = useState<Site[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/sites`);
      const data = await res.json();
      setSites(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load sites"); }
    finally { setLoading(false); }
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        fetch("/api/branches"), fetch("/api/users?status=Active")
      ]);
      if (bRes.ok) setBranches(await bRes.json());
      if (uRes.ok) setUsers(await uRes.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchSites(); fetchMeta(); }, [fetchSites, fetchMeta]);

  const fetchDepartments = async (branchId: string) => {
    if (!branchId) return setDepartments([]);
    try {
      const res = await fetch(`/api/departments?branch_id=${branchId}`);
      if (res.ok) setDepartments(await res.json());
    } catch { /* silent */ }
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditMode(false);
    setDrawerOpen(true);
  };

  const openEdit = (site: Site) => {
    setForm({
      name: site.name, contact_name: site.contact_name, mobile_no: site.mobile_no,
      email: site.email || "", area: site.area, address: site.address || "",
      city_state: site.city_state || "", revenue_share_pct: String(site.revenue_share_pct),
      commission_bearer: site.commission_bearer, status: site.status,
      agreement_start: site.agreement_start ? site.agreement_start.split("T")[0] : "",
      agreement_end: site.agreement_end ? site.agreement_end.split("T")[0] : "",
      document_url: site.document_url || "",
      branch_id: String(site.branch_id),
      department_id: String(site.department_id || ""),
      reporting_manager_id: String(site.reporting_manager_id || "")
    });
    fetchDepartments(String(site.branch_id));
    setSelectedSite(site);
    setEditMode(true);
    setDrawerOpen(true);
  };

  const openView = (site: Site) => {
    setSelectedSite(site);
    setViewDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.contact_name || !form.mobile_no || !form.area || !form.branch_id || !form.revenue_share_pct) {
      return toast.error("Please fill all required fields");
    }
    if (Number(form.revenue_share_pct) < 0 || Number(form.revenue_share_pct) > 100) {
      return toast.error("Revenue share % must be between 0 and 100");
    }
    setSaving(true);
    try {
      const url = editMode ? `${API}/sites/${selectedSite!.id}` : `${API}/sites`;
      const method = editMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "Save failed");
      toast.success(editMode ? "Site updated!" : "Site added!");
      setDrawerOpen(false);
      fetchSites();
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this site? This will also remove all linked employees and attendance data.")) return;
    try {
      const res = await fetch(`${API}/sites/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Site deleted"); fetchSites(); }
      else { const d = await res.json(); toast.error(d.message || "Delete failed"); }
    } catch { toast.error("Server error"); }
  };

  const filtered = sites.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile_no.includes(search) ||
    s.area.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () =>
    setSelected(selected.length === paged.length ? [] : paged.map(s => s.id));

  const statusBadge = (s: string) => (
    <span className={`sm-badge sm-badge--${s.toLowerCase()}`}>{s}</span>
  );
  const bearerBadge = (b: string) => (
    <span className={`sm-bearer sm-bearer--${b.toLowerCase().replace(" ", "-")}`}>{b}</span>
  );

  return (
    <div className="sm-page">
      {/* Header */}
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><Building2 size={22} /></div>
          <div>
            <h1 className="sm-header__title">Manage Sites</h1>
            <p className="sm-header__sub">Track all business sites, revenue sharing &amp; client locations</p>
          </div>
        </div>
        <div className="sm-header__actions">
          <button className="sm-btn sm-btn--secondary" onClick={() => window.print()}>
            <Download size={16} /> Export
          </button>
          <button className="sm-btn sm-btn--primary" onClick={openAdd}>
            <Plus size={16} /> Add Site
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sm-stats">
        <div className="sm-stat"><span className="sm-stat__val">{sites.length}</span><span className="sm-stat__label">Total Sites</span></div>
        <div className="sm-stat"><span className="sm-stat__val">{sites.filter(s => s.status === "Active").length}</span><span className="sm-stat__label">Active</span></div>
        <div className="sm-stat"><span className="sm-stat__val">{sites.filter(s => s.status === "Inactive").length}</span><span className="sm-stat__label">Inactive</span></div>
        <div className="sm-stat"><span className="sm-stat__val">{sites.reduce((a, s) => a + (s._count?.siteEmployees || 0), 0)}</span><span className="sm-stat__label">Total Employees</span></div>
      </div>

      {/* Controls */}
      <div className="sm-controls">
        <div className="sm-controls__left">
          <label className="sm-select-wrap">
            Show
            <select className="sm-select" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}>
              <option>25</option><option>50</option><option>100</option>
            </select>
            entries
          </label>
          {selected.length > 0 && (
            <button className="sm-btn sm-btn--danger-ghost" onClick={() => {
              if (confirm(`Delete ${selected.length} selected sites?`)) {
                Promise.all(selected.map(id => fetch(`${API}/sites/${id}`, { method: "DELETE" }))).then(() => {
                  toast.success("Deleted selected sites"); setSelected([]); fetchSites();
                });
              }
            }}>
              <Trash2 size={15} /> Delete ({selected.length})
            </button>
          )}
        </div>
        <div className="sm-search-wrap">
          <Search size={16} className="sm-search-icon" />
          <input className="sm-search" placeholder="Search sites..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button className="sm-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Loading sites…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} /></th>
                <th>#</th>
                <th>Site Name</th>
                <th>Contact Person</th>
                <th>Mobile No.</th>
                <th>Site Area</th>
                <th>Revenue %</th>
                <th>Branch</th>
                <th>Commission Bearer</th>
                <th>Employees</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={12} className="sm-empty">No sites found</td></tr>
              ) : paged.map((site, i) => (
                <tr key={site.id} className={selected.includes(site.id) ? "sm-tr--selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(site.id)} onChange={() => toggleSelect(site.id)} /></td>
                  <td className="sm-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td className="sm-td-name">
                    <div className="sm-site-name">{site.name}</div>
                    {site.city_state && <div className="sm-site-loc">{site.city_state}</div>}
                  </td>
                  <td>{site.contact_name}</td>
                  <td>
                    <a href={`tel:${site.mobile_no}`} className="sm-phone-link">
                      <Phone size={12} /> {site.mobile_no}
                    </a>
                  </td>
                  <td><span className="sm-area"><MapPin size={12} /> {site.area}</span></td>
                  <td>
                    <div className="sm-rev-bar">
                      <div className="sm-rev-fill" style={{ width: `${site.revenue_share_pct}%` }} />
                      <span>{site.revenue_share_pct}%</span>
                    </div>
                  </td>
                  <td>{site.branch?.name || "—"}</td>
                  <td>{bearerBadge(site.commission_bearer)}</td>
                  <td>
                    <span className="sm-emp-count">
                      <Users size={13} /> {site._count?.siteEmployees || 0}
                    </span>
                  </td>
                  <td>{statusBadge(site.status)}</td>
                  <td>
                    <div className="sm-actions">
                      <button className="sm-action-btn sm-action-btn--view" title="View" onClick={() => openView(site)}><Eye size={14} /></button>
                      <button className="sm-action-btn sm-action-btn--edit" title="Edit" onClick={() => openEdit(site)}><Edit2 size={14} /></button>
                      <button className="sm-action-btn sm-action-btn--delete" title="Delete" onClick={() => handleDelete(site.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="sm-pagination">
        <span className="sm-pag-info">Showing {Math.min((page-1)*perPage+1, filtered.length)}–{Math.min(page*perPage, filtered.length)} of {filtered.length}</span>
        <div className="sm-pag-btns">
          <button className="sm-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`sm-pag-btn ${p === page ? "sm-pag-btn--active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="sm-pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="sm-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="sm-drawer" onClick={e => e.stopPropagation()}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title">
                <Building2 size={20} />
                {editMode ? "Edit Site" : "Add New Site"}
              </div>
              <button className="sm-drawer__close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-section-label">Basic Details</div>
              <div className="sm-grid-2">
                <div className="sm-field">
                  <label>Site Name <span className="sm-req">*</span></label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Mahindra HQ Site" />
                </div>
                <div className="sm-field">
                  <label>Contact Person <span className="sm-req">*</span></label>
                  <input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} placeholder="Site manager name" />
                </div>
                <div className="sm-field">
                  <label>Mobile Number <span className="sm-req">*</span></label>
                  <input value={form.mobile_no} onChange={e => setForm(p => ({ ...p, mobile_no: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="sm-field">
                  <label>Email ID</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="site@company.com" />
                </div>
              </div>

              <div className="sm-section-label">Location Details</div>
              <div className="sm-grid-2">
                <div className="sm-field">
                  <label>Site Area <span className="sm-req">*</span></label>
                  <input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="City / Area" />
                </div>
                <div className="sm-field">
                  <label>City / State</label>
                  <input value={form.city_state} onChange={e => setForm(p => ({ ...p, city_state: e.target.value }))} placeholder="Mumbai, Maharashtra" />
                </div>
                <div className="sm-field sm-field--full">
                  <label>Full Address</label>
                  <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} placeholder="Complete address..." />
                </div>
              </div>

              <div className="sm-section-label">Business Details</div>
              <div className="sm-grid-2">
                <div className="sm-field">
                  <label>Share Revenue % <span className="sm-req">*</span></label>
                  <input type="number" min="0" max="100" value={form.revenue_share_pct}
                    onChange={e => setForm(p => ({ ...p, revenue_share_pct: e.target.value }))} placeholder="e.g. 15" />
                </div>
                <div className="sm-field">
                  <label>Commission Bearer <span className="sm-req">*</span></label>
                  <select value={form.commission_bearer} onChange={e => setForm(p => ({ ...p, commission_bearer: e.target.value }))}>
                    <option>Company</option><option>Client</option><option>Both</option>
                  </select>
                </div>
                <div className="sm-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
                <div className="sm-field">
                  <label>Agreement Start Date</label>
                  <input type="date" value={form.agreement_start} onChange={e => setForm(p => ({ ...p, agreement_start: e.target.value }))} />
                </div>
                <div className="sm-field">
                  <label>Agreement End Date</label>
                  <input type="date" value={form.agreement_end} onChange={e => setForm(p => ({ ...p, agreement_end: e.target.value }))} />
                </div>
                <div className="sm-field">
                  <label>Document URL</label>
                  <input value={form.document_url} onChange={e => setForm(p => ({ ...p, document_url: e.target.value }))} placeholder="Agreement file link" />
                </div>
              </div>

              <div className="sm-section-label">Assignment</div>
              <div className="sm-grid-2">
                <div className="sm-field">
                  <label>Site Branch <span className="sm-req">*</span></label>
                  <select value={form.branch_id} onChange={e => { setForm(p => ({ ...p, branch_id: e.target.value, department_id: "" })); fetchDepartments(e.target.value); }}>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                  </select>
                </div>
                <div className="sm-field">
                  <label>Department</label>
                  <select value={form.department_id} onChange={e => setForm(p => ({ ...p, department_id: e.target.value }))}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="sm-field sm-field--full">
                  <label>Reporting Manager</label>
                  <select value={form.reporting_manager_id} onChange={e => setForm(p => ({ ...p, reporting_manager_id: e.target.value }))}>
                    <option value="">Select Manager</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="sm-btn sm-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="sm-spin" size={16} /> Saving…</> : <><CheckCircle size={16} /> Save Site</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Drawer */}
      {viewDrawerOpen && selectedSite && (
        <div className="sm-overlay" onClick={() => setViewDrawerOpen(false)}>
          <div className="sm-drawer sm-drawer--view" onClick={e => e.stopPropagation()}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title"><Eye size={20} /> Site Details</div>
              <button className="sm-drawer__close" onClick={() => setViewDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-view-hero">
                <div className="sm-view-icon"><Building2 size={32} /></div>
                <div>
                  <div className="sm-view-name">{selectedSite.name}</div>
                  <div className="sm-view-loc"><MapPin size={13} /> {selectedSite.area}{selectedSite.city_state ? `, ${selectedSite.city_state}` : ""}</div>
                  {statusBadge(selectedSite.status)}
                </div>
              </div>

              <div className="sm-view-grid">
                <div className="sm-view-item"><span className="sm-view-label">Contact Person</span><span>{selectedSite.contact_name}</span></div>
                <div className="sm-view-item"><span className="sm-view-label">Mobile</span><a href={`tel:${selectedSite.mobile_no}`}>{selectedSite.mobile_no}</a></div>
                {selectedSite.email && <div className="sm-view-item"><span className="sm-view-label">Email</span><span>{selectedSite.email}</span></div>}
                {selectedSite.address && <div className="sm-view-item sm-view-item--full"><span className="sm-view-label">Address</span><span>{selectedSite.address}</span></div>}
                <div className="sm-view-item"><span className="sm-view-label">Revenue Share</span><span className="sm-view-highlight">{selectedSite.revenue_share_pct}%</span></div>
                <div className="sm-view-item"><span className="sm-view-label">Commission Bearer</span>{bearerBadge(selectedSite.commission_bearer)}</div>
                <div className="sm-view-item"><span className="sm-view-label">Branch</span><span>{selectedSite.branch?.name || "—"}</span></div>
                <div className="sm-view-item"><span className="sm-view-label">Department</span><span>{selectedSite.department?.name || "—"}</span></div>
                <div className="sm-view-item"><span className="sm-view-label">Reporting Manager</span><span>{selectedSite.reportingManager?.name || "—"}</span></div>
                <div className="sm-view-item"><span className="sm-view-label">Employees on Site</span><span>{selectedSite._count?.siteEmployees || 0}</span></div>
                {selectedSite.agreement_start && <div className="sm-view-item"><span className="sm-view-label">Agreement Start</span><span>{new Date(selectedSite.agreement_start).toLocaleDateString()}</span></div>}
                {selectedSite.agreement_end && <div className="sm-view-item"><span className="sm-view-label">Agreement End</span><span>{new Date(selectedSite.agreement_end).toLocaleDateString()}</span></div>}
                {selectedSite.document_url && <div className="sm-view-item sm-view-item--full"><span className="sm-view-label">Document</span><a href={selectedSite.document_url} target="_blank" rel="noreferrer">View Agreement ↗</a></div>}
              </div>
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => { setViewDrawerOpen(false); openEdit(selectedSite); }}>
                <Edit2 size={15} /> Edit
              </button>
              <button className="sm-btn sm-btn--ghost" onClick={() => setViewDrawerOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
