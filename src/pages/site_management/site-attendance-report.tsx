import { useState, useCallback } from "react";
import { FileText, Search, X, Loader2, Download, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface AttRecord {
  id: number; date: string; punch_in?: string; punch_out?: string;
  working_hours: number; overtime_hours: number; late_minutes: number;
  status: string; remark?: string;
  siteEmployee?: { user?: { name: string }; site?: { name: string } };
}

const STATUS_COLOR: Record<string, string> = {
  Present: "#10b981", Absent: "#ef4444", Late: "#f59e0b",
  "Half Day": "#8b5cf6", "Missing Punch": "#f97316"
};

export default function SiteAttendanceReport() {
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 25;

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (siteId) params.append("site_id", siteId);
      if (employeeId) params.append("employee_id", employeeId);
      const res = await fetch(`${API}/attendance?${params}`);
      if (res.ok) setRecords(await res.json());
      else toast.error("Failed to fetch report");
    } catch { toast.error("Server error"); }
    finally { setLoading(false); }
  }, [siteId, employeeId, startDate, endDate]);

  const handleCopy = () => {
    const text = filtered.map(r =>
      `${r.siteEmployee?.user?.name} | ${new Date(r.date).toLocaleDateString()} | ${r.status} | ${r.working_hours}h`
    ).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard!")).catch(() => toast.error("Copy failed"));
  };

  const handleExport = () => {
    const headers = ["#", "Employee", "Site", "Date", "In", "Out", "Hours", "Overtime", "Status", "Late(min)", "Remark"];
    const rows = filtered.map((r, i) => [
      i + 1, r.siteEmployee?.user?.name || "", r.siteEmployee?.site?.name || "",
      new Date(r.date).toLocaleDateString(),
      r.punch_in ? new Date(r.punch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      r.punch_out ? new Date(r.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      r.working_hours, r.overtime_hours, r.status, r.late_minutes, r.remark || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = `site-attendance-report-${startDate}.csv`; a.click();
  };

  const filtered = records.filter(r =>
    !search || r.siteEmployee?.user?.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalHours = filtered.reduce((a, r) => a + r.working_hours, 0);
  const totalOvertimeHrs = filtered.reduce((a, r) => a + r.overtime_hours, 0);

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><FileText size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Attendance Report</h1>
            <p className="sm-header__sub">Detailed attendance analysis for payroll &amp; HR insights</p>
          </div>
        </div>
        {records.length > 0 && (
          <div className="sm-header__actions">
            <button className="sm-btn sm-btn--secondary" onClick={handleCopy}>📋 Copy</button>
            <button className="sm-btn sm-btn--secondary" onClick={handleExport}><Download size={16} /> Export CSV</button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: "var(--sm-radius)", padding: "18px 20px", marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="sm-field" style={{ minWidth: 150 }}><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="sm-field" style={{ minWidth: 150 }}><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        <button className="sm-btn sm-btn--primary" onClick={fetchReport} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <Search size={16} />} Get Report
        </button>
      </div>

      {/* Summary totals */}
      {records.length > 0 && (
        <div className="sm-stats" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
          <div className="sm-stat"><span className="sm-stat__val">{records.length}</span><span className="sm-stat__label">Total Records</span></div>
          <div className="sm-stat"><span className="sm-stat__val" style={{ color: "#10b981" }}>{records.filter(r => r.status === "Present").length}</span><span className="sm-stat__label">Present</span></div>
          <div className="sm-stat"><span className="sm-stat__val" style={{ color: "#fcd34d" }}>{totalHours.toFixed(1)}h</span><span className="sm-stat__label">Total Hours</span></div>
          <div className="sm-stat"><span className="sm-stat__val" style={{ color: "#a78bfa" }}>{totalOvertimeHrs.toFixed(1)}h</span><span className="sm-stat__label">Overtime Hours</span></div>
        </div>
      )}

      <div className="sm-controls">
        <span style={{ fontSize: 13, color: "var(--sm-text-muted)" }}>{filtered.length} records</span>
        <div className="sm-search-wrap">
          <Search size={16} className="sm-search-icon" />
          <input className="sm-search" placeholder="Filter by employee..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button className="sm-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
      </div>

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Generating…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>#</th><th>Employee</th><th>Site</th><th>Date</th>
                <th>In</th><th>Out</th><th>Hours</th>
                <th>Status</th><th>Overtime</th><th>Late</th><th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={11} className="sm-empty">
                  {records.length === 0 ? "Set filters and click 'Get Report'" : "No matching records"}
                </td></tr>
              ) : paged.map((rec, i) => (
                <tr key={rec.id}>
                  <td className="sm-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td className="sm-site-name">{rec.siteEmployee?.user?.name || "—"}</td>
                  <td style={{ color: "#c7d2fe" }}>{rec.siteEmployee?.site?.name || "—"}</td>
                  <td style={{ color: "var(--sm-text-muted)" }}>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.punch_in ? new Date(rec.punch_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td>{rec.punch_out ? new Date(rec.punch_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (
                    rec.punch_in ? <span style={{ color: "#f97316", display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle size={11} />Miss
                    </span> : "—"
                  )}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{rec.working_hours > 0 ? `${rec.working_hours}h` : "—"}</td>
                  <td>
                    <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: `${STATUS_COLOR[rec.status] || "#6366f1"}20`, color: STATUS_COLOR[rec.status] || "#6366f1" }}>{rec.status}</span>
                  </td>
                  <td style={{ color: "#a78bfa", fontWeight: 600 }}>{rec.overtime_hours > 0 ? `${rec.overtime_hours}h` : "—"}</td>
                  <td style={{ color: rec.late_minutes > 0 ? "#f59e0b" : "var(--sm-text-muted)" }}>{rec.late_minutes > 0 ? `${rec.late_minutes}m` : "—"}</td>
                  <td style={{ color: "var(--sm-text-muted)", fontSize: 11 }}>{rec.remark || "—"}</td>
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
    </div>
  );
}
