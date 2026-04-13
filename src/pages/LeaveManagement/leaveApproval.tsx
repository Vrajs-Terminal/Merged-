import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveApproval.css";
import { CheckSquare, CheckCircle, X, AlertCircle, Clock, Banknote, Calendar } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

export default function LeaveApproval() {
    const [tab, setTab] = useState("regular"); // "regular" | "short" | "payouts"
    const [pending, setPending] = useState<any[]>([]);
    const [shortLeaves, setShortLeaves] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState<any>({});
    const [processing, setProcessing] = useState<number | null>(null);
    const [msg, setMsg] = useState<any>(null);

    const load = () => {
        setLoading(true);
        Promise.all([
            axios.get(`${API}/requests?status=Pending`),
            axios.get(`${API}/short`),
            axios.get(`${API}/payouts`)
        ]).then(([r, s, p]) => {
            setPending(r.data);
            setShortLeaves(s.data.filter((x: any) => x.status === "Pending"));
            setPayouts(p.data.filter((x: any) => x.status === "Pending"));
        }).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const review = async (id: number, status: string, type: "regular" | "short" | "payout") => {
        setProcessing(id); setMsg(null);
        try {
            const endpoint = type === "regular" ? "requests" : type === "short" ? "short" : "payouts";
            await axios.put(`${API}/${endpoint}/${id}/review`, { status, remarks: remarks[id] || "" });
            setMsg({ type: "success", text: `${type === 'regular' ? 'Request' : type === 'short' ? 'Short Leave' : 'Payout'} ${status.toLowerCase()} successfully!` });
            load();
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to process." });
        } finally { setProcessing(null); }
    };

    return (
        <div className="lm-container lm-fade la-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><CheckSquare size={22} /> Leave & Workflow Approvals</h2>
                    <p className="lm-page-subtitle">Review pending requests for leaves, short leaves, and payouts.</p>
                </div>
                <div className="la-tab-switch">
                    <button className={`la-tab-button ${tab === "regular" ? "active" : ""}`} onClick={() => setTab("regular")}>
                        <Calendar size={14} /> Regular Leaves
                        {pending.length > 0 && <span className="la-tab-count">{pending.length}</span>}
                    </button>
                    <button className={`la-tab-button ${tab === "short" ? "active" : ""}`} onClick={() => setTab("short")}>
                        <Clock size={14} /> Short Leaves
                        {shortLeaves.length > 0 && <span className="la-tab-count">{shortLeaves.length}</span>}
                    </button>
                    <button className={`la-tab-button ${tab === "payouts" ? "active" : ""}`} onClick={() => setTab("payouts")}>
                        <Banknote size={14} /> Payouts
                        {payouts.length > 0 && <span className="la-tab-count">{payouts.length}</span>}
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"} mb-4`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            {loading ? <div className="lm-loading">Loading pending requests...</div> : (
                <>
                    {/* REGULAR LEAVES TAB */}
                    {tab === "regular" && (
                        <>
                            {pending.length === 0 ? (
                                <div className="lm-card la-empty-state">
                                    <div className="la-empty-icon-wrap">
                                        <CheckCircle size={48} className="la-empty-icon" />
                                    </div>
                                    <h3 className="la-empty-title">All caught up!</h3>
                                    <p className="la-empty-text">No pending regular leave requests.</p>
                                </div>
                            ) : pending.map(r => (
                                <div className="lm-card" key={r.id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>
                                                    {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                                                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.employee?.employeeId} · {r.employee?.department || "—"}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Leave Type</span><br /><span className="lm-badge lm-badge-purple" style={{ marginTop: 2 }}>{r.leaveType?.name}</span></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>From</span><br /><strong>{r.startDate?.split("T")[0]}</strong></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>To</span><br /><strong>{r.endDate?.split("T")[0]}</strong></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Days</span><br /><strong>{r.days}</strong></div>
                                            </div>
                                            {r.reason && <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#374151", background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>💬 {r.reason}</div>}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 200 }}>
                                            <textarea className="lm-textarea" placeholder="Remarks (optional)..." style={{ minHeight: 60, fontSize: "0.82rem" }} value={remarks[r.id] || ""} onChange={e => setRemarks((p: any) => ({ ...p, [r.id]: e.target.value }))} />
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="lm-btn-success flex-1 py-1.5" onClick={() => review(r.id, "Approved", "regular")} disabled={processing === r.id}>
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button className="lm-btn-danger flex-1 py-1.5" onClick={() => review(r.id, "Rejected", "regular")} disabled={processing === r.id}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* SHORT LEAVES TAB */}
                    {tab === "short" && (
                        <>
                            {shortLeaves.length === 0 ? (
                                <div className="lm-card la-empty-state">
                                    <div className="la-empty-icon-wrap">
                                        <CheckCircle size={48} className="la-empty-icon" />
                                    </div>
                                    <h3 className="la-empty-title">All caught up!</h3>
                                    <p className="la-empty-text">No pending short leave requests.</p>
                                </div>
                            ) : shortLeaves.map(r => (
                                <div className="lm-card" key={r.id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>
                                                    {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                                                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.employee?.employeeId} · {r.employee?.department || "—"}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Type</span><br /><span className="lm-badge lm-badge-orange" style={{ marginTop: 2 }}>Short Leave</span></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Date</span><br /><strong>{r.date?.split("T")[0]}</strong></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Time</span><br /><strong>{r.startTime} - {r.endTime}</strong></div>
                                            </div>
                                            {r.reason && <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#374151", background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>💬 {r.reason}</div>}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 200 }}>
                                            <textarea className="lm-textarea" placeholder="Remarks (optional)..." style={{ minHeight: 60, fontSize: "0.82rem" }} value={remarks[r.id] || ""} onChange={e => setRemarks((p: any) => ({ ...p, [r.id]: e.target.value }))} />
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="lm-btn-success flex-1 py-1.5" onClick={() => review(r.id, "Approved", "short")} disabled={processing === r.id}>
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button className="lm-btn-danger flex-1 py-1.5" onClick={() => review(r.id, "Rejected", "short")} disabled={processing === r.id}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* LEAVE PAYOUTS TAB */}
                    {tab === "payouts" && (
                        <>
                            {payouts.length === 0 ? (
                                <div className="lm-card la-empty-state">
                                    <div className="la-empty-icon-wrap">
                                        <CheckCircle size={48} className="la-empty-icon" />
                                    </div>
                                    <h3 className="la-empty-title">All caught up!</h3>
                                    <p className="la-empty-text">No pending leave payout requests.</p>
                                </div>
                            ) : payouts.map(r => (
                                <div className="lm-card" key={r.id}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem" }}>
                                                    {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: "#1e293b" }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                                                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{r.employee?.employeeId} · {r.employee?.department || "—"}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Type</span><br /><span className="lm-badge lm-badge-green" style={{ marginTop: 2 }}>Leave Payout</span></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Leave Component</span><br /><strong>{r.leaveType?.name}</strong></div>
                                                <div><span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>Encashment Days</span><br /><strong>{r.encashmentDays} days</strong></div>
                                            </div>
                                            {r.reason && <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#374151", background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>💬 {r.reason}</div>}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 200 }}>
                                            <textarea className="lm-textarea" placeholder="Remarks (optional)..." style={{ minHeight: 60, fontSize: "0.82rem" }} value={remarks[r.id] || ""} onChange={e => setRemarks((p: any) => ({ ...p, [r.id]: e.target.value }))} />
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="lm-btn-success flex-1 py-1.5" onClick={() => review(r.id, "Approved", "payout")} disabled={processing === r.id}>
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button className="lm-btn-danger flex-1 py-1.5" onClick={() => review(r.id, "Rejected", "payout")} disabled={processing === r.id}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
