import { useState, useEffect, useCallback } from "react";
import {
  Clock, Plus, CheckCircle, Search, X, Loader2, Calendar,
  AlertTriangle, ChevronLeft, ChevronRight, Save
} from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface Site { id: number; name: string; }
interface Attendance {
  id: number; site_employee_id: number; date: string;
  punch_in?: string; punch_out?: string; working_hours: number;
  status: string; remark?: string;
  siteEmployee?: { user?: { name: string }; site?: { name: string } };
}
interface SiteEmp {
  id: number;
  user?: { name: string };
  site?: { name: string };
}

const STATUS_OPTS = ["Present", "Absent", "Late", "Half Day", "Missing Punch"];

export default function SiteWiseAttendance() {
  const [sites, setSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<SiteEmp[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filterSite, setFilterSite] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Mark modal state
  const [markModal, setMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState({
    site_employee_id: "", date: new Date().toISOString().split("T")[0],
    punch_in: "", punch_out: "", status: "Present", remark: ""
  });

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch(`${API}/sites`);
      if (res.ok) setSites(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchEmployees = useCallback(async (siteId: string) => {
    if (!siteId) { setEmployees([]); return; }
    try {
      const res = await fetch(`${API}/employees?site_id=${siteId}`);
      if (res.ok) setEmployees(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!filterDate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: filterDate, end_date: filterDate });
      if (filterSite) params.append("site_id", filterSite);
      const res = await fetch(`${API}/attendance?${params}`);
      if (res.ok) setAttendance(await res.json());
    } catch { toast.error("Failed to load attendance"); }
    finally { setLoading(false); }
  }, [filterSite, filterDate]);

  useEffect(() => { fetchSites(); }, [fetchSites]);
  useEffect(() => { fetchEmployees(filterSite); }, [filterSite, fetchEmployees]);
  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const handleMark = async () => {
    if (!markForm.site_employee_id || !markForm.date) return toast.error("Select employee and date");
    setSaving(true);
    try {
      const res = await fetch(`${API}/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(markForm)
      });
      const d = await res.json();
      if (!res.ok) return toast.error(d.message || "Mark failed");
      toast.success("Attendance saved!");
      setMarkModal(false);
      setMarkForm({ site_employee_id: "", date: filterDate, punch_in: "", punch_out: "", status: "Present", remark: "" });
      fetchAttendance();
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const calcHours = (pIn: string, pOut: string) => {
    if (!pIn || !pOut) return "—";
    const diff = (new Date(pOut).getTime() - new Date(pIn).getTime()) / (1000 * 60 * 60);
    return diff > 0 ? `${diff.toFixed(2)}h` : "—";
  };

  const statusColor: Record<string, string> = {
    Present: "#10b981", Absent: "#ef4444", Late: "#f59e0b",
    "Half Day": "#8b5cf6", "Missing Punch": "#f97316"
  };

  const filtered = attendance.filter(a =>
    !search || a.siteEmployee?.user?.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><Clock size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Wise Attendance</h1>
            <p className="sm-header__sub">Mark and manage attendance for site employees</p>
          </div>
        </div>
        <button className="sm-btn sm-btn--primary" onClick={() => {
          setMarkForm(f => ({ ...f, date: filterDate }));
          setMarkModal(true);
        }}>
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      {/* Filters */}
      <div className="sm-controls">
        <div className="sm-controls__left">
          <select className="sm-select" value={filterSite} onChange={e => setFilterSite(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={15} style={{ color: "var(--sm-text-muted)" }} />
            <input type="date" className="sm-select" value={filterDate}
              onChange={e => setFilterDate(e.target.value)} style={{ minWidth: 160 }} />
          </div>
        </div>
        <div className="sm-search-wrap">
          <Search size={16} className="sm-search-icon" />
          <input className="sm-search" placeholder="Search employee..." value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && <button className="sm-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
      </div>

      {/* Summary Chips */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {STATUS_OPTS.map(s => {
          const count = attendance.filter(a => a.status === s).length;
          return count > 0 ? (
            <span key={s} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: `${statusColor[s]}20`, color: statusColor[s],
              border: `1px solid ${statusColor[s]}40`
            }}>
              {s}: {count}
            </span>
          ) : null;
        })}
      </div>

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Loading…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>#</th><th>Employee</th><th>Site</th><th>Date</th>
                <th>Punch In</th><th>Punch Out</th><th>Working Hours</th>
                <th>Status</th><th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className="sm-empty">No records for this date & site</td></tr>
              ) : paged.map((rec, i) => (
                <tr key={rec.id}>
                  <td className="sm-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td className="sm-site-name">{rec.siteEmployee?.user?.name || "—"}</td>
                  <td style={{ color: "#c7d2fe" }}>{rec.siteEmployee?.site?.name || "—"}</td>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.punch_in ? new Date(rec.punch_in).toLocaleTimeString() : <span style={{ color: "#f97316" }}>—</span>}</td>
                  <td>{rec.punch_out ? new Date(rec.punch_out).toLocaleTimeString() : (
                    rec.punch_in ? <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle size={12} /> Missing
                    </span> : "—"
                  )}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>
                    {rec.working_hours > 0 ? `${rec.working_hours}h` : "—"}
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: `${statusColor[rec.status] || "#6366f1"}20`,
                      color: statusColor[rec.status] || "#6366f1"
                    }}>{rec.status}</span>
                  </td>
                  <td style={{ color: "var(--sm-text-muted)", fontSize: 12 }}>{rec.remark || "—"}</td>
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

      {/* Mark Modal */}
      {markModal && (
        <div className="sm-overlay" onClick={() => setMarkModal(false)}>
          <div className="sm-drawer" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title"><Clock size={20} /> Mark Attendance</div>
              <button className="sm-drawer__close" onClick={() => setMarkModal(false)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-field">
                <label>Site</label>
                <select value={filterSite} onChange={e => { setFilterSite(e.target.value); fetchEmployees(e.target.value); }}>
                  <option value="">Select Site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Employee <span className="sm-req">*</span></label>
                <select value={markForm.site_employee_id} onChange={e => setMarkForm(p => ({ ...p, site_employee_id: e.target.value }))}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Date <span className="sm-req">*</span></label>
                <input type="date" value={markForm.date} onChange={e => setMarkForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="sm-grid-2" style={{ marginTop: 14 }}>
                <div className="sm-field">
                  <label>Punch In</label>
                  <input type="datetime-local" value={markForm.punch_in} onChange={e => setMarkForm(p => ({ ...p, punch_in: e.target.value }))} />
                </div>
                <div className="sm-field">
                  <label>Punch Out</label>
                  <input type="datetime-local" value={markForm.punch_out} onChange={e => setMarkForm(p => ({ ...p, punch_out: e.target.value }))} />
                </div>
              </div>
              {markForm.punch_in && markForm.punch_out && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(16,185,129,0.1)", borderRadius: 8, fontSize: 13, color: "#10b981" }}>
                  ✓ Auto-calculated hours: {calcHours(markForm.punch_in, markForm.punch_out)}
                </div>
              )}
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Status</label>
                <select value={markForm.status} onChange={e => setMarkForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm-field" style={{ marginTop: 14 }}>
                <label>Remark</label>
                <textarea rows={2} value={markForm.remark} onChange={e => setMarkForm(p => ({ ...p, remark: e.target.value }))} placeholder="Optional note..." />
              </div>
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => setMarkModal(false)}>Cancel</button>
              <button className="sm-btn sm-btn--primary" onClick={handleMark} disabled={saving}>
                {saving ? <Loader2 className="sm-spin" size={16} /> : <Save size={16} />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
