import { useState, useEffect, useCallback } from "react";
import { Activity, Users, AlertTriangle, Clock, UserX, Loader2, RefreshCw, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface Counts { present: number; absent: number; late: number; missingPunch: number; }

export default function SiteAttendanceCounts() {
  const [counts, setCounts] = useState<Counts>({ present: 0, absent: 0, late: 0, missingPunch: 0 });
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    fetch(`${API}/sites`).then(r => r.json()).then(data => setSites(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date });
      if (siteId) params.append("site_id", siteId);
      const res = await fetch(`${API}/reports/counts?${params}`);
      if (res.ok) { setCounts(await res.json()); setLastFetched(new Date()); }
      else toast.error("Failed to fetch counts");
    } catch { toast.error("Server error"); }
    finally { setLoading(false); }
  }, [siteId, date]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const cards = [
    { label: "Present Today", value: counts.present, icon: Users, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
    { label: "Absent Today", value: counts.absent, icon: UserX, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
    { label: "Late Employees", value: counts.late, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    { label: "Missing Punch", value: counts.missingPunch, icon: AlertTriangle, color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.25)" },
  ];

  const total = counts.present + counts.absent;

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><Activity size={22} /></div>
          <div>
            <h1 className="sm-header__title">Site Attendance Counts</h1>
            <p className="sm-header__sub">Real-time daily snapshot of site workforce status</p>
          </div>
        </div>
        <button className="sm-btn sm-btn--secondary" onClick={fetchCounts} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: "var(--sm-radius)", padding: "16px 20px", marginBottom: 24, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="sm-field" style={{ minWidth: 180 }}>
          <label>Site</label>
          <select value={siteId} onChange={e => setSiteId(e.target.value)}>
            <option value="">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="sm-field" style={{ minWidth: 160 }}>
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button className="sm-btn sm-btn--primary" onClick={fetchCounts} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <Calendar size={16} />} Get Counts
        </button>
        {lastFetched && <span style={{ fontSize: 12, color: "var(--sm-text-dim)", alignSelf: "center" }}>Last updated: {lastFetched.toLocaleTimeString()}</span>}
      </div>

      {/* Count Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: card.bg, border: `1px solid ${card.border}`, borderRadius: 14,
            padding: "28px 24px", display: "flex", flexDirection: "column", gap: 8,
            transition: "transform 0.2s", cursor: "default"
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${card.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
              {loading && <Loader2 className="sm-spin" size={16} style={{ color: card.color }} />}
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: "var(--sm-text-muted)", fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Attendance Rate Visualization */}
      {total > 0 && (
        <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--sm-text)", marginBottom: 14 }}>Attendance Rate</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 12, background: "rgba(239,68,68,0.2)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(counts.present / total) * 100}%`,
                background: "linear-gradient(90deg,#10b981,#34d399)", borderRadius: 6, transition: "width 0.5s ease"
              }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#10b981", minWidth: 55 }}>
              {total > 0 ? Math.round((counts.present / total) * 100) : 0}%
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: "#10b981" }}>● Present: {counts.present}</span>
            <span style={{ fontSize: 12, color: "#ef4444" }}>● Absent: {counts.absent}</span>
            <span style={{ fontSize: 12, color: "#f59e0b" }}>● Late: {counts.late}</span>
          </div>
        </div>
      )}
    </div>
  );
}
