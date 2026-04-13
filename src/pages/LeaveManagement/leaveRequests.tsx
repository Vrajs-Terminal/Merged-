import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveRequests.css";
import { ClipboardList, Search, Filter } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

const STATUS_COLORS: any = { Pending: "lm-badge-orange", Approved: "lm-badge-green", Rejected: "lm-badge-red", Cancelled: "lm-badge-gray" };

export default function LeaveRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const load = () => {
        setLoading(true);
        axios.get(`${API}/requests?status=${statusFilter}`).then(r => setRequests(r.data)).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [statusFilter]);

    const filtered = requests.filter(r => {
        const name = `${r.employee?.firstName} ${r.employee?.lastName}`.toLowerCase();
        return name.includes(search.toLowerCase()) || r.employee?.employeeId?.toLowerCase().includes(search.toLowerCase());
    });

    const handleCancel = async (id: number) => {
        if (!window.confirm("Cancel this leave request?")) return;
        try { await axios.put(`${API}/requests/${id}/cancel`); load(); } catch { }
    };

    return (
        <div className="lm-container lm-fade lreq-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><ClipboardList size={22} /> Leave Requests</h2>
                    <p className="lm-page-subtitle">All employee leave requests with status tracking</p>
                </div>
            </div>

            <div className="lm-stats-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {["Pending", "Approved", "Rejected", "Cancelled"].map((s, i) => {
                    const count = requests.filter(r => r.status === s).length;
                    const cls = ["", "green", "red", ""][i];
                    return (
                        <div key={s} className={`lm-stat-card ${cls}`} style={{ cursor: "pointer" }} onClick={() => setStatusFilter(s)}>
                            <div className="lm-stat-label">{s}</div>
                            <div className="lm-stat-value">{count}</div>
                        </div>
                    );
                })}
            </div>

            <div className="lm-filter-row">
                <div className="lm-search-bar">
                    <Search size={15} color="#94a3b8" />
                    <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <Filter size={15} color="#64748b" />
                    {["All", "Pending", "Approved", "Rejected", "Cancelled"].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            style={{
                                padding: "0.35rem 0.75rem", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                                background: statusFilter === s ? "#6366f1" : "white",
                                color: statusFilter === s ? "white" : "#64748b",
                                border: statusFilter === s ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0"
                            }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="lm-card">
                {loading ? <div className="lm-loading">Loading requests...</div> : (
                    <div className="lm-table-wrap">
                        <table className="lm-table">
                            <thead>
                                <tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied On</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0
                                    ? <tr><td colSpan={9} className="lm-empty">No requests found.</td></tr>
                                    : filtered.map(r => (
                                        <tr key={r.id}>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{r.employee?.employeeId}</div>
                                            </td>
                                            <td><span className="lm-badge lm-badge-purple">{r.leaveType?.name}</span></td>
                                            <td>{r.startDate?.split("T")[0]}</td>
                                            <td>{r.endDate?.split("T")[0]}</td>
                                            <td><strong>{r.days}</strong></td>
                                            <td style={{ maxWidth: 180, fontSize: "0.82rem", color: "#64748b" }}>{r.reason || "—"}</td>
                                            <td><span className={`lm-badge ${STATUS_COLORS[r.status] || "lm-badge-gray"}`}>{r.status}</span></td>
                                            <td style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.createdAt?.split("T")[0]}</td>
                                            <td>
                                                {r.status === "Pending" && (
                                                    <button className="lm-btn-danger" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }} onClick={() => handleCancel(r.id)}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
