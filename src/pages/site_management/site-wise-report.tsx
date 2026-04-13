import { useState, useCallback } from "react";
import { BarChart2, Loader2, Search, Download, Users, Clock, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface SiteReport {
  site_name: string; totalEmployees: number;
  present: number; absent: number;
  attendancePercent: string; totalHours: string;
}

export default function SiteWiseReport() {
  const [reports, setReports] = useState<SiteReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [siteId, setSiteId] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (siteId) params.append("site_id", siteId);
      const res = await fetch(`${API}/reports/performance?${params}`);
      if (res.ok) setReports(await res.json());
      else toast.error("Failed to generate report");
    } catch { toast.error("Server error"); }
    finally { setLoading(false); }
  }, [startDate, endDate, siteId]);

  const handleExport = () => {
    const headers = ["Sr", "Site", "Total Employees", "Present", "Absent", "Attendance %", "Total Hours"];
    const rows = reports.map((r, i) => [i + 1, r.site_name, r.totalEmployees, r.present, r.absent, `${r.attendancePercent}%`, `${r.totalHours}h`]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = "site-wise-report.csv"; a.click();
  };

  const totalPresent = reports.reduce((a, r) => a + r.present, 0);
  const totalAbsent = reports.reduce((a, r) => a + r.absent, 0);
  const totalHours = reports.reduce((a, r) => a + Number(r.totalHours), 0);

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><BarChart2 size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Wise Report</h1>
            <p className="sm-header__sub">Overall attendance performance per site</p>
          </div>
        </div>
        {reports.length > 0 && (
          <button className="sm-btn sm-btn--secondary" onClick={handleExport}><Download size={16} /> Export CSV</button>
        )}
      </div>

      {/* Filter Panel */}
      <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: "var(--sm-radius)", padding: "18px 20px", marginBottom: 18, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="sm-field" style={{ minWidth: 150 }}><label>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="sm-field" style={{ minWidth: 150 }}><label>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        <button className="sm-btn sm-btn--primary" onClick={fetchReport} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <BarChart2 size={16} />} Generate Report
        </button>
      </div>

      {reports.length > 0 && (
        <div className="sm-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
          <div className="sm-stat" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
            <span className="sm-stat__val" style={{ color: "#10b981" }}>{totalPresent}</span>
            <span className="sm-stat__label">Total Present</span>
          </div>
          <div className="sm-stat" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
            <span className="sm-stat__val" style={{ color: "#ef4444" }}>{totalAbsent}</span>
            <span className="sm-stat__label">Total Absent</span>
          </div>
          <div className="sm-stat">
            <span className="sm-stat__val">{totalHours.toFixed(1)}h</span>
            <span className="sm-stat__label">Total Hours</span>
          </div>
        </div>
      )}

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Generating report…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th>#</th><th>Site</th><th>Total Employees</th>
                <th>Present</th><th>Absent</th><th>Attendance %</th><th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr><td colSpan={7} className="sm-empty">Click 'Generate Report' to see data</td></tr>
              ) : reports.map((r, i) => (
                <tr key={i}>
                  <td className="sm-td-sr">{i + 1}</td>
                  <td className="sm-site-name">{r.site_name}</td>
                  <td><span className="sm-emp-count"><Users size={13} /> {r.totalEmployees}</span></td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{r.present}</td>
                  <td style={{ color: "#ef4444", fontWeight: 600 }}>{r.absent}</td>
                  <td>
                    <div className="sm-rev-bar">
                      <div style={{ width: 60, height: 6, background: "rgba(99,102,241,0.15)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${r.attendancePercent}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: 4 }} />
                      </div>
                      <span style={{ color: "#a5b4fc" }}>{r.attendancePercent}%</span>
                    </div>
                  </td>
                  <td style={{ color: "#fcd34d", fontWeight: 600 }}><Clock size={12} style={{ marginRight: 4 }} />{r.totalHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
