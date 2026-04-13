import { useState, useCallback } from "react";
import { CalendarDays, Loader2, Download } from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface Summary {
  site_name: string; total_days: number; present_days: number;
  absent_days: number; leave_days: number; overtime_hours: number;
}

export default function SiteAttendanceSummary() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [siteId, setSiteId] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month, year });
      if (siteId) params.append("site_id", siteId);
      const res = await fetch(`${API}/reports/summary?${params}`);
      if (res.ok) setSummary(await res.json());
      else toast.error("Failed to fetch summary");
    } catch { toast.error("Server error"); }
    finally { setLoading(false); }
  }, [month, year, siteId]);

  const handleExport = () => {
    const headers = ["#", "Site", "Total Days", "Present", "Absent", "Leave", "Overtime(hrs)"];
    const rows = summary.map((s, i) => [i + 1, s.site_name, s.total_days, s.present_days, s.absent_days, s.leave_days, s.overtime_hours.toFixed(2)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = `site-attendance-summary-${year}-${month}.csv`; a.click();
  };

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><CalendarDays size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Attendance Summary</h1>
            <p className="sm-header__sub">Monthly attendance rollup per site</p>
          </div>
        </div>
        {summary.length > 0 && (
          <button className="sm-btn sm-btn--secondary" onClick={handleExport}><Download size={16} /> Export</button>
        )}
      </div>

      <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: "var(--sm-radius)", padding: "18px 20px", marginBottom: 18, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="sm-field" style={{ minWidth: 150 }}>
          <label>Month</label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="sm-field" style={{ minWidth: 100 }}>
          <label>Year</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} min="2020" max="2030" />
        </div>
        <button className="sm-btn sm-btn--primary" onClick={fetchSummary} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <CalendarDays size={16} />} Get Summary
        </button>
      </div>

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Loading summary…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr><th>#</th><th>Site</th><th>Total Days</th><th>Present Days</th><th>Absent Days</th><th>Leave Days</th><th>Overtime Hours</th></tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan={7} className="sm-empty">Select month & year, click Get Summary</td></tr>
              ) : summary.map((s, i) => (
                <tr key={i}>
                  <td className="sm-td-sr">{i + 1}</td>
                  <td className="sm-site-name">{s.site_name}</td>
                  <td style={{ color: "var(--sm-text-muted)" }}>{s.total_days}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{s.present_days}</td>
                  <td style={{ color: "#ef4444", fontWeight: 600 }}>{s.absent_days}</td>
                  <td style={{ color: "#f59e0b" }}>{s.leave_days}</td>
                  <td style={{ color: "#a78bfa", fontWeight: 600 }}>{s.overtime_hours.toFixed(2)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
