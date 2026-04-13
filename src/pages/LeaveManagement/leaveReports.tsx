import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveReports.css";
import { BarChart2, Download, AlertCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

export default function LeaveReports() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [tab, setTab] = useState<"summary" | "dept" | "lop" | "trends">("summary");

    useEffect(() => {
        setLoading(true);
        axios.get(`${API}/reports?year=${year}`).then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [year]);

    const exportCSV = () => {
        if (!data) return;
        const rows: string[][] = [];
        if (tab === "summary") {
            rows.push(["Employee", "EmpID", "Dept", ...data.types.map((t: any) => t.name), "Total Used"]);
            const empMap: any = {};
            data.balances.forEach((b: any) => {
                if (!empMap[b.employeeId]) empMap[b.employeeId] = { emp: b.employee, balances: {} };
                empMap[b.employeeId].balances[b.leaveTypeId] = b;
            });
            Object.values(empMap).forEach((g: any) => {
                const row = [`${g.emp?.firstName} ${g.emp?.lastName}`, g.emp?.employeeId || "", g.emp?.department || ""];
                let total = 0;
                data.types.forEach((t: any) => {
                    const b = g.balances[t.id];
                    row.push(b ? String(b.used) : "0");
                    if (b) total += b.used;
                });
                row.push(String(total));
                rows.push(row);
            });
        }
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `leave_report_${tab}_${year}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // Build summary
    const buildSummary = () => {
        if (!data) return [];
        const empMap: any = {};
        data.balances.forEach((b: any) => {
            if (!empMap[b.employeeId]) empMap[b.employeeId] = { emp: b.employee, balances: {} };
            empMap[b.employeeId].balances[b.leaveTypeId] = b;
        });
        return Object.values(empMap);
    };

    const buildDept = () => {
        if (!data) return [];
        const deptMap: any = {};
        data.balances.forEach((b: any) => {
            const dept = b.employee?.department || "Unknown";
            if (!deptMap[dept]) deptMap[dept] = { dept, total: 0, used: 0, pending: 0, count: new Set() };
            deptMap[dept].total += b.total;
            deptMap[dept].used += b.used;
            deptMap[dept].pending += b.pending;
            deptMap[dept].count.add(b.employeeId);
        });
        return Object.values(deptMap).map((d: any) => ({ ...d, count: d.count.size }));
    };

    const buildLOP = () => {
        if (!data) return [];
        const lopType = data.types.find((t: any) => t.name?.toLowerCase().includes("loss") || t.leaveCode?.toLowerCase() === "lop");
        if (!lopType) return [];
        return data.requests.filter((r: any) => r.leaveTypeId === lopType.id && r.status === "Approved");
    };

    const buildTrends = () => {
        if (!data) return [];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trends = months.map(m => ({ month: m, days: 0 }));
        
        data.requests.forEach((r: any) => {
            if (r.status === "Approved" && r.startDate) {
                const start = new Date(r.startDate);
                if (start.getFullYear() === year) {
                    trends[start.getMonth()].days += parseFloat(r.days) || 0;
                }
            }
        });
        
        const maxDays = Math.max(...trends.map(t => t.days));
        return { trends, maxDays: maxDays > 0 ? maxDays : 1 }; // Prevent division by zero
    };

    const summary = buildSummary();
    const deptData = buildDept();
    const lopData = buildLOP();
    const trendsResult = buildTrends();
    const trendData = Array.isArray(trendsResult) ? [] : trendsResult.trends;
    const trendMax = Array.isArray(trendsResult) ? 1 : trendsResult.maxDays;

    return (
        <div className="lm-container lm-fade lrep-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><BarChart2 size={22} /> Leave Reports</h2>
                    <p className="lm-page-subtitle">Comprehensive leave analytics and summaries for {year}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <select className="lm-select" style={{ width: 110 }} value={year} onChange={e => setYear(parseInt(e.target.value))}>
                        {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="lm-btn-secondary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
                </div>
            </div>

            {data && (
                <div className="lm-stats-row">
                    <div className="lm-stat-card"><div className="lm-stat-label">Total Requests</div><div className="lm-stat-value">{data.requests.length}</div></div>
                    <div className="lm-stat-card green"><div className="lm-stat-label">Approved</div><div className="lm-stat-value">{data.requests.filter((r: any) => r.status === "Approved").length}</div></div>
                    <div className="lm-stat-card orange"><div className="lm-stat-label">Pending</div><div className="lm-stat-value">{data.requests.filter((r: any) => r.status === "Pending").length}</div></div>
                    <div className="lm-stat-card red"><div className="lm-stat-label">Rejected</div><div className="lm-stat-value">{data.requests.filter((r: any) => r.status === "Rejected").length}</div></div>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {(["summary", "dept", "lop", "trends"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        style={{
                            padding: "0.45rem 1.1rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                            background: tab === t ? "#6366f1" : "white", color: tab === t ? "white" : "#374151",
                            border: tab === t ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0"
                        }}>
                        {t === "summary" ? "Employee Summary" : t === "dept" ? "Department Report" : t === "lop" ? "LOP Report" : "Leave Trends"}
                    </button>
                ))}
            </div>

            {loading ? <div className="lm-loading">Loading report data...</div> : (
                <div className="lm-card">
                    {tab === "summary" && (
                        <div className="lm-table-wrap">
                            <table className="lm-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        {data?.types.map((t: any) => <th key={t.id}>{t.leaveCode || t.name}</th>)}
                                        <th>Total Used</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.length === 0
                                        ? <tr><td colSpan={99} className="lm-empty">No data for {year}.</td></tr>
                                        : summary.map((g: any, i: number) => {
                                            let total = 0;
                                            return (
                                                <tr key={i}>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{g.emp?.firstName} {g.emp?.lastName}</div>
                                                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{g.emp?.department}</div>
                                                    </td>
                                                    {data.types.map((t: any) => {
                                                        const b = g.balances[t.id];
                                                        if (b) total += b.used;
                                                        return <td key={t.id}>{b ? <><strong>{b.used}</strong><span style={{ color: "#94a3b8" }}>/{b.total}</span></> : "—"}</td>;
                                                    })}
                                                    <td><span className="lm-badge lm-badge-purple">{total}</span></td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === "dept" && (
                        <div className="lm-table-wrap">
                            <table className="lm-table">
                                <thead><tr><th>Department</th><th>Employees</th><th>Total Allotted</th><th>Total Used</th><th>Utilization</th></tr></thead>
                                <tbody>
                                    {deptData.length === 0
                                        ? <tr><td colSpan={5} className="lm-empty">No data.</td></tr>
                                        : deptData.map((d: any, i: number) => {
                                            const pct = d.total > 0 ? Math.round((d.used / d.total) * 100) : 0;
                                            return (
                                                <tr key={i}>
                                                    <td><strong>{d.dept}</strong></td>
                                                    <td>{d.count}</td>
                                                    <td>{d.total}</td>
                                                    <td>{d.used}</td>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <div className="lm-balance-bar-wrap" style={{ width: 80 }}>
                                                                <div className="lm-balance-bar" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span style={{ fontSize: "0.78rem" }}>{pct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === "lop" && (
                        <>
                            {lopData.length === 0
                                ? <div className="lm-empty">
                                    <AlertCircle size={32} style={{ marginBottom: "0.5rem", color: "#94a3b8" }} />
                                    <div>No Loss of Pay (LOP) records for {year}.</div>
                                    <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>Ensure a leave type named "Loss of Pay" or with code "LOP" is created.</div>
                                </div>
                                : <div className="lm-table-wrap">
                                    <table className="lm-table">
                                        <thead><tr><th>Employee</th><th>From</th><th>To</th><th>LOP Days</th><th>Salary Deduction*</th></tr></thead>
                                        <tbody>
                                            {lopData.map((r: any) => (
                                                <tr key={r.id}>
                                                    <td><strong>{r.employee?.firstName} {r.employee?.lastName}</strong><br /><span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{r.employee?.department}</span></td>
                                                    <td>{r.startDate?.split("T")[0]}</td>
                                                    <td>{r.endDate?.split("T")[0]}</td>
                                                    <td><span className="lm-badge lm-badge-red">{r.days} days</span></td>
                                                    <td style={{ color: "#ef4444", fontWeight: 600 }}>Monthly Salary ÷ 30 × {r.days}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>* Formula: Daily Salary = Monthly Salary / 30 · Deduction = Daily Salary × LOP Days</div>
                                </div>}
                        </>
                    )}

                    {tab === "trends" && (
                        <div style={{ padding: "1.5rem" }}>
                            <h3 style={{ color: "#1e293b", marginBottom: "1.5rem", fontSize: "1.1rem" }}>Monthly Leave Distribution ({year})</h3>
                            <div style={{ display: "flex", alignItems: "flex-end", height: "250px", gap: "10px", marginTop: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
                                {trendData.map((t: any, i: number) => {
                                    const heightPct = (t.days / trendMax) * 100;
                                    return (
                                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                                            <div style={{ 
                                                width: "100%", 
                                                maxWidth: "40px", 
                                                height: `${heightPct}%`, 
                                                minHeight: t.days > 0 ? "4px" : "0",
                                                background: "linear-gradient(to top, #6366f1, #818cf8)", 
                                                borderRadius: "4px 4px 0 0",
                                                position: "relative",
                                                transition: "height 0.3s ease"
                                            }}>
                                                {t.days > 0 && <span style={{ position: "absolute", top: "-22px", left: "50%", transform: "translateX(-50%)", fontSize: "0.75rem", fontWeight: 600, color: "#4f46e5" }}>{t.days}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                                {trendData.map((t: any, i: number) => (
                                    <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                                        {t.month}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
